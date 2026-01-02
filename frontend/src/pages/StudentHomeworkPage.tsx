/**
 * File: StudentHomeworkPage.tsx
 * Mục đích: Học viên xem danh sách bài tập được giao
 * Features:
 *   - Xem danh sách bài tập được giao
 *   - Lọc theo trạng thái
 *   - Xem chi tiết và nộp bài
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchStudentHomeworks,
} from '../store/slices/newHomeworkSlice';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Star,
  Send,
  Eye,
  Filter,
} from 'lucide-react';

const StudentHomeworkPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { studentHomeworks, loading } = useSelector((state: RootState) => state.newHomework);
  const { user } = useSelector((state: RootState) => state.auth);
  const baseRoute = user?.role?.toLowerCase() === 'tutor' ? '/tutor' : '/student';
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    dispatch(fetchStudentHomeworks());
  }, [dispatch]);

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

  const getStatusBadge = (homework: any) => {
    if (homework.score !== null && homework.score !== undefined) {
      return <Badge variant="default" className="bg-green-500">Đã chấm điểm</Badge>;
    }
    if (homework.submitted_at) {
      return <Badge variant="default" className="bg-blue-500">Đã nộp</Badge>;
    }
    if (isOverdue(homework.due_date)) {
      return <Badge variant="destructive">Quá hạn</Badge>;
    }
    return <Badge variant="outline">Chờ nộp</Badge>;
  };

  const getFilteredHomeworks = () => {
    if (filter === 'ALL') return studentHomeworks;
    
    return studentHomeworks.filter(hw => {
      if (filter === 'GRADED') return hw.score !== null && hw.score !== undefined;
      if (filter === 'SUBMITTED') return hw.submitted_at && hw.score === null;
      if (filter === 'PENDING') return !hw.submitted_at && !isOverdue(hw.due_date);
      if (filter === 'OVERDUE') return !hw.submitted_at && isOverdue(hw.due_date);
      return true;
    });
  };

  // Stats
  const stats = {
    total: studentHomeworks.length,
    pending: studentHomeworks.filter(hw => !hw.submitted_at && !isOverdue(hw.due_date)).length,
    submitted: studentHomeworks.filter(hw => hw.submitted_at && hw.score === null).length,
    graded: studentHomeworks.filter(hw => hw.score !== null && hw.score !== undefined).length,
    overdue: studentHomeworks.filter(hw => !hw.submitted_at && isOverdue(hw.due_date)).length,
  };

  const filteredHomeworks = getFilteredHomeworks();

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Bài Tập Của Tôi
          </h1>
          <p className="text-gray-600 mt-1">Danh sách bài tập được giao</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="cursor-pointer hover:border-blue-500" onClick={() => setFilter('ALL')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng cộng</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-yellow-500" onClick={() => setFilter('PENDING')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chờ nộp</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-blue-500" onClick={() => setFilter('SUBMITTED')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã nộp</p>
                <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
              </div>
              <Send className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-green-500" onClick={() => setFilter('GRADED')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã chấm</p>
                <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-red-500" onClick={() => setFilter('OVERDUE')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Quá hạn</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Indicator */}
      {filter !== 'ALL' && (
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Đang lọc: </span>
          <Badge variant="outline">{
            filter === 'PENDING' ? 'Chờ nộp' :
            filter === 'SUBMITTED' ? 'Đã nộp' :
            filter === 'GRADED' ? 'Đã chấm' :
            filter === 'OVERDUE' ? 'Quá hạn' : filter
          }</Badge>
          <Button variant="ghost" size="sm" onClick={() => setFilter('ALL')}>
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* Homework List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Bài Tập ({filteredHomeworks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredHomeworks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Không có bài tập nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHomeworks.map((homework) => (
                <div
                  key={homework.assignment_id}
                  className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{homework.title}</h3>
                        {getStatusBadge(homework)}
                        {homework.is_late && (
                          <Badge variant="destructive">Nộp muộn</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {homework.description || 'Không có mô tả'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Hạn: {formatDate(homework.due_date)}
                        </span>
                        {homework.max_score && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            Thang điểm: {homework.max_score}
                          </span>
                        )}
                        {homework.score !== null && homework.score !== undefined && (
                          <span className="flex items-center gap-1 font-bold text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Điểm: {homework.score}/{homework.max_score}
                          </span>
                        )}
                      </div>
                      {homework.note && (
                        <p className="mt-2 text-sm text-blue-600 italic">
                          📝 Ghi chú: {homework.note}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <Button
                        onClick={() => navigate(`${baseRoute}/homework/${homework.assignment_id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentHomeworkPage;
