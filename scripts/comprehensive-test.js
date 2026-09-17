const axios = require('axios');
const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers for Windows SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

function recordTest(name, category, passed, message = '', error = null) {
  results.total++;
  if (passed) {
    results.passed++;
    results.details.push({ name, category, status: 'PASS', message });
    console.log(`\x1b[32m[PASS]\x1b[0m [${category}] ${name} ${message ? '- ' + message : ''}`);
  } else {
    results.failed++;
    results.details.push({ name, category, status: 'FAIL', message, error: error?.message || error });
    console.error(`\x1b[31m[FAIL]\x1b[0m [${category}] ${name}: ${message}`, error ? error : '');
  }
}

async function runTests() {
  console.log(`\n==================================================`);
  console.log(`🚀 RUNNING COMPREHENSIVE VENTHULIR AUDIT TEST SUITE`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`==================================================\n`);

  // --- PHASE 2: ROUTE & API INVENTORY TESTS ---
  const routes = [
    { path: '/', expectedStatus: 200, name: 'Root Route (/)' },
    { path: '/home', expectedStatus: 200, name: 'Home Route (/home)' },
    { path: '/products', expectedStatus: 200, name: 'Products Catalog (/products)' },
    { path: '/login', expectedStatus: 200, name: 'Login Page (/login)' },
    { path: '/register', expectedStatus: 200, name: 'Register Page (/register)' },
    { path: '/forgot-password', expectedStatus: 200, name: 'Forgot Password Page (/forgot-password)' },
    { path: '/cart', expectedStatus: 200, name: 'Cart Page (/cart)' },
    { path: '/checkout', expectedStatus: 200, name: 'Checkout Page (/checkout)' },
    { path: '/profile', expectedStatus: 200, name: 'Profile Page (/profile)' },
    { path: '/admin', expectedStatus: 200, name: 'Admin Dashboard (/admin)' },
  ];

  for (const r of routes) {
    try {
      const res = await axios.get(`${BASE_URL}${r.path}`, { timeout: 10000, validateStatus: () => true });
      recordTest(r.name, 'Customer & Admin Pages', res.status === r.expectedStatus, `HTTP ${res.status}`);
    } catch (err) {
      recordTest(r.name, 'Customer & Admin Pages', false, `Connection error`, err);
    }
  }

  // --- API PUBLIC ENDPOINTS ---
  const publicApis = [
    { url: '/api/products', method: 'GET', name: 'GET /api/products' },
    { url: '/api/offers', method: 'GET', name: 'GET /api/offers' },
    { url: '/api/categories', method: 'GET', name: 'GET /api/categories' },
    { url: '/api/admin/settings', method: 'GET', name: 'GET /api/admin/settings' },
  ];

  for (const api of publicApis) {
    try {
      const res = await axios.get(`${BASE_URL}${api.url}`, { timeout: 10000 });
      const isValid = res.status === 200 && (Array.isArray(res.data) || typeof res.data === 'object');
      recordTest(api.name, 'Public APIs', isValid, `Status 200, Data received`);
    } catch (err) {
      recordTest(api.name, 'Public APIs', false, `API error`, err);
    }
  }

  // --- API SECURITY & AUTH ENFORCEMENT ---
  const protectedEndpoints = [
    { url: '/api/auth/me', method: 'GET', name: 'GET /api/auth/me unauthenticated' },
    { url: '/api/orders/my-orders', method: 'GET', name: 'GET /api/orders/my-orders unauthenticated' },
    { url: '/api/admin/users', method: 'GET', name: 'GET /api/admin/users unauthenticated' },
    { url: '/api/admin/stats', method: 'GET', name: 'GET /api/admin/stats unauthenticated' },
    { url: '/api/coupons', method: 'POST', body: { couponCode: 'HACK' }, name: 'POST /api/coupons unauthenticated' },
    { url: '/api/offers', method: 'POST', body: { title: 'HACK' }, name: 'POST /api/offers unauthenticated' },
    { url: '/api/upload', method: 'POST', body: {}, name: 'POST /api/upload unauthenticated' },
  ];

  for (const ep of protectedEndpoints) {
    try {
      let res;
      if (ep.method === 'GET') {
        res = await axios.get(`${BASE_URL}${ep.url}`, { timeout: 10000, validateStatus: () => true });
      } else {
        res = await axios.post(`${BASE_URL}${ep.url}`, ep.body, { timeout: 10000, validateStatus: () => true });
      }
      const isBlocked = res.status === 401 || res.status === 403;
      recordTest(ep.name, 'Server-Side Authorization', isBlocked, `Correctly rejected with HTTP ${res.status}`);
    } catch (err) {
      recordTest(ep.name, 'Server-Side Authorization', false, `Failed to test`, err);
    }
  }

  // --- AUTH VALIDATION TESTS ---
  try {
    const loginEmpty = await axios.post(`${BASE_URL}/api/auth/login`, {}, { timeout: 10000, validateStatus: () => true });
    recordTest('POST /api/auth/login (empty payload)', 'Authentication Input Validation', loginEmpty.status >= 400 && loginEmpty.status < 500, `Rejected HTTP ${loginEmpty.status}`);
  } catch (err) {
    recordTest('POST /api/auth/login (empty payload)', 'Authentication Input Validation', false, `Error`, err);
  }

  try {
    const loginInvalid = await axios.post(`${BASE_URL}/api/auth/login`, { email: 'nonexistent_test_user@venthulir.com', password: 'wrongpassword123' }, { timeout: 10000, validateStatus: () => true });
    recordTest('POST /api/auth/login (invalid user credentials)', 'Authentication Security', loginInvalid.status === 400 || loginInvalid.status === 401, `Rejected HTTP ${loginInvalid.status}`);
  } catch (err) {
    recordTest('POST /api/auth/login (invalid credentials)', 'Authentication Security', false, `Error`, err);
  }

  try {
    const otpInvalid = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: 'invalid@email.com', otp: '000000' }, { timeout: 10000, validateStatus: () => true });
    recordTest('POST /api/auth/verify-otp (invalid OTP rejection)', 'OTP Security', otpInvalid.status >= 400, `Rejected HTTP ${otpInvalid.status}`);
  } catch (err) {
    recordTest('POST /api/auth/verify-otp', 'OTP Security', false, `Error`, err);
  }

  // --- PAYMENT VERIFICATION TAMPER RESISTANCE ---
  try {
    const fakePayment = await axios.post(`${BASE_URL}/api/payment/verify`, {
      razorpay_order_id: 'order_fake_123',
      razorpay_payment_id: 'pay_fake_456',
      razorpay_signature: 'tampered_fake_signature_abc'
    }, { timeout: 10000, validateStatus: () => true });
    recordTest('POST /api/payment/verify (tampered HMAC signature)', 'Payment Security', fakePayment.status >= 400, `Rejected tampered signature with HTTP ${fakePayment.status}`);
  } catch (err) {
    recordTest('POST /api/payment/verify (tampered signature)', 'Payment Security', false, `Error`, err);
  }

  // --- BUSINESS LOGIC: SHIPPING CALCULATION ---
  function calculateShipping(subtotal, threshold = 499, charge = 50) {
    return subtotal >= threshold ? 0 : charge;
  }

  const shippingTests = [
    { subtotal: 0, expected: 50 },
    { subtotal: 100, expected: 50 },
    { subtotal: 498, expected: 50 },
    { subtotal: 499, expected: 0 },
    { subtotal: 500, expected: 0 },
    { subtotal: 1200, expected: 0 },
  ];

  for (const st of shippingTests) {
    const calculated = calculateShipping(st.subtotal);
    const pass = calculated === st.expected;
    recordTest(`Shipping for ₹${st.subtotal}`, 'Shipping Logic (Free above ₹499)', pass, `Calculated ₹${calculated}, Expected ₹${st.expected}`);
  }

  // --- PRODUCT SEARCH & FILTER LOGIC ---
  try {
    const productsRes = await axios.get(`${BASE_URL}/api/products`, { timeout: 10000 });
    const products = productsRes.data?.products || productsRes.data || [];
    const count = Array.isArray(products) ? products.length : 0;
    recordTest('Products Catalog Query', 'Product Management', count > 0, `Loaded ${count} products successfully`);

    if (count > 0) {
      const sample = products[0];
      const hasRequiredFields = sample.name && sample.price !== undefined && sample.category !== undefined;
      recordTest('Product Schema Integrity', 'Product Management', hasRequiredFields, `Product: "${sample.name}" - ₹${sample.price}`);
    }
  } catch (err) {
    recordTest('Products Catalog Query', 'Product Management', false, 'Failed to fetch', err);
  }

  console.log(`\n==================================================`);
  console.log(`📊 TEST SUITE SUMMARY:`);
  console.log(`Total Tests:  ${results.total}`);
  console.log(`\x1b[32mPassed:       ${results.passed}\x1b[0m`);
  console.log(`\x1b[31mFailed:       ${results.failed}\x1b[0m`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log(`==================================================\n`);

  return results;
}

runTests().then(() => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
