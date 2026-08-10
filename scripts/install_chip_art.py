#!/usr/bin/env python3
"""Install generated onboarding chip artwork into assets/images/chips.

Clamps near-black studio haze to pure #000 so subjects disappear into the
black ChipSelect cards (reads as a cut-out without shipping alpha PNGs).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

SRC_DIR = Path(
    "/home/fitsum/.cursor/projects/home-fitsum-Desktop-Dev-FitnessApp/assets"
)
CHIPS_DIR = Path(__file__).resolve().parent.parent / "assets" / "images" / "chips"

BLACK_FLOOR = 26
MAX_SIZE = (900, 1350)
JPEG_QUALITY = 88

EXTRA_SOURCES: dict[str, Path] = {
    "cutout2-male-bulk.png": CHIPS_DIR / "male" / "goal-bulk.jpg",
    "cutout2-female-bulk.png": CHIPS_DIR / "female" / "goal-bulk.jpg",
}


def dest_for(stem: str) -> Path | None:
    """Map cut-<gender>-<slot> / cut-shared-<slot> stems to chip paths."""
    if stem.startswith("cut-shared-"):
        slot = stem[len("cut-shared-") :]
        if slot.startswith("equip-"):
            return CHIPS_DIR / "shared" / f"{slot}.jpg"
        if slot.startswith("issue-"):
            return CHIPS_DIR / f"{slot}.jpg"
        if slot.startswith("injury-"):
            return CHIPS_DIR / "shared" / f"{slot}.jpg"
        return CHIPS_DIR / "shared" / f"{slot}.jpg"

    parts = stem.split("-", 2)  # cut, gender, slot...
    if len(parts) != 3 or parts[0] != "cut":
        return None
    _, gender, slot = parts
    if gender not in ("male", "female"):
        return None
    return CHIPS_DIR / gender / f"{slot}.jpg"


def flatten_backdrop(im: Image.Image) -> Image.Image:
    im = im.convert("RGB")
    floor = BLACK_FLOOR
    out = [
        (0, 0, 0) if r < floor and g < floor and b < floor else (r, g, b)
        for r, g, b in im.getdata()
    ]
    im.putdata(out)
    return im


def write_jpg(src: Path, dest: Path) -> None:
    im = flatten_backdrop(Image.open(src))
    im.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    jobs: list[tuple[Path, Path]] = []

    for name, dest in EXTRA_SOURCES.items():
        src = SRC_DIR / name
        if src.exists():
            jobs.append((src, dest))

    for src in sorted(SRC_DIR.glob("cut-*.png")):
        dest = dest_for(src.stem)
        if dest is None:
            print("skip (unmapped):", src.name)
            continue
        jobs.append((src, dest))

    if not jobs:
        print("no generated sources found in", SRC_DIR)
        return 1

    installed = 0
    for src, dest in jobs:
        rel = dest.relative_to(CHIPS_DIR)
        if args.dry_run:
            print(f"would write {rel} <- {src.name}")
            continue
        write_jpg(src, dest)
        installed += 1
        print(f"{rel} <- {src.name} ({dest.stat().st_size}b)")

    print("installed", installed)
    return 0


if __name__ == "__main__":
    sys.exit(main())
