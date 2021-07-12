from common.scripts import Script
from common.scripts.merging import select_first_not_empty
from river.common.analyzer.merging_script import MergingScript


def test_merging_script_init():
    script = Script(name="select_first_not_empty", func=select_first_not_empty, description=None, category="merging")
    merging_script = MergingScript(script)

    assert merging_script.script.name == "select_first_not_empty"
    assert merging_script.script.func.__name__ == "select_first_not_empty"


def concat(*values):
    return "_".join(values)


def test_merging_script_apply():
    script = Script(name="concat", func=concat, description=None, category="merging")
    merging_script = MergingScript(script)

    data = ["alice", "a"]
    static_values = ["djadja"]

    merged_col = merging_script.apply(data, static_values, "path", "pk")
    assert merged_col == "alice_a_djadja"
