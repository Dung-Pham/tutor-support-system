/**
 * File: pages/StatisticsPage.tsx
 * Mục đích: Trang thống kê dashboard cho gia sư
 * Vai trò:
 *   - Hiển thị tổng quan: số học sinh, lớp học, bài tập, tài liệu
 *   - Danh sách lớp đang dạy với tiến độ
 *   - Bài tập sắp đến hạn
 *   - Bài nộp gần đây cần chấm
 *   - Hoạt động học sinh
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Users,
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  ChevronRight,
  Star,
  Award,
} from 'lucide-react';

interface Overview {
  totalStudents: number;
  activeClasses: number;
  totalHomeworks: number;
  totalDocuments: number;
  pendingSubmissions: number;
  completedSessions: number;
}

interface ClassProgress {
  class_id: string;
  student_name: string;
  subject_name: string;
  grade_level: number;
  status: string;
  start_date: string;
  end_date: string;
  total_sessions: number;
  completed_homeworks: number;
  total_homeworks: number;
  completion_percentage: number;
}

interface UpcomingHomework {
  homework_id: string;
  title: string;
  class_name: string;
  student_name: string;
  due_date: string;
  status: string;
  days_remaining: number;
}

interface RecentSubmission {
  submission_id: string;
  homework_title: string;
  student_name: string;
  submitted_at: string;
  is_late: boolean;
  status: string;
  score: number | null;
}

interface StudentActivity {
  student_id: string;
  student_name: string;
  email: string;
  active_classes: number;
  total_submissions: number;
  average_score: number | null;
  last_activity: string | null;
}

export const StatisticsPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [overview, setOverview] = useState<Overview | null>(null);
  const [classes, setClasses] = useState<ClassProgress[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingHomework[]>([]);
  const [submissions, setSubmissions] = useState<RecentSubmission[]>([]);
  const [students, setStudents] = useState<StudentActivity[]>([]);

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/statistics/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu thống kê');
      }

      const data = await response.json();
      setOverview(data.data.overview);
      setClasses(data.data.classes || []);
      setUpcoming(data.data.upcoming || []);
      setSubmissions(data.data.submissions || []);
      setStudents(data.data.students || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 1) return 'text-orange-600';
    if (days <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAllStatistics}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600 mt-1">Thống kê hoạt động giảng dạy của bạn</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="bg-white border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Học sinh</p>
                <p className="text-3xl font-bold text-gray-900">{overview?.totalStudents || 0}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Classes */}
        <Card className="bg-white border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Lớp đang dạy</p>
                <p className="text-3xl font-bold text-gray-900">{overview?.activeClasses || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Homeworks */}
        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bài tập đã tạo</p>
                <p className="text-3xl font-bold text-gray-900">{overview?.totalHomeworks || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Submissions */}
        <Card className="bg-white border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chờ chấm điểm</p>
                <p className="text-3xl font-bold text-gray-900">{overview?.pendingSubmissions || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Progress - 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Lớp đang dạy</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/my-classes')}>
                  Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có lớp học nào</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Môn học</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Tiến độ bài tập</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Buổi học</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Học sinh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.slice(0, 5).map((cls) => (
                        <tr key={cls.class_id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{cls.subject_name}</p>
                                <p className="text-xs text-gray-500">Lớp {cls.grade_level}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {cls.completed_homeworks}/{cls.total_homeworks}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({cls.completion_percentage}%)
                              </span>
                            </div>
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${cls.completion_percentage}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm text-gray-600">{cls.total_sessions} buổi</span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                                {cls.student_name?.charAt(0) || '?'}
                              </div>
                              <span className="text-sm text-gray-700">{cls.student_name}</span>
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
        </div>

        {/* Upcoming Homeworks - 1 column */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Bài tập sắp đến hạn</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Không có bài tập nào sắp đến hạn</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((hw) => (
                    <div 
                      key={hw.homework_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate(`/homework/tutor/${hw.homework_id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{hw.title}</p>
                          <p className="text-xs text-gray-500">{hw.class_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getDaysRemainingColor(hw.days_remaining)}`}>
                          {hw.days_remaining < 0 
                            ? 'Quá hạn' 
                            : hw.days_remaining === 0 
                              ? 'Hôm nay' 
                              : `${hw.days_remaining} ngày`}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(hw.due_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/homework/tutor')}
              >
                Xem tất cả bài tập
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Submissions and Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Bài nộp gần đây</CardTitle>
              {overview?.pendingSubmissions ? (
                <Badge className="bg-orange-100 text-orange-800">
                  {overview.pendingSubmissions} chờ chấm
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có bài nộp nào</p>
            ) : (
              <div className="space-y-3">
                {submissions.slice(0, 5).map((sub) => (
                  <div 
                    key={sub.submission_id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        sub.status === 'GRADED' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {sub.status === 'GRADED' 
                          ? <CheckCircle className="h-5 w-5 text-green-600" />
                          : <Clock className="h-5 w-5 text-yellow-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{sub.homework_title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">{sub.student_name}</p>
                          {sub.is_late && (
                            <Badge variant="destructive" className="text-xs px-1 py-0">Muộn</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {sub.score !== null ? (
                        <p className="text-sm font-bold text-green-600">{sub.score}/10</p>
                      ) : (
                        <Badge className={getStatusColor(sub.status)}>
                          {sub.status === 'SUBMITTED' ? 'Chờ chấm' : sub.status}
                        </Badge>
                      )}
                      <p className="text-xs text-gray-500">{formatDateTime(sub.submitted_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Học sinh nổi bật</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/students')}>
                Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có học sinh nào</p>
            ) : (
              <div className="space-y-3">
                {students
                  .filter(s => s.average_score !== null)
                  .sort((a, b) => (b.average_score || 0) - (a.average_score || 0))
                  .slice(0, 5)
                  .map((student, index) => (
                    <div 
                      key={student.student_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                        }`}>
                          {index < 3 ? <Award className="h-4 w-4" /> : index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{student.student_name}</p>
                          <p className="text-xs text-gray-500">{student.total_submissions} bài nộp</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-gray-900">{student.average_score?.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                {students.filter(s => s.average_score !== null).length === 0 && (
                  <p className="text-gray-500 text-center py-4">Chưa có điểm nào được chấm</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;
