import * as faker from "faker";
import { Factory } from "fishery";

import {
  Attribute,
  Credential,
  Filter,
  Resource,
  Source,
  Owner,
  Column,
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
    schema: { table: ["column"] },
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
    path: faker.lorem.word(),
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

export const filterFactory = Factory.define<Filter>(
  ({ sequence, associations }) => ({
    id: sequence.toString(),
    relation: "<",
    sql_column: associations.sql_column || columnFactory.build().id,
    resource: associations.resource || resourceFactory.build().id,
  })
);
