from common.scripts.cleaning import clean_text_blob


def test_clean_text_blob():
    ### Remove \u0001 & \\f:12152 & \\m0 type
    raw_input1 = "\u0001\u0000,\u0012\u0001\u0000$\u0012\\f:12152\\\rChers Confrère,\rChers Amis,\r\rVotre patiente, \\m1Madame XXX, née le 11/02/1945 (70 ans) \\m0a été hospitée ce matin."
    out_put1 = clean_text_blob(raw_input1)
    assert (
        out_put1
        == """
Chers Confrère,
Chers Amis,

Votre patiente, Madame XXX, née le 11/02/1945 (70 ans) a été hospitée ce matin."""
    )

    ### Remove \\m0 type
    raw_input2 = "\\m3THROMBECTOMIE realisee le\\m0 08/12/2020\r\\m1Operateur :\\m0 Dr XXX\r\r-"
    out_put2 = clean_text_blob(raw_input2)
    assert (
        out_put2
        == """THROMBECTOMIE realisee le 08/12/2020
Operateur : Dr XXX

-"""
    )

    ### Remove \u0001 & \r type
    raw_input3 = "\u0001\u0000P\u0000\u0001\u0000H\u0000\r\r\r*********** voir RS GLOBAL sur courrier suivant ************ Merci\r\r\u0000"
    out_put3 = clean_text_blob(raw_input3)
    assert (
        out_put3
        == """PH


*********** voir RS GLOBAL sur courrier suivant ************ Merci

"""
    )

    ### Remove \\f:12152  & \\m0 type
    raw_input4 = ",$\\f:12152\\\rChers Confrère,\rChers Amis,\r\rVotre patiente, \\m1Madame XXX, née le 11/02/1945 (70 ans) \\m0a été hospitée ce matin."
    out_put4 = clean_text_blob(raw_input4)
    assert (
        out_put4
        == """
Chers Confrère,
Chers Amis,

Votre patiente, Madame XXX, née le 11/02/1945 (70 ans) a été hospitée ce matin."""
    )
