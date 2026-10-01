import json
from backend import config


class MetadataError(Exception):
    pass


def get_object(object_id: str) -> dict:
    p = config.DATA_DIR / object_id / "object.json"
    if not p.is_file():
        raise MetadataError(f"Missing metadata for {object_id} ({p})")
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise MetadataError(f"Invalid JSON in {p}: {e}")


def list_objects() -> list:
    out = []
    for d in sorted(config.DATA_DIR.glob("object-*")):
        try:
            out.append(get_object(d.name))
        except MetadataError:
            pass
    return out
