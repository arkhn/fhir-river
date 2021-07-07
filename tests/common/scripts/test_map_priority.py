from common.scripts import map_priority


def test_map_priority():

    raw_input_1 = "0"
    output_1 = map_priority(raw_input_1)
    assert output_1 == "stat"

    raw_input_2 = 0
    output_2 = map_priority(raw_input_2)
    assert output_2 == "stat"

    raw_input_3 = "1"
    output_3 = map_priority(raw_input_3)
    assert output_3 == "asap"

    raw_input_4 = 1
    output_4 = map_priority(raw_input_4)
    assert output_4 == "asap"

    raw_input_5 = "2"
    output_5 = map_priority(raw_input_5)
    assert output_5 == "urgent"

    raw_input_6 = 2
    output_6 = map_priority(raw_input_6)
    assert output_6 == "urgent"

    raw_input_7 = "50"
    output_7 = map_priority(raw_input_7)
    assert output_7 == "routine"

    raw_input_8 = 50
    output_8 = map_priority(raw_input_8)
    assert output_8 == "routine"

    raw_input_9 = "-1"
    output_9 = map_priority(raw_input_9)
    assert output_9 == "routine"

    raw_input_10 = -1
    output_10 = map_priority(raw_input_10)
    assert output_10 == "routine"
