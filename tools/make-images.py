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

# --- Hero photos: one large and one 1200px version each; the page pans across them ---
b9 = load("a84fb8cc")                                   # industrial roof bridge (landscape)
save(big(b9), "hero-bridge.webp", 1920, q=84); save(b9, "hero-bridge-1200.webp", 1200)
save(load("d634efe0").crop((150, 0, 1050, 1600)), "hero-bridge-m.webp", 900)   # phone: portrait view of the bridge
t = load("99fdec19").crop((0, 0, 1512, 1580))           # modern block, beam over entrance (crop removes a passer-by)
save(big(t), "hero-block.webp", 1920, q=76); save(t, "hero-block-1200.webp", 1200)
h = load("2c78ef08", [(1065, 1325, 1225, 1620), (920, 1355, 970, 1415)]).crop((0, 0, 1512, 1900))
save(big(h), "hero-townhouse.webp", 1920, q=72); save(h, "hero-townhouse-1200.webp", 1200)
f = load("7054add4")                                    # four-storey scaffold on a beam
save(big(f), "hero-beam.webp", 1920, q=72); save(f, "hero-beam-1200.webp", 1200)
