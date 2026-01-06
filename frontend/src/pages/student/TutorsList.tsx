import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userService } from '@/services/userService';
import { createConversation } from '@/services/conversationService';
import { addConversation, setActiveConversation } from '@/store/slices/messagesSlice';
import type { User } from '@/types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, Loader2, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export function TutorsList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tutors, setTutors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null);

  useEffect(() => {
    fetchTutors();
  }, [page]);

  const fetchTutors = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getTutors(page, 12);
      setTutors(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = async (tutorId: string) => {
    setCreatingConversation(tutorId);
    try {
      const conversation = await createConversation({
        type: 'direct',
        memberIds: [tutorId],
      });

      // Add to store and set as active
      dispatch(addConversation(conversation));
      dispatch(setActiveConversation(conversation));
      // Navigate to messages
      navigate('/student/messages');
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreatingConversation(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredTutors = tutors.filter(
    (tutor) =>
      (tutor.name || tutor.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          Danh sách gia sư
        </h1>
        <p className="text-muted-foreground mt-1">
          Tìm và liên hệ với gia sư để được hỗ trợ học tập
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm gia sư..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tutors Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'Không tìm thấy gia sư phù hợp' : 'Chưa có gia sư nào'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={tutor.avatarUrl || undefined} alt={tutor.name || tutor.displayName} />
                    <AvatarFallback className="text-lg">
                      {getInitials(tutor.name || tutor.displayName || 'TT')}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="font-semibold text-lg">{tutor.name || tutor.displayName}</h3>

                  {tutor.bio && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tutor.bio}</p>
                  )}

                  <Button
                    className="mt-4 w-full"
                    onClick={() => handleStartConversation(tutor.id)}
                    disabled={creatingConversation === tutor.id}
                  >
                    {creatingConversation === tutor.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Nhắn tin
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default TutorsList;
