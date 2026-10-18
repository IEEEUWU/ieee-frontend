import { permissionsReducer } from "@/lib/permissions/store";
import type { AuthUser } from "./user";
import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

export type AuthState = { status: "loading" | "authenticated" | "anonymous"; expiresAt: number | null; pending: boolean; user: AuthUser | null };
const initialState: AuthState = { status: "loading", expiresAt: null, pending: false, user: null };
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionInitialized(state, action: PayloadAction<{ authenticated: boolean; expiresAt?: number | null }>) {
      // A delayed bootstrap response must not overwrite a login or logout.
      if (state.status !== "loading" || state.pending) return;
      state.status = action.payload.authenticated ? "authenticated" : "anonymous";
      state.expiresAt = action.payload.expiresAt ?? null;
    },
    sessionReceived(state, action: PayloadAction<{ authenticated: boolean; expiresAt?: number | null }>) {
      state.status = action.payload.authenticated ? "authenticated" : "anonymous";
      state.expiresAt = action.payload.expiresAt ?? null;
      if (!action.payload.authenticated) state.user = null;
    },
    sessionCleared(state) { state.status = "anonymous"; state.expiresAt = null; state.pending = false; state.user = null; },
    profileCleared(state) { state.user = null; },
    profileReceived(state, action: PayloadAction<AuthUser>) { state.user = action.payload; },
    pendingChanged(state, action: PayloadAction<boolean>) { state.pending = action.payload; },
  },
});
export const { sessionInitialized, sessionReceived, sessionCleared, pendingChanged, profileReceived, profileCleared } = authSlice.actions;
export const makeStore = () => configureStore({ reducer: { auth: authSlice.reducer, permissions: permissionsReducer } });
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
