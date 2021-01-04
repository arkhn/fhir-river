import argparse
import json
import logging
from pathlib import Path

import pymongo
import fhirstore

from benchmark import pyrog, river, settings


logging.basicConfig(
    level=logging.DEBUG,
    format="{asctime} [{levelname:>8}] {filename:>15}:{lineno:3d} {message}",
    style="{",
)
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def build_args_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()

    available_sources = [path.name for path in DATA_DIR.iterdir() if path.is_dir()]
    parser.add_argument(
        "--source",
        type=str,
        choices=available_sources,
        help="set the source to extract from",
    )

    return parser


def parse_args():
    parser = build_args_parser()
    return parser.parse_args()


def main():
    args = parse_args()

    pyrog_client = pyrog.PyrogClient(url=settings.PYROG_API_URL)
    mongo_client = pymongo.MongoClient(
        host="mongo",
        port=27017,
        username="arkhn",
        password="5gBwjTYR4DHSbzaUwVNX43DbTn",
    )
    fhirstore_client = fhirstore.FHIRStore(mongo_client, None, "fhirstore")
    river_client = river.APIClient(base_url=settings.RIVER_API_URL)

    with open(DATA_DIR / "concept_maps.json") as f:
        concept_maps = json.load(f)
    with open(DATA_DIR / args.source / "mappings.json") as f:
        mapping = json.load(f)
    with open(DATA_DIR / args.source / "creds.json") as f:
        credentials = json.load(f)

    logger.debug("Uploading concept maps...")
    fhirstore_client.upload_bundle(concept_maps)

    try:
        logger.debug("Creating template...")
        template = pyrog_client.create_template(mapping["template"]["name"])

        logger.debug("Creating source...")
        source = pyrog_client.create_source(
            mapping["source"]["name"],
            mapping["template"]["name"],
            json.dumps(mapping),
        )

        logger.debug("Upserting credentials...")
        pyrog_client.upsert_credentials(source["id"], credentials)

        logger.debug("Fetching resources...")
        resources = pyrog_client.list_resources_by_source(source["id"])

        logger.debug("Sending batch request...")
        river_client.batch(resources)

        import time

        time.sleep(10)

        logger.debug("Batch done.")

    finally:
        pass
#        if source:
#            logger.debug("Deleting source...")
#            pyrog_client.delete_source(source["id"])
#
#        if template:
#            logger.debug("Deleting template...")
#            pyrog_client.delete_template(template["id"])


if __name__ == "__main__":
    main()