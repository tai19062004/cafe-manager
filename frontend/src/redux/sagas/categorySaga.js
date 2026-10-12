import { call, put, takeLatest } from 'redux-saga/effects';
import categoryApi from '../../api/categoryApi.js';
import {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
  updateCategoryRequest,
  updateCategorySuccess,
  updateCategoryFailure,
  deleteCategoryRequest,
  deleteCategorySuccess,
  deleteCategoryFailure,
} from '../slices/categorySlice.js';

function* handleFetchCategories(action) {
  try {
    const res = yield call(categoryApi.getAll);
    if (res.success) {
      yield put(fetchCategoriesSuccess(res.data));
      if (action.payload?.onSuccess) action.payload.onSuccess(res.data);
    }
  } catch (err) {
    yield put(fetchCategoriesFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleCreateCategory(action) {
  try {
    const { data, onSuccess, onError } = action.payload;
    const res = yield call(categoryApi.create, data);
    if (res.success) {
      yield put(createCategorySuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(createCategoryFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleUpdateCategory(action) {
  try {
    const { id, data, onSuccess, onError } = action.payload;
    const res = yield call(categoryApi.update, id, data);
    if (res.success) {
      yield put(updateCategorySuccess(res.data));
      if (onSuccess) onSuccess(res.data);
    }
  } catch (err) {
    yield put(updateCategoryFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

function* handleDeleteCategory(action) {
  try {
    const { id, onSuccess, onError } = action.payload;
    const res = yield call(categoryApi.delete, id);
    if (res.success) {
      yield put(deleteCategorySuccess(id));
      if (onSuccess) onSuccess(id);
    }
  } catch (err) {
    yield put(deleteCategoryFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

export default function* categorySaga() {
  yield takeLatest(fetchCategoriesRequest.type, handleFetchCategories);
  yield takeLatest(createCategoryRequest.type, handleCreateCategory);
  yield takeLatest(updateCategoryRequest.type, handleUpdateCategory);
  yield takeLatest(deleteCategoryRequest.type, handleDeleteCategory);
}

