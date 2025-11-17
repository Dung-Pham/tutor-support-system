# Frontend - Hỗ Trợ Quá Trình Dạy Học Module

## 🎯 Module Overview

Module "Hỗ trợ quá trình dạy học" giúp Gia sư và Học viên quản lý lịch học, bài tập, điểm danh, và đánh giá.

### ✅ Completed Features (90%)

#### 1. **Schedule Management** (Quản lý Lịch học)
- ✅ Weekly/Monthly calendar view
- ✅ Session list with status badges
- ✅ Click to view session detail
- ✅ Auto-highlight today's sessions

**Pages:** `SchedulePage.tsx`  
**Components:** `ScheduleCalendar.tsx`, `SessionCard.tsx`

#### 2. **Session Detail & Attendance** (Chi tiết Buổi học & Điểm danh)
- ✅ Session information display
- ✅ Two-way attendance confirmation (User + Tutor)
- ✅ Notes for each party
- ✅ Meeting link integration

**Pages:** `SessionDetailPage.tsx`  
**Components:** `AttendanceWidget.tsx`

#### 3. **Assignment Management** (Quản lý Bài tập)
- ✅ Create assignment (Tutor) with file attachments
- ✅ View assignments list (Student)
- ✅ Due date tracking with overdue highlighting
- ✅ Submission count display (Tutor)

**Pages:** `AssignmentsPage.tsx`  
**Components:** `AssignmentForm.tsx`

#### 4. **Assignment Submission** (Nộp bài tập)
- ✅ Submit files (Student)
- ✅ Add comments to submission
- ✅ Re-submit before due date
- ✅ File validation (type, size)

**Pages:** `SubmitAssignmentPage.tsx`  
**Components:** `SubmissionForm.tsx`, `FileUploader.tsx`

#### 5. **Grading** (Chấm điểm)
- ✅ View all submissions (Tutor)
- ✅ Grade individual submissions
- ✅ Add feedback
- ✅ Update grades

**Pages:** `SubmissionsPage.tsx`  
**Components:** `GradeForm.tsx`

---

## 📁 File Structure

```
frontend/src/
├── types/               # TypeScript type definitions
│   ├── session.ts
│   ├── assignment.ts
│   ├── submission.ts
│   ├── material.ts
│   ├── note.ts
│   └── attendance.ts
├── services/            # API service layer
│   ├── sessionService.ts
│   ├── assignmentService.ts
│   ├── submissionService.ts
│   ├── materialsService.ts
│   ├── noteService.ts
│   └── attendanceService.ts
├── store/slices/        # Redux slices
│   ├── sessionsSlice.ts
│   ├── assignmentsSlice.ts
│   └── submissionsSlice.ts
├── components/          # Reusable components
│   ├── ScheduleCalendar.tsx
│   ├── SessionCard.tsx
│   ├── AttendanceWidget.tsx
│   ├── AssignmentForm.tsx
│   ├── SubmissionForm.tsx
│   ├── GradeForm.tsx
│   └── FileUploader.tsx
├── pages/               # Page components
│   ├── SchedulePage.tsx
│   ├── SessionDetailPage.tsx
│   ├── AssignmentsPage.tsx
│   ├── SubmitAssignmentPage.tsx
│   └── SubmissionsPage.tsx
├── utils/               # Helper utilities
│   ├── dateHelper.ts
│   ├── fileHelper.ts
│   └── constants.ts
└── App.tsx              # Routing configuration
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Install shadcn/ui Components (Required)
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add progress
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Start Development Server
```bash
npm run dev
```

---

## 🔌 API Integration

All API calls use `apiClient` from `src/services/api.ts` which:
- ✅ Auto-adds Bearer token from localStorage
- ✅ Redirects to /login on 401 errors
- ✅ Base URL from `VITE_API_URL` env variable

### Backend Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sessions` | GET | Fetch sessions list |
| `/api/sessions/:id` | GET | Get session detail |
| `/api/schedules/calendar` | GET | Calendar view (week/month) |
| `/api/attendance/schedule/:id` | GET | Get/create attendance |
| `/api/attendance/:id/confirm` | POST | Confirm attendance |
| `/api/assignments` | GET, POST | List/create assignments |
| `/api/assignments/:id` | GET | Get assignment detail |
| `/api/assignments/:id/submit` | POST | Submit assignment |
| `/api/assignments/:id/submissions` | GET | List submissions |
| `/api/submissions/:id/grade` | POST | Grade submission |

---

## 📊 State Management

Using **Redux Toolkit** with async thunks:

### Sessions Slice
```typescript
// Fetch sessions
dispatch(fetchSessions({ userId, startDate, endDate }));

// Fetch calendar view
dispatch(fetchCalendarView({ userId, userRole, viewType, date }));

// Get session detail
dispatch(fetchSessionById(sessionId));
```

### Assignments Slice
```typescript
// Fetch assignments
dispatch(fetchAssignments({ classId, tutorId }));

// Create assignment
dispatch(createAssignment(data));
```

### Submissions Slice
```typescript
// Fetch submissions
dispatch(fetchSubmissionsByAssignment(assignmentId));

// Submit assignment
dispatch(submitAssignment({ assignmentId, data }));

// Grade submission
dispatch(gradeSubmission({ submissionId, data }));
```

---

## 🧩 Component Usage

### ScheduleCalendar
```tsx
<ScheduleCalendar
  sessions={sessions}
  viewType="week"
  currentDate={new Date()}
  onDateChange={(date) => setCurrentDate(date)}
  onSessionClick={(session) => navigate(`/sessions/${session.id}`)}
/>
```

### AttendanceWidget
```tsx
<AttendanceWidget
  attendance={attendanceRecord}
  userRole="tutor"
  onConfirm={async (notes) => {
    await confirmAttendance(attendanceId, { confirmedBy: 'tutor', notes });
  }}
/>
```

### FileUploader
```tsx
<FileUploader
  onFilesSelected={(files) => setSelectedFiles(files)}
  maxFiles={5}
  allowedTypes={ALLOWED_FILE_TYPES.all}
/>
```

---

## 🎨 UI/UX Guidelines

### Design System
- **Framework:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Colors:** Semantic (success=green, error=red, info=blue, warning=yellow)

### Status Colors
```typescript
// Session Status
scheduled: 'bg-blue-100 text-blue-800'
in_progress: 'bg-green-100 text-green-800'
completed: 'bg-gray-100 text-gray-800'
cancelled: 'bg-red-100 text-red-800'

// Assignment Status
draft: 'bg-yellow-100 text-yellow-800'
published: 'bg-blue-100 text-blue-800'
closed: 'bg-gray-100 text-gray-800'

// Submission Status
pending: 'bg-yellow-100 text-yellow-800'
submitted: 'bg-blue-100 text-blue-800'
graded: 'bg-green-100 text-green-800'
late: 'bg-red-100 text-red-800'
```

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🔧 Backend Requirements

### Required Backend Endpoints (Not Yet Implemented)

If these endpoints don't exist in backend, need to add:

1. **POST /api/assignments** - Create assignment
2. **POST /api/assignments/:id/submit** - Submit assignment
3. **POST /api/submissions/:id/grade** - Grade submission
4. **POST /api/materials/upload** - Upload material
5. **POST /api/notes** - Create session note
6. **GET /api/sessions/:id/notes** - Get session notes

---

## 🐛 Troubleshooting

### TypeScript Errors
```bash
# Rebuild types
npm run build
```

### shadcn/ui Components Missing
```bash
# Install all required components
npx shadcn-ui@latest add button card input textarea label badge alert dialog tabs progress
```

### API Calls Failing
- Check `VITE_API_URL` in `.env`
- Verify backend is running on `http://localhost:5000`
- Check browser console for CORS errors

### 401 Unauthorized
- Ensure token is stored in localStorage: `localStorage.getItem('token')`
- Check token expiration
- Re-login if needed

---

## ✨ Next Steps (Optional Features)

### Phase 2 Features (Not Yet Implemented)
- [ ] Materials management page
- [ ] Session notes page (Tutor write notes)
- [ ] Results page (Student view grades overview)
- [ ] Real-time notifications (Socket.io)
- [ ] File preview (PDF, images)
- [ ] Rich text editor for notes
- [ ] Calendar export (iCal)
- [ ] Email notifications

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Video call integration
- [ ] Chat feature
- [ ] Analytics dashboard

---

## 📝 Development Notes

### Code Standards
- ✅ TypeScript strict mode
- ✅ Functional components + Hooks
- ✅ Redux Toolkit for state
- ✅ Tailwind CSS only (no inline styles)
- ✅ Vietnamese UI labels
- ✅ JSDoc comments for functions
- ✅ Error handling with try-catch

### Testing Strategy
- Unit tests: Vitest + React Testing Library
- E2E tests: Playwright
- API mocking: MSW (Mock Service Worker)

---

## 📞 Support

Nếu gặp vấn đề:
1. Check `FRONTEND_BUILD_SUMMARY.md` for detailed info
2. Review backend API test script: `backend/scripts/test-api.ps1`
3. Verify types match backend schemas

---

## 🎉 Summary

**Module Completion: 90%**

✅ **Completed:**
- Types & Services (100%)
- Redux Slices (100%)
- Core Components (100%)
- Pages (80% - missing Materials, Notes, Results)
- Routing (100%)
- Utils (100%)

🚧 **Pending:**
- Install shadcn/ui components
- Test with real backend API
- Add Materials/Notes pages (optional)

**Estimated Time to Complete:** 2-4 hours (mostly shadcn install + testing)
