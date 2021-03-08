import glob
import json
import os
import sys

import confluent_kafka


def main(folder_path):
    config = {
        "bootstrap.servers": "localhost:9092",
        "linger.ms": 0.5,
    }
    producer = confluent_kafka.Producer(config)
    for file_ in glob.glob(os.path.join(folder_path, "*")):
        if "SupplyDelivery" in file_:
            print(file_)
            with open(file_) as f:
                lines = f.readlines()
                for resource in lines:
                    event = {
                        "fhir_object": resource,
                        "batch_id": "batchId",
                        "resource_id": "rid",
                    }
                    producer.produce(topic="transform.batchId", value=json.JSONEncoder().encode(event))
                    producer.poll(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise Exception("usage: python producer.py <folder>")
    main(sys.argv[1])
