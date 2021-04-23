import {
  configureStore,
  combineReducers,
  AnyAction,
  createAction,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import filter from "features/Filters/filterSlice";
import column from "features/Mappings/columnSlice";
import mapping from "features/Mappings/mappingSlice";
import resource from "features/Mappings/resourceSlice";
import source from "features/Sources/sourceSlice";
import { api } from "services/api/endpoints";

const appReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  column,
  filter,
  mapping,
  resource,
  source,
});
export type RootState = ReturnType<typeof appReducer>;

export const resetState = createAction("state/reset");

const rootReducer = (state: RootState | undefined, action: AnyAction) => {
  if (action.type === resetState().type) state = undefined;
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
