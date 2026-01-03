import { configureStore, ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
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
// quynh slices - Student/Tutor Management
import tutorReducer from './slices/tutorSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import classesReducer from './slices/classesSlice';
import dataReducer from './slices/dataSlice';
import studentReducer from './slices/studentSlice';

// Store
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
    // Student/Tutor Management (quynh)
    tutor: tutorReducer,
    ui: uiReducer,
    notification: notificationReducer,
    classes: classesReducer,
    data: dataReducer,
    student: studentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: import.meta.env.DEV,
});

// Export types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// Export custom hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
