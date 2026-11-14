"""Builds the website's images from the original photos (run once; outputs in img/).
Privacy blurs (people, plates) are applied before cropping."""
import sys, os
from PIL import Image, ImageOps, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]

def load(name, blurs=()):
    im = ImageOps.exif_transpose(Image.open(f"{SRC}/{name}-image.jpg")).convert("RGB")
    for b in blurs:
        im.paste(im.crop(b).filter(ImageFilter.GaussianBlur(28)), b)
    return im

def save(im, path, width, q=78):
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(f"{OUT}/{path}", "WEBP", quality=q, method=6)
    print(path, im.size, os.path.getsize(f"{OUT}/{path}") // 1024, "KB")

SHEET_BLUR = [(180, 1155, 305, 1415), (355, 1085, 415, 1145)]
# --- Hero slides: (desktop 16:9 crop) and (phone portrait crop) ---
b9 = load("a84fb8cc");  d = b9.crop((0, 40, 1200, 715))
save(d, "hero-bridge.webp", 1920); save(d, "hero-bridge-1200.webp", 1200)
b8 = load("d634efe0");  save(b8.crop((150, 0, 1050, 1600)), "hero-bridge-m.webp", 900)
s2 = load("bf657501", SHEET_BLUR); d = s2.crop((0, 160, 2016, 1294))
save(d, "hero-roof.webp", 1920); save(d, "hero-roof-1200.webp", 1200)
s1 = load("982e73b8");  save(s1.crop((250, 0, 1384, 2016)), "hero-roof-m.webp", 900)
h1 = load("3ad1d9d4");  d = h1.crop((0, 190, 2016, 1324))
save(d, "hero-block.webp", 1920); save(d, "hero-block-1200.webp", 1200)
save(h1.crop((820, 0, 1670, 1512)), "hero-block-m.webp", 900)
