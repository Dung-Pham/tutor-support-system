/**
 * File: pages/AssignmentsPage.tsx
 * Purpose: Assignments list and management page
 * Features: Different views for tutor (create) and student (view/submit)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AssignmentForm } from '../components/AssignmentForm';
import { Plus, Calendar, Clock, FileText } from 'lucide-react';
import { fetchAssignments, createAssignment } from '../store/slices/assignmentsSlice';
import { formatDate, isPast } from '../utils/dateHelper';
import { ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS } from '../utils/constants';
import type { RootState, AppDispatch } from '../store';
import type { CreateAssignmentDTO } from '../types/assignment';

export const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { assignments, loading } = useSelector((state: RootState) => state.assignments);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedClassId] = useState(''); // TODO: Add class selection

  const isTutor = user?.role?.toLowerCase() === 'tutor';
  const baseRoute = isTutor ? '/tutor' : '/student';

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = () => {
    const userId = user?.user_id || user?.id;
    const params = isTutor ? { tutorId: userId } : {};
    dispatch(fetchAssignments(params));
  };

  const handleCreateAssignment = async (data: CreateAssignmentDTO) => {
    try {
      await dispatch(createAssignment(data)).unwrap();
      setShowCreateDialog(false);
      loadAssignments();
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  const handleAssignmentClick = (assignmentId: string) => {
    if (isTutor) {
      navigate(`${baseRoute}/assignments/${assignmentId}/submissions`);
    } else {
      navigate(`${baseRoute}/assignments/${assignmentId}/submit`);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bài tập</h1>
          <p className="mt-1 text-gray-600">
            {isTutor ? 'Quản lý bài tập đã giao' : 'Xem và nộp bài tập'}
          </p>
        </div>

        {isTutor && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo bài tập mới
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-600">Đang tải danh sách bài tập...</p>
          </div>
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">
              {isTutor ? 'Chưa có bài tập nào. Tạo bài tập đầu tiên!' : 'Chưa có bài tập nào được giao'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => {
            const statusColor = ASSIGNMENT_STATUS_COLORS[assignment.status] || 'bg-gray-100 text-gray-800';
            const statusLabel = ASSIGNMENT_STATUS_LABELS[assignment.status] || assignment.status;
            const isOverdue = isPast(assignment.due_date);

            return (
              <Card
                key={assignment.assignment_id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleAssignmentClick(assignment.assignment_id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <Badge className={statusColor}>{statusLabel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-gray-600">{assignment.description}</p>

                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        Hạn nộp: {formatDate(assignment.due_date, 'datetime')}
                      </span>
                    </div>

                    {assignment.max_score && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                        <span>Điểm tối đa: {assignment.max_score}</span>
                      </div>
                    )}

                    {isTutor && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {assignment.submissions_count || 0} bài nộp
                        </span>
                        <span className="text-gray-600">
                          {assignment.graded_count || 0} đã chấm
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo bài tập mới</DialogTitle>
          </DialogHeader>
          <AssignmentForm
            classId={selectedClassId}
            onSubmit={handleCreateAssignment}
            onCancel={() => setShowCreateDialog(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsPage;
