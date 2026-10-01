"""Generate normalized image embeddings with the configured model."""
import numpy as np
from backend import config


class EmbeddingError(Exception):
    pass


_cache = {}


def _load():
    if "m" in _cache:
        return _cache["m"]
    try:
        import torch
        from transformers import AutoImageProcessor, AutoModel, CLIPModel, CLIPProcessor
        dev = "cuda" if torch.cuda.is_available() else "cpu"
        if config.EMBEDDING_BACKEND == "clip":
            proc = CLIPProcessor.from_pretrained(config.CLIP_MODEL)
            model = CLIPModel.from_pretrained(config.CLIP_MODEL)
        else:
            proc = AutoImageProcessor.from_pretrained(config.DINOV3_MODEL)
            model = AutoModel.from_pretrained(config.DINOV3_MODEL)
        _cache["m"] = (proc, model.to(dev).eval(), dev)
    except Exception as e:
        raise EmbeddingError(
            f"Could not load embedding model '{config.EMBEDDING_BACKEND}': {e}. "
            "DINOv3 weights are gated on Hugging Face (request access + `hf auth login`); "
            "or set EMBEDDING_BACKEND=clip in .env."
        )
    return _cache["m"]


def embed_image(img) -> np.ndarray:
    proc, model, dev = _load()
    import torch
    try:
        with torch.no_grad():
            if config.EMBEDDING_BACKEND == "clip":
                inp = proc(images=img, return_tensors="pt").to(dev)
                vision = model.vision_model(pixel_values=inp["pixel_values"], return_dict=True)
                v = model.visual_projection(vision.pooler_output)
            else:
                inp = proc(images=img, return_tensors="pt").to(dev)
                v = model(**inp).pooler_output
        v = v[0].float().cpu().numpy()
        if v.ndim != 1:
            raise ValueError(f"Expected one feature vector, got shape {v.shape}")
    except Exception as e:
        raise EmbeddingError(f"Embedding failed: {e}")
    return v / (np.linalg.norm(v) + 1e-12)
