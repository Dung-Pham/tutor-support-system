/**
 * File: App.tsx
 * Mục đích: Root component của application
 * Vai trò:
 *   - Setup các providers (Redux, React Query, Router)
 *   - Định nghĩa routing structure
 * Lưu ý:
 *   - Thứ tự providers: Redux → React Query → Router
 *   - React Query config: refetchOnWindowFocus = false, retry = 1
 *   - Cần cài đặt dependencies trước: react-router-dom, @tanstack/react-query, react-redux
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Teaching Support Module Pages
import SchedulePage from './pages/SchedulePage';
import MyClassesPage from './pages/MyClassesPage';
import SessionDetailPage from './pages/SessionDetailPage';
import AssignmentsPage from './pages/AssignmentsPage';
import SubmitAssignmentPage from './pages/SubmitAssignmentPage';
import SubmissionsPage from './pages/SubmissionsPage';
import DocumentsPage from './pages/DocumentsPage';

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
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Teaching Support Module Routes - Protected */}
            <Route path="/schedule" element={<ProtectedRoute><MainLayout><SchedulePage /></MainLayout></ProtectedRoute>} />
            <Route path="/my-classes" element={<ProtectedRoute><MainLayout><MyClassesPage /></MainLayout></ProtectedRoute>} />
            <Route path="/sessions/:sessionId" element={<ProtectedRoute><MainLayout><SessionDetailPage /></MainLayout></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute><MainLayout><AssignmentsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/assignments/:assignmentId/submit" element={<ProtectedRoute><MainLayout><SubmitAssignmentPage /></MainLayout></ProtectedRoute>} />
            <Route path="/assignments/:assignmentId/submissions" element={<ProtectedRoute role="TUTOR"><MainLayout><SubmissionsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><MainLayout><DocumentsPage /></MainLayout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
