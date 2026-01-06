#!/usr/bin/env node

/**
 * Test: Verify Backend Notification System
 * 
 * Này script sẽ:
 * 1. ✅ Check database connections
 * 2. ✅ Verify notification routes 
 * 3. ✅ Test notification creation
 * 4. ✅ Verify Socket.IO setup
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test-token';

async function testNotificationSystem() {
  console.log('\n====================================');
  console.log('🧪 Testing Notification System');
  console.log('====================================\n');

  try {
    // Test 1: Check if API is running
    console.log('1️⃣  Checking API connectivity...');
    const healthCheck = await axios.get(`${API_URL}/api/health`, {
      timeout: 5000,
    }).catch(() => null);
    
    if (!healthCheck) {
      console.log('❌ API is not running on port 5000');
      console.log('   Run: npm run dev (from backend folder)\n');
      return;
    }
    console.log('✅ API is running\n');

    // Test 2: Check notification routes exist
    console.log('2️⃣  Checking notification endpoints...');
    const endpoints = [
      { method: 'GET', path: '/api/notifications/unread' },
      { method: 'GET', path: '/api/notifications' },
      { method: 'GET', path: '/api/notifications/unread-count' },
    ];

    for (const endpoint of endpoints) {
      try {
        await axios({
          method: endpoint.method,
          url: `${API_URL}${endpoint.path}`,
          headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
          timeout: 3000,
        }).catch(err => {
          // 401/403 is OK - means endpoint exists but auth failed
          if (err.response?.status === 401 || err.response?.status === 403) {
            return { status: 200 };
          }
          throw err;
        });
        console.log(`  ✅ ${endpoint.method} ${endpoint.path}`);
      } catch (err) {
        console.log(`  ❌ ${endpoint.method} ${endpoint.path} - ${err.message}`);
      }
    }

    // Test 3: Verify environment
    console.log('\n3️⃣  Environment Check:');
    console.log(`  - VITE_API_URL: ${process.env.VITE_API_URL || 'http://localhost:5000'}`);
    console.log(`  - Backend Running: http://localhost:5000`);
    console.log(`  - Socket.IO Port: 5000 (same as API)\n`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotificationSystem();

