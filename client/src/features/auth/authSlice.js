import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/clinicApi';

// ─── Thunks ───────────────────────────────────────────────────
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await authService.login(credentials);
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (err) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.me();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ─── Slice ────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        null,
    isLoading:   false,
    isLoggedIn:  !!localStorage.getItem('accessToken'),
    error:       null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.isLoggedIn = true;
        state.user       = payload.user;
      })
      .addCase(loginUser.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; })
      // register
      .addCase(registerUser.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; })
      .addCase(registerUser.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; })
      // logout
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.isLoggedIn = false; })
      // me
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => { state.user = payload; state.isLoggedIn = true; })
      .addCase(fetchCurrentUser.rejected,  (state) => { state.user = null; state.isLoggedIn = false; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
