/**
 * Simple JWT authentication middleware
 */
const jwt = require('jsonwebtoken');
const sql = require('mssql');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticate = async (req, res, next) => {
  console.log('🔐 Auth middleware called with headers:', req.headers.authorization ? 'Bearer token present' : 'No auth header');
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data from database
    const config = {
      user: 'sa',
      password: '123456',
      server: 'localhost',
      database: 'tutorsupportdb1',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };

    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, decoded.userId)
      .query(`
        SELECT user_id, email, name, role, status, is_verified,
               phone, dateOfBirth, locationDetail, gender, created_at, updated_at
        FROM UserAccount
        WHERE user_id = @userId
      `);

    await pool.close();

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'User not found',
      });
    }

    const user = result.recordset[0];

    // Check if user is active (status = 1 in new schema)
    if (user.status !== true && user.status !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
        error: 'User account is disabled',
      });
    }

    // Attach user to request with correct field names from new schema
    req.user = {
      userId: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role, // varchar(20) in new schema
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      locationDetail: user.locationDetail,
      gender: user.gender,
      isVerified: user.is_verified,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    console.log('✅ User authenticated:', { userId: req.user.userId, email: req.user.email, role: req.user.role });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: error.message,
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'Please login again',
      });
    }

    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'Internal server error',
    });
  }
};

module.exports = { authenticate };