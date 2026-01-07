# Quick Start Guide 🚀

## Bắt đầu nhanh với Tutor Support System

### ⚡ Setup trong 3 phút

#### Option 1: Docker (Nhanh nhất)
```bash
# 1. Clone project
git clone <repository-url>
cd tutor-support-system

# 2. Khởi động tất cả
docker-compose up -d

# 3. Truy cập
# Frontend: http://localhost
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

#### Option 2: Manual Setup
```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
cp .env.example .env
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## 🎯 Test API nhanh

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Tạo User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "student"
  }'
```

### 3. Xem Users
```bash
curl http://localhost:5000/api/users
```

### 4. Tạo Session
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "YOUR_TUTOR_ID",
    "studentId": "YOUR_STUDENT_ID",
    "subject": "Toán học",
    "scheduledAt": "2024-01-10T14:00:00.000Z",
    "duration": 60,
    "status": "scheduled"
  }'
```

---

## 📖 Xem thêm

- **Chi tiết đầy đủ**: [DEMO_SCENARIO.md](./DEMO_SCENARIO.md)
- **README chính**: [README.md](./README.md)
- **Backend docs**: [backend/README.md](./backend/README.md)
- **Frontend docs**: [frontend/README.md](./frontend/README.md)

---

## 🆘 Cần giúp?

1. Xem [DEMO_SCENARIO.md](./DEMO_SCENARIO.md) để có hướng dẫn chi tiết
2. Kiểm tra phần Troubleshooting trong DEMO_SCENARIO.md
3. Tạo issue trên GitHub nếu gặp vấn đề
