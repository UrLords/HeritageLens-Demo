"""Validate object metadata and reference images."""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend import config
from backend.utils.image_utils import InvalidImage, load_rgb, list_refs

REQ = ["id", "name", "description", "history", "cultural_meaning"]
MODEL_REQ = ["provider", "creator", "url", "license", "license_url"]


def is_todo(v):
    return not v or (isinstance(v, str) and v.strip().upper().startswith("TODO"))


def validate(data_dir=config.DATA_DIR):
    errors = []
    dirs = sorted(data_dir.glob("object-*"))
    if len(dirs) != config.EXPECTED_OBJECTS:
        errors.append(f"Expected {config.EXPECTED_OBJECTS} objects, found {len(dirs)}")
    for d in dirs:
        e = lambda m: errors.append(f"{d.name}: {m}")
        refs = list_refs(d / "refs", config.IMG_EXT)
        if not 1 <= len(refs) <= 5:
            e(f"needs 1-5 reference images, found {len(refs)}")
        for r in refs:
            try:
                load_rgb(r)
            except InvalidImage:
                e(f"unreadable image {r.name}")
        p = d / "object.json"
        if not p.is_file():
            e("missing object.json")
            continue
        try:
            md = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as ex:
            e(f"invalid JSON: {ex}")
            continue
        for k in REQ:
            if is_todo(md.get(k)):
                e(f"metadata '{k}' missing/TODO")
        m = md.get("model") or {}
        for k in MODEL_REQ:
            if is_todo(m.get(k)):
                e(f"model.{k} missing/TODO")
        srcs = md.get("sources") or []
        if not srcs or any(is_todo(s.get("url")) for s in srcs):
            e("sources missing/TODO")
    return errors


if __name__ == "__main__":
    errs = validate()
    print("HeritageLens dataset report\n" + "=" * 27)
    print("\n".join(f"  ✗ {x}" for x in errs) if errs else "  ✓ All checks passed")
    sys.exit(1 if errs else 0)
