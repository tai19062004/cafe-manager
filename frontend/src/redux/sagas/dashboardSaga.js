import { call, put, takeLatest } from 'redux-saga/effects';
import dashboardApi from '../../api/dashboardApi.js';
import {
  fetchDashboardStatsRequest,
  fetchDashboardStatsSuccess,
  fetchDashboardStatsFailure,
} from '../slices/dashboardSlice.js';

function* handleFetchDashboardStats(action) {
  try {
    const res = yield call(dashboardApi.getStats);
    if (res.success) {
      yield put(fetchDashboardStatsSuccess(res.data));
      if (action.payload?.onSuccess) {
        action.payload.onSuccess(res.data);
      }
    }
  } catch (err) {
    yield put(fetchDashboardStatsFailure(err.message));
    if (action.payload?.onError) {
      action.payload.onError(err.message);
    }
  }
}

export default function* dashboardSaga() {
  yield takeLatest(fetchDashboardStatsRequest.type, handleFetchDashboardStats);
}

