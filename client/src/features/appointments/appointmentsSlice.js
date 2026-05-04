import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentService } from '../../services/clinicApi';

export const fetchAppointments = createAsyncThunk('appointments/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await appointmentService.getAll(params); return res; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createAppointment = createAsyncThunk('appointments/create', async (data, { rejectWithValue }) => {
  try { const res = await appointmentService.create(data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateAppointmentStatus = createAsyncThunk('appointments/updateStatus', async ({ id, ...data }, { rejectWithValue }) => {
  try { const res = await appointmentService.updateStatus(id, data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: { items: [], total: 0, meta: {}, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchAppointments.fulfilled, (s, { payload }) => {
        s.isLoading = false; s.items = payload.data; s.meta = payload.meta;
      })
      .addCase(fetchAppointments.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload; })
      .addCase(createAppointment.fulfilled, (s, { payload }) => { s.items.unshift(payload); })
      .addCase(updateAppointmentStatus.fulfilled, (s, { payload }) => {
        const idx = s.items.findIndex(i => i.id === payload.id);
        if (idx !== -1) s.items[idx] = payload;
      });
  },
});
export default appointmentsSlice.reducer;
