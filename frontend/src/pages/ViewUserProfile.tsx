/**
 * File: pages/ViewUserProfile.tsx
 * Purpose: Component để xem profile của người dùng khác (tutor xem student, student xem tutor)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, 
  GraduationCap, BookOpen, Star, Calendar
} from 'lucide-react';
import { apiClient } from '../services/api';

interface UserProfile {
  user_id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  avatar_url?: string;
  // Tutor specific fields
  bio?: string;
  experience_years?: number;
  education?: string;
  subjects?: string[];
  rating?: number;
  total_reviews?: number;
  hourly_rate?: number;
  // Student specific fields
  grade_level?: string;
  address?: string;
}

const ViewUserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if viewing student or tutor based on route
  const isViewingStudent = location.pathname.includes('/view-student/');
  const isViewingTutor = location.pathname.includes('/view-tutor/');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        if (isViewingTutor) {
          // Student xem profile gia sư - gọi API tutors
          response = await apiClient.get(`/tutors/my-tutors/${userId}`);
        } else if (isViewingStudent) {
          // Tutor xem profile học viên - gọi API students
          response = await apiClient.get(`/students/${userId}`);
        } else {
          // Fallback - thử users endpoint
          response = await apiClient.get(`/users/${userId}`);
        }
        
        if (response.data) {
          // Map response data to profile format
          const data = response.data.data || response.data;
          setProfile(data);
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isViewingTutor, isViewingStudent]);

  const handleBack = () => {
    navigate(-1);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">{error || 'Không tìm thấy thông tin người dùng'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header với nút quay lại */}
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isViewingStudent ? 'Thông tin học sinh' : isViewingTutor ? 'Thông tin gia sư' : 'Thông tin người dùng'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <Badge className="mt-2" variant={profile.role === 'tutor' ? 'default' : 'secondary'}>
                {profile.role === 'tutor' ? 'Gia sư' : 'Học sinh'}
              </Badge>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                {profile.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{profile.rating.toFixed(1)}</span>
                    {profile.total_reviews && (
                      <span className="text-gray-500">({profile.total_reviews} đánh giá)</span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>

                {profile.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}

                {profile.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.address}</span>
                  </div>
                )}

                {profile.grade_level && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>Lớp {profile.grade_level}</span>
                  </div>
                )}

                {profile.experience_years !== undefined && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{profile.experience_years} năm kinh nghiệm</span>
                  </div>
                )}

                {profile.hourly_rate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium text-green-600">
                      {profile.hourly_rate.toLocaleString('vi-VN')} đ/giờ
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section - for tutors */}
      {profile.bio && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Giới thiệu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Education - for tutors */}
      {profile.education && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Học vấn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{profile.education}</p>
          </CardContent>
        </Card>
      )}

      {/* Subjects - for tutors */}
      {profile.subjects && profile.subjects.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Môn học giảng dạy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.subjects.map((subject, index) => (
                <Badge key={index} variant="outline">
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewUserProfile;
