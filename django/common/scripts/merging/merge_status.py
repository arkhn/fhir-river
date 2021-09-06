from common.scripts.utils import is_empty


def merge_status(*args):
    """Merge two binary entries and return a FHIR CarePlan.status"""
    for inact, val in args:
        if is_empty(val) or is_empty(inact):
            return "unknown"
        if inact == 1:
            return "revoked"
        else:
            if val == 1:
                return "active"
            if val == 0:
                return "on hold"
