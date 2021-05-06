import { IStructureDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";

export const complexTypes: string[] = [
  "Duration",
  "UsageContext",
  "Age",
  "Annotation",
  "Coding",
  "DataRequirement",
  "Distance",
  "ElementDefinition",
  "Meta",
  "ParameterDefinition",
  "Population",
  "ProductShelfLife",
  "Quantity",
  "Ratio",
  "Reference",
  "SubstanceAmount",
  "Expression",
  "MarketingStatus",
  "Address",
  "Attachment",
  "ContactPoint",
  "Dosage",
  "BackboneElement",
  "CodeableConcept",
  "Contributor",
  "ContactDetail",
  "Count",
  "Extension",
  "HumanName",
  "Money",
  "Narrative",
  "Period",
  "RelatedArtifact",
  "SampledData",
  "Signature",
  "Identifier",
  "ProdCharacteristic",
  "Range",
  "TriggerDefinition",
  "Timing",
];

export const primitiveTypes: string[] = [
  "base64Binary",
  "decimal",
  "dateTime",
  "id",
  "markdown",
  "date",
  "instant",
  "string",
  "time",
  "uri",
  "canonical",
  "code",
  "boolean",
  "integer",
  "oid",
  "positiveInt",
  "uuid",
  "xhtml",
  "unsignedInt",
  "url",
];

export const omittedResources = [
  "Element",
  "BackboneElement",
  "Resource",
  "DomainResource",
];
export const allowedAttributes = ["extension"];

export const fhirResourceObs = ({
  resourceType: "StructureDefinition",
  id: "bp",
  text: {
    status: "generated",
    div: '<div xmlns="http://www.w3.org/1999/xhtml">to do</div>',
  },
  extension: [
    {
      url:
        "http://hl7.org/fhir/StructureDefinition/structuredefinition-summary",
      valueMarkdown:
        "#### Complete Summary of the Mandatory Requirements\r\r1.  One code in `Observation.code` which must have\r    -   a fixed `Observation.code.coding.system`=**'http ://loinc.org'**\r    -   a fixed  `Observation.code.coding.code`= **85354-9'**\r    -   Other additional Codings are allowed in `Observation.code`- e.g. more specific LOINC\r        Codes, SNOMED CT concepts, system specific codes. All codes\r        SHALL have an system value\r2.  One  `Observation.component.code`  which must have\r    -   a fixed `Observation.component.code.coding.system`=**'http://loinc.org'**\r    -   fixed  `Observation.component.code.coding.code`= **'8480-6'**\r    -   Other additional Codings are allowed in `Observation.code`- e.g. more specific LOINC\r        Codes, SNOMED CT concepts, system specific codes. All codes\r        SHALL have an system value\r3.  One  `Observation.component.code` which must have \r    -   a fixed `Observation.component.code.coding.system`=**'http://loinc.org'**\r    -   fixed  `Observation.component.code.coding.code`= **'8462-4'**\r    -   Other additional Codings are allowed in `Observation.code`- e.g. more specific LOINC\r        Codes, SNOMED CT concepts, system specific codes. All codes\r        SHALL have an system value\r1. Either one Observation.valueQuantity or, if there is no value, one code in Observation.DataAbsentReason\r   - Each Observation.valueQuantity must have:\r     - One numeric value in Observation.valueQuantity.value\r     - a fixed Observation.valueQuantity.system=\"http://unitsofmeasure.org\"\r     - a UCUM unit code in Observation.valueQuantity.code = **'mm[Hg]'**",
    },
    {
      url: "http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm",
      valueInteger: 5,
    },
    {
      url: "http://hl7.org/fhir/StructureDefinition/structuredefinition-wg",
      valueCode: "oo",
    },
    {
      url:
        "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
      valueCode: "trial-use",
    },
  ],
  url: "http://hl7.org/fhir/StructureDefinition/bp",
  version: "4.0.1",
  name: "observation-bp",
  title: "Observation Blood Pressure Profile",
  status: "draft",
  experimental: false,
  date: "2018-08-11",
  publisher:
    "Health Level Seven International (Orders and Observations Workgroup)",
  contact: [
    {
      telecom: [
        {
          system: "url",
          value:
            "http://www.hl7.org/Special/committees/orders/index.cfm Orders and Observations",
        },
      ],
    },
  ],
  description: "FHIR Blood Pressure Profile",
  fhirVersion: "4.0.1",
  mapping: [
    {
      identity: "workflow",
      uri: "http://hl7.org/fhir/workflow",
      name: "Workflow Pattern",
    },
    {
      identity: "sct-concept",
      uri: "http://snomed.info/conceptdomain",
      name: "SNOMED CT Concept Domain Binding",
    },
    {
      identity: "v2",
      uri: "http://hl7.org/v2",
      name: "HL7 v2 Mapping",
    },
    {
      identity: "rim",
      uri: "http://hl7.org/v3",
      name: "RIM Mapping",
    },
    {
      identity: "w5",
      uri: "http://hl7.org/fhir/fivews",
      name: "FiveWs Pattern Mapping",
    },
    {
      identity: "sct-attr",
      uri: "http://snomed.org/attributebinding",
      name: "SNOMED CT Attribute Binding",
    },
  ],
  kind: "resource",
  abstract: false,
  type: "Observation",
  baseDefinition: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
  derivation: "constraint",
  snapshot: {
    element: [
      {
        id: "Observation",
        path: "Observation",
        short: "FHIR Blood Pressure Profile",
        definition:
          "This profile defines  how to represent Blood Pressure observations in FHIR using a standard LOINC code and UCUM units of measure.  This is a grouping structure. It has no value in Observation.valueQuantity but contains at least one component (systolic and/or diastolic).",
        comment:
          "Used for simple observations such as device measurements, laboratory atomic results, vital signs, height, weight, smoking status, comments, etc.  Other resources are used to provide context for observations such as laboratory reports, etc.",
        alias: ["Vital Signs", "Measurement", "Results", "Tests"],
        min: 0,
        max: "*",
        base: {
          path: "Observation",
          min: 0,
          max: "*",
        },
        constraint: [
          {
            key: "dom-2",
            severity: "error",
            human:
              "If the resource is contained in another resource, it SHALL NOT contain nested Resources",
            expression: "contained.contained.empty()",
            xpath: "not(parent::f:contained and f:contained)",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
          {
            key: "dom-3",
            severity: "error",
            human:
              "If the resource is contained in another resource, it SHALL be referred to from elsewhere in the resource or SHALL refer to the containing resource",
            expression:
              "contained.where((('#'+id in (%resource.descendants().reference | %resource.descendants().as(canonical) | %resource.descendants().as(uri) | %resource.descendants().as(url))) or descendants().where(reference = '#').exists() or descendants().where(as(canonical) = '#').exists() or descendants().where(as(canonical) = '#').exists()).not()).trace('unmatched', id).empty()",
            xpath:
              "not(exists(for $id in f:contained/*/f:id/@value return $contained[not(parent::*/descendant::f:reference/@value=concat('#', $contained/*/id/@value) or descendant::f:reference[@value='#'])]))",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
          {
            key: "dom-4",
            severity: "error",
            human:
              "If a resource is contained in another resource, it SHALL NOT have a meta.versionId or a meta.lastUpdated",
            expression:
              "contained.meta.versionId.empty() and contained.meta.lastUpdated.empty()",
            xpath:
              "not(exists(f:contained/*/f:meta/f:versionId)) and not(exists(f:contained/*/f:meta/f:lastUpdated))",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
          {
            key: "dom-5",
            severity: "error",
            human:
              "If a resource is contained in another resource, it SHALL NOT have a security label",
            expression: "contained.meta.security.empty()",
            xpath: "not(exists(f:contained/*/f:meta/f:security))",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/elementdefinition-bestpractice",
                valueBoolean: true,
              },
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/elementdefinition-bestpractice-explanation",
                valueMarkdown:
                  "When a resource has no narrative, only systems that fully understand the data can display the resource to a human safely. Including a human readable representation in the resource makes for a much more robust eco-system and cheaper handling of resources by intermediary systems. Some ecosystems restrict distribution of resources to only those systems that do fully understand the resources, and as a consequence implementers may believe that the narrative is superfluous. However experience shows that such eco-systems often open up to new participants over time.",
              },
            ],
            key: "dom-6",
            severity: "warning",
            human: "A resource should have narrative for robust management",
            expression: "text.`div`.exists()",
            xpath: "exists(f:text/h:div)",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
          {
            key: "obs-6",
            severity: "error",
            human:
              "dataAbsentReason SHALL only be present if Observation.value[x] is not present",
            expression: "dataAbsentReason.empty() or value.empty()",
            xpath:
              "not(exists(f:dataAbsentReason)) or (not(exists(*[starts-with(local-name(.), 'value')])))",
            source: "http://hl7.org/fhir/StructureDefinition/Observation",
          },
          {
            key: "obs-7",
            severity: "error",
            human:
              "If Observation.code is the same as an Observation.component.code then the value element associated with the code SHALL NOT be present",
            expression:
              "value.empty() or component.code.where(coding.intersect(%resource.code.coding).exists()).empty()",
            xpath:
              "not(f:*[starts-with(local-name(.), 'value')] and (for $coding in f:code/f:coding return f:component/f:code/f:coding[f:code/@value=$coding/f:code/@value] [f:system/@value=$coding/f:system/@value]))",
            source: "http://hl7.org/fhir/StructureDefinition/Observation",
          },
          {
            key: "vs-2",
            severity: "error",
            human:
              "If there is no component or hasMember element then either a value[x] or a data absent reason must be present.",
            expression:
              "(component.empty() and hasMember.empty()) implies (dataAbsentReason.exists() or value.exists())",
            xpath:
              "f:component or f:memberOF or f:*[starts-with(local-name(.), 'value')] or f:dataAbsentReason",
            source: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "Entity. Role, or Act",
          },
          {
            identity: "workflow",
            map: "Event",
          },
          {
            identity: "sct-concept",
            map: "< 363787002 |Observable entity|",
          },
          {
            identity: "v2",
            map: "OBX",
          },
          {
            identity: "rim",
            map: "Observation[classCode=OBS, moodCode=EVN]",
          },
        ],
      },
      {
        id: "Observation.id",
        path: "Observation.id",
        short: "Logical id of this artifact",
        definition:
          "The logical id of the resource, as used in the URL for the resource. Once assigned, this value never changes.",
        comment:
          "The only time that a resource does not have an id is when it is being submitted to the server using a create operation.",
        min: 0,
        max: "1",
        base: {
          path: "Resource.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: true,
      },
      {
        id: "Observation.meta",
        path: "Observation.meta",
        short: "Metadata about the resource",
        definition:
          "The metadata about the resource. This is content that is maintained by the infrastructure. Changes to the content might not always be associated with version changes to the resource.",
        min: 0,
        max: "1",
        base: {
          path: "Resource.meta",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Meta",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
      },
      {
        id: "Observation.implicitRules",
        path: "Observation.implicitRules",
        short: "A set of rules under which this content was created",
        definition:
          "A reference to a set of rules that were followed when the resource was constructed, and which must be understood when processing the content. Often, this is a reference to an implementation guide that defines the special rules along with other profiles etc.",
        comment:
          "Asserting this rule set restricts the content to be only understood by a limited set of trading partners. This inherently limits the usefulness of the data in the long term. However, the existing health eco-system is highly fractured, and not yet ready to define, collect, and exchange data in a generally computable sense. Wherever possible, implementers and/or specification writers should avoid using this element. Often, when used, the URL is a reference to an implementation guide that defines these special rules as part of it's narrative along with other profiles, value sets, etc.",
        min: 0,
        max: "1",
        base: {
          path: "Resource.implicitRules",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "uri",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: true,
        isModifierReason:
          "This element is labeled as a modifier because the implicit rules may provide additional knowledge about the resource that modifies it's meaning or interpretation",
        isSummary: true,
      },
      {
        id: "Observation.language",
        path: "Observation.language",
        short: "Language of the resource content",
        definition: "The base language in which the resource is written.",
        comment:
          "Language is provided to support indexing and accessibility (typically, services such as text to speech use the language tag). The html language tag in the narrative applies  to the narrative. The language tag on the resource may be used to specify the language of other presentations generated from the data in the resource. Not all the content has to be in the base language. The Resource.language should not be assumed to apply to the narrative automatically. If a language is specified, it should it also be specified on the div element in the html (see rules in HTML5 for information about the relationship between xml:lang and the html lang attribute).",
        min: 0,
        max: "1",
        base: {
          path: "Resource.language",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-maxValueSet",
              valueCanonical: "http://hl7.org/fhir/ValueSet/all-languages",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "Language",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "preferred",
          description: "A human language.",
          valueSet: "http://hl7.org/fhir/ValueSet/languages",
        },
      },
      {
        id: "Observation.text",
        path: "Observation.text",
        short: "Text summary of the resource, for human interpretation",
        definition:
          'A human-readable narrative that contains a summary of the resource and can be used to represent the content of the resource to a human. The narrative need not encode all the structured data, but is required to contain sufficient detail to make it "clinically safe" for a human to just read the narrative. Resource definitions may define what content should be represented in the narrative to ensure clinical safety.',
        comment:
          'Contained resources do not have narrative. Resources that are not contained SHOULD have a narrative. In some cases, a resource may only have text with little or no additional discrete data (as long as all minOccurs=1 elements are satisfied).  This may be necessary for data from legacy systems where information is captured as a "text blob" or where text is additionally entered raw or narrated and encoded information is added later.',
        alias: ["narrative", "html", "xhtml", "display"],
        min: 0,
        max: "1",
        base: {
          path: "DomainResource.text",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Narrative",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "Act.text?",
          },
        ],
      },
      {
        id: "Observation.contained",
        path: "Observation.contained",
        short: "Contained, inline Resources",
        definition:
          "These resources do not have an independent existence apart from the resource that contains them - they cannot be identified independently, and nor can they have their own independent transaction scope.",
        comment:
          "This should never be done when the content can be identified properly, as once identification is lost, it is extremely difficult (and context dependent) to restore it again. Contained resources may have profiles and tags In their meta elements, but SHALL NOT have security labels.",
        alias: [
          "inline resources",
          "anonymous resources",
          "contained resources",
        ],
        min: 0,
        max: "*",
        base: {
          path: "DomainResource.contained",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Resource",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Observation.extension",
        path: "Observation.extension",
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the resource. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "DomainResource.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Observation.modifierExtension",
        path: "Observation.modifierExtension",
        short: "Extensions that cannot be ignored",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the resource and that modifies the understanding of the element that contains it and/or the understanding of the containing element's descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer is allowed to define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        requirements:
          "Modifier extensions allow for extensions that *cannot* be safely ignored to be clearly distinguished from the vast majority of extensions which can be safely ignored.  This promotes interoperability by eliminating the need for implementers to prohibit the presence of extensions. For further information, see the [definition of modifier extensions](http://hl7.org/fhir/extensibility.html#modifierExtension).",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "DomainResource.modifierExtension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: true,
        isModifierReason:
          "Modifier extensions are expected to modify the meaning or interpretation of the resource that contains them",
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Observation.identifier",
        path: "Observation.identifier",
        short: "Business Identifier for observation",
        definition: "A unique identifier assigned to this observation.",
        requirements: "Allows observations to be distinguished and referenced.",
        min: 0,
        max: "*",
        base: {
          path: "Observation.identifier",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Identifier",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "workflow",
            map: "Event.identifier",
          },
          {
            identity: "w5",
            map: "FiveWs.identifier",
          },
          {
            identity: "v2",
            map:
              "OBX.21  For OBX segments from systems without OBX-21 support a combination of ORC/OBR and OBX must be negotiated between trading partners to uniquely identify the OBX segment. Depending on how V2 has been implemented each of these may be an option: 1) OBR-3 + OBX-3 + OBX-4 or 2) OBR-3 + OBR-4 + OBX-3 + OBX-4 or 2) some other way to uniquely ID the OBR/ORC + OBX-3 + OBX-4.",
          },
          {
            identity: "rim",
            map: "id",
          },
        ],
      },
      {
        id: "Observation.basedOn",
        path: "Observation.basedOn",
        short: "Fulfills plan, proposal or order",
        definition:
          "A plan, proposal or order that is fulfilled in whole or in part by this event.  For example, a MedicationRequest may require a patient to have laboratory test performed before  it is dispensed.",
        requirements:
          "Allows tracing of authorization for the event and tracking whether proposals/recommendations were acted upon.",
        alias: ["Fulfills"],
        min: 0,
        max: "*",
        base: {
          path: "Observation.basedOn",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/CarePlan",
              "http://hl7.org/fhir/StructureDefinition/DeviceRequest",
              "http://hl7.org/fhir/StructureDefinition/ImmunizationRecommendation",
              "http://hl7.org/fhir/StructureDefinition/MedicationRequest",
              "http://hl7.org/fhir/StructureDefinition/NutritionOrder",
              "http://hl7.org/fhir/StructureDefinition/ServiceRequest",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "workflow",
            map: "Event.basedOn",
          },
          {
            identity: "v2",
            map: "ORC",
          },
          {
            identity: "rim",
            map: ".inboundRelationship[typeCode=COMP].source[moodCode=EVN]",
          },
        ],
      },
      {
        id: "Observation.partOf",
        path: "Observation.partOf",
        short: "Part of referenced event",
        definition:
          "A larger event of which this particular Observation is a component or step.  For example,  an observation as part of a procedure.",
        comment:
          "To link an Observation to an Encounter use `encounter`.  See the  [Notes](http://hl7.org/fhir/observation.html#obsgrouping) below for guidance on referencing another Observation.",
        alias: ["Container"],
        min: 0,
        max: "*",
        base: {
          path: "Observation.partOf",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/MedicationAdministration",
              "http://hl7.org/fhir/StructureDefinition/MedicationDispense",
              "http://hl7.org/fhir/StructureDefinition/MedicationStatement",
              "http://hl7.org/fhir/StructureDefinition/Procedure",
              "http://hl7.org/fhir/StructureDefinition/Immunization",
              "http://hl7.org/fhir/StructureDefinition/ImagingStudy",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "workflow",
            map: "Event.partOf",
          },
          {
            identity: "v2",
            map: "Varies by domain",
          },
          {
            identity: "rim",
            map: ".outboundRelationship[typeCode=FLFS].target",
          },
        ],
      },
      {
        id: "Observation.status",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/structuredefinition-display-hint",
            valueString: "default: final",
          },
        ],
        path: "Observation.status",
        short: "registered | preliminary | final | amended +",
        definition: "The status of the result value.",
        comment:
          "This element is labeled as a modifier because the status contains codes that mark the resource as not currently valid.",
        requirements:
          "Need to track the status of individual results. Some results are finalized before the whole report is finalized.",
        min: 1,
        max: "1",
        base: {
          path: "Observation.status",
          min: 1,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: true,
        isModifierReason:
          "This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid",
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "Status",
            },
          ],
          strength: "required",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-status|4.0.1",
        },
        mapping: [
          {
            identity: "workflow",
            map: "Event.status",
          },
          {
            identity: "w5",
            map: "FiveWs.status",
          },
          {
            identity: "sct-concept",
            map: "< 445584004 |Report by finality status|",
          },
          {
            identity: "v2",
            map: "OBX-11",
          },
          {
            identity: "rim",
            map:
              'status  Amended & Final are differentiated by whether it is the subject of a ControlAct event with a type of "revise"',
          },
        ],
      },
      {
        id: "Observation.category",
        path: "Observation.category",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "coding.code",
            },
            {
              type: "value",
              path: "coding.system",
            },
          ],
          ordered: false,
          rules: "open",
        },
        short: "Classification of  type of observation",
        definition:
          "A code that classifies the general type of observation being made.",
        comment:
          "In addition to the required category valueset, this element allows various categorization schemes based on the owner’s definition of the category and effectively multiple categories can be used at once.  The level of granularity is defined by the category concepts in the value set.",
        requirements:
          "Used for filtering what observations are retrieved and displayed.",
        min: 1,
        max: "*",
        base: {
          path: "Observation.category",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationCategory",
            },
          ],
          strength: "preferred",
          description: "Codes for high level observation categories.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-category",
        },
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.class",
          },
          {
            identity: "rim",
            map:
              '.outboundRelationship[typeCode="COMP].target[classCode="LIST", moodCode="EVN"].code',
          },
        ],
      },
      {
        id: "Observation.category:VSCat",
        path: "Observation.category",
        sliceName: "VSCat",
        short: "Classification of  type of observation",
        definition:
          "A code that classifies the general type of observation being made.",
        comment:
          "In addition to the required category valueset, this element allows various categorization schemes based on the owner’s definition of the category and effectively multiple categories can be used at once.  The level of granularity is defined by the category concepts in the value set.",
        requirements:
          "Used for filtering what observations are retrieved and displayed.",
        min: 1,
        max: "1",
        base: {
          path: "Observation.category",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationCategory",
            },
          ],
          strength: "preferred",
          description: "Codes for high level observation categories.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-category",
        },
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.class",
          },
          {
            identity: "rim",
            map:
              '.outboundRelationship[typeCode="COMP].target[classCode="LIST", moodCode="EVN"].code',
          },
        ],
      },
      {
        id: "Observation.category:VSCat.id",
        path: "Observation.category.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.extension",
        path: "Observation.category.extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.coding",
        path: "Observation.category.coding",
        short: "Code defined by a terminology system",
        definition: "A reference to a code defined by a terminology system.",
        comment:
          "Codes may be defined very casually in enumerations, or code lists, up to very formal definitions such as SNOMED CT - see the HL7 v3 Core Principles for more information.  Ordering of codings is undefined and SHALL NOT be used to infer meaning. Generally, at most only one of the coding values will be labeled as UserSelected = true.",
        requirements:
          "Allows for alternative encodings within a code system, and translations to other code systems.",
        min: 1,
        max: "*",
        base: {
          path: "CodeableConcept.coding",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Coding",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1-8, C*E.10-22",
          },
          {
            identity: "rim",
            map: "union(., ./translation)",
          },
          {
            identity: "orim",
            map: "fhir:CodeableConcept.coding rdfs:subPropertyOf dt:CD.coding",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.coding.id",
        path: "Observation.category.coding.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.coding.extension",
        path: "Observation.category.coding.extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.coding.extension.id",
        path: "Observation.category.coding.extension.id",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "1",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.coding.system",
        path: "Observation.category.coding.system",
        short: "Identity of the terminology system",
        definition:
          "The identification of the code system that defines the meaning of the symbol in the code.",
        comment:
          "The URI may be an OID (urn:oid:...) or a UUID (urn:uuid:...).  OIDs and UUIDs SHALL be references to the HL7 OID registry. Otherwise, the URI should come from HL7's list of FHIR defined special URIs or it should reference to some definition that establishes the system clearly and unambiguously.",
        requirements:
          "Need to be unambiguous about the source of the definition of the symbol.",
        min: 1,
        max: "1",
        base: {
          path: "Coding.system",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://terminology.hl7.org/CodeSystem/observation-category",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.3",
          },
          {
            identity: "rim",
            map: "./codeSystem",
          },
          {
            identity: "orim",
            map: "fhir:Coding.system rdfs:subPropertyOf dt:CDCoding.codeSystem",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.coding.version",
        path: "Observation.category.coding.version",
        short: "Version of the system - if relevant",
        definition:
          "The version of the code system which was used when choosing this code. Note that a well-maintained code system does not need the version reported, because the meaning of codes is consistent across versions. However this cannot consistently be assured, and when the meaning is not guaranteed to be consistent, the version SHOULD be exchanged.",
        comment:
          "Where the terminology does not clearly define what string should be used to identify code system versions, the recommendation is to use the date (expressed in FHIR date format) on which that version was officially published as the version date.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.version",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.7",
          },
          {
            identity: "rim",
            map: "./codeSystemVersion",
          },
          {
            identity: "orim",
            map:
              "fhir:Coding.version rdfs:subPropertyOf dt:CDCoding.codeSystemVersion",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.coding.code",
        path: "Observation.category.coding.code",
        short: "Symbol in syntax defined by the system",
        definition:
          "A symbol in syntax defined by the system. The symbol may be a predefined code or an expression in a syntax defined by the coding system (e.g. post-coordination).",
        requirements: "Need to refer to a particular code in the system.",
        min: 1,
        max: "1",
        base: {
          path: "Coding.code",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "vital-signs",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1",
          },
          {
            identity: "rim",
            map: "./code",
          },
          {
            identity: "orim",
            map: "fhir:Coding.code rdfs:subPropertyOf dt:CDCoding.code",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.coding.display",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.category.coding.display",
        short: "Representation defined by the system",
        definition:
          "A representation of the meaning of the code in the system, following the rules of the system.",
        requirements:
          "Need to be able to carry a human-readable meaning of the code for readers that do not know  the system.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.display",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.2 - but note this is not well followed",
          },
          {
            identity: "rim",
            map: "CV.displayName",
          },
          {
            identity: "orim",
            map:
              "fhir:Coding.display rdfs:subPropertyOf dt:CDCoding.displayName",
          },
        ],
      },
      {
        id: "Observation.category:VSCat.coding.userSelected",
        path: "Observation.category.coding.userSelected",
        short: "If this coding was chosen directly by the user",
        definition:
          "Indicates that this coding was chosen by a user directly - e.g. off a pick list of available items (codes or displays).",
        comment:
          "Amongst a set of alternatives, a directly chosen code is the most appropriate starting point for new translations. There is some ambiguity about what exactly 'directly chosen' implies, and trading partner agreement may be needed to clarify the use of this element and its consequences more completely.",
        requirements:
          "This has been identified as a clinical safety criterium - that this exact system/code pair was chosen explicitly, rather than inferred by the system based on some rules or language processing.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.userSelected",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "boolean",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "Sometimes implied by being first",
          },
          {
            identity: "rim",
            map: "CD.codingRationale",
          },
          {
            identity: "orim",
            map:
              'fhir:Coding.userSelected fhir:mapsTo dt:CDCoding.codingRationale. fhir:Coding.userSelected fhir:hasMap fhir:Coding.userSelected.map. fhir:Coding.userSelected.map a fhir:Map;   fhir:target dt:CDCoding.codingRationale. fhir:Coding.userSelected\\#true a [     fhir:source "true";     fhir:target dt:CDCoding.codingRationale\\#O   ]',
          },
        ],
      },
      {
        id: "Observation.category:VSCat.text",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.category.text",
        short: "Plain text representation of the concept",
        definition:
          "A human language representation of the concept as seen/selected/uttered by the user who entered the data and/or which represents the intended meaning of the user.",
        comment:
          "Very often the text is the same as a displayName of one of the codings.",
        requirements:
          "The codes from the terminologies do not always capture the correct meaning with all the nuances of the human using them, or sometimes there is no appropriate code at all. In these cases, the text is used to capture the full meaning of the source.",
        min: 0,
        max: "1",
        base: {
          path: "CodeableConcept.text",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.9. But note many systems use C*E.2 for this",
          },
          {
            identity: "rim",
            map: './originalText[mediaType/code="text/plain"]/data',
          },
          {
            identity: "orim",
            map:
              "fhir:CodeableConcept.text rdfs:subPropertyOf dt:CD.originalText",
          },
        ],
      },
      {
        id: "Observation.code",
        path: "Observation.code",
        short: "Blood Pressure",
        definition: "Blood Pressure.",
        comment:
          "additional codes that translate or map to this code are allowed.  For example a more granular LOINC code or code that is used locally in a system.",
        requirements:
          "5. SHALL contain exactly one [1..1] code, where the @code SHOULD be selected from ValueSet HITSP Vital Sign Result Type 2.16.840.1.113883.3.88.12.80.62 DYNAMIC (CONF:7301).",
        alias: ["Name", "Test"],
        min: 1,
        max: "1",
        base: {
          path: "Observation.code",
          min: 1,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "VitalSigns",
            },
          ],
          strength: "extensible",
          description: "This identifies the vital sign result type.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-vitalsignresult",
        },
        mapping: [
          {
            identity: "workflow",
            map: "Event.code",
          },
          {
            identity: "w5",
            map: "FiveWs.what[x]",
          },
          {
            identity: "sct-concept",
            map:
              "< 363787002 |Observable entity| OR < 386053000 |Evaluation procedure|",
          },
          {
            identity: "v2",
            map: "OBX-3",
          },
          {
            identity: "rim",
            map: "code",
          },
          {
            identity: "sct-attr",
            map: "116680003 |Is a|",
          },
        ],
      },
      {
        id: "Observation.code.id",
        path: "Observation.code.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.code.extension",
        path: "Observation.code.extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.code.coding",
        path: "Observation.code.coding",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "code",
            },
            {
              type: "value",
              path: "system",
            },
          ],
          ordered: false,
          rules: "open",
        },
        short: "Code defined by a terminology system",
        definition: "A reference to a code defined by a terminology system.",
        comment:
          "Codes may be defined very casually in enumerations, or code lists, up to very formal definitions such as SNOMED CT - see the HL7 v3 Core Principles for more information.  Ordering of codings is undefined and SHALL NOT be used to infer meaning. Generally, at most only one of the coding values will be labeled as UserSelected = true.",
        requirements:
          "Allows for alternative encodings within a code system, and translations to other code systems.",
        min: 0,
        max: "*",
        base: {
          path: "CodeableConcept.coding",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Coding",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1-8, C*E.10-22",
          },
          {
            identity: "rim",
            map: "union(., ./translation)",
          },
          {
            identity: "orim",
            map: "fhir:CodeableConcept.coding rdfs:subPropertyOf dt:CD.coding",
          },
        ],
      },
      {
        id: "Observation.code.coding:BPCode",
        path: "Observation.code.coding",
        sliceName: "BPCode",
        short: "Code defined by a terminology system",
        definition: "A reference to a code defined by a terminology system.",
        comment:
          "Codes may be defined very casually in enumerations, or code lists, up to very formal definitions such as SNOMED CT - see the HL7 v3 Core Principles for more information.  Ordering of codings is undefined and SHALL NOT be used to infer meaning. Generally, at most only one of the coding values will be labeled as UserSelected = true.",
        requirements:
          "Allows for alternative encodings within a code system, and translations to other code systems.",
        min: 1,
        max: "1",
        base: {
          path: "CodeableConcept.coding",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Coding",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1-8, C*E.10-22",
          },
          {
            identity: "rim",
            map: "union(., ./translation)",
          },
          {
            identity: "orim",
            map: "fhir:CodeableConcept.coding rdfs:subPropertyOf dt:CD.coding",
          },
        ],
      },
      {
        id: "Observation.code.coding:BPCode.id",
        path: "Observation.code.coding.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.code.coding:BPCode.extension",
        path: "Observation.code.coding.extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.code.coding:BPCode.system",
        path: "Observation.code.coding.system",
        short: "Identity of the terminology system",
        definition:
          "The identification of the code system that defines the meaning of the symbol in the code.",
        comment:
          "The URI may be an OID (urn:oid:...) or a UUID (urn:uuid:...).  OIDs and UUIDs SHALL be references to the HL7 OID registry. Otherwise, the URI should come from HL7's list of FHIR defined special URIs or it should reference to some definition that establishes the system clearly and unambiguously.",
        requirements:
          "Need to be unambiguous about the source of the definition of the symbol.",
        min: 1,
        max: "1",
        base: {
          path: "Coding.system",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://loinc.org",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.3",
          },
          {
            identity: "rim",
            map: "./codeSystem",
          },
          {
            identity: "orim",
            map: "fhir:Coding.system rdfs:subPropertyOf dt:CDCoding.codeSystem",
          },
        ],
      },
      {
        id: "Observation.code.coding:BPCode.version",
        path: "Observation.code.coding.version",
        short: "Version of the system - if relevant",
        definition:
          "The version of the code system which was used when choosing this code. Note that a well-maintained code system does not need the version reported, because the meaning of codes is consistent across versions. However this cannot consistently be assured, and when the meaning is not guaranteed to be consistent, the version SHOULD be exchanged.",
        comment:
          "Where the terminology does not clearly define what string should be used to identify code system versions, the recommendation is to use the date (expressed in FHIR date format) on which that version was officially published as the version date.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.version",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.7",
          },
          {
            identity: "rim",
            map: "./codeSystemVersion",
          },
          {
            identity: "orim",
            map:
              "fhir:Coding.version rdfs:subPropertyOf dt:CDCoding.codeSystemVersion",
          },
        ],
      },
      {
        id: "Observation.code.coding:BPCode.code",
        path: "Observation.code.coding.code",
        short: "Symbol in syntax defined by the system",
        definition:
          "A symbol in syntax defined by the system. The symbol may be a predefined code or an expression in a syntax defined by the coding system (e.g. post-coordination).",
        requirements: "Need to refer to a particular code in the system.",
        min: 1,
        max: "1",
        base: {
          path: "Coding.code",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "85354-9",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1",
          },
          {
            identity: "rim",
            map: "./code",
          },
          {
            identity: "orim",
            map: "fhir:Coding.code rdfs:subPropertyOf dt:CDCoding.code",
          },
        ],
      },
      {
        id: "Observation.code.coding:BPCode.display",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.code.coding.display",
        short: "Representation defined by the system",
        definition:
          "A representation of the meaning of the code in the system, following the rules of the system.",
        requirements:
          "Need to be able to carry a human-readable meaning of the code for readers that do not know  the system.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.display",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.2 - but note this is not well followed",
          },
          {
            identity: "rim",
            map: "CV.displayName",
          },
          {
            identity: "orim",
            map:
              "fhir:Coding.display rdfs:subPropertyOf dt:CDCoding.displayName",
          },
        ],
      },
      {
        id: "Observation.code.coding:BPCode.userSelected",
        path: "Observation.code.coding.userSelected",
        short: "If this coding was chosen directly by the user",
        definition:
          "Indicates that this coding was chosen by a user directly - e.g. off a pick list of available items (codes or displays).",
        comment:
          "Amongst a set of alternatives, a directly chosen code is the most appropriate starting point for new translations. There is some ambiguity about what exactly 'directly chosen' implies, and trading partner agreement may be needed to clarify the use of this element and its consequences more completely.",
        requirements:
          "This has been identified as a clinical safety criterium - that this exact system/code pair was chosen explicitly, rather than inferred by the system based on some rules or language processing.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.userSelected",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "boolean",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "Sometimes implied by being first",
          },
          {
            identity: "rim",
            map: "CD.codingRationale",
          },
          {
            identity: "orim",
            map:
              'fhir:Coding.userSelected fhir:mapsTo dt:CDCoding.codingRationale. fhir:Coding.userSelected fhir:hasMap fhir:Coding.userSelected.map. fhir:Coding.userSelected.map a fhir:Map;   fhir:target dt:CDCoding.codingRationale. fhir:Coding.userSelected\\#true a [     fhir:source "true";     fhir:target dt:CDCoding.codingRationale\\#O   ]',
          },
        ],
      },
      {
        id: "Observation.code.text",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.code.text",
        short: "Plain text representation of the concept",
        definition:
          "A human language representation of the concept as seen/selected/uttered by the user who entered the data and/or which represents the intended meaning of the user.",
        comment:
          "Very often the text is the same as a displayName of one of the codings.",
        requirements:
          "The codes from the terminologies do not always capture the correct meaning with all the nuances of the human using them, or sometimes there is no appropriate code at all. In these cases, the text is used to capture the full meaning of the source.",
        min: 0,
        max: "1",
        base: {
          path: "CodeableConcept.text",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.9. But note many systems use C*E.2 for this",
          },
          {
            identity: "rim",
            map: './originalText[mediaType/code="text/plain"]/data',
          },
          {
            identity: "orim",
            map:
              "fhir:CodeableConcept.text rdfs:subPropertyOf dt:CD.originalText",
          },
        ],
      },
      {
        id: "Observation.subject",
        path: "Observation.subject",
        short: "Who and/or what the observation is about",
        definition:
          "The patient, or group of patients, location, or device this observation is about and into whose record the observation is placed. If the actual focus of the observation is different from the subject (or a sample of, part, or region of the subject), the `focus` element or the `code` itself specifies the actual focus of the observation.",
        comment:
          "One would expect this element to be a cardinality of 1..1. The only circumstance in which the subject can be missing is when the observation is made by a device that does not know the patient. In this case, the observation SHALL be matched to a patient through some context/channel matching technique, and at this point, the observation should be updated.",
        requirements:
          "Observations have no value if you don't know who or what they're about.",
        min: 1,
        max: "1",
        base: {
          path: "Observation.subject",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Reference",
            targetProfile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "workflow",
            map: "Event.subject",
          },
          {
            identity: "w5",
            map: "FiveWs.subject[x]",
          },
          {
            identity: "v2",
            map: "PID-3",
          },
          {
            identity: "rim",
            map: "participation[typeCode=RTGT] ",
          },
          {
            identity: "w5",
            map: "FiveWs.subject",
          },
        ],
      },
      {
        id: "Observation.focus",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
            valueCode: "trial-use",
          },
        ],
        path: "Observation.focus",
        short:
          "What the observation is about, when it is not about the subject of record",
        definition:
          "The actual focus of an observation when it is not the patient of record representing something or someone associated with the patient such as a spouse, parent, fetus, or donor. For example, fetus observations in a mother's record.  The focus of an observation could also be an existing condition,  an intervention, the subject's diet,  another observation of the subject,  or a body structure such as tumor or implanted device.   An example use case would be using the Observation resource to capture whether the mother is trained to change her child's tracheostomy tube. In this example, the child is the patient of record and the mother is the focus.",
        comment:
          'Typically, an observation is made about the subject - a patient, or group of patients, location, or device - and the distinction between the subject and what is directly measured for an observation is specified in the observation code itself ( e.g., "Blood Glucose") and does not need to be represented separately using this element.  Use `specimen` if a reference to a specimen is required.  If a code is required instead of a resource use either  `bodysite` for bodysites or the standard extension [focusCode](http://hl7.org/fhir/extension-observation-focuscode.html).',
        min: 0,
        max: "*",
        base: {
          path: "Observation.focus",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Reference",
            targetProfile: ["http://hl7.org/fhir/StructureDefinition/Resource"],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.subject[x]",
          },
          {
            identity: "v2",
            map: "OBX-3",
          },
          {
            identity: "rim",
            map: "participation[typeCode=SBJ]",
          },
          {
            identity: "w5",
            map: "FiveWs.subject",
          },
        ],
      },
      {
        id: "Observation.encounter",
        path: "Observation.encounter",
        short: "Healthcare event during which this observation is made",
        definition:
          "The healthcare event  (e.g. a patient and healthcare provider interaction) during which this observation is made.",
        comment:
          "This will typically be the encounter the event occurred within, but some events may be initiated prior to or after the official completion of an encounter but still be tied to the context of the encounter (e.g. pre-admission laboratory tests).",
        requirements:
          "For some observations it may be important to know the link between an observation and a particular encounter.",
        alias: ["Context"],
        min: 0,
        max: "1",
        base: {
          path: "Observation.encounter",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Encounter",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "workflow",
            map: "Event.context",
          },
          {
            identity: "w5",
            map: "FiveWs.context",
          },
          {
            identity: "v2",
            map: "PV1",
          },
          {
            identity: "rim",
            map:
              "inboundRelationship[typeCode=COMP].source[classCode=ENC, moodCode=EVN]",
          },
        ],
      },
      {
        id: "Observation.effective[x]",
        path: "Observation.effective[x]",
        short: "Often just a dateTime for Vital Signs",
        definition: "Often just a dateTime for Vital Signs.",
        comment:
          'At least a date should be present unless this observation is a historical report.  For recording imprecise or "fuzzy" times (For example, a blood glucose measurement taken "after breakfast") use the [Timing](http://hl7.org/fhir/datatypes.html#timing) datatype which allow the measurement to be tied to regular life events.',
        requirements:
          "Knowing when an observation was deemed true is important to its relevance as well as determining trends.",
        alias: ["Occurrence"],
        min: 1,
        max: "1",
        base: {
          path: "Observation.effective[x]",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "dateTime",
          },
          {
            code: "Period",
          },
        ],
        condition: ["vs-1"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "vs-1",
            severity: "error",
            human:
              "if Observation.effective[x] is dateTime and has a value then that value shall be precise to the day",
            expression: "($this as dateTime).toString().length() >= 8",
            xpath:
              "f:effectiveDateTime[matches(@value, '^\\d{4}-\\d{2}-\\d{2}')]",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "workflow",
            map: "Event.occurrence[x]",
          },
          {
            identity: "w5",
            map: "FiveWs.done[x]",
          },
          {
            identity: "v2",
            map:
              "OBX-14, and/or OBX-19 after v2.4  (depends on who observation made)",
          },
          {
            identity: "rim",
            map: "effectiveTime",
          },
        ],
      },
      {
        id: "Observation.issued",
        path: "Observation.issued",
        short: "Date/Time this version was made available",
        definition:
          "The date and time this version of the observation was made available to providers, typically after the results have been reviewed and verified.",
        comment:
          "For Observations that don’t require review and verification, it may be the same as the [`lastUpdated` ](http://hl7.org/fhir/resource-definitions.html#Meta.lastUpdated) time of the resource itself.  For Observations that do require review and verification for certain updates, it might not be the same as the `lastUpdated` time of the resource itself due to a non-clinically significant update that doesn’t require the new version to be reviewed and verified again.",
        min: 0,
        max: "1",
        base: {
          path: "Observation.issued",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "instant",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.recorded",
          },
          {
            identity: "v2",
            map:
              "OBR.22 (or MSH.7), or perhaps OBX-19 (depends on who observation made)",
          },
          {
            identity: "rim",
            map: "participation[typeCode=AUT].time",
          },
        ],
      },
      {
        id: "Observation.performer",
        path: "Observation.performer",
        short: "Who is responsible for the observation",
        definition:
          'Who was responsible for asserting the observed value as "true".',
        requirements:
          "May give a degree of confidence in the observation and also indicates where follow-up questions should be directed.",
        min: 0,
        max: "*",
        base: {
          path: "Observation.performer",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Practitioner",
              "http://hl7.org/fhir/StructureDefinition/PractitionerRole",
              "http://hl7.org/fhir/StructureDefinition/Organization",
              "http://hl7.org/fhir/StructureDefinition/CareTeam",
              "http://hl7.org/fhir/StructureDefinition/Patient",
              "http://hl7.org/fhir/StructureDefinition/RelatedPerson",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "workflow",
            map: "Event.performer.actor",
          },
          {
            identity: "w5",
            map: "FiveWs.actor",
          },
          {
            identity: "v2",
            map:
              "OBX.15 / (Practitioner)  OBX-16,  PRT-5:PRT-4='RO' /  (Device)  OBX-18 , PRT-10:PRT-4='EQUIP' / (Organization)  OBX-23,  PRT-8:PRT-4='PO'",
          },
          {
            identity: "rim",
            map: "participation[typeCode=PRF]",
          },
        ],
      },
      {
        id: "Observation.value[x]",
        path: "Observation.value[x]",
        slicing: {
          discriminator: [
            {
              type: "type",
              path: "$this",
            },
          ],
          ordered: false,
          rules: "closed",
        },
        short:
          "Vital Signs value are recorded using the Quantity data type. For supporting observations such as Cuff size could use other datatypes such as CodeableConcept.",
        definition:
          "Vital Signs value are recorded using the Quantity data type. For supporting observations such as Cuff size could use other datatypes such as CodeableConcept.",
        comment:
          "An observation may have; 1)  a single value here, 2)  both a value and a set of related or component values,  or 3)  only a set of related or component values. If a value is present, the datatype for this element should be determined by Observation.code.  A CodeableConcept with just a text would be used instead of a string if the field was usually coded, or if the type associated with the Observation.code defines a coded value.  For additional guidance, see the [Notes section](http://hl7.org/fhir/observation.html#notes) below.",
        requirements:
          '9. SHALL contain exactly one [1..1] value with @xsi:type="PQ" (CONF:7305).',
        min: 0,
        max: "1",
        base: {
          path: "Observation.value[x]",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Quantity",
          },
        ],
        condition: ["obs-7", "vs-2"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "sct-concept",
            map: "< 441742003 |Evaluation finding|",
          },
          {
            identity: "v2",
            map: "OBX.2, OBX.5, OBX.6",
          },
          {
            identity: "rim",
            map: "value",
          },
          {
            identity: "sct-attr",
            map: "363714003 |Interprets|",
          },
        ],
      },
      {
        id: "Observation.value[x]:valueQuantity",
        path: "Observation.value[x]",
        sliceName: "valueQuantity",
        short:
          "Vital Signs value are recorded using the Quantity data type. For supporting observations such as Cuff size could use other datatypes such as CodeableConcept.",
        definition:
          "Vital Signs value are recorded using the Quantity data type. For supporting observations such as Cuff size could use other datatypes such as CodeableConcept.",
        comment:
          "An observation may have; 1)  a single value here, 2)  both a value and a set of related or component values,  or 3)  only a set of related or component values. If a value is present, the datatype for this element should be determined by Observation.code.  A CodeableConcept with just a text would be used instead of a string if the field was usually coded, or if the type associated with the Observation.code defines a coded value.  For additional guidance, see the [Notes section](http://hl7.org/fhir/observation.html#notes) below.",
        requirements:
          '9. SHALL contain exactly one [1..1] value with @xsi:type="PQ" (CONF:7305).',
        min: 0,
        max: "0",
        base: {
          path: "Observation.value[x]",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Quantity",
          },
        ],
        condition: ["obs-7", "vs-2"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "sct-concept",
            map: "< 441742003 |Evaluation finding|",
          },
          {
            identity: "v2",
            map: "OBX.2, OBX.5, OBX.6",
          },
          {
            identity: "rim",
            map: "value",
          },
          {
            identity: "sct-attr",
            map: "363714003 |Interprets|",
          },
        ],
      },
      {
        id: "Observation.dataAbsentReason",
        path: "Observation.dataAbsentReason",
        short: "Why the result is missing",
        definition:
          "Provides a reason why the expected value in the element Observation.value[x] is missing.",
        comment:
          'Null or exceptional values can be represented two ways in FHIR Observations.  One way is to simply include them in the value set and represent the exceptions in the value.  For example, measurement values for a serology test could be  "detected", "not detected", "inconclusive", or  "specimen unsatisfactory".   \n\nThe alternate way is to use the value element for actual observations and use the explicit dataAbsentReason element to record exceptional values.  For example, the dataAbsentReason code "error" could be used when the measurement was not completed. Note that an observation may only be reported if there are values to report. For example differential cell counts values may be reported only when > 0.  Because of these options, use-case agreements are required to interpret general observations for null or exceptional values.',
        requirements:
          "For many results it is necessary to handle exceptional values in measurements.",
        min: 0,
        max: "1",
        base: {
          path: "Observation.dataAbsentReason",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        condition: ["obs-6", "vs-2"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationValueAbsentReason",
            },
          ],
          strength: "extensible",
          description:
            "Codes specifying why the result (`Observation.value[x]`) is missing.",
          valueSet: "http://hl7.org/fhir/ValueSet/data-absent-reason",
        },
        mapping: [
          {
            identity: "v2",
            map: "N/A",
          },
          {
            identity: "rim",
            map: "value.nullFlavor",
          },
        ],
      },
      {
        id: "Observation.interpretation",
        path: "Observation.interpretation",
        short: "High, low, normal, etc.",
        definition:
          "A categorical assessment of an observation value.  For example, high, low, normal.",
        comment:
          "Historically used for laboratory results (known as 'abnormal flag' ),  its use extends to other use cases where coded interpretations  are relevant.  Often reported as one or more simple compact codes this element is often placed adjacent to the result value in reports and flow sheets to signal the meaning/normalcy status of the result.",
        requirements:
          "For some results, particularly numeric results, an interpretation is necessary to fully understand the significance of a result.",
        alias: ["Abnormal Flag"],
        min: 0,
        max: "*",
        base: {
          path: "Observation.interpretation",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationInterpretation",
            },
          ],
          strength: "extensible",
          description: "Codes identifying interpretations of observations.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-interpretation",
        },
        mapping: [
          {
            identity: "sct-concept",
            map: "< 260245000 |Findings values|",
          },
          {
            identity: "v2",
            map: "OBX-8",
          },
          {
            identity: "rim",
            map: "interpretationCode",
          },
          {
            identity: "sct-attr",
            map: "363713009 |Has interpretation|",
          },
        ],
      },
      {
        id: "Observation.note",
        path: "Observation.note",
        short: "Comments about the observation",
        definition: "Comments about the observation or the results.",
        comment:
          "May include general statements about the observation, or statements about significant, unexpected or unreliable results values, or information about its source when relevant to its interpretation.",
        requirements:
          "Need to be able to provide free text additional information.",
        min: 0,
        max: "*",
        base: {
          path: "Observation.note",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Annotation",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map:
              "NTE.3 (partner NTE to OBX, or sometimes another (child?) OBX)",
          },
          {
            identity: "rim",
            map: 'subjectOf.observationEvent[code="annotation"].value',
          },
        ],
      },
      {
        id: "Observation.bodySite",
        path: "Observation.bodySite",
        short: "Observed body part",
        definition:
          "Indicates the site on the subject's body where the observation was made (i.e. the target site).",
        comment:
          "Only used if not implicit in code found in Observation.code.  In many systems, this may be represented as a related observation instead of an inline component.   \n\nIf the use case requires BodySite to be handled as a separate resource (e.g. to identify and track separately) then use the standard extension[ bodySite](http://hl7.org/fhir/extension-bodysite.html).",
        min: 0,
        max: "1",
        base: {
          path: "Observation.bodySite",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "BodySite",
            },
          ],
          strength: "example",
          description:
            "Codes describing anatomical locations. May include laterality.",
          valueSet: "http://hl7.org/fhir/ValueSet/body-site",
        },
        mapping: [
          {
            identity: "sct-concept",
            map: "< 123037004 |Body structure|",
          },
          {
            identity: "v2",
            map: "OBX-20",
          },
          {
            identity: "rim",
            map: "targetSiteCode",
          },
          {
            identity: "sct-attr",
            map: "718497002 |Inherent location|",
          },
        ],
      },
      {
        id: "Observation.method",
        path: "Observation.method",
        short: "How it was done",
        definition: "Indicates the mechanism used to perform the observation.",
        comment: "Only used if not implicit in code for Observation.code.",
        requirements:
          "In some cases, method can impact results and is thus used for determining whether results can be compared or determining significance of results.",
        min: 0,
        max: "1",
        base: {
          path: "Observation.method",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationMethod",
            },
          ],
          strength: "example",
          description: "Methods for simple observations.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-methods",
        },
        mapping: [
          {
            identity: "v2",
            map: "OBX-17",
          },
          {
            identity: "rim",
            map: "methodCode",
          },
        ],
      },
      {
        id: "Observation.specimen",
        path: "Observation.specimen",
        short: "Specimen used for this observation",
        definition:
          "The specimen that was used when this observation was made.",
        comment:
          "Should only be used if not implicit in code found in `Observation.code`.  Observations are not made on specimens themselves; they are made on a subject, but in many cases by the means of a specimen. Note that although specimens are often involved, they are not always tracked and reported explicitly. Also note that observation resources may be used in contexts that track the specimen explicitly (e.g. Diagnostic Report).",
        min: 0,
        max: "1",
        base: {
          path: "Observation.specimen",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Reference",
            targetProfile: ["http://hl7.org/fhir/StructureDefinition/Specimen"],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "sct-concept",
            map: "< 123038009 |Specimen|",
          },
          {
            identity: "v2",
            map: "SPM segment",
          },
          {
            identity: "rim",
            map: "participation[typeCode=SPC].specimen",
          },
          {
            identity: "sct-attr",
            map: "704319004 |Inherent in|",
          },
        ],
      },
      {
        id: "Observation.device",
        path: "Observation.device",
        short: "(Measurement) Device",
        definition: "The device used to generate the observation data.",
        comment:
          "Note that this is not meant to represent a device involved in the transmission of the result, e.g., a gateway.  Such devices may be documented using the Provenance resource where relevant.",
        min: 0,
        max: "1",
        base: {
          path: "Observation.device",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Device",
              "http://hl7.org/fhir/StructureDefinition/DeviceMetric",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "sct-concept",
            map: "< 49062001 |Device|",
          },
          {
            identity: "v2",
            map: "OBX-17 / PRT -10",
          },
          {
            identity: "rim",
            map: "participation[typeCode=DEV]",
          },
          {
            identity: "sct-attr",
            map: "424226004 |Using device|",
          },
        ],
      },
      {
        id: "Observation.referenceRange",
        path: "Observation.referenceRange",
        short: "Provides guide for interpretation",
        definition:
          'Guidance on how to interpret the value by comparison to a normal or recommended range.  Multiple reference ranges are interpreted as an "OR".   In other words, to represent two distinct target populations, two `referenceRange` elements would be used.',
        comment:
          "Most observations only have one generic reference range. Systems MAY choose to restrict to only supplying the relevant reference range based on knowledge about the patient (e.g., specific to the patient's age, gender, weight and other factors), but this might not be possible or appropriate. Whenever more than one reference range is supplied, the differences between them SHOULD be provided in the reference range and/or age properties.",
        requirements:
          'Knowing what values are considered "normal" can help evaluate the significance of a particular result. Need to be able to provide multiple reference ranges for different contexts.',
        min: 0,
        max: "*",
        base: {
          path: "Observation.referenceRange",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "BackboneElement",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "obs-3",
            severity: "error",
            human: "Must have at least a low or a high or text",
            expression: "low.exists() or high.exists() or text.exists()",
            xpath: "(exists(f:low) or exists(f:high)or exists(f:text))",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "OBX.7",
          },
          {
            identity: "rim",
            map:
              "outboundRelationship[typeCode=REFV]/target[classCode=OBS, moodCode=EVN]",
          },
        ],
      },
      {
        id: "Observation.referenceRange.id",
        path: "Observation.referenceRange.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.referenceRange.extension",
        path: "Observation.referenceRange.extension",
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.referenceRange.modifierExtension",
        path: "Observation.referenceRange.modifierExtension",
        short: "Extensions that cannot be ignored even if unrecognized",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element and that modifies the understanding of the element in which it is contained and/or the understanding of the containing element's descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        requirements:
          "Modifier extensions allow for extensions that *cannot* be safely ignored to be clearly distinguished from the vast majority of extensions which can be safely ignored.  This promotes interoperability by eliminating the need for implementers to prohibit the presence of extensions. For further information, see the [definition of modifier extensions](http://hl7.org/fhir/extensibility.html#modifierExtension).",
        alias: ["extensions", "user content", "modifiers"],
        min: 0,
        max: "*",
        base: {
          path: "BackboneElement.modifierExtension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: true,
        isModifierReason:
          "Modifier extensions are expected to modify the meaning or interpretation of the element that contains them",
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Observation.referenceRange.low",
        path: "Observation.referenceRange.low",
        short: "Low Range, if relevant",
        definition:
          "The value of the low bound of the reference range.  The low bound of the reference range endpoint is inclusive of the value (e.g.  reference range is >=5 - <=9). If the low bound is omitted,  it is assumed to be meaningless (e.g. reference range is <=2.3).",
        min: 0,
        max: "1",
        base: {
          path: "Observation.referenceRange.low",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Quantity",
            profile: ["http://hl7.org/fhir/StructureDefinition/SimpleQuantity"],
          },
        ],
        condition: ["obs-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "OBX-7",
          },
          {
            identity: "rim",
            map: "value:IVL_PQ.low",
          },
        ],
      },
      {
        id: "Observation.referenceRange.high",
        path: "Observation.referenceRange.high",
        short: "High Range, if relevant",
        definition:
          "The value of the high bound of the reference range.  The high bound of the reference range endpoint is inclusive of the value (e.g.  reference range is >=5 - <=9). If the high bound is omitted,  it is assumed to be meaningless (e.g. reference range is >= 2.3).",
        min: 0,
        max: "1",
        base: {
          path: "Observation.referenceRange.high",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Quantity",
            profile: ["http://hl7.org/fhir/StructureDefinition/SimpleQuantity"],
          },
        ],
        condition: ["obs-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "OBX-7",
          },
          {
            identity: "rim",
            map: "value:IVL_PQ.high",
          },
        ],
      },
      {
        id: "Observation.referenceRange.type",
        path: "Observation.referenceRange.type",
        short: "Reference range qualifier",
        definition:
          "Codes to indicate the what part of the targeted reference population it applies to. For example, the normal or therapeutic range.",
        comment:
          "This SHOULD be populated if there is more than one range.  If this element is not present then the normal range is assumed.",
        requirements:
          "Need to be able to say what kind of reference range this is - normal, recommended, therapeutic, etc.,  - for proper interpretation.",
        min: 0,
        max: "1",
        base: {
          path: "Observation.referenceRange.type",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationRangeMeaning",
            },
          ],
          strength: "preferred",
          description: "Code for the meaning of a reference range.",
          valueSet: "http://hl7.org/fhir/ValueSet/referencerange-meaning",
        },
        mapping: [
          {
            identity: "sct-concept",
            map:
              "< 260245000 |Findings values| OR  \r< 365860008 |General clinical state finding| \rOR \r< 250171008 |Clinical history or observation findings| OR  \r< 415229000 |Racial group| OR \r< 365400002 |Finding of puberty stage| OR\r< 443938003 |Procedure carried out on subject|",
          },
          {
            identity: "v2",
            map: "OBX-10",
          },
          {
            identity: "rim",
            map: "interpretationCode",
          },
        ],
      },
      {
        id: "Observation.referenceRange.appliesTo",
        path: "Observation.referenceRange.appliesTo",
        short: "Reference range population",
        definition:
          'Codes to indicate the target population this reference range applies to.  For example, a reference range may be based on the normal population or a particular sex or race.  Multiple `appliesTo`  are interpreted as an "AND" of the target populations.  For example, to represent a target population of African American females, both a code of female and a code for African American would be used.',
        comment:
          "This SHOULD be populated if there is more than one range.  If this element is not present then the normal population is assumed.",
        requirements:
          "Need to be able to identify the target population for proper interpretation.",
        min: 0,
        max: "*",
        base: {
          path: "Observation.referenceRange.appliesTo",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationRangeType",
            },
          ],
          strength: "example",
          description:
            "Codes identifying the population the reference range applies to.",
          valueSet: "http://hl7.org/fhir/ValueSet/referencerange-appliesto",
        },
        mapping: [
          {
            identity: "sct-concept",
            map:
              "< 260245000 |Findings values| OR  \r< 365860008 |General clinical state finding| \rOR \r< 250171008 |Clinical history or observation findings| OR  \r< 415229000 |Racial group| OR \r< 365400002 |Finding of puberty stage| OR\r< 443938003 |Procedure carried out on subject|",
          },
          {
            identity: "v2",
            map: "OBX-10",
          },
          {
            identity: "rim",
            map: "interpretationCode",
          },
        ],
      },
      {
        id: "Observation.referenceRange.age",
        path: "Observation.referenceRange.age",
        short: "Applicable age range, if relevant",
        definition:
          "The age at which this reference range is applicable. This is a neonatal age (e.g. number of weeks at term) if the meaning says so.",
        requirements: "Some analytes vary greatly over age.",
        min: 0,
        max: "1",
        base: {
          path: "Observation.referenceRange.age",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Range",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map:
              'outboundRelationship[typeCode=PRCN].targetObservationCriterion[code="age"].value',
          },
        ],
      },
      {
        id: "Observation.referenceRange.text",
        path: "Observation.referenceRange.text",
        short: "Text based reference range in an observation",
        definition:
          'Text based reference range in an observation which may be used when a quantitative range is not appropriate for an observation.  An example would be a reference value of "Negative" or a list or table of "normals".',
        min: 0,
        max: "1",
        base: {
          path: "Observation.referenceRange.text",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "OBX-7",
          },
          {
            identity: "rim",
            map: "value:ST",
          },
        ],
      },
      {
        id: "Observation.hasMember",
        path: "Observation.hasMember",
        short: "Used when reporting vital signs panel components",
        definition: "Used when reporting vital signs panel components.",
        comment:
          "When using this element, an observation will typically have either a value or a set of related resources, although both may be present in some cases.  For a discussion on the ways Observations can assembled in groups together, see [Notes](http://hl7.org/fhir/observation.html#obsgrouping) below.  Note that a system may calculate results from [QuestionnaireResponse](http://hl7.org/fhir/questionnaireresponse.html)  into a final score and represent the score as an Observation.",
        min: 0,
        max: "*",
        base: {
          path: "Observation.hasMember",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/QuestionnaireResponse",
              "http://hl7.org/fhir/StructureDefinition/MolecularSequence",
              "http://hl7.org/fhir/StructureDefinition/vitalsigns",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "Relationships established by OBX-4 usage",
          },
          {
            identity: "rim",
            map: "outBoundRelationship",
          },
        ],
      },
      {
        id: "Observation.derivedFrom",
        path: "Observation.derivedFrom",
        short: "Related measurements the observation is made from",
        definition:
          "The target resource that represents a measurement from which this observation value is derived. For example, a calculated anion gap or a fetal measurement based on an ultrasound image.",
        comment:
          "All the reference choices that are listed in this element can represent clinical observations and other measurements that may be the source for a derived value.  The most common reference will be another Observation.  For a discussion on the ways Observations can assembled in groups together, see [Notes](http://hl7.org/fhir/observation.html#obsgrouping) below.",
        min: 0,
        max: "*",
        base: {
          path: "Observation.derivedFrom",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/DocumentReference",
              "http://hl7.org/fhir/StructureDefinition/ImagingStudy",
              "http://hl7.org/fhir/StructureDefinition/Media",
              "http://hl7.org/fhir/StructureDefinition/QuestionnaireResponse",
              "http://hl7.org/fhir/StructureDefinition/MolecularSequence",
              "http://hl7.org/fhir/StructureDefinition/vitalsigns",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "Relationships established by OBX-4 usage",
          },
          {
            identity: "rim",
            map: ".targetObservation",
          },
        ],
      },
      {
        id: "Observation.component",
        path: "Observation.component",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "code.coding.code",
            },
            {
              type: "value",
              path: "code.coding.system",
            },
          ],
          ordered: false,
          rules: "open",
        },
        short: "Used when reporting systolic and diastolic blood pressure.",
        definition:
          "Used when reporting systolic and diastolic blood pressure.",
        comment:
          "For a discussion on the ways Observations can be assembled in groups together see [Notes](http://hl7.org/fhir/observation.html#notes) below.",
        requirements:
          "Component observations share the same attributes in the Observation resource as the primary observation and are always treated a part of a single observation (they are not separable).   However, the reference range for the primary observation value is not inherited by the component values and is required when appropriate for each component observation.",
        min: 2,
        max: "*",
        base: {
          path: "Observation.component",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "BackboneElement",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "vs-3",
            severity: "error",
            human:
              "If there is no a value a data absent reason must be present",
            expression: "value.exists() or dataAbsentReason.exists()",
            xpath:
              "f:*[starts-with(local-name(.), 'value')] or f:dataAbsentReason",
            source: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "containment by OBX-4?",
          },
          {
            identity: "rim",
            map: "outBoundRelationship[typeCode=COMP]",
          },
        ],
      },
      {
        id: "Observation.component.id",
        path: "Observation.component.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component.extension",
        path: "Observation.component.extension",
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component.modifierExtension",
        path: "Observation.component.modifierExtension",
        short: "Extensions that cannot be ignored even if unrecognized",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element and that modifies the understanding of the element in which it is contained and/or the understanding of the containing element's descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        requirements:
          "Modifier extensions allow for extensions that *cannot* be safely ignored to be clearly distinguished from the vast majority of extensions which can be safely ignored.  This promotes interoperability by eliminating the need for implementers to prohibit the presence of extensions. For further information, see the [definition of modifier extensions](http://hl7.org/fhir/extensibility.html#modifierExtension).",
        alias: ["extensions", "user content", "modifiers"],
        min: 0,
        max: "*",
        base: {
          path: "BackboneElement.modifierExtension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: true,
        isModifierReason:
          "Modifier extensions are expected to modify the meaning or interpretation of the element that contains them",
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Observation.component.code",
        path: "Observation.component.code",
        short: "Type of component observation (code / type)",
        definition:
          'Describes what was observed. Sometimes this is called the observation "code".',
        comment:
          "*All* code-value and  component.code-component.value pairs need to be taken into account to correctly understand the meaning of the observation.",
        requirements:
          "Knowing what kind of observation is being made is essential to understanding the observation.",
        min: 1,
        max: "1",
        base: {
          path: "Observation.component.code",
          min: 1,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "VitalSigns",
            },
          ],
          strength: "extensible",
          description: "This identifies the vital sign result type.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-vitalsignresult",
        },
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.what[x]",
          },
          {
            identity: "sct-concept",
            map:
              "< 363787002 |Observable entity| OR \r< 386053000 |Evaluation procedure|",
          },
          {
            identity: "v2",
            map: "OBX-3",
          },
          {
            identity: "rim",
            map: "code",
          },
        ],
      },
      {
        id: "Observation.component.value[x]",
        path: "Observation.component.value[x]",
        short: "Vital Sign Value recorded with UCUM",
        definition: "Vital Sign Value recorded with UCUM.",
        comment:
          "Used when observation has a set of component observations. An observation may have both a value (e.g. an  Apgar score)  and component observations (the observations from which the Apgar score was derived). If a value is present, the datatype for this element should be determined by Observation.code. A CodeableConcept with just a text would be used instead of a string if the field was usually coded, or if the type associated with the Observation.code defines a coded value.  For additional guidance, see the [Notes section](http://hl7.org/fhir/observation.html#notes) below.",
        requirements:
          '9. SHALL contain exactly one [1..1] value with @xsi:type="PQ" (CONF:7305).',
        min: 0,
        max: "1",
        base: {
          path: "Observation.component.value[x]",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Quantity",
          },
          {
            code: "CodeableConcept",
          },
          {
            code: "string",
          },
          {
            code: "boolean",
          },
          {
            code: "integer",
          },
          {
            code: "Range",
          },
          {
            code: "Ratio",
          },
          {
            code: "SampledData",
          },
          {
            code: "time",
          },
          {
            code: "dateTime",
          },
          {
            code: "Period",
          },
        ],
        condition: ["vs-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "VitalSignsUnits",
            },
          ],
          strength: "required",
          description: "Common UCUM units for recording Vital Signs.",
          valueSet: "http://hl7.org/fhir/ValueSet/ucum-vitals-common|4.0.1",
        },
        mapping: [
          {
            identity: "sct-concept",
            map: "363714003 |Interprets| < 441742003 |Evaluation finding|",
          },
          {
            identity: "v2",
            map: "OBX.2, OBX.5, OBX.6",
          },
          {
            identity: "rim",
            map: "value",
          },
          {
            identity: "sct-attr",
            map: "363714003 |Interprets|",
          },
        ],
      },
      {
        id: "Observation.component.dataAbsentReason",
        path: "Observation.component.dataAbsentReason",
        short: "Why the component result is missing",
        definition:
          "Provides a reason why the expected value in the element Observation.component.value[x] is missing.",
        comment:
          '"Null" or exceptional values can be represented two ways in FHIR Observations.  One way is to simply include them in the value set and represent the exceptions in the value.  For example, measurement values for a serology test could be  "detected", "not detected", "inconclusive", or  "test not done". \n\nThe alternate way is to use the value element for actual observations and use the explicit dataAbsentReason element to record exceptional values.  For example, the dataAbsentReason code "error" could be used when the measurement was not completed.  Because of these options, use-case agreements are required to interpret general observations for exceptional values.',
        requirements:
          "For many results it is necessary to handle exceptional values in measurements.",
        min: 0,
        max: "1",
        base: {
          path: "Observation.component.dataAbsentReason",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        condition: ["obs-6", "vs-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationValueAbsentReason",
            },
          ],
          strength: "extensible",
          description:
            "Codes specifying why the result (`Observation.value[x]`) is missing.",
          valueSet: "http://hl7.org/fhir/ValueSet/data-absent-reason",
        },
        mapping: [
          {
            identity: "v2",
            map: "N/A",
          },
          {
            identity: "rim",
            map: "value.nullFlavor",
          },
        ],
      },
      {
        id: "Observation.component.interpretation",
        path: "Observation.component.interpretation",
        short: "High, low, normal, etc.",
        definition:
          "A categorical assessment of an observation value.  For example, high, low, normal.",
        comment:
          "Historically used for laboratory results (known as 'abnormal flag' ),  its use extends to other use cases where coded interpretations  are relevant.  Often reported as one or more simple compact codes this element is often placed adjacent to the result value in reports and flow sheets to signal the meaning/normalcy status of the result.",
        requirements:
          "For some results, particularly numeric results, an interpretation is necessary to fully understand the significance of a result.",
        alias: ["Abnormal Flag"],
        min: 0,
        max: "*",
        base: {
          path: "Observation.component.interpretation",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationInterpretation",
            },
          ],
          strength: "extensible",
          description: "Codes identifying interpretations of observations.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-interpretation",
        },
        mapping: [
          {
            identity: "sct-concept",
            map: "< 260245000 |Findings values|",
          },
          {
            identity: "v2",
            map: "OBX-8",
          },
          {
            identity: "rim",
            map: "interpretationCode",
          },
          {
            identity: "sct-attr",
            map: "363713009 |Has interpretation|",
          },
        ],
      },
      {
        id: "Observation.component.referenceRange",
        path: "Observation.component.referenceRange",
        short: "Provides guide for interpretation of component result",
        definition:
          "Guidance on how to interpret the value by comparison to a normal or recommended range.",
        comment:
          "Most observations only have one generic reference range. Systems MAY choose to restrict to only supplying the relevant reference range based on knowledge about the patient (e.g., specific to the patient's age, gender, weight and other factors), but this might not be possible or appropriate. Whenever more than one reference range is supplied, the differences between them SHOULD be provided in the reference range and/or age properties.",
        requirements:
          'Knowing what values are considered "normal" can help evaluate the significance of a particular result. Need to be able to provide multiple reference ranges for different contexts.',
        min: 0,
        max: "*",
        base: {
          path: "Observation.component.referenceRange",
          min: 0,
          max: "*",
        },
        contentReference: "#Observation.referenceRange",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "OBX.7",
          },
          {
            identity: "rim",
            map:
              "outboundRelationship[typeCode=REFV]/target[classCode=OBS, moodCode=EVN]",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP",
        path: "Observation.component",
        sliceName: "SystolicBP",
        short: "Used when reporting systolic and diastolic blood pressure.",
        definition:
          "Used when reporting systolic and diastolic blood pressure.",
        comment:
          "For a discussion on the ways Observations can be assembled in groups together see [Notes](http://hl7.org/fhir/observation.html#notes) below.",
        requirements:
          "Component observations share the same attributes in the Observation resource as the primary observation and are always treated a part of a single observation (they are not separable).   However, the reference range for the primary observation value is not inherited by the component values and is required when appropriate for each component observation.",
        min: 1,
        max: "1",
        base: {
          path: "Observation.component",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "BackboneElement",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "vs-3",
            severity: "error",
            human:
              "If there is no a value a data absent reason must be present",
            expression: "value.exists() or dataAbsentReason.exists()",
            xpath:
              "f:*[starts-with(local-name(.), 'value')] or f:dataAbsentReason",
            source: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "containment by OBX-4?",
          },
          {
            identity: "rim",
            map: "outBoundRelationship[typeCode=COMP]",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.id",
        path: "Observation.component.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.extension",
        path: "Observation.component.extension",
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.modifierExtension",
        path: "Observation.component.modifierExtension",
        short: "Extensions that cannot be ignored even if unrecognized",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element and that modifies the understanding of the element in which it is contained and/or the understanding of the containing element's descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        requirements:
          "Modifier extensions allow for extensions that *cannot* be safely ignored to be clearly distinguished from the vast majority of extensions which can be safely ignored.  This promotes interoperability by eliminating the need for implementers to prohibit the presence of extensions. For further information, see the [definition of modifier extensions](http://hl7.org/fhir/extensibility.html#modifierExtension).",
        alias: ["extensions", "user content", "modifiers"],
        min: 0,
        max: "*",
        base: {
          path: "BackboneElement.modifierExtension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: true,
        isModifierReason:
          "Modifier extensions are expected to modify the meaning or interpretation of the element that contains them",
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code",
        path: "Observation.component.code",
        short: "Type of component observation (code / type)",
        definition:
          'Describes what was observed. Sometimes this is called the observation "code".',
        comment:
          "additional codes that translate or map to this code are allowed.  For example a more granular LOINC code or code that is used locally in a system.",
        requirements:
          "Knowing what kind of observation is being made is essential to understanding the observation.",
        alias: ["Component Test", "Component Name"],
        min: 1,
        max: "1",
        base: {
          path: "Observation.component.code",
          min: 1,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "VitalSigns",
            },
          ],
          strength: "extensible",
          description: "This identifies the vital sign result type.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-vitalsignresult",
        },
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.what[x]",
          },
          {
            identity: "sct-concept",
            map:
              "< 363787002 |Observable entity| OR \r< 386053000 |Evaluation procedure|",
          },
          {
            identity: "v2",
            map: "OBX-3",
          },
          {
            identity: "rim",
            map: "code",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.id",
        path: "Observation.component.code.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.extension",
        path: "Observation.component.code.extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.coding",
        path: "Observation.component.code.coding",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "code",
            },
            {
              type: "value",
              path: "system",
            },
          ],
          ordered: false,
          rules: "open",
        },
        short: "Systolic Blood Pressure",
        definition: "Systolic Blood Pressure.",
        comment:
          "Codes may be defined very casually in enumerations, or code lists, up to very formal definitions such as SNOMED CT - see the HL7 v3 Core Principles for more information.  Ordering of codings is undefined and SHALL NOT be used to infer meaning. Generally, at most only one of the coding values will be labeled as UserSelected = true.",
        requirements:
          "Allows for alternative encodings within a code system, and translations to other code systems.",
        min: 0,
        max: "*",
        base: {
          path: "CodeableConcept.coding",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Coding",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1-8, C*E.10-22",
          },
          {
            identity: "rim",
            map: "union(., ./translation)",
          },
          {
            identity: "orim",
            map: "fhir:CodeableConcept.coding rdfs:subPropertyOf dt:CD.coding",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode",
        path: "Observation.component.code.coding",
        sliceName: "SBPCode",
        short: "Systolic Blood Pressure",
        definition: "Systolic Blood Pressure.",
        comment:
          "Codes may be defined very casually in enumerations, or code lists, up to very formal definitions such as SNOMED CT - see the HL7 v3 Core Principles for more information.  Ordering of codings is undefined and SHALL NOT be used to infer meaning. Generally, at most only one of the coding values will be labeled as UserSelected = true.",
        requirements:
          "Allows for alternative encodings within a code system, and translations to other code systems.",
        min: 1,
        max: "1",
        base: {
          path: "CodeableConcept.coding",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Coding",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1-8, C*E.10-22",
          },
          {
            identity: "rim",
            map: "union(., ./translation)",
          },
          {
            identity: "orim",
            map: "fhir:CodeableConcept.coding rdfs:subPropertyOf dt:CD.coding",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode.id",
        path: "Observation.component.code.coding.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode.extension",
        path: "Observation.component.code.coding.extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode.system",
        path: "Observation.component.code.coding.system",
        short: "Identity of the terminology system",
        definition:
          "The identification of the code system that defines the meaning of the symbol in the code.",
        comment:
          "The URI may be an OID (urn:oid:...) or a UUID (urn:uuid:...).  OIDs and UUIDs SHALL be references to the HL7 OID registry. Otherwise, the URI should come from HL7's list of FHIR defined special URIs or it should reference to some definition that establishes the system clearly and unambiguously.",
        requirements:
          "Need to be unambiguous about the source of the definition of the symbol.",
        min: 1,
        max: "1",
        base: {
          path: "Coding.system",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://loinc.org",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.3",
          },
          {
            identity: "rim",
            map: "./codeSystem",
          },
          {
            identity: "orim",
            map: "fhir:Coding.system rdfs:subPropertyOf dt:CDCoding.codeSystem",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode.version",
        path: "Observation.component.code.coding.version",
        short: "Version of the system - if relevant",
        definition:
          "The version of the code system which was used when choosing this code. Note that a well-maintained code system does not need the version reported, because the meaning of codes is consistent across versions. However this cannot consistently be assured, and when the meaning is not guaranteed to be consistent, the version SHOULD be exchanged.",
        comment:
          "Where the terminology does not clearly define what string should be used to identify code system versions, the recommendation is to use the date (expressed in FHIR date format) on which that version was officially published as the version date.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.version",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.7",
          },
          {
            identity: "rim",
            map: "./codeSystemVersion",
          },
          {
            identity: "orim",
            map:
              "fhir:Coding.version rdfs:subPropertyOf dt:CDCoding.codeSystemVersion",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode.code",
        path: "Observation.component.code.coding.code",
        short: "Symbol in syntax defined by the system",
        definition:
          "A symbol in syntax defined by the system. The symbol may be a predefined code or an expression in a syntax defined by the coding system (e.g. post-coordination).",
        requirements: "Need to refer to a particular code in the system.",
        min: 1,
        max: "1",
        base: {
          path: "Coding.code",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "8480-6",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1",
          },
          {
            identity: "rim",
            map: "./code",
          },
          {
            identity: "orim",
            map: "fhir:Coding.code rdfs:subPropertyOf dt:CDCoding.code",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode.display",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.component.code.coding.display",
        short: "Representation defined by the system",
        definition:
          "A representation of the meaning of the code in the system, following the rules of the system.",
        requirements:
          "Need to be able to carry a human-readable meaning of the code for readers that do not know  the system.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.display",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.2 - but note this is not well followed",
          },
          {
            identity: "rim",
            map: "CV.displayName",
          },
          {
            identity: "orim",
            map:
              "fhir:Coding.display rdfs:subPropertyOf dt:CDCoding.displayName",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode.userSelected",
        path: "Observation.component.code.coding.userSelected",
        short: "If this coding was chosen directly by the user",
        definition:
          "Indicates that this coding was chosen by a user directly - e.g. off a pick list of available items (codes or displays).",
        comment:
          "Amongst a set of alternatives, a directly chosen code is the most appropriate starting point for new translations. There is some ambiguity about what exactly 'directly chosen' implies, and trading partner agreement may be needed to clarify the use of this element and its consequences more completely.",
        requirements:
          "This has been identified as a clinical safety criterium - that this exact system/code pair was chosen explicitly, rather than inferred by the system based on some rules or language processing.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.userSelected",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "boolean",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "Sometimes implied by being first",
          },
          {
            identity: "rim",
            map: "CD.codingRationale",
          },
          {
            identity: "orim",
            map:
              'fhir:Coding.userSelected fhir:mapsTo dt:CDCoding.codingRationale. fhir:Coding.userSelected fhir:hasMap fhir:Coding.userSelected.map. fhir:Coding.userSelected.map a fhir:Map;   fhir:target dt:CDCoding.codingRationale. fhir:Coding.userSelected\\#true a [     fhir:source "true";     fhir:target dt:CDCoding.codingRationale\\#O   ]',
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.code.text",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.component.code.text",
        short: "Plain text representation of the concept",
        definition:
          "A human language representation of the concept as seen/selected/uttered by the user who entered the data and/or which represents the intended meaning of the user.",
        comment:
          "Very often the text is the same as a displayName of one of the codings.",
        requirements:
          "The codes from the terminologies do not always capture the correct meaning with all the nuances of the human using them, or sometimes there is no appropriate code at all. In these cases, the text is used to capture the full meaning of the source.",
        min: 0,
        max: "1",
        base: {
          path: "CodeableConcept.text",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.9. But note many systems use C*E.2 for this",
          },
          {
            identity: "rim",
            map: './originalText[mediaType/code="text/plain"]/data',
          },
          {
            identity: "orim",
            map:
              "fhir:CodeableConcept.text rdfs:subPropertyOf dt:CD.originalText",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.value[x]",
        path: "Observation.component.value[x]",
        short: "Vital Sign Value recorded with UCUM",
        definition: "Vital Sign Value recorded with UCUM.",
        comment:
          "Used when observation has a set of component observations. An observation may have both a value (e.g. an  Apgar score)  and component observations (the observations from which the Apgar score was derived). If a value is present, the datatype for this element should be determined by Observation.code. A CodeableConcept with just a text would be used instead of a string if the field was usually coded, or if the type associated with the Observation.code defines a coded value.  For additional guidance, see the [Notes section](http://hl7.org/fhir/observation.html#notes) below.",
        requirements:
          '9. SHALL contain exactly one [1..1] value with @xsi:type="PQ" (CONF:7305).',
        min: 0,
        max: "1",
        base: {
          path: "Observation.component.value[x]",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Quantity",
          },
        ],
        condition: ["vs-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "VitalSignsUnits",
            },
          ],
          strength: "required",
          description: "Common UCUM units for recording Vital Signs.",
          valueSet: "http://hl7.org/fhir/ValueSet/ucum-vitals-common|4.0.1",
        },
        mapping: [
          {
            identity: "sct-concept",
            map: "363714003 |Interprets| < 441742003 |Evaluation finding|",
          },
          {
            identity: "v2",
            map: "OBX.2, OBX.5, OBX.6",
          },
          {
            identity: "rim",
            map: "value",
          },
          {
            identity: "sct-attr",
            map: "363714003 |Interprets|",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.value[x].id",
        path: "Observation.component.value[x].id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.value[x].extension",
        path: "Observation.component.value[x].extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.value[x].value",
        path: "Observation.component.value[x].value",
        short: "Numerical value (with implicit precision)",
        definition:
          "The value of the measured amount. The value includes an implicit precision in the presentation of the value.",
        comment:
          "The implicit precision in the value should always be honored. Monetary values have their own rules for handling precision (refer to standard accounting text books).",
        requirements:
          "Precision is handled implicitly in almost all cases of measurement.",
        min: 1,
        max: "1",
        base: {
          path: "Quantity.value",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "decimal",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "SN.2  / CQ - N/A",
          },
          {
            identity: "rim",
            map:
              "PQ.value, CO.value, MO.value, IVL.high or IVL.low depending on the value",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.value[x].comparator",
        path: "Observation.component.value[x].comparator",
        short: "< | <= | >= | > - how to understand the value",
        definition:
          'How the value should be understood and represented - whether the actual value is greater or less than the stated value due to measurement issues; e.g. if the comparator is "<" , then the real value is < stated value.',
        requirements:
          "Need a framework for handling measures where the value is <5ug/L or >400mg/L due to the limitations of measuring methodology.",
        min: 0,
        max: "1",
        base: {
          path: "Quantity.comparator",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        meaningWhenMissing:
          "If there is no comparator, then there is no modification of the value",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: true,
        isModifierReason:
          'This is labeled as "Is Modifier" because the comparator modifies the interpretation of the value significantly. If there is no comparator, then there is no modification of the value',
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "QuantityComparator",
            },
          ],
          strength: "required",
          description: "How the Quantity should be understood and represented.",
          valueSet: "http://hl7.org/fhir/ValueSet/quantity-comparator|4.0.1",
        },
        mapping: [
          {
            identity: "v2",
            map: "SN.1  / CQ.1",
          },
          {
            identity: "rim",
            map: "IVL properties",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.value[x].unit",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.component.value[x].unit",
        short: "Unit representation",
        definition: "A human-readable form of the unit.",
        requirements:
          "There are many representations for units of measure and in many contexts, particular representations are fixed and required. I.e. mcg for micrograms.",
        min: 1,
        max: "1",
        base: {
          path: "Quantity.unit",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "(see OBX.6 etc.) / CQ.2",
          },
          {
            identity: "rim",
            map: "PQ.unit",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.value[x].system",
        path: "Observation.component.value[x].system",
        short: "System that defines coded unit form",
        definition:
          "The identification of the system that provides the coded form of the unit.",
        requirements:
          "Need to know the system that defines the coded form of the unit.",
        min: 1,
        max: "1",
        base: {
          path: "Quantity.system",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://unitsofmeasure.org",
        condition: ["qty-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "(see OBX.6 etc.) / CQ.2",
          },
          {
            identity: "rim",
            map: "CO.codeSystem, PQ.translation.codeSystem",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.value[x].code",
        path: "Observation.component.value[x].code",
        short:
          "Coded responses from the common UCUM units for vital signs value set.",
        definition:
          "Coded responses from the common UCUM units for vital signs value set.",
        comment:
          "The preferred system is UCUM, but SNOMED CT can also be used (for customary units) or ISO 4217 for currency.  The context of use may additionally require a code from a particular system.",
        requirements:
          "Need a computable form of the unit that is fixed across all forms. UCUM provides this for quantities, but SNOMED CT provides many units of interest.",
        min: 1,
        max: "1",
        base: {
          path: "Quantity.code",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "mm[Hg]",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "(see OBX.6 etc.) / CQ.2",
          },
          {
            identity: "rim",
            map: "PQ.code, MO.currency, PQ.translation.code",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.dataAbsentReason",
        path: "Observation.component.dataAbsentReason",
        short: "Why the component result is missing",
        definition:
          "Provides a reason why the expected value in the element Observation.component.value[x] is missing.",
        comment:
          '"Null" or exceptional values can be represented two ways in FHIR Observations.  One way is to simply include them in the value set and represent the exceptions in the value.  For example, measurement values for a serology test could be  "detected", "not detected", "inconclusive", or  "test not done". \n\nThe alternate way is to use the value element for actual observations and use the explicit dataAbsentReason element to record exceptional values.  For example, the dataAbsentReason code "error" could be used when the measurement was not completed.  Because of these options, use-case agreements are required to interpret general observations for exceptional values.',
        requirements:
          "For many results it is necessary to handle exceptional values in measurements.",
        min: 0,
        max: "1",
        base: {
          path: "Observation.component.dataAbsentReason",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        condition: ["obs-6", "vs-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationValueAbsentReason",
            },
          ],
          strength: "extensible",
          description:
            "Codes specifying why the result (`Observation.value[x]`) is missing.",
          valueSet: "http://hl7.org/fhir/ValueSet/data-absent-reason",
        },
        mapping: [
          {
            identity: "v2",
            map: "N/A",
          },
          {
            identity: "rim",
            map: "value.nullFlavor",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.interpretation",
        path: "Observation.component.interpretation",
        short: "High, low, normal, etc.",
        definition:
          "A categorical assessment of an observation value.  For example, high, low, normal.",
        comment:
          "Historically used for laboratory results (known as 'abnormal flag' ),  its use extends to other use cases where coded interpretations  are relevant.  Often reported as one or more simple compact codes this element is often placed adjacent to the result value in reports and flow sheets to signal the meaning/normalcy status of the result.",
        requirements:
          "For some results, particularly numeric results, an interpretation is necessary to fully understand the significance of a result.",
        alias: ["Abnormal Flag"],
        min: 0,
        max: "*",
        base: {
          path: "Observation.component.interpretation",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationInterpretation",
            },
          ],
          strength: "extensible",
          description: "Codes identifying interpretations of observations.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-interpretation",
        },
        mapping: [
          {
            identity: "sct-concept",
            map: "< 260245000 |Findings values|",
          },
          {
            identity: "v2",
            map: "OBX-8",
          },
          {
            identity: "rim",
            map: "interpretationCode",
          },
          {
            identity: "sct-attr",
            map: "363713009 |Has interpretation|",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.referenceRange",
        path: "Observation.component.referenceRange",
        short: "Provides guide for interpretation of component result",
        definition:
          "Guidance on how to interpret the value by comparison to a normal or recommended range.",
        comment:
          "Most observations only have one generic reference range. Systems MAY choose to restrict to only supplying the relevant reference range based on knowledge about the patient (e.g., specific to the patient's age, gender, weight and other factors), but this might not be possible or appropriate. Whenever more than one reference range is supplied, the differences between them SHOULD be provided in the reference range and/or age properties.",
        requirements:
          'Knowing what values are considered "normal" can help evaluate the significance of a particular result. Need to be able to provide multiple reference ranges for different contexts.',
        min: 0,
        max: "*",
        base: {
          path: "Observation.component.referenceRange",
          min: 0,
          max: "*",
        },
        contentReference: "#Observation.referenceRange",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "OBX.7",
          },
          {
            identity: "rim",
            map:
              "outboundRelationship[typeCode=REFV]/target[classCode=OBS, moodCode=EVN]",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP",
        path: "Observation.component",
        sliceName: "DiastolicBP",
        short: "Used when reporting systolic and diastolic blood pressure.",
        definition:
          "Used when reporting systolic and diastolic blood pressure.",
        comment:
          "For a discussion on the ways Observations can be assembled in groups together see [Notes](http://hl7.org/fhir/observation.html#notes) below.",
        requirements:
          "Component observations share the same attributes in the Observation resource as the primary observation and are always treated a part of a single observation (they are not separable).   However, the reference range for the primary observation value is not inherited by the component values and is required when appropriate for each component observation.",
        min: 1,
        max: "1",
        base: {
          path: "Observation.component",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "BackboneElement",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "vs-3",
            severity: "error",
            human:
              "If there is no a value a data absent reason must be present",
            expression: "value.exists() or dataAbsentReason.exists()",
            xpath:
              "f:*[starts-with(local-name(.), 'value')] or f:dataAbsentReason",
            source: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "containment by OBX-4?",
          },
          {
            identity: "rim",
            map: "outBoundRelationship[typeCode=COMP]",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.id",
        path: "Observation.component.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.extension",
        path: "Observation.component.extension",
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.modifierExtension",
        path: "Observation.component.modifierExtension",
        short: "Extensions that cannot be ignored even if unrecognized",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element and that modifies the understanding of the element in which it is contained and/or the understanding of the containing element's descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        requirements:
          "Modifier extensions allow for extensions that *cannot* be safely ignored to be clearly distinguished from the vast majority of extensions which can be safely ignored.  This promotes interoperability by eliminating the need for implementers to prohibit the presence of extensions. For further information, see the [definition of modifier extensions](http://hl7.org/fhir/extensibility.html#modifierExtension).",
        alias: ["extensions", "user content", "modifiers"],
        min: 0,
        max: "*",
        base: {
          path: "BackboneElement.modifierExtension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: true,
        isModifierReason:
          "Modifier extensions are expected to modify the meaning or interpretation of the element that contains them",
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code",
        path: "Observation.component.code",
        short: "Type of component observation (code / type)",
        definition:
          'Describes what was observed. Sometimes this is called the observation "code".',
        comment:
          "additional codes that translate or map to this code are allowed.  For example a more granular LOINC code or code that is used locally in a system.",
        requirements:
          "Knowing what kind of observation is being made is essential to understanding the observation.",
        min: 1,
        max: "1",
        base: {
          path: "Observation.component.code",
          min: 1,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "VitalSigns",
            },
          ],
          strength: "extensible",
          description: "This identifies the vital sign result type.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-vitalsignresult",
        },
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.what[x]",
          },
          {
            identity: "sct-concept",
            map:
              "< 363787002 |Observable entity| OR \r< 386053000 |Evaluation procedure|",
          },
          {
            identity: "v2",
            map: "OBX-3",
          },
          {
            identity: "rim",
            map: "code",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.id",
        path: "Observation.component.code.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.extension",
        path: "Observation.component.code.extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.coding",
        path: "Observation.component.code.coding",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "code",
            },
            {
              type: "value",
              path: "system",
            },
          ],
          ordered: false,
          rules: "open",
        },
        short: "Diastolic Blood Pressure",
        definition: "Diastolic Blood Pressure.",
        comment:
          "Codes may be defined very casually in enumerations, or code lists, up to very formal definitions such as SNOMED CT - see the HL7 v3 Core Principles for more information.  Ordering of codings is undefined and SHALL NOT be used to infer meaning. Generally, at most only one of the coding values will be labeled as UserSelected = true.",
        requirements:
          "Allows for alternative encodings within a code system, and translations to other code systems.",
        min: 0,
        max: "*",
        base: {
          path: "CodeableConcept.coding",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Coding",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1-8, C*E.10-22",
          },
          {
            identity: "rim",
            map: "union(., ./translation)",
          },
          {
            identity: "orim",
            map: "fhir:CodeableConcept.coding rdfs:subPropertyOf dt:CD.coding",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode",
        path: "Observation.component.code.coding",
        sliceName: "DBPCode",
        short: "Diastolic Blood Pressure",
        definition: "Diastolic Blood Pressure.",
        comment:
          "Codes may be defined very casually in enumerations, or code lists, up to very formal definitions such as SNOMED CT - see the HL7 v3 Core Principles for more information.  Ordering of codings is undefined and SHALL NOT be used to infer meaning. Generally, at most only one of the coding values will be labeled as UserSelected = true.",
        requirements:
          "Allows for alternative encodings within a code system, and translations to other code systems.",
        min: 1,
        max: "1",
        base: {
          path: "CodeableConcept.coding",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Coding",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1-8, C*E.10-22",
          },
          {
            identity: "rim",
            map: "union(., ./translation)",
          },
          {
            identity: "orim",
            map: "fhir:CodeableConcept.coding rdfs:subPropertyOf dt:CD.coding",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode.id",
        path: "Observation.component.code.coding.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode.extension",
        path: "Observation.component.code.coding.extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode.system",
        path: "Observation.component.code.coding.system",
        short: "Identity of the terminology system",
        definition:
          "The identification of the code system that defines the meaning of the symbol in the code.",
        comment:
          "The URI may be an OID (urn:oid:...) or a UUID (urn:uuid:...).  OIDs and UUIDs SHALL be references to the HL7 OID registry. Otherwise, the URI should come from HL7's list of FHIR defined special URIs or it should reference to some definition that establishes the system clearly and unambiguously.",
        requirements:
          "Need to be unambiguous about the source of the definition of the symbol.",
        min: 1,
        max: "1",
        base: {
          path: "Coding.system",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://loinc.org",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.3",
          },
          {
            identity: "rim",
            map: "./codeSystem",
          },
          {
            identity: "orim",
            map: "fhir:Coding.system rdfs:subPropertyOf dt:CDCoding.codeSystem",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode.version",
        path: "Observation.component.code.coding.version",
        short: "Version of the system - if relevant",
        definition:
          "The version of the code system which was used when choosing this code. Note that a well-maintained code system does not need the version reported, because the meaning of codes is consistent across versions. However this cannot consistently be assured, and when the meaning is not guaranteed to be consistent, the version SHOULD be exchanged.",
        comment:
          "Where the terminology does not clearly define what string should be used to identify code system versions, the recommendation is to use the date (expressed in FHIR date format) on which that version was officially published as the version date.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.version",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.7",
          },
          {
            identity: "rim",
            map: "./codeSystemVersion",
          },
          {
            identity: "orim",
            map:
              "fhir:Coding.version rdfs:subPropertyOf dt:CDCoding.codeSystemVersion",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode.code",
        path: "Observation.component.code.coding.code",
        short: "Symbol in syntax defined by the system",
        definition:
          "A symbol in syntax defined by the system. The symbol may be a predefined code or an expression in a syntax defined by the coding system (e.g. post-coordination).",
        requirements: "Need to refer to a particular code in the system.",
        min: 1,
        max: "1",
        base: {
          path: "Coding.code",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "8462-4",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.1",
          },
          {
            identity: "rim",
            map: "./code",
          },
          {
            identity: "orim",
            map: "fhir:Coding.code rdfs:subPropertyOf dt:CDCoding.code",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode.display",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.component.code.coding.display",
        short: "Representation defined by the system",
        definition:
          "A representation of the meaning of the code in the system, following the rules of the system.",
        requirements:
          "Need to be able to carry a human-readable meaning of the code for readers that do not know  the system.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.display",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.2 - but note this is not well followed",
          },
          {
            identity: "rim",
            map: "CV.displayName",
          },
          {
            identity: "orim",
            map:
              "fhir:Coding.display rdfs:subPropertyOf dt:CDCoding.displayName",
          },
        ],
      },
      {
        id:
          "Observation.component:DiastolicBP.code.coding:DBPCode.userSelected",
        path: "Observation.component.code.coding.userSelected",
        short: "If this coding was chosen directly by the user",
        definition:
          "Indicates that this coding was chosen by a user directly - e.g. off a pick list of available items (codes or displays).",
        comment:
          "Amongst a set of alternatives, a directly chosen code is the most appropriate starting point for new translations. There is some ambiguity about what exactly 'directly chosen' implies, and trading partner agreement may be needed to clarify the use of this element and its consequences more completely.",
        requirements:
          "This has been identified as a clinical safety criterium - that this exact system/code pair was chosen explicitly, rather than inferred by the system based on some rules or language processing.",
        min: 0,
        max: "1",
        base: {
          path: "Coding.userSelected",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "boolean",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "Sometimes implied by being first",
          },
          {
            identity: "rim",
            map: "CD.codingRationale",
          },
          {
            identity: "orim",
            map:
              'fhir:Coding.userSelected fhir:mapsTo dt:CDCoding.codingRationale. fhir:Coding.userSelected fhir:hasMap fhir:Coding.userSelected.map. fhir:Coding.userSelected.map a fhir:Map;   fhir:target dt:CDCoding.codingRationale. fhir:Coding.userSelected\\#true a [     fhir:source "true";     fhir:target dt:CDCoding.codingRationale\\#O   ]',
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.code.text",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.component.code.text",
        short: "Plain text representation of the concept",
        definition:
          "A human language representation of the concept as seen/selected/uttered by the user who entered the data and/or which represents the intended meaning of the user.",
        comment:
          "Very often the text is the same as a displayName of one of the codings.",
        requirements:
          "The codes from the terminologies do not always capture the correct meaning with all the nuances of the human using them, or sometimes there is no appropriate code at all. In these cases, the text is used to capture the full meaning of the source.",
        min: 0,
        max: "1",
        base: {
          path: "CodeableConcept.text",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "C*E.9. But note many systems use C*E.2 for this",
          },
          {
            identity: "rim",
            map: './originalText[mediaType/code="text/plain"]/data',
          },
          {
            identity: "orim",
            map:
              "fhir:CodeableConcept.text rdfs:subPropertyOf dt:CD.originalText",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.value[x]",
        path: "Observation.component.value[x]",
        short: "Vital Sign Value recorded with UCUM",
        definition: "Vital Sign Value recorded with UCUM.",
        comment:
          "Used when observation has a set of component observations. An observation may have both a value (e.g. an  Apgar score)  and component observations (the observations from which the Apgar score was derived). If a value is present, the datatype for this element should be determined by Observation.code. A CodeableConcept with just a text would be used instead of a string if the field was usually coded, or if the type associated with the Observation.code defines a coded value.  For additional guidance, see the [Notes section](http://hl7.org/fhir/observation.html#notes) below.",
        requirements:
          '9. SHALL contain exactly one [1..1] value with @xsi:type="PQ" (CONF:7305).',
        min: 0,
        max: "1",
        base: {
          path: "Observation.component.value[x]",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Quantity",
          },
        ],
        condition: ["vs-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "VitalSignsUnits",
            },
          ],
          strength: "required",
          description: "Common UCUM units for recording Vital Signs.",
          valueSet: "http://hl7.org/fhir/ValueSet/ucum-vitals-common|4.0.1",
        },
        mapping: [
          {
            identity: "sct-concept",
            map: "363714003 |Interprets| < 441742003 |Evaluation finding|",
          },
          {
            identity: "v2",
            map: "OBX.2, OBX.5, OBX.6",
          },
          {
            identity: "rim",
            map: "value",
          },
          {
            identity: "sct-attr",
            map: "363714003 |Interprets|",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.value[x].id",
        path: "Observation.component.value[x].id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.value[x].extension",
        path: "Observation.component.value[x].extension",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "url",
            },
          ],
          description: "Extensions are always sliced by (at least) url",
          rules: "open",
        },
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.value[x].value",
        path: "Observation.component.value[x].value",
        short: "Numerical value (with implicit precision)",
        definition:
          "The value of the measured amount. The value includes an implicit precision in the presentation of the value.",
        comment:
          "The implicit precision in the value should always be honored. Monetary values have their own rules for handling precision (refer to standard accounting text books).",
        requirements:
          "Precision is handled implicitly in almost all cases of measurement.",
        min: 1,
        max: "1",
        base: {
          path: "Quantity.value",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "decimal",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "SN.2  / CQ - N/A",
          },
          {
            identity: "rim",
            map:
              "PQ.value, CO.value, MO.value, IVL.high or IVL.low depending on the value",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.value[x].comparator",
        path: "Observation.component.value[x].comparator",
        short: "< | <= | >= | > - how to understand the value",
        definition:
          'How the value should be understood and represented - whether the actual value is greater or less than the stated value due to measurement issues; e.g. if the comparator is "<" , then the real value is < stated value.',
        requirements:
          "Need a framework for handling measures where the value is <5ug/L or >400mg/L due to the limitations of measuring methodology.",
        min: 0,
        max: "1",
        base: {
          path: "Quantity.comparator",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        meaningWhenMissing:
          "If there is no comparator, then there is no modification of the value",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: true,
        isModifierReason:
          'This is labeled as "Is Modifier" because the comparator modifies the interpretation of the value significantly. If there is no comparator, then there is no modification of the value',
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "QuantityComparator",
            },
          ],
          strength: "required",
          description: "How the Quantity should be understood and represented.",
          valueSet: "http://hl7.org/fhir/ValueSet/quantity-comparator|4.0.1",
        },
        mapping: [
          {
            identity: "v2",
            map: "SN.1  / CQ.1",
          },
          {
            identity: "rim",
            map: "IVL properties",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.value[x].unit",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/elementdefinition-translatable",
            valueBoolean: true,
          },
        ],
        path: "Observation.component.value[x].unit",
        short: "Unit representation",
        definition: "A human-readable form of the unit.",
        requirements:
          "There are many representations for units of measure and in many contexts, particular representations are fixed and required. I.e. mcg for micrograms.",
        min: 1,
        max: "1",
        base: {
          path: "Quantity.unit",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "string",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "(see OBX.6 etc.) / CQ.2",
          },
          {
            identity: "rim",
            map: "PQ.unit",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.value[x].system",
        path: "Observation.component.value[x].system",
        short: "System that defines coded unit form",
        definition:
          "The identification of the system that provides the coded form of the unit.",
        requirements:
          "Need to know the system that defines the coded form of the unit.",
        min: 1,
        max: "1",
        base: {
          path: "Quantity.system",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://unitsofmeasure.org",
        condition: ["qty-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "(see OBX.6 etc.) / CQ.2",
          },
          {
            identity: "rim",
            map: "CO.codeSystem, PQ.translation.codeSystem",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.value[x].code",
        path: "Observation.component.value[x].code",
        short:
          "Coded responses from the common UCUM units for vital signs value set.",
        definition:
          "Coded responses from the common UCUM units for vital signs value set.",
        comment:
          "The preferred system is UCUM, but SNOMED CT can also be used (for customary units) or ISO 4217 for currency.  The context of use may additionally require a code from a particular system.",
        requirements:
          "Need a computable form of the unit that is fixed across all forms. UCUM provides this for quantities, but SNOMED CT provides many units of interest.",
        min: 1,
        max: "1",
        base: {
          path: "Quantity.code",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "mm[Hg]",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "(see OBX.6 etc.) / CQ.2",
          },
          {
            identity: "rim",
            map: "PQ.code, MO.currency, PQ.translation.code",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.dataAbsentReason",
        path: "Observation.component.dataAbsentReason",
        short: "Why the component result is missing",
        definition:
          "Provides a reason why the expected value in the element Observation.component.value[x] is missing.",
        comment:
          '"Null" or exceptional values can be represented two ways in FHIR Observations.  One way is to simply include them in the value set and represent the exceptions in the value.  For example, measurement values for a serology test could be  "detected", "not detected", "inconclusive", or  "test not done". \n\nThe alternate way is to use the value element for actual observations and use the explicit dataAbsentReason element to record exceptional values.  For example, the dataAbsentReason code "error" could be used when the measurement was not completed.  Because of these options, use-case agreements are required to interpret general observations for exceptional values.',
        requirements:
          "For many results it is necessary to handle exceptional values in measurements.",
        min: 0,
        max: "1",
        base: {
          path: "Observation.component.dataAbsentReason",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        condition: ["obs-6", "vs-3"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        mustSupport: true,
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationValueAbsentReason",
            },
          ],
          strength: "extensible",
          description:
            "Codes specifying why the result (`Observation.value[x]`) is missing.",
          valueSet: "http://hl7.org/fhir/ValueSet/data-absent-reason",
        },
        mapping: [
          {
            identity: "v2",
            map: "N/A",
          },
          {
            identity: "rim",
            map: "value.nullFlavor",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.interpretation",
        path: "Observation.component.interpretation",
        short: "High, low, normal, etc.",
        definition:
          "A categorical assessment of an observation value.  For example, high, low, normal.",
        comment:
          "Historically used for laboratory results (known as 'abnormal flag' ),  its use extends to other use cases where coded interpretations  are relevant.  Often reported as one or more simple compact codes this element is often placed adjacent to the result value in reports and flow sheets to signal the meaning/normalcy status of the result.",
        requirements:
          "For some results, particularly numeric results, an interpretation is necessary to fully understand the significance of a result.",
        alias: ["Abnormal Flag"],
        min: 0,
        max: "*",
        base: {
          path: "Observation.component.interpretation",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ObservationInterpretation",
            },
          ],
          strength: "extensible",
          description: "Codes identifying interpretations of observations.",
          valueSet: "http://hl7.org/fhir/ValueSet/observation-interpretation",
        },
        mapping: [
          {
            identity: "sct-concept",
            map: "< 260245000 |Findings values|",
          },
          {
            identity: "v2",
            map: "OBX-8",
          },
          {
            identity: "rim",
            map: "interpretationCode",
          },
          {
            identity: "sct-attr",
            map: "363713009 |Has interpretation|",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.referenceRange",
        path: "Observation.component.referenceRange",
        short: "Provides guide for interpretation of component result",
        definition:
          "Guidance on how to interpret the value by comparison to a normal or recommended range.",
        comment:
          "Most observations only have one generic reference range. Systems MAY choose to restrict to only supplying the relevant reference range based on knowledge about the patient (e.g., specific to the patient's age, gender, weight and other factors), but this might not be possible or appropriate. Whenever more than one reference range is supplied, the differences between them SHOULD be provided in the reference range and/or age properties.",
        requirements:
          'Knowing what values are considered "normal" can help evaluate the significance of a particular result. Need to be able to provide multiple reference ranges for different contexts.',
        min: 0,
        max: "*",
        base: {
          path: "Observation.component.referenceRange",
          min: 0,
          max: "*",
        },
        contentReference: "#Observation.referenceRange",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "OBX.7",
          },
          {
            identity: "rim",
            map:
              "outboundRelationship[typeCode=REFV]/target[classCode=OBS, moodCode=EVN]",
          },
        ],
      },
    ],
  },
  differential: {
    element: [
      {
        id: "Observation",
        path: "Observation",
        short: "FHIR Blood Pressure Profile",
        definition:
          "This profile defines  how to represent Blood Pressure observations in FHIR using a standard LOINC code and UCUM units of measure.  This is a grouping structure. It has no value in Observation.valueQuantity but contains at least one component (systolic and/or diastolic).",
        min: 0,
        max: "*",
      },
      {
        id: "Observation.code",
        path: "Observation.code",
        short: "Blood Pressure",
        definition: "Blood Pressure.",
        comment:
          "additional codes that translate or map to this code are allowed.  For example a more granular LOINC code or code that is used locally in a system.",
        alias: ["Test", "Name"],
      },
      {
        id: "Observation.code.coding",
        path: "Observation.code.coding",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "code",
            },
            {
              type: "value",
              path: "system",
            },
          ],
          ordered: false,
          rules: "open",
        },
      },
      {
        id: "Observation.code.coding:BPCode",
        path: "Observation.code.coding",
        sliceName: "BPCode",
        min: 1,
        max: "1",
      },
      {
        id: "Observation.code.coding:BPCode.system",
        path: "Observation.code.coding.system",
        min: 1,
        max: "1",
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://loinc.org",
      },
      {
        id: "Observation.code.coding:BPCode.code",
        path: "Observation.code.coding.code",
        min: 1,
        max: "1",
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "85354-9",
      },
      {
        id: "Observation.valueQuantity",
        path: "Observation.valueQuantity",
        min: 0,
        max: "0",
      },
      {
        id: "Observation.component",
        path: "Observation.component",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "code.coding.code",
            },
            {
              type: "value",
              path: "code.coding.system",
            },
          ],
          ordered: false,
          rules: "open",
        },
        min: 2,
        max: "*",
      },
      {
        id: "Observation.component:SystolicBP",
        path: "Observation.component",
        sliceName: "SystolicBP",
        min: 1,
        max: "1",
      },
      {
        id: "Observation.component:SystolicBP.code",
        path: "Observation.component.code",
        comment:
          "additional codes that translate or map to this code are allowed.  For example a more granular LOINC code or code that is used locally in a system.",
        alias: ["Component Test", "Component Name"],
      },
      {
        id: "Observation.component:SystolicBP.code.coding",
        path: "Observation.component.code.coding",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "code",
            },
            {
              type: "value",
              path: "system",
            },
          ],
          ordered: false,
          rules: "open",
        },
        short: "Systolic Blood Pressure",
        definition: "Systolic Blood Pressure.",
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode",
        path: "Observation.component.code.coding",
        sliceName: "SBPCode",
        short: "Systolic Blood Pressure",
        definition: "Systolic Blood Pressure.",
        min: 1,
        max: "1",
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode.system",
        path: "Observation.component.code.coding.system",
        min: 1,
        max: "1",
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://loinc.org",
      },
      {
        id: "Observation.component:SystolicBP.code.coding:SBPCode.code",
        path: "Observation.component.code.coding.code",
        min: 1,
        max: "1",
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "8480-6",
      },
      {
        id: "Observation.component:SystolicBP.valueQuantity",
        path: "Observation.component.valueQuantity",
        type: [
          {
            code: "Quantity",
          },
        ],
      },
      {
        id: "Observation.component:SystolicBP.valueQuantity.value",
        path: "Observation.component.valueQuantity.value",
        min: 1,
        max: "1",
        type: [
          {
            code: "decimal",
          },
        ],
        mustSupport: true,
      },
      {
        id: "Observation.component:SystolicBP.valueQuantity.unit",
        path: "Observation.component.valueQuantity.unit",
        min: 1,
        max: "1",
        type: [
          {
            code: "string",
          },
        ],
        mustSupport: true,
      },
      {
        id: "Observation.component:SystolicBP.valueQuantity.system",
        path: "Observation.component.valueQuantity.system",
        min: 1,
        max: "1",
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://unitsofmeasure.org",
        mustSupport: true,
      },
      {
        id: "Observation.component:SystolicBP.valueQuantity.code",
        path: "Observation.component.valueQuantity.code",
        short:
          "Coded responses from the common UCUM units for vital signs value set.",
        definition:
          "Coded responses from the common UCUM units for vital signs value set.",
        min: 1,
        max: "1",
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "mm[Hg]",
        mustSupport: true,
      },
      {
        id: "Observation.component:DiastolicBP",
        path: "Observation.component",
        sliceName: "DiastolicBP",
        min: 1,
        max: "1",
      },
      {
        id: "Observation.component:DiastolicBP.code",
        path: "Observation.component.code",
        comment:
          "additional codes that translate or map to this code are allowed.  For example a more granular LOINC code or code that is used locally in a system.",
      },
      {
        id: "Observation.component:DiastolicBP.code.coding",
        path: "Observation.component.code.coding",
        slicing: {
          discriminator: [
            {
              type: "value",
              path: "code",
            },
            {
              type: "value",
              path: "system",
            },
          ],
          ordered: false,
          rules: "open",
        },
        short: "Diastolic Blood Pressure",
        definition: "Diastolic Blood Pressure.",
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode",
        path: "Observation.component.code.coding",
        sliceName: "DBPCode",
        short: "Diastolic Blood Pressure",
        definition: "Diastolic Blood Pressure.",
        min: 1,
        max: "1",
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode.system",
        path: "Observation.component.code.coding.system",
        min: 1,
        max: "1",
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://loinc.org",
      },
      {
        id: "Observation.component:DiastolicBP.code.coding:DBPCode.code",
        path: "Observation.component.code.coding.code",
        min: 1,
        max: "1",
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "8462-4",
      },
      {
        id: "Observation.component:DiastolicBP.valueQuantity",
        path: "Observation.component.valueQuantity",
        type: [
          {
            code: "Quantity",
          },
        ],
      },
      {
        id: "Observation.component:DiastolicBP.valueQuantity.value",
        path: "Observation.component.valueQuantity.value",
        min: 1,
        max: "1",
        type: [
          {
            code: "decimal",
          },
        ],
        mustSupport: true,
      },
      {
        id: "Observation.component:DiastolicBP.valueQuantity.unit",
        path: "Observation.component.valueQuantity.unit",
        min: 1,
        max: "1",
        type: [
          {
            code: "string",
          },
        ],
        mustSupport: true,
      },
      {
        id: "Observation.component:DiastolicBP.valueQuantity.system",
        path: "Observation.component.valueQuantity.system",
        min: 1,
        max: "1",
        type: [
          {
            code: "uri",
          },
        ],
        fixedUri: "http://unitsofmeasure.org",
        mustSupport: true,
      },
      {
        id: "Observation.component:DiastolicBP.valueQuantity.code",
        path: "Observation.component.valueQuantity.code",
        short:
          "Coded responses from the common UCUM units for vital signs value set.",
        definition:
          "Coded responses from the common UCUM units for vital signs value set.",
        min: 1,
        max: "1",
        type: [
          {
            code: "code",
          },
        ],
        fixedCode: "mm[Hg]",
        mustSupport: true,
      },
    ],
  },
} as unknown) as IStructureDefinition;

export const fhirResourcePat = ({
  resourceType: "StructureDefinition",
  id: "Patient",
  meta: {
    lastUpdated: "2019-11-01T09:29:23.356+11:00",
  },
  text: {
    status: "generated",
    div:
      '<div xmlns="http://www.w3.org/1999/xhtml"><table border="0" cellpadding="0" cellspacing="0" style="border: 0px #F0F0F0 solid; font-size: 11px; font-family: verdana; vertical-align: top;"><tr style="border: 1px #F0F0F0 solid; font-size: 11px; font-family: verdana; vertical-align: top;"><th style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="formats.html#table" title="The logical name of the element">Name</a></th><th style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="formats.html#table" title="Information about the use of the element">Flags</a></th><th style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="formats.html#table" title="Minimum and Maximum # of times the the element can appear in the instance">Card.</a></th><th style="width: 100px" class="hierarchy"><a href="formats.html#table" title="Reference to the type of the element">Type</a></th><th style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="formats.html#table" title="Additional information about the element">Description &amp; Constraints</a><span style="float: right"><a href="formats.html#table" title="Legend for this format"><img src="help16.png" alt="doco" style="background-color: inherit"/></a></span></th></tr><tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAACCElEQVQ4y4XTv2sUQRTA8e9Mzt3kjoOLSXFgZ6GJQlALCysLC89OsLTXv0VFxE4stRAEQUghSWEXuM4qMZpATsUD70dyMdnduZ15z2IvMV5IfDDNm5nPm59GVTkpms1mTVXvhxDuichlEZn03m+KyJL3/mWj0fiKqp7YVlZWXrfbbR2PTqeji4uLn1WVEqdECKFRr9eP5WdnZ/HeXwROB0TEA3S7XarVKiLC1tYW8/PzeO/5LxBCUABrLXEc02q1KJfLB30F0P144dPU9LVL1kwcrU06WP0ewhML4JwDYDgcHo7I87wAjNq5ypU3Z8arT8F5u/xejw52zmGM+Rcg1wyIcc/BTYCdBlODyh3ElA1AHMekaUoURURRBECWZSNgaGzBxxAU9jfQ9jrJr2dcbbXobRYHlQAzo9X1gDR9+KUArE6CwLefZD9WCW6P0uRZKreXqADkHXZ3dshzjwRholJH397AOXcTwHTfzQ1n7q6NnYEAy+DWQVNwKWQJ6vcx557Se7HAzIN1M9rCwVteA/rAYDRRICQgSZEr7WLYO3bzJVJGQBu0D74PkoHkoBnIHvjfkO9AGABmDHCjFWgH8i7kPQh9yEeYH4DfLhBJgA2A7BBQJ9uwXWY3rhJqFo1AaiB1CBngwKZQcqAeSFSduL9Akj7qPF64jnALS5VTPwdgPwwJ+uog9Qcx4kRZiPKqxgAAAABJRU5ErkJggg==" alt="." style="background-color: white; background-color: inherit" title="Resource" class="hierarchy"/> <span title="Patient : Demographics and other administrative information about an individual or animal receiving care or other health-related services.">Patient</span><a name="Patient"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; border: 1px grey solid; font-weight: bold; color: black; background-color: #e6ffe6" href="versions.html#std-process" title="Standards Status = Normative">N</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="domainresource.html">DomainResource</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Information about an individual or animal receiving health care services<br/>Elements defined in Ancestors: <a href="resource.html#Resource" title="The logical id of the resource, as used in the URL for the resource. Once assigned, this value never changes.">id</a>, <a href="resource.html#Resource" title="The metadata about the resource. This is content that is maintained by the infrastructure. Changes to the content might not always be associated with version changes to the resource.">meta</a>, <a href="resource.html#Resource" title="A reference to a set of rules that were followed when the resource was constructed, and which must be understood when processing the content. Often, this is a reference to an implementation guide that defines the special rules along with other profiles etc.">implicitRules</a>, <a href="resource.html#Resource" title="The base language in which the resource is written.">language</a>, <a href="domainresource.html#DomainResource" title="A human-readable narrative that contains a summary of the resource and can be used to represent the content of the resource to a human. The narrative need not encode all the structured data, but is required to contain sufficient detail to make it &quot;clinically safe&quot; for a human to just read the narrative. Resource definitions may define what content should be represented in the narrative to ensure clinical safety.">text</a>, <a href="domainresource.html#DomainResource" title="These resources do not have an independent existence apart from the resource that contains them - they cannot be identified independently, and nor can they have their own independent transaction scope.">contained</a>, <a href="domainresource.html#DomainResource" title="May be used to represent additional information that is not part of the basic definition of the resource. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.">extension</a>, <a href="domainresource.html#DomainResource" title="May be used to represent additional information that is not part of the basic definition of the resource and that modifies the understanding of the element that contains it and/or the understanding of the containing element\'s descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer is allowed to define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).">modifierExtension</a></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.identifier : An identifier for this patient.">identifier</span><a name="Patient.identifier"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#Identifier">Identifier</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">An identifier for this patient<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: white; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="Patient.active : Whether this patient record is in active use. \nMany systems use this property to mark as non-current patients, such as those that have not been seen for a period of time based on an organization\'s business rules.\n\nIt is often used to filter patient lists to exclude inactive patients\n\nDeceased patients may also be marked as inactive for the same reasons, but may be active for some time after death.">active</span><a name="Patient.active"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="conformance-rules.html#isModifier" title="This element is a modifier element">?!</a><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#boolean">boolean</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Whether this patient\'s record is in active use</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.name : A name associated with the individual.">name</span><a name="Patient.name"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#HumanName">HumanName</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">A name associated with the patient<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: white; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.telecom : A contact detail (e.g. a telephone number or an email address) by which the individual may be contacted.">telecom</span><a name="Patient.telecom"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#ContactPoint">ContactPoint</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">A contact detail for the individual<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="Patient.gender : Administrative Gender - the gender that the patient is considered to have for administration and record keeping purposes.">gender</span><a name="Patient.gender"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#code">code</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">male | female | other | unknown<br/><a href="valueset-administrative-gender.html" title="The gender of a person used for administrative purposes.">AdministrativeGender</a> (<a href="terminologies.html#required" title="To be conformant, the concept in this element SHALL be from the specified value set.">Required</a>)</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: white; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="Patient.birthDate : The date of birth for the individual.">birthDate</span><a name="Patient.birthDate"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#date">date</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">The date of birth for the individual</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAMQfAGm6/idTd4yTmF+v8Xa37KvW+lyh3KHJ62aq41ee2bXZ98nm/2mt5W2Ck5XN/C1chEZieho8WXXA/2Gn4P39/W+y6V+l3qjP8Njt/lx2izxPYGyv51Oa1EJWZ////////yH5BAEAAB8ALAAAAAAQABAAAAWH4Cd+Xml6Y0pCQts0EKp6GbYshaM/skhjhCChUmFIeL4OsHIxXRAISQTl6SgIG8+FgfBMoh2qtbLZQr0TQJhk3TC4pYPBApiyFVDEwSOf18UFXxMWBoUJBn9sDgmDewcJCRyJJBoEkRyYmAABPZQEAAOhA5seFDMaDw8BAQ9TpiokJyWwtLUhADs=" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Choice of Types" class="hierarchy"/> <span title="Patient.deceased[x] : Indicates if the individual is deceased or not.">deceased[x]</span><a name="Patient.deceased_x_"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="conformance-rules.html#isModifier" title="This element is a modifier element">?!</a><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Indicates if the individual is deceased or not</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAMElEQVR42u3QwQkAMAwDsezq/WdoskKgFAoy6HkfV5LamJ1tc7MHAAD+5QQAAOCZBkurQFbnaRSlAAAAAElFTkSuQmCC)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: white; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="Value of &quot;true&quot; or &quot;false&quot;">deceasedBoolean</span></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#boolean">boolean</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzME+lXFigAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+3OsRUAIAjEUOL+O8cJABttJM11/x1qZAGqRBEVcNIqdWj1efDqQbb3HwwwwEfABmQUHSPM9dtDAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="A date, date-time or partial date (e.g. just year or year + month).  If hours and minutes are specified, a time zone SHALL be populated. The format is a union of the schema types gYear, gYearMonth, date and dateTime. Seconds must be provided due to schema type constraints but may be zero-filled and may be ignored.                 Dates SHALL be valid dates.">deceasedDateTime</span></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#dateTime">dateTime</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: white; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.address : An address for the individual.">address</span><a name="Patient.address"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#Address">Address</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">An address for the individual<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.maritalStatus : This field contains a patient\'s most recent marital (civil) status.">maritalStatus</span><a name="Patient.maritalStatus"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#CodeableConcept">CodeableConcept</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Marital (civil) status of a patient<br/><a href="valueset-marital-status.html" title="The domestic partnership status of a person.">MaritalStatus</a> (<a href="terminologies.html#extensible" title="To be conformant, the concept in this element SHALL be from the specified value set if any of the codes within the value set can apply to the concept being communicated.  If the value set does not cover the concept (based on human review), alternate codings (or, data type allowing, text) may be included instead.">Extensible</a>)</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAMQfAGm6/idTd4yTmF+v8Xa37KvW+lyh3KHJ62aq41ee2bXZ98nm/2mt5W2Ck5XN/C1chEZieho8WXXA/2Gn4P39/W+y6V+l3qjP8Njt/lx2izxPYGyv51Oa1EJWZ////////yH5BAEAAB8ALAAAAAAQABAAAAWH4Cd+Xml6Y0pCQts0EKp6GbYshaM/skhjhCChUmFIeL4OsHIxXRAISQTl6SgIG8+FgfBMoh2qtbLZQr0TQJhk3TC4pYPBApiyFVDEwSOf18UFXxMWBoUJBn9sDgmDewcJCRyJJBoEkRyYmAABPZQEAAOhA5seFDMaDw8BAQ9TpiokJyWwtLUhADs=" alt="." style="background-color: white; background-color: inherit" title="Choice of Types" class="hierarchy"/> <span title="Patient.multipleBirth[x] : Indicates whether the patient is part of a multiple (boolean) or indicates the actual birth order (integer).">multipleBirth[x]</span><a name="Patient.multipleBirth_x_"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Whether patient is part of a multiple birth</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAMElEQVR42u3QwQkAMAwDsezq/WdoskKgFAoy6HkfV5LamJ1tc7MHAAD+5QQAAOCZBkurQFbnaRSlAAAAAElFTkSuQmCC)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="Value of &quot;true&quot; or &quot;false&quot;">multipleBirthBoolean</span></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#boolean">boolean</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzME+lXFigAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+3OsRUAIAjEUOL+O8cJABttJM11/x1qZAGqRBEVcNIqdWj1efDqQbb3HwwwwEfABmQUHSPM9dtDAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: white; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="A whole number">multipleBirthInteger</span></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#integer">integer</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.photo : Image of the patient.">photo</span><a name="Patient.photo"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#Attachment">Attachment</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Image of the patient<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPQfAOvGUf7ztuvPMf/78/fkl/Pbg+u8Rvjqteu2Pf3zxPz36Pz0z+vTmPzurPvuw/npofbjquvNefHVduuyN+uuMu3Oafbgjfnqvf/3zv/3xevPi+vRjP/20/bmsP///wD/ACH5BAEKAB8ALAAAAAAQABAAAAVl4CeOZGme5qCqqDg8jyVJaz1876DsmAQAgqDgltspMEhMJoMZ4iy6I1AooFCIv+wKybziALVAoAEjYLwDgGIpJhMslgxaLR4/3rMAWoBp32V5exg8Shl1ckRUQVaMVkQ2kCstKCEAOw==" alt="." style="background-color: white; background-color: inherit" title="Element" class="hierarchy"/> <span title="Patient.contact : A contact party (e.g. guardian, partner, friend) for the patient.">contact</span><a name="Patient.contact"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="conformance-rules.html#constraints" title="This element has or is affected by some invariants">I</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="backboneelement.html">BackboneElement</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">A contact party (e.g. guardian, partner, friend) for the patient<br/><span style="font-style: italic" title="pat-1">+ Rule: SHALL at least contain a contact\'s details or a reference to an organization</span><br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAMElEQVR42u3QwQkAMAwDsezq/WdoskKgFAoy6HkfV5LamJ1tc7MHAAD+5QQAAOCZBkurQFbnaRSlAAAAAElFTkSuQmCC)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.contact.relationship : The nature of the relationship between the patient and the contact person.">relationship</span><a name="Patient.contact.relationship"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#CodeableConcept">CodeableConcept</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">The kind of relationship<br/><a href="valueset-patient-contactrelationship.html" title="The nature of the relationship between a patient and a contact person for that patient.">Patient Contact Relationship </a> (<a href="terminologies.html#extensible" title="To be conformant, the concept in this element SHALL be from the specified value set if any of the codes within the value set can apply to the concept being communicated.  If the value set does not cover the concept (based on human review), alternate codings (or, data type allowing, text) may be included instead.">Extensible</a>)<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAMElEQVR42u3QwQkAMAwDsezq/WdoskKgFAoy6HkfV5LamJ1tc7MHAAD+5QQAAOCZBkurQFbnaRSlAAAAAElFTkSuQmCC)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: white; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.contact.name : A name associated with the contact person.">name</span><a name="Patient.contact.name"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#HumanName">HumanName</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">A name associated with the contact person</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAMElEQVR42u3QwQkAMAwDsezq/WdoskKgFAoy6HkfV5LamJ1tc7MHAAD+5QQAAOCZBkurQFbnaRSlAAAAAElFTkSuQmCC)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.contact.telecom : A contact detail for the person, e.g. a telephone number or an email address.">telecom</span><a name="Patient.contact.telecom"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#ContactPoint">ContactPoint</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">A contact detail for the person<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAMElEQVR42u3QwQkAMAwDsezq/WdoskKgFAoy6HkfV5LamJ1tc7MHAAD+5QQAAOCZBkurQFbnaRSlAAAAAElFTkSuQmCC)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: white; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.contact.address : Address for the contact person.">address</span><a name="Patient.contact.address"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#Address">Address</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Address for the contact person</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAMElEQVR42u3QwQkAMAwDsezq/WdoskKgFAoy6HkfV5LamJ1tc7MHAAD+5QQAAOCZBkurQFbnaRSlAAAAAElFTkSuQmCC)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="Patient.contact.gender : Administrative Gender - the gender that the contact person is considered to have for administration and record keeping purposes.">gender</span><a name="Patient.contact.gender"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#code">code</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">male | female | other | unknown<br/><a href="valueset-administrative-gender.html" title="The gender of a person used for administrative purposes.">AdministrativeGender</a> (<a href="terminologies.html#required" title="To be conformant, the concept in this element SHALL be from the specified value set.">Required</a>)</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAMElEQVR42u3QwQkAMAwDsezq/WdoskKgFAoy6HkfV5LamJ1tc7MHAAD+5QQAAOCZBkurQFbnaRSlAAAAAElFTkSuQmCC)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAFxJREFUOE/NjEEOACEIA/0o/38GGw+agoXYeNnDJDCUDnd/gkoFKhWozJiZI3gLwY6rAgxhsPKTPUzycTl8lAryMyMsVQG6TFi6cHULyz8KOjC7OIQKlQpU3uPjAwhX2CCcGsgOAAAAAElFTkSuQmCC" alt="." style="background-color: white; background-color: inherit" title="Reference to another Resource" class="hierarchy"/> <span title="Patient.contact.organization : Organization on behalf of which the contact is acting or for which the contact is working.">organization</span><a name="Patient.contact.organization"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="conformance-rules.html#constraints" title="This element has or is affected by some invariants">I</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="references.html#Reference">Reference</a>(<a href="organization.html">Organization</a>)</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Organization that is associated with the contact</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzME+lXFigAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+3OsRUAIAjEUOL+O8cJABttJM11/x1qZAGqRBEVcNIqdWj1efDqQbb3HwwwwEfABmQUHSPM9dtDAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.contact.period : The period during which this contact person or organization is valid to be contacted relating to this patient.">period</span><a name="Patient.contact.period"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#Period">Period</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">The period during which this contact person or organization is valid to be contacted relating to this patient</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPQfAOvGUf7ztuvPMf/78/fkl/Pbg+u8Rvjqteu2Pf3zxPz36Pz0z+vTmPzurPvuw/npofbjquvNefHVduuyN+uuMu3Oafbgjfnqvf/3zv/3xevPi+vRjP/20/bmsP///wD/ACH5BAEKAB8ALAAAAAAQABAAAAVl4CeOZGme5qCqqDg8jyVJaz1876DsmAQAgqDgltspMEhMJoMZ4iy6I1AooFCIv+wKybziALVAoAEjYLwDgGIpJhMslgxaLR4/3rMAWoBp32V5exg8Shl1ckRUQVaMVkQ2kCstKCEAOw==" alt="." style="background-color: white; background-color: inherit" title="Element" class="hierarchy"/> <span title="Patient.communication : A language which may be used to communicate with the patient about his or her health.">communication</span><a name="Patient.communication"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="backboneelement.html">BackboneElement</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">A language which may be used to communicate with the patient about his or her health<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAMElEQVR42u3QwQkAMAwDsezq/WdoskKgFAoy6HkfV5LamJ1tc7MHAAD+5QQAAOCZBkurQFbnaRSlAAAAAElFTkSuQmCC)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPZ/APrkusOiYvvfqbiXWaV2G+jGhdq1b8GgYf3v1frw3vTUlsWkZNewbcSjY/DQkad4Hb6dXv3u0f3v1ObEgfPTlerJiP3w1v79+e7OkPrfrfnjuNOtZPrpydaxa+/YrvvdpP779ZxvFPvnwKKBQaFyF/369M2vdaqHRPz58/HNh/vowufFhfroxO3OkPrluv779tK0e6JzGProwvrow9m4eOnIifPTlPDPkP78+Naxaf3v0/zowfXRi+bFhLWUVv379/rnwPvszv3rye3LiPvnv+3MjPDasKiIS/789/3x2f747eXDg+7Mifvu0tu7f+/QkfDTnPXWmPrjsvrjtPbPgrqZW+/QlPz48K2EMv36866OUPvowat8Ivvgq/Pbrvzgq/PguvrgrqN0Gda2evfYm9+7d/rpw9q6e/LSku/Rl/XVl/LSlfrkt+zVqe7Wqv3x1/bNffbOf59wFdS6if3u0vrqyP3owPvepfXQivDQkO/PkKh9K7STVf779P///wD/ACH5BAEKAH8ALAAAAAAQABAAAAemgH+CgxeFF4OIhBdKGwFChYl/hYwbdkoBPnaQkosbG3d3VEpSUlonUoY1Gzo6QkI8SrGxWBOFG4uySgY5ZWR3PFy2hnaWZXC/PHcPwkpJk1ShoHcxhQEXSUmtFy6+0iSFVResrjoTPDzdcoU+F65CduVU6KAhhQa3F8Tx8nchBoYuqoTLZoAKFRIhqGwqJAULFx0GYpBQeChRIR4TJm6KJMhQRUSBAAA7" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Data Type" class="hierarchy"/> <span title="Patient.communication.language : The ISO-639-1 alpha 2 code in lower case for the language, optionally followed by a hyphen and the ISO-3166-1 alpha 2 code for the region in upper case; e.g. &quot;en&quot; for English, or &quot;en-US&quot; for American English versus &quot;en-EN&quot; for England English.">language</span><a name="Patient.communication.language"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">1..1</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#CodeableConcept">CodeableConcept</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">The language which can be used to communicate with the patient about his or her health<br/><a href="valueset-languages.html" title="A human language.">Common Languages</a> (<a href="terminologies.html#preferred" title="Instances are encouraged to draw from the specified codes for interoperability purposes but are not required to do so to be considered conformant.">Preferred</a> but limited to <a href="valueset-all-languages.html">AllLanguages</a>)</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzMPbYccAgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAMElEQVQ4y+3OQREAIBDDwAv+PQcFFN5MIyCzqHMKUGVCpMFLK97heq+gggoq+EiwAVjvMhFGmlEUAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzME+lXFigAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+3OsRUAIAjEUOL+O8cJABttJM11/x1qZAGqRBEVcNIqdWj1efDqQbb3HwwwwEfABmQUHSPM9dtDAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: white; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="Patient.communication.preferred : Indicates whether or not the patient prefers this language (over other languages he masters up a certain level).">preferred</span><a name="Patient.communication.preferred"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#boolean">boolean</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Language preference indicator</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAFxJREFUOE/NjEEOACEIA/0o/38GGw+agoXYeNnDJDCUDnd/gkoFKhWozJiZI3gLwY6rAgxhsPKTPUzycTl8lAryMyMsVQG6TFi6cHULyz8KOjC7OIQKlQpU3uPjAwhX2CCcGsgOAAAAAElFTkSuQmCC" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Reference to another Resource" class="hierarchy"/> <span title="Patient.generalPractitioner : Patient\'s nominated care provider.">generalPractitioner</span><a name="Patient.generalPractitioner"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="references.html#Reference">Reference</a>(<a href="organization.html">Organization</a> | <a href="practitioner.html">Practitioner</a> | <a href="practitionerrole.html">PractitionerRole</a>)</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Patient\'s nominated primary care provider<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAL0lEQVR42u3XsQ0AQAgCQHdl/xn8jxvYWB3JlTR0VJLa+OltBwAAYP6EEQAAgCsPVYVAgIJrA/sAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAFxJREFUOE/NjEEOACEIA/0o/38GGw+agoXYeNnDJDCUDnd/gkoFKhWozJiZI3gLwY6rAgxhsPKTPUzycTl8lAryMyMsVQG6TFi6cHULyz8KOjC7OIQKlQpU3uPjAwhX2CCcGsgOAAAAAElFTkSuQmCC" alt="." style="background-color: white; background-color: inherit" title="Reference to another Resource" class="hierarchy"/> <span title="Patient.managingOrganization : Organization that is the custodian of the patient record.">managingOrganization</span><a name="Patient.managingOrganization"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="references.html#Reference">Reference</a>(<a href="organization.html">Organization</a>)</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Organization that is the custodian of the patient record</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAI0lEQVR42u3QIQEAAAACIL/6/4MvTAQOkLYBAAB4kAAAANwMad9AqkRjgNAAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzME+lXFigAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+3OsRUAIAjEUOL+O8cJABttJM11/x1qZAGqRBEVcNIqdWj1efDqQbb3HwwwwEfABmQUHSPM9dtDAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,R0lGODlhEAAQAPQfAOvGUf7ztuvPMf/78/fkl/Pbg+u8Rvjqteu2Pf3zxPz36Pz0z+vTmPzurPvuw/npofbjquvNefHVduuyN+uuMu3Oafbgjfnqvf/3zv/3xevPi+vRjP/20/bmsP///wD/ACH5BAEKAB8ALAAAAAAQABAAAAVl4CeOZGme5qCqqDg8jyVJaz1876DsmAQAgqDgltspMEhMJoMZ4iy6I1AooFCIv+wKybziALVAoAEjYLwDgGIpJhMslgxaLR4/3rMAWoBp32V5exg8Shl1ckRUQVaMVkQ2kCstKCEAOw==" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Element" class="hierarchy"/> <span title="Patient.link : Link to another patient resource that concerns the same actual patient.">link</span><a name="Patient.link"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="conformance-rules.html#isModifier" title="This element is a modifier element">?!</a><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="backboneelement.html">BackboneElement</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Link to another patient resource that concerns the same actual person<br/></td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white;"><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAALElEQVR42u3QwQkAMAwDsezq/WdIO4XJQwa9DTdJpulv258AAMANIgAAADUPYAVAgAJ//usAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIZgEiYEgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAIElEQVQ4y2P8//8/AyWAiYFCMGrAqAGjBowaMGoAAgAALL0DKYQ0DPIAAAAASUVORK5CYII=" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzI3XJ6V3QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+2RsQ0AIAzDav7/2VzQwoCY4iWbZSmo1QGoUgNMghvWaIejPQW/CrrNCylIwcOCDYfLNRcNer4SAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAFxJREFUOE/NjEEOACEIA/0o/38GGw+agoXYeNnDJDCUDnd/gkoFKhWozJiZI3gLwY6rAgxhsPKTPUzycTl8lAryMyMsVQG6TFi6cHULyz8KOjC7OIQKlQpU3uPjAwhX2CCcGsgOAAAAAElFTkSuQmCC" alt="." style="background-color: white; background-color: inherit" title="Reference to another Resource" class="hierarchy"/> <span title="Patient.link.other : The other patient resource that the link refers to.">other</span><a name="Patient.link.other"> </a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">1..1</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="references.html#Reference">Reference</a>(<a href="patient.html">Patient</a> | <a href="relatedperson.html">RelatedPerson</a>)</td><td style="vertical-align: top; text-align : left; background-color: white; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">The other patient or related person resource that the link refers to</td></tr>\r\n<tr style="border: 0px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7;"><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAACCAYAAACg/LjIAAAAI0lEQVR42u3QIQEAAAACIL/6/4MvTAQOkLYBAAB4kAAAANwMad9AqkRjgNAAAAAASUVORK5CYII=)" class="hierarchy"><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAWCAYAAAABxvaqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIs1vtcMQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAE0lEQVQI12P4//8/AxMDAwNdCABMPwMo2ctnoQAAAABJRU5ErkJggg==" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzIZgEiYEgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAIElEQVQ4y2P8//8/AyWAiYFCMGrAqAGjBowaMGoAAgAALL0DKYQ0DPIAAAAASUVORK5CYII=" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wYeFzME+lXFigAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAANklEQVQ4y+3OsRUAIAjEUOL+O8cJABttJM11/x1qZAGqRBEVcNIqdWj1efDqQbb3HwwwwEfABmQUHSPM9dtDAAAAAElFTkSuQmCC" alt="." style="background-color: inherit" class="hierarchy"/><img src="data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVQ4y2P8//8/AyWAhYFCMAgMuHjx4n+KXaCv+I0szW8WpCG8kFO1lGFKW/SIjAUYgxz/MzAwMDC+nqhDUTQyjuYFBgCNmhP4OvTRgwAAAABJRU5ErkJggg==" alt="." style="background-color: #F7F7F7; background-color: inherit" title="Primitive Data Type" class="hierarchy"/> <span title="Patient.link.type : The type of link between this patient resource and another patient resource.">type</span><a name="Patient.link.type"> </a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a style="padding-left: 3px; padding-right: 3px; color: black; null" href="elementdefinition-definitions.html#ElementDefinition.isSummary" title="This element is included in summaries">Σ</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">1..1</td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="datatypes.html#code">code</a></td><td style="vertical-align: top; text-align : left; background-color: #F7F7F7; border: 0px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">replaced-by | replaces | refer | seealso<br/><a href="valueset-link-type.html" title="The type of link between this patient resource and another patient resource.">LinkType</a> (<a href="terminologies.html#required" title="To be conformant, the concept in this element SHALL be from the specified value set.">Required</a>)</td></tr>\r\n<tr><td colspan="5" class="hierarchy"><br/><a href="formats.html#table" title="Legend for this format"><img src="help16.png" alt="doco" style="background-color: inherit"/> Documentation for this format</a></td></tr></table></div>',
  },
  extension: [
    {
      url:
        "http://hl7.org/fhir/StructureDefinition/structuredefinition-category",
      valueString: "Base.Individuals",
    },
    {
      url:
        "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
      valueCode: "normative",
    },
    {
      url:
        "http://hl7.org/fhir/StructureDefinition/structuredefinition-normative-version",
      valueCode: "4.0.0",
    },
    {
      url: "http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm",
      valueInteger: 5,
    },
    {
      url:
        "http://hl7.org/fhir/StructureDefinition/structuredefinition-security-category",
      valueCode: "patient",
    },
    {
      url: "http://hl7.org/fhir/StructureDefinition/structuredefinition-wg",
      valueCode: "pa",
    },
  ],
  url: "http://hl7.org/fhir/StructureDefinition/Patient",
  version: "4.0.1",
  name: "Patient",
  status: "active",
  date: "2019-11-01T09:29:23+11:00",
  publisher: "Health Level Seven International (Patient Administration)",
  contact: [
    {
      telecom: [
        {
          system: "url",
          value: "http://hl7.org/fhir",
        },
      ],
    },
    {
      telecom: [
        {
          system: "url",
          value: "http://www.hl7.org/Special/committees/pafm/index.cfm",
        },
      ],
    },
  ],
  description:
    "Demographics and other administrative information about an individual or animal receiving care or other health-related services.",
  purpose: "Tracking patient is the center of the healthcare process.",
  fhirVersion: "4.0.1",
  mapping: [
    {
      identity: "rim",
      uri: "http://hl7.org/v3",
      name: "RIM Mapping",
    },
    {
      identity: "cda",
      uri: "http://hl7.org/v3/cda",
      name: "CDA (R2)",
    },
    {
      identity: "w5",
      uri: "http://hl7.org/fhir/fivews",
      name: "FiveWs Pattern Mapping",
    },
    {
      identity: "v2",
      uri: "http://hl7.org/v2",
      name: "HL7 v2 Mapping",
    },
    {
      identity: "loinc",
      uri: "http://loinc.org",
      name: "LOINC code for the element",
    },
  ],
  kind: "resource",
  abstract: false,
  type: "Patient",
  baseDefinition: "http://hl7.org/fhir/StructureDefinition/DomainResource",
  derivation: "specialization",
  snapshot: {
    element: [
      {
        id: "Patient",
        path: "Patient",
        short:
          "Information about an individual or animal receiving health care services",
        definition:
          "Demographics and other administrative information about an individual or animal receiving care or other health-related services.",
        alias: ["SubjectOfCare Client Resident"],
        min: 0,
        max: "*",
        base: {
          path: "Patient",
          min: 0,
          max: "*",
        },
        constraint: [
          {
            key: "dom-2",
            severity: "error",
            human:
              "If the resource is contained in another resource, it SHALL NOT contain nested Resources",
            expression: "contained.contained.empty()",
            xpath: "not(parent::f:contained and f:contained)",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
          {
            key: "dom-3",
            severity: "error",
            human:
              "If the resource is contained in another resource, it SHALL be referred to from elsewhere in the resource or SHALL refer to the containing resource",
            expression:
              "contained.where((('#'+id in (%resource.descendants().reference | %resource.descendants().as(canonical) | %resource.descendants().as(uri) | %resource.descendants().as(url))) or descendants().where(reference = '#').exists() or descendants().where(as(canonical) = '#').exists() or descendants().where(as(canonical) = '#').exists()).not()).trace('unmatched', id).empty()",
            xpath:
              "not(exists(for $id in f:contained/*/f:id/@value return $contained[not(parent::*/descendant::f:reference/@value=concat('#', $contained/*/id/@value) or descendant::f:reference[@value='#'])]))",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
          {
            key: "dom-4",
            severity: "error",
            human:
              "If a resource is contained in another resource, it SHALL NOT have a meta.versionId or a meta.lastUpdated",
            expression:
              "contained.meta.versionId.empty() and contained.meta.lastUpdated.empty()",
            xpath:
              "not(exists(f:contained/*/f:meta/f:versionId)) and not(exists(f:contained/*/f:meta/f:lastUpdated))",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
          {
            key: "dom-5",
            severity: "error",
            human:
              "If a resource is contained in another resource, it SHALL NOT have a security label",
            expression: "contained.meta.security.empty()",
            xpath: "not(exists(f:contained/*/f:meta/f:security))",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/elementdefinition-bestpractice",
                valueBoolean: true,
              },
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/elementdefinition-bestpractice-explanation",
                valueMarkdown:
                  "When a resource has no narrative, only systems that fully understand the data can display the resource to a human safely. Including a human readable representation in the resource makes for a much more robust eco-system and cheaper handling of resources by intermediary systems. Some ecosystems restrict distribution of resources to only those systems that do fully understand the resources, and as a consequence implementers may believe that the narrative is superfluous. However experience shows that such eco-systems often open up to new participants over time.",
              },
            ],
            key: "dom-6",
            severity: "warning",
            human: "A resource should have narrative for robust management",
            expression: "text.`div`.exists()",
            xpath: "exists(f:text/h:div)",
            source: "http://hl7.org/fhir/StructureDefinition/DomainResource",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "Entity. Role, or Act",
          },
          {
            identity: "rim",
            map: "Patient[classCode=PAT]",
          },
          {
            identity: "cda",
            map: "ClinicalDocument.recordTarget.patientRole",
          },
        ],
      },
      {
        id: "Patient.id",
        path: "Patient.id",
        short: "Logical id of this artifact",
        definition:
          "The logical id of the resource, as used in the URL for the resource. Once assigned, this value never changes.",
        comment:
          "The only time that a resource does not have an id is when it is being submitted to the server using a create operation.",
        min: 0,
        max: "1",
        base: {
          path: "Resource.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: true,
      },
      {
        id: "Patient.meta",
        path: "Patient.meta",
        short: "Metadata about the resource",
        definition:
          "The metadata about the resource. This is content that is maintained by the infrastructure. Changes to the content might not always be associated with version changes to the resource.",
        min: 0,
        max: "1",
        base: {
          path: "Resource.meta",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Meta",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
      },
      {
        id: "Patient.implicitRules",
        path: "Patient.implicitRules",
        short: "A set of rules under which this content was created",
        definition:
          "A reference to a set of rules that were followed when the resource was constructed, and which must be understood when processing the content. Often, this is a reference to an implementation guide that defines the special rules along with other profiles etc.",
        comment:
          "Asserting this rule set restricts the content to be only understood by a limited set of trading partners. This inherently limits the usefulness of the data in the long term. However, the existing health eco-system is highly fractured, and not yet ready to define, collect, and exchange data in a generally computable sense. Wherever possible, implementers and/or specification writers should avoid using this element. Often, when used, the URL is a reference to an implementation guide that defines these special rules as part of it's narrative along with other profiles, value sets, etc.",
        min: 0,
        max: "1",
        base: {
          path: "Resource.implicitRules",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "uri",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: true,
        isModifierReason:
          "This element is labeled as a modifier because the implicit rules may provide additional knowledge about the resource that modifies it's meaning or interpretation",
        isSummary: true,
      },
      {
        id: "Patient.language",
        path: "Patient.language",
        short: "Language of the resource content",
        definition: "The base language in which the resource is written.",
        comment:
          "Language is provided to support indexing and accessibility (typically, services such as text to speech use the language tag). The html language tag in the narrative applies  to the narrative. The language tag on the resource may be used to specify the language of other presentations generated from the data in the resource. Not all the content has to be in the base language. The Resource.language should not be assumed to apply to the narrative automatically. If a language is specified, it should it also be specified on the div element in the html (see rules in HTML5 for information about the relationship between xml:lang and the html lang attribute).",
        min: 0,
        max: "1",
        base: {
          path: "Resource.language",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-maxValueSet",
              valueCanonical: "http://hl7.org/fhir/ValueSet/all-languages",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "Language",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "preferred",
          description: "A human language.",
          valueSet: "http://hl7.org/fhir/ValueSet/languages",
        },
      },
      {
        id: "Patient.text",
        path: "Patient.text",
        short: "Text summary of the resource, for human interpretation",
        definition:
          'A human-readable narrative that contains a summary of the resource and can be used to represent the content of the resource to a human. The narrative need not encode all the structured data, but is required to contain sufficient detail to make it "clinically safe" for a human to just read the narrative. Resource definitions may define what content should be represented in the narrative to ensure clinical safety.',
        comment:
          'Contained resources do not have narrative. Resources that are not contained SHOULD have a narrative. In some cases, a resource may only have text with little or no additional discrete data (as long as all minOccurs=1 elements are satisfied).  This may be necessary for data from legacy systems where information is captured as a "text blob" or where text is additionally entered raw or narrated and encoded information is added later.',
        alias: ["narrative", "html", "xhtml", "display"],
        min: 0,
        max: "1",
        base: {
          path: "DomainResource.text",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Narrative",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "Act.text?",
          },
        ],
      },
      {
        id: "Patient.contained",
        path: "Patient.contained",
        short: "Contained, inline Resources",
        definition:
          "These resources do not have an independent existence apart from the resource that contains them - they cannot be identified independently, and nor can they have their own independent transaction scope.",
        comment:
          "This should never be done when the content can be identified properly, as once identification is lost, it is extremely difficult (and context dependent) to restore it again. Contained resources may have profiles and tags In their meta elements, but SHALL NOT have security labels.",
        alias: [
          "inline resources",
          "anonymous resources",
          "contained resources",
        ],
        min: 0,
        max: "*",
        base: {
          path: "DomainResource.contained",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Resource",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Patient.extension",
        path: "Patient.extension",
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the resource. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "DomainResource.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Patient.modifierExtension",
        path: "Patient.modifierExtension",
        short: "Extensions that cannot be ignored",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the resource and that modifies the understanding of the element that contains it and/or the understanding of the containing element's descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer is allowed to define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        requirements:
          "Modifier extensions allow for extensions that *cannot* be safely ignored to be clearly distinguished from the vast majority of extensions which can be safely ignored.  This promotes interoperability by eliminating the need for implementers to prohibit the presence of extensions. For further information, see the [definition of modifier extensions](extensibility.html#modifierExtension).",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "DomainResource.modifierExtension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: true,
        isModifierReason:
          "Modifier extensions are expected to modify the meaning or interpretation of the resource that contains them",
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Patient.identifier",
        path: "Patient.identifier",
        short: "An identifier for this patient",
        definition: "An identifier for this patient.",
        requirements:
          "Patients are almost always assigned specific numerical identifiers.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.identifier",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Identifier",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.identifier",
          },
          {
            identity: "v2",
            map: "PID-3",
          },
          {
            identity: "rim",
            map: "id",
          },
          {
            identity: "cda",
            map: ".id",
          },
        ],
      },
      {
        id: "Patient.active",
        path: "Patient.active",
        short: "Whether this patient's record is in active use",
        definition:
          "Whether this patient record is in active use. \nMany systems use this property to mark as non-current patients, such as those that have not been seen for a period of time based on an organization's business rules.\n\nIt is often used to filter patient lists to exclude inactive patients\n\nDeceased patients may also be marked as inactive for the same reasons, but may be active for some time after death.",
        comment:
          "If a record is inactive, and linked to an active record, then future patient/record updates should occur on the other patient.",
        requirements:
          "Need to be able to mark a patient record as not to be used because it was created in error.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.active",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "boolean",
          },
        ],
        meaningWhenMissing:
          "This resource is generally assumed to be active if no value is provided for the active element",
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: true,
        isModifierReason:
          "This element is labelled as a modifier because it is a status element that can indicate that a record should not be treated as valid",
        isSummary: true,
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.status",
          },
          {
            identity: "rim",
            map: "statusCode",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.name",
        path: "Patient.name",
        short: "A name associated with the patient",
        definition: "A name associated with the individual.",
        comment:
          'A patient may have multiple names with different uses or applicable periods. For animals, the name is a "HumanName" in the sense that is assigned and used by humans and has the same patterns.',
        requirements:
          "Need to be able to track the patient by multiple names. Examples are your official name and a partner name.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.name",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "HumanName",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-5, PID-9",
          },
          {
            identity: "rim",
            map: "name",
          },
          {
            identity: "cda",
            map: ".patient.name",
          },
        ],
      },
      {
        id: "Patient.telecom",
        path: "Patient.telecom",
        short: "A contact detail for the individual",
        definition:
          "A contact detail (e.g. a telephone number or an email address) by which the individual may be contacted.",
        comment:
          "A Patient may have multiple ways to be contacted with different uses or applicable periods.  May need to have options for contacting the person urgently and also to help with identification. The address might not go directly to the individual, but may reach another party that is able to proxy for the patient (i.e. home phone, or pet owner's phone).",
        requirements:
          "People have (primary) ways to contact them in some way such as phone, email.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.telecom",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "ContactPoint",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-13, PID-14, PID-40",
          },
          {
            identity: "rim",
            map: "telecom",
          },
          {
            identity: "cda",
            map: ".telecom",
          },
        ],
      },
      {
        id: "Patient.gender",
        path: "Patient.gender",
        short: "male | female | other | unknown",
        definition:
          "Administrative Gender - the gender that the patient is considered to have for administration and record keeping purposes.",
        comment:
          'The gender might not match the biological sex as determined by genetics or the individual\'s preferred identification. Note that for both humans and particularly animals, there are other legitimate possibilities than male and female, though the vast majority of systems and contexts only support male and female.  Systems providing decision support or enforcing business rules should ideally do this on the basis of Observations dealing with the specific sex or gender aspect of interest (anatomical, chromosomal, social, etc.)  However, because these observations are infrequently recorded, defaulting to the administrative gender is common practice.  Where such defaulting occurs, rule enforcement should allow for the variation between administrative and biological, chromosomal and other gender aspects.  For example, an alert about a hysterectomy on a male should be handled as a warning or overridable error, not a "hard" error.  See the Patient Gender and Sex section for additional information about communicating patient gender and sex.',
        requirements:
          "Needed for identification of the individual, in combination with (at least) name and birth date.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.gender",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "AdministrativeGender",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "required",
          description:
            "The gender of a person used for administrative purposes.",
          valueSet: "http://hl7.org/fhir/ValueSet/administrative-gender|4.0.1",
        },
        mapping: [
          {
            identity: "v2",
            map: "PID-8",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/administrativeGender",
          },
          {
            identity: "cda",
            map: ".patient.administrativeGenderCode",
          },
        ],
      },
      {
        id: "Patient.birthDate",
        path: "Patient.birthDate",
        short: "The date of birth for the individual",
        definition: "The date of birth for the individual.",
        comment:
          'At least an estimated year should be provided as a guess if the real DOB is unknown  There is a standard extension "patient-birthTime" available that should be used where Time is required (such as in maternity/infant care systems).',
        requirements: "Age of the individual drives many clinical processes.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.birthDate",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "date",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-7",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/birthTime",
          },
          {
            identity: "cda",
            map: ".patient.birthTime",
          },
          {
            identity: "loinc",
            map: "21112-8",
          },
        ],
      },
      {
        id: "Patient.deceased[x]",
        path: "Patient.deceased[x]",
        short: "Indicates if the individual is deceased or not",
        definition: "Indicates if the individual is deceased or not.",
        comment:
          "If there's no value in the instance, it means there is no statement on whether or not the individual is deceased. Most systems will interpret the absence of a value as a sign of the person being alive.",
        requirements:
          "The fact that a patient is deceased influences the clinical process. Also, in human communication and relation management it is necessary to know whether the person is alive.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.deceased[x]",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "boolean",
          },
          {
            code: "dateTime",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: true,
        isModifierReason:
          "This element is labeled as a modifier because once a patient is marked as deceased, the actions that are appropriate to perform on the patient may be significantly different.",
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-30  (bool) and PID-29 (datetime)",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/deceasedInd, player[classCode=PSN|ANM and determinerCode=INSTANCE]/deceasedTime",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.address",
        path: "Patient.address",
        short: "An address for the individual",
        definition: "An address for the individual.",
        comment:
          "Patient may have multiple addresses with different uses or applicable periods.",
        requirements:
          "May need to keep track of patient addresses for contacting, billing or reporting requirements and also to help with identification.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.address",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Address",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-11",
          },
          {
            identity: "rim",
            map: "addr",
          },
          {
            identity: "cda",
            map: ".addr",
          },
        ],
      },
      {
        id: "Patient.maritalStatus",
        path: "Patient.maritalStatus",
        short: "Marital (civil) status of a patient",
        definition:
          "This field contains a patient's most recent marital (civil) status.",
        requirements: "Most, if not all systems capture it.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.maritalStatus",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "MaritalStatus",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "extensible",
          description: "The domestic partnership status of a person.",
          valueSet: "http://hl7.org/fhir/ValueSet/marital-status",
        },
        mapping: [
          {
            identity: "v2",
            map: "PID-16",
          },
          {
            identity: "rim",
            map: "player[classCode=PSN]/maritalStatusCode",
          },
          {
            identity: "cda",
            map: ".patient.maritalStatusCode",
          },
        ],
      },
      {
        id: "Patient.multipleBirth[x]",
        path: "Patient.multipleBirth[x]",
        short: "Whether patient is part of a multiple birth",
        definition:
          "Indicates whether the patient is part of a multiple (boolean) or indicates the actual birth order (integer).",
        comment:
          "Where the valueInteger is provided, the number is the birth number in the sequence. E.g. The middle birth in triplets would be valueInteger=2 and the third born would have valueInteger=3 If a boolean value was provided for this triplets example, then all 3 patient records would have valueBoolean=true (the ordering is not indicated).",
        requirements:
          "For disambiguation of multiple-birth children, especially relevant where the care provider doesn't meet the patient, such as labs.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.multipleBirth[x]",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "boolean",
          },
          {
            code: "integer",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "PID-24 (bool), PID-25 (integer)",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/multipleBirthInd,  player[classCode=PSN|ANM and determinerCode=INSTANCE]/multipleBirthOrderNumber",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.photo",
        path: "Patient.photo",
        short: "Image of the patient",
        definition: "Image of the patient.",
        comment:
          "Guidelines:\n* Use id photos, not clinical photos.\n* Limit dimensions to thumbnail.\n* Keep byte count low to ease resource updates.",
        requirements:
          "Many EHR systems have the capability to capture an image of the patient. Fits with newer social media usage too.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.photo",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Attachment",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "OBX-5 - needs a profile",
          },
          {
            identity: "rim",
            map: "player[classCode=PSN|ANM and determinerCode=INSTANCE]/desc",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/structuredefinition-explicit-type-name",
            valueString: "Contact",
          },
        ],
        path: "Patient.contact",
        short:
          "A contact party (e.g. guardian, partner, friend) for the patient",
        definition:
          "A contact party (e.g. guardian, partner, friend) for the patient.",
        comment:
          "Contact covers all kinds of contact parties: family members, business contacts, guardians, caregivers. Not applicable to register pedigree and family ties beyond use of having contact.",
        requirements: "Need to track people you can contact about the patient.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.contact",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "BackboneElement",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "pat-1",
            severity: "error",
            human:
              "SHALL at least contain a contact's details or a reference to an organization",
            expression:
              "name.exists() or telecom.exists() or address.exists() or organization.exists()",
            xpath:
              "exists(f:name) or exists(f:telecom) or exists(f:address) or exists(f:organization)",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/scopedRole[classCode=CON]",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.id",
        path: "Patient.contact.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.extension",
        path: "Patient.contact.extension",
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.modifierExtension",
        path: "Patient.contact.modifierExtension",
        short: "Extensions that cannot be ignored even if unrecognized",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element and that modifies the understanding of the element in which it is contained and/or the understanding of the containing element's descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        requirements:
          "Modifier extensions allow for extensions that *cannot* be safely ignored to be clearly distinguished from the vast majority of extensions which can be safely ignored.  This promotes interoperability by eliminating the need for implementers to prohibit the presence of extensions. For further information, see the [definition of modifier extensions](extensibility.html#modifierExtension).",
        alias: ["extensions", "user content", "modifiers"],
        min: 0,
        max: "*",
        base: {
          path: "BackboneElement.modifierExtension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: true,
        isModifierReason:
          "Modifier extensions are expected to modify the meaning or interpretation of the element that contains them",
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Patient.contact.relationship",
        path: "Patient.contact.relationship",
        short: "The kind of relationship",
        definition:
          "The nature of the relationship between the patient and the contact person.",
        requirements:
          "Used to determine which contact person is the most relevant to approach, depending on circumstances.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.contact.relationship",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ContactRelationship",
            },
          ],
          strength: "extensible",
          description:
            "The nature of the relationship between a patient and a contact person for that patient.",
          valueSet: "http://hl7.org/fhir/ValueSet/patient-contactrelationship",
        },
        mapping: [
          {
            identity: "v2",
            map: "NK1-7, NK1-3",
          },
          {
            identity: "rim",
            map: "code",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.name",
        path: "Patient.contact.name",
        short: "A name associated with the contact person",
        definition: "A name associated with the contact person.",
        requirements:
          "Contact persons need to be identified by name, but it is uncommon to need details about multiple other names for that contact person.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.contact.name",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "HumanName",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "NK1-2",
          },
          {
            identity: "rim",
            map: "name",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.telecom",
        path: "Patient.contact.telecom",
        short: "A contact detail for the person",
        definition:
          "A contact detail for the person, e.g. a telephone number or an email address.",
        comment:
          "Contact may have multiple ways to be contacted with different uses or applicable periods.  May need to have options for contacting the person urgently, and also to help with identification.",
        requirements:
          "People have (primary) ways to contact them in some way such as phone, email.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.contact.telecom",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "ContactPoint",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "NK1-5, NK1-6, NK1-40",
          },
          {
            identity: "rim",
            map: "telecom",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.address",
        path: "Patient.contact.address",
        short: "Address for the contact person",
        definition: "Address for the contact person.",
        requirements:
          "Need to keep track where the contact person can be contacted per postal mail or visited.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.contact.address",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Address",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "NK1-4",
          },
          {
            identity: "rim",
            map: "addr",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.gender",
        path: "Patient.contact.gender",
        short: "male | female | other | unknown",
        definition:
          "Administrative Gender - the gender that the contact person is considered to have for administration and record keeping purposes.",
        requirements: "Needed to address the person correctly.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.contact.gender",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "AdministrativeGender",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "required",
          description:
            "The gender of a person used for administrative purposes.",
          valueSet: "http://hl7.org/fhir/ValueSet/administrative-gender|4.0.1",
        },
        mapping: [
          {
            identity: "v2",
            map: "NK1-15",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/administrativeGender",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.organization",
        path: "Patient.contact.organization",
        short: "Organization that is associated with the contact",
        definition:
          "Organization on behalf of which the contact is acting or for which the contact is working.",
        requirements:
          "For guardians or business related contacts, the organization is relevant.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.contact.organization",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Organization",
            ],
          },
        ],
        condition: ["pat-1"],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "NK1-13, NK1-30, NK1-31, NK1-32, NK1-41",
          },
          {
            identity: "rim",
            map: "scoper",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.period",
        path: "Patient.contact.period",
        short:
          "The period during which this contact person or organization is valid to be contacted relating to this patient",
        definition:
          "The period during which this contact person or organization is valid to be contacted relating to this patient.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.contact.period",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Period",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "effectiveTime",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.communication",
        path: "Patient.communication",
        short:
          "A language which may be used to communicate with the patient about his or her health",
        definition:
          "A language which may be used to communicate with the patient about his or her health.",
        comment:
          "If no language is specified, this *implies* that the default local language is spoken.  If you need to convey proficiency for multiple modes, then you need multiple Patient.Communication associations.   For animals, language is not a relevant field, and should be absent from the instance. If the Patient does not speak the default local language, then the Interpreter Required Standard can be used to explicitly declare that an interpreter is required.",
        requirements:
          "If a patient does not speak the local language, interpreters may be required, so languages spoken and proficiency are important things to keep track of both for patient and other persons of interest.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.communication",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "BackboneElement",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "LanguageCommunication",
          },
          {
            identity: "cda",
            map: "patient.languageCommunication",
          },
        ],
      },
      {
        id: "Patient.communication.id",
        path: "Patient.communication.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.communication.extension",
        path: "Patient.communication.extension",
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.communication.modifierExtension",
        path: "Patient.communication.modifierExtension",
        short: "Extensions that cannot be ignored even if unrecognized",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element and that modifies the understanding of the element in which it is contained and/or the understanding of the containing element's descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        requirements:
          "Modifier extensions allow for extensions that *cannot* be safely ignored to be clearly distinguished from the vast majority of extensions which can be safely ignored.  This promotes interoperability by eliminating the need for implementers to prohibit the presence of extensions. For further information, see the [definition of modifier extensions](extensibility.html#modifierExtension).",
        alias: ["extensions", "user content", "modifiers"],
        min: 0,
        max: "*",
        base: {
          path: "BackboneElement.modifierExtension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: true,
        isModifierReason:
          "Modifier extensions are expected to modify the meaning or interpretation of the element that contains them",
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Patient.communication.language",
        path: "Patient.communication.language",
        short:
          "The language which can be used to communicate with the patient about his or her health",
        definition:
          'The ISO-639-1 alpha 2 code in lower case for the language, optionally followed by a hyphen and the ISO-3166-1 alpha 2 code for the region in upper case; e.g. "en" for English, or "en-US" for American English versus "en-EN" for England English.',
        comment:
          "The structure aa-BB with this exact casing is one the most widely used notations for locale. However not all systems actually code this but instead have it as free text. Hence CodeableConcept instead of code as the data type.",
        requirements:
          "Most systems in multilingual countries will want to convey language. Not all systems actually need the regional dialect.",
        min: 1,
        max: "1",
        base: {
          path: "Patient.communication.language",
          min: 1,
          max: "1",
        },
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-maxValueSet",
              valueCanonical: "http://hl7.org/fhir/ValueSet/all-languages",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "Language",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "preferred",
          description: "A human language.",
          valueSet: "http://hl7.org/fhir/ValueSet/languages",
        },
        mapping: [
          {
            identity: "v2",
            map: "PID-15, LAN-2",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/languageCommunication/code",
          },
          {
            identity: "cda",
            map: ".languageCode",
          },
        ],
      },
      {
        id: "Patient.communication.preferred",
        path: "Patient.communication.preferred",
        short: "Language preference indicator",
        definition:
          "Indicates whether or not the patient prefers this language (over other languages he masters up a certain level).",
        comment:
          "This language is specifically identified for communicating healthcare information.",
        requirements:
          "People that master multiple languages up to certain level may prefer one or more, i.e. feel more confident in communicating in a particular language making other languages sort of a fall back method.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.communication.preferred",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "boolean",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "PID-15",
          },
          {
            identity: "rim",
            map: "preferenceInd",
          },
          {
            identity: "cda",
            map: ".preferenceInd",
          },
        ],
      },
      {
        id: "Patient.generalPractitioner",
        path: "Patient.generalPractitioner",
        short: "Patient's nominated primary care provider",
        definition: "Patient's nominated care provider.",
        comment:
          'This may be the primary care provider (in a GP context), or it may be a patient nominated care manager in a community/disability setting, or even organization that will provide people to perform the care provider roles.  It is not to be used to record Care Teams, these should be in a CareTeam resource that may be linked to the CarePlan or EpisodeOfCare resources.\nMultiple GPs may be recorded against the patient for various reasons, such as a student that has his home GP listed along with the GP at university during the school semesters, or a "fly-in/fly-out" worker that has the onsite GP also included with his home GP to remain aware of medical issues.\n\nJurisdictions may decide that they can profile this down to 1 if desired, or 1 per type.',
        alias: ["careProvider"],
        min: 0,
        max: "*",
        base: {
          path: "Patient.generalPractitioner",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Organization",
              "http://hl7.org/fhir/StructureDefinition/Practitioner",
              "http://hl7.org/fhir/StructureDefinition/PractitionerRole",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "v2",
            map: "PD1-4",
          },
          {
            identity: "rim",
            map: "subjectOf.CareEvent.performer.AssignedEntity",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.managingOrganization",
        path: "Patient.managingOrganization",
        short: "Organization that is the custodian of the patient record",
        definition: "Organization that is the custodian of the patient record.",
        comment:
          "There is only one managing organization for a specific patient record. Other organizations will have their own Patient record, and may use the Link property to join the records together (or a Person resource which can include confidence ratings for the association).",
        requirements:
          "Need to know who recognizes this patient record, manages and updates it.",
        min: 0,
        max: "1",
        base: {
          path: "Patient.managingOrganization",
          min: 0,
          max: "1",
        },
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Organization",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "scoper",
          },
          {
            identity: "cda",
            map: ".providerOrganization",
          },
        ],
      },
      {
        id: "Patient.link",
        path: "Patient.link",
        short:
          "Link to another patient resource that concerns the same actual person",
        definition:
          "Link to another patient resource that concerns the same actual patient.",
        comment:
          "There is no assumption that linked patient records have mutual links.",
        requirements:
          "There are multiple use cases:   \n\n* Duplicate patient records due to the clerical errors associated with the difficulties of identifying humans consistently, and \n* Distribution of patient information across multiple servers.",
        min: 0,
        max: "*",
        base: {
          path: "Patient.link",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "BackboneElement",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: true,
        isModifierReason:
          "This element is labeled as a modifier because it might not be the main Patient resource, and the referenced patient should be used instead of this Patient record. This is when the link.type value is 'replaced-by'",
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "outboundLink",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.link.id",
        path: "Patient.link.id",
        representation: ["xmlAttr"],
        short: "Unique id for inter-element referencing",
        definition:
          "Unique id for the element within a resource (for internal references). This may be any string value that does not contain spaces.",
        min: 0,
        max: "1",
        base: {
          path: "Element.id",
          min: 0,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
                valueUrl: "string",
              },
            ],
            code: "http://hl7.org/fhirpath/System.String",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.link.extension",
        path: "Patient.link.extension",
        short: "Additional content defined by implementations",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        alias: ["extensions", "user content"],
        min: 0,
        max: "*",
        base: {
          path: "Element.extension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: false,
        isSummary: false,
        mapping: [
          {
            identity: "rim",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.link.modifierExtension",
        path: "Patient.link.modifierExtension",
        short: "Extensions that cannot be ignored even if unrecognized",
        definition:
          "May be used to represent additional information that is not part of the basic definition of the element and that modifies the understanding of the element in which it is contained and/or the understanding of the containing element's descendants. Usually modifier elements provide negation or qualification. To make the use of extensions safe and manageable, there is a strict set of governance applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension. Applications processing a resource are required to check for modifier extensions.\n\nModifier extensions SHALL NOT change the meaning of any elements on Resource or DomainResource (including cannot change the meaning of modifierExtension itself).",
        comment:
          "There can be no stigma associated with the use of extensions by any application, project, or standard - regardless of the institution or jurisdiction that uses or defines the extensions.  The use of extensions is what allows the FHIR specification to retain a core level of simplicity for everyone.",
        requirements:
          "Modifier extensions allow for extensions that *cannot* be safely ignored to be clearly distinguished from the vast majority of extensions which can be safely ignored.  This promotes interoperability by eliminating the need for implementers to prohibit the presence of extensions. For further information, see the [definition of modifier extensions](extensibility.html#modifierExtension).",
        alias: ["extensions", "user content", "modifiers"],
        min: 0,
        max: "*",
        base: {
          path: "BackboneElement.modifierExtension",
          min: 0,
          max: "*",
        },
        type: [
          {
            code: "Extension",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
          {
            key: "ext-1",
            severity: "error",
            human: "Must have either extensions or value[x], not both",
            expression: "extension.exists() != value.exists()",
            xpath:
              'exists(f:extension)!=exists(f:*[starts-with(local-name(.), "value")])',
            source: "http://hl7.org/fhir/StructureDefinition/Extension",
          },
        ],
        isModifier: true,
        isModifierReason:
          "Modifier extensions are expected to modify the meaning or interpretation of the element that contains them",
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "N/A",
          },
        ],
      },
      {
        id: "Patient.link.other",
        path: "Patient.link.other",
        short:
          "The other patient or related person resource that the link refers to",
        definition: "The other patient resource that the link refers to.",
        comment:
          "Referencing a RelatedPerson here removes the need to use a Person record to associate a Patient and RelatedPerson as the same individual.",
        min: 1,
        max: "1",
        base: {
          path: "Patient.link.other",
          min: 1,
          max: "1",
        },
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-hierarchy",
                valueBoolean: false,
              },
            ],
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Patient",
              "http://hl7.org/fhir/StructureDefinition/RelatedPerson",
            ],
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-3, MRG-1",
          },
          {
            identity: "rim",
            map: "id",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.link.type",
        path: "Patient.link.type",
        short: "replaced-by | replaces | refer | seealso",
        definition:
          "The type of link between this patient resource and another patient resource.",
        min: 1,
        max: "1",
        base: {
          path: "Patient.link.type",
          min: 1,
          max: "1",
        },
        type: [
          {
            code: "code",
          },
        ],
        constraint: [
          {
            key: "ele-1",
            severity: "error",
            human: "All FHIR elements must have a @value or children",
            expression: "hasValue() or (children().count() > id.count())",
            xpath: "@value|f:*|h:div",
            source: "http://hl7.org/fhir/StructureDefinition/Element",
          },
        ],
        isModifier: false,
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "LinkType",
            },
          ],
          strength: "required",
          description:
            "The type of link between this patient resource and another patient resource.",
          valueSet: "http://hl7.org/fhir/ValueSet/link-type|4.0.1",
        },
        mapping: [
          {
            identity: "rim",
            map: "typeCode",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
    ],
  },
  differential: {
    element: [
      {
        id: "Patient",
        path: "Patient",
        short:
          "Information about an individual or animal receiving health care services",
        definition:
          "Demographics and other administrative information about an individual or animal receiving care or other health-related services.",
        alias: ["SubjectOfCare Client Resident"],
        min: 0,
        max: "*",
        mapping: [
          {
            identity: "rim",
            map: "Patient[classCode=PAT]",
          },
          {
            identity: "cda",
            map: "ClinicalDocument.recordTarget.patientRole",
          },
        ],
      },
      {
        id: "Patient.identifier",
        path: "Patient.identifier",
        short: "An identifier for this patient",
        definition: "An identifier for this patient.",
        requirements:
          "Patients are almost always assigned specific numerical identifiers.",
        min: 0,
        max: "*",
        type: [
          {
            code: "Identifier",
          },
        ],
        isSummary: true,
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.identifier",
          },
          {
            identity: "v2",
            map: "PID-3",
          },
          {
            identity: "rim",
            map: "id",
          },
          {
            identity: "cda",
            map: ".id",
          },
        ],
      },
      {
        id: "Patient.active",
        path: "Patient.active",
        short: "Whether this patient's record is in active use",
        definition:
          "Whether this patient record is in active use. \nMany systems use this property to mark as non-current patients, such as those that have not been seen for a period of time based on an organization's business rules.\n\nIt is often used to filter patient lists to exclude inactive patients\n\nDeceased patients may also be marked as inactive for the same reasons, but may be active for some time after death.",
        comment:
          "If a record is inactive, and linked to an active record, then future patient/record updates should occur on the other patient.",
        requirements:
          "Need to be able to mark a patient record as not to be used because it was created in error.",
        min: 0,
        max: "1",
        type: [
          {
            code: "boolean",
          },
        ],
        meaningWhenMissing:
          "This resource is generally assumed to be active if no value is provided for the active element",
        isModifier: true,
        isModifierReason:
          "This element is labelled as a modifier because it is a status element that can indicate that a record should not be treated as valid",
        isSummary: true,
        mapping: [
          {
            identity: "w5",
            map: "FiveWs.status",
          },
          {
            identity: "rim",
            map: "statusCode",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.name",
        path: "Patient.name",
        short: "A name associated with the patient",
        definition: "A name associated with the individual.",
        comment:
          'A patient may have multiple names with different uses or applicable periods. For animals, the name is a "HumanName" in the sense that is assigned and used by humans and has the same patterns.',
        requirements:
          "Need to be able to track the patient by multiple names. Examples are your official name and a partner name.",
        min: 0,
        max: "*",
        type: [
          {
            code: "HumanName",
          },
        ],
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-5, PID-9",
          },
          {
            identity: "rim",
            map: "name",
          },
          {
            identity: "cda",
            map: ".patient.name",
          },
        ],
      },
      {
        id: "Patient.telecom",
        path: "Patient.telecom",
        short: "A contact detail for the individual",
        definition:
          "A contact detail (e.g. a telephone number or an email address) by which the individual may be contacted.",
        comment:
          "A Patient may have multiple ways to be contacted with different uses or applicable periods.  May need to have options for contacting the person urgently and also to help with identification. The address might not go directly to the individual, but may reach another party that is able to proxy for the patient (i.e. home phone, or pet owner's phone).",
        requirements:
          "People have (primary) ways to contact them in some way such as phone, email.",
        min: 0,
        max: "*",
        type: [
          {
            code: "ContactPoint",
          },
        ],
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-13, PID-14, PID-40",
          },
          {
            identity: "rim",
            map: "telecom",
          },
          {
            identity: "cda",
            map: ".telecom",
          },
        ],
      },
      {
        id: "Patient.gender",
        path: "Patient.gender",
        short: "male | female | other | unknown",
        definition:
          "Administrative Gender - the gender that the patient is considered to have for administration and record keeping purposes.",
        comment:
          'The gender might not match the biological sex as determined by genetics or the individual\'s preferred identification. Note that for both humans and particularly animals, there are other legitimate possibilities than male and female, though the vast majority of systems and contexts only support male and female.  Systems providing decision support or enforcing business rules should ideally do this on the basis of Observations dealing with the specific sex or gender aspect of interest (anatomical, chromosomal, social, etc.)  However, because these observations are infrequently recorded, defaulting to the administrative gender is common practice.  Where such defaulting occurs, rule enforcement should allow for the variation between administrative and biological, chromosomal and other gender aspects.  For example, an alert about a hysterectomy on a male should be handled as a warning or overridable error, not a "hard" error.  See the Patient Gender and Sex section for additional information about communicating patient gender and sex.',
        requirements:
          "Needed for identification of the individual, in combination with (at least) name and birth date.",
        min: 0,
        max: "1",
        type: [
          {
            code: "code",
          },
        ],
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "AdministrativeGender",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "required",
          description:
            "The gender of a person used for administrative purposes.",
          valueSet: "http://hl7.org/fhir/ValueSet/administrative-gender|4.0.1",
        },
        mapping: [
          {
            identity: "v2",
            map: "PID-8",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/administrativeGender",
          },
          {
            identity: "cda",
            map: ".patient.administrativeGenderCode",
          },
        ],
      },
      {
        id: "Patient.birthDate",
        path: "Patient.birthDate",
        short: "The date of birth for the individual",
        definition: "The date of birth for the individual.",
        comment:
          'At least an estimated year should be provided as a guess if the real DOB is unknown  There is a standard extension "patient-birthTime" available that should be used where Time is required (such as in maternity/infant care systems).',
        requirements: "Age of the individual drives many clinical processes.",
        min: 0,
        max: "1",
        type: [
          {
            code: "date",
          },
        ],
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-7",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/birthTime",
          },
          {
            identity: "cda",
            map: ".patient.birthTime",
          },
          {
            identity: "loinc",
            map: "21112-8",
          },
        ],
      },
      {
        id: "Patient.deceased[x]",
        path: "Patient.deceased[x]",
        short: "Indicates if the individual is deceased or not",
        definition: "Indicates if the individual is deceased or not.",
        comment:
          "If there's no value in the instance, it means there is no statement on whether or not the individual is deceased. Most systems will interpret the absence of a value as a sign of the person being alive.",
        requirements:
          "The fact that a patient is deceased influences the clinical process. Also, in human communication and relation management it is necessary to know whether the person is alive.",
        min: 0,
        max: "1",
        type: [
          {
            code: "boolean",
          },
          {
            code: "dateTime",
          },
        ],
        isModifier: true,
        isModifierReason:
          "This element is labeled as a modifier because once a patient is marked as deceased, the actions that are appropriate to perform on the patient may be significantly different.",
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-30  (bool) and PID-29 (datetime)",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/deceasedInd, player[classCode=PSN|ANM and determinerCode=INSTANCE]/deceasedTime",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.address",
        path: "Patient.address",
        short: "An address for the individual",
        definition: "An address for the individual.",
        comment:
          "Patient may have multiple addresses with different uses or applicable periods.",
        requirements:
          "May need to keep track of patient addresses for contacting, billing or reporting requirements and also to help with identification.",
        min: 0,
        max: "*",
        type: [
          {
            code: "Address",
          },
        ],
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-11",
          },
          {
            identity: "rim",
            map: "addr",
          },
          {
            identity: "cda",
            map: ".addr",
          },
        ],
      },
      {
        id: "Patient.maritalStatus",
        path: "Patient.maritalStatus",
        short: "Marital (civil) status of a patient",
        definition:
          "This field contains a patient's most recent marital (civil) status.",
        requirements: "Most, if not all systems capture it.",
        min: 0,
        max: "1",
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "MaritalStatus",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "extensible",
          description: "The domestic partnership status of a person.",
          valueSet: "http://hl7.org/fhir/ValueSet/marital-status",
        },
        mapping: [
          {
            identity: "v2",
            map: "PID-16",
          },
          {
            identity: "rim",
            map: "player[classCode=PSN]/maritalStatusCode",
          },
          {
            identity: "cda",
            map: ".patient.maritalStatusCode",
          },
        ],
      },
      {
        id: "Patient.multipleBirth[x]",
        path: "Patient.multipleBirth[x]",
        short: "Whether patient is part of a multiple birth",
        definition:
          "Indicates whether the patient is part of a multiple (boolean) or indicates the actual birth order (integer).",
        comment:
          "Where the valueInteger is provided, the number is the birth number in the sequence. E.g. The middle birth in triplets would be valueInteger=2 and the third born would have valueInteger=3 If a boolean value was provided for this triplets example, then all 3 patient records would have valueBoolean=true (the ordering is not indicated).",
        requirements:
          "For disambiguation of multiple-birth children, especially relevant where the care provider doesn't meet the patient, such as labs.",
        min: 0,
        max: "1",
        type: [
          {
            code: "boolean",
          },
          {
            code: "integer",
          },
        ],
        mapping: [
          {
            identity: "v2",
            map: "PID-24 (bool), PID-25 (integer)",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/multipleBirthInd,  player[classCode=PSN|ANM and determinerCode=INSTANCE]/multipleBirthOrderNumber",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.photo",
        path: "Patient.photo",
        short: "Image of the patient",
        definition: "Image of the patient.",
        comment:
          "Guidelines:\n* Use id photos, not clinical photos.\n* Limit dimensions to thumbnail.\n* Keep byte count low to ease resource updates.",
        requirements:
          "Many EHR systems have the capability to capture an image of the patient. Fits with newer social media usage too.",
        min: 0,
        max: "*",
        type: [
          {
            code: "Attachment",
          },
        ],
        mapping: [
          {
            identity: "v2",
            map: "OBX-5 - needs a profile",
          },
          {
            identity: "rim",
            map: "player[classCode=PSN|ANM and determinerCode=INSTANCE]/desc",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact",
        extension: [
          {
            url:
              "http://hl7.org/fhir/StructureDefinition/structuredefinition-explicit-type-name",
            valueString: "Contact",
          },
        ],
        path: "Patient.contact",
        short:
          "A contact party (e.g. guardian, partner, friend) for the patient",
        definition:
          "A contact party (e.g. guardian, partner, friend) for the patient.",
        comment:
          "Contact covers all kinds of contact parties: family members, business contacts, guardians, caregivers. Not applicable to register pedigree and family ties beyond use of having contact.",
        requirements: "Need to track people you can contact about the patient.",
        min: 0,
        max: "*",
        type: [
          {
            code: "BackboneElement",
          },
        ],
        constraint: [
          {
            key: "pat-1",
            severity: "error",
            human:
              "SHALL at least contain a contact's details or a reference to an organization",
            expression:
              "name.exists() or telecom.exists() or address.exists() or organization.exists()",
            xpath:
              "exists(f:name) or exists(f:telecom) or exists(f:address) or exists(f:organization)",
          },
        ],
        mapping: [
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/scopedRole[classCode=CON]",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.relationship",
        path: "Patient.contact.relationship",
        short: "The kind of relationship",
        definition:
          "The nature of the relationship between the patient and the contact person.",
        requirements:
          "Used to determine which contact person is the most relevant to approach, depending on circumstances.",
        min: 0,
        max: "*",
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "ContactRelationship",
            },
          ],
          strength: "extensible",
          description:
            "The nature of the relationship between a patient and a contact person for that patient.",
          valueSet: "http://hl7.org/fhir/ValueSet/patient-contactrelationship",
        },
        mapping: [
          {
            identity: "v2",
            map: "NK1-7, NK1-3",
          },
          {
            identity: "rim",
            map: "code",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.name",
        path: "Patient.contact.name",
        short: "A name associated with the contact person",
        definition: "A name associated with the contact person.",
        requirements:
          "Contact persons need to be identified by name, but it is uncommon to need details about multiple other names for that contact person.",
        min: 0,
        max: "1",
        type: [
          {
            code: "HumanName",
          },
        ],
        mapping: [
          {
            identity: "v2",
            map: "NK1-2",
          },
          {
            identity: "rim",
            map: "name",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.telecom",
        path: "Patient.contact.telecom",
        short: "A contact detail for the person",
        definition:
          "A contact detail for the person, e.g. a telephone number or an email address.",
        comment:
          "Contact may have multiple ways to be contacted with different uses or applicable periods.  May need to have options for contacting the person urgently, and also to help with identification.",
        requirements:
          "People have (primary) ways to contact them in some way such as phone, email.",
        min: 0,
        max: "*",
        type: [
          {
            code: "ContactPoint",
          },
        ],
        mapping: [
          {
            identity: "v2",
            map: "NK1-5, NK1-6, NK1-40",
          },
          {
            identity: "rim",
            map: "telecom",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.address",
        path: "Patient.contact.address",
        short: "Address for the contact person",
        definition: "Address for the contact person.",
        requirements:
          "Need to keep track where the contact person can be contacted per postal mail or visited.",
        min: 0,
        max: "1",
        type: [
          {
            code: "Address",
          },
        ],
        mapping: [
          {
            identity: "v2",
            map: "NK1-4",
          },
          {
            identity: "rim",
            map: "addr",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.gender",
        path: "Patient.contact.gender",
        short: "male | female | other | unknown",
        definition:
          "Administrative Gender - the gender that the contact person is considered to have for administration and record keeping purposes.",
        requirements: "Needed to address the person correctly.",
        min: 0,
        max: "1",
        type: [
          {
            code: "code",
          },
        ],
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "AdministrativeGender",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "required",
          description:
            "The gender of a person used for administrative purposes.",
          valueSet: "http://hl7.org/fhir/ValueSet/administrative-gender|4.0.1",
        },
        mapping: [
          {
            identity: "v2",
            map: "NK1-15",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/administrativeGender",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.organization",
        path: "Patient.contact.organization",
        short: "Organization that is associated with the contact",
        definition:
          "Organization on behalf of which the contact is acting or for which the contact is working.",
        requirements:
          "For guardians or business related contacts, the organization is relevant.",
        min: 0,
        max: "1",
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Organization",
            ],
          },
        ],
        condition: ["pat-1"],
        mapping: [
          {
            identity: "v2",
            map: "NK1-13, NK1-30, NK1-31, NK1-32, NK1-41",
          },
          {
            identity: "rim",
            map: "scoper",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.contact.period",
        path: "Patient.contact.period",
        short:
          "The period during which this contact person or organization is valid to be contacted relating to this patient",
        definition:
          "The period during which this contact person or organization is valid to be contacted relating to this patient.",
        min: 0,
        max: "1",
        type: [
          {
            code: "Period",
          },
        ],
        mapping: [
          {
            identity: "rim",
            map: "effectiveTime",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.communication",
        path: "Patient.communication",
        short:
          "A language which may be used to communicate with the patient about his or her health",
        definition:
          "A language which may be used to communicate with the patient about his or her health.",
        comment:
          "If no language is specified, this *implies* that the default local language is spoken.  If you need to convey proficiency for multiple modes, then you need multiple Patient.Communication associations.   For animals, language is not a relevant field, and should be absent from the instance. If the Patient does not speak the default local language, then the Interpreter Required Standard can be used to explicitly declare that an interpreter is required.",
        requirements:
          "If a patient does not speak the local language, interpreters may be required, so languages spoken and proficiency are important things to keep track of both for patient and other persons of interest.",
        min: 0,
        max: "*",
        type: [
          {
            code: "BackboneElement",
          },
        ],
        mapping: [
          {
            identity: "rim",
            map: "LanguageCommunication",
          },
          {
            identity: "cda",
            map: "patient.languageCommunication",
          },
        ],
      },
      {
        id: "Patient.communication.language",
        path: "Patient.communication.language",
        short:
          "The language which can be used to communicate with the patient about his or her health",
        definition:
          'The ISO-639-1 alpha 2 code in lower case for the language, optionally followed by a hyphen and the ISO-3166-1 alpha 2 code for the region in upper case; e.g. "en" for English, or "en-US" for American English versus "en-EN" for England English.',
        comment:
          "The structure aa-BB with this exact casing is one the most widely used notations for locale. However not all systems actually code this but instead have it as free text. Hence CodeableConcept instead of code as the data type.",
        requirements:
          "Most systems in multilingual countries will want to convey language. Not all systems actually need the regional dialect.",
        min: 1,
        max: "1",
        type: [
          {
            code: "CodeableConcept",
          },
        ],
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-maxValueSet",
              valueCanonical: "http://hl7.org/fhir/ValueSet/all-languages",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "Language",
            },
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-isCommonBinding",
              valueBoolean: true,
            },
          ],
          strength: "preferred",
          description: "A human language.",
          valueSet: "http://hl7.org/fhir/ValueSet/languages",
        },
        mapping: [
          {
            identity: "v2",
            map: "PID-15, LAN-2",
          },
          {
            identity: "rim",
            map:
              "player[classCode=PSN|ANM and determinerCode=INSTANCE]/languageCommunication/code",
          },
          {
            identity: "cda",
            map: ".languageCode",
          },
        ],
      },
      {
        id: "Patient.communication.preferred",
        path: "Patient.communication.preferred",
        short: "Language preference indicator",
        definition:
          "Indicates whether or not the patient prefers this language (over other languages he masters up a certain level).",
        comment:
          "This language is specifically identified for communicating healthcare information.",
        requirements:
          "People that master multiple languages up to certain level may prefer one or more, i.e. feel more confident in communicating in a particular language making other languages sort of a fall back method.",
        min: 0,
        max: "1",
        type: [
          {
            code: "boolean",
          },
        ],
        mapping: [
          {
            identity: "v2",
            map: "PID-15",
          },
          {
            identity: "rim",
            map: "preferenceInd",
          },
          {
            identity: "cda",
            map: ".preferenceInd",
          },
        ],
      },
      {
        id: "Patient.generalPractitioner",
        path: "Patient.generalPractitioner",
        short: "Patient's nominated primary care provider",
        definition: "Patient's nominated care provider.",
        comment:
          'This may be the primary care provider (in a GP context), or it may be a patient nominated care manager in a community/disability setting, or even organization that will provide people to perform the care provider roles.  It is not to be used to record Care Teams, these should be in a CareTeam resource that may be linked to the CarePlan or EpisodeOfCare resources.\nMultiple GPs may be recorded against the patient for various reasons, such as a student that has his home GP listed along with the GP at university during the school semesters, or a "fly-in/fly-out" worker that has the onsite GP also included with his home GP to remain aware of medical issues.\n\nJurisdictions may decide that they can profile this down to 1 if desired, or 1 per type.',
        alias: ["careProvider"],
        min: 0,
        max: "*",
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Organization",
              "http://hl7.org/fhir/StructureDefinition/Practitioner",
              "http://hl7.org/fhir/StructureDefinition/PractitionerRole",
            ],
          },
        ],
        mapping: [
          {
            identity: "v2",
            map: "PD1-4",
          },
          {
            identity: "rim",
            map: "subjectOf.CareEvent.performer.AssignedEntity",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.managingOrganization",
        path: "Patient.managingOrganization",
        short: "Organization that is the custodian of the patient record",
        definition: "Organization that is the custodian of the patient record.",
        comment:
          "There is only one managing organization for a specific patient record. Other organizations will have their own Patient record, and may use the Link property to join the records together (or a Person resource which can include confidence ratings for the association).",
        requirements:
          "Need to know who recognizes this patient record, manages and updates it.",
        min: 0,
        max: "1",
        type: [
          {
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Organization",
            ],
          },
        ],
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "scoper",
          },
          {
            identity: "cda",
            map: ".providerOrganization",
          },
        ],
      },
      {
        id: "Patient.link",
        path: "Patient.link",
        short:
          "Link to another patient resource that concerns the same actual person",
        definition:
          "Link to another patient resource that concerns the same actual patient.",
        comment:
          "There is no assumption that linked patient records have mutual links.",
        requirements:
          "There are multiple use cases:   \n\n* Duplicate patient records due to the clerical errors associated with the difficulties of identifying humans consistently, and \n* Distribution of patient information across multiple servers.",
        min: 0,
        max: "*",
        type: [
          {
            code: "BackboneElement",
          },
        ],
        isModifier: true,
        isModifierReason:
          "This element is labeled as a modifier because it might not be the main Patient resource, and the referenced patient should be used instead of this Patient record. This is when the link.type value is 'replaced-by'",
        isSummary: true,
        mapping: [
          {
            identity: "rim",
            map: "outboundLink",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.link.other",
        path: "Patient.link.other",
        short:
          "The other patient or related person resource that the link refers to",
        definition: "The other patient resource that the link refers to.",
        comment:
          "Referencing a RelatedPerson here removes the need to use a Person record to associate a Patient and RelatedPerson as the same individual.",
        min: 1,
        max: "1",
        type: [
          {
            extension: [
              {
                url:
                  "http://hl7.org/fhir/StructureDefinition/structuredefinition-hierarchy",
                valueBoolean: false,
              },
            ],
            code: "Reference",
            targetProfile: [
              "http://hl7.org/fhir/StructureDefinition/Patient",
              "http://hl7.org/fhir/StructureDefinition/RelatedPerson",
            ],
          },
        ],
        isSummary: true,
        mapping: [
          {
            identity: "v2",
            map: "PID-3, MRG-1",
          },
          {
            identity: "rim",
            map: "id",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
      {
        id: "Patient.link.type",
        path: "Patient.link.type",
        short: "replaced-by | replaces | refer | seealso",
        definition:
          "The type of link between this patient resource and another patient resource.",
        min: 1,
        max: "1",
        type: [
          {
            code: "code",
          },
        ],
        isSummary: true,
        binding: {
          extension: [
            {
              url:
                "http://hl7.org/fhir/StructureDefinition/elementdefinition-bindingName",
              valueString: "LinkType",
            },
          ],
          strength: "required",
          description:
            "The type of link between this patient resource and another patient resource.",
          valueSet: "http://hl7.org/fhir/ValueSet/link-type|4.0.1",
        },
        mapping: [
          {
            identity: "rim",
            map: "typeCode",
          },
          {
            identity: "cda",
            map: "n/a",
          },
        ],
      },
    ],
  },
} as unknown) as IStructureDefinition;
