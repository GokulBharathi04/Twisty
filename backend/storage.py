import os
import logging
from pathlib import Path

import requests

logger = logging.getLogger(__name__)

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "twisty-wrap"
storage_key = None


LOCAL_DIR = Path(__file__).parent / "uploads"  # used when no Emergent key is set (local dev)


def init_storage(force: bool = False):
    global storage_key
    if not EMERGENT_KEY:
        LOCAL_DIR.mkdir(exist_ok=True)
        return None
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    if not EMERGENT_KEY:
        dest = LOCAL_DIR / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return {"path": str(dest)}
    for attempt in range(2):
        key = init_storage(force=attempt == 1)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
        if resp.status_code == 404 and attempt == 0:
            continue
        resp.raise_for_status()
        return resp.json()
