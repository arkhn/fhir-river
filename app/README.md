# App
## Generate API Routes
```shell
yarn generate:api
```

## Style guide
This React-Redux project follows the overall [Redux style guide](https://redux.js.org/style-guide/style-guide) recommended patterns

### Structure Files as Feature Folders with Single-File Logic
```
    .
    /src
    ├── index.tsx                       # Entry point file that renders the React component tree
    ├── /app
    │   ├── store.ts                    # store setup
    │   ├── App.tsx                     # root React component
    │   └── /routes                     # router and layout folders
    │       ├── Router.tsx              # Router component
    │       ├── Sources.tsx             # root Page component
    │       └── /resources
    │           └── Resources.tsx
    ├── /common                         # hooks, generic components, utils, etc
    ├── /features                       # contains all "feature folders"
    │   └── /todos                      # a single feature folder
    │       ├── todoSlice.ts            # Redux reducer logic and associated actions
    │       └── Todo.tsx                # a React component
    ├── /locales                        # i18n configuration
    ├── /services                       # contains the external called services
    │   └── /api                        # main api folder
    │       ├── /generated              # contains the generated rtk-query file with hooks (read only)
    │       │   └── api.generated.ts
    │       ├── api.ts                  # contains the enhanced endpoints
    │       └── apiBaseQuery.ts         # contains fetch configuration
```
* `/app` contains app-wide setup and layout that depends on all the other folders.
    * `/routes` contains the router component, and the layout folders which follow the routes tree
* `/common` contains truly generic and reusable utilities and components.
* `/features` has folders that contain all functionality related to a specific feature.
  In this example, todosSlice.ts is a "duck"-style file that contains a call to
  RTK's createSlice() function, and exports the slice reducer and action creators. Those folders
  shouldn't be deeply nested.

### Testing guiding principles
[The more your tests resemble the way your software is used, the more confidence they can give you.](https://testing-library.com/docs/guiding-principles)
