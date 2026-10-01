"""Generate image embeddings for registered object references."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
from backend import config
from backend.services import embedding_service as emb
from backend.utils.image_utils import InvalidImage, load_rgb, list_refs
from scripts.validate_dataset import validate

errors = validate()
if errors:
    print("Dataset is not ready for embedding generation:")
    for error in errors:
        print(f"  - {error}")
    print("Fix the dataset issues, then run this script again.")
    sys.exit(1)

config.EMB_DIR.mkdir(parents=True, exist_ok=True)
built = 0
for d in sorted(config.DATA_DIR.glob("object-*")):
    refs = list_refs(d / "refs", config.IMG_EXT)
    vecs = []
    for r in refs:
        try:
            vecs.append(emb.embed_image(load_rgb(r)))
        except InvalidImage as e:
            print(f"[WARN] {e}")
    if vecs:
        np.save(config.EMB_DIR / f"{d.name}.npy", np.stack(vecs))
        print(f"[OK]   {d.name}: {len(vecs)} reference embedding(s)")
        built += 1

if built != config.EXPECTED_OBJECTS:
    print(f"[ERROR] Built embeddings for {built} of {config.EXPECTED_OBJECTS} objects.")
    sys.exit(1)
print(f"Done. {built} object(s) embedded ({config.EMBEDDING_BACKEND}).")
