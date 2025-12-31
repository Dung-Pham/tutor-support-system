/**
 * File: types/material.ts
 * Purpose: Type definitions for Learning Materials domain
 * API Alignment: Matches backend /api/materials endpoints (to be created)
 */

export type MaterialType = 'pdf' | 'image' | 'document' | 'video' | 'other';

export interface Material {
  material_id: string; // UUID
  class_id?: string;
  session_id?: string;
  uploaded_by: string; // User ID (tutor)
  uploader_name?: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size: number; // Bytes
  file_type: MaterialType;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

export interface UploadMaterialDTO {
  class_id?: string;
  session_id?: string;
  title: string;
  description?: string;
  file: File;
}

export interface MaterialsListResponse {
  success: boolean;
  data: Material[];
  count?: number;
}

export interface MaterialDetailResponse {
  success: boolean;
  data: Material;
}
