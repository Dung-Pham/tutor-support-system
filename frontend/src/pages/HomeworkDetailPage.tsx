/**
 * File: HomeworkDetailPage.tsx
 * Mục đích: Chi tiết bài tập và quản lý học viên
 * Features:
 *   - Xem thông tin bài tập
 *   - Giao bài cho học viên
 *   - Xem trạng thái nộp bài
 *   - Xem chi tiết bài nộp của học viên
 *   - Chấm điểm
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchHomeworkDetail,
  fetchTutorStudents,
  assignHomeworkAsync,
  unassignHomeworkAsync,
  gradeSubmissionAsync,
  setShowAssignModal,
  setShowGradeModal,
  clearCurrentHomework,
} from '../store/slices/newHomeworkSlice';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import {
  ArrowLeft,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Star,
  Send,
  X,
  Calendar,
  Download,
  Eye,
  MessageSquare,
} from 'lucide-react';
import AttachmentPreview from '../components/AttachmentPreview';

const HomeworkDetailPage: React.FC = () => {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentHomework, students, loading, showAssignModal, showGradeModal } = useSelector(
    (state: RootState) => state.newHomework
  );

  // Assign form state
  const [assignForm, setAssignForm] = useState({
    studentId: '',
    dueDate: '',
    note: '',
  });

  // Grade form state
  const [gradeForm, setGradeForm] = useState({
    submissionId: '',
    studentName: '',
    score: 0,
    feedback: '',
  });

  // View submission state (inline section, not modal)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    if (homeworkId) {
      dispatch(fetchHomeworkDetail(homeworkId));
      dispatch(fetchTutorStudents());
    }
    return () => {
      dispatch(clearCurrentHomework());
    };
  }, [dispatch, homeworkId]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (homeworkId) {
      await dispatch(assignHomeworkAsync({
        homeworkId,
        data: {
          studentId: assignForm.studentId,
          dueDate: assignForm.dueDate,
          note: assignForm.note,
        },
      }));
      setAssignForm({ studentId: '', dueDate: '', note: '' });
    }
  };

  const handleUnassign = async (studentId: string) => {
    if (homeworkId && window.confirm('Hủy giao bài tập cho học viên này?')) {
      await dispatch(unassignHomeworkAsync({ homeworkId, studentId }));
    }
  };

  const handleOpenGradeModal = (assignment: any) => {
    setGradeForm({
      submissionId: assignment.submission_id,
      studentName: assignment.student_name,
      score: assignment.score || 0,
      feedback: assignment.feedback || '',
    });
    dispatch(setShowGradeModal(true));
  };

  const handleViewSubmission = (assignment: any) => {
    setSelectedSubmission(assignment);
    // Scroll to submission detail section after state update
    setTimeout(() => {
      document.getElementById('submission-detail')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(gradeSubmissionAsync({
      submissionId: gradeForm.submissionId,
      data: {
        score: gradeForm.score,
        feedback: gradeForm.feedback,
      },
    }));
    
    // Refetch homework detail to get updated scores
    if (result.meta.requestStatus === 'fulfilled' && homeworkId) {
      dispatch(fetchHomeworkDetail(homeworkId));
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GRADED':
        return <Badge variant="default" className="bg-green-500">Đã chấm</Badge>;
      case 'SUBMITTED':
        return <Badge variant="default" className="bg-blue-500">Đã nộp</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive">Quá hạn</Badge>;
      default:
        return <Badge variant="outline">Chờ nộp</Badge>;
    }
  };

  // Filter students not yet assigned
  const availableStudents = students.filter(
    s => !currentHomework?.assignments.some(a => a.student_id === s.user_id)
  );

  if (loading && !currentHomework) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentHomework) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Không tìm thấy bài tập</h3>
            <Button className="mt-4" onClick={() => navigate('/homework/tutor')}>
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/homework/tutor')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{currentHomework.title}</h1>
          <p className="text-gray-600">{currentHomework.class_name || 'Bài tập chung'}</p>
        </div>
        <Button onClick={() => dispatch(setShowAssignModal(true))}>
          <UserPlus className="h-4 w-4 mr-2" />
          Giao Bài Tập
        </Button>
      </div>

      {/* Homework Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thông Tin Bài Tập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Mô tả</h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {currentHomework.description || 'Không có mô tả'}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Thang điểm: {currentHomework.max_score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Ngày tạo: {formatDate(currentHomework.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Attachment Preview */}
          {currentHomework.attachment_url && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Tài liệu đính kèm
              </h4>
              <AttachmentPreview
                url={currentHomework.attachment_url}
                name={currentHomework.attachment_name}
                type={currentHomework.attachment_type}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Danh Sách Học Viên ({currentHomework.assignments.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentHomework.assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa giao bài tập cho học viên nào</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => dispatch(setShowAssignModal(true))}
              >
                Giao bài tập ngay
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Học viên</th>
                    <th className="text-left py-3 px-4">Hạn nộp</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-left py-3 px-4">Thời gian nộp</th>
                    <th className="text-left py-3 px-4">Điểm</th>
                    <th className="text-left py-3 px-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHomework.assignments.map((assignment) => (
                    <tr key={assignment.assignment_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{assignment.student_name}</p>
                          <p className="text-sm text-gray-500">{assignment.student_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(assignment.due_date)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(assignment.overall_status)}
                        {assignment.is_late && (
                          <Badge variant="destructive" className="ml-1">Muộn</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {assignment.submitted_at ? formatDate(assignment.submitted_at) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {assignment.score !== null && assignment.score !== undefined ? (
                          <span className="font-bold text-green-600">
                            {assignment.score}/{currentHomework.max_score}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {assignment.submission_id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewSubmission(assignment)}
                                title="Xem bài nộp"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem bài
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenGradeModal(assignment)}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                {assignment.score !== null ? 'Sửa điểm' : 'Chấm điểm'}
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleUnassign(assignment.student_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => dispatch(setShowAssignModal(false))}
        title="Giao Bài Tập"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Chọn học viên *</label>
            <select
              value={assignForm.studentId}
              onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Chọn học viên --</option>
              {availableStudents.map((student) => (
                <option key={student.user_id} value={student.user_id}>
                  {student.name} - {student.class_name}
                </option>
              ))}
            </select>
            {availableStudents.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Tất cả học viên đã được giao bài tập này
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hạn nộp *</label>
            <input
              type="datetime-local"
              value={assignForm.dueDate}
              onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={assignForm.note}
              onChange={(e) => setAssignForm({ ...assignForm, note: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Ghi chú cho học viên (không bắt buộc)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(setShowAssignModal(false))}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || availableStudents.length === 0}>
              <Send className="h-4 w-4 mr-2" />
              Giao Bài
            </Button>
          </div>
        </form>
      </Modal>

      {/* Grade Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => dispatch(setShowGradeModal(false))}
        title={`Chấm Điểm - ${gradeForm.studentName}`}
      >
        <form onSubmit={handleGrade} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Điểm (0 - {currentHomework.max_score}) *
            </label>
            <input
              type="number"
              value={gradeForm.score}
              onChange={(e) => setGradeForm({ ...gradeForm, score: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max={currentHomework.max_score}
              step="0.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nhận xét</label>
            <textarea
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Nhận xét cho học viên..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(setShowGradeModal(false))}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Lưu Điểm
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Submission Section - Inline below */}
      {selectedSubmission && (
        <Card className="mt-6 border-2 border-blue-200" id="submission-detail">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Bài Nộp - {selectedSubmission.student_name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubmission(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Học viên:</span>
                    <p className="font-medium">{selectedSubmission.student_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedSubmission.student_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Thời gian nộp:</span>
                    <p className="font-medium">
                      {selectedSubmission.submitted_at ? formatDate(selectedSubmission.submitted_at) : 'Chưa nộp'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Trạng thái:</span>
                    <div className="mt-1">
                      {getStatusBadge(selectedSubmission.overall_status)}
                      {selectedSubmission.is_late && (
                        <Badge variant="destructive" className="ml-1">Muộn</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Two columns: Content + Score on left, Attachment on right */}
              <div className="grid grid-cols-1 gap-6">
                {/* Content Section */}
                <div className="space-y-4">
                  {/* Submission Content */}
                  {selectedSubmission.submission_content && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Nội dung bài nộp
                      </h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-h-[100px]">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedSubmission.submission_content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Attachment - Full Width */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    File đính kèm
                  </h4>
                  {selectedSubmission.submission_attachment_url ? (
                    <AttachmentPreview
                      url={selectedSubmission.submission_attachment_url}
                      name={selectedSubmission.submission_attachment_name}
                      type={selectedSubmission.submission_attachment_type}
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-8">
                      <div className="text-center text-gray-400">
                        <FileText className="h-16 w-16 mx-auto mb-3" />
                        <p className="text-lg">Không có file đính kèm</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HomeworkDetailPage;
