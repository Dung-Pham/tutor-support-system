/**
 * File: utils/constants.ts
 * Purpose: Application-wide constants and enums
 * Usage: Import constants for consistent values across the app
 */

/**
 * Session/Schedule status values
 */
export const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SESSION_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Đã lên lịch',
  in_progress: 'Đang diễn ra',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const SESSION_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

/**
 * Assignment status values
 */
export const ASSIGNMENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
} as const;

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  published: 'Đã xuất bản',
  closed: 'Đã đóng',
};

export const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-800',
};

/**
 * Submission status values
 */
export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  LATE: 'late',
} as const;

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  pending: 'Chưa nộp',
  submitted: 'Đã nộp',
  graded: 'Đã chấm',
  late: 'Nộp trễ',
};

export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  graded: 'bg-green-100 text-green-800',
  late: 'bg-red-100 text-red-800',
};

/**
 * Attendance status values
 */
export const ATTENDANCE_STATUS = {
  PENDING: 'pending',
  CONFIRMED_BY_USER: 'confirmed_by_user',
  CONFIRMED_BY_TUTOR: 'confirmed_by_tutor',
  CONFIRMED: 'confirmed',
  ABSENT: 'absent',
} as const;

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  pending: 'Chưa xác nhận',
  confirmed_by_user: 'Học viên đã xác nhận',
  confirmed_by_tutor: 'Gia sư đã xác nhận',
  confirmed: 'Đã xác nhận',
  absent: 'Vắng mặt',
};

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed_by_user: 'bg-blue-100 text-blue-800',
  confirmed_by_tutor: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
};

/**
 * User roles
 */
export const USER_ROLES = {
  USER: 'USER',
  TUTOR: 'TUTOR',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  USER: 'Học viên/Phụ huynh',
  TUTOR: 'Gia sư',
};

/**
 * Material types
 */
export const MATERIAL_TYPES = {
  PDF: 'pdf',
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  OTHER: 'other',
} as const;

export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  image: 'Hình ảnh',
  document: 'Tài liệu',
  video: 'Video',
  other: 'Khác',
};

/**
 * Calendar view types
 */
export const CALENDAR_VIEW_TYPES = {
  WEEK: 'week',
  MONTH: 'month',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  SHORT: 'short',
  LONG: 'long',
  TIME: 'time',
  DATETIME: 'datetime',
} as const;

/**
 * API response messages
 */
export const API_MESSAGES = {
  SUCCESS: 'Thao tác thành công',
  ERROR: 'Có lỗi xảy ra. Vui lòng thử lại.',
  NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
  UNAUTHORIZED: 'Bạn cần đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
} as const;

/**
 * Toast durations (milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;
