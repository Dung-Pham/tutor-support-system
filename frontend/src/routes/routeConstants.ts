/**
 * File: routes/routeConstants.ts
 * Mục đích: Định nghĩa constants cho routes của hệ thống Student-Tutor
 * Vai trò:
 *   - Tránh hardcode paths trong components
 *   - Dễ maintain và refactor
 *   - Type safety cho route params
 *   - Organize routes theo Student và Tutor roles
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Auth routes
  REGISTER_STUDENT: '/register/student',
  REGISTER_TUTOR: '/register/tutor',
  UNAUTHORIZED: '/unauthorized',

  // Student routes
  STUDENT: {
    HOME: '/student/',
    PROFILE: '/student/profile',
    CLASSES: '/student/classes',
    TUTORS: '/student/tutors',
    CHAT: '/student/chat',
    SCHEDULE: '/student/schedule',
    PAYMENTS: '/student/payments',
  },

  // Tutor routes
  TUTOR: {
    HOME: '/tutor/',
    PROFILE: '/tutor/profile',
    STUDENTS: '/tutor/students',
    CLASSES: '/tutor/classes',
    CHAT: '/tutor/chat',
    SCHEDULE: '/tutor/schedule',
    EARNINGS: '/tutor/earnings',
  },
} as const;

/**
 * Helper function để lấy base route theo role
 */
export const getBaseRouteByRole = (role: string): string => {
  switch (role) {
    case 'student':
      return ROUTES.STUDENT.HOME;
    case 'tutor':
      return ROUTES.TUTOR.HOME;
    default:
      return ROUTES.HOME;
  }
};

// Helper functions để generate dynamic routes
export const generateRoute = {
  // TODO: Thêm helpers khi có dynamic routes
  // classDetail: (id: string) => `/classes/${id}`,
  // tutorDetail: (id: string) => `/tutors/${id}`,
  // chatRoom: (roomId: string) => `/chat/${roomId}`,
};
