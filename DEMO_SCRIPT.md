# 🎬 Kịch Bản Demo - Hệ Thống Hỗ Trợ Gia Sư

## 📋 Mục Lục
1. [Giới thiệu hệ thống](#giới-thiệu-hệ-thống)
2. [Chuẩn bị trước khi demo](#chuẩn-bị-trước-khi-demo)
3. [Kịch bản demo chi tiết](#kịch-bản-demo-chi-tiết)
4. [Demo tính năng nâng cao](#demo-tính-năng-nâng-cao)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)
6. [Kết thúc demo](#kết-thúc-demo)

---

## 🎯 Giới Thiệu Hệ Thống

### Tổng quan
**Tutor Support System** là một hệ thống quản lý và hỗ trợ gia sư toàn diện, được xây dựng với công nghệ hiện đại:
- **Backend**: Node.js, Express.js, MongoDB, SQL Server, Socket.IO
- **Frontend**: React, TypeScript, Redux Toolkit, shadcn/ui, Tailwind CSS
- **Realtime**: Socket.IO cho chat và thông báo thời gian thực

### Mục tiêu demo
- Giới thiệu kiến trúc và công nghệ của hệ thống
- Demo các chức năng chính: quản lý users, quản lý sessions
- Demo tính năng realtime (Socket.IO)
- Giới thiệu API documentation (Swagger)
- Hướng dẫn deployment với Docker

### Đối tượng khán giả
- Khách hàng/Stakeholders
- Đội phát triển
- Technical leads
- Nhà đầu tư

### Thời gian demo: 20-30 phút

---

## 🔧 Chuẩn Bị Trước Khi Demo

### Checklist chuẩn bị

#### 1. Environment Setup (15 phút trước demo)

```bash
# Clone repository
git clone <repository-url>
cd tutor-support-system

# Kiểm tra Docker đã cài đặt
docker --version
docker-compose --version

# Start toàn bộ hệ thống
docker-compose up -d

# Kiểm tra các services đã running
docker-compose ps
```

**Kết quả mong đợi:**
```
NAME                COMMAND                  SERVICE             STATUS              PORTS
backend             "docker-entrypoint.s…"   backend             running             0.0.0.0:5000->5000/tcp
frontend            "/docker-entrypoint.…"   frontend            running             0.0.0.0:80->80/tcp
mongodb             "docker-entrypoint.s…"   mongodb             running             0.0.0.0:27017->27017/tcp
sqlserver           "/opt/mssql/bin/perm…"   sqlserver           running             0.0.0.0:1433->1433/tcp
```

#### 2. Kiểm tra services (5 phút trước demo)

**Mở các tabs trong browser:**
1. Frontend: http://localhost
2. Backend API: http://localhost:5000
3. API Documentation: http://localhost:5000/api-docs
4. VS Code: Mở source code

**Test API health:**
```bash
# Test backend health
curl http://localhost:5000/health

# Test MongoDB connection
curl http://localhost:5000/api/users

# Test SQL Server connection
curl http://localhost:5000/api/sessions
```

#### 3. Chuẩn bị data mẫu

**Tạo user mẫu trong MongoDB:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "role": "tutor",
    "phone": "0901234567"
  }'

curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trần Thị B",
    "email": "tranthib@example.com",
    "role": "student",
    "phone": "0907654321"
  }'

curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "phone": "0909999999"
  }'
```

**Tạo session mẫu trong SQL Server:**
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Học Toán - Lớp 12",
    "tutor_id": "1",
    "student_id": "2",
    "subject": "Toán",
    "start_time": "2026-01-08T14:00:00Z",
    "duration": 120,
    "status": "scheduled"
  }'

curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Học Tiếng Anh - IELTS",
    "tutor_id": "1",
    "student_id": "2",
    "subject": "Tiếng Anh",
    "start_time": "2026-01-09T16:00:00Z",
    "duration": 90,
    "status": "scheduled"
  }'
```

#### 4. Chuẩn bị presentation

- [ ] Slide giới thiệu (optional)
- [ ] Browser tabs đã mở
- [ ] Terminal/Command prompt sẵn sàng
- [ ] VS Code mở source code
- [ ] Tắt notifications, thoát các app không cần thiết
- [ ] Test màn hình/projector

---

## 🎬 Kịch Bản Demo Chi Tiết

### Phần 1: Giới Thiệu Tổng Quan (3 phút)

#### Script nói:
> "Xin chào mọi người! Hôm nay tôi sẽ demo **Tutor Support System** - một hệ thống quản lý và hỗ trợ gia sư được xây dựng với các công nghệ hiện đại nhất.
>
> Hệ thống của chúng ta bao gồm:
> - Backend API với Node.js, Express, MongoDB và SQL Server
> - Frontend web application với React, TypeScript và Redux
> - Tính năng realtime với Socket.IO
> - API documentation với Swagger
> - Deployment đơn giản với Docker
>
> Hãy cùng tôi khám phá các tính năng chính!"

#### Hành động:
1. Mở README.md trong VS Code
2. Scroll qua kiến trúc hệ thống
3. Giải thích sơ đồ thư mục

---

### Phần 2: Demo Backend API (7 phút)

#### 2.1 API Documentation (Swagger)

**Script:**
> "Đầu tiên, chúng ta sẽ xem API documentation. Hệ thống sử dụng Swagger để tạo tài liệu API tự động, giúp developers dễ dàng hiểu và test các endpoints."

**Hành động:**
1. Mở http://localhost:5000/api-docs
2. Giải thích cấu trúc API:
   - Users endpoints (MongoDB)
   - Sessions endpoints (SQL Server)
3. Expand một endpoint để xem chi tiết

#### 2.2 Demo CRUD Operations - Users (MongoDB)

**Script:**
> "Bây giờ, tôi sẽ demo các thao tác CRUD với Users. Users được lưu trong MongoDB - một NoSQL database phù hợp cho dữ liệu có cấu trúc linh hoạt."

**Hành động:**

**1. GET - Lấy danh sách users**
```bash
# Trong Swagger UI, click vào "GET /api/users" > "Try it out" > "Execute"
# Hoặc dùng curl:
curl http://localhost:5000/api/users
```

**Script:**
> "Như các bạn thấy, API trả về danh sách tất cả users với thông tin: tên, email, role và số điện thoại."

**2. POST - Tạo user mới**
```json
{
  "name": "Lê Văn C",
  "email": "levanc@example.com",
  "role": "tutor",
  "phone": "0903456789",
  "subjects": ["Toán", "Lý"],
  "experience": 5
}
```

**Script:**
> "Tôi sẽ tạo một gia sư mới. Nhập thông tin vào form và submit..."

**3. GET by ID - Lấy thông tin user cụ thể**
```bash
# Copy ID từ response trước đó
curl http://localhost:5000/api/users/{id}
```

**4. PUT - Cập nhật user**
```json
{
  "name": "Lê Văn C - Updated",
  "experience": 6
}
```

**Script:**
> "Giờ tôi cập nhật thông tin user, ví dụ tăng số năm kinh nghiệm..."

**5. DELETE - Xóa user**
```bash
curl -X DELETE http://localhost:5000/api/users/{id}
```

**Script:**
> "Và cuối cùng là xóa user khi không còn cần thiết."

#### 2.3 Demo Sessions (SQL Server)

**Script:**
> "Sessions - các buổi học - được lưu trong SQL Server, một relational database phù hợp cho dữ liệu có mối quan hệ chặt chẽ và yêu cầu transactions."

**Hành động:**

**1. GET - Lấy danh sách sessions**
```bash
curl http://localhost:5000/api/sessions
```

**2. POST - Tạo session mới**
```json
{
  "title": "Học Vật Lý - Cơ học",
  "tutor_id": "1",
  "student_id": "2",
  "subject": "Vật Lý",
  "start_time": "2026-01-10T15:00:00Z",
  "duration": 120,
  "status": "scheduled",
  "location": "Online",
  "notes": "Ôn tập chương dao động điều hòa"
}
```

**Script:**
> "Tôi tạo một buổi học mới với đầy đủ thông tin: gia sư, học sinh, môn học, thời gian..."

**3. GET by ID và UPDATE**
```bash
# Lấy thông tin session
curl http://localhost:5000/api/sessions/{id}

# Cập nhật status
curl -X PUT http://localhost:5000/api/sessions/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

**Script:**
> "Khi buổi học bắt đầu, chúng ta cập nhật status thành 'in-progress', sau đó có thể cập nhật thành 'completed' khi kết thúc."

---

### Phần 3: Demo Frontend (7 phút)

#### 3.1 Homepage - User List

**Script:**
> "Bây giờ chuyển sang phần Frontend. Đây là web application được xây dựng với React và TypeScript."

**Hành động:**
1. Mở http://localhost trong browser
2. Giải thích giao diện HomePage
3. Chỉ vào danh sách users hiển thị

**Script:**
> "Trang chủ hiển thị danh sách users từ API. Data được fetch tự động bằng React Query, một thư viện data fetching mạnh mẽ với built-in caching và auto-refetch."

#### 3.2 View Source Code - Frontend

**Hành động:**
1. Mở VS Code
2. Navigate đến `frontend/src/pages/HomePage.tsx`
3. Giải thích code:
   ```typescript
   const { data: users, isLoading, error } = useUsers();
   ```

**Script:**
> "Code rất đơn giản và clean. Chúng ta sử dụng custom hook `useUsers()` để fetch data. Hook này xử lý loading state, error state và caching tự động."

4. Mở `frontend/src/hooks/useUsers.ts`
5. Giải thích React Query implementation

#### 3.3 State Management với Redux

**Hành động:**
1. Mở `frontend/src/store/slices/authSlice.ts`
2. Giải thích Redux store structure

**Script:**
> "Hệ thống sử dụng Redux Toolkit cho state management. Ví dụ, authentication state được quản lý centrally, dễ dàng access từ bất kỳ component nào."

#### 3.4 UI Components (shadcn/ui)

**Script:**
> "Giao diện sử dụng shadcn/ui - một UI component library hiện đại, được build trên Radix UI và Tailwind CSS. Components có thể customize dễ dàng và accessibility tốt."

**Hành động:**
1. Inspect element để xem Tailwind classes
2. Show responsive design (resize browser)

---

### Phần 4: Demo Socket.IO Realtime Features (5 phút)

**Script:**
> "Một trong những tính năng quan trọng là realtime communication với Socket.IO. Cho phép chat, notifications và updates tức thời."

#### 4.1 View Socket Service Code

**Hành động:**
1. Mở `frontend/src/services/socketService.ts`
2. Giải thích các events:
   - `join-room`: Tham gia phòng chat
   - `chat-message`: Gửi/nhận tin nhắn
   - `notification`: Thông báo realtime

**Script:**
> "Socket service cung cấp các methods để connect, join room, send messages và listen for events."

#### 4.2 Backend Socket Implementation

**Hành động:**
1. Mở `backend/src/app.js`
2. Tìm phần Socket.IO configuration
3. Giải thích event handlers

**Script:**
> "Ở backend, chúng ta setup Socket.IO server để handle các connections và broadcast messages đến các clients trong cùng room."

#### 4.3 Demo Socket.IO (nếu có UI)

**Nếu có chat UI:**
1. Mở 2 browser tabs
2. Join cùng room từ 2 tabs
3. Gửi message từ tab 1
4. Show message hiện lên realtime ở tab 2

**Script:**
> "Như các bạn thấy, tin nhắn được gửi và nhận tức thời mà không cần refresh trang."

---

### Phần 5: Demo Architecture & Code Structure (3 phút)

#### 5.1 Backend Structure

**Hành động:**
1. Mở VS Code, show `backend/src/` structure
2. Giải thích từng folder:

**Script:**
> "Backend được tổ chức theo pattern MVC rõ ràng:
> - **config/**: Database connections (MongoDB và SQL Server)
> - **models/**: Data schemas và models
> - **controllers/**: Business logic
> - **routes/**: API endpoints definition
> - **middlewares/**: Error handling, logging, authentication
> - **utils/**: Helper functions"

#### 5.2 Frontend Structure

**Hành động:**
1. Show `frontend/src/` structure

**Script:**
> "Frontend được organize theo feature-based structure:
> - **pages/**: Page components cho routing
> - **components/**: Reusable UI components
> - **hooks/**: Custom React hooks
> - **store/**: Redux state management
> - **services/**: API calls và external services"

#### 5.3 Database Architecture

**Script:**
> "Hệ thống sử dụng 2 databases:
> - **MongoDB**: Cho Users - dữ liệu có structure linh hoạt, dễ scale
> - **SQL Server**: Cho Sessions - dữ liệu có relationships phức tạp, cần transactions"

---

### Phần 6: Demo Docker Deployment (3 phút)

**Script:**
> "Deployment được đơn giản hóa với Docker. Chỉ cần một command để chạy toàn bộ hệ thống."

#### 6.1 Docker Compose

**Hành động:**
1. Mở `docker-compose.yml` trong VS Code
2. Giải thích services:

**Script:**
> "Docker Compose orchestrate 4 services:
> - Frontend container (Nginx)
> - Backend container (Node.js)
> - MongoDB container
> - SQL Server container
>
> Tất cả được network với nhau và có persistent volumes cho data."

#### 6.2 Docker Commands Demo

```bash
# Show running containers
docker-compose ps

# View logs
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Scale service (nếu support)
docker-compose up -d --scale backend=2

# Stop everything
docker-compose down
```

**Script:**
> "Quản lý containers rất đơn giản với Docker Compose. Chúng ta có thể xem logs, restart services, scale up/down dễ dàng."

---

## 🚀 Demo Tính Năng Nâng Cao

### Advanced Features (nếu còn thời gian)

#### 1. Error Handling

**Hành động:**
```bash
# Gửi invalid request
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'
```

**Script:**
> "Hệ thống có error handling toàn diện. Khi gửi invalid data, API trả về error message rõ ràng và status code chuẩn."

#### 2. API Response Format

**Script:**
> "Tất cả API responses được standardize với format nhất quán:
> ```json
> {
>   "success": true,
>   "data": {...},
>   "message": "Success"
> }
> ```"

#### 3. Security Features

**Script:**
> "Hệ thống được bảo mật với:
> - Helmet.js: Bảo vệ khỏi common vulnerabilities
> - CORS: Kiểm soát cross-origin requests
> - Input validation
> - JWT authentication (ready to implement)"

#### 4. Code Quality

**Hành động:**
1. Show `.eslintrc.json` và `.prettierrc`
2. Run linting:
```bash
cd frontend
npm run lint
```

**Script:**
> "Code quality được đảm bảo với ESLint và Prettier. Consistent code style trong toàn bộ project."

#### 5. Environment Configuration

**Hành động:**
1. Show `.env.example` files
2. Giải thích environment variables

**Script:**
> "Configuration được manage qua environment variables, dễ dàng switch giữa dev, staging và production."

---

## ❓ Câu Hỏi Thường Gặp

### Về Technical

**Q: Tại sao sử dụng cả MongoDB và SQL Server?**
> A: MongoDB phù hợp cho user data với flexible schema. SQL Server tốt cho sessions với complex relationships và transactions. Đây là polyglot persistence pattern - chọn database phù hợp cho từng use case.

**Q: Hệ thống có scale được không?**
> A: Có. Backend là stateless, có thể scale horizontally với load balancer. Databases có thể replicate. Socket.IO có thể scale với Redis adapter.

**Q: Performance như thế nào?**
> A: React Query có built-in caching giảm API calls. MongoDB và SQL Server được indexed properly. Socket.IO efficient cho realtime. Frontend được optimize với Vite build.

**Q: Security được handle như thế nào?**
> A: Hiện tại có Helmet, CORS, input validation. JWT authentication sẵn sàng implement. HTTPS trong production. Database credentials trong environment variables.

### Về Business

**Q: Hệ thống support bao nhiêu concurrent users?**
> A: Phụ thuộc infrastructure. Với Docker compose: ~100-500 users. Với Kubernetes và scaled databases: hàng nghàn users.

**Q: Thời gian development?**
> A: Initial version với core features: 2-3 tuần. Full-featured với authentication, authorization, advanced UI: 1-2 tháng.

**Q: Chi phí hosting?**
> A: Development: Free (local Docker). Production: $50-200/tháng cho cloud hosting (AWS, Azure, DigitalOcean) tùy scale.

**Q: Có mobile app không?**
> A: Chưa có. Nhưng architecture cho phép dễ dàng thêm React Native hoặc Flutter app, share cùng backend API.

---

## 🎯 Kết Thúc Demo

### Summary (2 phút)

**Script:**
> "Tóm lại, Tutor Support System cung cấp:
>
> ✅ **Backend API mạnh mẽ** với Node.js, Express, MongoDB và SQL Server
>
> ✅ **Frontend hiện đại** với React, TypeScript, Redux và shadcn/ui
>
> ✅ **Realtime features** với Socket.IO cho chat và notifications
>
> ✅ **Developer-friendly** với Swagger docs, clean architecture, Docker deployment
>
> ✅ **Production-ready** với security, error handling, scalability
>
> Hệ thống có thể mở rộng thêm nhiều tính năng như:
> - Authentication & Authorization
> - Payment integration
> - Video call integration
> - Advanced analytics
> - Mobile app
> - Và nhiều hơn nữa!"

### Call to Action

**Script:**
> "Cảm ơn mọi người đã theo dõi! Có câu hỏi nào không?"

### Next Steps

**Nếu là demo cho client/stakeholders:**
> "Bước tiếp theo, chúng tôi sẽ:
> 1. Finalize requirements với team
> 2. Setup production environment
> 3. Implement additional features theo feedback
> 4. Conduct UAT (User Acceptance Testing)
> 5. Launch production version"

**Nếu là demo cho developers:**
> "Các bạn có thể:
> 1. Clone repo và chạy locally
> 2. Đọc README và documentation
> 3. Explore source code
> 4. Submit PRs cho improvements
> 5. Report bugs qua GitHub Issues"

---

## 📝 Notes Quan Trọng

### Trước Demo
- [ ] Test toàn bộ flow ít nhất 1 lần
- [ ] Backup data nếu cần
- [ ] Chuẩn bị plan B nếu demo bị lỗi
- [ ] Đóng các apps không cần thiết
- [ ] Check internet connection

### Trong Demo
- [ ] Nói chậm, rõ ràng
- [ ] Pause để audience absorb information
- [ ] Show enthusiasm
- [ ] Make eye contact
- [ ] Handle questions gracefully
- [ ] Time management

### Sau Demo
- [ ] Collect feedback
- [ ] Answer additional questions
- [ ] Share demo recording (nếu có)
- [ ] Follow up với stakeholders
- [ ] Document lessons learned

---

## 🎥 Recording Demo

### Nếu cần record demo video:

**Tools:**
- OBS Studio (Free)
- Loom (Easy to use)
- Camtasia (Professional)

**Settings:**
- Resolution: 1920x1080
- Frame rate: 30fps
- Audio: Clear microphone
- Screen + Webcam (optional)

**Structure:**
1. Introduction (1 min)
2. Architecture overview (2 min)
3. Backend demo (5 min)
4. Frontend demo (5 min)
5. Realtime features (3 min)
6. Docker/Deployment (2 min)
7. Q&A preview (1 min)
8. Conclusion (1 min)

Total: ~20 minutes

---

## 📚 Resources

### Documentation
- README.md - Main documentation
- backend/README.md - Backend specific
- frontend/README.md - Frontend specific
- API Docs - http://localhost:5000/api-docs

### Source Code
- GitHub repository
- Code comments
- Architecture diagrams (nếu có)

### External Resources
- React documentation
- Node.js best practices
- MongoDB guides
- SQL Server tutorials
- Socket.IO documentation

---

**Chúc bạn demo thành công! 🎉**
