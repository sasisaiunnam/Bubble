import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // ... other reducers can be added here
  },
});

export default store;