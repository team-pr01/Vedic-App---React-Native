// src/redux/store.ts

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your reducers
import themeReducer from './features/Theme/themeSlice';
import authReducer from './features/Auth/authSlice';
import languageReducer from './features/Language/languageSlice';
import { baseApi } from './api/baseApi'; // Assuming this is your RTK Query base API

// 1. Create the persistConfig
const persistConfig = {
  key: 'root', // The key for the root of your state in AsyncStorage
  storage: AsyncStorage,
  whitelist: ['auth'], // <-- IMPORTANT: Only the 'auth' slice will be persisted.
  // We don't want to persist the API state.
};

// 2. Combine your reducers
const rootReducer = combineReducers({
  auth: authReducer,
  language: languageReducer,
  theme: themeReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

// 3. Create the persisted reducer by wrapping the root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer, // <-- Use the persistedReducer here
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // This is to ignore the non-serializable actions from redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

// 5. Create the persistor
export const persistor = persistStore(store);

// Define your RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
