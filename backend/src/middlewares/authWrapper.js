/**
 * Wrapper để export middleware auth từ TypeScript
 * Dùng để tránh vấn đề import TypeScript trong CommonJS routes
 */

// Dynamic require của compiled TypeScript
let authenticate;

// For production/testing - use real authentication
console.log('✓ Using real authentication middleware');
try {
  // Try to load the compiled JavaScript auth middleware
  const authModule = require(__dirname + '/../../dist/middlewares/auth.js');
  authenticate = authModule.authenticate;
  console.log('✓ Loaded real authentication from dist/middlewares/auth.js');
} catch (error) {
  console.log('⚠️ Could not load auth.js:', error.message);
  authenticate = (req, res, next) => {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'Auth middleware not available'
    });
  };
}

module.exports = { authenticate };

