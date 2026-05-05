import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentService } from '../../services/clinicApi';
import type { Appointment, AppointmentFormData, PaginatedResponse, PaginationQuery, AppointmentStatus, PaginationMeta } from '../../types';

interface AppointmentsState {
  items: Appointment[];
  total: number;
  meta: PaginationMeta;
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  items: [],
  total: 0,
  meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasPrev: false, hasNext: false },
  isLoading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk<
  PaginatedResponse<Appointment>,
  PaginationQuery | undefined,
  { rejectValue: string }
>('appointments/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await appointmentService.getAll(params);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch appointments';
    return rejectWithValue(message);
  }
});

export const createAppointment = createAsyncThunk<
  Appointment,
  AppointmentFormData,
  { rejectValue: string }
>('appointments/create', async (data, { rejectWithValue }) => {
  try {
    const res = await appointmentService.create(data);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create appointment';
    return rejectWithValue(message);
  }
});

export const updateAppointmentStatus = createAsyncThunk<
  Appointment,
  { id: string; status: AppointmentStatus },
  { rejectValue: string }
>('appointments/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await appointmentService.updateStatus(id, { status });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update status';
    return rejectWithValue(message);
  }
});

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchAppointments.fulfilled, (s, { payload }) => {
        s.isLoading = false;
        s.items = payload.data;
        s.meta = payload.meta;
      })
      .addCase(fetchAppointments.rejected, (s, { payload }) => { s.isLoading = false; s.error = payload ?? null; })
      .addCase(createAppointment.fulfilled, (s, { payload }) => { s.items.unshift(payload); })
      .addCase(updateAppointmentStatus.fulfilled, (s, { payload }) => {
        const idx = s.items.findIndex((i) => i.id === payload.id);
        if (idx !== -1) s.items[idx] = payload;
      });
  },
});
export default appointmentsSlice.reducer;
