import decimal
import flask


class MyJSONEncoder(flask.json.JSONEncoder):
    """
    We make our JSONEncoder to override the default method.
    Decimal values are not handled by Flask's JSONEncoder so
    we turn them to strings.
    This doesn't cause any type problem because the transformer will turn
    them back to numerical values if needed (depending on the FHIR element type).
    """
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            # Convert decimal instances to strings
            # If the decimal reprensents an integer, we want to avoid a trailing ".0"
            nearest_int = obj.to_integral_exact()
            if nearest_int == obj:
                return str(nearest_int)
            return str(obj)
        return super(MyJSONEncoder, self).default(obj)
