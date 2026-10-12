import { all, fork } from 'redux-saga/effects';
import dashboardSaga from './sagas/dashboardSaga.js';
import categorySaga from './sagas/categorySaga.js';
import productSaga from './sagas/productSaga.js';
import customerSaga from './sagas/customerSaga.js';
import employeeSaga from './sagas/employeeSaga.js';
import tableSaga from './sagas/tableSaga.js';
import orderSaga from './sagas/orderSaga.js';
import paymentSaga from './sagas/paymentSaga.js';

export default function* rootSaga() {
  yield all([
    fork(dashboardSaga),
    fork(categorySaga),
    fork(productSaga),
    fork(customerSaga),
    fork(employeeSaga),
    fork(tableSaga),
    fork(orderSaga),
    fork(paymentSaga),
  ]);
}

