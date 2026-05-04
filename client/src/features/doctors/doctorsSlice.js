import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doctorService } from '../../services/clinicApi';

export const fetchDoctors = createAsyncThunk('doctors/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await doctorService.getAll(params); return res; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createDoctor = createAsyncThunk('doctors/create', async (data, { rejectWithValue }) => {
  try { const res = await doctorService.create(data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: { items: [], meta: {}, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchDoctors.fulfilled, (s, { payload }) => { s.isLoading = false; s.items = payload.data; s.meta = payload.meta; })
      .addCase(fetchDoctors.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload; })
      .addCase(createDoctor.fulfilled, (s, { payload }) => { s.items.unshift(payload); });
  },
});
export default doctorsSlice.reducer;
