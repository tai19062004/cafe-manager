import { call, put, takeLatest } from 'redux-saga/effects';
import employeeApi from '../../api/employeeApi.js';
import {
  fetchEmployeesRequest,
  fetchEmployeesSuccess,
  fetchEmployeesFailure,
  createEmployeeRequest,
  createEmployeeSuccess,
  createEmployeeFailure,
  updateEmployeeRequest,
  updateEmployeeSuccess,
  updateEmployeeFailure,
  deleteEmployeeRequest,
  deleteEmployeeSuccess,
  deleteEmployeeFailure,
} from '../slices/employeeSlice.js';

function* handleFetchEmployees(action) {
  try {
    const params = action.payload?.params;
    const res = yield call(employeeApi.getAll, params);
    if (res.success) {
      yield put(fetchEmployeesSuccess(res.data));
      if (action.payload?.onSuccess) action.payload.onSuccess(res.data);
    }
  } catch (err) {
    yield put(fetchEmployeesFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleCreateEmployee(action) {
  try {
    const { data, onSuccess, onError } = action.payload;
    const res = yield call(employeeApi.create, data);
    if (res.success) {
      yield put(createEmployeeSuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(createEmployeeFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleUpdateEmployee(action) {
  try {
    const { id, data, onSuccess, onError } = action.payload;
    const res = yield call(employeeApi.update, id, data);
    if (res.success) {
      yield put(updateEmployeeSuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(updateEmployeeFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleDeleteEmployee(action) {
  try {
    const { id, onSuccess, onError } = action.payload;
    const res = yield call(employeeApi.delete, id);
    if (res.success) {
      yield put(deleteEmployeeSuccess(id));
      if (onSuccess) onSuccess(id);
    }
  } catch (err) {
    yield put(deleteEmployeeFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

export default function* employeeSaga() {
  yield takeLatest(fetchEmployeesRequest.type, handleFetchEmployees);
  yield takeLatest(createEmployeeRequest.type, handleCreateEmployee);
  yield takeLatest(updateEmployeeRequest.type, handleUpdateEmployee);
  yield takeLatest(deleteEmployeeRequest.type, handleDeleteEmployee);
}

