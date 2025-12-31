import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './slices/authSlice';
import messagesReducer from './slices/messagesSlice';
import postReducer from './slices/postSlice';
import commentReducer from './slices/commentSlice';
import sessionsReducer from './slices/sessionsSlice';
import assignmentsReducer from './slices/assignmentsSlice';
import submissionsReducer from './slices/submissionsSlice';
import documentsReducer from './slices/documentsSlice';
import newHomeworkReducer from './slices/newHomeworkSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messagesReducer,
    posts: postReducer,
    comments: commentReducer,
    sessions: sessionsReducer,
    assignments: assignmentsReducer,
    submissions: submissionsReducer,
    documents: documentsReducer,
    newHomework: newHomeworkReducer,
  },
});

// Export types để sử dụng trong components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export custom hook
export const useAppDispatch = () => useDispatch<AppDispatch>();
