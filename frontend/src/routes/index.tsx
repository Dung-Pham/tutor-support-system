import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import StudentRegistrationPage from '../pages/public/StudentRegistrationPage';
import TutorRegistrationPage from '../pages/public/TutorRegistrationPage';
import PublicLayout from '../pages/public/PublicLayout';
import CommunityPosts from '../pages/public/CommunityPosts';
import PostDetailPage from '../pages/public/PostDetail';
import NotFound from '../pages/public/NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

// Teaching Module Pages (from HEAD)
import RegisterPage from '../pages/RegisterPage';
import SchedulePage from '../pages/SchedulePage';
import MyClassesPage from '../pages/MyClassesPage';
import { ClassDetailPage } from '../pages/ClassDetailPage';
import SessionDetailPage from '../pages/SessionDetailPage';
import AssignmentsPage from '../pages/AssignmentsPage';
import SubmitAssignmentPage from '../pages/SubmitAssignmentPage';
import SubmissionsPage from '../pages/SubmissionsPage';
import DocumentsPage from '../pages/DocumentsPage';
import StudentHomeworkPage from '../pages/StudentHomeworkPage';
import TutorHomeworkPage from '../pages/TutorHomeworkPage';
import HomeworkDetailPage from '../pages/HomeworkDetailPage';
import StudentHomeworkDetailPage from '../pages/StudentHomeworkDetailPage';
import StudentsPage from '../pages/StudentsPage';
import StatisticsDashboard from '../pages/StatisticsDashboard';

// === LAZY LOADED PAGES ===

// Student pages
const StudentLayout = lazy(() =>
  import('@/pages/Student/StudentLayout').then((m) => ({ default: m.StudentLayout }))
);
const StudentMessages = lazy(() => import('@/pages/Student/StudentMessages'));
const TutorsPage = lazy(() => import('@/pages/TutorsPage'));

// Student pages from quynh
const ManageClassesPage = lazy(() => import('@/pages/Student/ManageClassesPage'));
const ViewTutorsPage = lazy(() => import('@/pages/Student/ViewTutorsPage'));
const FavoritesPage = lazy(() => import('@/pages/Student/FavoritesPage'));
const StudentClassDetailQuynh = lazy(() => import('@/pages/Student/ClassDetailPage'));
const CreateClassPage = lazy(() => import('@/components/Student/CreateClassPage'));

// Profile managers
const TutorProfileManager = lazy(() => import('@/components/TutorProfile/TutorProfileManager'));
const StudentProfileManager = lazy(() => import('@/components/StudentProfile/StudentProfileManager'));
const ViewUserProfile = lazy(() => import('@/pages/ViewUserProfile'));
const ViewStudentProfilePage = lazy(() => import('@/pages/Tutor/ViewStudentProfilePage'));

// Notifications page
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));

// Tutor pages
const TutorLayout = lazy(() =>
  import('@/pages/Tutor/TutorLayout').then((m) => ({ default: m.TutorLayout }))
);
const CreatePost = lazy(() => import('@/pages/Tutor/CreatePost'));
const MyPosts = lazy(() => import('@/pages/Tutor/MyPosts'));
const TutorMessages = lazy(() => import('@/pages/Tutor/TutorMessages'));

// Tutor pages from quynh
const SearchPage = lazy(() => import('@/pages/Tutor/SearchPage'));
const ManageApplicationsPage = lazy(() => import('@/pages/Tutor/ManageApplicationsPage'));
const TutorClassDetailQuynh = lazy(() => import('@/pages/Tutor/ClassDetailPage'));
const TutorManageClassesPage = lazy(() => import('@/components/TutorClasses/TutorClassesList'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/student" element={<StudentRegistrationPage />} />
      <Route path="/register/tutor" element={<TutorRegistrationPage />} />

      {/* Public posts with layout (Header + Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/posts" element={<CommunityPosts />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/posts/:id/:slug" element={<PostDetailPage />} />
      </Route>

      {/* ========== STUDENT ROUTES - All in one layout ========== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
          <Route
            path="/student"
            element={
              <Suspense fallback={<PageLoader />}>
                <StudentLayout />
              </Suspense>
            }
          >
            {/* Dashboard / Home */}
            <Route index element={<CommunityPosts />} />
            
            {/* Social Module */}
            <Route path="posts" element={<CommunityPosts />} />
            <Route path="posts/:id" element={<PostDetailPage />} />
            <Route path="posts/:id/:slug" element={<PostDetailPage />} />
            <Route
              path="tutors"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorsPage />
                </Suspense>
              }
            />
            <Route
              path="messages"
              element={
                <Suspense fallback={<PageLoader />}>
                  <StudentMessages />
                </Suspense>
              }
            />
            <Route
              path="messages/:conversationId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <StudentMessages />
                </Suspense>
              }
            />
            
            {/* Teaching Module - Student */}
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="classes" element={<MyClassesPage />} />
            <Route path="class-detail/:classId" element={<ClassDetailPage />} />
            <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="assignments/:assignmentId/submit" element={<SubmitAssignmentPage />} />
            <Route path="homework" element={<StudentHomeworkPage />} />
            <Route path="homework/:assignmentId" element={<StudentHomeworkDetailPage />} />
            
            {/* Student Profile */}
            <Route
              path="profile"
              element={
                <Suspense fallback={<PageLoader />}>
                  <StudentProfileManager />
                </Suspense>
              }
            />
            
            {/* Student Management pages from quynh */}
            <Route
              path="manage-classes"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ManageClassesPage />
                </Suspense>
              }
            />
            <Route
              path="create-class"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CreateClassPage />
                </Suspense>
              }
            />
            <Route
              path="view-tutors"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ViewTutorsPage />
                </Suspense>
              }
            />
            <Route
              path="favorites"
              element={
                <Suspense fallback={<PageLoader />}>
                  <FavoritesPage />
                </Suspense>
              }
            />
            <Route
              path="class-detail-manage/:classId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <StudentClassDetailQuynh />
                </Suspense>
              }
            />
            
            {/* View Tutor Profile */}
            <Route
              path="view-tutor/:userId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ViewUserProfile />
                </Suspense>
              }
            />
            
            {/* Notifications */}
            <Route
              path="notifications"
              element={
                <Suspense fallback={<PageLoader />}>
                  <NotificationsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>

      {/* ========== TUTOR ROUTES - All in one layout ========== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={['tutor']} />}>
          <Route
            path="/tutor"
            element={
              <Suspense fallback={<PageLoader />}>
                <TutorLayout />
              </Suspense>
            }
          >
            {/* Dashboard / Home */}
            <Route index element={<CommunityPosts />} />
            
            {/* Social Module */}
            <Route path="posts" element={<CommunityPosts />} />
            <Route path="posts/:id" element={<PostDetailPage />} />
            <Route path="posts/:id/:slug" element={<PostDetailPage />} />
            <Route
              path="create-post"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CreatePost />
                </Suspense>
              }
            />
            <Route
              path="edit-post/:postId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CreatePost />
                </Suspense>
              }
            />
            <Route
              path="my-posts"
              element={
                <Suspense fallback={<PageLoader />}>
                  <MyPosts />
                </Suspense>
              }
            />
            <Route
              path="messages"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorMessages />
                </Suspense>
              }
            />
            <Route
              path="messages/:conversationId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorMessages />
                </Suspense>
              }
            />
            
            {/* Teaching Module - Tutor */}
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="classes" element={<MyClassesPage />} />
            <Route path="class-detail/:classId" element={<ClassDetailPage />} />
            <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="homework" element={<TutorHomeworkPage />} />
            <Route path="homework/:homeworkId" element={<HomeworkDetailPage />} />
            <Route path="assignments/:assignmentId/submissions" element={<SubmissionsPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="statistics" element={<StatisticsDashboard />} />
            
            {/* Tutor Profile */}
            <Route
              path="profile"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorProfileManager />
                </Suspense>
              }
            />
            
            {/* Tutor Management pages from quynh */}
            <Route
              path="manage-classes"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorManageClassesPage />
                </Suspense>
              }
            />
            <Route
              path="search"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SearchPage />
                </Suspense>
              }
            />
            <Route
              path="applications"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ManageApplicationsPage />
                </Suspense>
              }
            />
            <Route
              path="class-detail-search/:classId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorClassDetailQuynh />
                </Suspense>
              }
            />
            <Route
              path="class-detail"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TutorClassDetailQuynh />
                </Suspense>
              }
            />
            
            {/* View Student Profile by classId */}
            <Route
              path="view-student/:classId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ViewStudentProfilePage />
                </Suspense>
              }
            />
            
            {/* Notifications */}
            <Route
              path="notifications"
              element={
                <Suspense fallback={<PageLoader />}>
                  <NotificationsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>

      {/* Unauthorized page */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
              <p className="text-gray-600">Bạn không có quyền truy cập vào trang này.</p>
            </div>
          </div>
        }
      />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
