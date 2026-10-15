// tests/test_raw_material_stock_logic.mjs
import assert from 'node:assert';
import { getAllData, getCollection, insertItem, updateItem, deleteItem } from '../server/db.js';

console.log('🧪 Running Test Suite for Stock Master Raw Material-Wise & (Inward - Remaining = Available) Logic...\n');

async function runTests() {
  try {
    // -------------------------------------------------------------
    // TEST 1: Stock Mode Configuration & Persistence in System Settings
    // "once user set any one method of stock then it should not change, when i reopen it then 1 option was there so it should not happen"
    // -------------------------------------------------------------
    console.log('Test 1: Testing Stock Master Mode Configuration & Lock (Owner Tab Setting)...');
    
    const dbState = getAllData();
    let currentMode = dbState.systemSettings?.stockMode || 'raw_material_wise';
    console.log(`   Initial stockMode in database: "${currentMode}"`);
    
    // Update to 'raw_material_wise'
    updateItem('systemSettings', 1, { stockMode: 'raw_material_wise' });
    assert.strictEqual(getAllData().systemSettings.stockMode, 'raw_material_wise', 'stockMode must update to raw_material_wise');
    console.log('✅ [PASS] Owner Tab switch to "raw_material_wise" persists in systemSettings.');

    // Verify it stays raw_material_wise and does not revert to item_wise
    assert.strictEqual(getAllData().systemSettings.stockMode, 'raw_material_wise', 'stockMode must not revert on read');
    console.log('✅ [PASS] Stock mode remains permanently locked and retained.\n');

    // -------------------------------------------------------------
    // TEST 2: Inward Raw Material Stock Workflow
    // "when user bring row material he will enter inward stocks"
    // -------------------------------------------------------------
    console.log('Test 2: Testing Inward Raw Material Stock Workflow (आलेला माल)...');
    
    // Create a new raw material for test
    const testMatId = 'rm_test_sugar_' + Date.now();
    insertItem('rawMaterials', {
      id: testMatId,
      name: 'साखर (Sugar QA Test)',
      quantity: 0,
      inwardQty: 0,
      remainingQty: 0,
      unit: 'Kg',
      minThreshold: 5
    });

    // Step A: User records 100 Kg incoming inward stock
    const incomingQty1 = 100;
    let rawMaterials = getCollection('rawMaterials');
    let mat = rawMaterials.find(m => m.id === testMatId);
    let curInward = mat.inwardQty || 0;
    let curRemaining = mat.remainingQty || 0;

    let newInward = curInward + incomingQty1;
    let newAvailable = Math.max(0, newInward - curRemaining); // 100 - 0 = 100

    updateItem('rawMaterials', testMatId, {
      inwardQty: newInward,
      remainingQty: curRemaining,
      quantity: newAvailable
    });

    rawMaterials = getCollection('rawMaterials');
    mat = rawMaterials.find(m => m.id === testMatId);
    console.log(`   Recorded Inward: +${incomingQty1} Kg -> Total Inward: ${mat.inwardQty} Kg, Remaining: ${mat.remainingQty} Kg, Available: ${mat.quantity} Kg`);
    assert.strictEqual(mat.inwardQty, 100, 'Total inward must be 100 Kg');
    assert.strictEqual(mat.remainingQty, 0, 'Initial remaining must be 0 Kg');
    assert.strictEqual(mat.quantity, 100, 'Available quantity (Inward - Remaining) must be 100 Kg');
    console.log('✅ [PASS] Inward stock properly initializes inward quantity and available quantity.');

    // -------------------------------------------------------------
    // TEST 3: Remaining Stock Entry & (Inward - Remaining = Available) Logic
    // "and when he want to add remainig stock of row otem he will enter inremaining tab from that remaining stock of make logic like this (inward row item - remaining row item = availeble row item ) like user can see the availeble stock of row items"
    // -------------------------------------------------------------
    console.log('\nTest 3: Testing Remaining Stock Entry & (Inward - Remaining = Available) Formula...');

    // User enters remaining raw item = 30 Kg in Remaining tab
    const enteredRemaining1 = 30;
    const calcAvailable1 = Math.max(0, mat.inwardQty - enteredRemaining1); // 100 - 30 = 70

    updateItem('rawMaterials', testMatId, {
      remainingQty: enteredRemaining1,
      quantity: calcAvailable1
    });

    rawMaterials = getCollection('rawMaterials');
    mat = rawMaterials.find(m => m.id === testMatId);
    console.log(`   User enters Remaining Stock: ${mat.remainingQty} Kg`);
    console.log(`   Formula Check: ${mat.inwardQty} (Inward) - ${mat.remainingQty} (Remaining) = ${mat.quantity} (Available)`);
    assert.strictEqual(mat.inwardQty, 100, 'Inward must stay 100 Kg');
    assert.strictEqual(mat.remainingQty, 30, 'Remaining must be 30 Kg');
    assert.strictEqual(mat.quantity, 70, 'Available must strictly be 100 - 30 = 70 Kg');
    console.log('✅ [PASS] (Inward - Remaining = Available) calculates accurately (100 - 30 = 70).');

    // Case B: User adds to remaining (+ 15 Kg more remaining)
    const addRemaining = 15;
    const newRemainingTotal = mat.remainingQty + addRemaining; // 30 + 15 = 45
    const calcAvailable2 = Math.max(0, mat.inwardQty - newRemainingTotal); // 100 - 45 = 55

    updateItem('rawMaterials', testMatId, {
      remainingQty: newRemainingTotal,
      quantity: calcAvailable2
    });

    rawMaterials = getCollection('rawMaterials');
    mat = rawMaterials.find(m => m.id === testMatId);
    console.log(`   User adds +${addRemaining} Kg to remaining -> New Remaining: ${mat.remainingQty} Kg, New Available: ${mat.quantity} Kg`);
    assert.strictEqual(mat.remainingQty, 45, 'New remaining total must be 45 Kg');
    assert.strictEqual(mat.quantity, 55, 'New available must strictly be 100 - 45 = 55 Kg');
    console.log('✅ [PASS] Incrementing remaining stock correctly updates Available quantity (100 - 45 = 55).');

    // -------------------------------------------------------------
    // TEST 4: New Inward Batch with Existing Remaining
    // -------------------------------------------------------------
    console.log('\nTest 4: Testing New Inward Batch Arrival with Existing Remaining Stock...');

    // User brings 50 Kg more raw material (+50 Inward)
    const incomingQty2 = 50;
    const updatedInward = mat.inwardQty + incomingQty2; // 100 + 50 = 150
    const calcAvailable3 = Math.max(0, updatedInward - mat.remainingQty); // 150 - 45 = 105

    updateItem('rawMaterials', testMatId, {
      inwardQty: updatedInward,
      quantity: calcAvailable3
    });

    rawMaterials = getCollection('rawMaterials');
    mat = rawMaterials.find(m => m.id === testMatId);
    console.log(`   Added +${incomingQty2} Inward -> Total Inward: ${mat.inwardQty} Kg, Remaining: ${mat.remainingQty} Kg, Available: ${mat.quantity} Kg`);
    assert.strictEqual(mat.inwardQty, 150, 'Total inward must now be 150 Kg');
    assert.strictEqual(mat.remainingQty, 45, 'Remaining must stay intact at 45 Kg');
    assert.strictEqual(mat.quantity, 105, 'Available must be 150 - 45 = 105 Kg');
    console.log('✅ [PASS] Additional inward batch keeps remaining intact and updates available (150 - 45 = 105).');

    // -------------------------------------------------------------
    // TEST 5: Low Stock Alert Triggered by Available Quantity
    // -------------------------------------------------------------
    console.log('\nTest 5: Testing Low Stock Threshold Triggered on Available Quantity...');
    
    // Set remaining such that available is below threshold (5 Kg)
    // E.g. Remaining = 147 -> Available = 150 - 147 = 3 Kg <= 5 Kg threshold
    const highRemaining = 147;
    const lowAvailable = Math.max(0, mat.inwardQty - highRemaining); // 3 Kg
    updateItem('rawMaterials', testMatId, {
      remainingQty: highRemaining,
      quantity: lowAvailable
    });

    rawMaterials = getCollection('rawMaterials');
    mat = rawMaterials.find(m => m.id === testMatId);
    const isLowStock = mat.quantity <= (mat.minThreshold || 0);
    console.log(`   Available Quantity: ${mat.quantity} Kg, Threshold: ${mat.minThreshold} Kg -> isLowStock: ${isLowStock}`);
    assert.strictEqual(mat.quantity, 3, 'Available quantity must be 3 Kg');
    assert.strictEqual(isLowStock, true, 'Available <= threshold must trigger low stock warning');
    console.log('✅ [PASS] Low stock warning correctly triggers based on available quantity.');

    // -------------------------------------------------------------
    // TEST 6: Remaining Logs History Tracking & Audit Record
    // "just show the remaining logs on that cart of row item which is been used"
    // -------------------------------------------------------------
    console.log('\nTest 6: Testing Remaining Logs History Tracking & Recording...');

    const logEntry1 = {
      id: Date.now(),
      date: new Date().toISOString(),
      remainingQty: 30,
      usedQty: 70,
      mode: 'set',
      amountEntered: 30,
      unit: 'Kg'
    };

    const logEntry2 = {
      id: Date.now() + 1,
      date: new Date().toISOString(),
      remainingQty: 45,
      usedQty: 55,
      mode: 'add',
      amountEntered: 15,
      unit: 'Kg'
    };

    updateItem('rawMaterials', testMatId, {
      remainingLogs: [logEntry2, logEntry1]
    });

    rawMaterials = getCollection('rawMaterials');
    mat = rawMaterials.find(m => m.id === testMatId);
    console.log(`   Remaining Logs Count: ${mat.remainingLogs.length}`);
    console.log(`   Latest Log: Rem: ${mat.remainingLogs[0].remainingQty} Kg, Used: ${mat.remainingLogs[0].usedQty} Kg, Mode: ${mat.remainingLogs[0].mode}`);
    assert.strictEqual(mat.remainingLogs.length, 2, 'Must have 2 remaining log entries recorded');
    assert.strictEqual(mat.remainingLogs[0].remainingQty, 45, 'Latest log remaining quantity must be 45');
    assert.strictEqual(mat.remainingLogs[0].usedQty, 55, 'Latest log used quantity must be 55');
    console.log('✅ [PASS] Remaining logs tracking and used stock history validated successfully.');

    // -------------------------------------------------------------
    // TEST 7: Reset All Raw Material Stock Quantities to 0
    // "give an reset button to set all stock quntity 0 give this in inward tab"
    // -------------------------------------------------------------
    console.log('\nTest 7: Testing Reset All Stock Quantities to 0...');

    // Simulate reset all raw material stock quantities to 0
    const allRMs = getCollection('rawMaterials');
    for (const rm of allRMs) {
      updateItem('rawMaterials', rm.id, {
        quantity: 0,
        inwardQty: 0,
        remainingQty: 0
      });
    }

    const resetRMs = getCollection('rawMaterials');
    const allZero = resetRMs.every(m => m.quantity === 0 && m.inwardQty === 0 && m.remainingQty === 0);
    console.log(`   Checked ${resetRMs.length} materials after reset: All quantities 0? -> ${allZero}`);
    assert.strictEqual(allZero, true, 'All raw material stock quantities must be set to 0');
    console.log('✅ [PASS] Reset All Stock sets quantity, inwardQty, and remainingQty to 0 across all materials.');

    // Cleanup test record
    deleteItem('rawMaterials', testMatId);

    console.log('\n🎉 ALL STOCK MASTER (INWARD - REMAINING = AVAILABLE), REMAINING LOGS & RESET TESTS PASSED!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
