from common.scripts.cleaning import clean_codes


def test_clean_codes():
    raw_input_1 = "HL7:M"
    output_1 = clean_codes(raw_input_1)
    assert output_1 == "M"

    raw_input_2 = "HL7 :M"
    output_2 = clean_codes(raw_input_2)
    assert output_2 == "M"

    raw_input_3 = "ICD-O-3:testing"
    output_3 = clean_codes(raw_input_3)
    assert output_3 == "testing"

    raw_input_4 = "ThisIsATest"
    output_4 = clean_codes(raw_input_4)
    assert output_4 == "ThisIsATest"

    raw_input_5 = "UnvalidCode:KeepCode"
    output_5 = clean_codes(raw_input_5)
    assert output_5 == "UnvalidCode:KeepCode"

    raw_input_6 = "OSIRIS:OsirisCode"
    output_6 = clean_codes(raw_input_6)
    assert output_6 == "OsirisCode"

    raw_input_7 = "OSIRIS     :    OsirisCode"
    output_7 = clean_codes(raw_input_7)
    assert output_7 == "OsirisCode"

    raw_input_8 = "RECIST     :    RECISTCODE"
    output_8 = clean_codes(raw_input_8)
    assert output_8 == "RECISTCODE"
