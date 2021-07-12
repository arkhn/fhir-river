from common.scripts.cleaning import clean_date


def test_clean_date():

    # YYYY
    raw_input_1 = "2015"
    output_1 = clean_date(raw_input_1)
    assert output_1 == "2015-01-01"

    # YYYY-MM
    raw_input_2 = "2015-02"
    output_2 = clean_date(raw_input_2)
    assert output_2 == "2015-02-01"

    # YYYYMM
    raw_input_3 = "201502"
    output_3 = clean_date(raw_input_3)
    assert output_3 == "2015-02-01"

    # YYYY-MM-DD
    raw_input_4 = "2015-02-07"
    output_4 = clean_date(raw_input_4)
    assert output_4 == "2015-02-07"

    # YYYYMMDD
    raw_input_5 = "20150207"
    output_5 = clean_date(raw_input_5)
    assert output_5 == "2015-02-07"

    # YYYY-MM-DD H:M:S
    raw_input_6 = "2015-02-07 13:28:17"
    output_6 = clean_date(raw_input_6)
    assert output_6 == "2015-02-07"

    # YYYY-MM-DDTH:M:S
    raw_input_7 = "2015-02-07T13:28:17"
    output_7 = clean_date(raw_input_7)
    assert output_7 == "2015-02-07"

    # YYYY-MM-DDTH:M:S+zzzz
    raw_input_8 = "2015-02-07T13:28:17+0500"
    output_8 = clean_date(raw_input_8)
    assert output_8 == "2015-02-07"

    # YYYY-MM-DDTH:M:S-zz:zz
    raw_input_9 = "2015-02-07T13:28:17-0500"
    output_9 = clean_date(raw_input_9)
    assert output_9 == "2015-02-07"

    # RFC 1123
    raw_input_10 = "Wed, 13 Mar 2075 00:00:00 GMT"
    output_10 = clean_date(raw_input_10)
    assert output_10 == "2075-03-13"

    # YYYYMMDDHHMM
    raw_input_11 = "201502071740"
    output_11 = clean_date(raw_input_11)
    assert output_11 == "2015-02-07"

    # YYYY-MM-DDTH:M:S+zz:zz
    raw_input_12 = "2015-02-07T13:28:17+05:00"
    output_12 = clean_date(raw_input_12)
    assert output_12 == "2015-02-07"
