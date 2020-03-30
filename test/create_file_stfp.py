"""
Create Records Db
"""

import random

with open('sftp/host/upload/data/csv-sftp-source.csv', "w+") as new_csv:
    new_csv.write("andy,corona_{}".format(int(1000 * random.random())))
