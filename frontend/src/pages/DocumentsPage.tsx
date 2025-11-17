/**
 * File: pages/DocumentsPage.tsx
 * Mục đích: Trang quản lý tài liệu
 * Vai trò:
 *   - Hiển thị danh sách tài liệu của tutor hoặc tài liệu được share cho student
 *   - Upload tài liệu mới (tutor only)
 *   - Quản lý quyền truy cập (tutor only)
 *   - Download tài liệu
 * Lưu ý:
 *   - Phân biệt UI cho tutor và student
 *   - Modal upload và permissions management
 *   - Responsive design với shadcn/ui
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Upload,
  Download,
  FileText,
  Video,
  Image,
  File,
  Users,
  Eye,
  Trash2,
  Edit,
  Share2,
  Calendar,
  User,
} from 'lucide-react';
import { formatFileSize, getFileIcon } from '../utils/fileHelper';
import {
  fetchMyDocuments,
  setShowUploadModal,
  setShowPermissionsModal,
  deleteDocumentAsync,
  downloadDocumentAsync,
} from '../store/slices/documentsSlice';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { DocumentPermissionsModal } from '../components/DocumentPermissionsModal';

export const DocumentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    documents,
    loading,
    error,
    showUploadModal,
    showPermissionsModal,
    selectedDocumentId,
  } = useSelector((state: RootState) => state.documents);

  const isTutor = user?.role === 'TUTOR';

  useEffect(() => {
    dispatch(fetchMyDocuments());
  }, [dispatch]);

  const handleDownload = async (document: any) => {
    try {
      const result = await dispatch(downloadDocumentAsync(document.document_id)).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      try {
        await dispatch(deleteDocumentAsync(documentId)).unwrap();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    if (!fileType) return <File className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (fileType === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách tài liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchMyDocuments())}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isTutor ? 'Kho Tài Liệu' : 'Tài Liệu Được Chia Sẻ'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isTutor
              ? 'Quản lý tài liệu và chia sẻ với học sinh'
              : 'Truy cập tài liệu được gia sư chia sẻ'
            }
          </p>
        </div>

        {isTutor && (
          <Button
            onClick={() => dispatch(setShowUploadModal(true))}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Tài Liệu
          </Button>
        )}
      </div>

      <Separator />

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isTutor ? 'Chưa có tài liệu nào' : 'Chưa có tài liệu được chia sẻ'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isTutor
              ? 'Upload tài liệu đầu tiên để bắt đầu chia sẻ với học sinh'
              : 'Gia sư sẽ chia sẻ tài liệu với bạn trong thời gian tới'
            }
          </p>
          {isTutor && (
            <Button onClick={() => dispatch(setShowUploadModal(true))}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Tài Liệu Đầu Tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <Card key={document.document_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {getFileTypeIcon(document.file_type || '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate" title={document.title}>
                        {document.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 truncate" title={document.file_name}>
                        {document.file_name}
                      </p>
                    </div>
                  </div>

                  {isTutor && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch(setShowPermissionsModal({ show: true, documentId: document.document_id }))}
                        title="Quản lý quyền truy cập"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document.document_id)}
                        title="Xóa tài liệu"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {document.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {document.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {document.upload_date ? formatDate(document.upload_date) : 'N/A'}
                  </div>
                  <div>
                    {document.file_size ? formatFileSize(Number(document.file_size)) : 'N/A'}
                  </div>
                </div>

                {/* Permission info for students */}
                {!isTutor && document.permission_type && (
                  <div className="flex items-center gap-2">
                    <Badge variant={document.permission_type === 'DOWNLOAD' ? 'default' : 'secondary'}>
                      {document.permission_type === 'DOWNLOAD' ? 'Có thể tải xuống' : 'Chỉ xem'}
                    </Badge>
                    {document.tutor_name && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        {document.tutor_name}
                      </div>
                    )}
                  </div>
                )}

                {/* Shared count for tutors */}
                {isTutor && document.shared_count !== undefined && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    Đã chia sẻ với {document.shared_count} học sinh
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {document.permission_type === 'VIEW' && !isTutor ? 'Xem' : 'Tải xuống'}
                  </Button>

                  {isTutor && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch(setShowPermissionsModal({ show: true, documentId: document.document_id }))}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showUploadModal && <DocumentUploadModal />}
      {showPermissionsModal && selectedDocumentId && (
        <DocumentPermissionsModal documentId={selectedDocumentId} />
      )}
    </div>
  );
};

export default DocumentsPage;