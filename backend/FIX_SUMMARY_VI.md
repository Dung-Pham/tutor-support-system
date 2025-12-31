# Tổng Quan Vấn Đề và Giải Pháp

## 🔴 Vấn Đề Chính

Các API Module VI đã được tạo dựa trên **giả định sai** về cấu trúc database:

| Khía Cạnh | Code Hiện Tại (SAI) | Database Thực Tế (ĐÚNG) |
|-----------|---------------------|--------------------------|
| **ID Type** | `number` (INT) | `string` (UNIQUEIDENTIFIER/UUID) |
| **Field Names** | camelCase (`tutorId`, `startTime`) | snake_case (`tutor_id`, `start_date`) |
| **Bảng Trung Tâm** | `TutorRequest` | `Class` |
| **Schedule Fields** | `tutorRequestId`, `startTime`, `endTime`, `notes` | `class_id`, `tutor_id`, `student_id`, `parent_id`, `start_date`, `end_date`, `duration_minutes`, `status`, `is_locked` |
| **Attendance Fields** | `scheduleId`, `tutorConfirmedAt`, `parentConfirmedAt` | `schedule_id`, `class_id`, `tutor_confirmed`, `tutor_confirmed_at`, `parent_confirmed`, `parent_confirmed_at`, `overall_status` |

## 📊 Ví Dụ Cụ Thể: Schedule Table

### Code Hiện Tại (SAI ❌)
```typescript
interface Schedule {
  id: number;
  tutorRequestId: number;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string;
}

// Query
INSERT INTO Schedule (tutorRequestId, startTime, endTime, status, notes)
VALUES (@tutorRequestId, @startTime, @endTime, @status, @notes)
```

### Database Thực Tế (ĐÚNG ✅)
```typescript
interface Schedule {
  schedule_id: string;  // UUID
  class_id: string;     // UUID
  tutor_id: string;     // UUID
  student_id: string;   // UUID
  parent_id: string;    // UUID
  start_date: Date;
  end_date: Date;
  duration_minutes: number;
  day_of_week?: number;
  recurrence_type?: string;
  status: string;
  is_locked: boolean;
  lock_reason?: string;
  tutor_name?: string;
  student_name?: string;
  class_name?: string;
}

// Query
INSERT INTO [Schedule] (
  class_id, tutor_id, student_id, parent_id,
  start_date, end_date, duration_minutes, status
)
VALUES (
  @class_id, @tutor_id, @student_id, @parent_id,
  @start_date, @end_date, @duration_minutes, @status
)
```

## 🎯 Ảnh Hưởng

### 7 Files Cần Sửa Lại Hoàn Toàn:
1. ✅ `scheduleQueries.ts` - Đã tạo version mới
2. ❌ `attendanceQueries.ts`
3. ❌ `evaluationQueries.ts`
4. ❌ `homeworkQueries.ts`
5. ❌ `chatQueries.ts`
6. ❌ `notificationQueries.ts`
7. ❌ `statisticsQueries.ts`

### Controllers cần cập nhật:
- `scheduleController.ts`
- `attendanceController.ts`
- `evaluationController.ts`
- `homeworkController.ts`
- `chatController.ts`

### Routes cần cập nhật:
- Swagger documentation
- Param validation (INT → UUID)

## 💡 Giải Pháp Đề Xuất

### Option 1: Sửa Từng Phần (An Toàn - Khuyến Nghị) ⭐
```
1. Sửa 1 query module (VD: scheduleQueries.ts) ✅ ĐÃ LÀM
2. Sửa controller tương ứng
3. Test API endpoints
4. Lặp lại với module tiếp theo
```

**Ưu điểm**: 
- Kiểm soát được từng bước
- Phát hiện lỗi sớm
- Không phá vỡ code đang chạy

**Thời gian**: ~2-3 giờ

### Option 2: Sửa Tất Cả Cùng Lúc (Nhanh nhưng Rủi Ro) ⚠️
```
1. Sửa cả 7 query modules
2. Sửa tất cả controllers
3. Test tổng thể
```

**Ưu điểm**: Nhanh
**Nhược điểm**: Nhiều lỗi cùng lúc, khó debug

### Option 3: Tạo Module Mới (Safest) 🛡️
```
1. Giữ nguyên src/database/queries/
2. Tạo src/database/queries-v2/ với code đúng
3. Từ từ chuyển sang dùng v2
4. Xóa v1 khi hoàn thành
```

## 📝 Chi Tiết Từng Bảng Cần Sửa

### 1. AttendanceRecord
```sql
-- Actual Schema
CREATE TABLE [AttendanceRecord] (
    attendance_id UNIQUEIDENTIFIER PRIMARY KEY,
    schedule_id UNIQUEIDENTIFIER NOT NULL,
    class_id UNIQUEIDENTIFIER NOT NULL,
    attendance_date DATE NOT NULL,
    tutor_confirmed BIT DEFAULT 0,           -- ⚠️ Là BIT, không phải DATETIME
    tutor_confirmed_at DATETIME2,            -- ⚠️ Riêng timestamp
    tutor_notes NVARCHAR(1000),              -- ⚠️ Có notes
    parent_confirmed BIT DEFAULT 0,          -- ⚠️ Là BIT
    parent_confirmed_at DATETIME2,           -- ⚠️ Riêng timestamp
    parent_notes NVARCHAR(1000),             -- ⚠️ Có notes
    overall_status VARCHAR(50) DEFAULT 'PENDING',  -- ⚠️ Status tổng hợp
    created_at DATETIME2,
    updated_at DATETIME2
)
```

**Sai lầm trong code hiện tại**:
- ✗ Thiếu `tutor_confirmed` và `parent_confirmed` (BIT flags)
- ✗ Thiếu `tutor_notes` và `parent_notes`
- ✗ Thiếu `overall_status`
- ✗ Thiếu `attendance_date`

### 2. ProgressEvaluation
```sql
-- Actual Schema
CREATE TABLE [ProgressEvaluation] (
    evaluation_id UNIQUEIDENTIFIER PRIMARY KEY,
    attendance_id UNIQUEIDENTIFIER NOT NULL,  -- ⚠️ Link to Attendance
    class_id UNIQUEIDENTIFIER NOT NULL,
    schedule_id UNIQUEIDENTIFIER NOT NULL,
    overall_rating INT NOT NULL,              -- ⚠️ Tên field khác
    competency_level VARCHAR(50),             -- ⚠️ Có thêm field này
    comments NVARCHAR(2000),
    understanding_score INT,                  -- ⚠️ Tên có "_score"
    participation_score INT,                  -- ⚠️ Tên có "_score"
    homework_completion INT,                  -- ⚠️ Tên khác
    behavior_score INT,                       -- ⚠️ Tên có "_score"
    areas_to_improve NVARCHAR(1000),          -- ⚠️ Có thêm
    strengths NVARCHAR(1000),                 -- ⚠️ Có thêm
    evaluated_by UNIQUEIDENTIFIER NOT NULL,   -- ⚠️ Có thêm
    evaluated_at DATETIME2,
    created_at DATETIME2,
    updated_at DATETIME2
)
```

### 3. Homework & HomeworkSubmission
```sql
-- Material: Tài liệu học tập
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

-- Homework: Bài tập
CREATE TABLE [Homework] (
    homework_id UNIQUEIDENTIFIER PRIMARY KEY,
    class_id UNIQUEIDENTIFIER NOT NULL,
    schedule_id UNIQUEIDENTIFIER,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(2000),
    instructions NVARCHAR(2000),              -- ⚠️ Có instructions riêng
    due_date DATETIME2 NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    assigned_by UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2,
    updated_at DATETIME2
)

-- HomeworkSubmission: Nộp bài
CREATE TABLE [HomeworkSubmission] (
    submission_id UNIQUEIDENTIFIER PRIMARY KEY,
    homework_id UNIQUEIDENTIFIER NOT NULL,
    student_id UNIQUEIDENTIFIER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    submitted_at DATETIME2,
    score INT,
    max_score INT DEFAULT 100,                -- ⚠️ Có max_score
    feedback NVARCHAR(2000),
    graded_at DATETIME2,
    graded_by UNIQUEIDENTIFIER,
    created_at DATETIME2,
    updated_at DATETIME2
)
```

### 4. ChatMessage
```sql
CREATE TABLE [ChatMessage] (
    message_id UNIQUEIDENTIFIER PRIMARY KEY,
    class_id UNIQUEIDENTIFIER NOT NULL,       -- ⚠️ Link to class, không phải schedule
    sender_id UNIQUEIDENTIFIER NOT NULL,
    receiver_id UNIQUEIDENTIFIER NOT NULL,
    content NVARCHAR(2000),
    message_type VARCHAR(50) DEFAULT 'TEXT',  -- ⚠️ Có message_type
    file_url VARCHAR(500),                    -- ⚠️ Hỗ trợ file
    file_name VARCHAR(255),                   -- ⚠️ Hỗ trợ file
    is_read BIT DEFAULT 0,
    read_at DATETIME2,
    created_at DATETIME2
)
```

### 5. ProgressStatistics
```sql
CREATE TABLE [ProgressStatistics] (
    stat_id UNIQUEIDENTIFIER PRIMARY KEY,
    class_id UNIQUEIDENTIFIER NOT NULL,       -- ⚠️ Link to class, không phải student
    month_year SMALLINT NOT NULL,             -- ⚠️ Format: YYYYMM (202411)
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

## 🚀 Bước Tiếp Theo

Bạn muốn:

### A. Tôi sửa tất cả 7 query modules ngay bây giờ? (2-3 giờ)
- Tạo 6 files còn lại với schema đúng
- Bạn test sau

### B. Tôi sửa từng module và test ngay? (An toàn hơn)
- Sửa 1 module (VD: attendance)
- Sửa controller tương ứng
- Bạn test
- Tiếp tục module tiếp theo

### C. Tôi chỉ tạo file templates và bạn tự hoàn thiện?
- Tạo skeleton code
- Bạn điền logic

### D. Bạn muốn giải pháp khác?

**Khuyến nghị của tôi**: Option B - Sửa và test từng module để đảm bảo chất lượng. Bắt đầu với `attendanceQueries.ts` vì nó được dùng nhiều.

Bạn chọn option nào? 🤔
