import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PermissionRecord } from "./shared";
const permissionsSlice = createSlice({
  name: "permissions",
  initialState: { items: [] as PermissionRecord[] },
  reducers: {
    permissionsReceived(state, action: PayloadAction<PermissionRecord[]>) { state.items = action.payload; },
  },
  extraReducers: (builder) => { builder.addCase("auth/sessionCleared", (state) => { state.items = []; }); builder.addCase("auth/profileCleared", (state) => { state.items = []; }); },
});
export const { permissionsReceived } = permissionsSlice.actions;
export const permissionsReducer = permissionsSlice.reducer;