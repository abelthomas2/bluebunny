#!/usr/bin/env python3
"""Convert the real iPhone HEIC turnover photos into clean, web-ready album JPGs.

Pipeline per photo:
  1. sips decodes the HEIC to a full-res temp JPG (the only HEIC reader on hand).
     iPhone shots carry an EXIF orientation tag (often 6 = rotate 90deg); sips
     leaves the tag on rather than baking it, so the temp JPG is "sideways pixels
     + a tag." Finder/Safari honor the tag, but to be robust everywhere we bake it.
  2. PIL exif_transpose() rotates the pixels upright and drops the tag.
  3. ImageOps.fit() center-crops + scales to a uniform 4:3 landscape (the album
     grid and lightbox are 4:3). Portrait shots get cropped in; true landscape
     shots are already 4:3 so nothing meaningful is lost.
  4. Saved with no EXIF, so orientation is unambiguous in every browser/tool.

Run from the repo root: python3 scripts/process-sample-photos.py
"""
import os
import subprocess
import tempfile
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_ROOT = os.path.join(ROOT, "public", "as found & post turn photos")
DST_ROOT = os.path.join(ROOT, "public", "samplereport")
OUT_W, OUT_H = 1500, 1125  # 4:3
QUALITY = 82

# Per-photo crop framing for the portrait shots cropped to 4:3. ImageOps.fit
# centering is (x, y) in 0..1; (0.5, 0.5) = dead center. Override where the
# subject isn't centered so the crop keeps the right part of the frame.
CENTERING = {
    "pt-restock-laundry.jpg": (0.5, 0.15),  # tall stacked unit — keep the top (dryer + controls)
}
DEFAULT_CENTERING = (0.5, 0.5)

# (source path relative to SRC_ROOT) -> (destination filename in DST_ROOT)
MAP = [
    ("bathroom/bathroom medium shot as found.HEIC", "af-bath-medium.jpg"),
    ("bathroom/bathroom + bathroom floor medium shot as found.HEIC", "af-bath-floor.jpg"),
    ("bathroom/vanity medium shot as found.HEIC", "af-bath-vanity.jpg"),
    ("bathroom/toilet close up shot as found.HEIC", "af-bath-toilet.jpg"),
    ("bathroom/tub close up shot as found.HEIC", "af-bath-tub.jpg"),
    ("bathroom/tub close up shot as found secondary angle.HEIC", "af-bath-tub2.jpg"),
    ("bathroom/towels as found.HEIC", "af-bath-towels.jpg"),
    ("bathroom/baseboard close up shot maintenance flag.HEIC", "flag-baseboard.jpg"),
    ("bathroom/bathroom medium shot post turn.HEIC", "pt-bath-medium.jpg"),
    ("bathroom/bathroom floor medium shot post turn.HEIC", "pt-bath-floor.jpg"),
    ("bathroom/vanity medium shot post turn.HEIC", "pt-bath-vanity.jpg"),
    ("bathroom/toilet close up shot post turn.HEIC", "pt-bath-toilet.jpg"),
    ("bathroom/tub medium shot post turn.HEIC", "pt-bath-tub.jpg"),
    ("bathroom/towels post turn.HEIC", "pt-bath-towels.jpg"),
    ("entry & dining/dining area and entry wide shot as found.HEIC", "af-entry-wide.jpg"),
    ("entry & dining/ dining area medium shot as found.HEIC", "af-dining-medium.jpg"),
    ("entry & dining/dining area and entry wide shot post turn.HEIC", "pt-entry-wide.jpg"),
    ("entry & dining/dining area medium shot post turn.HEIC", "pt-dining-medium.jpg"),
    ("kitchen/kitchen wide shot as found.HEIC", "af-kitchen-wide.jpg"),
    ("kitchen/sink close up as found.HEIC", "af-kitchen-sink.jpg"),
    ("kitchen/stove close up as found.HEIC", "af-kitchen-stove.jpg"),
    ("kitchen/trash can close up as found.HEIC", "af-kitchen-trash.jpg"),
    ("kitchen/kitchen wide shot post turn.HEIC", "pt-kitchen-wide.jpg"),
    ("kitchen/sink close up post turn.HEIC", "pt-kitchen-sink.jpg"),
    ("kitchen/stove close up post turn.HEIC", "pt-kitchen-stove.jpg"),
    ("kitchen/trash can close up post turn.HEIC", "pt-kitchen-trash.jpg"),
    ("living area/living area wide shot as found.HEIC", "af-living-wide.jpg"),
    ("living area/couch close up as found.HEIC", "af-living-couch.jpg"),
    ("living area/living area wide shot post turn.HEIC", "pt-living-wide.jpg"),
    ("living area/couch close up post turn.HEIC", "pt-living-couch.jpg"),
    ("master bedroom/bed medium shot as found.HEIC", "af-bedroom-bed.jpg"),
    ("master bedroom/bed medium shot secondary angle as found.HEIC", "af-bedroom-bed2.jpg"),
    ("master bedroom/bed medium shot post turn.HEIC", "pt-bedroom-bed.jpg"),
    ("miscellaneous/balcony medium shot as found.HEIC", "af-balcony.jpg"),
    ("miscellaneous/balcony medium shot as found secondary angle.HEIC", "af-balcony2.jpg"),
    ("miscellaneous/balcony medium shot post turn.HEIC", "pt-balcony.jpg"),
    ("miscellaneous/balcony medium shot post turn secondary angle.HEIC", "pt-balcony2.jpg"),
    ("miscellaneous/washer & dryer close up shot post turn.HEIC", "pt-restock-laundry.jpg"),
    ("restock & lockup/bathroom consumables close up shot post turn.HEIC", "pt-restock-bath-consumables.jpg"),
    ("restock & lockup/kitchen consumables close up shot post turn.HEIC", "pt-restock-kitchen-consumables.jpg"),
    ("restock & lockup/thermostat set close up post turn.HEIC", "pt-restock-thermostat.jpg"),
    ("restock & lockup/entry way medium shot post turn.HEIC", "pt-restock-entryway.jpg"),
]


def main() -> None:
    done = 0
    with tempfile.TemporaryDirectory() as tmp:
        for rel, dst in MAP:
            src = os.path.join(SRC_ROOT, rel)
            if not os.path.isfile(src):
                print("MISSING:", src)
                continue
            full = os.path.join(tmp, "full.jpg")
            subprocess.run(
                ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "95", src, "--out", full],
                check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            im = Image.open(full)
            im = ImageOps.exif_transpose(im).convert("RGB")  # bake orientation, drop tag
            centering = CENTERING.get(dst, DEFAULT_CENTERING)
            im = ImageOps.fit(im, (OUT_W, OUT_H), method=Image.LANCZOS, centering=centering)
            im.save(os.path.join(DST_ROOT, dst), "JPEG", quality=QUALITY, optimize=True)
            done += 1
    print(f"Processed {done}/{len(MAP)} photos -> {OUT_W}x{OUT_H} 4:3.")


if __name__ == "__main__":
    main()
