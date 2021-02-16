import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import counterReducer from "../features/counter/counterSlice";
import { api } from "../services/api/api";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    counter: counterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
