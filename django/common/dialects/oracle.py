from sqlalchemy import BLOB
from sqlalchemy.dialects.oracle.base import ischema_names


def register_custom_types():
    """
    This is a *very* hacky way to define custom types in the Oracle sqlAlchemy dialect.
    The following changelog entry https://tinyurl.com/3wh98dlr
    says that the `ischema_names` dict is "unofficially customizable" (good enough).
    When using a reflection, there does not seem to be a "proper" way of doing so.
    cf. https://tinyurl.com/qwbegi7t
    """
    ischema_names["LONG RAW"] = BLOB
