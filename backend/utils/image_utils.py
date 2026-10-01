from pathlib import Path
from PIL import Image, UnidentifiedImageError


class InvalidImage(Exception):
    pass


def load_rgb(path) -> Image.Image:
    try:
        with Image.open(path) as im:
            im.load()
            return im.convert("RGB")
    except (UnidentifiedImageError, OSError) as e:
        raise InvalidImage(f"Cannot read image {Path(path).name}: {e}")


def list_refs(refs_dir: Path, exts) -> list:
    if not refs_dir.is_dir():
        return []
    return sorted(p for p in refs_dir.iterdir() if p.suffix.lower() in exts)
