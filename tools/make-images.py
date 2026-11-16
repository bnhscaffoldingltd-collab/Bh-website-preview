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
lb = load("d634efe0")                                   # long view of the roof bridge: opening photo
save(big(lb), "hero-long.webp", 1920, q=80); save(lb, "hero-long-1200.webp", 1200)
br = load("f5439c8d").crop((0, 520, 1200, 1600))        # beam bracing close-up: background behind the services text
save(big(br, 1600), "bg-bracing.webp", 1600, q=68)
r = load("bf657501", SHEET_BLUR)                        # sheeted house with temporary roof (landscape)
save(big(r), "hero-roof.webp", 1920, q=80); save(r, "hero-roof-1200.webp", 1200)
f = load("7ab55845")                                    # yellow-brick flats, foams
save(big(f), "hero-flats.webp", 1920, q=74); save(f, "hero-flats-1200.webp", 1200)
h = load("3ad1d9d4")                                    # housing block, long foamed run (landscape)
save(big(h), "hero-housing.webp", 1920, q=80); save(h, "hero-housing-1200.webp", 1200)

# --- Work tiles: finished jobs, already privacy-blurred, from the processed job photos ---
JOBS = sys.argv[3] if len(sys.argv) > 3 else None
TILES = {
  "ind": ["industrial-roof-beams-9", "industrial-yard-tower-1", "industrial-roof-beams-2", "industrial-roof-beams-4"],
  "soc": ["housing-block-4", "yellow-brick-flats-1", "four-storey-block-1", "flats-two-elevations-1", "housing-block-1"],
  "roof": ["sheeted-house-1", "temporary-roof-1", "sheeted-house-2", "temporary-roof-2"],
  "dom": ["victorian-terrace-tower-1", "bay-terrace-roof-1", "yellow-brick-townhouse-1", "semi-roof-scaffold-1", "london-terrace-sw6-1"],
}
if JOBS:
    for key, names in TILES.items():
        for i, n in enumerate(names, 1):
            im = Image.open(f"{JOBS}/{n}.webp").convert("RGB")
            im = ImageOps.fit(im, (800, 1000), Image.LANCZOS, centering=(0.5, 0.5 if im.height > im.width else 0.5))
            save(im, f"tile-{key}-{i}.webp", 800, q=76)
