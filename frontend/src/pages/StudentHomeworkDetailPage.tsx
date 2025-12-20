/**
 * File: StudentHomeworkDetailPage.tsx
 * Mục đích: Chi tiết bài tập và nộp bài
 * Features:
 *   - Xem thông tin bài tập chi tiết
 *   - Nộp bài tập (file + content)
 *   - Xem điểm và nhận xét
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchStudentHomeworkDetail,
  submitHomeworkAsync,
  clearCurrentAssignment,
} from '../store/slices/newHomeworkSlice';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import AttachmentPreview from '../components/AttachmentPreview';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Star,
  Send,
  Upload,
  Download,
  MessageSquare,
  Calendar,
  X,
} from 'lucide-react';

const StudentHomeworkDetailPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentAssignment, loading } = useSelector((state: RootState) => state.newHomework);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    content: '',
    file: null as File | null,
  });

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchStudentHomeworkDetail(assignmentId));
    }
    return () => {
      dispatch(clearCurrentAssignment());
    };
  }, [dispatch, assignmentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmitForm({ ...submitForm, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignmentId) {
      await dispatch(submitHomeworkAsync({
        assignmentId,
        data: {
          content: submitForm.content,
          file: submitForm.file || undefined,
        },
      }));
      setShowSubmitModal(false);
      setSubmitForm({ content: '', file: null });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getStatusInfo = () => {
    if (!currentAssignment) return { text: '', color: '', icon: null };
    
    if (currentAssignment.score !== null && currentAssignment.score !== undefined) {
      return {
        text: 'Đã chấm điểm',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      };
    }
    if (currentAssignment.submitted_at) {
      return {
        text: 'Đã nộp bài - Chờ chấm điểm',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Send className="h-5 w-5 text-blue-600" />,
      };
    }
    if (isOverdue(currentAssignment.due_date)) {
      return {
        text: 'Quá hạn nộp bài',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      };
    }
    return {
      text: 'Chờ nộp bài',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
    };
  };

  if (loading && !currentAssignment) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Không tìm thấy bài tập</h3>
            <Button className="mt-4" onClick={() => navigate('/my-homework')}>
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/my-homework')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{currentAssignment.title}</h1>
          <p className="text-gray-600">{currentAssignment.tutor_name}</p>
        </div>
        {!currentAssignment.submitted_at && (
          <Button onClick={() => setShowSubmitModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Nộp Bài
          </Button>
        )}
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg border mb-6 flex items-center gap-3 ${statusInfo.color}`}>
        {statusInfo.icon}
        <span className="font-medium">{statusInfo.text}</span>
        {currentAssignment.is_late && (
          <Badge variant="destructive" className="ml-2">Nộp muộn</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Homework Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nội Dung Bài Tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">
                  {currentAssignment.description || 'Không có mô tả'}
                </p>
              </div>
              {currentAssignment.attachment_url && (
                <div className="mt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Tài liệu đính kèm
                  </h4>
                  <AttachmentPreview
                    url={currentAssignment.attachment_url}
                    name={currentAssignment.attachment_name}
                    type={currentAssignment.attachment_type}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission (if submitted) */}
          {currentAssignment.submitted_at && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Bài Nộp Của Bạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    Nộp lúc: {formatDate(currentAssignment.submitted_at)}
                    {currentAssignment.is_late && (
                      <Badge variant="destructive" className="ml-2">Muộn</Badge>
                    )}
                  </div>
                  {currentAssignment.submission_content && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Nội dung:</h4>
                      <p className="whitespace-pre-wrap">{currentAssignment.submission_content}</p>
                    </div>
                  )}
                  {currentAssignment.submission_attachment_url && (
                    <div>
                      <h4 className="font-medium mb-2">File đính kèm:</h4>
                      <AttachmentPreview
                        url={currentAssignment.submission_attachment_url}
                        name={currentAssignment.submission_attachment_name}
                        type={currentAssignment.submission_attachment_type}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grade & Feedback */}
          {currentAssignment.score !== null && currentAssignment.score !== undefined && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Star className="h-5 w-5" />
                  Kết Quả Chấm Điểm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-5xl font-bold text-green-600">
                      {currentAssignment.score}
                    </p>
                    <p className="text-gray-600">/ {currentAssignment.max_score} điểm</p>
                  </div>
                  {currentAssignment.feedback && (
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Nhận xét của gia sư:
                      </h4>
                      <p className="whitespace-pre-wrap text-gray-700">
                        {currentAssignment.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Hạn nộp</span>
                <span className={`font-medium ${isOverdue(currentAssignment.due_date) && !currentAssignment.submitted_at ? 'text-red-600' : ''}`}>
                  {formatDate(currentAssignment.due_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Thang điểm</span>
                <span className="font-medium">{currentAssignment.max_score}</span>
              </div>
              {currentAssignment.note && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Ghi chú từ gia sư:</p>
                  <p className="text-sm italic">{currentAssignment.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {!currentAssignment.submitted_at && (
            <Card>
              <CardContent className="pt-6">
                <Button 
                  className="w-full" 
                  onClick={() => setShowSubmitModal(true)}
                  variant={isOverdue(currentAssignment.due_date) ? 'destructive' : 'default'}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isOverdue(currentAssignment.due_date) ? 'Nộp Muộn' : 'Nộp Bài'}
                </Button>
                {isOverdue(currentAssignment.due_date) && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    ⚠️ Bài nộp sẽ bị đánh dấu là muộn
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Nộp Bài Tập"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {isOverdue(currentAssignment.due_date) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ Bạn đang nộp bài sau hạn. Bài nộp sẽ bị đánh dấu là muộn.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Nội dung bài làm</label>
            <textarea
              value={submitForm.content}
              onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Nhập nội dung bài làm của bạn..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File đính kèm</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {submitForm.file ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{submitForm.file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubmitForm({ ...submitForm, file: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="submit-file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="submit-file"
                    className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Click để chọn file</span>
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ: PDF, Word, Excel, PowerPoint, Text, ZIP, RAR, Images
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (!submitForm.content && !submitForm.file)}
            >
              <Send className="h-4 w-4 mr-2" />
              Nộp Bài
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentHomeworkDetailPage;
