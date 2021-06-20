from river.common.analyzer import Analyzer
from river.parsing import Source, as_old_mapping


def test_mappings_from_exported_json(load_mapping_fixture):
    source = load_mapping_fixture("mimic_new_mapping_format.json")

    assert Source(**source)


def test_as_old_mapping(load_mapping_fixture):
    source_data = load_mapping_fixture("mimic_new_mapping_format.json")
    source = Source(**source_data)

    old_mapping_data = as_old_mapping(source, source.resources[0].id)
    analyzer = Analyzer()
    analyzer.analyze(old_mapping_data)
