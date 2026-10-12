import { call, put, takeLatest } from 'redux-saga/effects';
import tableApi from '../../api/tableApi.js';
import {
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
} from '../slices/tableSlice.js';

function* handleFetchTables(action) {
  try {
    const params = action.payload?.params;
    const res = yield call(tableApi.getAll, params);
    if (res.success) {
      yield put(fetchTablesSuccess(res.data));
      if (action.payload?.onSuccess) action.payload.onSuccess(res.data);
    }
  } catch (err) {
    yield put(fetchTablesFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleCreateTable(action) {
  try {
    const { data, onSuccess, onError } = action.payload;
    const res = yield call(tableApi.create, data);
    if (res.success) {
      yield put(createTableSuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(createTableFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleUpdateTable(action) {
  try {
    const { id, data, onSuccess, onError } = action.payload;
    const res = yield call(tableApi.update, id, data);
    if (res.success) {
      yield put(updateTableSuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(updateTableFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleDeleteTable(action) {
  try {
    const { id, onSuccess, onError } = action.payload;
    const res = yield call(tableApi.delete, id);
    if (res.success) {
      yield put(deleteTableSuccess(id));
      if (onSuccess) onSuccess(id);
    }
  } catch (err) {
    yield put(deleteTableFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

export default function* tableSaga() {
  yield takeLatest(fetchTablesRequest.type, handleFetchTables);
  yield takeLatest(createTableRequest.type, handleCreateTable);
  yield takeLatest(updateTableRequest.type, handleUpdateTable);
  yield takeLatest(deleteTableRequest.type, handleDeleteTable);
}

