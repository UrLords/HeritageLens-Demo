"""Manage asynchronous recognition jobs in the Flask process."""
import threading
import uuid

STAGES = ["uploaded", "matching", "identified", "segmenting", "metadata", "model", "complete"]
_jobs, _lock = {}, threading.Lock()


def create() -> str:
    jid = uuid.uuid4().hex[:12]
    with _lock:
        _jobs[jid] = {"job_id": jid, "status": "processing", "stage": "uploaded"}
    return jid


def update(jid, **kw):
    with _lock:
        _jobs[jid].update(kw)


def get(jid):
    with _lock:
        return dict(_jobs[jid]) if jid in _jobs else None


def run_async(fn, *args):
    threading.Thread(target=fn, args=args, daemon=True).start()
