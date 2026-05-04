import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { patientService } from '../../services/clinicApi';

export const fetchPatients = createAsyncThunk('patients/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await patientService.getAll(params); return res; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createPatient = createAsyncThunk('patients/create', async (data, { rejectWithValue }) => {
  try { const res = await patientService.create(data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updatePatient = createAsyncThunk('patients/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await patientService.update(id, data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deletePatient = createAsyncThunk('patients/delete', async (id, { rejectWithValue }) => {
  try { await patientService.delete(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

const patientsSlice = createSlice({
  name: 'patients',
  initialState: { items: [], meta: {}, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchPatients.fulfilled, (s, { payload }) => { s.isLoading = false; s.items = payload.data; s.meta = payload.meta; })
      .addCase(fetchPatients.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload; })
      .addCase(createPatient.fulfilled, (s, { payload }) => { s.items.unshift(payload); })
      .addCase(updatePatient.fulfilled, (s, { payload }) => {
        const idx = s.items.findIndex(i => i.id === payload.id);
        if (idx !== -1) s.items[idx] = payload;
      })
      .addCase(deletePatient.fulfilled, (s, { payload }) => { s.items = s.items.filter(i => i.id !== payload); });
  },
});
export default patientsSlice.reducer;
