# 🚀 QUICK START - Test APIs

## Điều kiện tiên quyết
- ✅ SQL Server đang chạy (localhost:1433)
- ✅ Database `TutorSupportSystem` đã tạo từ `SQLTSSupportServer.sql`

## Các bước thực hiện

### 1️⃣ Test kết nối database
```bash
cd backend
npm run db:test
```

**Kết quả mong đợi:**
```
✅ SQL Server Connected successfully
📊 Found 13 tables
```

### 2️⃣ Seed dữ liệu mẫu
```bash
npm run db:seed
```

**Dữ liệu được tạo:**
- 12 users (3 tutors, 4 students, 4 parents, 1 admin)
- 4 classes (Toán, IELTS, Vật lý, Lập trình)
- 6 schedules (18-23 Nov 2025)
- 1 attendance record
- 2 materials, 2 homework, 1 submission

### 3️⃣ Start backend server
```bash
npm run dev
```

### 4️⃣ Test APIs
Mở trình duyệt: **http://localhost:5000/api-docs**

#### Test Schedule APIs:
```
GET /api/schedules
GET /api/schedules/calendar?userId=<UUID>&userRole=tutor&date=2025-11-18
GET /api/schedules/{scheduleId}
```

#### Test Attendance APIs:
```
POST /api/attendance/schedule/{scheduleId}
PUT /api/attendance/{attendanceId}/confirm
GET /api/attendance/history?userId=<UUID>&role=tutor
```

#### Test Homework APIs:
```
GET /api/materials?classId=<UUID>
GET /api/homework?classId=<UUID>&status=assigned
GET /api/homework/{homeworkId}/submissions
PUT /api/homework/submissions/{submissionId}/grade
```

---

## 🔑 Test Accounts

**Tutor 1 (Nguyễn Văn A - Toán):**
- Username: `tutor1`
- Email: `nguyen.van.a@gmail.com`

**Student 1 (Phạm Minh D - Học Toán):**
- Username: `student1`
- Email: `pham.minh.d@gmail.com`

**Parent 1 (Phạm Văn H):**
- Username: `parent1`
- Email: `pham.van.h@gmail.com`

*Password: `Test123456` (hashed trong database)*

---

## ✅ Các điểm cần verify

1. **UUID Format:**
   - ✅ Tất cả IDs trả về là UUID strings (không phải numbers)
   - ✅ Không có lỗi parseInt()

2. **Attendance:**
   - ✅ `tutor_confirmed` và `parent_confirmed` là boolean (BIT)
   - ✅ `overall_status`: PENDING → CONFIRMED

3. **Homework:**
   - ✅ Material, Homework, Submission tách riêng
   - ✅ `file_name` riêng với `file_url`
   - ✅ Grading workflow hoạt động

4. **Database Schema:**
   - ✅ JOIN với `Class` table (không phải TutorRequest)
   - ✅ snake_case field names trong database
   - ✅ camelCase trong TypeScript

---

## 🐛 Troubleshooting

**SQL Server không connect được:**
```bash
# Windows PowerShell
Get-Service MSSQLSERVER
Start-Service MSSQLSERVER
```

**Database chưa có:**
```bash
# Chạy file SQL tạo database
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -i SQLTSSupportServer.sql
```

**Seed failed:**
```bash
# Clear và chạy lại
# Xóa dữ liệu cũ (seed script tự clear)
npm run db:seed
```

---

## 📚 Tài liệu đầy đủ

Xem **DATABASE_SETUP_GUIDE.md** để biết chi tiết:
- Cài đặt SQL Server
- Troubleshooting đầy đủ
- Test cases chi tiết
- Checklist hoàn chỉnh

---

**💡 TIP:** Copy UUID từ response API để dùng cho các request tiếp theo. Swagger UI có nút "Copy" tiện lợi!
