import os

RIVER_API_HOST = os.environ.get("RIVER_API_HOST", "api")
RIVER_API_PORT = int(os.environ.get("RIVER_API_HOST", 3000))
RIVER_API_URL = f"http://{RIVER_API_HOST}:{RIVER_API_PORT}"

PYROG_API_HOST = os.environ.get("PYROG_API_HOST", "pyrog-server")
PYROG_API_PORT = int(os.environ.get("PYROG_API_HOST", 1000))
PYROG_API_URL = f"http://{PYROG_API_HOST}:{PYROG_API_PORT}"
