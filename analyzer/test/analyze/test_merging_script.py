from unittest import mock

from transformer.src.analyze.merging_script import MergingScript


def test_merging_script_init():
    merging_script = MergingScript("select_first_not_empty")

    assert merging_script.name == "select_first_not_empty"
    assert merging_script.script.__name__ == "select_first_not_empty"


def concat(*values):
    return "_".join(values)


@mock.patch("transformer.src.analyze.merging_script.scripts.get_script", return_value=concat)
def test_merging_script_apply(_):
    merging_script = MergingScript("concat")

    data = ["alice", "a"]
    static_values = ["djadja"]

    merged_col = merging_script.apply(data, static_values, "path", "pk")
    assert merged_col == "alice_a_djadja"
