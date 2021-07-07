import pytest

from river.adapters.scripts_repository import MemoryScriptsRepository


def test_memory_scripts_repository():
    repo = MemoryScriptsRepository()
    assert "string_to_bool" in repo.scripts
    string_to_bool = repo.get("string_to_bool")
    assert string_to_bool.name == "string_to_bool"
    assert string_to_bool.description == """Convert ("True","true","TRUE") to (True).."""
    assert string_to_bool.func("true") is True

    with pytest.raises(NameError, match="Script notfound not found."):
        repo.get("notfound")
