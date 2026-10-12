import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer.js';
import rootSaga from './rootSaga.js';

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure the store with rootReducer and saga middleware
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false, // allows action callbacks (onSuccess, onError)
    }).concat(sagaMiddleware),
});

// Run the root saga
sagaMiddleware.run(rootSaga);

export default store;

