/**
 * File: services/materialsService.ts
 * Purpose: API service for Learning Materials operations
 * API Endpoints: Based on backend /api/materials (to be implemented)
 * Usage: Import and call methods from components/Redux thunks
 */

import { apiClient } from './api';
import type {
  Material,
  UploadMaterialDTO,
  MaterialsListResponse,
  MaterialDetailResponse,
} from '../types/material';

/**
 * Get materials with optional filters
 * @param params - Query parameters (classId, sessionId, uploadedBy)
 */
export const getMaterials = async (params?: {
  classId?: string;
  sessionId?: string;
  uploadedBy?: string;
}): Promise<MaterialsListResponse> => {
  const response = await apiClient.get<MaterialsListResponse>('/materials', { params });
  return response.data;
};

/**
 * Get material detail by ID
 * @param materialId - Material UUID
 */
export const getMaterialById = async (materialId: string): Promise<MaterialDetailResponse> => {
  const response = await apiClient.get<MaterialDetailResponse>(`/materials/${materialId}`);
  return response.data;
};

/**
 * Upload material (Tutor only)
 * @param data - Material upload data with file
 */
export const uploadMaterial = async (data: UploadMaterialDTO): Promise<MaterialDetailResponse> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.class_id) formData.append('class_id', data.class_id);
  if (data.session_id) formData.append('session_id', data.session_id);

  const response = await apiClient.post<MaterialDetailResponse>('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete material (Tutor only)
 * @param materialId - Material UUID
 */
export const deleteMaterial = async (materialId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/materials/${materialId}`);
  return response.data;
};

/**
 * Download material
 * @param materialId - Material UUID
 * @returns Download URL
 */
export const downloadMaterial = async (materialId: string): Promise<string> => {
  const response = await apiClient.get<{ download_url: string }>(`/materials/${materialId}/download`);
  return response.data.download_url;
};
