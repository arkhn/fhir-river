import { createAction, createSlice } from "@reduxjs/toolkit";

type UserState = {
  mail: string;
} | null;

const initialState: UserState = {
  mail: "random.mail@arkhn.com",
};

const logout = createAction("logout");

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      return initialState;
    });
  },
});

export default userSlice.reducer;
