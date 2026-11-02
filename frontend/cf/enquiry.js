// Shared logic for the Cloudflare Pages Function at functions/api/enquiries.js.
// Kept outside functions/ so Pages does not turn this file into a route.

export const MAX_UPLOAD = 5 * 1024 * 1024;
export const ALLOWED_EXT = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt"];
export const EMAIL_RE = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[A-Za-z]{2,}$/;
export const THANKS = "Thank you for your enquiry. Our team will review your requirements and get back to you shortly.";

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

export const newReference = () => "TWE-" + crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

// Same layout as the original FastAPI notification (backend/email_service.py).
export function enquiryEmailHtml(e, fromName) {
  const rows = [
    ["Reference", e.reference], ["Received", e.created_at], ["Name", e.full_name], ["Company", e.company],
    ["Email", e.email], ["Phone", e.phone], ["City / Location", e.city || "-"], ["Product", e.product || "-"],
    ["Quantity", e.quantity || "-"], ["Specification", e.specification || "-"], ["Source page", e.source_page || "-"],
    ["Attachment", e.attachment_name ? `${e.attachment_name} (attached)` : "None"],
  ];
  const trs = rows
    .map(([k, v]) => `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:bold;width:160px">${esc(k)}</td><td style="padding:8px 12px">${esc(v)}</td></tr>`)
    .join("");
  const msg = esc(e.message || "-").replace(/\n/g, "<br>");
  return `<table role="presentation" width="100%" style="font-family:Arial,sans-serif;color:#24262b">`
    + `<tr><td style="background:#e21f26;color:#fff;padding:18px 20px;font-size:18px;font-weight:bold">New product enquiry</td></tr>`
    + `<tr><td style="padding:16px 0"><table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">${trs}</table>`
    + `<p style="font-size:14px;padding:0 12px"><b>Requirements:</b><br>${msg}</p>`
    + `<p style="font-size:12px;color:#888;padding:0 12px">Sent by the ${esc(fromName)} website enquiry system. Reply to this email to answer the customer.</p>`
    + `</td></tr></table>`;
}

const base64 = (buf) => {
  const u = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
};

// Sends through Resend (https://resend.com). RESEND_API_KEY is a Cloudflare secret, never in the repo.
// Returns "sent", or "not_configured" when no key is set (local dev without .dev.vars).
export async function sendEmail(env, { to, subject, html, replyTo, attachment }) {
  if (!env.RESEND_API_KEY) {
    console.warn(`[enquiry] RESEND_API_KEY not set; email not sent. Would go to ${to}: ${subject}`);
    return "not_configured";
  }
  const body = { from: env.EMAIL_FROM, to: [to], subject, html, reply_to: replyTo };
  if (attachment) body.attachments = [{ filename: attachment.name, content: base64(attachment.bytes) }];
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return "sent";
}
