import { combineReducers } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice.js';
import categoryReducer from './slices/categorySlice.js';
import productReducer from './slices/productSlice.js';
import customerReducer from './slices/customerSlice.js';
import employeeReducer from './slices/employeeSlice.js';
import tableReducer from './slices/tableSlice.js';
import orderReducer from './slices/orderSlice.js';
import paymentReducer from './slices/paymentSlice.js';

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  category: categoryReducer,
  product: productReducer,
  customer: customerReducer,
  employee: employeeReducer,
  table: tableReducer,
  order: orderReducer,
  payment: paymentReducer,
});

export default rootReducer;

