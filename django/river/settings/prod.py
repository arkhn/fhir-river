from .base import *

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS") and os.environ.get("ALLOWED_HOSTS").split(",") or []