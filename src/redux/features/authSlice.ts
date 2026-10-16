import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCurrentUser, login } from "../../api/authApi";
import type { AuthUser } from "../../api/authApi";
import { clearTokens, getTokens } from "../../api/authStorage";

type AuthState = {
  user: AuthUser | null;
  /** false while a saved session is being verified on startup */
  initialized: boolean;
  loading: boolean; // login in progress
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  // With no saved tokens there's nothing to verify, so we're ready at once
  initialized: !getTokens(),
  loading: false,
  error: null,
};

/** Re-load the user from saved tokens (runs once at startup). */
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async () => {
    if (!getTokens()) return null;
    try {
      return await getCurrentUser(); // refreshes the token if needed
    } catch {
      clearTokens();
      return null;
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    {
      username,
      password,
      remember,
    }: { username: string; password: string; remember: boolean },
    { rejectWithValue },
  ) => {
    try {
      return await login(username, password, remember);
    } catch (error) {
      return rejectWithValue((error as Error).message || "Login failed");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  clearTokens();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Tokens are already cleared by authApi when this is dispatched
    sessionExpired: (state) => {
      state.user = null;
      state.initialized = true;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.initialized = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      });
  },
});

export const { sessionExpired, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
