"""Run prompt-based image segmentation with SAM 3."""
import numpy as np
from PIL import Image
from backend import config
from backend.utils.image_utils import load_rgb


class Sam3Error(Exception):
    pass


_cache = {}


def _processor():
    if "p" in _cache:
        return _cache["p"]
    try:
        from sam3.model_builder import build_sam3_image_model
        from sam3.model.sam3_image_processor import Sam3Processor
        _cache["p"] = Sam3Processor(build_sam3_image_model())
    except Exception as e:
        raise Sam3Error(
            f"SAM 3 is not available: {e}. See README 'Installing SAM 3' "
            "(needs CUDA GPU, Python 3.12+, PyTorch 2.7+, and approved Hugging Face checkpoint access)."
        )
    return _cache["p"]


def _to_bool(m) -> np.ndarray:
    m = m.detach().cpu().numpy() if hasattr(m, "detach") else np.asarray(m)
    return np.squeeze(m).astype(bool)


def segment(image_path, prompt: str, job_id: str) -> dict:
    proc = _processor()
    try:
        image = load_rgb(image_path)
        state = proc.set_image(image)
        out = proc.set_text_prompt(state=state, prompt=prompt)
        masks, scores = out["masks"], out["scores"]
        if len(scores) == 0:
            raise Sam3Error(f"SAM 3 found nothing for prompt '{prompt}'. Try a different sam3_prompt in object.json.")
        scores_np = scores.detach().cpu().numpy() if hasattr(scores, "detach") else np.asarray(scores)
        mask = _to_bool(masks[int(np.argmax(scores_np))])
    except Sam3Error:
        raise
    except Exception as e:
        raise Sam3Error(f"SAM 3 inference failed: {e}")

    config.MASK_DIR.mkdir(parents=True, exist_ok=True)
    config.SEG_DIR.mkdir(parents=True, exist_ok=True)
    Image.fromarray((mask * 255).astype("uint8")).save(config.MASK_DIR / f"{job_id}.png")
    rgba = np.dstack([np.array(image), (mask * 255).astype("uint8")])
    Image.fromarray(rgba, "RGBA").save(config.SEG_DIR / f"{job_id}.png")
    return {"mask_url": f"/outputs/masks/{job_id}.png", "segmented_url": f"/outputs/segmented/{job_id}.png",
            "prompt": prompt}
