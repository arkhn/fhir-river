import {
  configureStore,
  combineReducers,
  AnyAction,
  createAction,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import user from "features/Auth/userSlice";
import source from "features/Sources/sourceSlice";
import { api } from "services/api/endpoints";

const appReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  source,
  user,
});

export const resetState = createAction("state/reset");

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction
) => {
  if (action.type === resetState().type) state = undefined;
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
