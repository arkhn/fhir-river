import datetime
import decimal
import json


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            # Convert decimal instances to strings without trailing 0
            return float(obj)
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        if isinstance(obj, bytes):
            # FIXME: this should be done differently, issue #376
            # Python doesn't know how to serialize bytes
            # We arbitrarily choose utf-8. Note that if we need to decode bytes another
            # way, we'll need to use a cleaning script that basically does
            # val.encode("utf-8").decode("<your-encoding>")
            return obj.decode("utf-8")
        return super().default(obj)
