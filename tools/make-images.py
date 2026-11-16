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

def big(im, w=1920):
    """Enlarge with Lanczos plus a light unsharp mask (no detail invented)."""
    if im.width >= w:
        return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))

SHEET_BLUR = [(180, 1155, 305, 1415), (355, 1085, 415, 1145)]
# --- Hero photos: one large and one 1200px version each; the page pans across them ---
b9 = load("a84fb8cc")                                   # industrial roof bridge (landscape)
save(big(b9), "hero-bridge.webp", 1920, q=84); save(b9, "hero-bridge-1200.webp", 1200)
save(load("d634efe0").crop((150, 0, 1050, 1600)), "hero-bridge-m.webp", 900)   # phone: portrait view of the bridge
r = load("bf657501", SHEET_BLUR)                        # sheeted house with temporary roof (landscape)
save(big(r), "hero-roof.webp", 1920, q=80); save(r, "hero-roof-1200.webp", 1200)
f = load("7ab55845")                                    # yellow-brick flats, foams
save(big(f), "hero-flats.webp", 1920, q=74); save(f, "hero-flats-1200.webp", 1200)
h = load("3ad1d9d4")                                    # housing block, long foamed run (landscape)
save(big(h), "hero-housing.webp", 1920, q=80); save(h, "hero-housing-1200.webp", 1200)
