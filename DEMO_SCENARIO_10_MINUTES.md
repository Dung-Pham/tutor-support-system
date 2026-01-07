# 🎯 Kịch bản Demo Dự Án - 10 Phút

## 📌 Tổng quan
Hệ thống hỗ trợ gia sư toàn diện với **3 vai trò chính**: Student (Học sinh), Tutor (Gia sư), Admin (Quản trị viên)

**Công nghệ**: React + TypeScript + Node.js + MongoDB + SQL Server + Socket.IO (realtime)

---

## ⏱️ Kịch bản Demo 10 Phút

### **Phút 0-1: Giới thiệu tổng quan (1 phút)**

**Nói:**
> "Xin chào, hôm nay em xin giới thiệu Hệ thống Hỗ trợ Gia sư - một nền tảng toàn diện kết nối học sinh và gia sư. Hệ thống có 3 vai trò chính:
> - **Học sinh**: Tìm gia sư, đăng ký lớp học, nộp bài tập
> - **Gia sư**: Đăng bài tuyển sinh, quản lý lớp học, chấm bài
> - **Admin**: Quản lý người dùng, kiểm duyệt bài viết

**Làm:**
- Mở browser, hiển thị trang chủ (HomePage)
- Zoom out để thấy toàn bộ giao diện
- Chỉ vào Navigation bar với các menu chính

**URL:** `http://localhost:3000`

---

### **Phút 1-3: Demo vai trò Học sinh (Student) - 2 phút**

#### **Bước 1: Tìm kiếm và xem danh sách gia sư (30s)**

**Nói:**
> "Đầu tiên là góc nhìn của học sinh. Học sinh có thể tìm kiếm gia sư theo môn học, khu vực..."

**Làm:**
- Vào trang **Danh sách Gia sư** (Tutors List)
- Hiển thị các card gia sư với:
  - Ảnh đại diện, tên, môn dạy
  - Đánh giá (rating)
  - Học phí
  - Nút "Xem chi tiết" và "Yêu thích"

**URL:** `http://localhost:3000/student/tutors` hoặc `/tutors`

**Key Features:**
- Filter theo môn học, khu vực
- Search bar
- Yêu thích gia sư (favorites)

#### **Bước 2: Xem bài viết tuyển sinh của gia sư (30s)**

**Nói:**
> "Học sinh có thể xem các bài đăng tuyển sinh của gia sư, với thông tin chi tiết về lịch học, địa điểm, học phí..."

**Làm:**
- Scroll xuống trang Community/Posts
- Click vào 1 bài đăng để xem chi tiết
- Hiển thị: Tiêu đề, nội dung, môn học, lịch học, số lượng học sinh

**URL:** Trang community posts hoặc tutor profile

#### **Bước 3: Đăng ký lớp học và xem lớp của mình (30s)**

**Nói:**
> "Sau khi chọn gia sư phù hợp, học sinh có thể đăng ký lớp học và theo dõi tiến độ học tập..."

**Làm:**
- Vào **My Classes** (Lớp của tôi)
- Hiển thị danh sách các lớp đã đăng ký
- Click vào 1 lớp để xem chi tiết:
  - Thông tin buổi học (sessions)
  - Bài tập (homework)
  - Tài liệu (documents)

**URL:** `http://localhost:3000/student/classes` hoặc `/my-classes`

#### **Bước 4: Nộp bài tập (30s)**

**Nói:**
> "Học sinh có thể xem bài tập được giao và nộp bài trực tuyến..."

**Làm:**
- Vào trang **Homework/Assignments**
- Hiển thị danh sách bài tập:
  - Tiêu đề, deadline, trạng thái (chưa nộp/đã nộp)
- Click "Submit" để mô phỏng nộp bài
- Upload file hoặc nhập text

**URL:** `http://localhost:3000/homework` hoặc `/student/homework`

---

### **Phút 3-6: Demo vai trò Gia sư (Tutor) - 3 phút**

#### **Bước 1: Dashboard gia sư (30s)**

**Nói:**
> "Bây giờ chúng ta chuyển sang góc nhìn của gia sư. Gia sư có dashboard tổng quan với thống kê..."

**Làm:**
- Login với tài khoản gia sư (hoặc switch user)
- Hiển thị **Tutor Dashboard**:
  - Số lượng học sinh
  - Số lớp đang dạy
  - Doanh thu
  - Biểu đồ thống kê

**URL:** `http://localhost:3000/tutor/dashboard` hoặc `/tutor`

**Key Metrics:**
- Total Students
- Total Classes
- Total Revenue
- Recent Activities

#### **Bước 2: Đăng bài tuyển sinh (Post) - 1 phút**

**Nói:**
> "Gia sư có thể đăng bài tuyển sinh để thu hút học sinh. Hệ thống hỗ trợ rich text editor..."

**Làm:**
- Vào **Create Post** (Tạo bài viết)
- Điền form:
  - Tiêu đề: "Tuyển sinh lớp Toán 12 - Luyện thi THPT"
  - Nội dung (rich text với bold, italic, list)
  - Chọn môn học
  - Địa điểm, học phí
  - Upload ảnh (nếu có)
- Click **"Publish"** → Bài viết được tạo

**URL:** `http://localhost:3000/tutor/create-post`

**Key Features:**
- Rich text editor (TipTap)
- Image upload
- Subject/Category selection
- Draft/Publish status

#### **Bước 3: Quản lý lớp học (1 phút)**

**Nói:**
> "Gia sư có thể quản lý các lớp học, xem danh sách học sinh, điểm danh..."

**Làm:**
- Vào **My Classes** (Lớp của tôi - Tutor)
- Hiển thị danh sách các lớp đang dạy
- Click vào 1 lớp:
  - **Students Tab**: Danh sách học sinh trong lớp
  - **Sessions Tab**: Các buổi học (với trạng thái: scheduled, completed)
  - **Homework Tab**: Bài tập đã giao
  - **Documents Tab**: Tài liệu lớp học

**URL:** `http://localhost:3000/tutor/classes` → Click class detail

**Key Actions:**
- Attendance (điểm danh)
- Grade homework
- Upload documents

#### **Bước 4: Chấm bài tập học sinh (30s)**

**Nói:**
> "Gia sư có thể xem bài nộp của học sinh và chấm điểm, nhận xét..."

**Làm:**
- Vào **Homework Management**
- Click vào 1 bài tập → Xem danh sách submissions
- Click vào submission của 1 học sinh:
  - Xem file/text đã nộp
  - Nhập điểm (grade)
  - Nhập nhận xét (feedback)
  - Click **"Save Grade"**

**URL:** `http://localhost:3000/tutor/homework/:id/submissions`

---

### **Phút 6-8: Demo tính năng Realtime (Socket.IO) - 2 phút**

#### **Bước 1: Hệ thống thông báo realtime (1 phút)**

**Nói:**
> "Hệ thống có tính năng thông báo realtime. Khi có sự kiện xảy ra, người dùng nhận thông báo ngay lập tức..."

**Làm:**
- Mở 2 browser windows (hoặc 2 tabs):
  - Tab 1: Login gia sư
  - Tab 2: Login học sinh
- **Demo scenario:**
  1. Tab 1 (Tutor): Giao bài tập mới cho lớp
  2. Tab 2 (Student): Bell icon sáng lên → Click xem thông báo mới
     - "You have a new homework assignment"

**Key Features:**
- Real-time notification bell
- Unread count badge
- Notification dropdown with list

**Technical:**
- Socket.IO với JWT authentication
- Event: `notification`
- Redux integration

#### **Bước 2: Nhắn tin realtime (1 phút)**

**Nói:**
> "Học sinh và gia sư có thể nhắn tin trực tiếp với nhau..."

**Làm:**
- Vào **Messages** (Tin nhắn)
- Chọn 1 conversation
- Gửi tin nhắn từ 1 tab → Tab kia nhận ngay
- Hiển thị:
  - Typing indicator (đang gõ...)
  - Online status (online/offline)
  - Emoji picker

**URL:** `http://localhost:3000/tutor/messages` hoặc `/student/messages`

**Key Features:**
- Real-time messaging
- Conversation list
- Emoji support
- File sharing

---

### **Phút 8-9: Demo Admin Panel - 1 phút**

#### **Dashboard và quản lý người dùng (30s)**

**Nói:**
> "Cuối cùng là Admin Panel. Admin có thể quản lý toàn bộ hệ thống..."

**Làm:**
- Login admin (hoặc mở tab mới)
- Hiển thị **Admin Dashboard**:
  - Thống kê: Total Users, Total Posts, Total Classes
  - Biểu đồ tăng trưởng
- Vào **User Management**:
  - Danh sách users (students, tutors)
  - Search, filter theo role
  - Nút "Block/Unblock" user

**URL:** `http://localhost:3002` (Admin panel - port 3002)

#### **Kiểm duyệt bài viết (30s)**

**Nói:**
> "Admin kiểm duyệt các bài viết của gia sư trước khi publish..."

**Làm:**
- Vào **Post Moderation** → **Pending Posts**
- Hiển thị bài viết đang chờ duyệt
- Click "View Detail"
- Chọn **Approve** hoặc **Reject**
- Nhập lý do (nếu reject)

**URL:** `http://localhost:3002/posts/pending`

**States:**
- Pending (chờ duyệt)
- Approved (đã duyệt)
- Rejected (từ chối)
- Deleted (đã xóa)

---

### **Phút 9-10: Tổng kết và Q&A - 1 phút**

**Nói:**
> "Tóm lại, hệ thống bao gồm:
> - **Frontend**: React, TypeScript, Redux, shadcn/ui, Socket.IO
> - **Backend**: Node.js, Express, MongoDB (users), SQL Server (sessions), Socket.IO
> - **Features chính**:
>   - Tìm kiếm và đăng ký gia sư
>   - Quản lý lớp học, bài tập
>   - Thông báo và nhắn tin realtime
>   - Admin quản lý và kiểm duyệt
> 
> Mọi người có câu hỏi gì không ạ?"

**Làm:**
- Quay lại trang chủ
- Hiển thị sơ đồ kiến trúc (nếu có)
- Mở terminal để show backend logs (optional)

---

## 📝 Checklist Chuẩn bị Demo

### **1. Environment Setup (Trước demo 30 phút)**

- [ ] Start MongoDB
  ```bash
  # Linux/Mac
  sudo systemctl start mongodb
  # Docker
  docker-compose up -d mongodb
  ```

- [ ] Start SQL Server
  ```bash
  docker-compose up -d sqlserver
  ```

- [ ] Start Backend
  ```bash
  cd backend
  npm install
  npm run dev
  # Chờ đến khi thấy "Server running on port 5000"
  ```

- [ ] Start Frontend
  ```bash
  cd frontend
  npm install
  npm run dev
  # Chờ đến khi thấy "Local: http://localhost:3000"
  ```

- [ ] Start Admin Panel (optional)
  ```bash
  cd admin
  npm install
  npm run dev
  # Port: 3002
  ```

### **2. Data Preparation (Trước demo 15 phút)**

- [ ] Tạo tài khoản test:
  - **Student**: email `student@test.com`, password `123456`
  - **Tutor**: email `tutor@test.com`, password `123456`
  - **Admin**: email `admin@test.com`, password `123456`
  
  ```bash
  cd backend
  node create-admin.cjs
  # Hoặc dùng API POST /api/auth/register
  ```

- [ ] Tạo dữ liệu mẫu:
  - [ ] 3-5 bài đăng của gia sư (posts)
  - [ ] 2-3 lớp học (classes)
  - [ ] 2-3 bài tập (homework)
  - [ ] 1-2 student submissions
  - [ ] Vài tin nhắn mẫu

- [ ] Test notification system:
  ```bash
  node test-notifications.js
  # Hoặc dùng API để trigger notification
  ```

### **3. Browser Setup (Trước demo 5 phút)**

- [ ] Mở 3 browser windows/tabs:
  - **Tab 1**: Student account logged in
  - **Tab 2**: Tutor account logged in
  - **Tab 3**: Admin panel (optional)

- [ ] Chuẩn bị bookmarks cho các trang quan trọng:
  - `/student/tutors`
  - `/student/classes`
  - `/student/homework`
  - `/tutor/dashboard`
  - `/tutor/create-post`
  - `/tutor/classes`
  - `/tutor/messages`
  - Admin dashboard

- [ ] Zoom level: 90-100% để vừa màn hình

- [ ] Tắt browser extensions không cần thiết

- [ ] Clear cache và cookies (nếu cần)

### **4. Presentation Setup**

- [ ] Tắt notifications (email, Slack, etc.)

- [ ] Đóng các ứng dụng không liên quan

- [ ] Chuẩn bị slides giới thiệu (optional):
  - Slide 1: Tổng quan hệ thống
  - Slide 2: Tech stack
  - Slide 3: Kiến trúc (Architecture diagram)

- [ ] Test microphone và screen sharing (nếu demo online)

### **5. Backup Plans**

- [ ] Chuẩn bị video demo (nếu live demo fail)

- [ ] Screenshot các tính năng quan trọng

- [ ] Export database backup (nếu cần reset data)
  ```bash
  mongodump -d tutor_support_system -o backup/
  ```

- [ ] Document URL của các API endpoints (cho Q&A):
  - GET `/api/users`
  - GET `/api/posts`
  - GET `/api/classes`
  - GET `/api/notifications`

---

## 🎬 Script Chi Tiết Cho Từng Phút

### **Phút 1: Opening**
```
"Xin chào mọi người! Hôm nay em xin demo Hệ thống Hỗ trợ Gia sư.
Đây là nền tảng kết nối học sinh và gia sư, giúp quản lý lớp học,
bài tập, và giao tiếp realtime.

Hệ thống có 3 vai trò:
- Học sinh: Tìm gia sư, học và nộp bài
- Gia sư: Đăng bài tuyển sinh, quản lý lớp học
- Admin: Kiểm duyệt và quản lý

Bây giờ em sẽ demo theo flow của học sinh trước."
```

### **Phút 2-3: Student Flow**
```
"Góc nhìn học sinh: Đầu tiên là tìm kiếm gia sư.
(Mở trang Tutors List)
Học sinh có thể filter theo môn học, khu vực, xem rating...
(Click vào 1 tutor card)
Xem chi tiết hồ sơ gia sư, các bài đăng tuyển sinh...
(Back, vào My Classes)
Sau khi đăng ký, học sinh vào 'My Classes' để xem lớp học,
tài liệu, và bài tập được giao.
(Click vào Homework)
Ở đây có danh sách bài tập, deadline, và nút nộp bài."
```

### **Phút 4-6: Tutor Flow**
```
"Bây giờ chuyển sang gia sư.
(Switch account hoặc tab)
Dashboard của gia sư hiển thị thống kê: số học sinh, số lớp, doanh thu...
(Click Create Post)
Gia sư đăng bài tuyển sinh với rich text editor.
Em sẽ nhập: 'Tuyển sinh lớp Toán 12', thêm nội dung, chọn môn...
(Click Publish)
Bài viết sẽ đi qua admin để kiểm duyệt.
(Vào My Classes)
Gia sư quản lý lớp học: xem danh sách học sinh, điểm danh, tài liệu...
(Click Homework tab)
Ở đây gia sư chấm bài: xem bài nộp, cho điểm, feedback."
```

### **Phút 7-8: Realtime Features**
```
"Điểm mạnh của hệ thống là tính năng realtime.
(Mở 2 tabs)
Em sẽ demo: Gia sư giao bài tập mới...
(Tab 1: Create homework)
...và bên học sinh nhận thông báo ngay lập tức!
(Tab 2: Bell icon sáng → Click)
Thông báo được gửi qua Socket.IO với Redux integration.
(Click Messages)
Tương tự với nhắn tin: gửi tin từ bên này, bên kia nhận realtime,
có typing indicator, emoji picker."
```

### **Phút 9: Admin**
```
"Cuối cùng là Admin Panel.
(Mở admin dashboard)
Admin xem thống kê tổng thể hệ thống: users, posts, classes...
(Click Post Moderation → Pending)
Kiểm duyệt bài viết: Approve hoặc Reject với lý do.
(Click User Management)
Quản lý người dùng: search, filter, block/unblock."
```

### **Phút 10: Closing**
```
"Vậy là em đã demo xong các tính năng chính.
Tóm lại:
- Frontend: React + TypeScript + Redux + Socket.IO
- Backend: Node.js + MongoDB + SQL Server + Socket.IO
- Features: Tìm gia sư, quản lý lớp học, realtime notification/chat, admin moderation

Hệ thống hoàn toàn responsive, có authentication, authorization,
và error handling.

Mọi người có câu hỏi gì không ạ?"
```

---

## 💡 Tips Để Demo Thành Công

### **1. Timing**
- Luyện tập script nhiều lần để đúng 10 phút
- Dành 8-9 phút demo, 1-2 phút Q&A
- Nếu vượt thời gian, skip phần Admin (ít quan trọng nhất)

### **2. Presentation**
- Nói chậm, rõ ràng
- Không cần giải thích code, chỉ demo features
- Focus vào UX/UI và user flow
- Highlight tính năng realtime (impressive!)

### **3. Troubleshooting**
- Nếu backend crash: Restart nhanh (hoặc chuyển sang video backup)
- Nếu frontend lỗi: F5 refresh
- Nếu Socket.IO không connect: Check browser console, restart backend
- Nếu database error: Check connection strings trong `.env`

### **4. Common Issues**

| Issue | Solution |
|-------|----------|
| Port 5000 đã được dùng | `lsof -ti:5000 \| xargs kill -9` |
| MongoDB không connect | Check service: `sudo systemctl status mongodb` |
| Socket.IO không work | Check CORS settings, JWT token |
| Frontend build lỗi | `rm -rf node_modules && npm install` |
| Can't login | Check password hash, reset user password |

### **5. Q&A Preparation**

**Câu hỏi thường gặp:**

1. **"Hệ thống có responsive không?"**
   → "Có, em đã dùng Tailwind CSS và shadcn/ui, hoàn toàn responsive cho mobile, tablet, desktop."

2. **"Database nào được dùng?"**
   → "Em dùng MongoDB cho users/posts và SQL Server cho sessions/transactions. Hybrid database cho performance tốt nhất."

3. **"Socket.IO hoạt động như thế nào?"**
   → "Backend emit event khi có notification/message, frontend listen và update Redux state ngay lập tức."

4. **"Có authentication không?"**
   → "Có, em dùng JWT với access token và refresh token. Middleware check role-based permissions."

5. **"Deploy như thế nào?"**
   → "Em có Docker Compose để deploy, hoặc có thể deploy riêng: Frontend (Vercel/Netlify), Backend (Heroku/Railway), Database (MongoDB Atlas/Azure SQL)."

6. **"Có test không?"**
   → "Em có unit tests cho critical functions, có thể extend thêm integration tests với Jest và React Testing Library."

---

## 🚀 Bonus: Quick Start Commands

### **Start Toàn Bộ Hệ Thống (Docker)**
```bash
# Root directory
docker-compose up -d

# Wait 30s for databases to initialize
# Then access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - Admin: http://localhost:3002
```

### **Start Manual (No Docker)**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Admin (optional)
cd admin
npm run dev
```

### **Create Test Accounts**
```bash
cd backend
node create-admin.cjs
# Hoặc sử dụng API:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "123456",
    "name": "Student Test",
    "role": "student"
  }'
```

### **Test Notifications**
```bash
node test-notifications.js
```

---

## 📊 Demo Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    10-MINUTE DEMO FLOW                      │
└─────────────────────────────────────────────────────────────┘

   0:00 ────► Introduction & Overview (1 min)
              │
              ▼
   1:00 ────► STUDENT PERSPECTIVE (2 min)
              ├─ Browse Tutors (0:30)
              ├─ View Posts (0:30)
              ├─ My Classes (0:30)
              └─ Submit Homework (0:30)
              │
              ▼
   3:00 ────► TUTOR PERSPECTIVE (3 min)
              ├─ Dashboard (0:30)
              ├─ Create Post (1:00)
              ├─ Manage Classes (1:00)
              └─ Grade Homework (0:30)
              │
              ▼
   6:00 ────► REALTIME FEATURES (2 min)
              ├─ Notifications (Socket.IO) (1:00)
              └─ Messaging (Socket.IO) (1:00)
              │
              ▼
   8:00 ────► ADMIN PANEL (1 min)
              ├─ Dashboard (0:30)
              └─ Post Moderation (0:30)
              │
              ▼
   9:00 ────► SUMMARY & Q&A (1 min)

```

---

## 🎓 Kết luận

Với kịch bản này, bạn có thể demo hiệu quả toàn bộ hệ thống trong 10 phút, 
bao gồm:
- ✅ 3 vai trò (Student, Tutor, Admin)
- ✅ Core features (Classes, Homework, Posts)
- ✅ Realtime capabilities (Notifications, Messaging)
- ✅ Tech stack highlights
- ✅ Admin moderation workflow

**Lưu ý quan trọng:**
- Luyện tập nhiều lần để nhuần nhuyễn
- Chuẩn bị data mẫu tốt
- Có backup plan nếu có sự cố
- Focus vào user experience, không đi sâu vào code

**Chúc bạn demo thành công! 🎉**
