import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import user from "features/Auth/userSlice";
import logger from "features/Logger/loggerSlice";
import source from "features/Sources/sourceSlice";
import apiLogger from "services/api/apiLogger";
import { api } from "services/api/endpoints";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    logger,
    source,
    user,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(apiLogger),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
