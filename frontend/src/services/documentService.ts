/**
 * File: services/documentService.ts
 * Mục đích: API service cho Document management
 * Vai trò:
 *   - Xử lý các API calls liên quan đến documents
 *   - Upload file, quản lý permissions, download
 * Lưu ý:
 *   - Sử dụng apiClient đã được config sẵn
 *   - Handle file upload với FormData
 *   - Support cả tutor và student views
 */

import { apiClient } from './api';

export interface Document {
  document_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  status: 'ACTIVE' | 'DELETED';
  created_at: string;
  updated_at?: string;
  shared_count?: number; // For tutor view
  permission_type?: 'VIEW' | 'DOWNLOAD'; // For student view
  granted_date?: string; // For student view
  tutor_name?: string; // For student view
  tutor_email?: string; // For student view
}

export interface DocumentPermission {
  permission_id: string;
  permission_type: 'VIEW' | 'DOWNLOAD';
  granted_date: string;
  status: 'ACTIVE' | 'REVOKED';
  user_id: string;
  name: string;
  email: string;
}

export interface Student {
  user_id: string;
  name: string;
  email: string;
  class_id: string;
  class_name: string;
}

export interface UploadDocumentData {
  title: string;
  description?: string;
  file: File;
}

/**
 * Lấy danh sách documents của user hiện tại
 * - Tutor: Lấy tất cả documents của mình
 * - Student: Lấy documents được share
 */
export const getMyDocuments = async (): Promise<Document[]> => {
  const response = await apiClient.get('/documents/my-documents');
  return response.data.data;
};

/**
 * Upload document mới
 */
export const uploadDocument = async (data: UploadDocumentData): Promise<Document> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description || '');
  formData.append('file', data.file);

  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Lấy chi tiết document theo ID
 */
export const getDocumentById = async (documentId: string): Promise<Document> => {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response.data.data;
};

/**
 * Cập nhật thông tin document
 */
export const updateDocument = async (
  documentId: string,
  data: { title: string; description?: string }
): Promise<Document> => {
  const response = await apiClient.put(`/documents/${documentId}`, data);
  return response.data.data;
};

/**
 * Xóa document (soft delete)
 */
export const deleteDocument = async (documentId: string): Promise<boolean> => {
  const response = await apiClient.delete(`/documents/${documentId}`);
  return response.data.success;
};

/**
 * Download document
 */
export const downloadDocument = async (documentId: string): Promise<Blob> => {
  const response = await apiClient.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Lấy danh sách permissions của document
 */
export const getDocumentPermissions = async (documentId: string): Promise<DocumentPermission[]> => {
  const response = await apiClient.get(`/documents/${documentId}/permissions`);
  return response.data.data;
};

/**
 * Lấy danh sách học sinh của tutor
 */
export const getTutorStudents = async (): Promise<Student[]> => {
  const response = await apiClient.get('/documents/students');
  return response.data.data;
};

/**
 * Cấp quyền cho học sinh
 */
export const grantDocumentPermission = async (
  documentId: string,
  studentId: string,
  permissionType: 'VIEW' | 'DOWNLOAD'
): Promise<DocumentPermission> => {
  const response = await apiClient.post(`/documents/${documentId}/permissions`, {
    studentId,
    permissionType,
  });
  return response.data.data;
};

/**
 * Thu hồi quyền của học sinh
 */
export const revokeDocumentPermission = async (
  documentId: string,
  studentId: string
): Promise<boolean> => {
  const response = await apiClient.delete(`/documents/${documentId}/permissions/${studentId}`);
  return response.data.success;
};