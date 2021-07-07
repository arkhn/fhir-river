from common.scripts.clean_quantity import clean_quantity


def test_clean_quantity():

    raw_input_1 = "150"
    output_1 = clean_quantity(raw_input_1)
    assert output_1 == 150

    raw_input_2 = "150.005"
    output_2 = clean_quantity(raw_input_2)
    assert output_2 == 150.005

    raw_input_4 = 150
    output_4 = clean_quantity(raw_input_4)
    assert output_4 == 150

    raw_input_5 = 150.005
    output_5 = clean_quantity(raw_input_5)
    assert output_5 == 150.005

    raw_input_6 = "-150"
    output_6 = clean_quantity(raw_input_6)
    assert output_6 == -150

    raw_input_7 = "-150.005"
    output_7 = clean_quantity(raw_input_7)
    assert output_7 == -150.005

    raw_input_9 = -150
    output_9 = clean_quantity(raw_input_9)
    assert output_9 == -150

    raw_input_10 = -150.005
    output_10 = clean_quantity(raw_input_10)
    assert output_10 == -150.005
