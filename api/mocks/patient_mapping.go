package mocks

const patientMapping = `
{
  "id": "ckdyl65kh0125gu9kpvjbja6j",
  "logicalReference": "",
  "label": "",
  "primaryKeyTable": "patients",
  "primaryKeyColumn": "row_id",
  "definitionId": "Patient",
  "sourceId": "ckdyl65ip0010gu9k22w8kvc1",
  "updatedAt": "2020-08-17T14:01:01.366Z",
  "createdAt": "2020-08-17T14:01:01.361Z",
  "source": {
    "id": "ckdyl65ip0010gu9k22w8kvc1",
    "name": "logilan",
    "version": null,
    "templateId": "ckdyl65ia0001gu9kk3jf82e6",
    "updatedAt": "2020-08-17T14:01:01.297Z",
    "createdAt": "2020-08-17T14:01:01.297Z",
    "credential": {
      "owner": null
    }
  },
  "filters": [
    {
      "id": "ckdu1t41o1171iepjprcl7qji",
      "relation": ">=",
      "value": "0",
      "resourceId": "ckd62orz2052659mpwse7w8ms",
      "sqlColumnId": "ckdu1t41o1172iepju4j8od0x",
      "sqlColumn": {
        "id": "ckdu1t41o1172iepju4j8od0x",
        "table": "patients",
        "column": "row_id",
        "joinId": null,
        "updatedAt": "2020-08-14T09:47:55.452Z",
        "createdAt": "2020-08-14T09:47:55.452Z"
      }
    }
  ],
  "attributes": [
    {
      "id": "ckdyl65kh0126gu9ka6svbibj",
      "path": "active",
      "sliceName": null,
      "definitionId": "boolean",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.361Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kh0127gu9kqdxatrks",
          "mergingScript": null,
          "attributeId": "ckdyl65kh0126gu9ka6svbibj",
          "updatedAt": "2020-08-17T14:01:01.366Z",
          "createdAt": "2020-08-17T14:01:01.361Z",
          "inputs": [
            {
              "id": "ckdyl65kh0128gu9k4ooybxa8",
              "script": null,
              "conceptMapId": null,
              "staticValue": "active",
              "sqlValueId": "ckdyl65kh0129gu9kdqxrzzr3",
              "inputGroupId": "ckdyl65kh0127gu9kqdxatrks",
              "updatedAt": "2020-08-17T14:01:01.366Z",
              "createdAt": "2020-08-17T14:01:01.361Z",
              "sqlValue": null
            }
          ],
          "conditions": [
            {
              "id": "ckdyl6i2f0114gz9k66jmib2j",
              "action": "INCLUDE",
              "columnId": "ckdyl6i2f0115gz9k4z7aecfc",
              "relation": "NULL",
              "value": "",
              "inputGroupId": "ckdyl65kh0127gu9kqdxatrks",
              "sqlValue": {
                "id": "ckdyl6i2f0115gz9k4z7aecfc",
                "table": "patients",
                "column": "dob",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:17.559Z",
                "createdAt": "2020-08-17T14:01:17.559Z"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "ckdyl65kh0126gu9ka6svbibh",
      "path": "birthDate",
      "sliceName": null,
      "definitionId": "date",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.361Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kh0127gu9kqdxatrkr",
          "mergingScript": null,
          "attributeId": "ckdyl65kh0126gu9ka6svbibh",
          "updatedAt": "2020-08-17T14:01:01.366Z",
          "createdAt": "2020-08-17T14:01:01.361Z",
          "inputs": [
            {
              "id": "ckdyl65kh0128gu9k4ooybxa7",
              "script": "clean_date",
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65kh0129gu9kdqxrzzr3",
              "inputGroupId": "ckdyl65kh0127gu9kqdxatrkr",
              "updatedAt": "2020-08-17T14:01:01.366Z",
              "createdAt": "2020-08-17T14:01:01.361Z",
              "sqlValue": {
                "id": "ckdyl65kh0129gu9kdqxrzzr3",
                "table": "patients",
                "column": "dob",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.366Z",
                "createdAt": "2020-08-17T14:01:01.361Z",
                "joins": []
              }
            }
          ],
          "conditions": [
            {
              "id": "ckdyl6i2f0114gz9k66jmib2j",
              "action": "INCLUDE",
              "columnId": "ckdyl6i2f0115gz9k4z7aecfc",
              "relation": "GE",
              "value": "1000-01-01",
              "inputGroupId": "ckdyl65kh0127gu9kqdxatrkr",
              "sqlValue": {
                "id": "ckdyl6i2f0115gz9k4z7aecfc",
                "table": "patients",
                "column": "dob",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:17.559Z",
                "createdAt": "2020-08-17T14:01:17.559Z"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "ckdyl65kh0130gu9kmkk8c0p0",
      "path": "deceasedBoolean",
      "sliceName": null,
      "definitionId": "boolean",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.361Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kh0131gu9ktf0n3454",
          "mergingScript": null,
          "attributeId": "ckdyl65kh0130gu9kmkk8c0p0",
          "updatedAt": "2020-08-17T14:01:01.366Z",
          "createdAt": "2020-08-17T14:01:01.361Z",
          "inputs": [
            {
              "id": "ckdyl65kh0132gu9kbih91upu",
              "script": "binary_to_bool_1",
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65kh0133gu9kp4umizkr",
              "inputGroupId": "ckdyl65kh0131gu9ktf0n3454",
              "updatedAt": "2020-08-17T14:01:01.366Z",
              "createdAt": "2020-08-17T14:01:01.361Z",
              "sqlValue": {
                "id": "ckdyl65kh0133gu9kp4umizkr",
                "table": "patients",
                "column": "expire_flag",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.366Z",
                "createdAt": "2020-08-17T14:01:01.361Z",
                "joins": []
              }
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kh0134gu9kkyyxl0p6",
      "path": "maritalStatus.coding[0]",
      "sliceName": null,
      "definitionId": "Coding",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.361Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65kh0135gu9kl9zbygli",
      "path": "maritalStatus.text",
      "sliceName": null,
      "definitionId": "string",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.361Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65ki0136gu9knbiso6wf",
          "mergingScript": null,
          "attributeId": "ckdyl65kh0135gu9kl9zbygli",
          "updatedAt": "2020-08-17T14:01:01.366Z",
          "createdAt": "2020-08-17T14:01:01.362Z",
          "inputs": [
            {
              "id": "ckdyl65ki0137gu9kjfjdbf23",
              "script": null,
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65ki0138gu9kb1g4xfat",
              "inputGroupId": "ckdyl65ki0136gu9knbiso6wf",
              "updatedAt": "2020-08-17T14:01:01.366Z",
              "createdAt": "2020-08-17T14:01:01.362Z",
              "sqlValue": {
                "id": "ckdyl65ki0138gu9kb1g4xfat",
                "table": "admissions",
                "column": "marital_status",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.366Z",
                "createdAt": "2020-08-17T14:01:01.362Z",
                "joins": [
                  {
                    "id": "ckdyl65ki0139gu9km494twhn",
                    "columnId": "ckdyl65ki0138gu9kb1g4xfat",
                    "updatedAt": "2020-08-17T14:01:01.366Z",
                    "createdAt": "2020-08-17T14:01:01.362Z",
                    "tables": [
                      {
                        "id": "ckdyl65ki0140gu9kno8jumsr",
                        "table": "patients",
                        "column": "subject_id",
                        "joinId": "ckdyl65ki0139gu9km494twhn",
                        "updatedAt": "2020-08-17T14:01:01.366Z",
                        "createdAt": "2020-08-17T14:01:01.362Z"
                      },
                      {
                        "id": "ckdyl65ki0141gu9klt9e790b",
                        "table": "admissions",
                        "column": "subject_id",
                        "joinId": "ckdyl65ki0139gu9km494twhn",
                        "updatedAt": "2020-08-17T14:01:01.366Z",
                        "createdAt": "2020-08-17T14:01:01.362Z"
                      }
                    ]
                  }
                ]
              }
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65ki0142gu9kwhxhohfm",
      "path": "identifier[0].period",
      "sliceName": null,
      "definitionId": "Period",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65ki0159gu9k5crn7gb8",
      "path": "identifier[0].period.start",
      "sliceName": null,
      "definitionId": "dateTime",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65ki0160gu9k7uknj1rm",
          "mergingScript": null,
          "attributeId": "ckdyl65ki0159gu9k5crn7gb8",
          "updatedAt": "2020-08-17T14:01:01.366Z",
          "createdAt": "2020-08-17T14:01:01.362Z",
          "inputs": [
            {
              "id": "ckdyl65ki0161gu9kz5ppa445",
              "script": "clean_date",
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65ki0162gu9kd4duet1w",
              "inputGroupId": "ckdyl65ki0160gu9k7uknj1rm",
              "updatedAt": "2020-08-17T14:01:01.366Z",
              "createdAt": "2020-08-17T14:01:01.362Z",
              "sqlValue": {
                "id": "ckdyl65ki0162gu9kd4duet1w",
                "table": "admissions",
                "column": "admittime",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.366Z",
                "createdAt": "2020-08-17T14:01:01.362Z",
                "joins": [
                  {
                    "id": "ckdyl65ki0163gu9kxozsk9f5",
                    "columnId": "ckdyl65ki0162gu9kd4duet1w",
                    "updatedAt": "2020-08-17T14:01:01.366Z",
                    "createdAt": "2020-08-17T14:01:01.362Z",
                    "tables": [
                      {
                        "id": "ckdyl65ki0164gu9kwv9nzan4",
                        "table": "patients",
                        "column": "subject_id",
                        "joinId": "ckdyl65ki0163gu9kxozsk9f5",
                        "updatedAt": "2020-08-17T14:01:01.366Z",
                        "createdAt": "2020-08-17T14:01:01.362Z"
                      },
                      {
                        "id": "ckdyl65ki0165gu9kq6n7amie",
                        "table": "admissions",
                        "column": "subject_id",
                        "joinId": "ckdyl65ki0163gu9kxozsk9f5",
                        "updatedAt": "2020-08-17T14:01:01.366Z",
                        "createdAt": "2020-08-17T14:01:01.362Z"
                      }
                    ]
                  }
                ]
              }
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65ki0166gu9kc38lftnl",
      "path": "generalPractitioner[0].identifier",
      "sliceName": null,
      "definitionId": "Identifier",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65ki0167gu9k6vnf9zi8",
      "path": "generalPractitioner[0]",
      "sliceName": null,
      "definitionId": "Reference",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65ki0168gu9k7wspteq8",
      "path": "communication[0].language.text",
      "sliceName": null,
      "definitionId": "string",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65ki0169gu9k64usikyw",
      "path": "communication[0].language",
      "sliceName": null,
      "definitionId": "CodeableConcept",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65ki0170gu9ksbmld4cq",
      "path": "communication[0]",
      "sliceName": null,
      "definitionId": "BackboneElement",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65ki0171gu9ki5id0xeo",
      "path": "communication[0].language.coding[0].version",
      "sliceName": null,
      "definitionId": "string",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65ki0172gu9k8c38147a",
          "mergingScript": null,
          "attributeId": "ckdyl65ki0171gu9ki5id0xeo",
          "updatedAt": "2020-08-17T14:01:01.366Z",
          "createdAt": "2020-08-17T14:01:01.362Z",
          "inputs": [
            {
              "id": "ckdyl65ki0173gu9kpac1r0k9",
              "script": null,
              "conceptMapId": null,
              "staticValue": "\t4.0.1",
              "sqlValueId": null,
              "inputGroupId": "ckdyl65ki0172gu9k8c38147a",
              "updatedAt": "2020-08-17T14:01:01.366Z",
              "createdAt": "2020-08-17T14:01:01.362Z",
              "sqlValue": null
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65ki0174gu9k3idenodi",
      "path": "communication[0].language.coding[0]",
      "sliceName": null,
      "definitionId": "Coding",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65ki0175gu9k7boy2cmp",
      "path": "maritalStatus.coding[0].system",
      "sliceName": null,
      "definitionId": "uri",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.366Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65ki0176gu9ka160z08m",
          "mergingScript": null,
          "attributeId": "ckdyl65ki0175gu9k7boy2cmp",
          "updatedAt": "2020-08-17T14:01:01.366Z",
          "createdAt": "2020-08-17T14:01:01.362Z",
          "inputs": [
            {
              "id": "ckdyl65ki0177gu9k867o5p1b",
              "script": null,
              "conceptMapId": null,
              "staticValue": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
              "sqlValueId": null,
              "inputGroupId": "ckdyl65ki0176gu9ka160z08m",
              "updatedAt": "2020-08-17T14:01:01.366Z",
              "createdAt": "2020-08-17T14:01:01.362Z",
              "sqlValue": null
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65ki0178gu9kuoxst904",
      "path": "active",
      "sliceName": null,
      "definitionId": "boolean",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.362Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65ki0179gu9kuxeejnhv",
          "mergingScript": null,
          "attributeId": "ckdyl65ki0178gu9kuoxst904",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.362Z",
          "inputs": [
            {
              "id": "ckdyl65ki0180gu9kw18c3gvv",
              "script": "binary_to_bool_2",
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65ki0181gu9k67d69xpq",
              "inputGroupId": "ckdyl65ki0179gu9kuxeejnhv",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.362Z",
              "sqlValue": {
                "id": "ckdyl65ki0181gu9k67d69xpq",
                "table": "patients",
                "column": "expire_flag",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.362Z",
                "joins": []
              }
            }
          ],
          "conditions": [
            {
              "id": "ckdyl65ki0182gu9ko0t52yaf",
              "action": "INCLUDE",
              "columnId": "ckdyl65ki0183gu9ktqia3dvk",
              "relation": "EQ",
              "value": "1",
              "inputGroupId": "ckdyl65ki0179gu9kuxeejnhv",
              "sqlValue": {
                "id": "ckdyl65ki0183gu9ktqia3dvk",
                "table": "patients",
                "column": "expire_flag",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.362Z"
              }
            }
          ]
        },
        {
          "id": "ckdyl65ki0184gu9k5w21kpyl",
          "mergingScript": null,
          "attributeId": "ckdyl65ki0178gu9kuoxst904",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.362Z",
          "inputs": [
            {
              "id": "ckdyl65ki0185gu9kzeztscb6",
              "script": "binary_to_bool_2",
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65ki0186gu9kqd8gyj0l",
              "inputGroupId": "ckdyl65ki0184gu9k5w21kpyl",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.362Z",
              "sqlValue": {
                "id": "ckdyl65ki0186gu9kqd8gyj0l",
                "table": "patients",
                "column": "expire_flag",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.362Z",
                "joins": []
              }
            }
          ],
          "conditions": [
            {
              "id": "ckdyl65ki0187gu9kraptuchn",
              "action": "INCLUDE",
              "columnId": "ckdyl65kj0188gu9k87u9vwv6",
              "relation": "EQ",
              "value": "0",
              "inputGroupId": "ckdyl65ki0184gu9k5w21kpyl",
              "sqlValue": {
                "id": "ckdyl65kj0188gu9k87u9vwv6",
                "table": "patients",
                "column": "expire_flag",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.363Z"
              }
            },
            {
              "id": "ckdyl65kj0189gu9kgdeq6j2o",
              "action": "EXCLUDE",
              "columnId": "ckdyl65kj0190gu9kwv4kj0mj",
              "relation": "EQ",
              "value": "555555",
              "inputGroupId": "ckdyl65ki0184gu9k5w21kpyl",
              "sqlValue": {
                "id": "ckdyl65kj0190gu9kwv4kj0mj",
                "table": "patients",
                "column": "row_id",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.363Z"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "ckdyl65kj0191gu9k4wxwc7vt",
      "path": "maritalStatus.coding[0].code",
      "sliceName": null,
      "definitionId": "code",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kj0192gu9kqc7349sl",
          "mergingScript": null,
          "attributeId": "ckdyl65kj0191gu9k4wxwc7vt",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.363Z",
          "inputs": [
            {
              "id": "ckdyl65kj0193gu9kdkqes6ej",
              "script": "map_marital_status",
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65kj0194gu9k6ez7yirb",
              "inputGroupId": "ckdyl65kj0192gu9kqc7349sl",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.363Z",
              "sqlValue": {
                "id": "ckdyl65kj0194gu9k6ez7yirb",
                "table": "admissions",
                "column": "marital_status",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.363Z",
                "joins": [
                  {
                    "id": "ckdyl65kj0195gu9k43qei6xp",
                    "columnId": "ckdyl65kj0194gu9k6ez7yirb",
                    "updatedAt": "2020-08-17T14:01:01.367Z",
                    "createdAt": "2020-08-17T14:01:01.363Z",
                    "tables": [
                      {
                        "id": "ckdyl65kj0196gu9ku2dy0ygg",
                        "table": "patients",
                        "column": "subject_id",
                        "joinId": "ckdyl65kj0195gu9k43qei6xp",
                        "updatedAt": "2020-08-17T14:01:01.367Z",
                        "createdAt": "2020-08-17T14:01:01.363Z"
                      },
                      {
                        "id": "ckdyl65kj0197gu9k1lrvx3bl",
                        "table": "admissions",
                        "column": "subject_id",
                        "joinId": "ckdyl65kj0195gu9k43qei6xp",
                        "updatedAt": "2020-08-17T14:01:01.367Z",
                        "createdAt": "2020-08-17T14:01:01.363Z"
                      }
                    ]
                  }
                ]
              }
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kj0198gu9kwlqhg8qn",
      "path": "identifier[0].value",
      "sliceName": null,
      "definitionId": "string",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kj0199gu9kwzvczmwc",
          "mergingScript": null,
          "attributeId": "ckdyl65kj0198gu9kwlqhg8qn",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.363Z",
          "inputs": [
            {
              "id": "ckdyl65kj0200gu9ktzxzdgrx",
              "script": null,
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65kj0201gu9k991p2071",
              "inputGroupId": "ckdyl65kj0199gu9kwzvczmwc",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.363Z",
              "sqlValue": {
                "id": "ckdyl65kj0201gu9k991p2071",
                "table": "patients",
                "column": "subject_id",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.363Z",
                "joins": []
              }
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kj0202gu9kuvproxtq",
      "path": "maritalStatus.coding[0].userSelected",
      "sliceName": null,
      "definitionId": "boolean",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65kj0203gu9k592x4h1t",
      "path": "identifier[0].type.coding[0].code",
      "sliceName": null,
      "definitionId": "code",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kj0204gu9k7bkjz02w",
          "mergingScript": null,
          "attributeId": "ckdyl65kj0203gu9k592x4h1t",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.363Z",
          "inputs": [
            {
              "id": "ckdyl65kj0205gu9k31y6y6ut",
              "script": null,
              "conceptMapId": null,
              "staticValue": "PPN",
              "sqlValueId": null,
              "inputGroupId": "ckdyl65kj0204gu9k7bkjz02w",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.363Z",
              "sqlValue": null
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kj0206gu9kdz7jgi4t",
      "path": "identifier[0].type",
      "sliceName": null,
      "definitionId": "CodeableConcept",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65kj0207gu9kplr9zmjl",
      "path": "identifier[0].type.coding[0].system",
      "sliceName": null,
      "definitionId": "uri",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kj0208gu9kot49ezne",
          "mergingScript": null,
          "attributeId": "ckdyl65kj0207gu9kplr9zmjl",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.363Z",
          "inputs": [
            {
              "id": "ckdyl65kj0209gu9kgl3m5z12",
              "script": null,
              "conceptMapId": null,
              "staticValue": "http://terminology.interopsante.org/CodeSystem/v2-0203",
              "sqlValueId": null,
              "inputGroupId": "ckdyl65kj0208gu9kot49ezne",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.363Z",
              "sqlValue": null
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kj0210gu9kyhzb2ot3",
      "path": "identifier[0].type.coding[0]",
      "sliceName": null,
      "definitionId": "Coding",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65kj0211gu9k44jlg51b",
      "path": "generalPractitioner[0].identifier.type.coding[0]",
      "sliceName": null,
      "definitionId": "Coding",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65kj0212gu9kl9fmssfp",
      "path": "generalPractitioner[0].identifier.type",
      "sliceName": null,
      "definitionId": "CodeableConcept",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65kj0213gu9k85n9yxb2",
      "path": "communication[0].language.coding[0].system",
      "sliceName": null,
      "definitionId": "uri",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kj0214gu9k8uss6298",
          "mergingScript": null,
          "attributeId": "ckdyl65kj0213gu9k85n9yxb2",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.363Z",
          "inputs": [
            {
              "id": "ckdyl65kj0215gu9k4ifjbpjk",
              "script": null,
              "conceptMapId": null,
              "staticValue": "http://hl7.org/fhir/ValueSet/languages",
              "sqlValueId": null,
              "inputGroupId": "ckdyl65kj0214gu9k8uss6298",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.363Z",
              "sqlValue": null
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kj0216gu9kpn4juqbd",
      "path": "communication[0].language.coding[0].code",
      "sliceName": null,
      "definitionId": "code",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kj0217gu9kehdknh0v",
          "mergingScript": null,
          "attributeId": "ckdyl65kj0216gu9kpn4juqbd",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.363Z",
          "inputs": [
            {
              "id": "ckdyl65kj0218gu9knepcj1xx",
              "script": null,
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65kj0219gu9k250llw77",
              "inputGroupId": "ckdyl65kj0217gu9kehdknh0v",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.363Z",
              "sqlValue": {
                "id": "ckdyl65kj0219gu9k250llw77",
                "table": "admissions",
                "column": "language",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.363Z",
                "joins": [
                  {
                    "id": "ckdyl65kj0220gu9k3o1rdpx7",
                    "columnId": "ckdyl65kj0219gu9k250llw77",
                    "updatedAt": "2020-08-17T14:01:01.367Z",
                    "createdAt": "2020-08-17T14:01:01.363Z",
                    "tables": [
                      {
                        "id": "ckdyl65kj0221gu9ko0mokuf2",
                        "table": "patients",
                        "column": "subject_id",
                        "joinId": "ckdyl65kj0220gu9k3o1rdpx7",
                        "updatedAt": "2020-08-17T14:01:01.367Z",
                        "createdAt": "2020-08-17T14:01:01.363Z"
                      },
                      {
                        "id": "ckdyl65kj0222gu9kghzy2876",
                        "table": "admissions",
                        "column": "subject_id",
                        "joinId": "ckdyl65kj0220gu9k3o1rdpx7",
                        "updatedAt": "2020-08-17T14:01:01.367Z",
                        "createdAt": "2020-08-17T14:01:01.363Z"
                      }
                    ]
                  }
                ]
              }
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kj0223gu9kxul5zak6",
      "path": "identifier[0].type.coding[0].display",
      "sliceName": null,
      "definitionId": "string",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kj0224gu9kom4lmqsq",
          "mergingScript": null,
          "attributeId": "ckdyl65kj0223gu9kxul5zak6",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.363Z",
          "inputs": [
            {
              "id": "ckdyl65kj0225gu9k46kb688f",
              "script": null,
              "conceptMapId": null,
              "staticValue": "Passport number",
              "sqlValueId": null,
              "inputGroupId": "ckdyl65kj0224gu9kom4lmqsq",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.363Z",
              "sqlValue": null
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kj0226gu9k3iea8hv1",
      "path": "gender",
      "sliceName": null,
      "definitionId": "code",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.363Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kj0227gu9kpnmchyvk",
          "mergingScript": null,
          "attributeId": "ckdyl65kj0226gu9k3iea8hv1",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.363Z",
          "inputs": [
            {
              "id": "ckdyl65kj0228gu9kwwr85x4e",
              "script": null,
              "conceptMapId": "id_cm_gender",
              "conceptMap": {
                "M": "male",
                "F": "female"
              },
              "staticValue": null,
              "sqlValueId": "ckdyl65kj0229gu9krs3zwuph",
              "inputGroupId": "ckdyl65kj0227gu9kpnmchyvk",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.363Z",
              "sqlValue": {
                "id": "ckdyl65kj0229gu9krs3zwuph",
                "table": "patients",
                "column": "gender",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.363Z",
                "joins": []
              }
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kk0247gu9ki0zqiqpy",
      "path": "identifier[0].system",
      "sliceName": null,
      "definitionId": "uri",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.364Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kk0248gu9kkn4umbx1",
          "mergingScript": null,
          "attributeId": "ckdyl65kk0247gu9ki0zqiqpy",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.364Z",
          "inputs": [
            {
              "id": "ckdyl65kk0249gu9kk2tlubfc",
              "script": null,
              "conceptMapId": null,
              "staticValue": "http://terminology.arkhn.org/ck8oo01zm26944kp4ta60mfea/ck8oo3on226974kp4ns32n7xs/Mimic_identifier",
              "sqlValueId": null,
              "inputGroupId": "ckdyl65kk0248gu9kkn4umbx1",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.364Z",
              "sqlValue": null
            }
          ],
          "conditions": []
        }
      ]
    },
    {
      "id": "ckdyl65kl0329gu9k3t8fwf7j",
      "path": "identifier[0]",
      "sliceName": null,
      "definitionId": "Identifier",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.365Z",
      "comments": [],
      "inputGroups": []
    },
    {
      "id": "ckdyl65kl0330gu9kg0g9kl08",
      "path": "deceasedDateTime",
      "sliceName": null,
      "definitionId": "dateTime",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.365Z",
      "comments": [],
      "inputGroups": [
        {
          "id": "ckdyl65kl0331gu9kjada4vf4",
          "mergingScript": null,
          "attributeId": "ckdyl65kl0330gu9kg0g9kl08",
          "updatedAt": "2020-08-17T14:01:01.367Z",
          "createdAt": "2020-08-17T14:01:01.365Z",
          "inputs": [
            {
              "id": "ckdyl65kl0332gu9ktbm5l90s",
              "script": "clean_date",
              "conceptMapId": null,
              "staticValue": null,
              "sqlValueId": "ckdyl65kl0333gu9kf9udz7lz",
              "inputGroupId": "ckdyl65kl0331gu9kjada4vf4",
              "updatedAt": "2020-08-17T14:01:01.367Z",
              "createdAt": "2020-08-17T14:01:01.365Z",
              "sqlValue": {
                "id": "ckdyl65kl0333gu9kf9udz7lz",
                "table": "patients",
                "column": "dod",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.365Z",
                "joins": []
              }
            }
          ],
          "conditions": [
            {
              "id": "ckdyl65kl0334gu9ky8x57zvb",
              "action": "EXCLUDE",
              "columnId": "ckdyl65kl0335gu9kup0hwhe0",
              "relation": "EQ",
              "value": "1",
              "inputGroupId": "ckdyl65kl0331gu9kjada4vf4",
              "sqlValue": {
                "id": "ckdyl65kl0335gu9kup0hwhe0",
                "table": "patients",
                "column": "expire_flag",
                "joinId": null,
                "updatedAt": "2020-08-17T14:01:01.367Z",
                "createdAt": "2020-08-17T14:01:01.365Z"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "ckdyl65kl0336gu9ko7kvv67a",
      "path": "maritalStatus",
      "sliceName": null,
      "definitionId": "CodeableConcept",
      "resourceId": "ckdyl65kh0125gu9kpvjbja6j",
      "updatedAt": "2020-08-17T14:01:01.367Z",
      "createdAt": "2020-08-17T14:01:01.365Z",
      "comments": [],
      "inputGroups": []
    }
  ],
  "definition": {
    "id": "Patient",
    "url": "http://hl7.org/fhir/StructureDefinition/Patient",
    "name": "Patient",
    "type": "Patient",
    "description": "Demographics and other administrative information about an individual or animal receiving care or other health-related services.",
    "kind": "resource",
    "baseDefinition": "http://hl7.org/fhir/StructureDefinition/DomainResource",
    "derivation": "specialization",
    "publisher": "Health Level Seven International (Patient Administration)",
    "min": 0,
    "max": "*",
    "constraint": [
      {
        "expression": "contained.contained.empty()",
        "human": "If the resource is contained in another resource, it SHALL NOT contain nested Resources",
        "key": "dom-2",
        "severity": "error",
        "source": "http://hl7.org/fhir/StructureDefinition/DomainResource",
        "xpath": "not(parent::f:contained and f:contained)"
      },
      {
        "expression": "contained.where((('#'+id in (%resource.descendants().reference | %resource.descendants().as(canonical) | %resource.descendants().as(uri) | %resource.descendants().as(url))) or descendants().where(reference = '#').exists() or descendants().where(as(canonical) = '#').exists() or descendants().where(as(canonical) = '#').exists()).not()).trace('unmatched', id).empty()",
        "human": "If the resource is contained in another resource, it SHALL be referred to from elsewhere in the resource or SHALL refer to the containing resource",
        "key": "dom-3",
        "severity": "error",
        "source": "http://hl7.org/fhir/StructureDefinition/DomainResource",
        "xpath": "not(exists(for $id in f:contained/*/f:id/@value return $contained[not(parent::*/descendant::f:reference/@value=concat('#', $contained/*/id/@value) or descendant::f:reference[@value='#'])]))"
      },
      {
        "expression": "contained.meta.versionId.empty() and contained.meta.lastUpdated.empty()",
        "human": "If a resource is contained in another resource, it SHALL NOT have a meta.versionId or a meta.lastUpdated",
        "key": "dom-4",
        "severity": "error",
        "source": "http://hl7.org/fhir/StructureDefinition/DomainResource",
        "xpath": "not(exists(f:contained/*/f:meta/f:versionId)) and not(exists(f:contained/*/f:meta/f:lastUpdated))"
      },
      {
        "expression": "contained.meta.security.empty()",
        "human": "If a resource is contained in another resource, it SHALL NOT have a security label",
        "key": "dom-5",
        "severity": "error",
        "source": "http://hl7.org/fhir/StructureDefinition/DomainResource",
        "xpath": "not(exists(f:contained/*/f:meta/f:security))"
      },
      {
        "expression": "text.'div'.exists()",
        "extension": [
          {
            "url": "http://hl7.org/fhir/StructureDefinition/elementdefinition-bestpractice",
            "valueBoolean": true
          },
          {
            "url": "http://hl7.org/fhir/StructureDefinition/elementdefinition-bestpractice-explanation",
            "valueMarkdown": "When a resource has no narrative, only systems that fully understand the data can display the resource to a human safely. Including a human readable representation in the resource makes for a much more robust eco-system and cheaper handling of resources by intermediary systems. Some ecosystems restrict distribution of resources to only those systems that do fully understand the resources, and as a consequence implementers may believe that the narrative is superfluous. However experience shows that such eco-systems often open up to new participants over time."
          }
        ],
        "human": "A resource should have narrative for robust management",
        "key": "dom-6",
        "severity": "warning",
        "source": "http://hl7.org/fhir/StructureDefinition/DomainResource",
        "xpath": "exists(f:text/h:div)"
      }
    ]
  }
}
`
