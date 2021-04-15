import * as faker from "faker";
import { Factory } from "fishery";

import type {
  Attribute,
  Credential,
  Resource,
  Source,
  Owner,
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
    schema: JSON.parse(faker.datatype.json()),
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
