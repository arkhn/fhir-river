from common.scripts.cleaning import clean_long_text_ORBIS


def test_clean_long_text_ORBIS():
    ### Remove \u0001 & \\f:12152 & \\m0 type
    raw_input1 = "\u0001\u0000,\u0012\u0001\u0000$\u0012\\f:12152\\\rChers Confrère,\rChers Amis,\r\rVotre patiente, \\m1Madame XXX, née le 11/02/1945 (70 ans) \\m0a été hospitée ce matin."
    out_put1 = clean_long_text_ORBIS(raw_input1)
    assert (
        out_put1
        == """
Chers Confrère,
Chers Amis,

Votre patiente, Madame XXX, née le 11/02/1945 (70 ans) a été hospitée ce matin."""
    )

    ### Remove \\m0 type
    raw_input2 = "\\m3THROMBECTOMIE realisee le\\m0 08/12/2020\r\\m1Operateur :\\m0 Dr XXX\r\r-"
    out_put2 = clean_long_text_ORBIS(raw_input2)
    assert (
        out_put2
        == """THROMBECTOMIE realisee le 08/12/2020
Operateur : Dr XXX

-"""
    )

    ### Remove \u0001 & \r type
    raw_input3 = "\u0001\u0000P\u0000\u0001\u0000H\u0000\r\r\r*********** voir RS GLOBAL sur courrier suivant ************ Merci\r\r\u0000"
    out_put3 = clean_long_text_ORBIS(raw_input3)
    assert (
        out_put3
        == """PH


*********** voir RS GLOBAL sur courrier suivant ************ Merci

"""
    )

    ### Remove \\f:12152  & \\m0 type
    raw_input4 = ",$\\f:12152\\\rChers Confrère,\rChers Amis,\r\rVotre patiente, \\m1Madame XXX, née le 11/02/1945 (70 ans) \\m0a été hospitée ce matin."
    out_put4 = clean_long_text_ORBIS(raw_input4)
    assert (
        out_put4
        == """
Chers Confrère,
Chers Amis,

Votre patiente, Madame XXX, née le 11/02/1945 (70 ans) a été hospitée ce matin."""
    )

    ### Remove special caracters in Thrombectomie report
    raw_input5 = "\u0001\u0000f\u0003\u0001\u0000^\u0003\\m3THROMBECTOMIE réalisée le\\m0 08/12/2020\r\\m1Opérateur :\\m0 Dr"
    out_put5 = clean_long_text_ORBIS(raw_input5)
    assert (
        out_put5
        == """THROMBECTOMIE réalisée le 08/12/2020
Opérateur : Dr"""
    )

    ### Remove special characters in Operatoire report
    raw_input6 = "\u0001\u0000_\u0000\u0001\u0000g\u0000Opérateur(s) : DUFFAS"
    out_put6 = clean_long_text_ORBIS(raw_input6)
    assert out_put6 == """Opérateur(s) : DUFFAS"""

    ### Remove special characters in Operatoire report
    raw_input7 = "\u0001\u0000_\u0000\u0001\u0000!\u0000Opérateur(s) : DUFFAS"
    out_put7 = clean_long_text_ORBIS(raw_input7)
    assert out_put7 == """Opérateur(s) : DUFFAS"""

    ### Remove special characters in Operatoire report
    raw_input8 = "\u0001\u0000d\u0000\u0001\u0000,\u0000Opérateur(s) : DUFFAS"
    out_put8 = clean_long_text_ORBIS(raw_input8)
    assert out_put8 == """Opérateur(s) : DUFFAS"""

    ### Remove special characters in Hospitalisation report
    raw_input9 = "\u0001\u0000}'\u0001\u0000u'\\f:2030\\Cher Confrère"
    out_put9 = clean_long_text_ORBIS(raw_input9)
    assert out_put9 == """Cher Confrère"""
