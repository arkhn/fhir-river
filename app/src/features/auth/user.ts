import { createAction, createSlice } from "@reduxjs/toolkit";

type UserState = {
  mail: string;
} | null;

const initialState: UserState = {
  mail: "random.mail@arkhn.com",
};

const logOut = createAction("logout");

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(logOut, () => {
      return initialState;
    });
  },
});

export default userSlice.reducer;
