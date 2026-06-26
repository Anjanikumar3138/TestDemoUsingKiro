import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ─────────────────────────────────────────────────────────────
// Custom Metrics
// ─────────────────────────────────────────────────────────────
const errorRate = new Rate('error_rate');
const createUserDuration = new Trend('create_user_duration', true);
const getUserDuration = new Trend('get_user_duration', true);
const deleteUserDuration = new Trend('delete_user_duration', true);
const totalRequests = new Counter('total_requests');

// ─────────────────────────────────────────────────────────────
// Test Configuration
// 500 Concurrent Users for 10 Minutes
// ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '1m', target: 500 },   // Ramp up to 500 users over 1 minute
    { duration: '10m', target: 500 },  // Hold at 500 users for 10 minutes
    { duration: '1m', target: 0 },     // Ramp down to 0 over 1 minute
  ],

  // Thresholds: Response time < 2s and error rate < 1%
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<2000'],   // 95th & 99th percentile < 2 seconds
    error_rate: ['rate<0.01'],                          // Error rate below 1%
    create_user_duration: ['p(95)<2000'],
    get_user_duration: ['p(95)<2000'],
    delete_user_duration: ['p(95)<2000'],
  },
};

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// ─────────────────────────────────────────────────────────────
// Helper: Generate random user data
// ─────────────────────────────────────────────────────────────
function generateRandomUser() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const password = 'TestPass123!';

  return {
    firstName: `LoadUser${random}`,
    lastName: `Test${random}`,
    email: `loadtest_${timestamp}_${random}@example.com`,
    phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    password: password,
    confirmPassword: password,
    age: Math.floor(Math.random() * (60 - 18 + 1)) + 18,
    address: {
      addressLine1: `${Math.floor(Math.random() * 9999)} Load Test Street`,
      city: 'TestCity',
      state: 'TestState',
      country: 'TestCountry',
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Main Test Scenario: Full User Lifecycle
// POST (Register) → GET (Retrieve) → DELETE (Remove)
// ─────────────────────────────────────────────────────────────
export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // ── Step 1: Create User (POST /api/users/register) ──
  const userData = generateRandomUser();
  const createRes = http.post(
    `${BASE_URL}/api/users/register`,
    JSON.stringify(userData),
    { headers, tags: { operation: 'create_user' } }
  );

  totalRequests.add(1);
  createUserDuration.add(createRes.timings.duration);

  const createSuccess = check(createRes, {
    'POST /register → status 201': (r) => r.status === 201,
    'POST /register → response time < 2s': (r) => r.timings.duration < 2000,
    'POST /register → has user ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.id > 0;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!createSuccess);

  // Extract user ID for subsequent requests
  let userId = null;
  try {
    const body = JSON.parse(createRes.body);
    userId = body.data ? body.data.id : null;
  } catch {
    userId = null;
  }

  // Small pause between requests (simulates real user behavior)
  sleep(0.5);

  // ── Step 2: Get User (GET /api/users/:id) ──
  if (userId) {
    const getRes = http.get(
      `${BASE_URL}/api/users/${userId}`,
      { headers, tags: { operation: 'get_user' } }
    );

    totalRequests.add(1);
    getUserDuration.add(getRes.timings.duration);

    const getSuccess = check(getRes, {
      'GET /users/:id → status 200': (r) => r.status === 200,
      'GET /users/:id → response time < 2s': (r) => r.timings.duration < 2000,
      'GET /users/:id → correct user data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && body.data.email === userData.email;
        } catch {
          return false;
        }
      },
    });

    errorRate.add(!getSuccess);
    sleep(0.5);

    // ── Step 3: Delete User (DELETE /api/users/:id) ──
    const deleteRes = http.del(
      `${BASE_URL}/api/users/${userId}`,
      null,
      { headers, tags: { operation: 'delete_user' } }
    );

    totalRequests.add(1);
    deleteUserDuration.add(deleteRes.timings.duration);

    const deleteSuccess = check(deleteRes, {
      'DELETE /users/:id → status 200': (r) => r.status === 200,
      'DELETE /users/:id → response time < 2s': (r) => r.timings.duration < 2000,
      'DELETE /users/:id → success message': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.message && body.message.includes('deleted');
        } catch {
          return false;
        }
      },
    });

    errorRate.add(!deleteSuccess);

    // ── Step 4: Verify deletion (GET should return 404) ──
    const verifyRes = http.get(
      `${BASE_URL}/api/users/${userId}`,
      { headers, tags: { operation: 'verify_delete' } }
    );

    totalRequests.add(1);

    check(verifyRes, {
      'GET after DELETE → status 404': (r) => r.status === 404,
    });
  }

  // Pause between iterations (think time)
  sleep(1);
}

// ─────────────────────────────────────────────────────────────
// Summary Handler: Saves readable report to project folder
// ─────────────────────────────────────────────────────────────
export function handleSummary(data) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

  // Extract metrics safely
  const totalReqs = data.metrics.total_requests ? data.metrics.total_requests.values.count : 0;
  const errorRateVal = data.metrics.error_rate ? data.metrics.error_rate.values.rate : 0;
  const httpDuration = data.metrics.http_req_duration ? data.metrics.http_req_duration.values : {};
  const httpReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values : {};
  const iterations = data.metrics.iterations ? data.metrics.iterations.values : {};
  const vusMax = data.metrics.vus_max ? data.metrics.vus_max.values.value : 0;

  const createDuration = data.metrics.create_user_duration ? data.metrics.create_user_duration.values : {};
  const getDuration = data.metrics.get_user_duration ? data.metrics.get_user_duration.values : {};
  const deleteDuration = data.metrics.delete_user_duration ? data.metrics.delete_user_duration.values : {};

  // Check thresholds
  const passedErrorRate = errorRateVal < 0.01;
  const passedResponseTime = httpDuration['p(95)'] ? httpDuration['p(95)'] < 2000 : true;

  // Build readable text report
  const report = `
╔════════════════════════════════════════════════════════════════════╗
║           K6 LOAD TEST RESULTS REPORT                             ║
║           User Registration API                                   ║
╠════════════════════════════════════════════════════════════════════╣
║  Date       : ${dateStr}                                          
║  Time       : ${now.toTimeString().split(' ')[0]}                 
║  Duration   : 12 minutes (1m ramp-up + 10m hold + 1m ramp-down)  
║  Target VUs : 500 concurrent users                                
╚════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. OVERALL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Total Requests Made       : ${totalReqs}
  Requests Per Second       : ${httpReqs.rate ? httpReqs.rate.toFixed(2) : 'N/A'}
  Total Iterations          : ${iterations.count || 'N/A'}
  Max Virtual Users         : ${vusMax}
  Error Rate                : ${(errorRateVal * 100).toFixed(2)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 2. RESPONSE TIME METRICS (All Requests)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Average                   : ${httpDuration.avg ? httpDuration.avg.toFixed(2) : 'N/A'} ms
  Minimum                   : ${httpDuration.min ? httpDuration.min.toFixed(2) : 'N/A'} ms
  Maximum                   : ${httpDuration.max ? httpDuration.max.toFixed(2) : 'N/A'} ms
  Median (P50)              : ${httpDuration.med ? httpDuration.med.toFixed(2) : 'N/A'} ms
  P90                       : ${httpDuration['p(90)'] ? httpDuration['p(90)'].toFixed(2) : 'N/A'} ms
  P95                       : ${httpDuration['p(95)'] ? httpDuration['p(95)'].toFixed(2) : 'N/A'} ms
  P99                       : ${httpDuration['p(99)'] ? httpDuration['p(99)'].toFixed(2) : 'N/A'} ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 3. RESPONSE TIME BY ENDPOINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  POST /api/users/register (Create User)
    Average                 : ${createDuration.avg ? createDuration.avg.toFixed(2) : 'N/A'} ms
    P95                     : ${createDuration['p(95)'] ? createDuration['p(95)'].toFixed(2) : 'N/A'} ms
    Max                     : ${createDuration.max ? createDuration.max.toFixed(2) : 'N/A'} ms

  GET /api/users/:id (Get User)
    Average                 : ${getDuration.avg ? getDuration.avg.toFixed(2) : 'N/A'} ms
    P95                     : ${getDuration['p(95)'] ? getDuration['p(95)'].toFixed(2) : 'N/A'} ms
    Max                     : ${getDuration.max ? getDuration.max.toFixed(2) : 'N/A'} ms

  DELETE /api/users/:id (Delete User)
    Average                 : ${deleteDuration.avg ? deleteDuration.avg.toFixed(2) : 'N/A'} ms
    P95                     : ${deleteDuration['p(95)'] ? deleteDuration['p(95)'].toFixed(2) : 'N/A'} ms
    Max                     : ${deleteDuration.max ? deleteDuration.max.toFixed(2) : 'N/A'} ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 4. THRESHOLD RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌─────────────────────────────────┬──────────────┬──────────┐
  │ Threshold                       │ Actual       │ Result   │
  ├─────────────────────────────────┼──────────────┼──────────┤
  │ Error Rate < 1%                 │ ${(errorRateVal * 100).toFixed(2).padEnd(12)}│ ${passedErrorRate ? 'PASSED ✅' : 'FAILED ❌'} │
  │ Response Time P95 < 2000ms      │ ${httpDuration['p(95)'] ? (httpDuration['p(95)'].toFixed(0) + 'ms').padEnd(12) : 'N/A'.padEnd(12)}│ ${passedResponseTime ? 'PASSED ✅' : 'FAILED ❌'} │
  │ Response Time P99 < 2000ms      │ ${httpDuration['p(99)'] ? (httpDuration['p(99)'].toFixed(0) + 'ms').padEnd(12) : 'N/A'.padEnd(12)}│ ${httpDuration['p(99)'] && httpDuration['p(99)'] < 2000 ? 'PASSED ✅' : 'FAILED ❌'} │
  └─────────────────────────────────┴──────────────┴──────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 5. TEST CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Target URL                : ${BASE_URL}
  Ramp-Up                   : 0 → 500 users over 1 minute
  Steady State              : 500 users for 10 minutes
  Ramp-Down                 : 500 → 0 users over 1 minute
  Scenario                  : Full lifecycle (Register → Get → Delete → Verify)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 OVERALL RESULT: ${passedErrorRate && passedResponseTime ? 'ALL THRESHOLDS PASSED ✅' : 'SOME THRESHOLDS FAILED ❌'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  // Print to console
  console.log(report);

  // Save results to files (uses relative paths from where k6 is run)
  // IMPORTANT: Run k6 from the project root: cd C:\Anjani\TestingUsingKiro
  return {
    'load-tests/results/load-test-report.txt': report,
    'load-tests/results/summary.json': JSON.stringify(data, null, 2),
    stdout: report,
  };
}
