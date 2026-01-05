import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { User, Mail, Phone, Calendar, School, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

// interface Student {
//   fullName: string;
//   email: string;
//   phone?: string;
//   dateOfBirth?: string;
//   gradeLevel?: number;
//   school?: string;
//   province_name?: string;
//   ward_name?: string;
//   locationDetail?: string;
// }
import { StudentProfile } from '@/types';
interface StudentProfileModalProps {
  student?: StudentProfile | null;
  isLoading?: boolean;
  error?: Error | null; // ✅ Added error prop
  onBack: () => void;
}

// Helper tính tuổi
export const calculateAge = (dateOfBirth?: string) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isLoading,
  error,
  onBack,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải thông tin học viên...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {/* @ts-ignore */}
                {error?.response?.data?.message ||
                  error.message ||
                  'Không thể tải thông tin học viên'}
              </AlertDescription>
            </Alert>
            <Button onClick={onBack} className="w-full mt-4" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay Lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Không tìm thấy thông tin học viên</AlertDescription>
            </Alert>
            <Button onClick={onBack} className="w-full mt-4" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay Lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const age = calculateAge(student.dateOfBirth);

  const personalInfo = [
    { label: 'Họ và tên', value: student.name ?? null, icon: User },
    { label: 'Email', value: student.email ?? null, icon: Mail },
    { label: 'Số điện thoại', value: student.phone ?? 'Chưa cập nhật', icon: Phone },
    {
      label: 'Ngày sinh',
      value: student.dateOfBirth
        ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN')
        : 'Chưa cập nhật',
      icon: Calendar,
    },
    { label: 'Tuổi', value: age ? `${age} tuổi` : null },
  ];

  const educationInfo = [
    {
      label: 'Khối lớp',
      value: student.gradeLevel ? `${student.gradeLevel} năm` : 'Chưa cập nhật',
      icon: School,
    },
    { label: 'Trường học', value: student.school ?? 'Chưa cập nhật', icon: School },
  ];

  const addressInfo = [
    { label: 'Tỉnh/Thành phố', value: student.province_name || 'Chưa cập nhật' },
    { label: 'Quận/Huyện', value: student.district_name || 'Chưa cập nhật' },
    { label: 'Xã', value: student.ward_name || 'Chưa cập nhật' },
    student.locationDetail && { label: 'Chi tiết địa chỉ', value: student.locationDetail },
  ].filter(Boolean) as { label: string; value: string }[];

  const renderInfoCard = (
    title: string,
    infoList: Array<{ label: string; value: string | null; icon?: React.ElementType }>
  ) => (
    <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {infoList.map(
          (item, idx) =>
            item.value && (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                {item.icon && <item.icon className="h-5 w-5 text-blue-600 flex-shrink-0" />}
                <div className="flex-1">
                  <span className="text-sm text-gray-600 block">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              </div>
            )
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={onBack} 
            variant="outline" 
            size="lg"
            className="rounded-full border-2 hover:bg-white hover:border-blue-400 transition-all"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay Lại
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {student.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{student.name}</h1>
                <p className="text-lg text-gray-600 mb-4">Thông Tin Chi Tiết Học Viên</p>
                <div className="flex flex-wrap gap-3">
                  {student.email && (
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm text-blue-700">
                      <Mail className="h-4 w-4" />
                      {student.email}
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full text-sm text-green-700">
                      <Phone className="h-4 w-4" />
                      {student.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
        {renderInfoCard('Thông Tin Cá Nhân', personalInfo)}
        {renderInfoCard('Thông Tin Học Tập', educationInfo)}
        </div>

        {/* Address Card */}
        {renderInfoCard('Địa Chỉ', addressInfo)}
      </div>
    </div>
  );
};

export default StudentProfileModal;
