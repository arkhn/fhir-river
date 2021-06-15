from river.common.analyzer.concept_map import ConceptMap


def test_concept_map_apply(dict_map_gender):
    concept_map = ConceptMap(dict_map_gender, "id_cm_gender")

    data = ["M", "F", "M", "F"]

    mapped_col = concept_map.apply(data, "PATIENTS.GENDER", "pk")

    assert mapped_col == ["male", "female", "male", "female"]
