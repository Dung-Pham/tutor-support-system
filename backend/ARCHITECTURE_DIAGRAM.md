# Module VI - System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                           │
│                     (React/Vue/Angular Frontend)                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS Requests
                             │ JSON Payloads
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                            │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Express.js Server                         │  │
│  │  - CORS Configuration                                        │  │
│  │  - Security (Helmet)                                         │  │
│  │  - Request Logging (Morgan)                                  │  │
│  │  - Compression                                               │  │
│  │  - Body Parsing                                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         ROUTING LAYER                                │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │Schedules │  │Reschedule│  │Attendance│  │Evaluation│          │
│  │ Routes   │  │ Routes   │  │ Routes   │  │ Routes   │          │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘          │
│        │             │              │              │                │
│  ┌─────┴────┐  ┌────┴─────┐  ┌────┴─────┐  ┌─────┴────┐          │
│  │Homework  │  │  Chat    │  │Validation│  │  Auth    │          │
│  │ Routes   │  │ Routes   │  │Middleware│  │Middleware│          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                                │
│                   (HTTP Request/Response Handlers)                   │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Schedule    │  │  Reschedule  │  │  Attendance  │            │
│  │ Controller   │  │  Controller  │  │  Controller  │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐            │
│  │  Evaluation  │  │   Homework   │  │     Chat     │            │
│  │  Controller  │  │  Controller  │  │  Controller  │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                       │
│  Responsibilities:                                                   │
│  - Validate request data                                            │
│  - Call appropriate service methods                                 │
│  - Format responses                                                 │
│  - Handle errors                                                    │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                 │
│                      (Business Logic)                                │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Schedule    │  │  Reschedule  │  │  Attendance  │            │
│  │  Service     │  │  Service     │  │  Service     │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐            │
│  │  Evaluation  │  │   Homework   │  │     Chat     │            │
│  │  Service     │  │  Service     │  │  Service     │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                       │
│  Responsibilities:                                                   │
│  - Business logic implementation                                    │
│  - Data validation                                                  │
│  - Transaction management                                           │
│  - Cross-service coordination                                       │
│  - Conflict detection                                               │
│  - Auto-calculations                                                │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      UTILITY LAYER                                   │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Database    │  │  Validator   │  │   Response   │            │
│  │  Helpers     │  │  Utils       │  │  Formatter   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                       │
│  - executeQuery()                                                   │
│  - executeTransaction()                                             │
│  - buildPaginationQuery()                                           │
│  - Validation schemas                                               │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                  │
│                      SQL Server 2019+                                │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Core Tables                               │  │
│  │                                                              │  │
│  │  Schedule              ScheduleTimeBlock    RescheduleRequest │ │
│  │  AttendanceRecord      ProgressEvaluation   ProgressStatistics││
│  │  Material              Homework             HomeworkSubmission││
│  │  ChatMessage           Notification                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Related Tables                              │  │
│  │                                                              │  │
│  │  User                  TutorRequest         Subject          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Features:                                                           │
│  - Foreign key relationships                                        │
│  - Indexes for performance                                          │
│  - Constraints for data integrity                                   │
│  - Triggers (optional)                                              │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

                          DATA FLOW EXAMPLE
                    (Create Schedule → Attendance)

┌─────────────────────────────────────────────────────────────────────┐
│ 1. Client sends POST request to create schedule                     │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. scheduleRoutes.ts receives request                                │
│    - Applies validation middleware                                   │
│    - Forwards to scheduleController                                  │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. scheduleController.createSchedule()                               │
│    - Validates request body                                          │
│    - Extracts user info from JWT                                     │
│    - Calls scheduleService.createSchedule()                          │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. scheduleService.createSchedule()                                  │
│    - Verifies TutorRequest exists                                    │
│    - Checks for time conflicts                                       │
│    - Inserts schedule into database                                  │
│    - Returns created schedule                                        │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. After class completion, call attendance API                       │
│    GET /api/attendance/schedule/:scheduleId                          │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. attendanceService.getOrCreateAttendance()                         │
│    - Checks if attendance exists                                     │
│    - Creates if not exists                                           │
│    - Returns attendance record                                       │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Tutor confirms attendance                                         │
│    POST /api/attendance/:id/confirm                                  │
│    Body: { "confirmedBy": "tutor" }                                  │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. Parent confirms attendance                                        │
│    POST /api/attendance/:id/confirm                                  │
│    Body: { "confirmedBy": "parent" }                                 │
└────────────────────────┬────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 9. Tutor creates evaluation                                          │
│    POST /api/evaluations                                             │
│    - Rates student performance                                       │
│    - Auto-updates ProgressStatistics                                 │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

                       KEY DESIGN PATTERNS

┌─────────────────────────────────────────────────────────────────────┐
│                      LAYERED ARCHITECTURE                            │
│                                                                       │
│  Benefits:                                                           │
│  ✓ Separation of concerns                                           │
│  ✓ Easy to test and maintain                                        │
│  ✓ Clear responsibilities                                           │
│  ✓ Reusable components                                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      DEPENDENCY INJECTION                            │
│                                                                       │
│  Controllers depend on Services                                      │
│  Services depend on Database utilities                               │
│  Easy to mock for testing                                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    TRANSACTION MANAGEMENT                            │
│                                                                       │
│  Critical operations wrapped in transactions:                        │
│  - Reschedule approval (update + create)                            │
│  - Evaluation creation (insert + update stats)                      │
│  - Auto-rollback on errors                                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING                                │
│                                                                       │
│  Try-catch at every layer:                                          │
│  - Controllers: HTTP error responses                                │
│  - Services: Business logic errors                                  │
│  - Database: SQL errors                                             │
│  Consistent error format                                            │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

                        TYPE SYSTEM FLOW

┌─────────────────────────────────────────────────────────────────────┐
│                      types/index.ts                                  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Entities                DTOs                 Enums          │  │
│  │  - Schedule              - CreateScheduleDTO  - ScheduleStatus││
│  │  - Attendance            - UpdateAttendanceDTO - AttendanceStatus││
│  │  - Evaluation            - CreateEvaluationDTO - NotificationType││
│  │  - Homework              - SubmitHomeworkDTO                 │  │
│  │  - ChatMessage           - GradeHomeworkDTO                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  All types flow through the application:                             │
│  Request → DTO → Service → Entity → Database → Response             │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

                      SECURITY CONSIDERATIONS

┌─────────────────────────────────────────────────────────────────────┐
│  ✓ Parameterized queries (SQL injection prevention)                 │
│  ✓ Input validation on all endpoints                                │
│  ✓ TypeScript type checking                                         │
│  ✓ Helmet for security headers                                      │
│  ✓ CORS configuration                                               │
│  ⏳ JWT authentication (to be added)                                │
│  ⏳ Role-based authorization (to be added)                          │
│  ⏳ Rate limiting (to be added)                                     │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

Legend:
┌─┐  Component/Layer
│    Process/Flow
▼    Data flow direction
✓    Implemented
⏳    To be implemented
