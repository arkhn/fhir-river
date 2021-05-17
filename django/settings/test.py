from .prod import *

SECRET_KEY = "USE_IN_TEST_ONLY"

REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"] = ["rest_framework.permissions.AllowAny"]
