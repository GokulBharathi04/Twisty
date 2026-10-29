"""Brand the Twisty Wrap site photos.

For each photo in public/img:
  1. remove third-party product / brand names (OpenCV inpainting over a text mask)
  2. place the Twisty logo on the product itself, styled to its surface
  3. add the full logo in the top-right corner on a small white plate

Originals are read from img-originals/ (created on the first run), so the
script can be re-run safely after changing a placement below.

    python scripts/brand_images.py
"""
import shutil
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "public" / "img"
ORIG = ROOT / "img-originals"
LOGO_FULL = Image.open(ROOT / "public" / "logo-full.png").convert("RGBA")
LOGO_MARK = Image.open(ROOT / "public" / "logo-mark.png").convert("RGBA")

# A real company's trade-show stand: not rebranded (see the project notes).
SKIP = {"banner.jpg"}

# Product logos are drawn smaller and fainter than their PLAN size so they read
# as part of the product, not as a stamp. Signage (keep=True) stays as planned.
SCALE = 0.7
FADE = 0.75

# remove: (x0, y0, x1, y1, mode)  mode: dark | absdark | light | nonwhite | yellow | lightlocal
# brand:  dict(at=(cx, cy), w=width, rot=deg, mode=print|ink|white|decal, op=opacity, logo=mark|full)
PLAN = {
    "bubble.jpg": {"brand": [dict(at=(820, 540), w=230, rot=-10, mode="ink", op=0.5)]},
    "bubble2.jpg": {"brand": [dict(at=(800, 1070), w=300, rot=0, mode="ink", op=0.45)]},
    "carton-open.jpg": {"brand": [dict(at=(560, 610), w=150, rot=-4, mode="print", op=0.6)]},
    "cartons.jpg": {
        "remove": [(0, 0, 1600, 2400, "lightlocal")],
        "brand": [dict(at=(820, 1450), w=150, rot=10, mode="print", op=0.7),
                  dict(at=(905, 1100), w=130, rot=-62, mode="print", op=0.65)],
    },
    "display.jpg": {
        "remove": [(520, 400, 1330, 1400, "absdark")],
        "brand": [dict(at=(925, 900), w=600, rot=0, mode="ink", op=1.0, logo="full", keep=True)],
    },
    "eco.jpg": {
        "remove": [(790, 320, 1090, 615, "absdark")],
        "brand": [dict(at=(940, 470), w=230, rot=5, mode="print", op=0.85)],
    },
    "eco2.jpg": {"brand": [dict(at=(950, 340), w=120, rot=-10, mode="print", op=0.7),
                           dict(at=(575, 400), w=80, rot=0, mode="ink", op=0.9)]},
    "film-roll.jpg": {"brand": [dict(at=(507, 430), w=115, rot=0, mode="ink", op=0.55),
                                dict(at=(778, 430), w=115, rot=0, mode="ink", op=0.55)]},
    "foam.jpg": {
        "remove": [(695, 480, 750, 550, "light"), (370, 610, 660, 705, "light")],
        "brand": [dict(at=(1250, 800), w=110, rot=0, mode="white", op=0.55)],
    },
    "gloves.jpg": {
        "remove": [(400, 465, 665, 705, "light")],
        "brand": [dict(at=(535, 570), w=130, rot=165, mode="white", op=0.75)],
    },
    "gloves2.jpg": {"brand": [dict(at=(840, 760), w=150, rot=-5, mode="print", op=0.6)]},
    "goggles.jpg": {"brand": [dict(at=(900, 1060), w=100, rot=-20, mode="white", op=0.7)]},
    "helmet-worker.jpg": {
        "remove": [(600, 695, 795, 875, "nonwhite"), (240, 970, 365, 1055, "yellow")],
        "brand": [dict(at=(700, 790), w=150, rot=0, mode="decal", op=0.95),
                  dict(at=(800, 1950), w=330, rot=0, mode="print", op=0.55)],
    },
    "helmet.jpg": {"brand": [dict(at=(1080, 470), w=160, rot=-8, mode="white", op=0.9)]},
    "honeycomb.jpg": {},
    "honeycomb2.jpg": {"brand": [dict(at=(500, 1700), w=300, rot=0, mode="print", op=0.5)]},
    "label-press.jpg": {"brand": [dict(at=(1050, 700), w=160, rot=0, mode="ink", op=0.85)]},
    "labels.jpg": {"brand": [dict(at=(735, 1700), w=60, rot=0, mode="white", op=0.85)]},
    "logistics.jpg": {},
    "pallets.jpg": {"brand": [dict(at=(460, 560), w=130, rot=0, mode="print", op=0.45)]},
    "racks.jpg": {"brand": [dict(at=(1400, 250), w=110, rot=0, mode="print", op=0.6)]},
    "stationery.jpg": {
        "remove": [(900, 260, 1600, 740, "yellow"), (0, 480, 220, 720, "light"), (0, 740, 220, 1000, "light")],
        "brand": [dict(at=(790, 330), w=120, rot=-10, mode="white", op=0.8)],
    },
    "stretch.jpg": {"brand": [dict(at=(440, 520), w=110, rot=0, mode="print", op=0.6)]},
    "sunboard.jpg": {"brand": [dict(at=(630, 420), w=160, rot=0, mode="ink", op=1.0, logo="full", keep=True)]},
    "tape.jpg": {"brand": [dict(at=(520, 560), w=110, rot=-20, mode="white", op=0.9)]},
    "thermal.jpg": {"brand": [dict(at=(1091, 835), w=90, rot=0, mode="ink", op=0.7)]},
    "vests.jpg": {"brand": [dict(at=(1150, 1550), w=160, rot=0, mode="print", op=0.55)]},
    "warehouse-dark.jpg": {"brand": [dict(at=(720, 560), w=110, rot=0, mode="print", op=0.6)]},
    "warehouse.jpg": {},
    "worker-orange.jpg": {"brand": [dict(at=(960, 860), w=120, rot=0, mode="white", op=0.9)]},
}


def text_mask(bgr, box, mode):
    x0, y0, x1, y1 = box
    region = bgr[y0:y1, x0:x1]
    hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY).astype(np.int16)
    local = cv2.medianBlur(gray.astype(np.uint8), 41).astype(np.int16)
    if mode == "absdark":  # dense or large dark lettering: an absolute cut-off, not a local one
        m = gray < 205 if (hsv[..., 1] < 40).mean() > 0.6 else gray < 120
    elif mode == "dark":
        m = gray < local - 35
    elif mode == "light":
        m = gray > local + 35
    elif mode == "lightlocal":  # white print on kraft: brighter than surroundings and low in colour
        m = (gray > local + 28) & (hsv[..., 1] < 70)
    elif mode == "nonwhite":
        m = (hsv[..., 1] > 45) | (hsv[..., 2] < 150)
    elif mode == "yellow":
        m = (hsv[..., 0] > 18) & (hsv[..., 0] < 38) & (hsv[..., 1] > 110) & (hsv[..., 2] > 140)
    else:
        m = np.ones(gray.shape, bool)
    m = m.astype(np.uint8) * 255
    m = cv2.dilate(m, np.ones((7, 7), np.uint8), iterations=1)
    full = np.zeros(bgr.shape[:2], np.uint8)
    full[y0:y1, x0:x1] = m
    return full


def remove_text(img, removes):
    bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    mask = np.zeros(bgr.shape[:2], np.uint8)
    for x0, y0, x1, y1, mode in removes:
        mask |= text_mask(bgr, (x0, y0, x1, y1), mode)
    out = cv2.inpaint(bgr, mask, 9, cv2.INPAINT_TELEA)
    return Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))


def styled_logo(spec):
    logo = LOGO_FULL if spec.get("logo") == "full" else LOGO_MARK
    keep = spec.get("keep")
    w = spec["w"] if keep else round(spec["w"] * SCALE)
    logo = logo.resize((w, round(logo.height * w / logo.width)), Image.LANCZOS)
    alpha = logo.getchannel("A")
    mode = spec["mode"]
    if mode == "print":  # single-colour ink soaked into cardboard / kraft / fabric
        layer = Image.new("RGBA", logo.size, (46, 32, 24, 0))
        layer.putalpha(alpha)
    elif mode == "white":
        layer = Image.new("RGBA", logo.size, (245, 245, 245, 0))
        layer.putalpha(alpha)
    elif mode == "decal":  # full colour on a white sticker
        pad = round(w * 0.12)
        plate = Image.new("RGBA", (logo.width + pad * 2, logo.height + pad * 2), (0, 0, 0, 0))
        ImageDraw.Draw(plate).rounded_rectangle((0, 0, plate.width - 1, plate.height - 1), radius=pad, fill=(250, 250, 250, 255))
        plate.alpha_composite(logo, (pad, pad))
        layer = plate
    else:  # ink: full colour print
        layer = logo
    layer = layer.rotate(spec.get("rot", 0), resample=Image.BICUBIC, expand=True)
    op = spec.get("op", 1) * (1 if keep else FADE)
    a = layer.getchannel("A").point(lambda v: round(v * op))
    layer.putalpha(a)
    return layer.filter(ImageFilter.GaussianBlur(0.6)), mode


def place(img, spec):
    layer, mode = styled_logo(spec)
    cx, cy = spec["at"]
    pos = (round(cx - layer.width / 2), round(cy - layer.height / 2))
    base = img.convert("RGBA")
    if mode == "print":  # multiply, so the surface texture shows through the ink
        patch = base.crop((pos[0], pos[1], pos[0] + layer.width, pos[1] + layer.height))
        ink = Image.new("RGBA", layer.size, (255, 255, 255, 255))
        ink.alpha_composite(layer)
        mult = Image.fromarray((np.array(patch, np.float32)[..., :3] * np.array(ink, np.float32)[..., :3] / 255).astype(np.uint8))
        base.paste(mult, pos)
    else:  # light the logo with the surface under it, so folds and shadows cross it
        patch = np.array(base.crop((pos[0], pos[1], pos[0] + layer.width, pos[1] + layer.height)), np.float32)[..., :3]
        lum = cv2.GaussianBlur(patch.mean(axis=2), (0, 0), 3)
        a = np.array(layer.getchannel("A"), np.float32)
        ref = (lum * a).sum() / max(a.sum(), 1)
        shade = np.clip(lum / max(ref, 1), 0.55, 1.2)[..., None]
        rgb = np.clip(np.array(layer, np.float32)[..., :3] * shade, 0, 255).astype(np.uint8)
        lit = Image.fromarray(rgb).convert("RGBA")
        lit.putalpha(layer.getchannel("A"))
        base.alpha_composite(lit, pos)
    return base.convert("RGB")


def corner_logo(img):
    """A small, quiet maker's mark: a soft plate that lets the photo show through."""
    w = max(90, round(img.width * 0.075))
    logo = LOGO_FULL.resize((w, round(LOGO_FULL.height * w / LOGO_FULL.width)), Image.LANCZOS)
    pad = round(w * 0.1)
    plate = Image.new("RGBA", (logo.width + pad * 2, logo.height + pad * 2), (0, 0, 0, 0))
    shadow = Image.new("RGBA", plate.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((0, 4, plate.width - 1, plate.height - 1), radius=pad, fill=(0, 0, 0, 28))
    shadow = shadow.filter(ImageFilter.GaussianBlur(5))
    ImageDraw.Draw(plate).rounded_rectangle((0, 0, plate.width - 1, plate.height - 1), radius=pad, fill=(255, 255, 255, 170))
    plate.alpha_composite(logo, (pad, pad))
    plate.putalpha(plate.getchannel("A").point(lambda v: round(v * 0.85)))
    margin = round(img.width * 0.03)
    pos = (img.width - plate.width - margin, margin)
    base = img.convert("RGBA")
    base.alpha_composite(shadow, (pos[0], pos[1] + 2))
    base.alpha_composite(plate, pos)
    return base.convert("RGB")


def main():
    ORIG.mkdir(exist_ok=True)
    for src in sorted(IMG.glob("*.jpg")):
        if not (ORIG / src.name).exists():
            shutil.copy2(src, ORIG / src.name)
    # Bio catalogue photos (rendered from the PDF) carry only the corner mark
    for src in sorted(ORIG.glob("bio-*.jpg")):
        PLAN.setdefault(src.name, {})
    for name, plan in PLAN.items():
        img = Image.open(ORIG / name).convert("RGB")
        if plan.get("remove"):
            img = remove_text(img, plan["remove"])
        for spec in plan.get("brand", []):
            img = place(img, spec)
        img = corner_logo(img)
        img.save(IMG / name, quality=88, optimize=True)
        print("branded", name)
    for name in SKIP:
        print("left untouched", name)


if __name__ == "__main__":
    main()
