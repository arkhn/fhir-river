import glob
import os
import sys

import confluent_kafka


def main(folder_path):
    config = {
        "bootstrap.servers": "localhost:9092",
        "linger.ms": 0.5,
        "session.timeout.ms": 6000,
    }
    producer = confluent_kafka.Producer(config)
    for file_ in glob.glob(os.path.join(folder_path, "*")):
        if "SupplyDelivery" in file_:
            print(file_)
            with open(file_) as f:
                lines = f.readlines()
                for resource in lines:
                    producer.produce(topic="load", value=resource)
                    producer.poll(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise Exception("usage: python producer.py <folder>")
    main(sys.argv[1])
