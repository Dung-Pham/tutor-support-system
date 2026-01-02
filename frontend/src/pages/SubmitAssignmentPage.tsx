/**
 * File: pages/SubmitAssignmentPage.tsx
 * Purpose: Student submission page for a specific assignment
 * Features: View assignment details, submit files
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { SubmissionForm } from '../components/SubmissionForm';
import { ArrowLeft } from 'lucide-react';
import { fetchAssignmentById } from '../store/slices/assignmentsSlice';
import { fetchMySubmission, submitAssignment } from '../store/slices/submissionsSlice';
import type { RootState, AppDispatch } from '../store';
import type { CreateSubmissionDTO } from '../types/submission';

export const SubmitAssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentAssignment, loading: assignmentLoading } = useSelector(
    (state: RootState) => state.assignments
  );
  const { mySubmission, loading: submissionLoading } = useSelector(
    (state: RootState) => state.submissions
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const baseRoute = user?.role?.toLowerCase() === 'tutor' ? '/tutor' : '/student';

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAssignmentById(assignmentId));
      dispatch(fetchMySubmission(assignmentId));
    }
  }, [assignmentId]);

  const handleSubmit = async (data: CreateSubmissionDTO) => {
    if (!assignmentId) return;

    try {
      await dispatch(submitAssignment({ assignmentId, data })).unwrap();
      navigate(`${baseRoute}/assignments`);
    } catch (error) {
      console.error('Failed to submit assignment:', error);
    }
  };

  if (assignmentLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy bài tập</p>
          <Button className="mt-4" onClick={() => navigate(`${baseRoute}/assignments`)}>
            Về danh sách bài tập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(`${baseRoute}/assignments`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách bài tập
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chi tiết bài tập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{currentAssignment.title}</h3>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">
              {currentAssignment.description}
            </p>
          </div>

          {currentAssignment.attachments && currentAssignment.attachments.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">File đính kèm từ giáo viên:</p>
              <ul className="space-y-1">
                {currentAssignment.attachments.map((url, index) => (
                  <li key={index}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      File {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentAssignment.max_score && (
            <div className="border-t pt-4">
              <p className="text-sm">
                <span className="font-medium">Điểm tối đa:</span> {currentAssignment.max_score}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nộp bài tập</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionForm
            assignmentTitle={currentAssignment.title}
            dueDate={currentAssignment.due_date}
            hasExistingSubmission={!!mySubmission}
            onSubmit={handleSubmit}
            loading={submissionLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitAssignmentPage;
