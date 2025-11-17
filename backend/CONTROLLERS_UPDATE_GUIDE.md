# Controllers Update Guide - 3 Modules Fixed

## ✅ Query Modules DONE
1. ✅ scheduleQueries.ts - Using UUID, snake_case, Class table
2. ✅ attendanceQueries.ts - Using UUID, BIT flags, overall_status
3. ✅ homeworkQueries.ts - Using UUID, Material/Homework/Submission tables

## 🔧 Controllers Need Updates

### Common Changes Required in All Controllers

#### ❌ OLD (Wrong):
```typescript
const scheduleId = parseInt(req.params.scheduleId);  // INT
const schedule = await scheduleService.getScheduleById(scheduleId);
```

#### ✅ NEW (Correct):
```typescript
const scheduleId = req.params.scheduleId;  // UUID string
const schedule = await scheduleService.getScheduleById(scheduleId);
```

---

## 1. scheduleController.ts

### Changes Needed:

#### Lines ~47-48: getSchedule
```typescript
// ❌ OLD
const scheduleId = parseInt(req.params.scheduleId);

// ✅ NEW
const scheduleId = req.params.scheduleId; // UUID
```

#### Lines ~77-78: updateSchedule
```typescript
// ❌ OLD
const scheduleId = parseInt(req.params.scheduleId);

// ✅ NEW
const scheduleId = req.params.scheduleId;
```

#### Lines ~97-98: deleteSchedule
```typescript
// ❌ OLD
const scheduleId = parseInt(req.params.scheduleId);

// ✅ NEW
const scheduleId = req.params.scheduleId;
```

#### Lines ~117-118: createTimeBlock
```typescript
// ❌ OLD
const scheduleId = parseInt(req.params.scheduleId);

// ✅ NEW
const scheduleId = req.params.scheduleId;
```

#### Lines ~137-138: getTimeBlocks
```typescript
// ❌ OLD
const scheduleId = parseInt(req.params.scheduleId);

// ✅ NEW
const scheduleId = req.params.scheduleId;
```

#### Lines ~157-158: updateTimeBlock
```typescript
// ❌ OLD
const timeBlockId = parseInt(req.params.timeBlockId);

// ✅ NEW
const timeBlockId = req.params.timeBlockId;
```

#### Lines ~177-179: getSchedules (Query filters)
```typescript
// ❌ OLD
tutorId: req.query.tutorId ? parseInt(req.query.tutorId as string) : undefined,
studentId: req.query.studentId ? parseInt(req.query.studentId as string) : undefined,

// ✅ NEW
tutor_id: req.query.tutorId as string,
student_id: req.query.studentId as string,
class_id: req.query.classId as string,
```

#### Lines ~217-220: checkConflicts
```typescript
// ❌ OLD
tutorId: parseInt(req.body.tutorId),

// ✅ NEW
tutorId: req.body.tutorId as string,
```

---

## 2. attendanceController.ts

### Changes Needed:

#### createOrGetAttendance
```typescript
// ❌ OLD
const scheduleId = parseInt(req.params.scheduleId);

// ✅ NEW
const scheduleId = req.params.scheduleId;
```

#### confirmAttendance
```typescript
// ❌ OLD
const attendanceId = parseInt(req.params.attendanceId);
const { confirmedBy, notes } = req.body;

// ✅ NEW
const attendanceId = req.params.attendanceId;
const { confirmedBy, notes } = req.body; // confirmedBy: 'tutor' | 'parent'
```

#### getAttendance
```typescript
// ❌ OLD
const attendanceId = parseInt(req.params.attendanceId);

// ✅ NEW
const attendanceId = req.params.attendanceId;
```

#### getAttendanceBySchedule
```typescript
// ❌ OLD
const scheduleId = parseInt(req.params.scheduleId);

// ✅ NEW
const scheduleId = req.params.scheduleId;
```

#### getAttendanceHistory
```typescript
// ❌ OLD
const scheduleId = parseInt(req.params.scheduleId);

// ✅ NEW
const scheduleId = req.params.scheduleId;
```

#### getUserAttendance
```typescript
// ❌ OLD
const userId = parseInt(req.params.userId);

// ✅ NEW
const userId = req.params.userId;
```

#### getAttendanceStatistics
```typescript
// ❌ OLD
const userId = parseInt(req.params.userId);

// ✅ NEW
const userId = req.params.userId;
const classId = req.query.classId as string | undefined;
```

---

## 3. homeworkController.ts

### Changes Needed:

#### uploadMaterial
```typescript
// ❌ OLD (Request body)
{
  tutorId: number,
  title: string,
  fileUrl: string,
  fileType: string,
  fileSize: number
}

// ✅ NEW (Request body)
{
  class_id: string,     // Required
  schedule_id?: string, // Optional
  title: string,
  file_name: string,    // Changed
  file_url: string,     // Changed
  file_type?: string,   // Changed
  file_size?: number,   // Changed
  uploaded_by: string   // Required (user_id)
}
```

#### getMaterials
```typescript
// ❌ OLD
const tutorId = parseInt(req.params.tutorId);

// ✅ NEW
const class_id = req.query.classId as string;
const tutor_id = req.query.tutorId as string;
const schedule_id = req.query.scheduleId as string;
```

#### createHomework
```typescript
// ❌ OLD (Request body)
{
  tutorRequestId: number,
  title: string,
  description: string,
  dueDate: Date,
  assignedBy: number
}

// ✅ NEW (Request body)
{
  class_id: string,      // Changed
  schedule_id?: string,  // Optional
  title: string,
  description?: string,
  instructions?: string, // New field
  due_date: Date,        // Changed name
  assigned_by: string    // Changed type
}
```

#### getHomework
```typescript
// ❌ OLD (Query params)
{
  tutorRequestId?: number,
  studentId?: number,
  status?: string
}

// ✅ NEW (Query params)
{
  class_id?: string,
  schedule_id?: string,
  student_id?: string,
  status?: string,
  assigned_by?: string,
  due_after?: Date,
  due_before?: Date
}
```

#### getHomeworkById
```typescript
// ❌ OLD
const homeworkId = parseInt(req.params.homeworkId);

// ✅ NEW
const homeworkId = req.params.homeworkId;
```

#### updateHomework
```typescript
// ❌ OLD
const homeworkId = parseInt(req.params.homeworkId);

// ✅ NEW
const homeworkId = req.params.homeworkId;
```

#### submitHomework
```typescript
// ❌ OLD (Request body)
{
  homeworkId: number,
  studentId: number,
  fileUrl: string
}

// ✅ NEW (Request body)
{
  homework_id: string,  // Changed
  student_id: string,   // Changed
  file_name: string,    // New field
  file_url: string,     // Changed name
  file_size?: number    // New field
}
```

#### gradeSubmission
```typescript
// ❌ OLD
const submissionId = parseInt(req.params.submissionId);

// ✅ NEW
const submissionId = req.params.submissionId;

// ❌ OLD (Request body)
{
  grade: number,
  feedback: string
}

// ✅ NEW (Request body)
{
  score: number,         // Changed name
  max_score?: number,    // New field (default 100)
  feedback?: string,
  graded_by: string      // New field (user_id)
}
```

#### getSubmissions
```typescript
// ❌ OLD
const homeworkId = parseInt(req.params.homeworkId);

// ✅ NEW
const homeworkId = req.params.homeworkId;
```

#### getSubmission
```typescript
// ❌ OLD
const submissionId = parseInt(req.params.submissionId);

// ✅ NEW
const submissionId = req.params.submissionId;
```

---

## 🎯 Summary of Changes

### Type Changes
- All IDs: `number` → `string` (UUID)
- Attendance flags: `Date | null` → `boolean` + separate `Date | null` for timestamps

### Field Name Changes (camelCase → snake_case in database)
- `tutorId` → `tutor_id`
- `studentId` → `student_id`
- `classId` → `class_id`
- `scheduleId` → `schedule_id`
- `tutorRequestId` → `class_id` (different concept!)
- `startTime` → `start_date`
- `endTime` → `end_date`
- `dueDate` → `due_date`
- `fileUrl` → `file_url`
- `fileType` → `file_type`
- `fileSize` → `file_size`
- `assignedBy` → `assigned_by`
- `uploadedBy` → `uploaded_by`
- `gradedBy` → `graded_by`

### New Fields
- Attendance: `overall_status`, `tutor_notes`, `parent_notes`, `attendance_date`
- Homework: `instructions`, `max_score`
- Material: `file_name` (separate from url)

### Removed Concepts
- `TutorRequest` table - replaced by `Class` table
- Single confirmation timestamp - now separate for tutor and parent

---

## 🚀 Next Steps

1. **Update Controllers** - Apply all parseInt removals and field name changes
2. **Update Services** - Ensure services pass correct field names to queries
3. **Update Routes** - Update Swagger docs with UUID format
4. **Test APIs** - Use Swagger UI to test all endpoints

## ⚠️ Important Notes

- UUIDs are passed as strings in URLs and JSON
- No need to validate UUID format manually (database will reject invalid UUIDs)
- All foreign key references must use UUIDs
- BIT fields (0/1 in SQL) map to boolean in TypeScript
- snake_case in database, camelCase in TypeScript interfaces (query layer handles conversion)
