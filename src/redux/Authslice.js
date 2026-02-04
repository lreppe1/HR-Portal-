// src/redux/Authslice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet } from "../api/client";

const STORAGE_KEY = "hr_auth";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const matches = await apiGet(`/employees?email=${encodeURIComponent(email)}`);
      const user = Array.isArray(matches) ? matches[0] : null;

      if (!user) return rejectWithValue("No user found with that email.");
      if (user.password !== password) return rejectWithValue("Incorrect password.");
      if (role && user.role !== role) return rejectWithValue("Role does not match this account.");

      const payload = {
        id: user.id,                 // "e-1001" or "a-9001"
        role: user.role,
        name: user.name,
        email: user.email,
        department: user.department || "",
        title: user.title || "",
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return payload;
    } catch {
      return rejectWithValue("Login failed. Is json-server running on http://localhost:4000?");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: "",
  },
  reducers: {
    // ✅ THIS is what App.jsx is importing
    hydrateFromStorage(state) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);

        if (saved?.id && saved?.email && saved?.role) {
          state.user = saved;
          state.isAuthenticated = true;
          state.error = "";
        }
      } catch {
        // ignore
      }
    },

    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = "";
      localStorage.removeItem(STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = "";
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed.";
      });
  },
});

// ✅ MUST export this named action
export const { logout, hydrateFromStorage } = authSlice.actions;

export default authSlice.reducer;
