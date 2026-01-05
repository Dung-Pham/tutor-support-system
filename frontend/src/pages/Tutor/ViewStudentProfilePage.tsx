/**
 * File: pages/Tutor/ViewStudentProfilePage.tsx
 * Purpose: Trang xem chi tiết hồ sơ học viên cho gia sư
 * Sử dụng StudentProfileModal component
 * 
 * Sử dụng API: GET /api/tutor/classes/:classId/student
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import StudentProfileModal from '@/Components/TutorClasses/StudentProfileModal';
import { StudentProfile } from '@/types';

const ViewStudentProfilePage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  // Lấy classId từ URL params hoặc sessionStorage
  const effectiveClassId = classId || sessionStorage.getItem('currentClassId');

  const {
    data: studentProfile,
    isLoading,
    error,
  } = useQuery<StudentProfile>({
    queryKey: ['studentProfile', effectiveClassId],
    queryFn: async () => {
      if (!effectiveClassId) {
        throw new Error('Không tìm thấy ID lớp học');
      }
      // Gọi API lấy thông tin học viên của lớp
      const response = await apiService.get(`/tutor/classes/${effectiveClassId}/student`);
      return response;
    },
    enabled: Boolean(effectiveClassId),
  });

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <StudentProfileModal
      student={studentProfile}
      isLoading={isLoading}
      error={error as Error | null}
      onBack={handleBack}
    />
  );
};

export default ViewStudentProfilePage;
