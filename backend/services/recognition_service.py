"""Compare image embeddings against the registered object references."""
import numpy as np
from backend import config


class MissingEmbeddings(Exception):
    pass


def load_reference_embeddings() -> dict:
    files = sorted(config.EMB_DIR.glob("object-*.npy"))
    if not files:
        raise MissingEmbeddings(
            "No reference embeddings found. Run: python scripts/build_embeddings.py"
        )
    refs = {f.stem: np.load(f) for f in files}
    malformed = [f"{oid}: {matrix.shape}" for oid, matrix in refs.items() if matrix.ndim != 2]
    if malformed:
        details = ", ".join(malformed)
        raise MissingEmbeddings(
            f"Reference embeddings have invalid shapes ({details}). Rebuild them with: python scripts/build_embeddings.py"
        )
    return refs


def score_objects(query: np.ndarray, refs: dict) -> dict:
    """Best cosine similarity per object (vectors are already normalised)."""
    query = np.asarray(query).reshape(-1)
    for oid, matrix in refs.items():
        if matrix.ndim != 2 or matrix.shape[1] != query.shape[0]:
            raise MissingEmbeddings(
                f"Embedding size mismatch for {oid}: references have shape {matrix.shape}, "
                f"query has {query.shape[0]} values. Rebuild embeddings using the current backend."
            )
    return {oid: float(np.max(m @ query)) for oid, m in refs.items() if len(m)}


def decide(scores: dict, threshold=None, margin=None) -> dict:
    threshold = config.MATCH_THRESHOLD if threshold is None else threshold
    margin = config.MATCH_MARGIN if margin is None else margin
    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    top_id, top = ranked[0]
    second = ranked[1][1] if len(ranked) > 1 else 0.0
    ok = top >= threshold and (top - second) >= margin
    return {"recognized": ok, "object_id": top_id if ok else None,
            "top_score": top, "second_score": second, "threshold": threshold, "margin": margin}


def recognize(query: np.ndarray) -> dict:
    return decide(score_objects(query, load_reference_embeddings()))
