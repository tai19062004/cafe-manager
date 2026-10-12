import { call, put, takeLatest } from 'redux-saga/effects';
import productApi from '../../api/productApi.js';
import {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  createProductRequest,
  createProductSuccess,
  createProductFailure,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailure,
  deleteProductRequest,
  deleteProductSuccess,
  deleteProductFailure,
} from '../slices/productSlice.js';

function* handleFetchProducts(action) {
  try {
    const params = action.payload?.params;
    const res = yield call(productApi.getAll, params);
    if (res.success) {
      yield put(fetchProductsSuccess(res.data));
      if (action.payload?.onSuccess) action.payload.onSuccess(res.data);
    }
  } catch (err) {
    yield put(fetchProductsFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleCreateProduct(action) {
  try {
    const { data, onSuccess, onError } = action.payload;
    const res = yield call(productApi.create, data);
    if (res.success) {
      yield put(createProductSuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(createProductFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleUpdateProduct(action) {
  try {
    const { id, data, onSuccess, onError } = action.payload;
    const res = yield call(productApi.update, id, data);
    if (res.success) {
      yield put(updateProductSuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(updateProductFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleDeleteProduct(action) {
  try {
    const { id, onSuccess, onError } = action.payload;
    const res = yield call(productApi.delete, id);
    if (res.success) {
      yield put(deleteProductSuccess(id));
      if (onSuccess) onSuccess(id);
    }
  } catch (err) {
    yield put(deleteProductFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

export default function* productSaga() {
  yield takeLatest(fetchProductsRequest.type, handleFetchProducts);
  yield takeLatest(createProductRequest.type, handleCreateProduct);
  yield takeLatest(updateProductRequest.type, handleUpdateProduct);
  yield takeLatest(deleteProductRequest.type, handleDeleteProduct);
}

