# 🚀 Demo Quick Reference - Tutor Support System

## Cheat Sheet cho Demo Nhanh

### 🏁 Khởi động hệ thống (5 phút)

```bash
# Clone và start
git clone <repository-url>
cd tutor-support-system
docker-compose up -d

# Kiểm tra status
docker-compose ps
```

### 🌐 URLs quan trọng

```
Frontend:       http://localhost
Backend API:    http://localhost:5000
Swagger Docs:   http://localhost:5000/api-docs
MongoDB:        localhost:27017
SQL Server:     localhost:1433
```

### 📊 Tạo dữ liệu mẫu nhanh

#### Users (MongoDB)
```bash
# Gia sư
curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{"name":"Nguyễn Văn A","email":"nguyenvana@example.com","role":"tutor","phone":"0901234567"}'

# Học sinh
curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{"name":"Trần Thị B","email":"tranthib@example.com","role":"student","phone":"0907654321"}'

# Admin
curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{"name":"Admin","email":"admin@example.com","role":"admin","phone":"0909999999"}'
```

#### Sessions (SQL Server)
```bash
# Session 1
curl -X POST http://localhost:5000/api/sessions -H "Content-Type: application/json" -d '{"title":"Học Toán - Lớp 12","tutor_id":"1","student_id":"2","subject":"Toán","start_time":"2026-01-08T14:00:00Z","duration":120,"status":"scheduled"}'

# Session 2
curl -X POST http://localhost:5000/api/sessions -H "Content-Type: application/json" -d '{"title":"Học Tiếng Anh - IELTS","tutor_id":"1","student_id":"2","subject":"Tiếng Anh","start_time":"2026-01-09T16:00:00Z","duration":90,"status":"scheduled"}'
```

### 🎯 Demo Flow (20 phút)

#### 1. Giới thiệu (3 phút)
- Show README.md
- Giải thích kiến trúc
- Công nghệ sử dụng

#### 2. Backend API (7 phút)
- Mở Swagger UI: `http://localhost:5000/api-docs`
- Demo CRUD Users (GET, POST, PUT, DELETE)
- Demo CRUD Sessions
- Show response format

#### 3. Frontend (7 phút)
- Mở `http://localhost`
- Show user list
- Explain React Query usage
- Show Redux state management
- Demo responsive UI

#### 4. Realtime (3 phút)
- Explain Socket.IO setup
- Show code: `frontend/src/services/socketService.ts`
- Show backend: `backend/src/app.js`

#### 5. Docker (2 phút)
- Show `docker-compose.yml`
- Commands: `docker-compose ps`, `logs`, `restart`

### 🛠️ Commands hữu ích

```bash
# Xem logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart service
docker-compose restart backend

# Stop hệ thống
docker-compose down

# Stop và xóa data
docker-compose down -v

# Rebuild
docker-compose build
docker-compose up -d --build
```

### 📝 Talking Points chính

**Backend:**
- ✅ RESTful API với Express.js
- ✅ Dual database: MongoDB + SQL Server
- ✅ Swagger documentation tự động
- ✅ Error handling toàn diện
- ✅ Socket.IO cho realtime

**Frontend:**
- ✅ React 18 với TypeScript
- ✅ Redux Toolkit cho state
- ✅ React Query cho data fetching
- ✅ shadcn/ui components
- ✅ Responsive với Tailwind CSS

**DevOps:**
- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ Easy deployment
- ✅ Environment configuration
- ✅ Production-ready

### ❓ Q&A Cheat Sheet

**Q: Tại sao 2 databases?**
A: Polyglot persistence - MongoDB cho flexible schema (users), SQL Server cho complex relations (sessions)

**Q: Scale được không?**
A: Có - stateless backend, horizontal scaling, database replication

**Q: Thời gian dev?**
A: Core features: 2-3 tuần, Full-featured: 1-2 tháng

**Q: Chi phí hosting?**
A: Dev: Free, Production: $50-200/tháng

**Q: Security?**
A: Helmet, CORS, validation, JWT ready, HTTPS production

### 🎬 Demo Tips

- ✅ Test trước 1 lần đầy đủ
- ✅ Có backup plan
- ✅ Nói chậm, rõ ràng
- ✅ Show enthusiasm
- ✅ Time management
- ✅ Handle questions gracefully

### 🆘 Troubleshooting nhanh

**Containers không start:**
```bash
docker-compose down -v
docker-compose up -d
```

**Port đã bị dùng:**
```bash
# Check port
lsof -i :5000
lsof -i :80

# Kill process
kill -9 <PID>
```

**Database connection lỗi:**
```bash
# Restart databases
docker-compose restart mongodb sqlserver
```

**Frontend không load:**
```bash
# Check logs
docker-compose logs frontend

# Rebuild
docker-compose up -d --build frontend
```

### 📋 Pre-demo Checklist

- [ ] Docker running: `docker --version`
- [ ] System started: `docker-compose ps`
- [ ] Backend healthy: `curl http://localhost:5000/health`
- [ ] Frontend loading: `curl http://localhost`
- [ ] Swagger accessible: Open `http://localhost:5000/api-docs`
- [ ] Sample data created
- [ ] Browser tabs ready
- [ ] VS Code open with code
- [ ] Notifications off
- [ ] Screen recording ready (optional)

### 🎯 Time Allocation

```
00:00-03:00  Introduction & Overview
03:00-10:00  Backend API Demo
10:00-17:00  Frontend Demo
17:00-20:00  Realtime & Docker
20:00-25:00  Q&A
```

### 📞 Emergency Contacts (nếu cần)

- Technical Lead: [contact]
- DevOps: [contact]
- Product Owner: [contact]

---

**Tip:** Print hoặc keep file này mở trong tab riêng khi demo!

**Good luck! 🚀**
