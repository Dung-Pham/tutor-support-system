/**
 * File: utils/constants.ts
 * Purpose: Application-wide constants and enums
 * Usage: Import constants for consistent values across the app
 */

/**
 * Schedule status values (for is_active flag)
 */
export const SCHEDULE_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

export const SCHEDULE_STATUS_LABELS: Record<string, string> = {
  true: 'Đang hoạt động',
  false: 'Tạm dừng',
};

export const SCHEDULE_STATUS_COLORS: Record<string, string> = {
  true: 'bg-green-100 text-green-800',
  false: 'bg-gray-100 text-gray-800',
};

/**
 * Session/Class status values
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
 * Day of week labels
 */
export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ hai',
  2: 'Thứ ba',
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy',
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
 * Attendance status values (overall_status)
 * Matches tutorsupportdb_merged-v2.sql schema
 */
export const ATTENDANCE_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ABSENT: 'ABSENT',
  CANCELLED: 'CANCELLED',
} as const;

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  ABSENT: 'Vắng mặt',
  CANCELLED: 'Đã hủy',
};

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

/**
 * User roles
 */
export const USER_ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  student: 'Học viên',
  tutor: 'Gia sư',
  admin: 'Quản trị viên',
};

/**
 * Day of week constants
 */
export const DAY_OF_WEEK = {
  SUNDAY: { value: 0 as const, label: 'Chủ nhật', shortLabel: 'CN' },
  MONDAY: { value: 1 as const, label: 'Thứ hai', shortLabel: 'T2' },
  TUESDAY: { value: 2 as const, label: 'Thứ ba', shortLabel: 'T3' },
  WEDNESDAY: { value: 3 as const, label: 'Thứ tư', shortLabel: 'T4' },
  THURSDAY: { value: 4 as const, label: 'Thứ năm', shortLabel: 'T5' },
  FRIDAY: { value: 5 as const, label: 'Thứ sáu', shortLabel: 'T6' },
  SATURDAY: { value: 6 as const, label: 'Thứ bảy', shortLabel: 'T7' },
} as const;

export const DAY_NAMES = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
export const DAY_SHORT_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

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
