# Security & Authorization Notes

## Current Status

The API endpoints are currently **PUBLIC** for development and testing purposes. All users can perform all operations without authentication or authorization checks.

## TODO: Authentication & Authorization

### Required Implementations

#### 1. Authentication Middleware
Add JWT-based authentication middleware to verify users are logged in:

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

#### 2. Role-Based Authorization

**Parent-only endpoints:**
- `POST /api/classes` - Only parents can create classes
- `PUT /api/classes/:id` - Only class owner can update
- `DELETE /api/classes/:id` - Only class owner can delete
- `GET /api/classes/:id/applications` - Only class owner can view applications
- `PUT /api/applications/:id` (when accepting/rejecting) - Only the class owner (parent) can accept/reject

**Tutor-only endpoints:**
- `POST /api/applications` - Only tutors can create applications
- `DELETE /api/applications/:id` - Only application owner can withdraw

**Ownership validation needed:**
- Verify `req.user._id === resource.parentId` for class operations
- Verify `req.user._id === resource.tutorId` for application operations

#### 3. Model Validation

Add mongoose pre-save hooks to validate:

**Class Model:**
```javascript
classSchema.pre('save', async function(next) {
  const parent = await mongoose.model('User').findById(this.parentId);
  if (!parent || parent.role !== 'parent') {
    throw new Error('Invalid parent reference');
  }
  next();
});
```

**Application Model:**
```javascript
applicationSchema.pre('save', async function(next) {
  const tutor = await mongoose.model('User').findById(this.tutorId);
  if (!tutor || tutor.role !== 'tutor') {
    throw new Error('Invalid tutor reference');
  }
  next();
});
```

#### 4. Cross-Database Reference Validation

For Session model referencing MongoDB IDs:
```javascript
// Before creating session
const classExists = await Class.findById(sessionData.classId);
const applicationExists = await Application.findById(sessionData.applicationId);
if (!classExists || !applicationExists) {
  throw new Error('Invalid references');
}
```

#### 5. Race Condition Prevention

Use MongoDB transactions for critical operations:
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Update application
  // Update class
  // Reject other applications
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## Protected Routes Structure

```javascript
// routes/classes.js
const { authenticate, authorizeRoles } = require('../middlewares/auth');

router.post('/', authenticate, authorizeRoles('parent'), createClass);
router.put('/:id', authenticate, authorizeRoles('parent'), checkOwnership, updateClass);
router.delete('/:id', authenticate, authorizeRoles('parent'), checkOwnership, deleteClass);
router.get('/:id/applications', authenticate, authorizeRoles('parent'), checkOwnership, getClassApplications);

// routes/applications.js
router.post('/', authenticate, authorizeRoles('tutor'), createApplication);
router.delete('/:id', authenticate, authorizeRoles('tutor'), checkOwnership, deleteApplication);
```

## Database Indexes for Performance

Add these indexes:

```javascript
// Application model
applicationSchema.index({ classId: 1, status: 1 }); // For filtering applications by class and status
applicationSchema.index({ tutorId: 1, status: 1 }); // For filtering applications by tutor and status

// Class model
classSchema.index({ status: 1, subject: 1 }); // For tutor search
classSchema.index({ parentId: 1, status: 1 }); // For parent's own classes
```

## Notes

- All TODOs are marked in the controller files with `@todo` tags
- Authentication should be implemented before deploying to production
- Consider using rate limiting for public endpoints to prevent abuse
- Add input validation using libraries like Joi or express-validator
- Consider implementing email verification for new users
- Add password hashing with bcrypt for User model (already noted in User.js)
