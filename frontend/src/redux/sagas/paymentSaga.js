import { call, put, takeLatest } from 'redux-saga/effects';
import paymentApi from '../../api/paymentApi.js';
import {
  fetchPaymentsRequest,
  fetchPaymentsSuccess,
  fetchPaymentsFailure,
} from '../slices/paymentSlice.js';

function* handleFetchPayments(action) {
  try {
    const params = action.payload?.params;
    const res = yield call(paymentApi.getAll, params);
    if (res.success) {
      yield put(fetchPaymentsSuccess(res.data));
      if (action.payload?.onSuccess) action.payload.onSuccess(res.data);
    }
  } catch (err) {
    yield put(fetchPaymentsFailure(err.message));
    if (action.payload?.onError) action.payload.onError(err.message);
  }
}

export default function* paymentSaga() {
  yield takeLatest(fetchPaymentsRequest.type, handleFetchPayments);
}

