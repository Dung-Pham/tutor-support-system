# Module VI - Complete API Reference

## 📖 Overview

This document provides complete API reference for Module VI - Teaching & Learning Support APIs.

All endpoints return JSON responses following this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result data */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🗓️ Schedule Management APIs

### Create Schedule
```
POST /api/schedules
```

**Request Body:**
```json
{
  "tutorRequestId": 123,
  "startTime": "2025-11-10T10:00:00Z",
  "endTime": "2025-11-10T11:30:00Z",
  "notes": "Optional notes"
}
```

**Response:** Schedule object with ID

**Validations:**
- Schedule time must not conflict with existing schedules
- TutorRequest must exist and be in 'accepted' status
- Tutor and student must be available

---

### Get Schedules (with Pagination)
```
GET /api/schedules?tutorId=1&studentId=2&status=confirmed&page=1&limit=10
```

**Query Parameters:**
- `tutorId` (optional): Filter by tutor
- `studentId` (optional): Filter by student
- `status` (optional): Filter by status
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response:** Paginated list of schedules

---

### Get Calendar View
```
GET /api/schedules/calendar?userId=1&userRole=tutor&viewType=week&date=2025-11-10
```

**Query Parameters:**
- `userId` (required): User ID
- `userRole` (required): `tutor` | `student` | `parent`
- `viewType` (required): `day` | `week` | `month`
- `date` (required): ISO date string

**Response:** Array of schedules for the specified period

---

### Update Schedule
```
PUT /api/schedules/:scheduleId
```

**Request Body:**
```json
{
  "startTime": "2025-11-10T11:00:00Z",
  "endTime": "2025-11-10T12:30:00Z",
  "status": "confirmed",
  "notes": "Updated notes"
}
```

---

### Delete Schedule
```
DELETE /api/schedules/:scheduleId
```

**Response:** Success message (soft delete - sets status to 'cancelled')

---

### TimeBlock Management

#### Create TimeBlock
```
POST /api/schedules/timeblocks
```

**Request Body:**
```json
{
  "tutorId": 1,
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00"
}
```

**Notes:**
- `dayOfWeek`: 0 (Sunday) to 6 (Saturday)
- `startTime`/`endTime`: HH:mm format

---

#### Get Tutor's TimeBlocks
```
GET /api/schedules/timeblocks/tutor/:tutorId
```

---

#### Get Available TimeBlocks
```
GET /api/schedules/timeblocks/available?tutorId=1&date=2025-11-10
```

---

#### Update TimeBlock Status
```
PATCH /api/schedules/timeblocks/:timeBlockId/status
```

**Request Body:**
```json
{
  "status": "locked"
}
```

**Status values:** `available` | `locked` | `booked`

---

## 🔄 Reschedule Management APIs

### Create Reschedule Request
```
POST /api/reschedules
```

**Request Body:**
```json
{
  "scheduleId": 123,
  "reason": "Personal emergency",
  "proposedStartTime": "2025-11-11T10:00:00Z",
  "proposedEndTime": "2025-11-11T11:30:00Z"
}
```

---

### Get Pending Reschedules
```
GET /api/reschedules/pending
```

**Response:** Array of pending reschedule requests for the authenticated user

---

### Review Reschedule Request
```
POST /api/reschedules/:rescheduleId/review
```

**Request Body:**
```json
{
  "status": "approved",
  "reviewNotes": "Approved - Valid reason"
}
```

**Status values:** `approved` | `rejected`

**Effects when approved:**
- Original schedule status changed to 'rescheduled'
- New schedule automatically created with proposed times

---

### Cancel Reschedule Request
```
POST /api/reschedules/:rescheduleId/cancel
```

**Response:** Success message

---

## ✅ Attendance Management APIs

### Get/Create Attendance
```
GET /api/attendance/schedule/:scheduleId
```

**Response:** Attendance record (creates if doesn't exist)

---

### Update Attendance Status
```
PUT /api/attendance/:attendanceId
```

**Request Body:**
```json
{
  "status": "present",
  "notes": "On time, actively participated"
}
```

**Status values:** `pending` | `present` | `absent` | `late` | `excused`

---

### Confirm Attendance (2-way confirmation)
```
POST /api/attendance/:attendanceId/confirm
```

**Request Body:**
```json
{
  "confirmedBy": "tutor"
}
```

**confirmedBy values:** `tutor` | `parent`

**Notes:**
- Both tutor and parent must confirm for complete verification
- Separate confirmation timestamps tracked

---

### Get Attendance History
```
GET /api/attendance/student/:studentId/history?page=1&limit=10
```

---

### Get Attendance Statistics
```
GET /api/attendance/student/:studentId/stats?subjectId=1
```

**Response:**
```json
{
  "totalClasses": 20,
  "presentCount": 18,
  "absentCount": 1,
  "lateCount": 1,
  "excusedCount": 0,
  "attendanceRate": 90.00
}
```

---

### Get Pending Confirmations
```
GET /api/attendance/pending
```

**Response:** Array of attendance records awaiting confirmation by authenticated user

---

## 📊 Progress Evaluation APIs

### Create Evaluation
```
POST /api/evaluations
```

**Request Body:**
```json
{
  "scheduleId": 123,
  "understanding": 4,
  "participation": 5,
  "homework": 4,
  "behavior": 5,
  "strengths": "Quick learner, asks good questions",
  "weaknesses": "Needs more practice with complex problems",
  "recommendations": "Focus on problem-solving exercises",
  "notes": "Great progress this session"
}
```

**Validations:**
- All rating fields must be 1-5
- Overall score auto-calculated as average
- Automatically updates ProgressStatistics

---

### Get Evaluations for Student
```
GET /api/evaluations/student/:studentId?subjectId=1&page=1&limit=10
```

---

### Get Evaluation by Schedule
```
GET /api/evaluations/schedule/:scheduleId
```

---

### Get Progress Statistics
```
GET /api/evaluations/student/:studentId/statistics?subjectId=1&month=11&year=2025
```

**Response:**
```json
{
  "statisticsId": 1,
  "studentId": 123,
  "subjectId": 1,
  "month": 11,
  "year": 2025,
  "totalClasses": 8,
  "attendedClasses": 7,
  "attendanceRate": 87.50,
  "averageScore": 4.25,
  "totalHomework": 6,
  "completedHomework": 5,
  "homeworkCompletionRate": 83.33,
  "subjectName": "Mathematics"
}
```

---

## 📚 Homework & Materials APIs

### Upload Material
```
POST /api/homework/materials
```

**Request Body:**
```json
{
  "scheduleId": 123,
  "subjectId": 1,
  "title": "Chapter 5 Study Guide",
  "description": "Complete notes for chapter 5",
  "type": "pdf",
  "fileUrl": "https://storage.example.com/files/chapter5.pdf",
  "fileSize": 2048576
}
```

**Material Types:** `pdf` | `image` | `video` | `document` | `link`

---

### Get Materials by Subject
```
GET /api/homework/materials/subject/:subjectId?page=1&limit=20
```

---

### Create Homework
```
POST /api/homework
```

**Request Body:**
```json
{
  "scheduleId": 123,
  "title": "Algebra Practice Set 3",
  "description": "Complete exercises 1-20 from chapter 5",
  "dueDate": "2025-11-15T23:59:59Z",
  "maxScore": 100,
  "attachments": [
    "https://storage.example.com/homework/practice-set-3.pdf"
  ]
}
```

---

### Get Homework for Student
```
GET /api/homework/student/:studentId?status=assigned&page=1&limit=10
```

**Status values:** `assigned` | `submitted` | `graded` | `late`

---

### Submit Homework
```
POST /api/homework/:homeworkId/submit
```

**Request Body:**
```json
{
  "attachments": [
    "https://storage.example.com/submissions/student-123-hw-456.pdf"
  ],
  "notes": "Completed all exercises"
}
```

**Notes:**
- Auto-detects if submission is late (after dueDate)
- Can only submit once (use update for revisions)

---

### Grade Homework Submission
```
POST /api/homework/submissions/:submissionId/grade
```

**Request Body:**
```json
{
  "score": 85.5,
  "feedback": "Good work! Pay attention to steps 3-5 in problem 12."
}
```

---

### Get Submissions for Homework
```
GET /api/homework/:homeworkId/submissions
```

---

## 💬 Chat & Notifications APIs

### Send Message
```
POST /api/chat/messages
```

**Request Body:**
```json
{
  "receiverId": 456,
  "scheduleId": 123,
  "messageType": "text",
  "content": "Hello! Regarding tomorrow's class...",
  "attachments": []
}
```

**Message Types:** `text` | `file` | `image` | `system`

**Effects:**
- Creates notification for receiver
- Returns message with `messageId`

---

### Get Recent Conversations
```
GET /api/chat/conversations
```

**Response:**
```json
[
  {
    "otherUserId": 456,
    "otherUserName": "John Doe",
    "otherUserRole": "student",
    "lastMessageTime": "2025-11-09T10:30:00Z",
    "lastMessage": "Thank you!",
    "unreadCount": 2
  }
]
```

---

### Get Conversation with User
```
GET /api/chat/conversations/:otherUserId?page=1&limit=50
```

**Response:** Paginated messages in reverse chronological order

---

### Mark Message as Read
```
POST /api/chat/messages/:messageId/read
```

---

### Get Unread Message Count
```
GET /api/chat/messages/unread/count
```

**Response:**
```json
{
  "count": 5
}
```

---

### Create Notification
```
POST /api/chat/notifications
```

**Request Body:**
```json
{
  "userId": 123,
  "type": "schedule_created",
  "title": "New Class Scheduled",
  "message": "Your class has been scheduled for Nov 10, 2025",
  "data": {
    "scheduleId": 456
  }
}
```

**Notification Types:**
- `schedule_created`
- `schedule_updated`
- `schedule_cancelled`
- `reschedule_request`
- `reschedule_approved`
- `reschedule_rejected`
- `attendance_confirmed`
- `homework_assigned`
- `homework_submitted`
- `homework_graded`
- `evaluation_created`
- `message_received`

---

### Get Notifications
```
GET /api/chat/notifications?isRead=false&page=1&limit=20
```

**Query Parameters:**
- `isRead` (optional): `true` | `false`
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

---

### Mark Notification as Read
```
POST /api/chat/notifications/:notificationId/read
```

---

### Get Unread Notification Count
```
GET /api/chat/notifications/unread/count
```

---

## 🔐 Authentication

All endpoints require JWT authentication. Include token in header:

```
Authorization: Bearer <your_jwt_token>
```

The token payload should contain:
```json
{
  "userId": 123,
  "role": "tutor",
  "email": "user@example.com"
}
```

---

## ⚠️ Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate or time conflict)
- `500` - Internal Server Error

---

## 📈 Rate Limiting

Recommended limits (to be implemented):
- 100 requests per minute per user
- 1000 requests per hour per IP

---

## 🧪 Testing Examples

### Using cURL

```bash
# Create schedule
curl -X POST http://localhost:5000/api/schedules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tutorRequestId": 123,
    "startTime": "2025-11-10T10:00:00Z",
    "endTime": "2025-11-10T11:30:00Z"
  }'

# Get calendar view
curl -X GET "http://localhost:5000/api/schedules/calendar?userId=1&userRole=tutor&viewType=week&date=2025-11-10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Send message
const response = await fetch('http://localhost:5000/api/chat/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    receiverId: 456,
    messageType: 'text',
    content: 'Hello!'
  })
});

const data = await response.json();
```

---

## 📝 Best Practices

1. **Always validate input** on client side before API calls
2. **Handle errors gracefully** - show user-friendly messages
3. **Implement retry logic** for transient failures
4. **Cache frequently accessed data** (subjects, user info)
5. **Use pagination** for large datasets
6. **Debounce search inputs** to reduce API calls
7. **Show loading states** during API calls
8. **Log errors** for debugging

---

**Last Updated:** November 9, 2025
**API Version:** 1.0.0
