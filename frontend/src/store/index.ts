import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './slices/authSlice';
// HEAD slices - Teaching Module
import sessionsReducer from './slices/sessionsSlice';
import assignmentsReducer from './slices/assignmentsSlice';
import submissionsReducer from './slices/submissionsSlice';
import documentsReducer from './slices/documentsSlice';
import newHomeworkReducer from './slices/newHomeworkSlice';
// dang slices - Social Module
import messagesReducer from './slices/messagesSlice';
import postReducer from './slices/postSlice';
import commentReducer from './slices/commentSlice';

export const store = configureStore({
  reducer: {
    // Auth - shared
    auth: authReducer,
    // Teaching Module (HEAD)
    sessions: sessionsReducer,
    assignments: assignmentsReducer,
    submissions: submissionsReducer,
    documents: documentsReducer,
    newHomework: newHomeworkReducer,
    // Social Module (dang)
    messages: messagesReducer,
    posts: postReducer,
    comments: commentReducer,
  },
});

// Export types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export custom hook
export const useAppDispatch = () => useDispatch<AppDispatch>();
