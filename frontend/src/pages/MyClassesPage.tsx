/**
 * File: pages/MyClassesPage.tsx
 * Purpose: Trang hiển thị danh sách lớp học của student hoặc danh sách lớp dạy của tutor
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, Users, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

interface ClassInfo {
  class_id: string;
  tutor_id: string;
  client_id: string;
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  start_date: string;
  end_date: string;
  status: string;
  tutor_name: string;
  client_name: string;
  session_count?: number;
}

export const MyClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get base route based on user role
  const baseRoute = user?.role?.toLowerCase() === 'tutor' ? '/tutor' : '/student';

  useEffect(() => {
    const userId = user?.user_id || user?.id;
    if (userId) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = async () => {
    const userId = user?.user_id || user?.id;
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/classes/my-classes');
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Error loading classes:', err);
      setError('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Đang học';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách lớp học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <Button onClick={loadClasses} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'student' ? 'Lớp học của tôi' : 'Lớp học đang dạy'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'student'
              ? 'Danh sách các lớp học bạn đang tham gia'
              : 'Danh sách các lớp học bạn đang dạy'
            }
          </p>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {user?.role === 'student' ? 'Chưa tham gia lớp học nào' : 'Chưa có lớp học nào'}
          </h3>
          <p className="mt-2 text-gray-500">
            {user?.role === 'student'
              ? 'Bạn chưa đăng ký tham gia lớp học nào.'
              : 'Bạn chưa được phân công dạy lớp nào.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classInfo) => (
            <Card key={classInfo.class_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{classInfo.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{classInfo.description}</p>
                  </div>
                  <Badge className={getStatusColor(classInfo.status)}>
                    {getStatusText(classInfo.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{classInfo.subject}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{classInfo.grade_level}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(classInfo.start_date).toLocaleDateString('vi-VN')} -
                    {new Date(classInfo.end_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {user?.role === 'student' ? (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Gia sư: {classInfo.tutor_name}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Học sinh: {classInfo.client_name}</span>
                  </div>
                )}

                {classInfo.session_count && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{classInfo.session_count} buổi học</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate(`${baseRoute}/class-detail/${classInfo.class_id}`)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClassesPage;
