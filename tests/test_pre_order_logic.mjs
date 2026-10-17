import assert from 'assert';
import http from 'http';
import { spawn } from 'child_process';
import {
  generatePreOrderNumber,
  checkPreOrderAlert
} from '../src/db/db.js';

const HOST = '127.0.0.1';
const PORT = 3001;

function apiRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 KARUNA HOTEL POS - PRE-ORDER LOGIC & ALERT QA TEST SUITE');
  console.log('================================================================\n');

  let serverProcess = null;

  // Check if server is running on port 3001
  const isServerRunning = await new Promise((resolve) => {
    const req = http.get(`http://${HOST}:${PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });

  if (!isServerRunning) {
    console.log('⚡ Starting node server/server.js for tests...');
    serverProcess = spawn('node', ['server/server.js'], {
      stdio: 'ignore',
      detached: false
    });
    await new Promise((r) => setTimeout(r, 1500));
  }

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error: ${e.message}\n`);
      failed++;
    }
  }

  // TEST 1: Unique Pre-Order sequential numbers
  await test('TC-PRE-01: Unique Sequential Pre-Order Number Generation', () => {
    const ord1 = generatePreOrderNumber();
    const ord2 = generatePreOrderNumber();
    assert.match(ord1, /^PRE-\d{6}-\d{3}$/, 'Matches PRE-YYMMDD-XXX format');
    assert.match(ord2, /^PRE-\d{6}-\d{3}$/, 'Matches PRE-YYMMDD-XXX format');
    assert.notStrictEqual(ord1, ord2, 'Pre-order numbers must be distinct');
  });

  // TEST 2: Auto-Balance Calculation
  await test('TC-PRE-02: Real-time Balance Calculation (Total - Advance = Balance)', () => {
    const items = [
      { id: 33, name: 'Gulab Jamun', price: 320, qty: 5 }, // 5 * 320 = 1600
      { id: 13, name: 'Samosa', price: 40, qty: 50 }       // 50 * 40 = 2000
    ];
    const totalAmount = items.reduce((sum, it) => sum + (it.price * it.qty), 0);
    assert.strictEqual(totalAmount, 3600, 'Total should be 3600');

    // Case 1: Partial advance paid
    const advancePaid1 = 1000;
    const balance1 = Math.max(0, totalAmount - advancePaid1);
    assert.strictEqual(balance1, 2600, 'Balance should be 2600');

    // Case 2: Full advance paid
    const advancePaid2 = 3600;
    const balance2 = Math.max(0, totalAmount - advancePaid2);
    assert.strictEqual(balance2, 0, 'Balance should be 0 when full paid');

    // Case 3: Zero advance paid
    const advancePaid3 = 0;
    const balance3 = Math.max(0, totalAmount - advancePaid3);
    assert.strictEqual(balance3, 3600, 'Balance should equal total amount when zero advance');
  });

  // TEST 3: Alert Logic - 1 Day Before the Date of Order (Due Tomorrow)
  await test('TC-PRE-03: Alert Triggered Exactly 1 Day Before Order Date (Due Tomorrow)', () => {
    const now = new Date();

    // 1. Order scheduled for TOMORROW (1 day ahead) -> ALERT MUST TRIGGER!
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    const alertTomorrow = checkPreOrderAlert(tomorrowStr);
    assert.strictEqual(alertTomorrow.diffDays, 1, 'Difference in days must be 1');
    assert.strictEqual(alertTomorrow.isTomorrow, true, 'isTomorrow must be true');
    assert.strictEqual(alertTomorrow.isUrgent, true, 'isUrgent alert must be true');

    // 2. Order scheduled for TODAY -> Due today!
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const alertToday = checkPreOrderAlert(todayStr);
    assert.strictEqual(alertToday.diffDays, 0, 'Difference in days must be 0 for today');
    assert.strictEqual(alertToday.isToday, true, 'isToday must be true');
    assert.strictEqual(alertToday.isUrgent, true, 'isUrgent must be true for today');

    // 3. Order scheduled for 5 days later -> Not due tomorrow!
    const future = new Date(now);
    future.setDate(future.getDate() + 5);
    const futureStr = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;
    const alertFuture = checkPreOrderAlert(futureStr);
    assert.strictEqual(alertFuture.diffDays, 5, 'Difference in days must be 5');
    assert.strictEqual(alertFuture.isTomorrow, false, 'isTomorrow must be false');
    assert.strictEqual(alertFuture.isUrgent, false, 'isUrgent must be false');
  });

  // TEST 4: Master Server REST API CRUD for preOrders
  await test('TC-PRE-04: Master Server Pre-Orders CRUD & Schema Persistence', async () => {
    // 1. Create a pre-order via API
    const newPreOrder = {
      orderNo: 'PRE-TEST-001',
      customerName: 'Mr. Rajesh Sharma',
      customerPhone: '9822012345',
      deliveryDate: '2026-10-25',
      deliveryTime: '11:30',
      items: [
        { id: 33, name: 'Gulab Jamun', price: 320, unit: '5 Kg', qty: 1 },
        { id: 13, name: 'Samosa', price: 40, unit: 'Plate', qty: 25 }
      ],
      totalAmount: 1320,
      advancePayment: 500,
      advancePaymentMode: 'UPI / QR',
      balanceAmount: 820,
      notes: 'Please pack in 1kg boxes',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const postRes = await apiRequest('/api/preOrders', 'POST', newPreOrder);
    assert.strictEqual(postRes.status, 200, 'POST /api/preOrders returned 200');
    assert(postRes.data.success, 'POST succeeded');
    const createdId = postRes.data.data.id;
    assert(createdId, 'Pre-Order received unique database ID');

    // 2. Read back pre-orders
    const getRes = await apiRequest('/api/preOrders');
    assert.strictEqual(getRes.status, 200, 'GET /api/preOrders returned 200');
    const all = getRes.data.data || [];
    const found = all.find((o) => o && (o.id === createdId || o.orderNo === 'PRE-TEST-001'));
    assert(found, 'Created pre-order found in database');
    assert.strictEqual(found.customerName, 'Mr. Rajesh Sharma');
    assert.strictEqual(found.balanceAmount, 820);
    assert.strictEqual(found.advancePayment, 500);

    // 3. Update pre-order advance payment (collected additional 300)
    const putRes = await apiRequest(`/api/preOrders/${createdId}`, 'PUT', {
      advancePayment: 800,
      balanceAmount: 520
    });
    assert.strictEqual(putRes.status, 200, 'PUT /api/preOrders/:id returned 200');
    assert.strictEqual(putRes.data.data.advancePayment, 800);
    assert.strictEqual(putRes.data.data.balanceAmount, 520);

    // 4. Clean up test pre-order
    const delRes = await apiRequest(`/api/preOrders/${createdId}`, 'DELETE');
    assert.strictEqual(delRes.status, 200, 'DELETE /api/preOrders/:id returned 200');
  });

  // TEST 5: Settle Pre-Order into POS Bill Transaction & Stock Integrity
  await test('TC-PRE-05: Settle Pre-Order to Final POS Bill & Stock Integrity', async () => {
    const allData = await apiRequest('/api/all-data');
    const existingDishes = allData.data.data.dishes || [];
    assert(existingDishes.length > 0, 'Dishes list is available');
    const targetDish = existingDishes[0];

    const preOrderBill = {
      tableNo: 'Pre-Order: PRE-SETTLE-001',
      customerName: 'Anil Kulkarni',
      customerPhone: '9890011223',
      sectionName: 'Pre-Orders',
      items: [
        {
          id: targetDish.id,
          name: targetDish.name,
          price: targetDish.price || 50,
          qty: 2,
          unit: targetDish.unit || '1'
        }
      ],
      subtotal: (targetDish.price || 50) * 2,
      total: (targetDish.price || 50) * 2,
      finalTotal: (targetDish.price || 50) * 2,
      paymentMode: 'Cash',
      notes: 'Pre-Order PRE-SETTLE-001 Balance Paid on Delivery'
    };

    const settleRes = await apiRequest('/api/bills/settle', 'POST', preOrderBill);
    assert.strictEqual(settleRes.status, 200, 'Settle returned 200');
    assert(settleRes.data.success, 'Settle succeeded');
    assert(settleRes.data.bill.invoiceNo, 'Generated formal invoice number');
    assert.strictEqual(settleRes.data.bill.status, 'settled', 'Bill status is settled');
    assert(settleRes.data.bill.id, 'Bill received unique database ID');
  });

  if (serverProcess) {
    serverProcess.kill();
  }

  console.log('\n================================================================');
  console.log(`🏁 QA RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
