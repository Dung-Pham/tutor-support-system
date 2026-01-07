# Implementation Summary - Tutor Application Flow Fix

## Problem Statement

The original system was incorrectly designed with the wrong flow where it appeared that parents would search for and select tutors. The correct flow should be:

> **Phụ huynh tạo lớp học → Gia sư tìm kiếm và ứng tuyển → Phụ huynh xem xét và chọn gia sư**

## Solution Overview

Implemented a "Job Board" model where:
1. **Parents** post class listings (the "jobs")
2. **Tutors** browse and apply to classes (the "job applications")
3. **Parents** review applications and select a tutor
4. **Sessions** are created for scheduled lessons

## Files Created

### Models (MongoDB)
- `backend/src/models/Class.js` - Class/job posting model
- `backend/src/models/Application.js` - Tutor application model

### Controllers
- `backend/src/controllers/classController.js` - Business logic for classes
- `backend/src/controllers/applicationController.js` - Business logic for applications

### Routes
- `backend/src/routes/classes.js` - API endpoints for classes
- `backend/src/routes/applications.js` - API endpoints for applications

### Documentation
- `FLOW_SCENARIO.md` - Detailed flow documentation with examples (Vietnamese)
- `SECURITY_NOTES.md` - Security implementation notes for future development

## Files Modified

### Models
- `backend/src/models/User.js` - Added 'parent' role to user roles
- `backend/src/models/Session.js` - Added classId and applicationId references

### Configuration
- `backend/src/app.js` - Registered new routes for classes and applications

### Documentation
- `README.md` - Updated with new API endpoints and flow description
- `backend/README.md` - Updated with new API endpoints

## Key Features Implemented

### Class Model
- Parent creates class with subject, description, requirements, schedule, budget
- Status: 'open' (accepting applications) → 'in-progress' (tutor selected) → 'closed'
- Tracks selected tutor (selectedTutorId)
- Supports filtering by status, subject, and parentId

### Application Model
- Tutor applies with cover letter, proposed rate, experience, availability
- Status: 'pending' → 'accepted'/'rejected'/'withdrawn'
- Unique index prevents duplicate applications (one tutor per class)
- Linked to both class and tutor

### Business Logic

**When a parent accepts an application:**
1. Application status → 'accepted'
2. Class.selectedTutorId → set to the tutor's ID
3. Class.status → 'in-progress'
4. All other pending applications → 'rejected'

**Validation:**
- Check if application exists before accepting
- Verify class is open before creating application
- Verify class is not closed before accepting application
- Prevent duplicate applications with proper error handling

## API Endpoints

### Classes API
```
GET    /api/classes                    - List classes (with filters)
GET    /api/classes/:id                - Get class details
POST   /api/classes                    - Create class (parent)
PUT    /api/classes/:id                - Update class (parent)
DELETE /api/classes/:id                - Delete class (parent)
GET    /api/classes/:id/applications   - Get class applications (parent)
```

### Applications API
```
GET    /api/applications               - List applications (with filters)
GET    /api/applications/:id           - Get application details
POST   /api/applications               - Create application (tutor)
PUT    /api/applications/:id           - Update application (accept/reject)
DELETE /api/applications/:id           - Delete/withdraw application (tutor)
```

## Data Flow Example

```javascript
// 1. Parent creates class
POST /api/classes
{
  "parentId": "...",
  "subject": "Toán Lớp 10",
  "description": "...",
  "schedule": "Thứ 2, 4, 6 - 19:00-21:00",
  "budget": 200000
}

// 2. Tutor applies
POST /api/applications
{
  "classId": "...",
  "tutorId": "...",
  "coverLetter": "...",
  "proposedRate": 180000
}

// 3. Parent accepts application
PUT /api/applications/{applicationId}
{
  "status": "accepted"
}
// → Application status = accepted
// → Class.selectedTutorId = tutorId
// → Class.status = in-progress
// → Other applications = rejected

// 4. Create sessions
POST /api/sessions
{
  "classId": "...",
  "applicationId": "...",
  "tutorId": "...",
  "studentId": "...",
  ...
}
```

## Security Considerations

The current implementation has **public endpoints** for development/testing. Production deployment requires:

1. **Authentication** - JWT-based user authentication
2. **Authorization** - Role-based access control:
   - Only parents can create/update/delete classes
   - Only tutors can create/delete applications
   - Only class owners can view/accept applications
   - Only application owners can withdraw applications
3. **Model Validation** - Pre-save hooks to validate role references
4. **Database Indexes** - For performance on filtered queries
5. **Transactions** - To prevent race conditions on concurrent operations

See `SECURITY_NOTES.md` for detailed implementation guidelines.

## Testing Performed

- ✅ All models load successfully
- ✅ All controllers load successfully
- ✅ Express app initializes with new routes
- ✅ Syntax checks pass for all files
- ✅ Code review completed and issues addressed

## What's NOT Implemented

The following are marked as TODO for future implementation:
- User authentication (JWT)
- Authorization middleware
- Password hashing for users
- Input validation with Joi/express-validator
- Email verification
- Rate limiting
- Database transactions for atomic operations
- Integration/E2E tests

## Migration Notes

**Existing data**: No breaking changes to existing User and Session models.

**New collections** will be created:
- `classes` - MongoDB collection for class postings
- `applications` - MongoDB collection for tutor applications

**Sessions table** gains two optional fields:
- `classId` - Reference to MongoDB Class
- `applicationId` - Reference to MongoDB Application

## Conclusion

The system now correctly implements the tutor marketplace flow where:
- ✅ Parents post their tutoring needs (classes)
- ✅ Tutors apply to classes that match their skills
- ✅ Parents review applications and select the best tutor
- ✅ Sessions track the relationship back to the original class posting

This is the **correct model** for a tutoring marketplace platform.
