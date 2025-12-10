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

import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { setCredentials } from './store/slices/authSlice';

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
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
