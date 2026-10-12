import { call, put, takeLatest } from 'redux-saga/effects';
import orderApi from '../../api/orderApi.js';
import {
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderByIdRequest,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  createOrderRequest,
  createOrderSuccess,
  createOrderFailure,
  updateOrderStatusRequest,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  deleteOrderRequest,
  deleteOrderSuccess,
  deleteOrderFailure,
} from '../slices/orderSlice.js';
import { fetchTablesRequest } from '../slices/tableSlice.js';

function* handleFetchOrders(action) {
  try {
    const params = action.payload?.params;
    const res = yield call(orderApi.getAll, params);
    if (res.success) {
      yield put(fetchOrdersSuccess(res.data));
      if (action.payload?.onSuccess) action.payload.onSuccess(res.data);
    }
  } catch (err) {
    yield put(fetchOrdersFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleFetchOrderById(action) {
  try {
    const { id, onSuccess, onError } = action.payload;
    const res = yield call(orderApi.getById, id);
    if (res.success) {
      yield put(fetchOrderByIdSuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(fetchOrderByIdFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleCreateOrder(action) {
  try {
    const { data, onSuccess, onError } = action.payload;
    const res = yield call(orderApi.create, data);
    if (res.success) {
      yield put(createOrderSuccess(res.data));
      // Re-fetch tables so table status updates to OCCUPIED
      yield put(fetchTablesRequest());
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(createOrderFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleUpdateOrderStatus(action) {
  try {
    const { id, status, onSuccess, onError } = action.payload;
    const res = yield call(orderApi.updateStatus, id, status);
    if (res.success) {
      yield put(updateOrderStatusSuccess({ order_id: id, status }));
      // Re-fetch tables so table status updates back to AVAILABLE
      yield put(fetchTablesRequest());
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(updateOrderStatusFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleDeleteOrder(action) {
  try {
    const { id, onSuccess, onError } = action.payload;
    const res = yield call(orderApi.delete, id);
    if (res.success) {
      yield put(deleteOrderSuccess(id));
      yield put(fetchTablesRequest());
      if (onSuccess) onSuccess(id);
    }
  } catch (err) {
    yield put(deleteOrderFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

export default function* orderSaga() {
  yield takeLatest(fetchOrdersRequest.type, handleFetchOrders);
  yield takeLatest(fetchOrderByIdRequest.type, handleFetchOrderById);
  yield takeLatest(createOrderRequest.type, handleCreateOrder);
  yield takeLatest(updateOrderStatusRequest.type, handleUpdateOrderStatus);
  yield takeLatest(deleteOrderRequest.type, handleDeleteOrder);
}

