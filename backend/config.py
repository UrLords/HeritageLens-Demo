import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
except ImportError:
    pass

DATA_DIR = ROOT / "data" / "objects"
EMB_DIR = ROOT / "data" / "embeddings"
MASK_DIR = ROOT / "outputs" / "masks"
SEG_DIR = ROOT / "outputs" / "segmented"
UPLOAD_DIR = ROOT / "outputs" / "uploads"

EXPECTED_OBJECTS = 5
MATCH_THRESHOLD = float(os.getenv("MATCH_THRESHOLD", "0.65"))
MATCH_MARGIN = float(os.getenv("MATCH_MARGIN", "0.05"))
EMBEDDING_BACKEND = os.getenv("EMBEDDING_BACKEND", "clip")
DINOV3_MODEL = os.getenv("DINOV3_MODEL", "facebook/dinov3-vits16-pretrain-lvd1689m")
CLIP_MODEL = os.getenv("CLIP_MODEL", "openai/clip-vit-base-patch32")
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}
IMG_EXT = ALLOWED_EXT
