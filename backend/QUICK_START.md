# ⚡ Quick Start Guide - Module VI APIs

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```powershell
cd backend
npm install
npm install --save-dev typescript @types/node @types/express @types/cors @types/morgan @types/compression @types/bcryptjs @types/jsonwebtoken ts-node
```

### Step 2: Setup Environment (1 minute)

Create `.env` file in `backend/` folder:

```env
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_DATABASE=TutorSupportDB
MSSQL_USER=sa
MSSQL_PASSWORD=YourPassword123
MSSQL_ENCRYPT=true
MSSQL_TRUST_SERVER_CERTIFICATE=true

PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Build & Run (1 minute)

```powershell
npm run build
npm run dev
```

### Step 4: Test API (1 minute)

Open browser or Postman and test:

```
http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-09T..."
}
```

---

## 🧪 Quick API Tests

### Test 1: Create Schedule

**Endpoint:** `POST http://localhost:5000/api/schedules`

**Body:**
```json
{
  "tutorRequestId": 1,
  "startTime": "2025-11-10T10:00:00Z",
  "endTime": "2025-11-10T11:30:00Z",
  "notes": "First class"
}
```

### Test 2: Get Calendar View

**Endpoint:** `GET http://localhost:5000/api/schedules/calendar`

**Query Params:**
```
?userId=1&userRole=tutor&viewType=week&date=2025-11-10
```

### Test 3: Send Message

**Endpoint:** `POST http://localhost:5000/api/chat/messages`

**Body:**
```json
{
  "receiverId": 2,
  "messageType": "text",
  "content": "Hello! How are you?"
}
```

### Test 4: Create Evaluation

**Endpoint:** `POST http://localhost:5000/api/evaluations`

**Body:**
```json
{
  "scheduleId": 1,
  "understanding": 4,
  "participation": 5,
  "homework": 4,
  "behavior": 5,
  "strengths": "Quick learner",
  "weaknesses": "Needs more practice",
  "recommendations": "Continue current pace"
}
```

---

## 📝 Common Issues & Solutions

### Issue: "Cannot find module 'express'"

**Solution:**
```powershell
npm install --save-dev @types/express
```

### Issue: Port 5000 already in use

**Solution:**
```powershell
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Issue: Database connection failed

**Solution:**
1. Verify SQL Server is running
2. Check credentials in `.env`
3. Test connection in SQL Server Management Studio

### Issue: TypeScript compilation errors

**Solution:**
```powershell
# Clean and rebuild
Remove-Item -Recurse -Force dist
npm run build
```

---

## 📊 API Endpoint Summary

### Schedules
- `POST /api/schedules` - Create
- `GET /api/schedules` - List
- `GET /api/schedules/calendar` - Calendar view
- `PUT /api/schedules/:id` - Update
- `DELETE /api/schedules/:id` - Delete

### Reschedules
- `POST /api/reschedules` - Create request
- `GET /api/reschedules/pending` - Get pending
- `POST /api/reschedules/:id/review` - Approve/Reject

### Attendance
- `GET /api/attendance/schedule/:id` - Get/Create
- `PUT /api/attendance/:id` - Update status
- `POST /api/attendance/:id/confirm` - Confirm

### Evaluations
- `POST /api/evaluations` - Create
- `GET /api/evaluations/student/:id` - List
- `GET /api/evaluations/student/:id/statistics` - Stats

### Homework
- `POST /api/homework` - Create
- `GET /api/homework/student/:id` - List
- `POST /api/homework/:id/submit` - Submit
- `POST /api/homework/submissions/:id/grade` - Grade

### Chat
- `POST /api/chat/messages` - Send
- `GET /api/chat/conversations` - List
- `GET /api/chat/messages/unread/count` - Count
- `GET /api/chat/notifications` - List

---

## 🔧 Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- REST Client
- TypeScript Hero
- SQL Server (mssql)

### Recommended Testing Tools
- Postman
- Thunder Client (VS Code)
- cURL
- Insomnia

---

## 📚 Documentation Links

- **Full API Reference**: `API_REFERENCE.md`
- **Setup Guide**: `SETUP_GUIDE.md`
- **Implementation Summary**: `MODULE_VI_IMPLEMENTATION_SUMMARY.md`
- **Complete Guide**: `IMPLEMENTATION_COMPLETE.md`

---

## ⚙️ Configuration Options

### Development Mode
```powershell
npm run dev
```
- Auto-restart on file changes
- Detailed logging
- No TypeScript compilation required

### Production Mode
```powershell
npm run build
npm start
```
- Optimized code
- Minified output
- Better performance

### Build Watch Mode
```powershell
npm run build:watch
```
- Auto-compile on TypeScript changes
- Good for development with compiled code

---

## 🎯 Testing Workflow

1. **Start Server**: `npm run dev`
2. **Test Health**: `http://localhost:5000/health`
3. **Check Swagger Docs**: `http://localhost:5000/api-docs`
4. **Test Endpoints**: Use Postman/Thunder Client
5. **Check Database**: Verify data in SQL Server

---

## 🚨 Important Notes

- **Authentication**: Currently no auth middleware (add JWT for production)
- **Authorization**: No role checks yet (implement before production)
- **File Upload**: Not implemented (use cloud storage service)
- **Real-time Chat**: Currently REST API (consider WebSocket)
- **Rate Limiting**: Not implemented (add for production)

---

## ✅ Checklist Before Production

- [ ] Add JWT authentication
- [ ] Implement role-based authorization
- [ ] Add rate limiting
- [ ] Setup HTTPS
- [ ] Configure CORS properly
- [ ] Add request logging
- [ ] Setup error monitoring (Sentry)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Setup CI/CD pipeline
- [ ] Configure production database
- [ ] Setup backup strategy

---

## 🆘 Need Help?

1. Check error logs in console
2. Review documentation files
3. Check TypeScript compilation errors
4. Verify database connectivity
5. Test with simpler endpoints first

---

## 🎉 You're Ready!

Your Module VI APIs are now set up and ready for development!

**Next Step**: Start testing the endpoints using Postman or your frontend application.

---

**Happy Coding! 🚀**
