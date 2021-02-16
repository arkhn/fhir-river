# App
## Generate API Routes
From project root
```shell
npx @rtk-incubator/rtk-query-codegen-openapi \
--file ./app/src/services/api/generated/api.generated.ts \
--baseQuery ./app/src/services/api/apiBaseQuery.ts:apiBaseQuery \
--hooks \
pyrog-schema.yml
```

### Style guide
This React-Redux project follows the ["ducks" pattern](https://github.com/erikras/ducks-modular-redux)
and the overall [Redux style guide](https://redux.js.org/style-guide/style-guide) recommendations
