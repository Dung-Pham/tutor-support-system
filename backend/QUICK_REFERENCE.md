# Quick Reference: Backend Infrastructure

## 🔌 Database Connection

```typescript
// Import
import dbConnection from './database/connection';

// Query
const result = await dbConnection.query('SELECT * FROM Table WHERE id = @id', { id: 1 });

// Transaction
import { withTransaction } from './database/connection';
const result = await withTransaction(async (tx) => {
  // Your queries here
  return data;
});

// Health check
const isHealthy = await dbConnection.healthCheck();
```

## 📊 Query Modules

```typescript
// Schedule
import * as scheduleQueries from './database/queries/scheduleQueries';
await scheduleQueries.createSchedule(data);
await scheduleQueries.getScheduleById(id);
await scheduleQueries.getSchedules(filters);
await scheduleQueries.checkScheduleConflict(tutorId, start, end);

// Attendance
import * as attendanceQueries from './database/queries/attendanceQueries';
await attendanceQueries.getOrCreateAttendance(scheduleId);
await attendanceQueries.confirmAttendance(id, 'tutor');
await attendanceQueries.getAttendanceStatistics(userId, role);

// Evaluation
import * as evaluationQueries from './database/queries/evaluationQueries';
await evaluationQueries.createEvaluation(data);
await evaluationQueries.getEvaluationsByStudent(studentId, filters);
await evaluationQueries.getEvaluationStatistics(studentId);

// Homework
import * as homeworkQueries from './database/queries/homeworkQueries';
await homeworkQueries.createHomework(data);
await homeworkQueries.submitHomework(data);
await homeworkQueries.gradeSubmission(id, { grade, feedback });

// Chat
import * as chatQueries from './database/queries/chatQueries';
await chatQueries.sendMessage(data);
await chatQueries.getRecentConversations(userId, limit);
await chatQueries.markMessageAsRead(messageId, userId);

// Notifications
import * as notificationQueries from './database/queries/notificationQueries';
await notificationQueries.createNotification(data);
await notificationQueries.getNotificationsByUser(userId, filters);
await notificationQueries.markAllNotificationsAsRead(userId);

// Statistics
import * as statisticsQueries from './database/queries/statisticsQueries';
await statisticsQueries.updateStatistics(studentId, month, year);
await statisticsQueries.getOverallStatistics(studentId);
```

## ❌ Error Handling

```typescript
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  asyncHandler
} from './utils/errors';

// Throw errors
throw new ValidationError('Invalid email');
throw new NotFoundError('User', userId);
throw new ConflictError('Schedule conflict detected');

// Wrap async handlers
export const handler = asyncHandler(async (req, res) => {
  // Your code - errors auto-caught
});

// Handle database errors
try {
  await dbConnection.query(sql);
} catch (error) {
  throw handleDatabaseError(error);
}
```

## ✅ Response Formatting

```typescript
import responseBuilder from './utils/response';

// Success
responseBuilder.success(res, data);
responseBuilder.created(res, newResource);
responseBuilder.message(res, 'Success');

// Pagination
responseBuilder.paginated(res, items, page, limit, total);

// Errors
responseBuilder.error(res, error);
responseBuilder.notFound(res, 'Resource', id);
responseBuilder.unauthorized(res);
responseBuilder.forbidden(res);
responseBuilder.conflict(res, 'Conflict message');
responseBuilder.validationError(res, errors);

// With middleware (shorter)
res.sendSuccess(data);
res.sendCreated(data);
res.sendPaginated(items, page, limit, total);
res.sendNotFound('User', id);
res.sendError(error);
```

## ✔️ Validation

```typescript
import {
  validateRequired,
  validateEmail,
  validateDate,
  validateDateRange,
  validateEnum,
  validateRange,
  validateLength,
  validateAll
} from './utils/validators';

// Individual validations
validateRequired(data.email, 'Email');
validateEmail(data.email);
validateDateRange(startDate, endDate);
validateEnum(data.status, ['pending', 'active', 'completed']);
validateRange(data.score, 0, 10);

// Multiple validations
validateAll([
  () => validateRequired(data.name, 'Name'),
  () => validateLength(data.name, 3, 50),
  () => validateEmail(data.email)
]);
```

## 🎯 Complete Example

```typescript
import { Router } from 'express';
import { asyncHandler, NotFoundError } from './utils/errors';
import { validateRequired, validatePositiveInteger } from './utils/validators';
import * as scheduleQueries from './database/queries/scheduleQueries';
import responseBuilder from './utils/response';

const router = Router();

// Get schedule
router.get('/:id', asyncHandler(async (req, res) => {
  validatePositiveInteger(req.params.id, 'Schedule ID');
  
  const schedule = await scheduleQueries.getScheduleById(Number(req.params.id));
  
  if (!schedule) {
    throw new NotFoundError('Schedule', req.params.id);
  }
  
  responseBuilder.success(res, schedule);
}));

// Create schedule
router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body.tutorRequestId, 'Tutor Request ID');
  validateRequired(req.body.startTime, 'Start Time');
  validateRequired(req.body.endTime, 'End Time');
  
  const schedule = await scheduleQueries.createSchedule(req.body);
  responseBuilder.created(res, schedule);
}));

export default router;
```

## 🔑 Environment Variables

```env
# Database
DB_SERVER=localhost
DB_NAME=tutor_support_db
DB_USER=sa
DB_PASSWORD=your_password
DB_ENCRYPT=true
DB_TRUST_CERT=true

# Pool
DB_POOL_MAX=10
DB_POOL_MIN=2

# Retry
DB_MAX_RETRIES=3
DB_RETRY_DELAY=1000
```

## 📝 Common Patterns

### API Endpoint Pattern
```typescript
export const handler = asyncHandler(async (req, res) => {
  // 1. Validate input
  validateRequired(req.body.field);
  
  // 2. Query database
  const data = await queries.getData(params);
  
  // 3. Handle not found
  if (!data) throw new NotFoundError('Resource');
  
  // 4. Send response
  res.sendSuccess(data);
});
```

### Transaction Pattern
```typescript
import { withTransaction } from './database/connection';

const result = await withTransaction(async (tx) => {
  // Multiple operations
  await tx.request().input('id', id).query('UPDATE ...');
  await tx.request().input('data', data).query('INSERT ...');
  return result;
});
```

### Pagination Pattern
```typescript
const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 20;
const offset = (page - 1) * limit;

const { items, total } = await queries.getItems({ limit, offset });
res.sendPaginated(items, page, limit, total);
```

---

See `INFRASTRUCTURE_SETUP_COMPLETE.md` for full documentation.
