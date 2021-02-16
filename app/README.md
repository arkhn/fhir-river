## Generate API Routes

From repo root :

```npx @rtk-incubator/rtk-query-codegen-openapi \
--file ./app/src/services/api/generated/api.generated.ts \
--baseQuery ./app/src/services/api/apiBaseQuery.ts:apiBaseQuery \
--hooks \
pyrog-schema.yml```