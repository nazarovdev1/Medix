import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { patientService } from '../../services/clinicApi';
import type { Patient, PatientFormData, PaginatedResponse, PaginationQuery, PaginationMeta } from '../../types';

interface PatientsState {
  items: Patient[];
  meta: PaginationMeta;
  isLoading: boolean;
  error: string | null;
}

const initialState: PatientsState = {
  items: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasPrev: false, hasNext: false },
  isLoading: false,
  error: null,
};

export const fetchPatients = createAsyncThunk<
  PaginatedResponse<Patient>,
  PaginationQuery | undefined,
  { rejectValue: string }
>('patients/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await patientService.getAll(params);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch patients';
    return rejectWithValue(message);
  }
});

export const createPatient = createAsyncThunk<
  Patient,
  PatientFormData,
  { rejectValue: string }
>('patients/create', async (data, { rejectWithValue }) => {
  try {
    const res = await patientService.create(data);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create patient';
    return rejectWithValue(message);
  }
});

export const updatePatient = createAsyncThunk<
  Patient,
  { id: string; data: Partial<PatientFormData> },
  { rejectValue: string }
>('patients/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await patientService.update(id, data);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update patient';
    return rejectWithValue(message);
  }
});

export const deletePatient = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('patients/delete', async (id, { rejectWithValue }) => {
  try {
    await patientService.delete(id);
    return id;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete patient';
    return rejectWithValue(message);
  }
});

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchPatients.fulfilled, (s, { payload }) => { s.isLoading = false; s.items = payload.data; s.meta = payload.meta; })
      .addCase(fetchPatients.rejected, (s, { payload }) => { s.isLoading = false; s.error = payload ?? null; })
      .addCase(createPatient.fulfilled, (s, { payload }) => { s.items.unshift(payload); })
      .addCase(updatePatient.fulfilled, (s, { payload }) => {
        const idx = s.items.findIndex((i) => i.id === payload.id);
        if (idx !== -1) s.items[idx] = payload;
      })
      .addCase(deletePatient.fulfilled, (s, { payload }) => { s.items = s.items.filter((i) => i.id !== payload); });
  },
});
export default patientsSlice.reducer;
