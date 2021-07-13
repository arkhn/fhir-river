from common.scripts.cleaning import clean_time


def test_clean_time():
    # HH:MM:SS
    assert clean_time("20:15:00") == "20:15:00"

    # HH:MM:SS.f
    assert clean_time("20:15:00.003") == "20:15:00"

    # YYYYMMDDHHMMSS
    assert clean_time("20150207174003") == "17:40:03"

    # YYYYMMDDHHMM
    assert clean_time("201502071740") == "17:40:00"

    # YYYY-MM-DD H:M:S
    assert clean_time("2015-02-07 13:28:17") == "13:28:17"

    # YYYY-MM-DDTH:M:S
    assert clean_time("2015-02-07T13:28:17") == "13:28:17"

    # YYYY-MM-DDTH:M:S+zz:zz
    assert clean_time("2015-02-07T13:28:17+05:00") == "13:28:17"

    # YYYY-MM-DDTH:M:S-zz:zz
    assert clean_time("2015-02-07T13:28:17-05:00") == "13:28:17"

    # RFC 1123
    assert clean_time("Wed, 13 Mar 2075 13:28:17 GMT") == "13:28:17"

    # Handle H:M:S+zz:zz
    assert clean_time("13:28:17-05:00") == "13:28:17"

    # HH::MM::SS
    assert clean_time("20::15::02") == "20:15:02"

    # HH MM SS
    assert clean_time("20 15 02") == "20:15:02"

    # HHMMSS
    assert clean_time("201502") == "20:15:02"

    # HHMM
    assert clean_time("2015") == "20:15:00"

    # YYYYMMDD
    assert clean_time("20150207") == "00:00:00"

    # YYYY-MM-DD
    assert clean_time("2015-02-07") == "00:00:00"
