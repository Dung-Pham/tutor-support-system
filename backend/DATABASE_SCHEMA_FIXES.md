# Database Schema Fixes Required

## Summary
The current query modules were built based on assumptions about the database schema. After reviewing `SQLTSSupportServer.sql`, there are significant differences that need to be corrected.

## Key Differences

### 1. ID Types
- **Current**: INT (e.g., `tutorRequestId: number`)
- **Actual**: UNIQUEIDENTIFIER (e.g., `class_id: string` as UUID)
- **Impact**: ALL queries using ID parameters and foreign keys

### 2. Table Structure

#### Schedule Table
**Current (Wrong)**:
```typescript
{
  id: number,
  tutorRequestId: number,
  startTime: Date,
  endTime: Date,
  status: string,
  notes: string
}
```

**Actual (Correct from SQL)**:
```sql
CREATE TABLE [Schedule] (
    schedule_id UNIQUEIDENTIFIER PRIMARY KEY,
    class_id UNIQUEIDENTIFIER NOT NULL,
    tutor_id UNIQUEIDENTIFIER NOT NULL,
    student_id UNIQUEIDENTIFIER NOT NULL,
    parent_id UNIQUEIDENTIFIER NOT NULL,
    start_date DATETIME2 NOT NULL,
    end_date DATETIME2 NOT NULL,
    duration_minutes INT NOT NULL,
    day_of_week TINYINT,
    recurrence_type VARCHAR(20),
    original_schedule_id UNIQUEIDENTIFIER,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_locked BIT DEFAULT 0,
    lock_reason NVARCHAR(500),
    tutor_name NVARCHAR(255),
    student_name NVARCHAR(255),
    class_name NVARCHAR(255),
    year_month SMALLINT,
    created_at DATETIME2,
    updated_at DATETIME2
)
```

#### AttendanceRecord Table
**Current (Wrong)**:
```typescript
{
  attendanceId: number,
  scheduleId: number,
  tutorConfirmedAt: Date,
  parentConfirmedAt: Date
}
```

**Actual (Correct)**:
```sql
CREATE TABLE [AttendanceRecord] (
    attendance_id UNIQUEIDENTIFIER PRIMARY KEY,
    schedule_id UNIQUEIDENTIFIER NOT NULL,
    class_id UNIQUEIDENTIFIER NOT NULL,
    attendance_date DATE NOT NULL,
    tutor_confirmed BIT DEFAULT 0,
    tutor_confirmed_at DATETIME2,
    tutor_notes NVARCHAR(1000),
    parent_confirmed BIT DEFAULT 0,
    parent_confirmed_at DATETIME2,
    parent_notes NVARCHAR(1000),
    overall_status VARCHAR(50) DEFAULT 'PENDING',
    created_at DATETIME2,
    updated_at DATETIME2
)
```

#### ProgressEvaluation Table
**Current (Wrong)**:
```typescript
{
  evaluationId: number,
  scheduleId: number,
  studentId: number,
  understanding: number,
  participation: number,
  homework: number,
  behavior: number
}
```

**Actual (Correct)**:
```sql
CREATE TABLE [ProgressEvaluation] (
    evaluation_id UNIQUEIDENTIFIER PRIMARY KEY,
    attendance_id UNIQUEIDENTIFIER NOT NULL,
    class_id UNIQUEIDENTIFIER NOT NULL,
    schedule_id UNIQUEIDENTIFIER NOT NULL,
    overall_rating INT NOT NULL,
    competency_level VARCHAR(50),
    comments NVARCHAR(2000),
    understanding_score INT,
    participation_score INT,
    homework_completion INT,
    behavior_score INT,
    areas_to_improve NVARCHAR(1000),
    strengths NVARCHAR(1000),
    evaluated_by UNIQUEIDENTIFIER NOT NULL,
    evaluated_at DATETIME2,
    created_at DATETIME2,
    updated_at DATETIME2
)
```

#### Material & Homework Tables
**Current**: Separate concepts
**Actual**: Linked to Class and Schedule
```sql
CREATE TABLE [Material] (
    material_id UNIQUEIDENTIFIER PRIMARY KEY,
    class_id UNIQUEIDENTIFIER NOT NULL,
    schedule_id UNIQUEIDENTIFIER,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2,
    updated_at DATETIME2
)

CREATE TABLE [Homework] (
    homework_id UNIQUEIDENTIFIER PRIMARY KEY,
    class_id UNIQUEIDENTIFIER NOT NULL,
    schedule_id UNIQUEIDENTIFIER,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(2000),
    instructions NVARCHAR(2000),
    due_date DATETIME2 NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    assigned_by UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2,
    updated_at DATETIME2
)

CREATE TABLE [HomeworkSubmission] (
    submission_id UNIQUEIDENTIFIER PRIMARY KEY,
    homework_id UNIQUEIDENTIFIER NOT NULL,
    student_id UNIQUEIDENTIFIER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    submitted_at DATETIME2,
    score INT,
    max_score INT DEFAULT 100,
    feedback NVARCHAR(2000),
    graded_at DATETIME2,
    graded_by UNIQUEIDENTIFIER,
    created_at DATETIME2,
    updated_at DATETIME2
)
```

#### ChatMessage Table
**Current (Wrong)**:
```typescript
{
  messageId: number,
  senderId: number,
  receiverId: number,
  scheduleId: number
}
```

**Actual (Correct)**:
```sql
CREATE TABLE [ChatMessage] (
    message_id UNIQUEIDENTIFIER PRIMARY KEY,
    class_id UNIQUEIDENTIFIER NOT NULL,
    sender_id UNIQUEIDENTIFIER NOT NULL,
    receiver_id UNIQUEIDENTIFIER NOT NULL,
    content NVARCHAR(2000),
    message_type VARCHAR(50) DEFAULT 'TEXT',
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    is_read BIT DEFAULT 0,
    read_at DATETIME2,
    created_at DATETIME2
)
```

#### Notification Table
**Current (Wrong)**:
```typescript
{
  notificationId: number,
  userId: number,
  scheduleId: number
}
```

**Actual (Correct)**:
```sql
CREATE TABLE [Notification] (
    notification_id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    class_id UNIQUEIDENTIFIER,
    notification_type VARCHAR(100) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(1000),
    related_resource_id UNIQUEIDENTIFIER,
    is_read BIT DEFAULT 0,
    read_at DATETIME2,
    created_at DATETIME2
)
```

#### ProgressStatistics Table
**Current (Wrong)**:
```typescript
{
  statisticsId: number,
  studentId: number,
  monthYear: string
}
```

**Actual (Correct)**:
```sql
CREATE TABLE [ProgressStatistics] (
    stat_id UNIQUEIDENTIFIER PRIMARY KEY,
    class_id UNIQUEIDENTIFIER NOT NULL,
    month_year SMALLINT NOT NULL,
    total_sessions INT DEFAULT 0,
    completed_sessions INT DEFAULT 0,
    cancelled_sessions INT DEFAULT 0,
    absent_sessions INT DEFAULT 0,
    avg_overall_rating DECIMAL(3, 2),
    avg_understanding_score DECIMAL(5, 2),
    avg_participation_score DECIMAL(5, 2),
    avg_homework_score DECIMAL(5, 2),
    avg_behavior_score DECIMAL(5, 2),
    completion_rate DECIMAL(5, 2),
    last_updated DATETIME2
)
```

### 3. Field Naming Convention
**Current**: camelCase (e.g., `tutorId`, `startTime`)
**Actual**: snake_case (e.g., `tutor_id`, `start_date`)

### 4. Core Relationship
**Current**: Everything links to `TutorRequest` table
**Actual**: Everything links to `Class` table
- Class has: tutor_id, student_id, parent_id
- Schedule links to: class_id + tutor_id + student_id + parent_id
- No TutorRequest in Module VI operations

### 5. Additional Tables in Actual Schema
Tables that exist but not covered in queries:
- `[User]`, `[TutorProfile]`, `[StudentProfile]`, `[ParentProfile]`
- `[Class]` - **CENTRAL TABLE** linking tutor, student, parent
- `[RescheduleRequest]` - Has more fields than implemented
- `[MonthlyActivitySummary]`
- `[TutorRequest]`, `[TutorApplication]` - For matching, not teaching
- `[TutorReview]` - Rating system
- `[Favorite]`

## Files Requiring Updates

### 1. Query Modules (Priority: HIGH)
All files in `src/database/queries/`:
- ✅ `scheduleQueries.ts` - NEW version created
- ❌ `attendanceQueries.ts` - Needs rewrite
- ❌ `evaluationQueries.ts` - Needs rewrite
- ❌ `homeworkQueries.ts` - Needs rewrite
- ❌ `chatQueries.ts` - Needs rewrite
- ❌ `notificationQueries.ts` - Needs rewrite
- ❌ `statisticsQueries.ts` - Needs rewrite

### 2. TypeScript Interfaces (Priority: HIGH)
File: `src/types/index.ts` or create new `src/types/database.ts`
- Change all ID types from `number` to `string`
- Update all field names to snake_case
- Add missing fields from SQL schema
- Update DTOs to match actual table structure

### 3. Controllers (Priority: MEDIUM)
All files in `src/controllers/`:
- Update to handle UUID strings instead of numbers
- Update field name references
- Update query function calls

### 4. Routes (Priority: LOW)
Files in `src/routes/`:
- Update parameter validation for UUIDs
- Update Swagger documentation

### 5. Validators (Priority: MEDIUM)
File: `src/utils/validators.ts`
- Already has UUID validation ✅
- Ensure all validators match SQL schema constraints

## Action Plan

### Phase 1: Core Infrastructure (IMMEDIATE)
1. ✅ Create corrected `scheduleQueries.ts` 
2. Create corrected `attendanceQueries.ts`
3. Create corrected `evaluationQueries.ts`
4. Create corrected `homeworkQueries.ts`
5. Create corrected `chatQueries.ts`
6. Create corrected `notificationQueries.ts`
7. Create corrected `statisticsQueries.ts`

### Phase 2: Type Definitions (IMMEDIATE)
1. Create `src/types/database.ts` with correct interfaces
2. Export all database types
3. Remove old incorrect types

### Phase 3: Controllers (NEXT)
1. Update schedule controller
2. Update attendance controller
3. Update evaluation controller
4. Update homework controller
5. Update chat controller

### Phase 4: Testing (FINAL)
1. Test with actual SQL Server database
2. Verify all CRUD operations
3. Test JOIN queries
4. Verify UUID handling

## Critical Notes

1. **UUID Format**: SQL Server UUIDs are stored as UNIQUEIDENTIFIER, JavaScript handles as strings
2. **snake_case vs camelCase**: SQL uses snake_case, TypeScript typically uses camelCase - decide on mapping strategy
3. **BIT vs BOOLEAN**: SQL Server BIT (0/1) should map to TypeScript boolean
4. **DATETIME2**: Maps to JavaScript Date object
5. **Class Table**: This is the central linking table - all operations should reference it

## Migration Strategy

**Option A: Big Bang** (NOT RECOMMENDED)
- Replace all files at once
- High risk of breaking everything

**Option B: Gradual Migration** (RECOMMENDED)
1. Create new query files with `.new.ts` extension
2. Test each query module individually
3. Update one controller at a time
4. Test each API endpoint
5. Once verified, replace old files

**Option C: Create New Module** (SAFEST)
1. Keep old `src/database/queries/` as is
2. Create `src/database/queries-v2/` with corrected versions
3. Update imports gradually
4. Remove old version when migration complete

## Next Steps

Choose migration strategy and begin with Phase 1.

Recommended: Use Option B (Gradual Migration) starting with scheduleQueries.ts which is already created.
