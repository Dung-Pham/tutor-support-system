import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosProgressEvent } from 'axios';

// Vite environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Type for API response
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: isProduction ? 15000 : 10000,
});

// Flag to prevent refresh token loop
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - Add token to header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }

    if (isDevelopment) {
      console.log('API Request: ' + config.method?.toUpperCase() + ' ' + config.url);
    }

    return config;
  },
  (error) => {
    if (isDevelopment) console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and auto-refresh
apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('API Response: ' + response.config.method?.toUpperCase() + ' ' + response.config.url);
    }
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest: any = error.config;

    // If 401 (Unauthorized) and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          API_URL + '/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;
        localStorage.setItem('token', newAccessToken);

        // Update header and retry original request
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed -> redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        processQueue(refreshError, null);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    if (isDevelopment) {
      console.error('API Error:', {
        status: error.response?.status,
        message: errorMessage,
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  status?: number;
  data?: any;
  response?: { data: { message: string } };

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.response = { data: { message } };
  }
}

// Generic API service class
class ApiService {
  client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async request<T = any>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>({
        url: endpoint,
        ...options,
      });

      const responseData = response.data;
      if (responseData && 'data' in responseData && responseData.data !== undefined) {
        return responseData.data as T;
      }
      return responseData as T;
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data as ApiResponse;
        throw new ApiError(
          errorData?.message || 'API request failed',
          error.response.status,
          errorData
        );
      } else if (error.request) {
        throw new ApiError('Network error occurred', 0, null);
      } else {
        throw new ApiError(error.message || 'Unknown error', 0, null);
      }
    }
  }

  get<T = any>(endpoint: string, params: Record<string, any> = {}) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T = any>(endpoint: string, data: any = {}) {
    return this.request<T>(endpoint, { method: 'POST', data });
  }

  put<T = any>(endpoint: string, data: any = {}) {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }

  patch<T = any>(endpoint: string, data: any = {}) {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }

  delete<T = any>(endpoint: string, data: any = {}) {
    return this.request<T>(endpoint, { method: 'DELETE', data });
  }

  upload<T = any>(
    endpoint: string,
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  }
}

const apiService = new ApiService(apiClient);
export { apiService };

// LOCATION API
export const locationAPI = {
  getProvinces: () => apiService.get('/locations/provinces'),
  getDistricts: (provinceId: string) => apiService.get('/locations/districts/' + provinceId),
  getWards: (districtId: string) => apiService.get('/locations/wards/' + districtId),
  getAllWards: () => apiService.get('/locations/wards'),
  searchLocations: (query: string) => apiService.get('/locations/search', { q: query }),
};

// SUBJECTS API
export const subjectsAPI = {
  getSubjects: () => apiService.get('/subjects'),
};

// AUTH API
export const authAPI = {
  login: (data: { email: string; password: string }) => apiService.post('/auth/login', data),
  getProfile: () => apiService.get('/auth/profile'),
  register: (userData: Record<string, any>) => apiService.post('/auth/register', userData),
  logout: () => apiService.post('/auth/logout'),
  refreshToken: () => apiService.post('/auth/refresh'),
  getCurrentUser: () => apiService.get('/auth/profile'),
  verifyToken: (token?: string) =>
    apiService.get('/auth/verify', {
      headers: { Authorization: 'Bearer ' + (token || localStorage.getItem('token')) },
    }),
  updatePassword: (passwordData: { oldPassword?: string; newPassword: string }) =>
    apiService.put('/auth/password', passwordData),
};

// APPLICATION API
export const applicationAPI = {
  getMyApplications: (status?: string) => {
    const params = status ? { status } : {};
    return apiService.get('/applications', params);
  },
  getApplicationDetail: (application_id: string) =>
    apiService.get('/applications/' + application_id),
  withdrawApplication: (application_id: string, withdrawReason?: string | null) =>
    apiService.post('/applications/' + application_id + '/withdraw', {
      withdrawReason: withdrawReason || null,
    }),
  confirmApplication: (
    application_id: string,
    isConfirmed: boolean,
    declineReason?: string | null
  ) =>
    apiService.post('/applications/' + application_id + '/confirm', {
      applicationId: application_id,
      isConfirmed,
      declineReason: declineReason || null,
    }),
};

// SEARCH API
export const searchAPI = {
  searchClasses: (filters: Record<string, unknown>) => apiService.get('/search/classes', filters),
  getClassDetail: (classId: string) => apiService.get('/search/classes/' + classId),
};

// UTILITY FUNCTIONS
export const formatApiError = (error: unknown): string => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unknown error occurred';
};

export const isNetworkError = (error: unknown): boolean =>
  (error instanceof Error && 'status' in error && (error as any).status === 0);

export const isAuthError = (error: unknown): boolean =>
  error instanceof Error && 'status' in error && ((error as any).status === 401 || (error as any).status === 403);

// STUDENT APPLICATIONS API
export const studentApplicationAPI = {
  getApplicationsByClass: (classId: string) =>
    apiService.get('/student/class/' + classId + '/applications'),

  getTutorDetail: async (tutorId: string, classId: string) => {
    if (!tutorId || !classId) {
      throw new Error('Please provide tutor_id and class_id');
    }
    const response = await apiService.post('/student/tutor/' + tutorId + '/detail', {
      class_id: classId,
    });
    return response?.data || response;
  },

  reviewApplication: (
    applicationId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ) =>
    apiService.post('/student/applications/review', {
      application_id: applicationId,
      action,
      rejection_reason: rejectionReason || null,
    }),
};

// NOTIFICATION API
export const notificationsAPI = {
  getUnreadNotifications: (limit: number = 10, offset: number = 0) =>
    apiService.get('/notifications/unread', { limit, offset }),
  getAllNotifications: (page: number = 1, limit: number = 20) =>
    apiService.get('/notifications', { page, limit }),
  getUnreadCount: () => apiService.get('/notifications/count/unread'),
  markAsRead: (notificationId: string) => apiService.put('/notifications/' + notificationId + '/read'),
  markAllAsRead: () => apiService.put('/notifications/read-all'),
  deleteNotification: (notificationId: string) =>
    apiService.delete('/notifications/' + notificationId),
};
