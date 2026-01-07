# Kịch Bản Demo - Tutor Support System 🎓

## 📋 Mục đích
Document này mô tả các kịch bản demo từng chức năng của hệ thống Tutor Support System một cách logic và hợp lý, giúp người dùng hiểu rõ luồng hoạt động và cách sử dụng các tính năng.

## 🔧 Chuẩn bị trước khi Demo

### 1. Khởi động hệ thống

**Option 1: Sử dụng Docker (Khuyến nghị)**
```bash
# Clone repository
git clone <repository-url>
cd tutor-support-system

# Khởi động tất cả services
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f
```

**Option 2: Khởi động Manual**
```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 2. Kiểm tra các service đã sẵn sàng

- ✅ Backend API: http://localhost:5000
- ✅ Frontend: http://localhost:3000 (hoặc http://localhost nếu dùng Docker)
- ✅ API Documentation: http://localhost:5000/api-docs
- ✅ MongoDB: localhost:27017
- ✅ SQL Server: localhost:1433

### 3. Health Check

```bash
# Kiểm tra backend đã chạy
curl http://localhost:5000/health

# Response mong đợi:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-07T10:00:00.000Z"
}
```

---

## 🎬 Kịch Bản Demo 1: Quản lý Users (MongoDB)

### **Mục tiêu**: Demo CRUD operations cho Users được lưu trong MongoDB

### Bước 1: Tạo Users mới (Create)

#### 1.1. Tạo Tutor
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tutor1@example.com",
    "password": "password123",
    "name": "Nguyễn Văn A",
    "role": "tutor"
  }'
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "tutor1@example.com",
    "name": "Nguyễn Văn A",
    "role": "tutor",
    "isActive": true,
    "createdAt": "2024-01-07T10:00:00.000Z",
    "updatedAt": "2024-01-07T10:00:00.000Z"
  }
}
```

**Lưu ý**: Lưu lại `_id` của tutor để sử dụng trong các bước tiếp theo.

#### 1.2. Tạo Student
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "password123",
    "name": "Trần Thị B",
    "role": "student"
  }'
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "email": "student1@example.com",
    "name": "Trần Thị B",
    "role": "student",
    "isActive": true,
    "createdAt": "2024-01-07T10:05:00.000Z",
    "updatedAt": "2024-01-07T10:05:00.000Z"
  }
}
```

**Lưu ý**: Lưu lại `_id` của student để sử dụng trong các bước tiếp theo.

#### 1.3. Tạo thêm Student thứ 2
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student2@example.com",
    "password": "password123",
    "name": "Lê Văn C",
    "role": "student"
  }'
```

#### 1.4. Tạo Admin
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'
```

### Bước 2: Xem danh sách Users (Read All)

```bash
curl http://localhost:5000/api/users
```

**Response mong đợi:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "email": "tutor1@example.com",
      "name": "Nguyễn Văn A",
      "role": "tutor",
      "isActive": true,
      "createdAt": "2024-01-07T10:00:00.000Z",
      "updatedAt": "2024-01-07T10:00:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "email": "student1@example.com",
      "name": "Trần Thị B",
      "role": "student",
      "isActive": true,
      "createdAt": "2024-01-07T10:05:00.000Z",
      "updatedAt": "2024-01-07T10:05:00.000Z"
    }
    // ... các users khác
  ]
}
```

### Bước 3: Xem chi tiết một User (Read One)

```bash
# Thay {userId} bằng _id của user cần xem
curl http://localhost:5000/api/users/65a1b2c3d4e5f6g7h8i9j0k1
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "tutor1@example.com",
    "name": "Nguyễn Văn A",
    "role": "tutor",
    "isActive": true,
    "createdAt": "2024-01-07T10:00:00.000Z",
    "updatedAt": "2024-01-07T10:00:00.000Z"
  }
}
```

### Bước 4: Cập nhật thông tin User (Update)

```bash
# Cập nhật tên và avatar của tutor
curl -X PUT http://localhost:5000/api/users/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A - Senior Tutor",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "tutor1@example.com",
    "name": "Nguyễn Văn A - Senior Tutor",
    "role": "tutor",
    "avatar": "https://example.com/avatar.jpg",
    "isActive": true,
    "createdAt": "2024-01-07T10:00:00.000Z",
    "updatedAt": "2024-01-07T10:15:00.000Z"
  }
}
```

### Bước 5: Vô hiệu hóa User (Soft Delete)

```bash
# Đặt isActive = false thay vì xóa hẳn
curl -X PUT http://localhost:5000/api/users/65a1b2c3d4e5f6g7h8i9j0k2 \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### Bước 6: Xóa User (Delete) - Chỉ demo, không nên dùng trong production

```bash
# CHÚ Ý: Xóa vĩnh viễn - chỉ dùng cho demo
curl -X DELETE http://localhost:5000/api/users/65a1b2c3d4e5f6g7h8i9j0k3
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {}
}
```

---

## 🎬 Kịch Bản Demo 2: Quản lý Sessions (SQL Server)

### **Mục tiêu**: Demo CRUD operations cho Sessions được lưu trong SQL Server

### Tiền đề
- Đã có ít nhất 1 tutor và 1 student từ Demo 1
- Lưu trữ `tutorId` và `studentId` để sử dụng

### Bước 1: Tạo Session mới (Schedule a tutoring session)

#### 1.1. Tạo Session đầu tiên - Toán học
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "studentId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "subject": "Toán học - Đại số",
    "scheduledAt": "2024-01-10T14:00:00.000Z",
    "duration": 60,
    "status": "scheduled",
    "notes": "Ôn tập phương trình bậc 2"
  }'
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tutorId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "studentId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "subject": "Toán học - Đại số",
    "scheduledAt": "2024-01-10T14:00:00.000Z",
    "duration": 60,
    "status": "scheduled",
    "notes": "Ôn tập phương trình bậc 2",
    "createdAt": "2024-01-07T10:20:00.000Z",
    "updatedAt": "2024-01-07T10:20:00.000Z"
  }
}
```

#### 1.2. Tạo Session thứ 2 - Vật lý
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "studentId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "subject": "Vật lý - Cơ học",
    "scheduledAt": "2024-01-12T15:00:00.000Z",
    "duration": 90,
    "status": "scheduled",
    "notes": "Học về chuyển động thẳng đều"
  }'
```

#### 1.3. Tạo Session thứ 3 - Tiếng Anh
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "studentId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "subject": "Tiếng Anh - Grammar",
    "scheduledAt": "2024-01-15T16:00:00.000Z",
    "duration": 45,
    "status": "scheduled",
    "notes": "Present Perfect Tense"
  }'
```

### Bước 2: Xem danh sách Sessions (Read All)

```bash
curl http://localhost:5000/api/sessions
```

**Response mong đợi:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "tutorId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "studentId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "subject": "Toán học - Đại số",
      "scheduledAt": "2024-01-10T14:00:00.000Z",
      "duration": 60,
      "status": "scheduled",
      "notes": "Ôn tập phương trình bậc 2",
      "createdAt": "2024-01-07T10:20:00.000Z",
      "updatedAt": "2024-01-07T10:20:00.000Z"
    }
    // ... các sessions khác
  ]
}
```

### Bước 3: Xem chi tiết một Session (Read One)

```bash
curl http://localhost:5000/api/sessions/1
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tutorId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "studentId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "subject": "Toán học - Đại số",
    "scheduledAt": "2024-01-10T14:00:00.000Z",
    "duration": 60,
    "status": "scheduled",
    "notes": "Ôn tập phương trình bậc 2",
    "createdAt": "2024-01-07T10:20:00.000Z",
    "updatedAt": "2024-01-07T10:20:00.000Z"
  }
}
```

### Bước 4: Cập nhật Session - Bắt đầu buổi học (Update)

```bash
# Khi buổi học bắt đầu, cập nhật status sang "in-progress"
curl -X PUT http://localhost:5000/api/sessions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tutorId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "studentId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "subject": "Toán học - Đại số",
    "scheduledAt": "2024-01-10T14:00:00.000Z",
    "duration": 60,
    "status": "in-progress",
    "notes": "Ôn tập phương trình bậc 2",
    "createdAt": "2024-01-07T10:20:00.000Z",
    "updatedAt": "2024-01-07T11:00:00.000Z"
  }
}
```

### Bước 5: Kết thúc buổi học (Complete Session)

```bash
# Khi buổi học kết thúc, cập nhật status và thêm notes
curl -X PUT http://localhost:5000/api/sessions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "notes": "Ôn tập phương trình bậc 2. Học sinh đã nắm vững kiến thức. Bài tập về nhà: Làm 10 bài tập trang 45."
  }'
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tutorId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "studentId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "subject": "Toán học - Đại số",
    "scheduledAt": "2024-01-10T14:00:00.000Z",
    "duration": 60,
    "status": "completed",
    "notes": "Ôn tập phương trình bậc 2. Học sinh đã nắm vững kiến thức. Bài tập về nhà: Làm 10 bài tập trang 45.",
    "createdAt": "2024-01-07T10:20:00.000Z",
    "updatedAt": "2024-01-07T12:00:00.000Z"
  }
}
```

### Bước 6: Hủy một Session (Cancel Session)

```bash
# Hủy session nếu có sự cố
curl -X PUT http://localhost:5000/api/sessions/2 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled",
    "notes": "Học sinh bận đột xuất, reschedule vào tuần sau"
  }'
```

### Bước 7: Xóa Session (Delete) - Chỉ demo

```bash
# CHÚ Ý: Xóa vĩnh viễn - chỉ dùng cho demo
curl -X DELETE http://localhost:5000/api/sessions/3
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {}
}
```

---

## 🎬 Kịch Bản Demo 3: Realtime Communication với Socket.IO

### **Mục tiêu**: Demo các tính năng realtime như chat và notifications

### Chuẩn bị
- Mở 2 browser tabs hoặc sử dụng 2 tools riêng biệt (ví dụ: Postman, Socket.IO Client)
- Hoặc sử dụng code mẫu dưới đây

### Bước 1: Setup Socket.IO Client (HTML Demo)

Tạo file `socket-demo.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Demo</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    input { padding: 8px; margin: 5px; width: 200px; }
    #messages { height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; }
    .message { margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>🔌 Socket.IO Realtime Demo</h1>
  
  <div class="section">
    <h2>Connection Status</h2>
    <div id="status">Disconnected</div>
    <button onclick="connect()">Connect</button>
    <button onclick="disconnect()">Disconnect</button>
  </div>

  <div class="section">
    <h2>Room Management</h2>
    <input id="roomId" placeholder="Room ID (e.g., session-1)" value="session-1" />
    <button onclick="joinRoom()">Join Room</button>
    <button onclick="leaveRoom()">Leave Room</button>
  </div>

  <div class="section">
    <h2>Chat Messages</h2>
    <div id="messages"></div>
    <input id="messageInput" placeholder="Type a message..." />
    <button onclick="sendMessage()">Send</button>
  </div>

  <div class="section">
    <h2>Notifications</h2>
    <div id="notifications"></div>
  </div>

  <script>
    let socket;
    let currentRoom = '';

    function connect() {
      socket = io('http://localhost:5000');
      
      socket.on('connect', () => {
        document.getElementById('status').innerHTML = 
          '<span style="color: green;">✅ Connected - ' + socket.id + '</span>';
      });

      socket.on('disconnect', () => {
        document.getElementById('status').innerHTML = 
          '<span style="color: red;">❌ Disconnected</span>';
      });

      socket.on('user-joined', (userId) => {
        addMessage('System: User ' + userId + ' joined the room');
      });

      socket.on('user-left', (userId) => {
        addMessage('System: User ' + userId + ' left the room');
      });

      socket.on('chat-message', (data) => {
        addMessage(data.userId + ': ' + data.message + ' (' + data.timestamp + ')');
      });

      socket.on('notification', (notification) => {
        addNotification(JSON.stringify(notification));
      });
    }

    function disconnect() {
      if (socket) {
        socket.disconnect();
      }
    }

    function joinRoom() {
      const roomId = document.getElementById('roomId').value;
      if (socket && roomId) {
        socket.emit('join-room', roomId);
        currentRoom = roomId;
        addMessage('System: You joined room ' + roomId);
      }
    }

    function leaveRoom() {
      if (socket && currentRoom) {
        socket.emit('leave-room', currentRoom);
        addMessage('System: You left room ' + currentRoom);
        currentRoom = '';
      }
    }

    function sendMessage() {
      const message = document.getElementById('messageInput').value;
      if (socket && currentRoom && message) {
        socket.emit('chat-message', { roomId: currentRoom, message: message });
        document.getElementById('messageInput').value = '';
      }
    }

    function addMessage(text) {
      const div = document.createElement('div');
      div.className = 'message';
      div.textContent = text;
      document.getElementById('messages').appendChild(div);
      document.getElementById('messages').scrollTop = 
        document.getElementById('messages').scrollHeight;
    }

    function addNotification(text) {
      const div = document.createElement('div');
      div.className = 'message';
      div.textContent = 'Notification: ' + text;
      document.getElementById('notifications').appendChild(div);
    }

    // Auto connect on load
    window.onload = connect;
  </script>
</body>
</html>
```

### Bước 2: Demo Kết nối và Join Room

1. Mở file `socket-demo.html` trong **2 browser tabs** khác nhau
2. Trong cả 2 tabs, nhập cùng Room ID: `session-1`
3. Click "Join Room" trong cả 2 tabs
4. Quan sát: Mỗi tab sẽ thấy thông báo "User joined" khi tab kia join

**Kết quả mong đợi trong Console:**
```
Tab 1:
- ✅ Connected - AbcDef123456
- System: You joined room session-1
- System: User GhiJkl789012 joined the room

Tab 2:
- ✅ Connected - GhiJkl789012
- System: You joined room session-1
```

### Bước 3: Demo Chat Realtime

1. Trong Tab 1, gõ tin nhắn: "Chào bạn, tôi là tutor"
2. Click "Send"
3. Quan sát: Cả 2 tabs đều nhận được tin nhắn

**Kết quả mong đợi:**
```
Tab 1 & Tab 2:
- AbcDef123456: Chào bạn, tôi là tutor (2024-01-07T12:00:00.000Z)
```

4. Trong Tab 2, gõ tin nhắn: "Xin chào thầy, em là học sinh"
5. Click "Send"
6. Quan sát: Cả 2 tabs đều nhận được tin nhắn

### Bước 4: Demo Leave Room

1. Trong Tab 1, click "Leave Room"
2. Quan sát trong Tab 2: Thông báo "User left"

**Kết quả mong đợi:**
```
Tab 1:
- System: You left room session-1

Tab 2:
- System: User AbcDef123456 left the room
```

### Bước 5: Demo Notifications (Node.js Script)

Tạo file `send-notification.js`:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  
  // Gửi notification đến một user cụ thể
  // Thay thế 'targetUserId' bằng socket ID từ demo HTML
  const targetUserId = 'AbcDef123456'; // Lấy từ HTML demo
  
  socket.emit('send-notification', {
    userId: targetUserId,
    notification: {
      type: 'session-reminder',
      title: 'Nhắc nhở buổi học',
      message: 'Buổi học Toán của bạn sẽ bắt đầu sau 15 phút',
      timestamp: new Date().toISOString()
    }
  });
  
  console.log('📨 Notification sent to', targetUserId);
  
  // Đợi 2 giây rồi disconnect
  setTimeout(() => {
    socket.disconnect();
    console.log('❌ Disconnected');
  }, 2000);
});
```

Chạy script:
```bash
cd backend
node send-notification.js
```

**Kết quả mong đợi trong HTML demo:**
```
Notification: {"type":"session-reminder","title":"Nhắc nhở buổi học","message":"Buổi học Toán của bạn sẽ bắt đầu sau 15 phút","timestamp":"2024-01-07T12:00:00.000Z"}
```

---

## 🎬 Kịch Bản Demo 4: API Documentation với Swagger

### **Mục tiêu**: Demo sử dụng Swagger UI để test API

### Bước 1: Truy cập Swagger UI

1. Mở browser và truy cập: http://localhost:5000/api-docs
2. Quan sát: Giao diện Swagger UI hiển thị tất cả API endpoints

### Bước 2: Test API qua Swagger UI

#### 2.1. Test GET /api/users
1. Click vào endpoint `GET /api/users`
2. Click nút "Try it out"
3. Click "Execute"
4. Quan sát Response body với danh sách users

#### 2.2. Test POST /api/users
1. Click vào endpoint `POST /api/users`
2. Click nút "Try it out"
3. Điền Request body:
```json
{
  "email": "swagger-demo@example.com",
  "password": "password123",
  "name": "Swagger Demo User",
  "role": "student"
}
```
4. Click "Execute"
5. Quan sát Response: Status 201 và user mới được tạo

#### 2.3. Test GET /api/users/{id}
1. Copy `_id` của user vừa tạo từ bước 2.2
2. Click vào endpoint `GET /api/users/{id}`
3. Click "Try it out"
4. Paste `_id` vào field "id"
5. Click "Execute"
6. Quan sát Response: Thông tin chi tiết của user

#### 2.4. Test PUT /api/users/{id}
1. Click vào endpoint `PUT /api/users/{id}`
2. Click "Try it out"
3. Paste `_id` vào field "id"
4. Điền Request body:
```json
{
  "name": "Swagger Demo User - Updated"
}
```
5. Click "Execute"
6. Quan sát Response: User đã được cập nhật

#### 2.5. Tương tự với Sessions
- Test các endpoint: GET, POST, PUT, DELETE cho `/api/sessions`

---

## 🎬 Kịch Bản Demo 5: Full User Journey - End to End

### **Mục tiêu**: Demo một kịch bản hoàn chỉnh từ đầu đến cuối

### Story: "Học sinh tìm gia sư và học một buổi"

#### Phase 1: Đăng ký tài khoản

**Student đăng ký:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hocsinhA@example.com",
    "password": "password123",
    "name": "Học Sinh A",
    "role": "student"
  }'
```

**Tutor đăng ký:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "giasuhoanh@example.com",
    "password": "password123",
    "name": "Gia Sư Hoanh",
    "role": "tutor"
  }'
```

Lưu lại IDs: 
- Student ID: `studentIdHere`
- Tutor ID: `tutorIdHere`

#### Phase 2: Lên lịch buổi học

```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "tutorIdHere",
    "studentId": "studentIdHere",
    "subject": "Toán học - Giải tích",
    "scheduledAt": "2024-01-10T14:00:00.000Z",
    "duration": 60,
    "status": "scheduled",
    "notes": "Học vi phân"
  }'
```

Lưu lại Session ID: `sessionId`

#### Phase 3: Trước buổi học - Tutor gửi thông báo nhắc nhở

Mở `socket-demo.html` hoặc dùng script để:
```javascript
// Tutor connect và join room
socket.emit('join-room', 'session-' + sessionId);

// Gửi message nhắc nhở
socket.emit('chat-message', {
  roomId: 'session-' + sessionId,
  message: 'Em ơi, 15 phút nữa bắt đầu buổi học nhé!'
});
```

#### Phase 4: Bắt đầu buổi học

```bash
curl -X PUT http://localhost:5000/api/sessions/sessionId \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

#### Phase 5: Trong buổi học - Chat realtime

Tutor và Student join cùng room `session-sessionId` và chat:

```
Tutor: "Hôm nay chúng ta học về vi phân"
Student: "Dạ em đã đọc trước ở nhà rồi ạ"
Tutor: "Tốt lắm! Vậy chúng ta làm bài tập nhé"
Student: "Dạ vâng ạ"
```

#### Phase 6: Kết thúc buổi học

```bash
curl -X PUT http://localhost:5000/api/sessions/sessionId \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "notes": "Học sinh đã nắm vững khái niệm vi phân. Bài tập về nhà: Làm 15 bài tập trang 120-125. Buổi sau sẽ học tích phân."
  }'
```

#### Phase 7: Sau buổi học - Feedback

```javascript
// Tutor gửi notification feedback
socket.emit('send-notification', {
  userId: studentId,
  notification: {
    type: 'session-completed',
    title: 'Buổi học đã hoàn thành',
    message: 'Cảm ơn em đã tham gia buổi học. Hãy làm bài tập về nhà nhé!',
    sessionId: sessionId
  }
});
```

---

## 🎬 Kịch Bản Demo 6: Frontend Integration

### **Mục tiêu**: Demo giao diện người dùng

### Bước 1: Truy cập Frontend

1. Mở browser: http://localhost:3000 (hoặc http://localhost nếu dùng Docker)
2. Quan sát: Trang chủ với danh sách users

### Bước 2: Test User List

1. Trang chủ sẽ hiển thị danh sách users đã tạo từ các demo trước
2. Mỗi user card hiển thị:
   - Tên
   - Email
   - Role (badge màu xanh)

### Bước 3: Check Loading & Error States

1. Tắt backend: `docker-compose stop backend` hoặc Ctrl+C
2. Reload frontend
3. Quan sát: "Error loading users" hiển thị
4. Bật lại backend
5. Reload frontend
6. Quan sát: Loading state → Danh sách users

### Bước 4: Login Page

1. Truy cập: http://localhost:3000/login
2. Quan sát: Trang login (UI cơ bản)

---

## 📊 Tổng kết các tính năng đã demo

### ✅ Backend Features
1. **RESTful API**
   - [x] CRUD Users (MongoDB)
   - [x] CRUD Sessions (SQL Server)
   - [x] Error handling
   - [x] Response formatting

2. **Realtime Communication**
   - [x] Socket.IO connection
   - [x] Join/Leave rooms
   - [x] Chat messages
   - [x] Notifications

3. **Documentation**
   - [x] Swagger UI
   - [x] Health check endpoint

4. **Security & Performance**
   - [x] Helmet.js
   - [x] CORS
   - [x] Compression
   - [x] Request logging

### ✅ Frontend Features
1. **UI Components**
   - [x] User list page
   - [x] Login page
   - [x] Loading states
   - [x] Error states

2. **State Management**
   - [x] Redux Toolkit setup
   - [x] React Query integration

3. **Styling**
   - [x] Tailwind CSS
   - [x] Responsive design

---

## 🚀 Kịch bản Demo nâng cao (Tương lai)

### Các tính năng có thể demo thêm:

1. **Authentication & Authorization**
   - Login với JWT
   - Protected routes
   - Role-based access control

2. **Advanced Session Management**
   - Filter sessions by tutor/student
   - Calendar view
   - Session history

3. **File Upload**
   - Upload tài liệu học tập
   - Share files trong session

4. **Video Call Integration**
   - Integrate WebRTC
   - Screen sharing

5. **Payment System**
   - Payment gateway integration
   - Session pricing

6. **Analytics Dashboard**
   - Tutor performance metrics
   - Student progress tracking

---

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **Cannot connect to MongoDB**
   ```
   Giải pháp: Kiểm tra MongoDB đang chạy
   docker-compose ps
   docker-compose logs mongodb
   ```

2. **Cannot connect to SQL Server**
   ```
   Giải pháp: Kiểm tra SQL Server credentials trong .env
   Đảm bảo MSSQL_PASSWORD đúng
   ```

3. **Socket.IO CORS error**
   ```
   Giải pháp: Kiểm tra CORS_ORIGIN và SOCKET_CORS_ORIGIN trong .env
   ```

4. **Frontend không kết nối được backend**
   ```
   Giải pháp: Kiểm tra VITE_API_URL trong frontend/.env
   ```

---

## 📝 Notes cho người demo

### Tips để demo hiệu quả:

1. **Chuẩn bị trước:**
   - Test tất cả endpoints trước khi demo
   - Chuẩn bị sẵn curl commands
   - Mở sẵn Swagger UI

2. **Trong khi demo:**
   - Giải thích rõ từng bước
   - Show cả request và response
   - Demo cả success và error cases

3. **Tools hữu ích:**
   - Postman: Test API dễ dàng hơn curl
   - MongoDB Compass: Xem data trong MongoDB
   - Azure Data Studio: Xem data trong SQL Server

4. **Customization:**
   - Thay đổi data theo ngữ cảnh của audience
   - Thêm các case studies thực tế

---

## 🎓 Kết luận

Document này cung cấp các kịch bản demo đầy đủ và logic cho tất cả tính năng của Tutor Support System. Mỗi kịch bản được thiết kế để:

- ✅ Dễ hiểu và dễ thực hiện
- ✅ Có thứ tự logic (từ cơ bản đến nâng cao)
- ✅ Bao gồm data mẫu và expected responses
- ✅ Cover được tất cả các features chính
- ✅ Có thể customize theo nhu cầu

Chúc bạn demo thành công! 🚀
