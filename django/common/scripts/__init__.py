import importlib


def get_script(name: str):
    try:
        module = importlib.import_module(f"common.scripts.{name}")
        return getattr(module, name)
    except AttributeError:
        raise NameError("Script", name, "not found.")
