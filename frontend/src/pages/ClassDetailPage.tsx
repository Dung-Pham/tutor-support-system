/**
 * File: pages/ClassDetailPage.tsx
 * Purpose: Chi tiết lớp học với thông tin cơ bản, thống kê và timeline buổi học
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  ArrowLeft, Calendar, Clock, User, BookOpen, 
  CheckCircle2, Circle, Plus, Edit2, Save, X, Trash2
} from 'lucide-react';
import { apiClient } from '../services/api';

interface ClassInfo {
  class_id: string;
  tutor_id: string;
  student_id: string;
  name: string;
  description: string;
  subject: string;
  subject_name?: string;
  grade_level: string;
  start_date: string;
  end_date: string;
  status: string;
  tutor_name: string;
  student_name: string;
  sessions_per_week?: number;
  hourly_price?: number;
}

interface LessonPlan {
  lesson_plan_id: string;
  class_id: string;
  lesson_number: number;
  session_date: string;
  topic: string;
  description?: string;
  status: 'planned' | 'completed' | 'cancelled';
}

interface ClassStats {
  total_lessons: number;
  completed_lessons: number;
  planned_lessons: number;
  total_homework: number;
  completed_homework: number;
}

interface ClassDetailPageProps {
  onTabChange?: (tab: string) => void;
}

export const ClassDetailPage: React.FC<ClassDetailPageProps> = ({ onTabChange }) => {
  const { classId: routeClassId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // ✅ Lấy classId từ route params hoặc sessionStorage
  const classId = routeClassId || sessionStorage.getItem('currentClassId');
  
  // Get base route based on user role
  const baseRoute = user?.role?.toLowerCase() === 'tutor' ? '/tutor' : '/student';
  
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For editing/adding lesson plans
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ topic: '', description: '', session_date: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newLesson, setNewLesson] = useState({ topic: '', description: '', session_date: '' });

  const isTutor = user?.role?.toLowerCase() === 'tutor';

  // ✅ Hàm quay lại
  const handleBack = () => {
    sessionStorage.removeItem('currentClassId');
    if (onTabChange) {
      // Quay lại trang tìm lớp nếu là gia sư
      onTabChange(isTutor ? 'search' : 'my-classes');
    } else {
      navigate(`${baseRoute}/classes`);
    }
  };

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load class info
      const classResponse = await apiClient.get(`/classes/${classId}`);
      const foundClass = classResponse.data.data;
      
      if (foundClass) {
        setClassInfo(foundClass);
      }

      // Load lesson plans and sort by date (newest first)
      const lessonResponse = await apiClient.get(`/lesson-plans/class/${classId}`);
      const lessons = lessonResponse.data.data || [];
      // Sort by session_date descending (newest first)
      const sortedLessons = lessons.sort((a: LessonPlan, b: LessonPlan) => 
        new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
      );
      setLessonPlans(sortedLessons);

      // Load statistics
      const statsResponse = await apiClient.get(`/lesson-plans/stats/${classId}`);
      setStats(statsResponse.data.data);

    } catch (err) {
      console.error('Error loading class data:', err);
      setError('Không thể tải thông tin lớp học');
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
      case 'recruiting':
        return 'Đang tuyển';
      default:
        return status;
    }
  };

  // Check if lesson date is today or in the past
  const isLessonClickable = (lessonDate: string | Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lessonDateObj = new Date(lessonDate);
    lessonDateObj.setHours(0, 0, 0, 0);
    return lessonDateObj <= today;
  };

  // Navigate to session detail with the lesson date
  const handleLessonClick = async (lesson: LessonPlan) => {
    if (!isLessonClickable(lesson.session_date)) return;
    
    try {
      // Navigate to session detail page with lesson date as parameter
      // The session detail page will look up the corresponding schedule based on date and class
      navigate(`${baseRoute}/sessions/${classId}?date=${lesson.session_date}`);
    } catch (err) {
      console.error('Error navigating to lesson:', err);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.topic || !newLesson.session_date) return;

    try {
      const response = await apiClient.post('/lesson-plans', {
        class_id: classId,
        lesson_number: lessonPlans.length + 1,
        session_date: newLesson.session_date,
        topic: newLesson.topic,
        description: newLesson.description,
        status: 'planned'
      });

      setLessonPlans([...lessonPlans, response.data.data]);
      setNewLesson({ topic: '', description: '', session_date: '' });
      setIsAdding(false);
      loadClassData(); // Refresh stats
    } catch (err) {
      console.error('Error adding lesson:', err);
    }
  };

  const handleUpdateLesson = async (lessonId: string) => {
    try {
      await apiClient.put(`/lesson-plans/${lessonId}`, editForm);
      setEditingId(null);
      loadClassData();
    } catch (err) {
      console.error('Error updating lesson:', err);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Bạn có chắc muốn xóa buổi học này?')) return;

    try {
      await apiClient.delete(`/lesson-plans/${lessonId}`);
      loadClassData();
    } catch (err) {
      console.error('Error deleting lesson:', err);
    }
  };

  const handleToggleComplete = async (lesson: LessonPlan) => {
    try {
      const newStatus = lesson.status === 'completed' ? 'planned' : 'completed';
      await apiClient.put(`/lesson-plans/${lesson.lesson_plan_id}`, { status: newStatus });
      loadClassData();
    } catch (err) {
      console.error('Error toggling lesson status:', err);
    }
  };

  const startEdit = (lesson: LessonPlan) => {
    setEditingId(lesson.lesson_plan_id);
    setEditForm({
      topic: lesson.topic,
      description: lesson.description || '',
      session_date: lesson.session_date.split('T')[0]
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    );
  }

  if (error || !classInfo) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ {error || 'Không tìm thấy lớp học'}</div>
          <Button onClick={() => handleBack()} variant="outline">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => handleBack()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      {/* Class Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{classInfo.name}</CardTitle>
              <p className="text-gray-600 mt-1">{classInfo.description}</p>
            </div>
            <Badge className={getStatusColor(classInfo.status)}>
              {getStatusText(classInfo.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{classInfo.subject_name || classInfo.subject}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {new Date(classInfo.start_date).toLocaleDateString('vi-VN')} - {new Date(classInfo.end_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {isTutor ? `Học sinh: ${classInfo.student_name || 'Chưa có'}` : `Gia sư: ${classInfo.tutor_name || 'Chưa có'}`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{classInfo.sessions_per_week || 0} buổi/tuần</span>
            </div>
          </div>
          
          {/* Nút xem hồ sơ - tách riêng, đẹp hơn */}
          {isTutor && classInfo.student_id && classId && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => navigate(`/tutor/view-student/${classId}`)}
              >
                <User className="h-4 w-4 mr-2" />
                Xem hồ sơ học viên
              </Button>
            </div>
          )}
          {!isTutor && classInfo.tutor_id && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => navigate(`/student/view-tutor/${classInfo.tutor_id}`)}
              >
                <User className="h-4 w-4 mr-2" />
                Xem hồ sơ gia sư
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê lớp học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tiến độ học tập */}
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="mb-4">
                <div className="text-4xl font-bold text-blue-600">
                  {stats?.total_lessons ? Math.round((stats.completed_lessons / stats.total_lessons) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600 mt-2">Tiến độ học tập</div>
              </div>
              <div className="text-xs text-gray-500">
                {stats?.completed_lessons || 0}/{stats?.total_lessons || 0} buổi đã hoàn thành
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.total_lessons ? (stats.completed_lessons / stats.total_lessons) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Bài tập hoàn thành */}
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="mb-4">
                <div className="text-4xl font-bold text-green-600">
                  {stats?.total_homework || 0}
                </div>
                <div className="text-sm text-gray-600 mt-2">Bài tập đã hoàn thành</div>
              </div>
              <div className="text-xs text-gray-500">
                {stats?.completed_homework || 0}/{stats?.total_homework || 0} bài tập
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.total_homework ? (stats.completed_homework / stats.total_homework) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kế hoạch buổi học</CardTitle>
            {isTutor && (
              <Button size="sm" onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Thêm buổi học
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Add new lesson form */}
          {isAdding && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Thêm buổi học mới</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  type="date"
                  value={newLesson.session_date}
                  onChange={(e) => setNewLesson({ ...newLesson, session_date: e.target.value })}
                  placeholder="Ngày học"
                />
                <Input
                  value={newLesson.topic}
                  onChange={(e) => setNewLesson({ ...newLesson, topic: e.target.value })}
                  placeholder="Nội dung buổi học"
                />
                <Input
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  placeholder="Mô tả (tùy chọn)"
                />
              </div>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" onClick={handleAddLesson}>
                  <Save className="h-4 w-4 mr-1" />
                  Lưu
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {/* Timeline */}
          {lessonPlans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có kế hoạch buổi học nào</p>
              {isTutor && <p className="text-sm mt-2">Nhấn "Thêm buổi học" để bắt đầu lên kế hoạch</p>}
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Timeline items */}
              <div className="space-y-4">
                {lessonPlans.map((lesson) => (
                  <div key={lesson.lesson_plan_id} className="relative flex items-start pl-10">
                    {/* Timeline icon */}
                    <div 
                      className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                        lesson.status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-green-500'
                      }`}
                      onClick={() => isTutor && handleToggleComplete(lesson)}
                      title={isTutor ? 'Click để đánh dấu hoàn thành/chưa hoàn thành' : ''}
                    >
                      {lesson.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div 
                      className={`flex-1 p-4 rounded-lg border transition-all ${
                        isLessonClickable(lesson.session_date)
                          ? 'cursor-pointer hover:shadow-md'
                          : 'cursor-not-allowed opacity-70'
                      } ${
                        lesson.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                      onClick={() => isLessonClickable(lesson.session_date) && handleLessonClick(lesson)}
                    >
                      {editingId === lesson.lesson_plan_id ? (
                        // Edit mode
                        <div className="space-y-2">
                          <Input
                            type="date"
                            value={editForm.session_date}
                            onChange={(e) => setEditForm({ ...editForm, session_date: e.target.value })}
                          />
                          <Input
                            value={editForm.topic}
                            onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                            placeholder="Nội dung buổi học"
                          />
                          <Input
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Mô tả"
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleUpdateLesson(lesson.lesson_plan_id)}>
                              <Save className="h-4 w-4 mr-1" />
                              Lưu
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4 mr-1" />
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div 
                          className="flex items-start justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded p-2 -mx-2"
                          onClick={() => {
                            // Tìm schedule có session_date gần nhất với lesson plan
                            // Chuyển hướng đến session detail nếu có schedule_id
                            // Hiện tại chưa có trực tiếp mapping, có thể mở modal hoặc chuyển hướng
                            // navigate(`/sessions/${lesson.lesson_plan_id}`);
                          }}
                        >
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-500">
                                Buổi {lesson.lesson_number}
                              </span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">
                                {new Date(lesson.session_date).toLocaleDateString('vi-VN', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <h4 className={`font-medium mt-1 ${
                              lesson.status === 'completed' ? 'text-green-800' : 'text-gray-900'
                            }`}>
                              {lesson.topic}
                            </h4>
                            {lesson.description && (
                              <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                            )}
                          </div>
                          {isTutor && (
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => startEdit(lesson)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteLesson(lesson.lesson_plan_id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassDetailPage;
