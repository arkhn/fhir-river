from river.adapters.scripts_repository import MemoryScriptsRepository


def test_memory_scripts_repository():
    repo = MemoryScriptsRepository()
    print(repo.scripts.keys())
    assert repo.get("clean_date") is not None
    print(repo.get("clean_date"))
    assert 1 == 0
