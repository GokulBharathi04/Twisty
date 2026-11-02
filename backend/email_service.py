import os
import re
import ssl
import asyncio
import smtplib
import ipaddress
import logging
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)

# Transport is picked from the environment, first match wins:
#   1. SMTP_HOST + SMTP_PASSWORD  -> the company mailbox's own SMTP server (GoDaddy: smtpout.secureserver.net:465)
#   2. EMERGENT_EMAIL_KEY         -> Emergent's email integration (the original hosted setup)
#   3. neither                    -> local outbox: each email is saved as an .eml file in backend/outbox
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Twisty Wrap Enterprises")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT") or 465)
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "").strip() or SMTP_USER
OUTBOX = Path(__file__).parent / "outbox"


def transport() -> str:
    if SMTP_HOST and SMTP_PASSWORD:
        return "smtp"
    return "emergent" if EMAIL_KEY else "outbox"

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


def _mime(to: str, subject: str, html: str, reply_to: str | None) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = formataddr((EMAIL_FROM_NAME, EMAIL_FROM or to))
    msg["To"] = to
    msg["Subject"] = subject
    msg["Message-ID"] = make_msgid(domain=(EMAIL_FROM or to).split("@")[-1])
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content("A new enquiry arrived from the website. Open this email in an HTML-capable client to read it.")
    msg.add_alternative(html, subtype="html")
    return msg


def _smtp_send(msg: EmailMessage) -> None:
    ctx = ssl.create_default_context()
    if SMTP_PORT == 465:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=30) as s:
            s.login(SMTP_USER, SMTP_PASSWORD)
            s.send_message(msg)
    else:  # 587 / 25 with STARTTLS
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as s:
            s.starttls(context=ctx)
            s.login(SMTP_USER, SMTP_PASSWORD)
            s.send_message(msg)


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    reply_to = reply_to or EMAIL_REPLY_TO
    mode = transport()
    if mode == "smtp":
        msg = _mime(to, subject, html, reply_to)
        await asyncio.to_thread(_smtp_send, msg)
        return msg["Message-ID"]
    if mode == "emergent":
        payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
        if reply_to:
            payload["contact_email"] = reply_to
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                                     headers={"X-Email-Key": EMAIL_KEY}, json=payload)
        resp.raise_for_status()
        return resp.json().get("id")
    OUTBOX.mkdir(exist_ok=True)
    path = OUTBOX / f"{datetime.now():%Y%m%d-%H%M%S}-{re.sub(r'[^A-Za-z0-9]+', '-', subject)[:60]}.eml"
    path.write_bytes(bytes(_mime(to, subject, html, reply_to)))
    logger.warning(f"No email transport configured; saved to {path} (would go to {to})")
    return str(path)


def enquiry_email_html(e: dict) -> str:
    rows = [("Received", e["created_at"]), ("Name", e["full_name"]), ("Company", e["company"]),
            ("Email", e["email"]), ("Phone", e["phone"]), ("City / Location", e.get("city") or "-"),
            ("Product", e.get("product") or "-"), ("Quantity", e.get("quantity") or "-"),
            ("Specification", e.get("specification") or "-"), ("Source page", e.get("source_page") or "-"),
            ("Attachment", e.get("attachment_name") or "None")]
    trs = "".join(
        f'<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:bold;width:160px">{escape(k)}</td>'
        f'<td style="padding:8px 12px">{escape(str(v))}</td></tr>' for k, v in rows)
    msg = escape(e.get("message") or "-").replace("\n", "<br>")
    return (f'<table role="presentation" width="100%" style="font-family:Arial,sans-serif;color:#24262b">'
            f'<tr><td style="background:#e21f26;color:#fff;padding:18px 20px;font-size:18px;font-weight:bold">'
            f'New product enquiry</td></tr><tr><td style="padding:16px 0">'
            f'<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">{trs}</table>'
            f'<p style="font-size:14px;padding:0 12px"><b>Requirements:</b><br>{msg}</p>'
            f'<p style="font-size:12px;color:#888;padding:0 12px">Sent by {escape(EMAIL_FROM_NAME)} website enquiry system.</p>'
            f'</td></tr></table>')
