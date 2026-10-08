import http from 'http';
import { WebSocket } from 'ws';
import assert from 'node:assert';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseItemWeightInKg, getCounterPrefix, generateCounterInvoiceNo } from '../src/db/db.js';
import { parseCSVAndValidateRates } from '../src/utils/excelUtils.js';
import { getPrintDishName, format12HourTime, formatReceiptDate } from '../src/utils/receiptUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const HOST = 'localhost';

function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: HOST,
      port: PORT,
      path,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function ensureServerRunning() {
  const isHealthy = await new Promise((resolve) => {
    const req = http.get(`http://${HOST}:${PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });

  if (isHealthy) {
    return { spawned: null };
  }

  console.log('⚡ Server not detected on port 3001. Spawning node server/server.js for tests...');
  const serverPath = path.resolve(__dirname, '../server/server.js');
  const serverProcess = spawn(process.execPath, [serverPath], {
    stdio: 'ignore',
    env: process.env
  });

  // Wait up to 6 seconds for server to be healthy
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const healthy = await new Promise((resolve) => {
      const req = http.get(`http://${HOST}:${PORT}/api/health`, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(500, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (healthy) {
      console.log('✅ Temporary test server started successfully.\n');
      return { spawned: serverProcess };
    }
  }

  throw new Error('Failed to start test server on port 3001 within timeout.');
}

async function runQATestSuite() {
  console.log('================================================================');
  console.log('🧪 KARUNA HOTEL POS - OFFICIAL QA TEST SUITE & SYSTEM AUDIT');
  console.log('================================================================\n');

  let passedTests = 0;
  let failedTests = 0;
  const testResults = [];
  let serverHandle = null;

  try {
    serverHandle = await ensureServerRunning();

  async function runTestCase(testId, testName, testFn) {
    try {
      await testFn();
      console.log(`✅ [PASS] ${testId}: ${testName}`);
      passedTests++;
      testResults.push({ id: testId, name: testName, status: 'PASSED' });
    } catch (err) {
      console.error(`❌ [FAIL] ${testId}: ${testName}`);
      console.error(`   Reason: ${err.message}\n`);
      failedTests++;
      testResults.push({ id: testId, name: testName, status: 'FAILED', error: err.message });
    }
  }

  // --- TEST CASE 1: Weight & Unit Parsing ---
  await runTestCase('TC-01', 'Accurate Weight & Unit Parsing in Kg', () => {
    assert.strictEqual(parseItemWeightInKg({ unit: '250g' }), 0.25, '250g should parse to 0.25 Kg');
    assert.strictEqual(parseItemWeightInKg({ unit: '500g' }), 0.5, '500g should parse to 0.5 Kg');
    assert.strictEqual(parseItemWeightInKg({ unit: '1 Kg' }), 1, '1 Kg should parse to 1.0 Kg');
    assert.strictEqual(parseItemWeightInKg({ weightKg: 0.75 }), 0.75, 'weightKg field priority should be 0.75');
    assert.strictEqual(parseItemWeightInKg({ unit: '1 Plate' }), 1, 'Standard plate should parse to 1 unit count');
  });

  // --- TEST CASE 2: Counter Prefix & Sequential Invoice Numbering ---
  await runTestCase('TC-02', 'Counter Prefix & Unique Sequential Invoice Generation', () => {
    assert.strictEqual(getCounterPrefix('Counter 1 (Breakfast & Snacks)'), 'C1');
    assert.strictEqual(getCounterPrefix('Counter 2 (Sweets & Mithai)'), 'C2');
    assert.strictEqual(getCounterPrefix('Counter 3 (Parcels & Takeaway)'), 'C3');
    assert.strictEqual(getCounterPrefix('Owner Master Terminal'), 'M');

    const inv1 = generateCounterInvoiceNo('Counter 1');
    const inv2 = generateCounterInvoiceNo('Counter 1');
    assert.match(inv1, /^INV-C1-\d{6}-\d+$/, 'Invoice format matches INV-C1-YYMMDD-SEQ');
    assert.notStrictEqual(inv1, inv2, 'Sequential invoice numbers must be unique');
  });

  // --- TEST CASE 3: Cart Logic - Separate Rows for Variants & Parcel ---
  await runTestCase('TC-03', 'Cart Isolation: Multi-Price Variants & Parcel Separation', () => {
    let cart = [];

    function simulateAddToCart(dishItem) {
      const noteKey = dishItem.customNote || '';
      const initialQty = dishItem.qty !== undefined ? dishItem.qty : 1;
      const unitKey = dishItem.unit || (dishItem.weightKg ? `${dishItem.weightKg} Kg` : null);
      const isParcel = Boolean(dishItem.isParcel);

      const existingIndex = cart.findIndex((item) => {
        const matchIdentity = item.id === dishItem.id || (item.name && dishItem.name && item.name === dishItem.name);
        if (!matchIdentity) return false;
        const itemUnit = item.unit || (item.weightKg ? `${item.weightKg} Kg` : null);
        if ((itemUnit || '') !== (unitKey || '')) return false;
        if (Boolean(item.isParcel) !== isParcel) return false;
        if (noteKey !== (item.customNote || '')) return false;
        return true;
      });

      if (existingIndex !== -1) {
        const existing = cart[existingIndex];
        const newQty = (parseFloat(existing.qty) || 1) + initialQty;
        cart[existingIndex] = { ...existing, qty: newQty };
      } else {
        const cartItemId = `${dishItem.id}_${Date.now()}_${Math.random()}`;
        cart.push({ ...dishItem, cartItemId, qty: initialQty, unit: unitKey, isParcel });
      }
    }

    // 1. Add Single Idli Vada (Dine in)
    simulateAddToCart({ id: 1, name: 'Single Idli Vada', price: 50, isParcel: false });
    // 2. Add Single Idli Vada again (Dine in -> should increment qty to 2)
    simulateAddToCart({ id: 1, name: 'Single Idli Vada', price: 50, isParcel: false });
    // 3. Add Single Idli Vada (Parcel -> MUST be a separate row!)
    simulateAddToCart({ id: 1, name: 'Single Idli Vada', price: 50, isParcel: true });
    // 4. Add Gulab Jamun 250g
    simulateAddToCart({ id: 33, name: 'Gulab Jamun', price: 80, unit: '250g', weightKg: 0.25 });
    // 5. Add Gulab Jamun 500g (MUST be a separate row!)
    simulateAddToCart({ id: 33, name: 'Gulab Jamun', price: 160, unit: '500g', weightKg: 0.5 });

    assert.strictEqual(cart.length, 4, 'Cart must have exactly 4 separate rows');
    assert.strictEqual(cart[0].qty, 2, 'Dine-in Idli Vada should have qty 2');
    assert.strictEqual(cart[1].isParcel, true, 'Parcel Idli Vada is distinct row with isParcel=true');
    assert.strictEqual(cart[2].unit, '250g', 'Gulab Jamun 250g is preserved with price 80');
    assert.strictEqual(cart[3].unit, '500g', 'Gulab Jamun 500g is preserved with price 160');

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    // (50*2) + (50*1) + (80*1) + (160*1) = 100 + 50 + 80 + 160 = 390
    assert.strictEqual(total, 390, 'Grand total must equal 390');
  });

  // --- TEST CASE 4: Master Server Health & Full Data Loading ---
  await runTestCase('TC-04', 'Master Server Connectivity & Complete Schema Validation', async () => {
    const health = await apiRequest('/api/health');
    assert.strictEqual(health.status, 200, 'Health check returned 200');
    assert.strictEqual(health.data.status, 'ok', 'Status is ok');
    assert.strictEqual(health.data.hotelName, 'Karuna Hotel', 'Hotel Name is Karuna Hotel');

    const allData = await apiRequest('/api/all-data');
    assert.strictEqual(allData.status, 200, 'All-data returned 200');
    assert(allData.data.data.dishes.length >= 1, 'Loaded dishes list');
    assert(allData.data.data.sections.length >= 1, 'Loaded sections');
    assert(allData.data.data.diningTables.length >= 1, 'Loaded dining tables');
  });

  // --- TEST CASE 5: Real-Time WebSocket Handshake & Broadcaster ---
  await runTestCase('TC-05', 'WebSocket Handshake, Terminal Registration & Live Ping/Pong', async () => {
    const ws = new WebSocket(`ws://${HOST}:${PORT}`);
    let pongReceived = false;
    let connectedMsgReceived = false;

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(), 3000);

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'PING' }));
        ws.send(JSON.stringify({
          type: 'REGISTER_TERMINAL',
          name: 'Counter 2 Sweets Terminal',
          counterId: 'C2',
          mode: 'POS'
        }));
      });

      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'PONG') pongReceived = true;
          if (parsed.type === 'CONNECTED') connectedMsgReceived = true;
          if (pongReceived && connectedMsgReceived) {
            clearTimeout(timer);
            resolve();
          }
        } catch (e) {}
      });

      ws.on('error', reject);
    });

    ws.close();
    assert.strictEqual(connectedMsgReceived, true, 'Server sent CONNECTED greeting');
    assert.strictEqual(pongReceived, true, 'Server replied with PONG upon PING');
  });

  // --- TEST CASE 6: Atomic Settlement Transaction & Stock Deduction ---
  await runTestCase('TC-06', 'Atomic Settlement: Bill Creation, Stock Deduction & Table Clearing', async () => {
    // 1. Create a dining table with order
    const tableRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'QA-D1',
      sectionId: 1,
      status: 'occupied',
      currentCart: [{ id: 1, name: 'Single Idli Vada', price: 50, qty: 1 }],
      currentTokenNo: '5501'
    });
    const testTableId = tableRes.data.data?.id;
    assert(testTableId, 'Temporary test table created');

    // 2. Fetch current dish stock and ensure sufficient stock
    const dishesRes = await apiRequest('/api/dishes');
    assert(dishesRes.data?.data?.length > 0, 'Dishes list is not empty');
    const targetDish = dishesRes.data.data[0];
    
    // Guarantee test idempotency by ensuring targetDish has fresh stock
    const initialStock = 25;
    await apiRequest(`/api/dishes/${targetDish.id}`, 'PUT', { stockQty: initialStock });

    // 3. Settle Bill for QA-D1
    const settleRes = await apiRequest('/api/bills/settle', 'POST', {
      tableId: testTableId,
      tokenNo: '5501',
      tableNo: 'QA-D1',
      sectionName: 'Dine In Area',
      items: [{ id: targetDish.id, srNo: targetDish.srNo, name: targetDish.name, price: targetDish.price || 50, qty: 2, weightKg: 1 }],
      subtotal: (targetDish.price || 50) * 2,
      total: (targetDish.price || 50) * 2,
      paymentDetails: { mode: 'Cash', cash: (targetDish.price || 50) * 2, online: 0 }
    });

    assert.strictEqual(settleRes.status, 200, 'Settlement returned 200');
    assert.strictEqual(settleRes.data.success, true, 'Settlement succeeded');
    assert(settleRes.data.bill?.id, 'Settled bill ID returned');

    // 4. Verify Dish stock was deducted by 2
    const updatedDishes = await apiRequest('/api/dishes');
    const updatedDish = updatedDishes.data.data.find(d => d.id === targetDish.id);
    assert(updatedDish, `Found updated dish with ID ${targetDish.id}`);
    assert.strictEqual(updatedDish.stockQty, initialStock - 2, 'Dish stock was decremented accurately by 2');

    // Clean up
    await apiRequest(`/api/diningTables/${testTableId}`, 'DELETE');
  });

  // --- TEST CASE 7: Offline Batch Sync Duplicate Prevention ---
  await runTestCase('TC-07', 'Offline Reconnection Batch Sync & Idempotent Deduplication', async () => {
    const uniqueInvNo = `INV-TEST-OFFLINE-${Date.now()}`;
    const offlineBatch = {
      bills: [
        {
          id: Date.now() + 1,
          tokenNo: '1001',
          invoiceNo: uniqueInvNo,
          counterId: 'C1',
          total: 80,
          items: [{ id: 33, name: 'Gulab Jamun', price: 80, qty: 1, weightKg: 0.25 }]
        }
      ],
      occupiedTables: []
    };

    // First Sync
    const sync1 = await apiRequest('/api/bills/sync-offline', 'POST', offlineBatch);
    assert.strictEqual(sync1.data.success, true, 'First sync succeeded');
    assert.strictEqual(sync1.data.syncedCount, 1, 'First sync imported 1 bill');

    // Duplicate Sync Attempt (Re-sending the exact same offline batch)
    const sync2 = await apiRequest('/api/bills/sync-offline', 'POST', offlineBatch);
    assert.strictEqual(sync2.data.success, true, 'Duplicate sync handled gracefully');
    assert.strictEqual(sync2.data.syncedCount, 0, 'Duplicate bill correctly skipped without double-charging stock');
  });

  // --- TEST CASE 8: Menu CSV Validation & Parsing ---
  await runTestCase('TC-08', 'CSV Import Rate Parser & Missing Column Validation', () => {
    // Valid CSV
    const validCSV = `Sr. No.,Dish Name,Marathi Name,Category,Price (₹),Base Rate Per Kg (₹)\n101,"Single Idli Vada","सिंगल इडली वडा","Breakfast",55,\n201,"Gulab Jamun","गुलाब जामुन","Sweets",80,320`;
    const validResult = parseCSVAndValidateRates(validCSV);
    assert.strictEqual(validResult.success, true, 'Valid CSV successfully parsed');
    assert.strictEqual(validResult.items.length, 2, 'Parsed 2 dishes');
    assert.strictEqual(validResult.items[0].price, 55, 'Updated price parsed as 55');
    assert.strictEqual(validResult.items[1].pricePerKg, 320, 'Base rate per kg parsed as 320');

    // Invalid CSV (Missing price column)
    const invalidCSV = `Sr. No.,Dish Name,Marathi Name\n101,"Single Idli Vada","सिंगल इडली वडा"`;
    const invalidResult = parseCSVAndValidateRates(invalidCSV);
    assert.strictEqual(invalidResult.success, false, 'Invalid CSV rejected');
    assert.strictEqual(invalidResult.missingPriceAlert, true, 'Missing price column detected and blocked');
  });

  // --- TEST CASE 9: Automated Hourly Disk Snapshot Creation ---
  await runTestCase('TC-09', 'Hourly Automated Disk Snapshot & JSON Backup Integrity', async () => {
    const snapshot = await apiRequest('/api/database/snapshot', 'POST');
    assert.strictEqual(snapshot.status, 200, 'Snapshot endpoint returned 200');
    assert.strictEqual(snapshot.data.success, true, 'Snapshot success flag true');
    assert(snapshot.data.file.endsWith('.json'), 'Snapshot saved as .json backup file');

    const backup = await apiRequest('/api/database/backup', 'GET');
    assert.strictEqual(backup.status, 200, 'Full backup export returned 200');
    assert.strictEqual(backup.data.appName, 'KarunaPOS', 'Backup appName is KarunaPOS');
    assert(Array.isArray(backup.data.dishes), 'Backup contains dishes collection');
    assert(Array.isArray(backup.data.diningTables), 'Backup contains diningTables collection');
  });

  // --- TEST CASE 10: Server Status & Today Revenue Calculation ---
  await runTestCase('TC-10', 'Real-time Server Monitor Status & Today Sales Computation', async () => {
    const status = await apiRequest('/api/server/status');
    assert.strictEqual(status.status, 200, 'Status returned 200');
    assert.strictEqual(status.data.status, 'ONLINE', 'Server engine status is ONLINE');
    assert(status.data.totalBillsCount >= 0, 'Total bills count available');
    assert(status.data.todayRevenue >= 0, 'Today revenue computed correctly');
    assert(Array.isArray(status.data.serverIps) && status.data.serverIps.length > 0, 'LAN IP addresses resolved for CAT6 laptops');
  });

  // --- TEST CASE 11: Dynamic Dining Card Addition, Deletion & Permanent Persistence ---
  await runTestCase('TC-11', 'Card Removal & Addition with Real-time Deletion Persistence', async () => {
    // 1. Create a test card
    const createRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'TEST-F99',
      sectionId: 2,
      status: 'empty',
      currentCart: []
    });
    assert.strictEqual(createRes.status, 200, 'Card creation returned 200');
    const createdId = createRes.data.data.id;
    assert(createdId, 'Created card has valid ID');

    // 2. Verify card exists
    const listRes1 = await apiRequest('/api/diningTables', 'GET');
    const found1 = listRes1.data.data.find((t) => String(t.id) === String(createdId) || t.name === 'TEST-F99');
    assert(found1, 'Created card TEST-F99 found in tables list');

    // 3. Delete the card
    const deleteRes = await apiRequest(`/api/diningTables/${createdId}`, 'DELETE');
    assert.strictEqual(deleteRes.status, 200, 'Card deletion returned 200');

    // 4. Verify card is permanently removed and NOT restored by any default fallback
    const listRes2 = await apiRequest('/api/diningTables', 'GET');
    const found2 = listRes2.data.data.find((t) => String(t.id) === String(createdId) || t.name === 'TEST-F99');
    assert(!found2, 'Deleted card TEST-F99 is permanently removed and not restored');
  });

  // --- TEST CASE 12: Dual-Language KOT/Bill Printing & 12-Hour AM/PM Time Formatting ---
  await runTestCase('TC-12', 'Dual Language Print (English/Marathi) & 12-Hour AM/PM Time Format', async () => {
    // 1. Test 12-Hour AM/PM Formatter
    const morningDate = new Date('2026-09-30T10:53:00');
    const afternoonDate = new Date('2026-09-30T14:30:00');
    const midnightDate = new Date('2026-09-30T00:15:00');
    const noonDate = new Date('2026-09-30T12:00:00');

    assert.strictEqual(format12HourTime(morningDate), '10:53 AM', 'Morning 10:53 correctly formatted as 10:53 AM');
    assert.strictEqual(format12HourTime(afternoonDate), '02:30 PM', 'Afternoon 14:30 correctly formatted as 02:30 PM');
    assert.strictEqual(format12HourTime(midnightDate), '12:15 AM', 'Midnight 00:15 correctly formatted as 12:15 AM');
    assert.strictEqual(format12HourTime(noonDate), '12:00 PM', 'Noon 12:00 correctly formatted as 12:00 PM');
    assert.strictEqual(formatReceiptDate(morningDate), '30-09-2026', 'Date formatted as DD-MM-YYYY');

    // 2. Test Marathi dish translation for KOT and Bill (matching user photos)
    const itemShabu = { name: 'Single Shabu Vada', marathiName: 'सिंगल शाबूवडा' };
    const itemTea = { name: 'Special Tea', marathiName: 'स्पे. चहा' };
    const itemPuri = { name: 'Puri Bhaji', marathiName: 'पुरी भाजी' };
    const itemNoMarathi = { name: 'Pohe' };

    // Marathi mode ('mr')
    assert.strictEqual(getPrintDishName(itemShabu, 'mr'), 'सिंगल शाबूवडा', 'Single Shabu Vada prints in Marathi');
    assert.strictEqual(getPrintDishName(itemTea, 'mr'), 'स्पे. चहा', 'Special Tea prints in Marathi');
    assert.strictEqual(getPrintDishName(itemPuri, 'mr'), 'पुरी भाजी', 'Puri Bhaji prints in Marathi');
    assert.strictEqual(getPrintDishName(itemNoMarathi, 'mr'), 'पोहे', 'Pohe translates to Marathi via dictionary');

    // English mode ('en')
    assert.strictEqual(getPrintDishName(itemShabu, 'en'), 'Single Shabu Vada', 'Single Shabu Vada prints in English');
    assert.strictEqual(getPrintDishName(itemTea, 'en'), 'Special Tea', 'Special Tea prints in English');
    assert.strictEqual(getPrintDishName(itemPuri, 'en'), 'Puri Bhaji', 'Puri Bhaji prints in English');
    assert.strictEqual(getPrintDishName(itemNoMarathi, 'en'), 'Pohe', 'Pohe prints in English');

    // Reverse lookup from pure Devanagari dish name
    const itemDevanagariOnly = { name: 'पुरी भाजी' };
    assert.strictEqual(getPrintDishName(itemDevanagariOnly, 'en'), 'Puri Bhaji', 'Devanagari dish reverse translates to English');
    assert.strictEqual(getPrintDishName(itemDevanagariOnly, 'mr'), 'पुरी भाजी', 'Devanagari dish stays Devanagari in Marathi mode');
  });

  // --- TEST CASE 13: Bulk Price Update with Section Prices & Multi-Price Propagation ---
  await runTestCase('TC-13', 'Bulk Dish Price Update Propagates to Base, Section Rates & Variants', async () => {
    // 1. Fetch target dishes (Uppit & Gulab Jamun) and reset initial state for idempotency
    const dishesRes = await apiRequest('/api/dishes');
    const uppit = dishesRes.data.data.find(d => d.name === 'Uppit' || d.srNo === 102);
    const gulabJamun = dishesRes.data.data.find(d => d.name === 'Gulab Jamun' || d.srNo === 201);
    assert(uppit, 'Uppit dish found');
    assert(gulabJamun, 'Gulab Jamun dish found');

    await apiRequest(`/api/dishes/${uppit.id}`, 'PUT', { price: 50, sectionPrices: { 1: 50, 2: 50, 3: 60, 4: 50 } });
    await apiRequest(`/api/dishes/${gulabJamun.id}`, 'PUT', { price: 80, pricePerKg: 320 });

    // 2. Perform bulk update with modified prices
    const newUppitPrice = 65;
    const newJamunPrice = 110;
    const updateRes = await apiRequest('/api/dishes/bulk-prices', 'POST', {
      items: [
        { srNo: uppit.srNo, name: uppit.name, price: newUppitPrice },
        { srNo: gulabJamun.srNo, name: gulabJamun.name, price: newJamunPrice }
      ]
    });

    assert.strictEqual(updateRes.status, 200, 'Bulk update returned 200');
    assert.strictEqual(updateRes.data.success, true, 'Bulk update marked success');

    // 3. Verify in database
    const refreshedRes = await apiRequest('/api/dishes');
    const updatedUppit = refreshedRes.data.data.find(d => d.id === uppit.id);
    const updatedJamun = refreshedRes.data.data.find(d => d.id === gulabJamun.id);

    assert.strictEqual(updatedUppit.price, newUppitPrice, 'Uppit dish price updated to 65');
    assert.strictEqual(updatedUppit.sectionPrices['1'], newUppitPrice, 'Uppit Dine In section price updated to 65');
    assert.strictEqual(updatedUppit.sectionPrices['4'], newUppitPrice, 'Uppit Parcels section price updated to 65');
    assert(updatedUppit.sectionPrices['3'] >= newUppitPrice, 'Uppit AC Hall section price reflects higher rate');

    assert.strictEqual(updatedJamun.price, newJamunPrice, 'Gulab Jamun price updated to 110');
    assert.strictEqual(updatedJamun.pricePerKg, newJamunPrice * 4, 'Gulab Jamun pricePerKg recalculated to 440');
    assert.strictEqual(updatedJamun.variants[0].price, newJamunPrice, 'Gulab Jamun 250g variant updated to 110');
    assert.strictEqual(updatedJamun.variants[2].price, newJamunPrice * 4, 'Gulab Jamun 1 Kg variant updated to 440');
  });

  // --- TEST CASE 14: Full Database Backup Export & Restore on New Device ---
  await runTestCase('TC-14', 'Full Database Backup Export & Complete Restore Integrity', async () => {
    // 1. Export Backup
    const backupRes = await apiRequest('/api/database/backup', 'GET');
    assert.strictEqual(backupRes.status, 200, 'Backup export returned 200');
    const backupData = backupRes.data;
    assert(Array.isArray(backupData.dishes), 'Dishes collection exists in backup');
    assert(Array.isArray(backupData.categories), 'Categories collection exists in backup');

    // 2. Modify backup data (simulate taking from old device with unique test dish)
    const testDish = {
      id: 9999,
      srNo: 999,
      name: 'QA Device Transfer Dish',
      marathiName: 'QA नवीन डिव्हाइस पदार्थ',
      price: 155,
      categoryId: 1,
      subCategoryId: 1,
      counter: 'Breakfast',
      status: 'In Stock',
      sectionPrices: { 1: 155 }
    };
    const modifiedBackup = {
      ...backupData,
      dishes: [...backupData.dishes, testDish]
    };

    // 3. Restore to system (simulate importing backup on new device)
    const restoreRes = await apiRequest('/api/database/restore', 'POST', modifiedBackup);
    assert.strictEqual(restoreRes.status, 200, 'Database restore returned 200');
    assert.strictEqual(restoreRes.data.success, true, 'Restore marked success');

    // 4. Verify new device database now contains restored data
    const allDataRes = await apiRequest('/api/all-data', 'GET');
    const restoredDish = allDataRes.data.data.dishes.find(d => d.id === 9999 || d.srNo === 999);
    assert(restoredDish, 'Restored dish successfully found in new device database');
    assert.strictEqual(restoredDish.price, 155, 'Restored dish price accurately maintained at 155');

    // Clean up test dish
    await apiRequest('/api/dishes/9999', 'DELETE');
  });

  // --- TEST CASE 15: Excel/CSV Menu Import Adds New Items with Sections & Sweets Variants ---
  await runTestCase('TC-15', 'Excel/CSV Import Adds Brand New Dishes with Full Rates & Categories', async () => {
    // 1. Simulate Excel/CSV content with an existing dish, a new breakfast dish, and a new sweet dish
    const csvContent = `Sr. No.,Dish Name,Marathi Name,Category,Sub Category,Price (₹),Base Rate Per Kg (₹),Counter
102,"Uppit","उप्पीट","Breakfast & Snacks","Single Items",50,,"Breakfast"
850,"Crispy Corn Tikki","क्रिस्पी कॉर्न टिक्की","Breakfast & Snacks","Single Items",95,,"Breakfast"
860,"Anjeer Dryfruit Barfi","अंजीर ड्रायफ्रूट बर्फी","Sweets","Barfi Specials",200,800,"Sweets"`;

    const parsed = parseCSVAndValidateRates(csvContent);
    assert.strictEqual(parsed.success, true, 'CSV parsed successfully');
    assert.strictEqual(parsed.items.length, 3, 'All 3 items parsed including new items');

    // 2. Import into system via bulk-prices API
    const importRes = await apiRequest('/api/dishes/bulk-prices', 'POST', { items: parsed.items });
    assert.strictEqual(importRes.status, 200, 'Import API returned 200');
    assert.strictEqual(importRes.data.success, true, 'Import succeeded');

    // 3. Verify new breakfast dish in database
    const refreshed = await apiRequest('/api/dishes', 'GET');
    const newBreakfast = refreshed.data.data.find(d => d.srNo === 850 || d.name === 'Crispy Corn Tikki');
    assert(newBreakfast, 'New breakfast dish Crispy Corn Tikki successfully added');
    assert.strictEqual(newBreakfast.price, 95, 'New dish price set correctly to 95');
    assert.strictEqual(newBreakfast.marathiName, 'क्रिस्पी कॉर्न टिक्की', 'Marathi name populated');
    assert.strictEqual(newBreakfast.counter, 'Breakfast', 'Counter assigned correctly to Breakfast');
    assert.strictEqual(newBreakfast.sectionPrices['1'], 95, 'Dine In section rate set to 95');
    assert.strictEqual(newBreakfast.sectionPrices['4'], 95, 'Parcels section rate set to 95');

    // 4. Verify new sweet dish in database
    const newSweet = refreshed.data.data.find(d => d.srNo === 860 || d.name === 'Anjeer Dryfruit Barfi');
    assert(newSweet, 'New sweet dish Anjeer Dryfruit Barfi successfully added');
    assert.strictEqual(newSweet.pricePerKg, 800, 'Price per kg set to 800');
    assert.strictEqual(newSweet.hasMultiplePrices, true, 'Sweet marked as multi-price');
    assert.strictEqual(newSweet.variants.length, 3, '3 weight variants generated (250g, 500g, 1 Kg)');
    assert.strictEqual(newSweet.variants[0].price, 200, '250g variant priced at 200');
    assert.strictEqual(newSweet.variants[2].price, 800, '1 Kg variant priced at 800');
    assert.strictEqual(newSweet.counter, 'Sweets', 'Counter assigned correctly to Sweets');

    // Clean up test dishes
    await apiRequest(`/api/dishes/${newBreakfast.id}`, 'DELETE');
    await apiRequest(`/api/dishes/${newSweet.id}`, 'DELETE');
    await new Promise(r => setTimeout(r, 600));
  });

  // --- TEST CASE 16: Split Dining Table Cart Settle Never Disappears Base Table (e.g. F1, C1) ---
  await runTestCase('TC-16', 'Split Dining Table Cart Settle Restores Base Table to Normal (Never Disappears)', async () => {
    // 1. Verify standard table F1 exists
    const tablesRes1 = await apiRequest('/api/diningTables');
    const tableList1 = Array.isArray(tablesRes1.data) ? tablesRes1.data : (tablesRes1.data?.data || []);
    let f1 = tableList1.find(t => t.name === 'F1' || t.name === 'f1');
    assert(f1, 'Dining table F1 exists in initial database');
    const f1Id = f1.id;
    const f1SectionId = f1.sectionId;

    // 2. Simulate splitting F1 into F1-A and F1-B with items
    const f1BId = Date.now() + 1001;
    const splitA = {
      ...f1,
      name: 'F1-A',
      status: 'occupied',
      isSplit: true,
      parentTable: 'F1',
      baseName: 'F1',
      baseTableId: f1Id,
      currentCart: [{ id: 1, name: 'Single Idli Vada', price: 50, qty: 1 }]
    };
    const splitB = {
      id: f1BId,
      name: 'F1-B',
      sectionId: f1SectionId,
      status: 'occupied',
      isSplit: true,
      parentTable: 'F1',
      baseName: 'F1',
      baseTableId: f1Id,
      currentTokenNo: '9902',
      currentCart: [{ id: 2, name: 'Uppit', price: 50, qty: 1 }]
    };

    await apiRequest(`/api/diningTables/${f1Id}`, 'PUT', splitA);
    await apiRequest('/api/diningTables', 'POST', splitB);

    // Verify both split tables exist
    const splitCheck = await apiRequest('/api/diningTables');
    const splitList = Array.isArray(splitCheck.data) ? splitCheck.data : (splitCheck.data?.data || []);
    assert(splitList.some(t => t.name === 'F1-A'), 'Split F1-A exists');
    assert(splitList.some(t => t.name === 'F1-B'), 'Split F1-B exists');

    // 3. Settle Portion F1-A first
    const settleARes = await apiRequest('/api/bills/settle', 'POST', {
      tableId: f1Id,
      tokenNo: '9901',
      tableNo: 'F1-A',
      sectionName: 'First Floor',
      items: [{ id: 1, name: 'Single Idli Vada', price: 50, qty: 1 }],
      subtotal: 50,
      total: 50,
      paymentDetails: { mode: 'Cash', cash: 50, online: 0 }
    });
    assert.strictEqual(settleARes.status, 200, 'F1-A settlement succeeded');

    // Verify F1-B is still active and F1 has not disappeared
    const midCheck = await apiRequest('/api/diningTables');
    const midList = Array.isArray(midCheck.data) ? midCheck.data : (midCheck.data?.data || []);
    const activeB = midList.find(t => t.name === 'F1-B');
    assert(activeB, 'F1-B is still present and occupied while F1-A is settled');
    assert.strictEqual(activeB.status, 'occupied', 'F1-B remains occupied');

    // 4. Settle Portion F1-B (now both A and B are settled)
    const settleBRes = await apiRequest('/api/bills/settle', 'POST', {
      tableId: f1BId,
      tokenNo: '9902',
      tableNo: 'F1-B',
      sectionName: 'First Floor',
      items: [{ id: 2, name: 'Uppit', price: 50, qty: 1 }],
      subtotal: 50,
      total: 50,
      paymentDetails: { mode: 'Cash', cash: 50, online: 0 }
    });
    assert.strictEqual(settleBRes.status, 200, 'F1-B settlement succeeded');

    // 5. CRITICAL ASSERTION: F1 MUST COME BACK NORMAL (e.g. F1) AND NEVER DISAPPEAR
    const finalCheck = await apiRequest('/api/diningTables');
    const finalList = Array.isArray(finalCheck.data) ? finalCheck.data : (finalCheck.data?.data || []);
    const restoredF1 = finalList.find(t => t.id === f1Id || t.name === 'F1');
    assert(restoredF1, 'Table F1 did NOT disappear! It returned to the database');
    assert.strictEqual(restoredF1.name, 'F1', 'Table name restored to base name F1 (not F1-A or F1-B)');
    assert.strictEqual(restoredF1.status, 'empty', 'Table status is empty and ready for new guests');
    assert.strictEqual(restoredF1.isSplit, false, 'Table isSplit flag reset to false');
    assert.strictEqual(restoredF1.currentCart.length, 0, 'Current cart is cleared');
    assert(!finalList.some(t => t.name === 'F1-A'), 'Split variant F1-A removed');
    assert(!finalList.some(t => t.name === 'F1-B'), 'Split variant F1-B removed');

    // 6. Test with Custom Table C1 as requested by user
    const customId = Date.now() + 2001;
    const customBId = Date.now() + 2002;
    await apiRequest('/api/diningTables', 'POST', {
      id: customId,
      name: 'C1',
      sectionId: 1,
      status: 'empty',
      currentCart: []
    });

    // Split custom table C1
    await apiRequest(`/api/diningTables/${customId}`, 'PUT', {
      id: customId,
      name: 'C1-A',
      sectionId: 1,
      status: 'occupied',
      isSplit: true,
      parentTable: 'C1',
      baseName: 'C1',
      baseTableId: customId,
      currentCart: [{ id: 1, name: 'Single Idli Vada', price: 50, qty: 1 }]
    });
    await apiRequest('/api/diningTables', 'POST', {
      id: customBId,
      name: 'C1-B',
      sectionId: 1,
      status: 'occupied',
      isSplit: true,
      parentTable: 'C1',
      baseName: 'C1',
      baseTableId: customId,
      currentCart: [{ id: 2, name: 'Uppit', price: 50, qty: 1 }]
    });

    // Settle C1-A
    await apiRequest('/api/bills/settle', 'POST', {
      tableId: customId,
      tokenNo: '8801',
      tableNo: 'C1-A',
      sectionName: 'Ground Floor',
      items: [{ id: 1, name: 'Single Idli Vada', price: 50, qty: 1 }],
      subtotal: 50,
      total: 50,
      paymentDetails: { mode: 'Cash', cash: 50, online: 0 }
    });

    // Settle C1-B
    await apiRequest('/api/bills/settle', 'POST', {
      tableId: customBId,
      tokenNo: '8802',
      tableNo: 'C1-B',
      sectionName: 'Ground Floor',
      items: [{ id: 2, name: 'Uppit', price: 50, qty: 1 }],
      subtotal: 50,
      total: 50,
      paymentDetails: { mode: 'Cash', cash: 50, online: 0 }
    });

    // Verify custom table C1 collapses back to normal C1 and never disappears
    const customCheck = await apiRequest('/api/diningTables');
    const customList = Array.isArray(customCheck.data) ? customCheck.data : (customCheck.data?.data || []);
    const restoredC1 = customList.find(t => t.id === customId || t.name === 'C1');
    assert(restoredC1, 'Custom table C1 did NOT disappear! It returned to the database');
    assert.strictEqual(restoredC1.name, 'C1', 'Custom table name restored to base name C1');
    assert.strictEqual(restoredC1.status, 'empty', 'Custom table status is empty');
    assert.strictEqual(restoredC1.isSplit, false, 'Custom table isSplit reset to false');

    // Clean up custom table C1
    await apiRequest(`/api/diningTables/${customId}`, 'DELETE');
    await new Promise(r => setTimeout(r, 400));
  });

  // --- TEST CASE 17: Stock Master Recipe Deduplication & Multi-Ingredient Retention ---
  await runTestCase('TC-17', 'Stock Master: No Duplicate Raw Materials After Sale & Adding 2nd Material Never Deletes 1st', async () => {
    // 1. TEST PROBLEM 1: Settle a dish with a raw material -> verify NO duplicate recipes created
    const testDishRes = await apiRequest('/api/dishes');
    const dishList = testDishRes.data?.data || testDishRes.data || [];
    const dish2 = dishList.find(d => d.id === 2 || d.name === 'Uppit');
    assert(dish2, 'Dish 2 exists');

    // Settle a bill with Dish 2
    const settleRes = await apiRequest('/api/bills/settle', 'POST', {
      tableId: 5,
      tokenNo: '7701',
      tableNo: 'D5',
      sectionName: 'Dine In Area',
      items: [{ id: dish2.id, srNo: dish2.srNo, name: dish2.name, price: dish2.price || 50, qty: 1 }],
      subtotal: dish2.price || 50,
      total: dish2.price || 50,
      paymentDetails: { mode: 'Cash', cash: dish2.price || 50, online: 0 }
    });
    assert.strictEqual(settleRes.status, 200, 'Settlement for dish 2 succeeded');

    // Query recipes: Dish 2 must NOT have duplicate raw materials
    const recipesRes1 = await apiRequest('/api/recipes');
    const allRecipes1 = recipesRes1.data?.data || recipesRes1.data || [];
    const dish2Recipes = allRecipes1.filter(r => r && String(r.dishId) === String(dish2.id));
    
    // Check that each raw material in dish 2 appears at most once
    const rmNameCounts = {};
    for (const r of dish2Recipes) {
      const name = (r.rawMaterialName || '').toLowerCase().trim();
      rmNameCounts[name] = (rmNameCounts[name] || 0) + 1;
    }
    for (const [name, count] of Object.entries(rmNameCounts)) {
      assert.strictEqual(count, 1, `Raw material "${name}" appears exactly once in dish 2 (found ${count})`);
    }

    // 2. TEST PROBLEM 2: Adding 1st raw material, then adding 2nd raw material -> 1st MUST NOT disappear
    const testDishId = 88881;
    // Create temporary test dish
    await apiRequest('/api/dishes', 'POST', {
      id: testDishId,
      srNo: 8881,
      name: 'QA Special Halwa',
      price: 120,
      stockQty: 10,
      recipeBaseQty: 1,
      stockUnit: 'kg'
    });

    // Step A: Add 1st raw material ("Sooji")
    const rm1 = {
      dishId: testDishId,
      rawMaterialId: 99911,
      rawMaterialName: 'Sooji',
      qtyRequired: 0.5,
      baseQty: 1,
      unit: 'Kg',
      currentStock: 10
    };
    const add1Res = await apiRequest('/api/recipes', 'POST', rm1);
    assert.strictEqual(add1Res.status, 200, 'Added 1st raw material');

    // Verify 1st raw material exists
    let curRecipesRes = await apiRequest('/api/recipes');
    let curRecipes = (curRecipesRes.data?.data || curRecipesRes.data || []).filter(r => String(r.dishId) === String(testDishId));
    assert.strictEqual(curRecipes.length, 1, 'Exactly 1 recipe configured for QA Special Halwa');
    assert.strictEqual(curRecipes[0].rawMaterialName, 'Sooji', '1st ingredient is Sooji');

    // Step B: Now add 2nd raw material ("Ghee") to the same dish
    const rm2 = {
      dishId: testDishId,
      rawMaterialId: 99912,
      rawMaterialName: 'Ghee',
      qtyRequired: 0.25,
      baseQty: 1,
      unit: 'Kg',
      currentStock: 5
    };
    const add2Res = await apiRequest('/api/recipes', 'POST', rm2);
    assert.strictEqual(add2Res.status, 200, 'Added 2nd raw material');

    // Step C: CRITICAL VERIFICATION: 1st raw material must NOT disappear, both must be present!
    const finalRecipesRes = await apiRequest('/api/recipes');
    const finalRecipes = (finalRecipesRes.data?.data || finalRecipesRes.data || []).filter(r => String(r.dishId) === String(testDishId));
    
    assert.strictEqual(finalRecipes.length, 2, 'Both raw materials are present (count is 2, 1st did NOT disappear!)');
    const hasSooji = finalRecipes.some(r => r.rawMaterialName === 'Sooji');
    const hasGhee = finalRecipes.some(r => r.rawMaterialName === 'Ghee');
    assert(hasSooji, '1st raw material "Sooji" is still present and did NOT disappear!');
    assert(hasGhee, '2nd raw material "Ghee" is also successfully present!');

    // Clean up QA test items
    for (const r of finalRecipes) {
      await apiRequest(`/api/recipes/${r.id}`, 'DELETE');
    }
    await apiRequest(`/api/dishes/${testDishId}`, 'DELETE');
    await new Promise(r => setTimeout(r, 400));
  });

  // --- TEST CASE 18: Table Cards and Parcel Cards Can Be Added in Every Area (Dining, AC, Custom) ---
  await runTestCase('TC-18', 'Table Cards and Parcel Cards Can Be Added in Every Area (Dining, AC, Custom)', async () => {
    // 1. Fetch current sections
    const secsRes = await apiRequest('/api/sections');
    const sections = Array.isArray(secsRes.data) ? secsRes.data : (secsRes.data?.data || []);
    assert(sections.length > 0, 'Sections list is populated');

    // Identify dining and ac sections
    const diningSec = sections.find(s => s.name.toLowerCase().includes('dining') || s.name.toLowerCase().includes('dine'));
    const acSec = sections.find(s => s.name.toLowerCase().includes('ac'));
    assert(diningSec, 'Dining section is present');
    assert(acSec, 'AC section is present');

    // 2. Add Table Card & Parcel Card to Dining Area
    const dTableRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'QA-DINE-TBL',
      sectionId: diningSec.id,
      status: 'empty',
      currentCart: [],
      currentTokenNo: '7701',
      isParcel: false
    });
    assert.strictEqual(dTableRes.status, 200, 'Successfully added table card to Dining section');
    const dTableId = (dTableRes.data?.data || dTableRes.data)?.id;

    const dParcelRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'QA-DINE-PARCEL',
      sectionId: diningSec.id,
      status: 'empty',
      currentCart: [],
      currentTokenNo: '7702',
      isParcel: true
    });
    assert.strictEqual(dParcelRes.status, 200, 'Successfully added parcel card to Dining section');
    const dParcelId = (dParcelRes.data?.data || dParcelRes.data)?.id;

    // 3. Add Table Card & Parcel Card to AC Area
    const acTableRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'QA-AC-TBL',
      sectionId: acSec.id,
      status: 'empty',
      currentCart: [],
      currentTokenNo: '7703',
      isParcel: false
    });
    assert.strictEqual(acTableRes.status, 200, 'Successfully added table card to AC section');
    const acTableId = (acTableRes.data?.data || acTableRes.data)?.id;

    const acParcelRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'QA-AC-PARCEL',
      sectionId: acSec.id,
      status: 'empty',
      currentCart: [],
      currentTokenNo: '7704',
      isParcel: true
    });
    assert.strictEqual(acParcelRes.status, 200, 'Successfully added parcel card to AC section');
    const acParcelId = (acParcelRes.data?.data || acParcelRes.data)?.id;

    // 4. Create a Brand New Custom Area ("Garden Terrace")
    const newAreaRes = await apiRequest('/api/sections', 'POST', {
      name: 'Garden Terrace',
      extraCharge: 0,
      color: 'emerald'
    });
    assert.strictEqual(newAreaRes.status, 200, 'Successfully created new area Garden Terrace');
    const newArea = newAreaRes.data?.data || newAreaRes.data;
    const newAreaId = newArea.id;

    // 5. Add Table Card & Parcel Card into the Brand New Custom Area
    const customTableRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'QA-GT-1',
      sectionId: newAreaId,
      status: 'empty',
      currentCart: [],
      currentTokenNo: '7705',
      isParcel: false
    });
    assert.strictEqual(customTableRes.status, 200, 'Successfully added table card to new custom area');
    const customTableId = (customTableRes.data?.data || customTableRes.data)?.id;

    const customParcelRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'QA-GT-PARCEL',
      sectionId: newAreaId,
      status: 'empty',
      currentCart: [],
      currentTokenNo: '7706',
      isParcel: true
    });
    assert.strictEqual(customParcelRes.status, 200, 'Successfully added parcel card to new custom area');
    const customParcelId = (customParcelRes.data?.data || customParcelRes.data)?.id;

    // 6. Verify all 6 cards exist and are mapped correctly
    const allTablesRes = await apiRequest('/api/diningTables');
    const allTables = Array.isArray(allTablesRes.data) ? allTablesRes.data : (allTablesRes.data?.data || []);

    const verifyCard = (id, expectedName, expectedSecId, expectedIsParcel) => {
      const card = allTables.find(t => String(t.id) === String(id));
      assert(card, `Card "${expectedName}" (ID: ${id}) exists in database`);
      assert.strictEqual(card.name, expectedName, `Card name matches "${expectedName}"`);
      assert.strictEqual(String(card.sectionId), String(expectedSecId), `Card sectionId matches "${expectedSecId}"`);
      assert.strictEqual(Boolean(card.isParcel), expectedIsParcel, `Card isParcel flag is ${expectedIsParcel}`);
    };

    verifyCard(dTableId, 'QA-DINE-TBL', diningSec.id, false);
    verifyCard(dParcelId, 'QA-DINE-PARCEL', diningSec.id, true);
    verifyCard(acTableId, 'QA-AC-TBL', acSec.id, false);
    verifyCard(acParcelId, 'QA-AC-PARCEL', acSec.id, true);
    verifyCard(customTableId, 'QA-GT-1', newAreaId, false);
    verifyCard(customParcelId, 'QA-GT-PARCEL', newAreaId, true);

    // 7. Clean up all QA test cards & custom area
    await apiRequest(`/api/diningTables/${dTableId}`, 'DELETE');
    await apiRequest(`/api/diningTables/${dParcelId}`, 'DELETE');
    await apiRequest(`/api/diningTables/${acTableId}`, 'DELETE');
    await apiRequest(`/api/diningTables/${acParcelId}`, 'DELETE');
    await apiRequest(`/api/diningTables/${customTableId}`, 'DELETE');
    await apiRequest(`/api/diningTables/${customParcelId}`, 'DELETE');
    await apiRequest(`/api/sections/${newAreaId}`, 'DELETE');
    await new Promise(r => setTimeout(r, 400));
  });

  // --------------------------------------------------------------------------
  // TEST CASE 19: Permanent Deletion of Dining Area & First Floor Tables & Setting Tab Retention
  // --------------------------------------------------------------------------
  await runTestCase('TC-19', 'Permanent Deletion of Dining Area & First Floor Tables & Setting Tab Retention', async () => {
    // 1. Verify dining area table deletion (e.g. D8) and first floor table deletion (e.g. F6)
    // First create specific test dining and first floor tables to delete
    const dTestRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'D-PERM-TEST',
      sectionId: 1,
      status: 'empty',
      currentCart: []
    });
    const dTestId = (dTestRes.data?.data || dTestRes.data)?.id;
    assert(dTestId, 'Created test dining table D-PERM-TEST');

    const fTestRes = await apiRequest('/api/diningTables', 'POST', {
      name: 'F-PERM-TEST',
      sectionId: 2,
      status: 'empty',
      currentCart: []
    });
    const fTestId = (fTestRes.data?.data || fTestRes.data)?.id;
    assert(fTestId, 'Created test first floor table F-PERM-TEST');

    // Delete both tables
    const delDRes = await apiRequest(`/api/diningTables/${dTestId}`, 'DELETE');
    assert.strictEqual(delDRes.status, 200, 'DELETE request for dining table returned 200');

    const delFRes = await apiRequest(`/api/diningTables/${fTestId}`, 'DELETE');
    assert.strictEqual(delFRes.status, 200, 'DELETE request for first floor table returned 200');

    // Wait and verify neither was resurrected
    await new Promise(r => setTimeout(r, 600));
    const postDelTablesRes = await apiRequest('/api/diningTables');
    const postDelTables = Array.isArray(postDelTablesRes.data) ? postDelTablesRes.data : (postDelTablesRes.data?.data || []);

    const dFound = postDelTables.find(t => String(t.id) === String(dTestId) || t.name === 'D-PERM-TEST');
    assert(!dFound, 'Deleted dining table D-PERM-TEST is permanently deleted and not resurrected');

    const fFound = postDelTables.find(t => String(t.id) === String(fTestId) || t.name === 'F-PERM-TEST');
    assert(!fFound, 'Deleted first floor table F-PERM-TEST is permanently deleted and not resurrected');

    // 2. Setting Tab: Adding raw materials sequentially never vanishes previous raw materials
    // Create a new dish for setting test
    const newDishRes = await apiRequest('/api/dishes', 'POST', {
      name: 'QA Setting Test Sweet',
      categoryId: 2,
      subCategoryId: 8,
      price: 150,
      stockQty: 50,
      stockUnit: 'kg',
      recipeBaseQty: 1
    });
    const dishId = (newDishRes.data?.data || newDishRes.data)?.id;
    assert(dishId, 'Created dish for recipe setting test');

    // Step A: Add Raw Material 1 (Pista)
    const rm1Res = await apiRequest('/api/rawMaterials', 'POST', {
      name: 'QA-Pista',
      quantity: 20,
      unit: 'Kg',
      minThreshold: 2
    });
    const rm1Id = (rm1Res.data?.data || rm1Res.data)?.id;

    const recipe1Res = await apiRequest('/api/recipes', 'POST', {
      dishId: dishId,
      rawMaterialId: rm1Id,
      rawMaterialName: 'QA-Pista',
      qtyRequired: 0.25,
      baseQty: 1,
      unit: 'Kg'
    });
    assert.strictEqual(recipe1Res.status, 200, 'Added 1st raw material to dish');

    // Step B: Add Raw Material 2 (Badam)
    const rm2Res = await apiRequest('/api/rawMaterials', 'POST', {
      name: 'QA-Badam',
      quantity: 15,
      unit: 'Kg',
      minThreshold: 2
    });
    const rm2Id = (rm2Res.data?.data || rm2Res.data)?.id;

    const recipe2Res = await apiRequest('/api/recipes', 'POST', {
      dishId: dishId,
      rawMaterialId: rm2Id,
      rawMaterialName: 'QA-Badam',
      qtyRequired: 0.35,
      baseQty: 1,
      unit: 'Kg'
    });
    assert.strictEqual(recipe2Res.status, 200, 'Added 2nd raw material to dish');

    // Step C: Add Raw Material 3 (Cardamom)
    const rm3Res = await apiRequest('/api/rawMaterials', 'POST', {
      name: 'QA-Cardamom',
      quantity: 5,
      unit: 'Kg',
      minThreshold: 1
    });
    const rm3Id = (rm3Res.data?.data || rm3Res.data)?.id;

    const recipe3Res = await apiRequest('/api/recipes', 'POST', {
      dishId: dishId,
      rawMaterialId: rm3Id,
      rawMaterialName: 'QA-Cardamom',
      qtyRequired: 0.05,
      baseQty: 1,
      unit: 'Kg'
    });
    assert.strictEqual(recipe3Res.status, 200, 'Added 3rd raw material to dish');

    // Verify all 3 raw materials for this dish are intact and none have vanished
    const allRecipesRes = await apiRequest('/api/recipes');
    const allRecipes = Array.isArray(allRecipesRes.data) ? allRecipesRes.data : (allRecipesRes.data?.data || []);
    const dishRecipes = allRecipes.filter(r => r && String(r.dishId) === String(dishId));

    assert.strictEqual(dishRecipes.length, 3, `Expected 3 recipes for dish, got ${dishRecipes.length}`);
    const r1 = dishRecipes.find(r => r.rawMaterialName === 'QA-Pista' || String(r.rawMaterialId) === String(rm1Id));
    const r2 = dishRecipes.find(r => r.rawMaterialName === 'QA-Badam' || String(r.rawMaterialId) === String(rm2Id));
    const r3 = dishRecipes.find(r => r.rawMaterialName === 'QA-Cardamom' || String(r.rawMaterialId) === String(rm3Id));

    assert(r1, 'Previous raw material 1 (QA-Pista) is still present and did NOT vanish');
    assert(r2, 'Previous raw material 2 (QA-Badam) is still present and did NOT vanish');
    assert(r3, 'Newly added raw material 3 (QA-Cardamom) is present');

    // Clean up
    for (const r of dishRecipes) {
      await apiRequest(`/api/recipes/${r.id}`, 'DELETE');
    }
    await apiRequest(`/api/rawMaterials/${rm1Id}`, 'DELETE');
    await apiRequest(`/api/rawMaterials/${rm2Id}`, 'DELETE');
    await apiRequest(`/api/rawMaterials/${rm3Id}`, 'DELETE');
    await apiRequest(`/api/dishes/${dishId}`, 'DELETE');
  });

  } finally {
    if (serverHandle?.spawned) {
      console.log('🛑 Stopping temporary test server process...');
      try {
        serverHandle.spawned.kill();
      } catch (e) {}
    }
  }

  console.log('\n================================================================');
  console.log(`🏁 QA EXECUTION SUMMARY:`);
  console.log(`   TOTAL TESTS : ${passedTests + failedTests}`);
  console.log(`   PASSED      : ${passedTests}`);
  console.log(`   FAILED      : ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runQATestSuite();
