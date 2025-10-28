/**
 * Example script to test the Newsletter API
 * Run with: node examples/test-api.js
 */

const API_BASE_URL = 'http://localhost:3001';

// Test 1: Subscribe to newsletter
async function testSubscribe() {
  console.log('\n📧 Testing Subscribe API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Subscribe test passed');
    } else {
      console.log('❌ Subscribe test failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 2: Get unsent subscribers
async function testGetUnsentSubscribers() {
  console.log('\n📋 Testing Get Unsent Subscribers API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscribers/unsent`);
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log(`✅ Found ${data.count} unsent subscribers`);
    } else {
      console.log('❌ Get unsent subscribers test failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 3: Send bulk emails
async function testSendBulkEmails() {
  console.log('\n📮 Testing Send Bulk Emails API...');
  console.log('⚠️  This will send actual emails to subscribers!');
  
  // Uncomment the following code to test bulk email sending
  /*
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-bulk-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailTemplate: {
          subject: 'Test Newsletter',
          html: '<h1>Hello {{name}}!</h1><p>This is a test email to {{email}}</p>',
          text: 'Hello {{name}}! This is a test email to {{email}}',
        },
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Bulk email test passed');
    } else {
      console.log('❌ Bulk email test failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  */
  
  console.log('⏭️  Skipped (uncomment code to test)');
}

// Test 4: Health check
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log(`📍 API URL: ${API_BASE_URL}`);
  
  await testHealthCheck();
  await testSubscribe();
  await testGetUnsentSubscribers();
  await testSendBulkEmails();
  
  console.log('\n✨ Tests completed!');
}

runTests();
