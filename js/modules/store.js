import { applyMiddleware, createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './reducer';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['score', 'preferences']
}

const persistedReducer = persistReducer(persistConfig, rootReducer);
const middleware = __DEV__ ? [thunkMiddleware, createLogger()] : [thunkMiddleware]; 

const store = createStore(
  persistedReducer, applyMiddleware(...middleware));

export default store;
export let storeReady = new Promise(resolve => {
  persistStore(store, null, () => {
    resolve(store);
  });
});