from common.scripts.cleaning import clean_long_text_ORBIS


def test_clean_long_text_ORBIS():
    ### Remove \u0001 & \\f:12152 & \\m0 type
    raw_input1 = "\u0001\u0000,\u0012\u0001\u0000$\u0012\\f:12152\\\rChers Confrère,\rChers Amis,\r\rVotre patiente, \\m1Madame XXX, née le 11/02/1945 (70 ans) \\m0a été hospitée ce matin."
    output1 = clean_long_text_ORBIS(raw_input1)
    assert (
        output1
        == """
Chers Confrère,
Chers Amis,

Votre patiente, Madame XXX, née le 11/02/1945 (70 ans) a été hospitée ce matin."""
    )

    ### Remove \\m0 type
    raw_input2 = "\\m3THROMBECTOMIE realisee le\\m0 08/12/2020\r\\m1Operateur :\\m0 Dr XXX\r\r-"
    output2 = clean_long_text_ORBIS(raw_input2)
    assert (
        output2
        == """THROMBECTOMIE realisee le 08/12/2020
Operateur : Dr XXX

-"""
    )

    ### Remove \u0001 & \r type
    raw_input3 = "\u0001\u0000P\u0000\u0001\u0000H\u0000\r\r\r*********** voir RS GLOBAL sur courrier suivant ************ Merci\r\r\u0000"
    output3 = clean_long_text_ORBIS(raw_input3)
    assert (
        output3
        == """PH


*********** voir RS GLOBAL sur courrier suivant ************ Merci

"""
    )

    ### Remove \\f:12152  & \\m0 type
    raw_input4 = ",$\\f:12152\\\rChers Confrère,\rChers Amis,\r\rVotre patiente, \\m1Madame XXX, née le 11/02/1945 (70 ans) \\m0a été hospitée ce matin."
    output4 = clean_long_text_ORBIS(raw_input4)
    assert (
        output4
        == """
Chers Confrère,
Chers Amis,

Votre patiente, Madame XXX, née le 11/02/1945 (70 ans) a été hospitée ce matin."""
    )

    ### Remove special caracters in Thrombectomie report
    raw_input5 = "\u0001\u0000f\u0003\u0001\u0000^\u0003\\m3THROMBECTOMIE réalisée le\\m0 08/12/2020\r\\m1Opérateur :\\m0 Dr"
    output5 = clean_long_text_ORBIS(raw_input5)
    assert (
        output5
        == """THROMBECTOMIE réalisée le 08/12/2020
Opérateur : Dr"""
    )

    ### Remove special characters in Operatoire report
    raw_input6 = "\u0001\u0000_\u0000\u0001\u0000g\u0000Opérateur(s) : DUFFAS"
    output6 = clean_long_text_ORBIS(raw_input6)
    assert output6 == """Opérateur(s) : DUFFAS"""

    ### Remove special characters in Operatoire report
    raw_input7 = "\u0001\u0000_\u0000\u0001\u0000!\u0000Opérateur(s) : DUFFAS"
    output7 = clean_long_text_ORBIS(raw_input7)
    assert output7 == """Opérateur(s) : DUFFAS"""

    ### Remove special characters in Operatoire report
    raw_input8 = "\u0001\u0000d\u0000\u0001\u0000,\u0000Opérateur(s) : DUFFAS"
    output8 = clean_long_text_ORBIS(raw_input8)
    assert output8 == """Opérateur(s) : DUFFAS"""

    ### Remove special characters in Hospitalisation report
    raw_input9 = "\u0001\u0000}'\u0001\u0000u'\\f:2030\\Cher Confrère"
    output9 = clean_long_text_ORBIS(raw_input9)
    assert output9 == """Cher Confrère"""
