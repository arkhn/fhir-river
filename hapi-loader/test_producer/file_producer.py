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
            abs_path = os.path.abspath(file_)
            producer.produce(topic="load", value=abs_path)
            producer.poll(1)
            print(abs_path)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise Exception("usage: python producer.py <folder>")
    main(sys.argv[1])
