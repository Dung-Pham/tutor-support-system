# Kịch bản Sử dụng Hệ thống Gia sư

## Luồng chính: Phụ huynh tạo lớp → Gia sư ứng tuyển → Phụ huynh chọn gia sư

### 1. Phụ huynh đăng ký tài khoản và tạo lớp học

**Bước 1.1**: Phụ huynh đăng ký tài khoản
```bash
POST /api/users
{
  "email": "parent@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "role": "parent"
}
```

**Bước 1.2**: Phụ huynh tạo lớp học cần tìm gia sư
```bash
POST /api/classes
{
  "parentId": "63f1a2b3c4d5e6f7g8h9i0j1",
  "subject": "Toán Lớp 10",
  "description": "Cần gia sư dạy Toán lớp 10, học sinh đang học chương trình nâng cao",
  "requirements": "Gia sư có kinh nghiệm dạy học sinh giỏi, tốt nghiệp từ các trường đại học hàng đầu",
  "schedule": "Thứ 2, 4, 6 - 19:00-21:00",
  "budget": 200000,
  "location": "Quận Cầu Giấy, Hà Nội",
  "studentLevel": "Lớp 10 chuyên",
  "sessionsPerWeek": 3
}
```

### 2. Gia sư tìm kiếm và ứng tuyển vào lớp học

**Bước 2.1**: Gia sư đăng ký tài khoản
```bash
POST /api/users
{
  "email": "tutor1@example.com",
  "password": "password123",
  "name": "Trần Thị B",
  "role": "tutor"
}
```

**Bước 2.2**: Gia sư xem danh sách các lớp đang mở
```bash
GET /api/classes?status=open&subject=Toán
```

**Bước 2.3**: Gia sư ứng tuyển vào lớp học
```bash
POST /api/applications
{
  "classId": "63f1a2b3c4d5e6f7g8h9i0j2",
  "tutorId": "63f1a2b3c4d5e6f7g8h9i0j3",
  "coverLetter": "Em là sinh viên năm 4 trường Đại học Bách Khoa, chuyên ngành Toán học. Em đã có 2 năm kinh nghiệm dạy Toán THPT...",
  "proposedRate": 180000,
  "experience": "2 năm dạy học sinh lớp 10-12, đã giúp 5 học sinh đạt giải trong kỳ thi HSG",
  "availability": "Thứ 2, 4, 6 buổi tối"
}
```

**Bước 2.4**: Gia sư khác cũng có thể ứng tuyển
```bash
POST /api/applications
{
  "classId": "63f1a2b3c4d5e6f7g8h9i0j2",
  "tutorId": "63f1a2b3c4d5e6f7g8h9i0j4",
  "coverLetter": "Thầy đã tốt nghiệp Thạc sĩ Toán học từ ĐH Quốc Gia, có 5 năm kinh nghiệm...",
  "proposedRate": 250000,
  "experience": "5 năm dạy Toán THPT, chuyên luyện thi đại học",
  "availability": "Linh hoạt tất cả các buổi"
}
```

### 3. Phụ huynh xem xét và chọn gia sư

**Bước 3.1**: Phụ huynh xem danh sách đơn ứng tuyển cho lớp của mình
```bash
GET /api/classes/63f1a2b3c4d5e6f7g8h9i0j2/applications
```

**Bước 3.2**: Phụ huynh xem chi tiết từng đơn ứng tuyển
```bash
GET /api/applications/63f1a2b3c4d5e6f7g8h9i0j5
```

**Bước 3.3**: Phụ huynh chấp nhận đơn ứng tuyển của gia sư phù hợp
```bash
PUT /api/applications/63f1a2b3c4d5e6f7g8h9i0j5
{
  "status": "accepted"
}
```

Khi đơn ứng tuyển được chấp nhận:
- Application status → "accepted"
- Class.selectedTutorId → được cập nhật
- Class.status → "in-progress"
- Các Application khác status → "rejected"

### 4. Tạo lịch học cụ thể (Sessions)

**Bước 4.1**: Sau khi có gia sư, phụ huynh/gia sư tạo lịch học cụ thể
```bash
POST /api/sessions
{
  "classId": "63f1a2b3c4d5e6f7g8h9i0j2",
  "applicationId": "63f1a2b3c4d5e6f7g8h9i0j5",
  "tutorId": "63f1a2b3c4d5e6f7g8h9i0j3",
  "studentId": "63f1a2b3c4d5e6f7g8h9i0j1",
  "subject": "Toán Lớp 10",
  "scheduledAt": "2024-01-15T19:00:00Z",
  "duration": 120,
  "notes": "Buổi học đầu tiên: Ôn tập hàm số bậc 2"
}
```

### 5. Các trường hợp khác

**Gia sư rút đơn ứng tuyển (khi còn pending)**
```bash
DELETE /api/applications/63f1a2b3c4d5e6f7g8h9i0j5
```

**Phụ huynh từ chối đơn ứng tuyển**
```bash
PUT /api/applications/63f1a2b3c4d5e6f7g8h9i0j5
{
  "status": "rejected"
}
```

**Phụ huynh đóng lớp học (không cần tìm gia sư nữa)**
```bash
PUT /api/classes/63f1a2b3c4d5e6f7g8h9i0j2
{
  "status": "closed"
}
```
Khi lớp đóng, tất cả các Application đang pending sẽ tự động bị reject.

## Tóm tắt Luồng

```
1. Parent → Tạo Class (status: open)
2. Tutors → Tìm kiếm Classes có status=open
3. Tutors → Tạo Applications (status: pending)
4. Parent → Xem danh sách Applications
5. Parent → Accept một Application
   → Application.status = accepted
   → Class.selectedTutorId = tutorId
   → Class.status = in-progress
   → Các Applications khác = rejected
6. Parent/Tutor → Tạo Sessions cho lịch học cụ thể
```

## Lưu ý quan trọng

- ✅ **ĐÚNG**: Phụ huynh tạo lớp, gia sư tìm kiếm và ứng tuyển
- ❌ **SAI**: Gia sư tạo profile, phụ huynh tìm kiếm và chọn gia sư

Đây là mô hình "Job Board" / "Marketplace" nơi người cần dịch vụ (phụ huynh) đăng nhu cầu, và người cung cấp dịch vụ (gia sư) ứng tuyển.
