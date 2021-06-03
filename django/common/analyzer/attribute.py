import logging
from typing import List

from common.normalizers import normalize_to_bool, normalize_to_str

from .input_group import InputGroup

logger = logging.getLogger(__name__)


type_to_normalizer = {
    "integer": int,
    "decimal": float,
    "unsignedInt": int,
    "positiveInt": int,
    "boolean": normalize_to_bool,
}


class Attribute:
    def __init__(
        self,
        path,
        definition_id: str = None,
        input_groups: List[InputGroup] = None,
    ):
        self.path = path
        self.input_groups = input_groups or []
        self.type = definition_id
        self.normalizer = type_to_normalizer.get(definition_id, normalize_to_str)

    def __eq__(self, other):
        if not isinstance(other, Attribute):
            return False
        return self.path == other.path and self.input_groups == other.input_groups

    def __str__(self):
        return f"path: {self.path}, groups: {self.input_groups}"

    def __hash__(self):
        return hash("{self.path}{self.input_groups}")

    def add_input_group(self, new_group):
        self.input_groups.append(new_group)

    def cast_type(self, value):
        if value is None:
            return None

        try:
            return self.normalizer(value)
        except Exception as e:
            logger.warning(
                f"Could not cast value {value} to type {self.type} on attribute at path = {self.path}): {e}"
            )

        return value
