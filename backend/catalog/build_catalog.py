"""Builds the flat Twisty Wrap PDF catalogue + page previews for the website flip-book."""
import io
import json
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFilter
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[2]
PUB = ROOT / "frontend" / "public"
OUT_DIR = PUB / "catalogue"
DATA = json.loads((ROOT / "frontend/src/data/catalog.json").read_text())
FONTS = Path(__file__).resolve().parents[1] / "assets" / "fonts"

for name, file in [("R", "Regular"), ("M", "Medium"), ("B", "Bold"), ("XB", "ExtraBold")]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / f"SairaSemiCondensed-{file}.ttf")))

W, H = A4
RED, RED_D, GREY, GREY_L, INK, PAPER = (HexColor(c) for c in ["#E21F26", "#B5161C", "#5E6066", "#EEF0F3", "#24262B", "#FFFFFF"])
M = 40
LOGO_FULL = PUB / "logo-full.png"
LOGO_MARK = PUB / "logo-mark.png"
PAGES = []
PHONE = "9500868288 / 9445424938"
EMAIL = "twistywrapenterprises@outlook.com"
ADDRESS = "No:25/1, 1st Main Road, North Jaganathan Nagar, Villivakkam, Chennai 600049"
PARTNERS = "Sathanand.M  ·  Harish Kumar.S"


def jpeg(im, q=82):
    buf = io.BytesIO()
    im.convert("RGB").save(buf, "JPEG", quality=q, optimize=True)
    buf.seek(0)
    return ImageReader(buf)


def img(path, w, h, scale=2.2):
    im = Image.open(PUB / path.lstrip("/")).convert("RGB")
    tw, th = int(w * scale), int(h * scale)
    r = max(tw / im.width, th / im.height)
    im = im.resize((int(im.width * r) + 1, int(im.height * r) + 1), Image.LANCZOS)
    left, top = (im.width - tw) // 2, (im.height - th) // 2
    return jpeg(im.crop((left, top, left + tw, top + th)))


def rimage(c, path, x, y, w, h, r=18):
    c.saveState()
    p = c.beginPath()
    p.roundRect(x, y, w, h, r)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(img(path, w, h), x, y, w, h)
    c.restoreState()


def rect(c, x, y, w, h, color, r=14):
    c.setFillColor(color)
    c.roundRect(x, y, w, h, r, stroke=0, fill=1) if r else c.rect(x, y, w, h, stroke=0, fill=1)


def para(c, text, x, y_top, w, size=9.5, font="R", color=INK, lead=None, align=0):
    st = ParagraphStyle("p", fontName=font, fontSize=size, leading=lead or size * 1.38, textColor=color, alignment=align)
    p = Paragraph(text, st)
    _, ph = p.wrap(w, 1000)
    p.drawOn(c, x, y_top - ph)
    return ph


def text(c, s, x, y, size, font="B", color=INK):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, s)


def logo_corner(c):
    tw, th = 92, 66
    x, y = W - M - tw + 14, H - 26 - th
    rect(c, x, y, tw, th, PAPER, 12)
    c.drawImage(ImageReader(str(LOGO_FULL)), x + 9, y + 7, tw - 18, th - 14, mask="auto", preserveAspectRatio=True)


def footer(c, n, on_red=False):
    col = PAPER if on_red else GREY
    c.setStrokeColor(col)
    c.setLineWidth(0.6)
    c.line(M, 34, W - M - 40, 34)
    text(c, "TWISTY WRAP ENTERPRISES  ·  PRODUCT CATALOGUE", M, 22, 7, "M", col)
    rect(c, W - M - 26, 18, 26, 26, PAPER if on_red else RED, 6)
    c.setFont("B", 10)
    c.setFillColor(RED if on_red else PAPER)
    c.drawCentredString(W - M - 13, 27, f"{n:02d}")


def badge_title(c, x, y, title, on_red=False, size=26):
    rect(c, x, y - 4, 30, 30, PAPER if on_red else RED, 8)
    text(c, title.upper(), x + 42, y + 3, size, "XB", PAPER if on_red else INK)


def stripes(c, x, y, w, color):
    c.setStrokeColor(color)
    c.setLineWidth(2)
    i = 0
    while i < w:
        c.line(x + i, y, x + i + 6, y + 8)
        i += 7


def new_page(c, title):
    if PAGES:
        c.showPage()
    PAGES.append(title)


# ---------- cover background with real glass panel (blur of the photo underneath) ----------
def cover_background():
    s = 3
    cw, ch = int(W * s), int(H * s)
    base = Image.new("RGB", (cw, ch), "#FFFFFF")
    photo_h = int(ch * 0.66)
    ph = Image.open(PUB / "img/racks.jpg").convert("RGB")
    r = max(cw / ph.width, photo_h / ph.height)
    ph = ph.resize((int(ph.width * r) + 1, int(ph.height * r) + 1), Image.LANCZOS)
    ph = ph.crop(((ph.width - cw) // 2, (ph.height - photo_h) // 2, (ph.width - cw) // 2 + cw, (ph.height - photo_h) // 2 + photo_h))
    ph = Image.blend(ph, Image.new("RGB", ph.size, "#15171B"), 0.35)
    mask = Image.new("L", (cw, photo_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, -200, cw, photo_h), radius=140, fill=255)
    mask = Image.new("L", (cw, photo_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, -400, cw - 0, photo_h), radius=0, fill=255)
    base.paste(ph, (0, 0), mask)
    # glass panel
    gx, gy, gw, gh = int(M * s), int(ch * 0.30), int((W - 2 * M) * s), int(178 * s)
    region = base.crop((gx, gy, gx + gw, gy + gh)).filter(ImageFilter.GaussianBlur(26))
    region = Image.blend(region, Image.new("RGB", region.size, "#FFFFFF"), 0.18)
    rmask = Image.new("L", (gw, gh), 0)
    ImageDraw.Draw(rmask).rounded_rectangle((0, 0, gw - 1, gh - 1), radius=26 * s, fill=255)
    base.paste(region, (gx, gy), rmask)
    over = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    d.rounded_rectangle((gx, gy, gx + gw, gy + gh), radius=26 * s, outline=(255, 255, 255, 150), width=3)
    d.rounded_rectangle((gx + 6, gy + 6, gx + gw - 6, gy + gh // 2), radius=22 * s, fill=(255, 255, 255, 26))
    base = Image.alpha_composite(base.convert("RGBA"), over).convert("RGB")
    return jpeg(base, 85), gy / s, gh / s


def cover(c):
    new_page(c, "Cover")
    bg, gy, gh = cover_background()
    c.drawImage(bg, 0, 0, W, H)
    panel_bottom = H - gy - gh
    # logo mark + name inside the glass
    c.drawImage(ImageReader(str(LOGO_MARK)), M + 26, panel_bottom + 34, 80, 110, mask="auto", preserveAspectRatio=True)
    text(c, "TWISTY WRAP", M + 128, panel_bottom + 98, 44, "XB", PAPER)
    text(c, "ENTERPRISES", M + 130, panel_bottom + 56, 34, "XB", HexColor("#FF3A40"))
    text(c, "PROTECT  ·  PACKAGE  ·  PERFORM  ·  SUSTAIN", M + 131, panel_bottom + 34, 9, "M", HexColor("#F2F3F5"))
    # top label
    text(c, "PACKAGING  ·  PRINTING  ·  INDUSTRIAL SUPPLIES", M, H - 50, 9, "M", PAPER)
    rect(c, W - M - 64, H - 58, 64, 22, RED, 11)
    c.setFont("B", 9)
    c.setFillColor(PAPER)
    c.drawCentredString(W - M - 32, H - 51, "2026")
    # bottom white area
    rect(c, M, 210, 46, 46, RED, 12)
    rect(c, M, 154, 46, 46, GREY, 12)
    text(c, "PRODUCT", M + 64, 222, 40, "XB", INK)
    text(c, "CATALOGUE", M + 64, 182, 40, "XB", RED)
    para(c, "Packaging solutions built to protect your goods from the warehouse floor to the customer’s door — secure, dependable and increasingly sustainable.",
         M + 64, 168, 360, 10.5, "R", GREY)
    stripes(c, M, 60, 180, RED)
    text(c, f"{EMAIL}   ·   {PHONE}   ·   Chennai", M, 40, 8, "M", GREY)


def contents(c):
    new_page(c, "Contents")
    rect(c, 0, 0, W * 0.44, H, RED, 0)
    rimage(c, "/img/warehouse.jpg", 26, H * 0.42, W * 0.44 - 52, H * 0.5, 22)
    text(c, "“", 32, H * 0.36, 60, "XB", PAPER)
    text(c, "INTRO", 34, H * 0.30, 34, "XB", PAPER)
    text(c, "DUCTION", 34, H * 0.30 - 34, 34, "XB", PAPER)
    para(c, "Twisty Wrap Enterprises supplies packaging, printing and industrial materials that are strong enough to hold loads together, protective enough to safeguard products and practical for storage and transportation.",
         34, H * 0.30 - 50, W * 0.44 - 68, 9.5, "R", PAPER)
    logo_corner(c)
    x0 = W * 0.44 + 34
    text(c, "Table of", x0, H - 140, 18, "M", GREY)
    text(c, "CONTENT", x0, H - 172, 32, "XB", INK)
    items = ["About Us", "Packaging", "Printing & Display", "Industrial & Safety", "Business & Stationery", "Sustainable Products", "Our Approach", "Get in Touch"]
    y = H - 230
    for i, it in enumerate(items):
        red = i % 2 == 0
        bx = x0 if red else x0 + 150
        rect(c, bx, y, 52, 36, RED if red else GREY, 10)
        c.setFont("XB", 15)
        c.setFillColor(PAPER)
        c.drawCentredString(bx + 26, y + 12, f"{i + 1:02d}")
        tx = bx + 62 if red else x0
        text(c, it.upper(), tx, y + 13, 10, "B", INK)
        y -= 62
    footer(c, len(PAGES))


def about(c):
    new_page(c, "About Us")
    rect(c, 0, 0, W, H, RED, 0)
    logo_corner(c)
    badge_title(c, M, H - 70, "About us", on_red=True)
    rect(c, M, H * 0.42, W * 0.58, H * 0.42, PAPER, 26)
    tx, tw = M + 26, W * 0.58 - 52
    text(c, "OUR STORY", tx, H * 0.84 - 46, 14, "XB", INK)
    h = para(c, "We supply packaging solutions built to protect your goods from the warehouse floor to the customer’s door — secure, dependable and increasingly sustainable.", tx, H * 0.84 - 58, tw, 11, "M", INK)
    h2 = para(c, "Our flagship products are <b>Stretch Film (Bio &amp; Non Bio-Degradable)</b> and <b>Honeycomb based products</b>. Alongside them we supply cartons, tapes, foams, printing and workplace safety supplies, designed around the way your business stores, handles and ships its products.",
         tx, H * 0.84 - 70 - h, tw, 9.5, "R", GREY)
    para(c, f"<b>Managing Partners:</b> {PARTNERS}", tx, H * 0.84 - 80 - h - h2, tw, 9.5, "M", INK)
    pillars = [("Reliable protection", "Materials strong enough to hold loads together and protective enough to safeguard products."),
               ("Responsible choices", "Bio-degradable and recyclable options wherever they suit your application."),
               ("Easy specification", "Clear product families, sizes and options so ordering the right item is simple.")]
    y = H * 0.84
    for i, (t, d) in enumerate(pillars):
        bx = W * 0.58 + M + 14
        bw = W - bx - M
        rect(c, bx, y - 104, bw, 104, GREY if i == 1 else RED_D, 16)
        text(c, f"0{i + 1}", bx + 14, y - 30, 20, "XB", PAPER)
        para(c, f"<b>{t}</b>", bx + 14, y - 40, bw - 28, 10, "B", PAPER)
        para(c, d, bx + 14, y - 56, bw - 28, 8, "R", PAPER)
        y -= 118
    rimage(c, "/img/warehouse-dark.jpg", M, 64, W - 2 * M, H * 0.42 - 84, 24)
    footer(c, len(PAGES), on_red=True)


def vision(c):
    new_page(c, "Our Vision")
    rect(c, 0, 0, W, H, PAPER, 0)
    rect(c, M - 14, 60, W - 2 * M + 28, H - 140, RED, 30)
    rimage(c, "/img/logistics.jpg", M, H * 0.32, W - 2 * M, H - 80 - H * 0.32 - 14, 24)
    logo_corner(c)
    rect(c, M, H * 0.32 - 100, W - 2 * M, 84, PAPER, 18)
    text(c, "OUR VISION", M + 24, H * 0.32 - 66, 30, "XB", RED)
    text(c, "PROTECT. PACKAGE. PERFORM. SUSTAIN.", M + 24, H * 0.32 - 88, 11, "B", GREY)
    words = [("Protect", "Secure, dependable materials for every load."), ("Package", "The right format and size for each product."),
             ("Perform", "Consistent supply for warehouse and dispatch."), ("Sustain", "Increasingly sustainable material choices.")]
    cw = (W - 2 * M - 30) / 4
    for i, (t, d) in enumerate(words):
        x = M + i * (cw + 10)
        c.setFillColor(PAPER)
        c.circle(x + 16, H * 0.32 - 132, 13, stroke=0, fill=1)
        c.setFont("XB", 10)
        c.setFillColor(RED)
        c.drawCentredString(x + 16, H * 0.32 - 135.5, str(i + 1))
        text(c, t.upper(), x, H * 0.32 - 162, 11, "XB", PAPER)
        para(c, d, x, H * 0.32 - 168, cw - 4, 8, "R", PAPER)
    footer(c, len(PAGES))


def tile_page(c, cat, items, idx_start, hero=None):
    new_page(c, cat["name"])
    logo_corner(c)
    badge_title(c, M, H - 70, cat["name"])
    para(c, cat["short"], M, H - 92, W * 0.55, 9.5, "R", GREY)
    img_h = 250 if len(items) > 2 else 330
    rimage(c, hero or items[0]["image"], M, H - 150 - img_h, W - 2 * M, img_h, 24)
    gap = 14
    tw = (W - 2 * M - gap) / 2
    th = 168
    top = H - 166 - img_h
    for i, p in enumerate(items):
        col, row = i % 2, i // 2
        x = M + col * (tw + gap)
        y = top - (row + 1) * th - row * gap
        red = (col + row) % 2 == 1
        rect(c, x, y, tw, th, RED if red else GREY, 18)
        text(c, f"{idx_start + i:02d}", x + 18, y + th - 36, 22, "XB", PAPER)
        tag = {"biodegradable": "BIO-DEGRADABLE", "recyclable": "RECYCLABLE"}.get(p.get("sustainability"))
        if tag or p.get("customizable"):
            label = tag or "CUSTOMIZABLE"
            c.setFont("B", 6.5)
            lw = c.stringWidth(label, "B", 6.5) + 14
            rect(c, x + tw - lw - 14, y + th - 34, lw, 15, PAPER, 7.5)
            c.setFillColor(RED if red else GREY)
            c.drawString(x + tw - lw - 7, y + th - 29, label)
        h = para(c, p["name"].upper(), x + 18, y + th - 46, tw - 36, 11.5, "XB", PAPER, 13)
        para(c, p["shortDescription"], x + 18, y + th - 52 - h, tw - 36, 8.3, "R", PAPER)
    stripes(c, M, 48, 120, RED)
    footer(c, len(PAGES))


def list_page(c, cat, items, idx_start):
    new_page(c, cat["name"])
    lw = W * 0.38
    rect(c, 0, 0, lw, H, RED, 0)
    rimage(c, items[0]["image"], 24, H * 0.36, lw - 48, H * 0.5, 22)
    text(c, cat["name"].upper(), 28, H * 0.36 - 40, 20 if len(cat["name"]) < 16 else 16, "XB", PAPER)
    para(c, "Every item can be specified to your load, product or campaign. Ask us for the option that fits.", 28, H * 0.36 - 52, lw - 56, 9, "R", PAPER)
    rect(c, 28, 70, 18, 18, PAPER, 5)
    rect(c, 52, 70, 18, 18, RED_D, 5)
    logo_corner(c)
    x0 = lw + 30
    w0 = W - x0 - M
    text(c, "PRODUCT RANGE", x0, H - 66, 9, "B", RED)
    y = H - 120
    for i, p in enumerate(items):
        red = i % 2 == 0
        rect(c, x0, y - 30, 40, 34, RED if red else GREY, 9)
        c.setFont("XB", 14)
        c.setFillColor(PAPER)
        c.drawCentredString(x0 + 20, y - 18, f"{idx_start + i:02d}")
        h = para(c, p["name"].upper(), x0 + 54, y + 2, w0 - 54, 11.5, "XB", INK, 13)
        h += para(c, p["shortDescription"], x0 + 54, y - h, w0 - 54, 8.6, "R", GREY)
        feats = "   ".join(f"<font color='#E21F26'>■</font> {f}" for f in p["features"][:3])
        h += para(c, feats, x0 + 54, y - h - 6, w0 - 54, 7.6, "M", INK) + 6
        y -= max(h, 40) + 30
        c.setStrokeColor(HexColor("#D9DCE1"))
        c.setLineWidth(0.6)
        c.line(x0, y + 14, W - M, y + 14)
    footer(c, len(PAGES))


def sustainability(c):
    new_page(c, "Our Approach")
    logo_corner(c)
    rect(c, M, H - 112, 38, 38, RED, 10)
    text(c, "OUR APPROACH", M + 52, H - 92, 26, "XB", INK)
    text(c, "TO SUSTAINABLE PACKAGING", M + 52, H - 112, 12, "B", GREY)
    cx, cy, r = W / 2, H * 0.56, 120
    for i, col in enumerate([RED, GREY, RED_D, HexColor("#8A8D93")]):
        c.setFillColor(col)
        c.wedge(cx - r, cy - r, cx + r, cy + r, 90 * i + 4, 82, stroke=0, fill=1)
    c.setFillColor(PAPER)
    c.circle(cx, cy, 52, stroke=0, fill=1)
    c.setFillColor(INK)
    c.circle(cx, cy, 22, stroke=0, fill=1)
    blocks = [("Bio-degradable options", "Bio-degradable grades such as our bio-degradable stretch film, for customers moving to more responsible materials."),
              ("Recyclable materials", "Paper-based honeycomb pallets, boxes, partitions and wraps that can be recycled with paper waste."),
              ("Right-sizing", "Cartons and inserts sized to your product reduce unnecessary material, void fill and freight volume."),
              ("Eco printing", "Printing on kraft paper, recycled board and bio-films, with soy- or water-based inks on request.")]
    pos = [(M, cy + 80), (W - M - 150, cy + 80), (W - M - 150, cy - 80), (M, cy - 80)]
    for (t, d), (x, y) in zip(blocks, pos):
        text(c, t.upper(), x, y + 10, 10.5, "XB", RED)
        para(c, d, x, y, 150, 8.5, "R", GREY)
    rect(c, M, 70, W - 2 * M, 130, GREY_L, 20)
    para(c, "We use factual, responsible language: sustainable options depend on the product, the grade selected and local recycling or disposal facilities. Talk to us about which option is suitable for your application.",
         M + 24, 176, W - 2 * M - 48, 10, "M", INK)
    stripes(c, M + 24, 92, 160, RED)
    footer(c, len(PAGES))


def back_cover(c):
    new_page(c, "Get in Touch")
    rect(c, 0, 0, W, H, RED, 0)
    logo_corner(c)
    badge_title(c, M, H - 70, "Get in touch", on_red=True)
    rect(c, M, H * 0.38, W - 2 * M, H * 0.42, PAPER, 26)
    text(c, "LET’S SPECIFY THE RIGHT", M + 28, H * 0.8 - 56, 22, "XB", INK)
    text(c, "PACKAGING FOR WHAT YOU SHIP.", M + 28, H * 0.8 - 82, 22, "XB", RED)
    para(c, "Tell us about your products, loads and shipping routes. We will help you identify the right film, honeycomb, cartons and quantities — and supply the printing and safety items your team uses every day.",
         M + 28, H * 0.8 - 98, W - 2 * M - 56, 10.5, "R", GREY)
    rows = [("PHONE", PHONE), ("EMAIL", EMAIL), ("ADDRESS", ADDRESS), ("PARTNERS", PARTNERS), ("WEBSITE", "[WEBSITE]")]
    y = H * 0.38 + 136
    for i, (k, v) in enumerate(rows):
        rect(c, M + 28, y, 76, 22, RED if i % 2 == 0 else GREY, 6)
        c.setFont("B", 8)
        c.setFillColor(PAPER)
        c.drawCentredString(M + 66, y + 7.5, k)
        ph = para(c, v, M + 118, y + 18, W - 2 * M - 146, 10.5, "B", INK, 12.5)
        y -= max(32, ph + 14)
    c.setFillColor(PAPER)
    c.circle(W / 2, 182, 66, stroke=0, fill=1)
    c.drawImage(ImageReader(str(LOGO_MARK)), W / 2 - 34, 135, 68, 94, mask="auto", preserveAspectRatio=True)
    c.setFont("XB", 18)
    c.setFillColor(PAPER)
    c.drawCentredString(W / 2, 84, "TWISTY WRAP ENTERPRISES")
    footer(c, len(PAGES), on_red=True)


def build():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = OUT_DIR / "twisty-wrap-catalogue.pdf"
    c = canvas.Canvas(str(pdf_path), pagesize=A4)
    c.setTitle("Twisty Wrap Enterprises — Product Catalogue")
    c.setAuthor("Twisty Wrap Enterprises")
    cover(c)
    contents(c)
    about(c)
    vision(c)
    n = 1
    for cat in DATA["categories"]:
        prods = [p for p in DATA["products"] if p["category"] == cat["id"]]
        pages = -(-len(prods) // 4)
        size = -(-len(prods) // pages)
        for k, j in enumerate(range(0, len(prods), size)):
            chunk = prods[j:j + size]
            if k % 2 == 0:
                tile_page(c, cat, chunk, n, cat["image"] if k == 0 else None)
            else:
                list_page(c, cat, chunk, n)
            n += len(chunk)
    sustainability(c)
    back_cover(c)
    c.save()
    doc = fitz.open(str(pdf_path))
    for old in OUT_DIR.glob("page-*.jpg"):
        old.unlink()
    for i, page in enumerate(doc):
        page.get_pixmap(matrix=fitz.Matrix(1.7, 1.7)).pil_save(str(OUT_DIR / f"page-{i + 1:02d}.jpg"), quality=82)
    (ROOT / "frontend/src/data/cataloguePages.json").write_text(json.dumps(
        [{"src": f"/catalogue/page-{i + 1:02d}.jpg", "title": t} for i, t in enumerate(PAGES)], indent=1))
    print(f"{len(PAGES)} pages -> {pdf_path}")


if __name__ == "__main__":
    build()
