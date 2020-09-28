cm_code = {
    "group": [
        {
            "element": [
                {"code": "ABCcleaned", "target": [{"code": "abc"}]},
                {"code": "DEFcleaned", "target": [{"code": "def"}]},
                {"code": "GHIcleaned", "target": [{"code": "ghi"}]},
            ],
        }
    ],
    "resourceType": "ConceptMap",
    "title": "cm_code",
    "id": "id_cm_code",
}

cm_gender = {
    "group": [
        {
            "element": [
                {"code": "M", "target": [{"code": "male"}]},
                {"code": "F", "target": [{"code": "female"}]},
            ],
        }
    ],
    "resourceType": "ConceptMap",
    "title": "cm_gender",
    "id": "id_cm_gender",
}

cm_identifier = {
    "group": [
        {
            "element": [
                {"code": "1", "target": [{"code": "A"}]},
                {"code": "2", "target": [{"code": "B"}]},
                {"code": "3", "target": [{"code": "C"}]},
            ],
        }
    ],
    "resourceType": "ConceptMap",
    "title": "cm_identifier",
    "id": "id_cm_identifier",
}


def mock_fetch_maps(self, *args):
    if args[0] == "id_cm_code":
        return cm_code
    elif args[0] == "id_cm_gender":
        return cm_gender
    elif args[0] == "id_cm_identifier":
        return cm_identifier
