import pytest

from common.scripts import ScriptNotFound, ScriptsRepository


def test_scripts_repository():
    repo = ScriptsRepository()
    assert "string_to_bool" in repo.scripts
    string_to_bool = repo.get("string_to_bool")
    assert string_to_bool.name == "string_to_bool"
    assert string_to_bool.description == """Convert ("True","true","TRUE") to (True).."""
    assert string_to_bool.category == "cleaning"
    assert string_to_bool.func("true") is True

    with pytest.raises(ScriptNotFound, match="Script notfound not found."):
        repo.get("notfound")
