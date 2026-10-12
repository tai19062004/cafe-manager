import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tables: [],
  loading: false,
  error: null,
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    // Fetch
    fetchTablesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTablesSuccess: (state, action) => {
      state.loading = false;
      state.tables = action.payload;
    },
    fetchTablesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create
    createTableRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createTableSuccess: (state, action) => {
      state.loading = false;
      state.tables.push(action.payload);
    },
    createTableFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update
    updateTableRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateTableSuccess: (state, action) => {
      state.loading = false;
      const index = state.tables.findIndex(
        (t) => t.table_id === action.payload.table_id
      );
      if (index !== -1) {
        state.tables[index] = action.payload;
      }
    },
    updateTableFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete
    deleteTableRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteTableSuccess: (state, action) => {
      state.loading = false;
      state.tables = state.tables.filter(
        (t) => t.table_id !== action.payload
      );
    },
    deleteTableFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTablesRequest,
  fetchTablesSuccess,
  fetchTablesFailure,
  createTableRequest,
  createTableSuccess,
  createTableFailure,
  updateTableRequest,
  updateTableSuccess,
  updateTableFailure,
  deleteTableRequest,
  deleteTableSuccess,
  deleteTableFailure,
} = tableSlice.actions;

export default tableSlice.reducer;

