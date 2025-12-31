import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { setCredentials } from './store/slices/authSlice';

// Teaching Support Module Pages (from Dung)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import SchedulePage from './pages/SchedulePage';
import MyClassesPage from './pages/MyClassesPage';
import { ClassDetailPage } from './pages/ClassDetailPage';
import SessionDetailPage from './pages/SessionDetailPage';
import AssignmentsPage from './pages/AssignmentsPage';
import SubmitAssignmentPage from './pages/SubmitAssignmentPage';
import SubmissionsPage from './pages/SubmissionsPage';
import DocumentsPage from './pages/DocumentsPage';
import StudentHomeworkPage from './pages/StudentHomeworkPage';
import TutorHomeworkPage from './pages/TutorHomeworkPage';
import HomeworkDetailPage from './pages/HomeworkDetailPage';
import StudentHomeworkDetailPage from './pages/StudentHomeworkDetailPage';
import StudentsPage from './pages/StudentsPage';
import StatisticsDashboard from './pages/StatisticsDashboard';

// Component để check auth khi app start
function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setCredentials({ user, token }));
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return null;
}

// Cấu hình React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không refetch khi focus window
      retry: 1, // Chỉ retry 1 lần khi fail
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <QueryClientProvider client={queryClient}>
        <Toaster richColors />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {/* Dang's Routes (Social features) */}
          <AppRoutes />

          {/* Dung's Routes (Teaching module) - inline for now */}
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Teaching Support Module Routes - Protected */}
            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SchedulePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-classes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyClassesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/class-detail/:classId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ClassDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions/:sessionId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SessionDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Homework Routes - Role-based */}
            <Route
              path="/homework/student"
              element={
                <ProtectedRoute role="student">
                  <MainLayout>
                    <StudentHomeworkPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/homework/student/:assignmentId"
              element={
                <ProtectedRoute role="student">
                  <MainLayout>
                    <StudentHomeworkDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/homework/tutor"
              element={
                <ProtectedRoute role="tutor">
                  <MainLayout>
                    <TutorHomeworkPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/homework/tutor/:homeworkId"
              element={
                <ProtectedRoute role="tutor">
                  <MainLayout>
                    <HomeworkDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* My Homework Routes - Alias routes for both roles */}
            <Route
              path="/my-homework"
              element={
                <ProtectedRoute role="tutor">
                  <MainLayout>
                    <TutorHomeworkPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-homework/:homeworkId"
              element={
                <ProtectedRoute role="tutor">
                  <MainLayout>
                    <HomeworkDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-homework/:assignmentId"
              element={
                <ProtectedRoute role="student">
                  <MainLayout>
                    <StudentHomeworkDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Legacy assignment routes - kept for compatibility */}
            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AssignmentsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/:assignmentId/submit"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SubmitAssignmentPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/:assignmentId/submissions"
              element={
                <ProtectedRoute role="tutor">
                  <MainLayout>
                    <SubmissionsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DocumentsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute role="tutor">
                  <MainLayout>
                    <StudentsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute role="tutor">
                  <MainLayout>
                    <StatisticsDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
