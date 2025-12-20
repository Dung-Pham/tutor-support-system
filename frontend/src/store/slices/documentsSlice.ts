/**
 * File: store/slices/documentsSlice.ts
 * Mục đích: Redux slice cho Document management state
 * Vai trò:
 *   - Quản lý state của documents, permissions, upload progress
 *   - Handle async actions cho document operations
 * Lưu ý:
 *   - Sử dụng createAsyncThunk cho API calls
 *   - Separate state cho tutor và student views
 *   - Handle loading, error states
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getMyDocuments,
  uploadDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentPermissions,
  getTutorStudents,
  grantDocumentPermission,
  revokeDocumentPermission,
  Document,
  DocumentPermission,
  Student,
  UploadDocumentData,
} from '../../services/documentService';

interface DocumentsState {
  // Documents list
  documents: Document[];
  currentDocument: Document | null;
  permissions: DocumentPermission[];
  students: Student[];

  // UI states
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;

  // Modals/Dialogs
  showUploadModal: boolean;
  showPermissionsModal: boolean;
  selectedDocumentId: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  currentDocument: null,
  permissions: [],
  students: [],
  loading: false,
  uploading: false,
  uploadProgress: 0,
  error: null,
  showUploadModal: false,
  showPermissionsModal: false,
  selectedDocumentId: null,
};

// Async thunks
export const fetchMyDocuments = createAsyncThunk(
  'documents/fetchMyDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const documents = await getMyDocuments();
      return documents;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách tài liệu');
    }
  }
);

export const uploadDocumentAsync = createAsyncThunk(
  'documents/uploadDocument',
  async (data: UploadDocumentData, { rejectWithValue }) => {
    try {
      const document = await uploadDocument(data);
      return document;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể upload tài liệu');
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchDocumentById',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const document = await getDocumentById(documentId);
      return document;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thông tin tài liệu');
    }
  }
);

export const updateDocumentAsync = createAsyncThunk(
  'documents/updateDocument',
  async (
    { documentId, data }: { documentId: string; data: { title: string; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      const document = await updateDocument(documentId, data);
      return document;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật tài liệu');
    }
  }
);

export const deleteDocumentAsync = createAsyncThunk(
  'documents/deleteDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      await deleteDocument(documentId);
      return documentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa tài liệu');
    }
  }
);

export const downloadDocumentAsync = createAsyncThunk(
  'documents/downloadDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const blob = await downloadDocument(documentId);
      return { documentId, blob };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải xuống tài liệu');
    }
  }
);

export const fetchDocumentPermissions = createAsyncThunk(
  'documents/fetchDocumentPermissions',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const permissions = await getDocumentPermissions(documentId);
      return { documentId, permissions };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách quyền truy cập');
    }
  }
);

export const fetchTutorStudents = createAsyncThunk(
  'documents/fetchTutorStudents',
  async (_, { rejectWithValue }) => {
    try {
      const students = await getTutorStudents();
      return students;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách học sinh');
    }
  }
);

export const grantPermissionAsync = createAsyncThunk(
  'documents/grantPermission',
  async (
    { documentId, studentId, permissionType }: { documentId: string; studentId: string; permissionType: 'VIEW' | 'DOWNLOAD' },
    { rejectWithValue }
  ) => {
    try {
      const permission = await grantDocumentPermission(documentId, studentId, permissionType);
      return permission;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cấp quyền truy cập');
    }
  }
);

export const revokePermissionAsync = createAsyncThunk(
  'documents/revokePermission',
  async (
    { documentId, studentId }: { documentId: string; studentId: string },
    { rejectWithValue }
  ) => {
    try {
      await revokeDocumentPermission(documentId, studentId);
      return { documentId, studentId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thu hồi quyền truy cập');
    }
  }
);

// Slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setShowUploadModal: (state, action: PayloadAction<boolean>) => {
      state.showUploadModal = action.payload;
    },
    setShowPermissionsModal: (state, action: PayloadAction<{ show: boolean; documentId?: string }>) => {
      state.showPermissionsModal = action.payload.show;
      state.selectedDocumentId = action.payload.documentId || null;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch documents
    builder
      .addCase(fetchMyDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchMyDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upload document
      .addCase(uploadDocumentAsync.pending, (state) => {
        state.uploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadDocumentAsync.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 100;
        state.documents.unshift(action.payload); // Add to beginning of list
        state.showUploadModal = false;
      })
      .addCase(uploadDocumentAsync.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })

      // Fetch document by ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update document
      .addCase(updateDocumentAsync.fulfilled, (state, action) => {
        const index = state.documents.findIndex(doc => doc.document_id === action.payload.document_id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.document_id === action.payload.document_id) {
          state.currentDocument = action.payload;
        }
      })

      // Delete document
      .addCase(deleteDocumentAsync.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.document_id !== action.payload);
      })

      // Fetch permissions
      .addCase(fetchDocumentPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload.permissions;
      })

      // Fetch students
      .addCase(fetchTutorStudents.fulfilled, (state, action) => {
        state.students = action.payload;
      })

      // Grant permission - Update existing or add new
      .addCase(grantPermissionAsync.fulfilled, (state, action) => {
        const existingIndex = state.permissions.findIndex(
          p => p.document_id === action.payload.document_id && p.user_id === action.payload.user_id
        );
        
        if (existingIndex !== -1) {
          // Update existing permission
          state.permissions[existingIndex] = action.payload;
        } else {
          // Add new permission
          state.permissions.push(action.payload);
          // Update shared count for the document (only for new permissions)
          const document = state.documents.find(doc => doc.document_id === action.payload.document_id);
          if (document && document.shared_count !== undefined) {
            document.shared_count += 1;
          }
        }
      })

      // Revoke permission
      .addCase(revokePermissionAsync.fulfilled, (state, action) => {
        state.permissions = state.permissions.filter(
          p => !(p.document_id === action.payload.documentId && p.user_id === action.payload.studentId)
        );
        // Update shared count for the document
        const document = state.documents.find(doc => doc.document_id === action.payload.documentId);
        if (document && document.shared_count !== undefined && document.shared_count > 0) {
          document.shared_count -= 1;
        }
      });
  },
});

export const {
  clearError,
  setShowUploadModal,
  setShowPermissionsModal,
  resetUploadProgress,
} = documentsSlice.actions;

export default documentsSlice.reducer;