import datetime
import decimal
import json
import logging

import chardet

logger = logging.getLogger("utils.CustomJSONEncoder")


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            # Convert decimal instances to strings without trailing 0
            return float(obj)
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        if isinstance(obj, bytes):
            # FIXME: this should be done differently, issue #376
            # Python doesn't know how to serialize bytes so we use chardet to find the
            # right encoding.
            # Note that if we need to decode bytes another
            # way, we'll need to use a cleaning script that basically does
            # val.encode("<detected-encoding>").decode("<your-encoding>")
            detected_encoding = chardet.detect(obj)["encoding"]
            logger.debug(f"Detected encoding {detected_encoding} for {obj}")
            try:
                return obj.decode(detected_encoding)
            except UnicodeDecodeError:
                return obj.decode("latin-1")
        return super().default(obj)
