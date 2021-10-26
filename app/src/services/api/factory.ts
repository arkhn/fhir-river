import { IStructureDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import * as faker from "faker";
import { Factory } from "fishery";

import {
  DefinitionNode,
  ElementNode,
} from "features/FhirResourceTree/resourceTreeSlice";

import {
  Attribute,
  Credential,
  Filter,
  Resource,
  Source,
  Owner,
  Column,
  SqlInput,
  InputGroup,
  Condition,
  Join,
} from "./generated/api.generated";

export const sourceFactory = Factory.define<Source>(({ sequence }) => ({
  id: sequence.toString(),
  name: `source_${sequence}`,
  updated_at: faker.date.past().toString(),
  created_at: faker.date.past().toString(),
  users: [],
}));

export const credentialFactory = Factory.define<Credential>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    available_owners: ["public"],
    host: faker.internet.url(),
    port: 5432,
    database: faker.lorem.word(),
    login: faker.internet.userName(),
    password: faker.internet.password(),
    model: "POSTGRES",
    source: associations.source || sourceFactory.build().id,
    updated_at: faker.date.past().toString(),
    created_at: faker.date.past().toString(),
  })
);

export const ownerFactory = Factory.define<Owner>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    name: "public",
    schema: associations.schema || { table: ["column"] },
    credential: associations.credential || credentialFactory.build().id,
  })
);

export const resourceFactory = Factory.define<Resource>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    primary_key_table: faker.lorem.word(),
    primary_key_column: faker.lorem.word(),
    primary_key_owner: faker.datatype.uuid(),
    definition_id: faker.lorem.word(),
    definition: {
      title: faker.lorem.word(),
      name: faker.lorem.word(),
      type: faker.lorem.word(),
    },
    logical_reference: faker.datatype.uuid(),
    updated_at: faker.date.past().toString(),
    created_at: faker.date.past().toString(),
    source: associations.source || sourceFactory.build().id,
    label: `resource_${sequence}`,
  })
);

export const attributeFactory = Factory.define<Attribute>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    path: associations.path || faker.lorem.word(),
    definition_id: faker.lorem.word(),
    updated_at: faker.date.past().toString(),
    created_at: faker.date.past().toString(),
    resource: associations.resource || resourceFactory.build().id,
  })
);

export const columnFactory = Factory.define<Column>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    column: associations.column || faker.lorem.word(),
    table: associations.table || faker.lorem.word(),
    updated_at: faker.date.past().toString(),
    created_at: faker.date.past().toString(),
    owner: associations.owner || ownerFactory.build().id,
  })
);

export const inputGroupFactory = Factory.define<InputGroup>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    attribute: associations.attribute || attributeFactory.build().id,
    merging_script: faker.lorem.word(),
    updated_at: faker.date.past().toString(),
    created_at: faker.date.past().toString(),
  })
);

export const sqlInputFactory = Factory.define<SqlInput>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    script: faker.lorem.word(),
    concept_map_id: faker.lorem.word(),
    column: associations.column || columnFactory.build().id,
    input_group: associations.input_group || inputGroupFactory.build().id,
    updated_at: faker.date.past().toString(),
    created_at: faker.date.past().toString(),
  })
);

export const conditionFactory = Factory.define<Condition>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    action: associations.action || "INCLUDE",
    sql_input: associations.sql_input || sqlInputFactory.build().id,
    input_group: associations.input_group || inputGroupFactory.build().id,
    relation: associations.relation || "EQ",
    value: associations.value,
  })
);

export const joinFactory = Factory.define<Join>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    sql_input: associations.sql_input || sqlInputFactory.build().id,
    left: associations.left || sqlInputFactory.build().id,
    right: associations.right || sqlInputFactory.build().id,
    updated_at: faker.date.past().toString(),
    created_at: faker.date.past().toString(),
  })
);

export const filterFactory = Factory.define<Filter>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    relation: "<",
    value: faker.lorem.word(),
    sql_input: associations.sql_input || sqlInputFactory.build().id,
    resource: associations.resource || resourceFactory.build().id,
  })
);

export const structureDefinitionFactory = Factory.define<IStructureDefinition>(
  ({ associations }) => {
    const structureDefName = associations.name || faker.lorem.word();
    return {
      resourceType: "StructureDefinition",
      snapshot: {
        element: [
          {
            path: structureDefName,
            id: structureDefName,
          },
          {
            path: `${structureDefName}.subject`,
            id: `${structureDefName}.subject`,
            type: [{ code: "Annotation" }],
            max: "*",
          },
        ],
      },
    };
  }
);

export const definitionNodeFactory = Factory.define<DefinitionNode>(
  ({ associations }) => ({
    definition: {
      id: "Observation.code",
      path: "Observation.code",
    },
    childrenDefinitions: [
      {
        definition: {
          id: "Observation.code.coding",
          path: "Observation.code.coding",
        },
        childrenDefinitions: [],
        sliceDefinitions: [],
      },
    ],
    sliceDefinitions: [
      {
        definition: {
          id: "Observation.code:codeSlice",
          path: "Observation.code",
          sliceName: "codeSlice",
          min: associations.sliceDefinitions?.[0]?.definition.min,
        },
        childrenDefinitions: [
          {
            definition: {
              id: "Observation.code:codeSlice.coding",
              path: "Observation.code.coding",
            },
            childrenDefinitions: [],
            sliceDefinitions: [],
          },
        ],
        sliceDefinitions: [],
      },
    ],
  })
);

export const elementNodeFactory = Factory.define<
  ElementNode,
  { childrenIndexes: number[] }
>(({ transientParams }) => {
  return {
    id: "Observation.code.coding",
    path: "Observation.code.coding",
    isArray: true,
    name: "coding",
    type: "CodeableConcept",
    isRequired: false,
    kind: "complex",
    definitionNode: {
      childrenDefinitions: [],
      sliceDefinitions: [],
      definition: {},
    },
    children:
      transientParams.childrenIndexes?.map((index) => ({
        id: "Observation.code.coding",
        path: `Observation.code.coding[${index}]`,
        isArray: false,
        name: "coding",
        type: "CodeableConcept",
        isRequired: false,
        kind: "complex",
        children: [
          {
            id: "Observation.code.coding.type",
            path: `Observation.code.coding[${index}].type`,
            isArray: false,
            name: "type",
            type: "Type",
            isRequired: false,
            kind: "primitive",
            children: [],
            definitionNode: {
              childrenDefinitions: [],
              sliceDefinitions: [],
              definition: {},
            },
          },
        ],
        definitionNode: {
          childrenDefinitions: [],
          sliceDefinitions: [],
          definition: {},
        },
      })) ?? [],
  };
});
