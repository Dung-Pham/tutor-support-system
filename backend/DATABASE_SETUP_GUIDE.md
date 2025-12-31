# HƯỚNG DẪN SETUP DATABASE VÀ TEST API

## 📋 Tổng quan
Tài liệu này hướng dẫn setup SQL Server database và test các APIs đã fix.

---

## 🔧 Bước 1: Cài đặt SQL Server

### Option 1: SQL Server Express (Windows)
```bash
# Download từ: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
# Chọn SQL Server 2019 Express hoặc mới hơn
# Trong quá trình cài đặt:
# - Chọn "Basic" installation
# - Nhớ password của SA account
```

### Option 2: SQL Server trong Docker
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
   -p 1433:1433 --name sqlserver \
   -d mcr.microsoft.com/mssql/server:2019-latest
```

### Kiểm tra SQL Server đã chạy chưa
```bash
# Windows - PowerShell
Get-Service MSSQLSERVER

# Hoặc kiểm tra port 1433
Test-NetConnection -ComputerName localhost -Port 1433

# Docker
docker ps | findstr sqlserver
```

---

## 🗄️ Bước 2: Tạo Database

### 2.1. Kết nối vào SQL Server
**Option A: SQL Server Management Studio (SSMS)**
```
Server: localhost
Authentication: SQL Server Authentication
Login: sa
Password: YourStrong@Passw0rd
```

**Option B: Azure Data Studio**
```
Connection type: Microsoft SQL Server
Server: localhost
Authentication type: SQL Login
User name: sa
Password: YourStrong@Passw0rd
```

**Option C: Command Line (sqlcmd)**
```bash
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd"
```

### 2.2. Chạy file tạo database
```sql
-- File: backend/SQLTSSupportServer.sql
-- Mở file này trong SSMS hoặc Azure Data Studio và Execute (F5)
-- Hoặc dùng sqlcmd:
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -i SQLTSSupportServer.sql
```

✅ **Kết quả:** Database `TutorSupportSystem` được tạo với 13 tables

---

## 📝 Bước 3: Cấu hình Backend

### 3.1. Kiểm tra file .env
```bash
# File: backend/.env
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_DATABASE=TutorSupportSystem
MSSQL_USER=sa
MSSQL_PASSWORD=YourStrong@Passw0rd
MSSQL_ENCRYPT=true
MSSQL_TRUST_SERVER_CERTIFICATE=true
```

⚠️ **LƯU Ý:** Nếu password của bạn khác, hãy update `MSSQL_PASSWORD`

### 3.2. Test kết nối database
```bash
cd backend
npm run db:test
```

✅ **Kết quả mong đợi:**
```
🔄 Testing SQL Server Connection...

✅ SQL Server Connected successfully
📦 Database: TutorSupportSystem
🖥️  Host: localhost:1433
👤 User: sa

📊 Found 13 tables:
   1. AttendanceRecord
   2. ChatMessage
   3. Class
   4. Homework
   5. HomeworkSubmission
   6. Material
   7. Notification
   8. ParentProfile
   9. ProgressEvaluation
   10. ProgressStatistics
   11. Schedule
   12. StudentProfile
   13. TutorProfile
   14. User

📈 Record counts:
   User: 0 records
   Class: 0 records
   Schedule: 0 records
   ...

✅ Database connection test complete!
```

---

## 🌱 Bước 4: Seed dữ liệu mẫu

### 4.1. Chạy seed script
```bash
npm run db:seed
```

✅ **Kết quả mong đợi:**
```
🌱 Running seed data...

📦 Executing SQL batches...

   ✓ Cleared User
   ✓ Cleared Class
   ✓ Inserted data into User
   ✓ Inserted data into TutorProfile
   ✓ Inserted data into StudentProfile
   ✓ Inserted data into ParentProfile
   ✓ Inserted data into Class
   ✓ Inserted data into Schedule
   ✓ Inserted data into AttendanceRecord
   ✓ Inserted data into Material
   ✓ Inserted data into Homework
   ✓ Inserted data into HomeworkSubmission

✅ Seed data executed successfully!

========================================
SEED DATA COMPLETE!
========================================
Users: 12 (3 tutors, 4 students, 4 parents, 1 admin)
Classes: 4 active classes
Schedules: 6 upcoming sessions
Attendance: 1 record (tutor confirmed)
Materials: 2 files
Homework: 2 assignments
Submissions: 1 (pending grading)
========================================
```

### 4.2. Dữ liệu mẫu đã tạo

**👥 Users:**
- 3 Tutors: Nguyễn Văn A (Toán), Trần Thị B (IELTS), Lê Văn C (Lập trình)
- 4 Students: Phạm Minh D, Hoàng Thị E, Võ Văn F, Đặng Thị G
- 4 Parents: Tương ứng với 4 học sinh
- 1 Admin

**📚 Classes:**
1. Toán học - Lớp 10 (Tutor 1 → Student 1)
2. Tiếng Anh IELTS - Lớp 11 (Tutor 2 → Student 2)
3. Vật lý - Lớp 12 (Tutor 1 → Student 3)
4. Lập trình Web - Đại học (Tutor 3 → Student 4)

**📅 Schedules:**
- 6 buổi học sắp tới (18-23 Nov 2025)
- Địa điểm: Nhà học sinh, Trung tâm, Online

**📊 Attendance:**
- 1 bản ghi (tutor đã confirm, chờ parent confirm)

**📄 Materials:**
- 2 tài liệu (Hàm số, IELTS Speaking)

**📝 Homework:**
- 2 bài tập (Toán, IELTS Writing)
- 1 bài nộp (chờ chấm)

---

## 🚀 Bước 5: Start Backend Server

```bash
npm run dev
```

✅ **Kết quả mong đợi:**
```
[nodemon] starting `ts-node src/server.ts`
✅ SQL Server Connected successfully
✅ MongoDB Connected successfully
📝 Swagger docs available at http://localhost:5000/api-docs
🚀 Server running on port 5000
```

---

## 🧪 Bước 6: Test APIs qua Swagger UI

### 6.1. Mở Swagger UI
```
http://localhost:5000/api-docs
```

### 6.2. Test các APIs đã fix

#### 🗓️ **Module 1: Schedule Management**

**Test 1: Get all schedules**
```
GET /api/schedules
Query params:
  - page: 1
  - limit: 10
```
✅ **Expected:** Trả về 6 schedules với UUID strings

**Test 2: Get calendar view**
```
GET /api/schedules/calendar
Query params:
  - userId: <copy từ database>
  - userRole: tutor
  - date: 2025-11-18
```
✅ **Expected:** Trả về schedules của tutor trong ngày

**Test 3: Get schedule by ID**
```
GET /api/schedules/{scheduleId}
Path param:
  - scheduleId: <copy UUID từ database>
```
✅ **Expected:** Chi tiết schedule với tutor_id, student_id, class_id (UUID format)

#### ✅ **Module 2: Attendance Management**

**Test 1: Get or create attendance**
```
POST /api/attendance/schedule/{scheduleId}
Path param:
  - scheduleId: <UUID của schedule đầu tiên>
```
✅ **Expected:** Attendance record với tutor_confirmed=true, parent_confirmed=false

**Test 2: Confirm attendance (as Parent)**
```
PUT /api/attendance/{attendanceId}/confirm
Path param:
  - attendanceId: <UUID từ test trước>
Body:
{
  "confirmedBy": "<parent1_id UUID>",
  "notes": "Xác nhận con đã học đầy đủ"
}
```
✅ **Expected:** overall_status chuyển sang "CONFIRMED"

**Test 3: Get attendance history**
```
GET /api/attendance/history
Query params:
  - userId: <tutor1_id UUID>
  - role: tutor
  - page: 1
  - limit: 10
```
✅ **Expected:** List attendance records của tutor

#### 📚 **Module 3: Materials & Homework**

**Test 1: Get materials by class**
```
GET /api/materials
Query params:
  - classId: <class1_id UUID>
```
✅ **Expected:** 1 material "Bài giảng Hàm số"

**Test 2: Get homework list**
```
GET /api/homework
Query params:
  - classId: <class1_id UUID>
  - status: assigned
```
✅ **Expected:** 1 homework "Bài tập Hàm số"

**Test 3: Get submissions by homework**
```
GET /api/homework/{homeworkId}/submissions
Path param:
  - homeworkId: <homework1_id UUID>
```
✅ **Expected:** 1 submission status="submitted" (chờ chấm)

**Test 4: Grade submission**
```
PUT /api/homework/submissions/{submissionId}/grade
Path param:
  - submissionId: <UUID từ test trước>
Body:
{
  "score": 85,
  "feedback": "Bài làm tốt, cần chú ý phần cuối",
  "gradedBy": "<tutor1_id UUID>"
}
```
✅ **Expected:** Submission status="graded", score=85

---

## 🎯 Checklist Test

### Database
- [ ] SQL Server đang chạy (port 1433 open)
- [ ] Database `TutorSupportSystem` đã tạo (13 tables)
- [ ] npm run db:test thành công
- [ ] npm run db:seed thành công (12 users, 4 classes)

### Backend Server
- [ ] npm run dev thành công
- [ ] Không có TypeScript errors
- [ ] SQL Server connected ✅
- [ ] Swagger UI accessible tại http://localhost:5000/api-docs

### API Testing
- [ ] Schedule APIs: GET schedules, calendar view (UUID format)
- [ ] Attendance APIs: Create, confirm, history (tutor_confirmed/parent_confirmed)
- [ ] Material APIs: Get by class (file_name, uploaded_by)
- [ ] Homework APIs: Get, submissions, grade (separate Material/Homework/Submission)

---

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to SQL Server"
```bash
# Kiểm tra SQL Server service
Get-Service MSSQLSERVER

# Nếu stopped, start nó
Start-Service MSSQLSERVER

# Kiểm tra port
Test-NetConnection -ComputerName localhost -Port 1433
```

### Lỗi: "Login failed for user 'sa'"
```bash
# Đảm bảo SQL Server Authentication enabled
# Enable trong SSMS: Server Properties → Security → SQL Server and Windows Authentication mode
# Sau đó restart SQL Server service
```

### Lỗi: "Database 'TutorSupportSystem' does not exist"
```bash
# Chạy lại file tạo database
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -i SQLTSSupportServer.sql
```

### Lỗi: "Foreign key constraint" khi seed
```bash
# Database chưa đúng schema, chạy lại từ đầu:
# 1. Drop database cũ
# 2. Chạy SQLTSSupportServer.sql
# 3. Chạy seed_data.sql
```

---

## 📞 Commands Reference

```bash
# Test connection only
npm run db:test

# Seed sample data
npm run db:seed

# Start dev server
npm run dev

# Build TypeScript
npm run build

# Start production
npm start
```

---

## ✅ Completion Checklist

Sau khi hoàn thành tất cả các bước:

1. ✅ Database có 12 users, 4 classes, 6 schedules
2. ✅ Backend server chạy không lỗi
3. ✅ Swagger UI hiển thị tất cả routes
4. ✅ Schedule APIs trả về UUID strings
5. ✅ Attendance APIs xử lý dual confirmation
6. ✅ Homework APIs tách Material/Homework/Submission
7. ✅ Không có parseInt() errors
8. ✅ JOIN queries với Class table hoạt động

**🎉 Congratulations! Hệ thống đã sẵn sàng để test!**
