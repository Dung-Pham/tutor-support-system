/**
 * File: pages/StudentsPage.tsx
 * Mục đích: Trang quản lý danh sách học sinh của gia sư
 * Vai trò:
 *   - Hiển thị danh sách tất cả học viên của tutor
 *   - Thông tin cơ bản, môn học, lớp học
 *   - Thông tin liên lạc
 *   - Button chuyển đến nhắn tin
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Search,
  Filter,
  MessageCircle,
  Mail,
  Phone,
  User,
  BookOpen,
  Users,
  GraduationCap,
} from 'lucide-react';

interface StudentClass {
  class_id: string;
  subject_name: string;
  grade_level: number;
  status: string;
  start_date: string;
  end_date: string;
}

interface Student {
  student_id: string;
  student_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  status: string;
  classes: StudentClass[];
  total_classes: number;
  active_classes: number;
}

export const StudentsPage: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách học sinh');
      }

      const data = await response.json();
      setStudents(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) {
      fetchStudents();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/students/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tìm kiếm học sinh');
      }

      const data = await response.json();
      setStudents(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (studentId: string) => {
    // TODO: Navigate to chat with this student
    console.log('Open chat with student:', studentId);
    // window.location.href = `/messages/${studentId}`;
    alert('Chức năng nhắn tin đang được phát triển');
  };

  // Get all unique subjects from students
  const allSubjects = React.useMemo(() => {
    const subjects = new Set<string>();
    students.forEach(student => {
      student.classes.forEach(cls => {
        if (cls.subject_name) subjects.add(cls.subject_name);
      });
    });
    return Array.from(subjects).sort();
  }, [students]);

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      // Search by name, email, phone
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const matchName = student.student_name.toLowerCase().includes(search);
        const matchEmail = student.email?.toLowerCase().includes(search);
        const matchPhone = student.phone?.includes(search);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      // Filter by status
      if (filterStatus === 'active' && student.active_classes === 0) {
        return false;
      }
      if (filterStatus === 'completed' && student.active_classes > 0) {
        return false;
      }
      // Filter by subject
      if (filterSubject !== 'all') {
        const hasSubject = student.classes.some(cls => cls.subject_name === filterSubject);
        if (!hasSubject) return false;
      }
      return true;
    })
    .sort((a, b) => a.student_name.localeCompare(b.student_name));

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color based on name for avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Đang học</Badge>;
      case 'completed':
        return <Badge variant="secondary">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách học sinh...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchStudents}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        Học sinh
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Học sinh</h1>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Subject Filter Dropdown */}
        <div className="relative">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              setShowSubjectDropdown(!showSubjectDropdown);
              setShowStatusDropdown(false);
            }}
          >
            <Filter className="h-4 w-4" />
            {filterSubject === 'all' ? 'Môn học' : filterSubject}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          {showSubjectDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px] max-h-[300px] overflow-y-auto">
              <button
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterSubject === 'all' ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => { setFilterSubject('all'); setShowSubjectDropdown(false); }}
              >
                Tất cả môn học
              </button>
              {allSubjects.map(subject => (
                <button
                  key={subject}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterSubject === subject ? 'bg-blue-50 text-blue-600' : ''}`}
                  onClick={() => { setFilterSubject(subject); setShowSubjectDropdown(false); }}
                >
                  {subject}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowSubjectDropdown(false);
            }}
          >
            <Filter className="h-4 w-4" />
            {filterStatus === 'all' ? 'Trạng thái' : filterStatus === 'active' ? 'Đang học' : 'Đã kết thúc'}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
              <button
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterStatus === 'all' ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => { setFilterStatus('all'); setShowStatusDropdown(false); }}
              >
                Tất cả
              </button>
              <button
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterStatus === 'active' ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => { setFilterStatus('active'); setShowStatusDropdown(false); }}
              >
                Đang học
              </button>
              <button
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterStatus === 'completed' ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => { setFilterStatus('completed'); setShowStatusDropdown(false); }}
              >
                Đã kết thúc
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
          <div className="col-span-4">Tên học sinh</div>
          <div className="col-span-3">Liên hệ</div>
          <div className="col-span-3">Lớp học</div>
          <div className="col-span-2">Trạng thái</div>
        </div>

        {/* Student List */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có học sinh nào</h3>
            <p className="text-gray-600">Học sinh sẽ xuất hiện khi bạn có lớp học</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <div 
                key={student.student_id} 
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
              >
                {/* Name Column */}
                <div className="col-span-4 flex items-center gap-3">
                  {/* Avatar */}
                  {student.avatar_url ? (
                    <img 
                      src={student.avatar_url} 
                      alt={student.student_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`h-10 w-10 rounded-full ${getAvatarColor(student.student_name)} flex items-center justify-center text-white font-medium text-sm`}>
                      {getInitials(student.student_name)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{student.student_name}</div>
                    <div className="text-sm text-gray-500">
                      {student.active_classes} lớp đang học
                    </div>
                  </div>
                </div>

                {/* Contact Column */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{student.phone || 'Chưa có'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer">
                    <Mail className="h-3.5 w-3.5" />
                    <a href={`mailto:${student.email}`}>{student.email}</a>
                  </div>
                </div>

                {/* Classes Column */}
                <div className="col-span-3">
                  {student.classes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {student.classes.slice(0, 2).map((cls, index) => (
                        <Badge 
                          key={cls.class_id} 
                          variant={cls.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {cls.subject_name}
                        </Badge>
                      ))}
                      {student.classes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.classes.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Không có lớp</span>
                  )}
                </div>

                {/* Status & Action Column */}
                <div className="col-span-2 flex items-center justify-between">
                  {student.active_classes > 0 ? (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Đang học</Badge>
                  ) : (
                    <Badge variant="secondary">Đã kết thúc</Badge>
                  )}
                  
                  {/* Message Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMessage(student.student_id)}
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    title="Nhắn tin"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="text-sm text-gray-500">
        Tổng cộng {filteredStudents.length} học sinh
      </div>
    </div>
  );
};

export default StudentsPage;
