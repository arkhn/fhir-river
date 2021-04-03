import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import user from "features/auth/userSlice";
import logger from "features/logger/loggerSlice";
import source from "features/sources/sourceSlice";
import apiLogger from "services/api/apiLogger";
import { api } from "services/api/endpoints";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    user,
    source,
    logger,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(apiLogger),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
