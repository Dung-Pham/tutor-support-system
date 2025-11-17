# Module VI - Setup & Installation Guide

## 📦 Prerequisites

- Node.js 16+ installed
- SQL Server database running
- PowerShell (Windows)

## 🚀 Installation Steps

### Step 1: Install TypeScript Dependencies

```powershell
cd backend
npm install --save-dev typescript @types/node @types/express @types/cors @types/morgan @types/compression @types/bcryptjs @types/jsonwebtoken ts-node
```

### Step 2: Verify package.json

The `package.json` has been updated with:
- Build scripts for TypeScript compilation
- All necessary type definitions
- Development dependencies

### Step 3: Build TypeScript Files

```powershell
npm run build
```

This compiles all `.ts` files from `src/` to `dist/`.

### Step 4: Update Environment Variables

Add to your `.env` file (if not already present):

```env
# Database Configuration
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_DATABASE=TutorSupportDB
MSSQL_USER=your_username
MSSQL_PASSWORD=your_password
MSSQL_ENCRYPT=true
MSSQL_TRUST_SERVER_CERTIFICATE=true

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# JWT Configuration (if using authentication)
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

## 🗄️ Database Setup

### Create Required Tables

If not already created, run these SQL scripts:

```sql
-- Schedule Management
CREATE TABLE Schedule (
    scheduleId INT PRIMARY KEY IDENTITY(1,1),
    tutorRequestId INT NOT NULL,
    tutorId INT NOT NULL,
    studentId INT NOT NULL,
    subjectId INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes NVARCHAR(MAX),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (tutorId) REFERENCES [User](userId),
    FOREIGN KEY (studentId) REFERENCES [User](userId),
    FOREIGN KEY (subjectId) REFERENCES Subject(subjectId)
);

CREATE TABLE ScheduleTimeBlock (
    timeBlockId INT PRIMARY KEY IDENTITY(1,1),
    tutorId INT NOT NULL,
    dayOfWeek INT NOT NULL CHECK (dayOfWeek >= 0 AND dayOfWeek <= 6),
    startTime VARCHAR(5) NOT NULL,
    endTime VARCHAR(5) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (tutorId) REFERENCES [User](userId)
);

-- Reschedule Management
CREATE TABLE RescheduleRequest (
    rescheduleId INT PRIMARY KEY IDENTITY(1,1),
    scheduleId INT NOT NULL,
    requestedBy INT NOT NULL,
    reason NVARCHAR(MAX) NOT NULL,
    proposedStartTime DATETIME NOT NULL,
    proposedEndTime DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewedBy INT,
    reviewNotes NVARCHAR(MAX),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (scheduleId) REFERENCES Schedule(scheduleId),
    FOREIGN KEY (requestedBy) REFERENCES [User](userId),
    FOREIGN KEY (reviewedBy) REFERENCES [User](userId)
);

-- Attendance Management
CREATE TABLE AttendanceRecord (
    attendanceId INT PRIMARY KEY IDENTITY(1,1),
    scheduleId INT NOT NULL,
    studentId INT NOT NULL,
    tutorId INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    tutorConfirmed BIT NOT NULL DEFAULT 0,
    parentConfirmed BIT NOT NULL DEFAULT 0,
    tutorConfirmedAt DATETIME,
    parentConfirmedAt DATETIME,
    notes NVARCHAR(MAX),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (scheduleId) REFERENCES Schedule(scheduleId),
    FOREIGN KEY (studentId) REFERENCES [User](userId),
    FOREIGN KEY (tutorId) REFERENCES [User](userId)
);

-- Progress Evaluation
CREATE TABLE ProgressEvaluation (
    evaluationId INT PRIMARY KEY IDENTITY(1,1),
    scheduleId INT NOT NULL,
    tutorId INT NOT NULL,
    studentId INT NOT NULL,
    subjectId INT NOT NULL,
    understanding INT NOT NULL CHECK (understanding >= 1 AND understanding <= 5),
    participation INT NOT NULL CHECK (participation >= 1 AND participation <= 5),
    homework INT NOT NULL CHECK (homework >= 1 AND homework <= 5),
    behavior INT NOT NULL CHECK (behavior >= 1 AND behavior <= 5),
    overallScore DECIMAL(3,2) NOT NULL,
    strengths NVARCHAR(MAX),
    weaknesses NVARCHAR(MAX),
    recommendations NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (scheduleId) REFERENCES Schedule(scheduleId),
    FOREIGN KEY (tutorId) REFERENCES [User](userId),
    FOREIGN KEY (studentId) REFERENCES [User](userId),
    FOREIGN KEY (subjectId) REFERENCES Subject(subjectId)
);

CREATE TABLE ProgressStatistics (
    statisticsId INT PRIMARY KEY IDENTITY(1,1),
    studentId INT NOT NULL,
    subjectId INT NOT NULL,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    totalClasses INT NOT NULL DEFAULT 0,
    attendedClasses INT NOT NULL DEFAULT 0,
    attendanceRate DECIMAL(5,2) NOT NULL DEFAULT 0,
    averageScore DECIMAL(3,2) NOT NULL DEFAULT 0,
    totalHomework INT NOT NULL DEFAULT 0,
    completedHomework INT NOT NULL DEFAULT 0,
    homeworkCompletionRate DECIMAL(5,2) NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (studentId) REFERENCES [User](userId),
    FOREIGN KEY (subjectId) REFERENCES Subject(subjectId),
    UNIQUE (studentId, subjectId, month, year)
);

-- Materials & Homework
CREATE TABLE Material (
    materialId INT PRIMARY KEY IDENTITY(1,1),
    scheduleId INT,
    subjectId INT NOT NULL,
    uploadedBy INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    type VARCHAR(20) NOT NULL,
    fileUrl NVARCHAR(500) NOT NULL,
    fileSize BIGINT,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (scheduleId) REFERENCES Schedule(scheduleId),
    FOREIGN KEY (subjectId) REFERENCES Subject(subjectId),
    FOREIGN KEY (uploadedBy) REFERENCES [User](userId)
);

CREATE TABLE Homework (
    homeworkId INT PRIMARY KEY IDENTITY(1,1),
    scheduleId INT NOT NULL,
    tutorId INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    dueDate DATETIME NOT NULL,
    maxScore INT NOT NULL,
    attachments NVARCHAR(MAX),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (scheduleId) REFERENCES Schedule(scheduleId),
    FOREIGN KEY (tutorId) REFERENCES [User](userId)
);

CREATE TABLE HomeworkSubmission (
    submissionId INT PRIMARY KEY IDENTITY(1,1),
    homeworkId INT NOT NULL,
    studentId INT NOT NULL,
    submittedAt DATETIME NOT NULL,
    attachments NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    score DECIMAL(5,2),
    feedback NVARCHAR(MAX),
    gradedAt DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted',
    FOREIGN KEY (homeworkId) REFERENCES Homework(homeworkId),
    FOREIGN KEY (studentId) REFERENCES [User](userId)
);

-- Chat & Notifications
CREATE TABLE ChatMessage (
    messageId INT PRIMARY KEY IDENTITY(1,1),
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    scheduleId INT,
    messageType VARCHAR(20) NOT NULL DEFAULT 'text',
    content NVARCHAR(MAX) NOT NULL,
    attachments NVARCHAR(MAX),
    isRead BIT NOT NULL DEFAULT 0,
    readAt DATETIME,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (senderId) REFERENCES [User](userId),
    FOREIGN KEY (receiverId) REFERENCES [User](userId),
    FOREIGN KEY (scheduleId) REFERENCES Schedule(scheduleId)
);

CREATE TABLE Notification (
    notificationId INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    data NVARCHAR(MAX),
    isRead BIT NOT NULL DEFAULT 0,
    readAt DATETIME,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES [User](userId)
);
```

### Create Indexes for Performance

```sql
-- Schedule indexes
CREATE INDEX IX_Schedule_TutorId ON Schedule(tutorId);
CREATE INDEX IX_Schedule_StudentId ON Schedule(studentId);
CREATE INDEX IX_Schedule_StartTime ON Schedule(startTime);
CREATE INDEX IX_Schedule_Status ON Schedule(status);

-- Attendance indexes
CREATE INDEX IX_Attendance_ScheduleId ON AttendanceRecord(scheduleId);
CREATE INDEX IX_Attendance_StudentId ON AttendanceRecord(studentId);
CREATE INDEX IX_Attendance_TutorId ON AttendanceRecord(tutorId);

-- Homework indexes
CREATE INDEX IX_Homework_ScheduleId ON Homework(scheduleId);
CREATE INDEX IX_HomeworkSubmission_HomeworkId ON HomeworkSubmission(homeworkId);
CREATE INDEX IX_HomeworkSubmission_StudentId ON HomeworkSubmission(studentId);

-- Chat indexes
CREATE INDEX IX_ChatMessage_SenderId ON ChatMessage(senderId);
CREATE INDEX IX_ChatMessage_ReceiverId ON ChatMessage(receiverId);
CREATE INDEX IX_ChatMessage_IsRead ON ChatMessage(isRead);

-- Notification indexes
CREATE INDEX IX_Notification_UserId ON Notification(userId);
CREATE INDEX IX_Notification_IsRead ON Notification(isRead);
```

## 🧪 Testing the APIs

### Start Development Server

```powershell
npm run dev
```

The server should start on `http://localhost:5000`

### Health Check

```powershell
curl http://localhost:5000/health
```

### API Documentation

Access Swagger documentation at:
```
http://localhost:5000/api-docs
```

## 📝 Available Endpoints

### Schedule Management
- `POST /api/schedules` - Create schedule
- `GET /api/schedules` - List schedules
- `GET /api/schedules/calendar` - Calendar view
- `GET /api/schedules/:id` - Get schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule
- TimeBlock endpoints for availability management

### Reschedule Management
- `POST /api/reschedules` - Create reschedule request
- `GET /api/reschedules/pending` - Get pending requests
- `POST /api/reschedules/:id/review` - Approve/reject
- `POST /api/reschedules/:id/cancel` - Cancel request

### Attendance
- `GET /api/attendance/schedule/:id` - Get/create attendance
- `PUT /api/attendance/:id` - Update status
- `POST /api/attendance/:id/confirm` - Confirm attendance
- `GET /api/attendance/student/:id/history` - Attendance history
- `GET /api/attendance/student/:id/stats` - Statistics
- `GET /api/attendance/pending` - Pending confirmations

### Evaluations
- `POST /api/evaluations` - Create evaluation
- `GET /api/evaluations/:id` - Get evaluation
- `GET /api/evaluations/student/:id` - Student evaluations
- `GET /api/evaluations/schedule/:id` - By schedule
- `GET /api/evaluations/student/:id/statistics` - Progress stats

### Homework & Materials
- `POST /api/homework/materials` - Upload material
- `GET /api/homework/materials/subject/:id` - List materials
- `POST /api/homework` - Create homework
- `GET /api/homework/:id` - Get homework
- `GET /api/homework/student/:id` - Student homework
- `POST /api/homework/:id/submit` - Submit homework
- `POST /api/homework/submissions/:id/grade` - Grade submission

### Chat & Notifications
- `POST /api/chat/messages` - Send message
- `GET /api/chat/conversations` - Recent conversations
- `GET /api/chat/conversations/:id` - Get conversation
- `POST /api/chat/messages/:id/read` - Mark as read
- `GET /api/chat/messages/unread/count` - Unread count
- `POST /api/chat/notifications` - Create notification
- `GET /api/chat/notifications` - List notifications
- `POST /api/chat/notifications/:id/read` - Mark notification as read

## 🐛 Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing type definitions:

```powershell
npm install --save-dev @types/express @types/node
```

### Cannot Find Module Errors

Make sure you've run:

```powershell
npm install
npm run build
```

### Database Connection Errors

1. Verify SQL Server is running
2. Check `.env` file has correct credentials
3. Test connection using SQL Server Management Studio

### Port Already in Use

Change the PORT in `.env` or kill the process:

```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## 📚 Next Steps

1. **Add Authentication Middleware**: Protect routes with JWT authentication
2. **Add Authorization**: Check user roles and permissions
3. **Write Tests**: Create unit and integration tests
4. **Add Input Sanitization**: Prevent XSS attacks
5. **Add Rate Limiting**: Prevent API abuse
6. **Setup Logging**: Use Winston or similar for better logging
7. **Add API Monitoring**: Use tools like New Relic or DataDog
8. **Deploy**: Setup CI/CD pipeline for deployment

## 🔒 Security Considerations

- Always validate and sanitize user input
- Use parameterized queries (already implemented)
- Implement proper authentication and authorization
- Enable HTTPS in production
- Set secure CORS policies
- Use environment variables for sensitive data
- Regularly update dependencies
- Implement rate limiting
- Log security events

## 📞 Support

For issues or questions:
1. Check the implementation summary: `MODULE_VI_IMPLEMENTATION_SUMMARY.md`
2. Review the code comments in service files
3. Check API documentation at `/api-docs`

---

**Status**: ✅ All Module VI APIs implemented and ready for testing
**Last Updated**: November 9, 2025
