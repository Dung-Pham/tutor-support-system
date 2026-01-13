# 🎯 Demo Quick Reference - Bảng Tra Cứu Nhanh

## ⚡ URLs Quan Trọng

### Frontend (Port 3000)
```
Trang chủ:           http://localhost:3000
Login:               http://localhost:3000/login
Register:            http://localhost:3000/register

STUDENT:
- Tutors List:       http://localhost:3000/student/tutors
- My Classes:        http://localhost:3000/student/classes
- Homework:          http://localhost:3000/student/homework
- Messages:          http://localhost:3000/student/messages

TUTOR:
- Dashboard:         http://localhost:3000/tutor/dashboard
- Create Post:       http://localhost:3000/tutor/create-post
- My Posts:          http://localhost:3000/tutor/my-posts
- My Classes:        http://localhost:3000/tutor/classes
- Homework:          http://localhost:3000/tutor/homework
- Students:          http://localhost:3000/tutor/students
- Messages:          http://localhost:3000/tutor/messages
```

### Backend API (Port 5000)
```
API Docs:            http://localhost:5000/api-docs
Health Check:        http://localhost:5000/health

Key Endpoints:
- Auth:              /api/auth/*
- Users:             /api/users/*
- Classes:           /api/classes/*
- Homework:          /api/homework/*
- Posts:             /api/posts/*
- Notifications:     /api/notifications/*
- Messages:          /api/messages/*
```

### Admin Panel (Port 3002)
```
Admin Login:         http://localhost:3002/login
Admin Dashboard:     http://localhost:3002
User Management:     http://localhost:3002/users
Post Moderation:     http://localhost:3002/posts/pending
```

---

## 🔑 Test Accounts

```javascript
// STUDENT
{
  email: "student@test.com",
  password: "123456",
  role: "student"
}

// TUTOR
{
  email: "tutor@test.com",
  password: "123456",
  role: "tutor"
}

// ADMIN
{
  email: "admin@test.com",
  password: "123456",
  role: "admin"
}
```

---

## 🚀 Start Commands - Copy & Paste

### Khởi động nhanh với Docker
```bash
# Từ thư mục root
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng
docker-compose down
```

### Khởi động Manual (No Docker)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Terminal 3 - Admin (Optional):**
```bash
cd admin
npm install
cp .env.example .env
npm run dev
```

### Tạo Admin Account
```bash
cd backend
node create-admin.cjs
```

---

## 🎬 Demo Timeline - 10 Phút

| Thời gian | Nội dung | Hành động chính |
|-----------|----------|-----------------|
| **0:00-1:00** | Giới thiệu | Mở trang chủ, giới thiệu 3 vai trò |
| **1:00-3:00** | Student Demo | Tutors → Classes → Homework |
| **3:00-6:00** | Tutor Demo | Dashboard → Create Post → Manage Class → Grade |
| **6:00-8:00** | Realtime | Notifications + Messages (2 tabs) |
| **8:00-9:00** | Admin | Dashboard + Post Moderation |
| **9:00-10:00** | Q&A | Tổng kết + Trả lời câu hỏi |

---

## 📝 Demo Script - 1 Trang

### Opening (1 min)
> "Xin chào! Hệ thống Hỗ trợ Gia sư - nền tảng kết nối học sinh và gia sư.
> 3 vai trò: Student, Tutor, Admin. Demo flow từ học sinh trước."

### Student (2 min)
> "Học sinh tìm gia sư → (mở Tutors List)
> Xem posts, đánh giá, học phí → (click tutor)
> Đăng ký lớp → (mở My Classes)
> Xem bài tập và nộp bài → (mở Homework)"

### Tutor (3 min)
> "Gia sư có dashboard thống kê → (mở Dashboard)
> Đăng bài tuyển sinh → (Create Post, điền form)
> Quản lý lớp học → (My Classes, click class)
> Chấm bài học sinh → (Homework submissions)"

### Realtime (2 min)
> "Demo notifications realtime → (2 tabs: Tutor giao bài, Student nhận thông báo)
> Nhắn tin realtime → (Messages, gửi tin qua lại)"

### Admin (1 min)
> "Admin dashboard → Post moderation → Approve/Reject"

### Close (1 min)
> "Tech: React + TypeScript + Node.js + MongoDB + SQL Server + Socket.IO
> Q&A?"

---

## 🛠️ Troubleshooting - Sửa Lỗi Nhanh

### Lỗi thường gặp:

**Backend không start:**
```bash
# Port 5000 bị chiếm
lsof -ti:5000 | xargs kill -9

# MongoDB không connect
sudo systemctl start mongodb
# hoặc
docker-compose up -d mongodb

# SQL Server không connect
docker-compose up -d sqlserver
```

**Frontend không start:**
```bash
# Port 3000 bị chiếm
lsof -ti:3000 | xargs kill -9

# Node modules lỗi
rm -rf node_modules package-lock.json
npm install
```

**Socket.IO không hoạt động:**
```bash
# Check CORS settings trong backend/.env
CORS_ORIGIN=http://localhost:3000

# Check JWT token
# Open browser DevTools → Application → Local Storage
# Xem có "token" hoặc "accessToken" không

# Restart backend
cd backend
npm run dev
```

**Không login được:**
```bash
# Reset password user
cd backend
node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('123456', 10).then(hash => console.log(hash));
"
# Copy hash vào MongoDB users collection
```

**Database trống không có data:**
```bash
# Seed database
cd backend
node scripts/seed.js

# Hoặc tạo data thủ công qua API
```

---

## 🎯 Features Checklist - Tick Trước Demo

### Chuẩn bị trước demo (30 phút trước):

**Environment:**
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Admin running (port 3002) - optional
- [ ] MongoDB connected
- [ ] SQL Server connected

**Data:**
- [ ] Có 3 test accounts (student, tutor, admin)
- [ ] Có ít nhất 3-5 posts
- [ ] Có ít nhất 2 classes
- [ ] Có ít nhất 2-3 homework assignments
- [ ] Có ít nhất 1-2 student submissions

**Browser:**
- [ ] Tab 1: Student logged in
- [ ] Tab 2: Tutor logged in
- [ ] Tab 3: Admin (optional)
- [ ] Đã bookmark các URL quan trọng
- [ ] Zoom 90-100%
- [ ] Đã test notifications và messages

**Presentation:**
- [ ] Tắt email notifications
- [ ] Tắt Slack/chat apps
- [ ] Đóng các tabs không liên quan
- [ ] Microphone đã test
- [ ] Screen sharing đã test (nếu online)

---

## 💡 Key Features Để Highlight

### 1. **Real-time Notifications** ⭐⭐⭐
- Socket.IO integration
- Instant notification badge update
- Redux state management

### 2. **Real-time Messaging** ⭐⭐⭐
- Live chat với typing indicator
- Emoji picker
- Online status

### 3. **Rich Text Editor** ⭐⭐
- TipTap editor cho posts
- Bold, italic, lists, images
- Professional UI

### 4. **Role-Based Access** ⭐⭐
- 3 roles: student, tutor, admin
- JWT authentication
- Protected routes

### 5. **Responsive Design** ⭐⭐
- Tailwind CSS + shadcn/ui
- Mobile, tablet, desktop
- Modern UI/UX

### 6. **Hybrid Database** ⭐
- MongoDB for users/posts
- SQL Server for sessions/transactions
- Best of both worlds

---

## 📊 Stats Để Nói

"Hệ thống hiện tại có:"
- **Backend**: 20+ API endpoints
- **Frontend**: 30+ pages/components
- **Database**: 2 databases (MongoDB + SQL Server)
- **Real-time**: Socket.IO với JWT authentication
- **Tech Stack**: React + TypeScript + Node.js + Express
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Redux Toolkit

---

## 🎤 Q&A Answers

### "Tech stack là gì?"
> "Frontend: React 18, TypeScript, Redux Toolkit, shadcn/ui, Tailwind CSS
> Backend: Node.js, Express, MongoDB, SQL Server, Socket.IO
> Authentication: JWT, Role-based access control"

### "Có responsive không?"
> "Có, em dùng Tailwind CSS nên hoàn toàn responsive cho mobile, tablet, desktop"

### "Socket.IO hoạt động thế nào?"
> "Backend emit event 'notification' hoặc 'message', frontend listen và update Redux state realtime. Có authentication với JWT token"

### "Tại sao dùng 2 database?"
> "MongoDB cho data phi cấu trúc như users, posts. SQL Server cho transactions và sessions cần ACID compliance. Hybrid approach cho performance tốt nhất"

### "Deploy như thế nào?"
> "Có Docker Compose để deploy toàn bộ. Hoặc deploy riêng: Frontend (Vercel), Backend (Railway/Heroku), Database (MongoDB Atlas, Azure SQL)"

### "Có test không?"
> "Em có test scenarios và có thể extend với Jest cho unit tests, React Testing Library cho component tests"

### "Security như thế nào?"
> "JWT authentication, bcrypt password hashing, helmet middleware, CORS configuration, role-based authorization, input validation với Zod"

---

## 🚨 Emergency Backup

Nếu live demo fail hoàn toàn:

### Option 1: Video Demo
- Record trước 1 video 10 phút
- Play video và narrate lại

### Option 2: Slides + Screenshots
- Chuẩn bị slides với screenshots
- Giải thích features qua hình ảnh

### Option 3: Code Walkthrough
- Show codebase structure
- Giải thích architecture
- Highlight key files

---

## 📞 Support Contacts

Nếu cần support trong lúc demo:

**Check Logs:**
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev

# Docker logs
docker-compose logs -f
```

**Browser Console:**
```javascript
// Check Redux state
window.__REDUX_DEVTOOLS_EXTENSION__

// Check Socket connection
socketService.getSocket().connected

// Check API calls
Network tab in DevTools
```

---

## ✅ Post-Demo Checklist

Sau khi demo xong:

- [ ] Stop các services (Ctrl+C hoặc `docker-compose down`)
- [ ] Backup database nếu có data tốt
- [ ] Export MongoDB: `mongodump -d tutor_support_system -o backup/`
- [ ] Note lại các câu hỏi được hỏi
- [ ] Update documentation nếu có feedback
- [ ] Commit code changes (nếu có)

---

## 🎉 Demo Success Indicators

Demo thành công khi:
- ✅ Đúng 10 phút (8-9 min demo + 1-2 min Q&A)
- ✅ Show được 3 roles (Student, Tutor, Admin)
- ✅ Demo được realtime features (impressive!)
- ✅ Không có major bugs/crashes
- ✅ Audience hiểu được system flow
- ✅ Trả lời được questions

---

**Good luck với demo! 🚀**
