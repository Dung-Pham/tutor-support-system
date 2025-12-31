/**
 * File: utils/dateHelper.ts
 * Purpose: Date formatting and manipulation utilities
 * Usage: Import functions for date display, week calculation, etc.
 */

/**
 * Format ISO date string to readable format
 * @param isoDate - ISO 8601 date string
 * @param format - 'short' | 'long' | 'time' | 'datetime'
 * @returns Formatted date string
 */
export const formatDate = (isoDate: string, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string => {
  const date = new Date(isoDate);
  
  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
    case 'long':
      return new Intl.DateTimeFormat('vi-VN', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    case 'time':
      return new Intl.DateTimeFormat('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(date);
    case 'datetime':
      return new Intl.DateTimeFormat('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(date);
    default:
      return date.toLocaleDateString('vi-VN');
  }
};

/**
 * Get start and end dates of current week (Monday to Sunday)
 * @param referenceDate - Optional reference date, defaults to today
 * @returns { startDate: string, endDate: string } in YYYY-MM-DD format
 */
export const getWeekRange = (referenceDate?: Date): { startDate: string; endDate: string } => {
  const date = referenceDate || new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  
  const monday = new Date(date.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0],
  };
};

/**
 * Get start and end dates of current month
 * @param referenceDate - Optional reference date, defaults to today
 * @returns { startDate: string, endDate: string } in YYYY-MM-DD format
 */
export const getMonthRange = (referenceDate?: Date): { startDate: string; endDate: string } => {
  const date = referenceDate || new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  return {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0],
  };
};

/**
 * Check if a date is today
 * @param isoDate - ISO 8601 date string
 * @returns true if date is today
 */
export const isToday = (isoDate: string): boolean => {
  const date = new Date(isoDate);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the past
 * @param isoDate - ISO 8601 date string
 * @returns true if date is before today
 */
export const isPast = (isoDate: string): boolean => {
  const date = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Get relative time string (e.g., "2 giờ trước", "3 ngày sau")
 * @param isoDate - ISO 8601 date string
 * @returns Relative time string
 */
export const getRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `sau ${diffMins} phút` : `${Math.abs(diffMins)} phút trước`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `sau ${diffHours} giờ` : `${Math.abs(diffHours)} giờ trước`;
  } else {
    return diffDays > 0 ? `sau ${diffDays} ngày` : `${Math.abs(diffDays)} ngày trước`;
  }
};

/**
 * Convert ISO date to input[type="datetime-local"] value
 * @param isoDate - ISO 8601 date string
 * @returns datetime-local format string (YYYY-MM-DDTHH:mm)
 */
export const toDatetimeLocal = (isoDate: string): string => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Convert datetime-local input value to ISO string
 * @param datetimeLocal - datetime-local format string (YYYY-MM-DDTHH:mm)
 * @returns ISO 8601 date string
 */
export const fromDatetimeLocal = (datetimeLocal: string): string => {
  return new Date(datetimeLocal).toISOString();
};
