/**
 * File: TutorHomeworkPage.tsx
 * Mục đích: Trang quản lý bài tập cho gia sư
 * Features:
 *   - Danh sách bài tập đã tạo
 *   - Tạo bài tập mới
 *   - Xem chi tiết, giao bài, chấm điểm
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import {
  fetchTutorHomeworks,
  createHomeworkAsync,
  deleteHomeworkAsync,
  setShowCreateModal,
} from '../store/slices/newHomeworkSlice';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import {
  Plus,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Upload,
  Link,
  X,
  Paperclip,
} from 'lucide-react';

const TutorHomeworkPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { homeworks, loading, error, showCreateModal } = useSelector(
    (state: RootState) => state.newHomework
  );

  // Form state for create homework
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxScore: 10,
    dueDate: '',
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentLink, setAttachmentLink] = useState('');
  const [attachmentType, setAttachmentType] = useState<'file' | 'link'>('file');

  useEffect(() => {
    dispatch(fetchTutorHomeworks());
  }, [dispatch]);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      attachment: attachmentFile || undefined,
      attachmentUrl: attachmentType === 'link' ? attachmentLink : undefined,
    };
    await dispatch(createHomeworkAsync(submitData));
    setFormData({ title: '', description: '', maxScore: 10, dueDate: '' });
    setAttachmentFile(null);
    setAttachmentLink('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentFile(e.target.files[0]);
      setAttachmentLink(''); // Clear link when file selected
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentLink('');
  };

  const handleDeleteHomework = async (homeworkId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      await dispatch(deleteHomeworkAsync(homeworkId));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (homework: any) => {
    const { assigned_count = 0, submitted_count = 0 } = homework;
    if (submitted_count > 0 && submitted_count === assigned_count) {
      return <Badge variant="default" className="bg-green-500">Hoàn thành</Badge>;
    }
    if (submitted_count > 0) {
      return <Badge variant="secondary">{submitted_count}/{assigned_count} đã nộp</Badge>;
    }
    if (assigned_count > 0) {
      return <Badge variant="outline">Đã giao {assigned_count} học viên</Badge>;
    }
    return <Badge variant="outline">Chưa giao</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Quản Lý Bài Tập
          </h1>
          <p className="text-gray-600 mt-1">
            Tạo và quản lý bài tập về nhà cho học viên
          </p>
        </div>
        <Button onClick={() => dispatch(setShowCreateModal(true))}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Bài Tập Mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng bài tập</p>
                <p className="text-2xl font-bold">{homeworks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã giao</p>
                <p className="text-2xl font-bold">
                  {homeworks.filter(h => (h.assigned_count || 0) > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chờ chấm điểm</p>
                <p className="text-2xl font-bold">
                  {homeworks.reduce((acc, h) => acc + ((h.submitted_count || 0)), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng giao</p>
                <p className="text-2xl font-bold">
                  {homeworks.reduce((acc, h) => acc + (h.assigned_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Homework List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : homeworks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Chưa có bài tập nào</h3>
              <p className="text-gray-500 mt-1">Bắt đầu bằng việc tạo bài tập mới</p>
              <Button 
                className="mt-4" 
                onClick={() => dispatch(setShowCreateModal(true))}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo Bài Tập
              </Button>
            </CardContent>
          </Card>
        ) : (
          homeworks.map((homework) => (
            <Card key={homework.homework_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{homework.title}</h3>
                      {getStatusBadge(homework)}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {homework.description || 'Không có mô tả'}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Tạo: {formatDate(homework.created_at)}
                      </span>
                      {homework.class_name && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {homework.class_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {homework.assigned_count || 0} học viên
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {homework.submitted_count || 0} đã nộp
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/homework/${homework.homework_id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteHomework(homework.homework_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Homework Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => dispatch(setShowCreateModal(false))}
        title="Tạo Bài Tập Mới"
      >
        <form onSubmit={handleCreateHomework} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề bài tập"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả chi tiết bài tập"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Thang điểm</label>
              <input
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hạn nộp mặc định</label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Attachment Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Tệp đính kèm / Link</label>
            
            {/* Toggle between file and link */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAttachmentType('file')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  attachmentType === 'file' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setAttachmentType('link')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  attachmentType === 'link' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Link className="h-4 w-4" />
                Thêm Link
              </button>
            </div>

            {attachmentType === 'file' ? (
              <div>
                {attachmentFile ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{attachmentFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(attachmentFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="homework-file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                    />
                    <label
                      htmlFor="homework-file"
                      className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700"
                    >
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-medium">Click để chọn file</span>
                      <span className="text-xs text-gray-400">
                        PDF, Word, Excel, PowerPoint, Images, ZIP (Max 50MB)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={attachmentLink}
                  onChange={(e) => {
                    setAttachmentLink(e.target.value);
                    setAttachmentFile(null); // Clear file when link entered
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/tai-lieu.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nhập link đến tài liệu, video hoặc trang web
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(setShowCreateModal(false))}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo Bài Tập'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TutorHomeworkPage;
