import os

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

FHIR_API_URL = os.environ.get("FHIR_API_URL", "http://jpaltime:8080/hapi/fhir")
FHIR_API_AUTH_TOKEN = os.environ.get("FHIR_API_AUTH_TOKEN", "Bearer adminToken")

RIVER_API_URL = os.environ.get("RIVER_API_URL", "http://river-api:8000/api")

KAFKA_HOST = os.environ.get("KAFKA_HOST", "kafka")
KAFKA_PORT = os.environ.get("KAFKA_PORT", "9092")
KAFKA_PROTO = os.environ.get("KAFKA_PROTO", "PLAINTEXT")
KAFKA_LISTENER = os.environ.get("KAFKA_LISTENER") or f"{KAFKA_PROTO}://{KAFKA_HOST}:{KAFKA_PORT}"

REDIS_COUNTER_HOST = os.environ.get("RIVER_REDIS_HOST", "river-redis")
REDIS_COUNTER_PORT = os.environ.get("RIVER_REDIS_PORT", 6379)
REDIS_COUNTER_DB = os.environ.get("REDIS_COUNTER_DB", 2)

BATCH_DURATION_TIMEOUT = float(os.environ.get("BATCH_DURATION_TIMEOUT", "900"))

MAX_RESOURCE_COUNT = int(os.environ.get("MAX_RESOURCE_COUNT", 10000))
