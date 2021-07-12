from common.scripts import MergingScript
from common.scripts.merging import select_first_not_empty


def test_merging_script_init():
    merging_script = MergingScript(
        name="select_first_not_empty", func=select_first_not_empty, description=None, category="merging"
    )

    assert merging_script.name == "select_first_not_empty"
    assert merging_script.func.__name__ == "select_first_not_empty"


def concat(*values):
    return "_".join(values)


def test_merging_script_apply():
    merging_script = MergingScript(name="concat", func=concat, description=None, category="merging")

    data = ["alice", "a"]
    static_values = ["djadja"]

    merged_col = merging_script.apply(data, static_values, "path", "pk")
    assert merged_col == "alice_a_djadja"
