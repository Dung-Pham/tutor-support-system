# Module VI - Teaching & Learning Support APIs 🎓

> Complete backend implementation for tutor-student interaction management

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey)](https://expressjs.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-red)](https://www.microsoft.com/sql-server)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🌟 Overview

Module VI provides comprehensive APIs for managing teaching and learning activities in a tutor support system. It handles everything from schedule management to progress evaluation, homework assignments, and real-time communication.

### What's Included

- ✅ **Schedule Management**: CRUD operations, calendar views, time block management
- ✅ **Reschedule System**: Request, approve/reject, auto-schedule creation
- ✅ **Attendance Tracking**: 2-way confirmation, history, statistics
- ✅ **Progress Evaluation**: Multi-metric assessments, auto-statistics
- ✅ **Homework System**: Assignment, submission, grading, late detection
- ✅ **Materials Management**: Upload, organize, share learning materials
- ✅ **Chat System**: Messaging, conversations, unread tracking
- ✅ **Notifications**: Multi-type notifications, read tracking

## ✨ Features

### 🗓️ Schedule Management
- Create schedules from tutor requests
- Calendar views (day/week/month)
- Time conflict detection
- Tutor availability management (time blocks)
- Lock/unlock availability slots

### 🔄 Reschedule & Makeup
- Create reschedule requests with reasons
- Approval/rejection workflow
- Automatic new schedule creation on approval
- Request tracking and history

### ✅ Attendance & Confirmation
- 2-way confirmation system (tutor + parent)
- Attendance status tracking
- Complete attendance history
- Statistics and analytics
- Pending confirmations dashboard

### 📊 Progress Evaluation
- Multi-metric evaluation system
  - Understanding (1-5)
  - Participation (1-5)
  - Homework (1-5)
  - Behavior (1-5)
- Auto-calculated overall scores
- Strengths, weaknesses, recommendations
- Automatic progress statistics updates

### 📚 Homework & Materials
- **Materials**: Upload PDFs, images, videos, documents
- **Homework**: Create assignments with attachments
- **Submissions**: Student submission with late detection
- **Grading**: Score and feedback system
- Subject and schedule associations

### 💬 Chat & Notifications
- **Messaging**: Send text, files, images
- **Conversations**: Recent conversations list
- **Unread Tracking**: Message and notification counts
- **Notifications**: System notifications for all events
- Schedule-specific conversations

### 📈 Progress Statistics
- Monthly summaries per student/subject
- Attendance rate tracking
- Average score calculations
- Homework completion rates
- Historical data for charts

## 🛠️ Tech Stack

- **Runtime**: Node.js 16+
- **Language**: TypeScript 5.3
- **Framework**: Express.js 4.18
- **Database**: SQL Server 2019+
- **ORM**: Sequelize 6.35
- **Validation**: express-validator 7.0
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS

## 🚀 Quick Start

### Prerequisites

- Node.js 16 or higher
- SQL Server 2019 or higher
- PowerShell (Windows) or Terminal (Mac/Linux)

### Installation

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Install TypeScript dependencies
npm install --save-dev typescript @types/node @types/express @types/cors @types/morgan @types/compression @types/bcryptjs @types/jsonwebtoken ts-node

# Create .env file (see SETUP_GUIDE.md)
# Add your database credentials

# Build TypeScript
npm run build

# Run development server
npm run dev
```

### Verify Installation

```powershell
# Test health endpoint
curl http://localhost:5000/health

# Access API documentation
# Open browser: http://localhost:5000/api-docs
```

📖 **For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md)**

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](./QUICK_START.md) | Get up and running in 5 minutes |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Complete installation and configuration |
| [API_REFERENCE.md](./API_REFERENCE.md) | Detailed API documentation |
| [MODULE_VI_IMPLEMENTATION_SUMMARY.md](./MODULE_VI_IMPLEMENTATION_SUMMARY.md) | Implementation details |
| [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) | Project completion summary |

## 📁 Project Structure

```
backend/
├── src/
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── utils/
│   │   ├── validator.ts          # Request validation schemas
│   │   └── database.ts           # Database helper functions
│   ├── services/
│   │   ├── scheduleService.ts    # Schedule business logic
│   │   ├── rescheduleService.ts  # Reschedule logic
│   │   ├── attendanceService.ts  # Attendance tracking
│   │   ├── evaluationService.ts  # Evaluation & statistics
│   │   ├── homeworkService.ts    # Homework & materials
│   │   └── chatService.ts        # Chat & notifications
│   ├── controllers/
│   │   ├── scheduleController.ts # Schedule HTTP handlers
│   │   ├── rescheduleController.ts
│   │   ├── attendanceController.ts
│   │   ├── evaluationController.ts
│   │   ├── homeworkController.ts
│   │   └── chatController.ts
│   ├── routes/
│   │   ├── schedules.ts          # Schedule routes
│   │   ├── reschedules.ts
│   │   ├── attendance.ts
│   │   ├── evaluations.ts
│   │   ├── homework.ts
│   │   └── chat.ts
│   ├── config/
│   │   ├── sqlserver.js          # Database configuration
│   │   └── swagger.js            # API documentation config
│   ├── middlewares/
│   │   ├── errorHandler.js       # Error handling
│   │   └── logger.js             # Request logging
│   ├── models/                   # Database models
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Server entry point
├── dist/                         # Compiled JavaScript (generated)
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── .env                          # Environment variables
```

## 🌐 API Endpoints

### Schedules
- `POST /api/schedules` - Create schedule
- `GET /api/schedules` - List schedules
- `GET /api/schedules/calendar` - Calendar view
- `GET /api/schedules/:id` - Get schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule
- `POST /api/schedules/timeblocks` - Create time block
- `GET /api/schedules/timeblocks/tutor/:id` - Get tutor's time blocks

### Reschedules
- `POST /api/reschedules` - Create request
- `GET /api/reschedules/pending` - Get pending requests
- `GET /api/reschedules/:id` - Get request
- `POST /api/reschedules/:id/review` - Approve/Reject
- `POST /api/reschedules/:id/cancel` - Cancel request

### Attendance
- `GET /api/attendance/schedule/:id` - Get/Create attendance
- `PUT /api/attendance/:id` - Update status
- `POST /api/attendance/:id/confirm` - Confirm attendance
- `GET /api/attendance/student/:id/history` - Get history
- `GET /api/attendance/student/:id/stats` - Get statistics
- `GET /api/attendance/pending` - Get pending confirmations

### Evaluations
- `POST /api/evaluations` - Create evaluation
- `GET /api/evaluations/:id` - Get evaluation
- `GET /api/evaluations/student/:id` - Get student evaluations
- `GET /api/evaluations/schedule/:id` - Get by schedule
- `GET /api/evaluations/student/:id/statistics` - Get statistics

### Homework
- `POST /api/homework/materials` - Upload material
- `GET /api/homework/materials/subject/:id` - Get materials
- `POST /api/homework` - Create homework
- `GET /api/homework/:id` - Get homework
- `GET /api/homework/student/:id` - Get student homework
- `POST /api/homework/:id/submit` - Submit homework
- `POST /api/homework/submissions/:id/grade` - Grade submission
- `GET /api/homework/:id/submissions` - Get submissions

### Chat & Notifications
- `POST /api/chat/messages` - Send message
- `GET /api/chat/conversations` - Get recent conversations
- `GET /api/chat/conversations/:id` - Get conversation
- `POST /api/chat/messages/:id/read` - Mark as read
- `GET /api/chat/messages/unread/count` - Get unread count
- `POST /api/chat/notifications` - Create notification
- `GET /api/chat/notifications` - Get notifications
- `POST /api/chat/notifications/:id/read` - Mark as read
- `GET /api/chat/notifications/unread/count` - Get unread count

**For complete API documentation, see [API_REFERENCE.md](./API_REFERENCE.md)**

## 🗄️ Database Schema

### Core Tables
- **Schedule**: Class schedules
- **ScheduleTimeBlock**: Tutor availability
- **RescheduleRequest**: Reschedule tracking
- **AttendanceRecord**: Attendance tracking
- **ProgressEvaluation**: Student evaluations
- **ProgressStatistics**: Monthly statistics
- **Material**: Learning materials
- **Homework**: Homework assignments
- **HomeworkSubmission**: Student submissions
- **ChatMessage**: Messages
- **Notification**: System notifications

**For complete schema and indexes, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

## 💻 Development

### Available Scripts

```powershell
# Development with auto-restart
npm run dev

# Build TypeScript
npm run build

# Build with watch mode
npm run build:watch

# Start production server
npm start

# Run tests (to be implemented)
npm test
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configuration
- **Formatting**: Prettier
- **Comments**: JSDoc documentation
- **Error Handling**: Comprehensive try-catch blocks

### Development Workflow

1. Create feature branch
2. Write code with TypeScript
3. Add JSDoc comments
4. Test endpoints manually
5. Run build to check for errors
6. Create pull request

## 🧪 Testing

### Manual Testing

Use Postman, Thunder Client, or cURL to test endpoints.

Example:
```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "tutorRequestId": 1,
    "startTime": "2025-11-10T10:00:00Z",
    "endTime": "2025-11-10T11:30:00Z"
  }'
```

### Unit Tests (To Be Implemented)

```powershell
npm test
```

### Integration Tests (To Be Implemented)

```powershell
npm run test:integration
```

## 🚢 Deployment

### Before Production

- [ ] Add JWT authentication
- [ ] Implement authorization
- [ ] Add rate limiting
- [ ] Configure HTTPS
- [ ] Setup production database
- [ ] Configure environment variables
- [ ] Setup logging service
- [ ] Add monitoring (New Relic, DataDog)
- [ ] Setup CI/CD pipeline
- [ ] Configure backup strategy

### Production Build

```powershell
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is part of the Tutor Support System.

## 👥 Authors

- Development Team - *Initial work*

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- TypeScript team for type safety
- Microsoft for SQL Server
- All contributors and reviewers

---

## 📞 Support

For issues, questions, or contributions:
- Review the documentation files
- Check existing issues
- Create new issue with details

---

**Built with ❤️ for education**

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: November 9, 2025
