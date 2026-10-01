import os
import sys
from pathlib import Path

os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from flask import Flask, jsonify, request, send_from_directory
from backend import config
from backend.services import (embedding_service as emb, job_service as jobs,
                              metadata_service as meta, recognition_service as rec, sam3_service as sam)
from backend.utils.image_utils import InvalidImage, load_rgb

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = config.MAX_UPLOAD_BYTES
try:
    from flask_cors import CORS
    CORS(app)
except ImportError:
    pass


def _fail(jid, msg, kind="error"):
    jobs.update(jid, status="error", error=msg, error_type=kind)


def pipeline(jid, path):
    try:
        jobs.update(jid, stage="matching")
        result = rec.recognize(emb.embed_image(load_rgb(path)))
        if not result["recognized"]:
            return jobs.update(jid, status="done", result={
                "status": "unknown", "top_score": result["top_score"],
                "second_score": result["second_score"], "threshold": result["threshold"],
                "margin": result["margin"]})
        oid = result["object_id"]
        md = meta.get_object(oid)
        jobs.update(jid, stage="identified")
        jobs.update(jid, stage="segmenting")
        segmentation_warning = None
        try:
            seg = sam.segment(path, md.get("sam3_prompt") or md.get("name", "object"), jid)
        except sam.Sam3Error as e:
            seg = None
            segmentation_warning = str(e)
        jobs.update(jid, stage="metadata")
        jobs.update(jid, stage="model")
        jobs.update(jid, stage="complete", status="done", result={
            "status": "recognized",
            "object": {"id": oid, "name": md.get("name"), "score": result["top_score"]},
            "segmentation": seg, "segmentation_warning": segmentation_warning, "metadata": md, "model": md.get("model")})
    except rec.MissingEmbeddings as e:
        _fail(jid, str(e), "setup")
    except (emb.EmbeddingError, sam.Sam3Error) as e:
        _fail(jid, str(e), "model")
    except (InvalidImage, meta.MetadataError) as e:
        _fail(jid, str(e), "data")
    except Exception as e:
        _fail(jid, f"Unexpected error: {e}")


@app.get("/api/health")
def health():
    return {"status": "ok", "embedding_backend": config.EMBEDDING_BACKEND,
            "threshold": config.MATCH_THRESHOLD, "margin": config.MATCH_MARGIN}


@app.get("/api/objects")
def objects():
    return jsonify([{"id": o["id"], "name": o.get("name")} for o in meta.list_objects()])


@app.get("/api/objects/<oid>")
def one_object(oid):
    try:
        return jsonify(meta.get_object(oid))
    except meta.MetadataError as e:
        return jsonify({"error": str(e)}), 404


@app.post("/api/analyze")
def analyze():
    files = request.files.getlist("image")
    if len(files) != 1:
        return jsonify({"error": "Upload exactly one image (field name: image)."}), 400
    f = files[0]
    ext = Path(f.filename or "").suffix.lower()
    if ext not in config.ALLOWED_EXT:
        return jsonify({"error": "Unsupported file type. Use JPG, JPEG, PNG or WEBP."}), 400
    jid = jobs.create()
    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    path = config.UPLOAD_DIR / f"{jid}{ext}"
    f.save(path)
    try:
        load_rgb(path)
    except InvalidImage:
        path.unlink(missing_ok=True)
        return jsonify({"error": "That file could not be read as an image."}), 400
    jobs.run_async(pipeline, jid, path)
    return jsonify({"job_id": jid, "status": "processing"})


@app.get("/api/results/<jid>")
def results(jid):
    j = jobs.get(jid)
    return (jsonify(j), 200) if j else (jsonify({"error": "Unknown job."}), 404)


@app.get("/outputs/<path:p>")
def outputs(p):
    return send_from_directory(config.ROOT / "outputs", p)


@app.errorhandler(413)
def too_large(_):
    return jsonify({"error": "Image too large (max 10 MB)."}), 413


if __name__ == "__main__":
    app.run(port=5000, debug=False)
