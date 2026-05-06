import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/clinicApi';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
}

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
})();

const initialState: AuthState = {
  user: storedUser,
  isLoading: false,
  isLoggedIn: !!localStorage.getItem('accessToken'),
  error: null,
};

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await authService.login(credentials);
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterData,
  { rejectValue: string }
>('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch { /* ignore */ } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.me();
    // Server returns { data: { id, email, role, ... } }, api interceptor unwraps to { data: ... }
    const user = (res as any).data ?? res;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user';
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.user = payload.user;
      })
      .addCase(loginUser.rejected, (state, { payload }) => { state.isLoading = false; state.error = payload ?? null; })
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; })
      .addCase(registerUser.rejected, (state, { payload }) => { state.isLoading = false; state.error = payload ?? null; })
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.isLoggedIn = false; })
      .addCase(fetchCurrentUser.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => { state.isLoading = false; state.user = payload; state.isLoggedIn = true; })
      .addCase(fetchCurrentUser.rejected, (state) => { state.isLoading = false; state.user = null; state.isLoggedIn = false; localStorage.removeItem('user'); localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
