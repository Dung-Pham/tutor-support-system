/**
 * File: pages/SubmissionsPage.tsx
 * Purpose: Tutor view of all submissions for an assignment
 * Features: List submissions, grade individual submissions
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { GradeForm } from '../components/GradeForm';
import { ArrowLeft, FileText } from 'lucide-react';
import { fetchAssignmentById } from '../store/slices/assignmentsSlice';
import { fetchSubmissionsByAssignment, gradeSubmission } from '../store/slices/submissionsSlice';
import { formatDate } from '../utils/dateHelper';
import { SUBMISSION_STATUS_LABELS, SUBMISSION_STATUS_COLORS } from '../utils/constants';
import type { RootState, AppDispatch } from '../store';
import type { Submission, GradeSubmissionDTO } from '../types/submission';

export const SubmissionsPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentAssignment, loading: assignmentLoading } = useSelector(
    (state: RootState) => state.assignments
  );
  const { submissions, loading: submissionsLoading } = useSelector(
    (state: RootState) => state.submissions
  );

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showGradeDialog, setShowGradeDialog] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAssignmentById(assignmentId));
      dispatch(fetchSubmissionsByAssignment(assignmentId));
    }
  }, [assignmentId]);

  const handleGradeSubmission = async (data: GradeSubmissionDTO) => {
    if (!selectedSubmission) return;

    try {
      await dispatch(
        gradeSubmission({ submissionId: selectedSubmission.submission_id, data })
      ).unwrap();
      setShowGradeDialog(false);
      setSelectedSubmission(null);
      if (assignmentId) {
        dispatch(fetchSubmissionsByAssignment(assignmentId));
      }
    } catch (error) {
      console.error('Failed to grade submission:', error);
    }
  };

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowGradeDialog(true);
  };

  if (assignmentLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy bài tập</p>
          <Button className="mt-4" onClick={() => navigate('/assignments')}>
            Về danh sách bài tập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/assignments')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách bài tập
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{currentAssignment.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{currentAssignment.description}</p>
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <span>Hạn nộp: {formatDate(currentAssignment.due_date, 'datetime')}</span>
            {currentAssignment.max_score && <span>Điểm tối đa: {currentAssignment.max_score}</span>}
            <span>Tổng bài nộp: {submissions.length}</span>
            <span>
              Đã chấm: {submissions.filter((s) => s.status === 'graded').length}
            </span>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-xl font-semibold">Danh sách bài nộp</h2>

      {submissionsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-600">Đang tải bài nộp...</p>
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Chưa có bài nộp nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const statusColor = SUBMISSION_STATUS_COLORS[submission.status] || 'bg-gray-100 text-gray-800';
            const statusLabel = SUBMISSION_STATUS_LABELS[submission.status] || submission.status;

            return (
              <Card key={submission.submission_id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{submission.student_name || 'Học viên'}</h3>
                        <Badge className={statusColor}>{statusLabel}</Badge>
                        {submission.score !== undefined && (
                          <Badge variant="outline">
                            Điểm: {submission.score}/{currentAssignment.max_score || '?'}
                          </Badge>
                        )}
                      </div>
                      {submission.submitted_at && (
                        <p className="mt-1 text-sm text-gray-600">
                          Nộp lúc: {formatDate(submission.submitted_at, 'datetime')}
                        </p>
                      )}
                      {submission.comments && (
                        <p className="mt-2 text-sm text-gray-700 italic">"{submission.comments}"</p>
                      )}
                      {submission.feedback && (
                        <div className="mt-2 rounded-lg bg-gray-50 p-2">
                          <p className="text-sm font-medium">Nhận xét:</p>
                          <p className="text-sm text-gray-700">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                    <Button onClick={() => openGradeDialog(submission)}>
                      {submission.status === 'graded' ? 'Xem/Sửa điểm' : 'Chấm điểm'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Grade Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chấm điểm bài tập</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <GradeForm
              maxScore={currentAssignment.max_score}
              existingScore={selectedSubmission.score}
              existingFeedback={selectedSubmission.feedback}
              studentName={selectedSubmission.student_name}
              onSubmit={handleGradeSubmission}
              onCancel={() => setShowGradeDialog(false)}
              loading={submissionsLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionsPage;
