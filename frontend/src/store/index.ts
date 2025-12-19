import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './slices/authSlice';
import messagesReducer from './slices/messagesSlice';
import postReducer from './slices/postSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messagesReducer,
    posts: postReducer,
  },
});

// Export types để sử dụng trong components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export custom hook
export const useAppDispatch = () => useDispatch<AppDispatch>();
