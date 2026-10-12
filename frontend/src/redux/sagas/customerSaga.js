import { call, put, takeLatest } from 'redux-saga/effects';
import customerApi from '../../api/customerApi.js';
import {
  fetchCustomersRequest,
  fetchCustomersSuccess,
  fetchCustomersFailure,
  createCustomerRequest,
  createCustomerSuccess,
  createCustomerFailure,
  updateCustomerRequest,
  updateCustomerSuccess,
  updateCustomerFailure,
  deleteCustomerRequest,
  deleteCustomerSuccess,
  deleteCustomerFailure,
} from '../slices/customerSlice.js';

function* handleFetchCustomers(action) {
  try {
    const params = action.payload?.params;
    const res = yield call(customerApi.getAll, params);
    if (res.success) {
      yield put(fetchCustomersSuccess(res.data));
      if (action.payload?.onSuccess) action.payload.onSuccess(res.data);
    }
  } catch (err) {
    yield put(fetchCustomersFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleCreateCustomer(action) {
  try {
    const { data, onSuccess, onError } = action.payload;
    const res = yield call(customerApi.create, data);
    if (res.success) {
      yield put(createCustomerSuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(createCustomerFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleUpdateCustomer(action) {
  try {
    const { id, data, onSuccess, onError } = action.payload;
    const res = yield call(customerApi.update, id, data);
    if (res.success) {
      yield put(updateCustomerSuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(updateCustomerFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleDeleteCustomer(action) {
  try {
    const { id, onSuccess, onError } = action.payload;
    const res = yield call(customerApi.delete, id);
    if (res.success) {
      yield put(deleteCustomerSuccess(id));
      if (onSuccess) onSuccess(id);
    }
  } catch (err) {
    yield put(deleteCustomerFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

export default function* customerSaga() {
  yield takeLatest(fetchCustomersRequest.type, handleFetchCustomers);
  yield takeLatest(createCustomerRequest.type, handleCreateCustomer);
  yield takeLatest(updateCustomerRequest.type, handleUpdateCustomer);
  yield takeLatest(deleteCustomerRequest.type, handleDeleteCustomer);
}

