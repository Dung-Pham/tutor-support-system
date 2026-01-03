import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { setCredentials } from './store/slices/authSlice';
import socketService from './services/socketService';

// Routes - Social + Teaching Module
import { AppRoutes } from './routes';

// Component to check auth on app start and connect socket (merged from dang and quynh)
function AuthInitializer() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

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

  // Connect socket when user is authenticated (from quynh)
  useEffect(() => {
    if (!isAuthenticated || !user?.user_id) {
      return;
    }

    console.log('User authenticated, connecting socket...');
    const token = localStorage.getItem('token') || '';
    
    socketService.connect(token)
      .then(() => {
        const socket = socketService.getSocket();
        if (socket) {
          socket.emit('authenticate', user.user_id);
          console.log('Socket authenticated for user:', user.user_id);
        }
      })
      .catch((error) => {
        console.error('Error connecting socket:', error);
      });
  }, [isAuthenticated, user?.user_id]);

  return null;
}

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
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
};

export default App;
