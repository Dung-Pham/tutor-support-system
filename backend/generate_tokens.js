const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// User IDs from database
const users = {
  tranH: {
    userId: '89665505-B258-4EFC-A898-037A9C6D62A4',
    email: 'tranh@gmail.com',
    role: 'student'
  },
  nguyenVa: {
    userId: 'ADDF98ED-86F5-4B8E-BF94-4572A5B21C42',
    email: 'nguyenvana@gmail.com',
    role: 'tutor'
  }
};

function generateToken(userKey) {
  const user = users[userKey];
  if (!user) {
    console.error('User not found:', userKey);
    return null;
  }

  const token = jwt.sign({
    userId: user.userId,
    email: user.email,
    role: user.role
  }, JWT_SECRET, { expiresIn: '24h' });

  return token;
}

// Generate tokens for testing
console.log('🔑 JWT Tokens for testing:');
console.log('');
console.log('Trần H (student):');
console.log('Bearer', generateToken('tranH'));
console.log('');
console.log('Nguyễn Văn A (tutor):');
console.log('Bearer', generateToken('nguyenVa'));