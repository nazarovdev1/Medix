import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doctorService } from '../../services/clinicApi';
import type { Doctor, DoctorFormData, PaginatedResponse, PaginationQuery, PaginationMeta } from '../../types';

interface DoctorsState {
  items: Doctor[];
  meta: PaginationMeta;
  isLoading: boolean;
  error: string | null;
}

const initialState: DoctorsState = {
  items: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasPrev: false, hasNext: false },
  isLoading: false,
  error: null,
};

export const fetchDoctors = createAsyncThunk<
  PaginatedResponse<Doctor>,
  PaginationQuery | undefined,
  { rejectValue: string }
>('doctors/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await doctorService.getAll(params);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch doctors';
    return rejectWithValue(message);
  }
});

export const createDoctor = createAsyncThunk<
  Doctor,
  DoctorFormData,
  { rejectValue: string }
>('doctors/create', async (data, { rejectWithValue }) => {
  try {
    const res = await doctorService.create(data);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create doctor';
    return rejectWithValue(message);
  }
});

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchDoctors.fulfilled, (s, { payload }) => { s.isLoading = false; s.items = payload.data; s.meta = payload.meta; })
      .addCase(fetchDoctors.rejected, (s, { payload }) => { s.isLoading = false; s.error = payload ?? null; })
      .addCase(createDoctor.fulfilled, (s, { payload }) => { s.items.unshift(payload); });
  },
});
export default doctorsSlice.reducer;
