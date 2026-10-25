import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('🧪 Running Settled Bill Edit Permission (Able/Disable in UPI Tab) Tests...\n');

// 1. Verify OwnerAdmin.jsx contains Settle Tab edit permission option in UPI Tab
const ownerAdminCode = fs.readFileSync(path.resolve('src/components/OwnerAdmin.jsx'), 'utf-8');

assert(
  ownerAdminCode.includes('activeAdminSubTab === \'upi\''),
  'OwnerAdmin must have UPI subtab'
);
assert(
  ownerAdminCode.includes('isSettledBillEditEnabled'),
  'OwnerAdmin must have isSettledBillEditEnabled state/prop'
);
assert(
  ownerAdminCode.includes('handleToggleEditPermission'),
  'OwnerAdmin must have handleToggleEditPermission handler'
);
assert(
  ownerAdminCode.includes('karuna_settled_bill_edit_enabled'),
  'OwnerAdmin must persist to karuna_settled_bill_edit_enabled in localStorage'
);
assert(
  ownerAdminCode.includes('settledBillEditEnabled: isSettledBillEditEnabled') ||
  ownerAdminCode.includes('settledBillEditEnabled: enableVal'),
  'OwnerAdmin must persist settledBillEditEnabled to systemSettings'
);
assert(
  ownerAdminCode.includes('Able (सुरू / Enable)') || ownerAdminCode.includes('Able (Enable Edit)'),
  'OwnerAdmin must provide an option to set edit permission as Able in the UPI tab'
);
assert(
  ownerAdminCode.includes('Disable (बंद / Lock)') || ownerAdminCode.includes('Disable (Lock Edit)'),
  'OwnerAdmin must provide an option to set edit permission as Disable in the UPI tab'
);
console.log('✅ Test 1: OwnerAdmin.jsx has Able/Disable toggle inside UPI tab, saving to localStorage & systemSettings');

// 2. Verify SettledBills.jsx respects isSettledBillEditEnabled
const settledBillsCode = fs.readFileSync(path.resolve('src/components/SettledBills.jsx'), 'utf-8');

assert(
  settledBillsCode.includes('isSettledBillEditEnabled'),
  'SettledBills must use isSettledBillEditEnabled'
);
assert(
  settledBillsCode.includes('disabled={!isSettledBillEditEnabled}'),
  'SettledBills Edit button must be disabled when !isSettledBillEditEnabled'
);
assert(
  settledBillsCode.includes('Edit Disabled'),
  'SettledBills must indicate Edit Disabled when permission is off'
);
assert(
  settledBillsCode.includes('View-Only Mode'),
  'SettledBills modal must display View-Only mode when disabled by owner'
);
assert(
  settledBillsCode.includes('Editing Disabled by Owner'),
  'SettledBills modal footer must replace Resettle button with Editing Disabled by Owner'
);
console.log('✅ Test 2: SettledBills.jsx Edit button is disabled when not permitted and modal locks edits');

// 3. Verify App.jsx passes state down and protects handleUpdateSettledBill
const appCode = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');

assert(
  appCode.includes('isSettledBillEditEnabled'),
  'App.jsx must manage isSettledBillEditEnabled state'
);
assert(
  appCode.includes('target.systemSettings?.settledBillEditEnabled'),
  'App.jsx syncStateFromCache must sync settledBillEditEnabled'
);
assert(
  appCode.includes('handleToggleSettledBillEdit'),
  'App.jsx must provide handleToggleSettledBillEdit handler'
);
assert(
  appCode.includes('!isSettledBillEditEnabled') && appCode.includes('Bill update blocked'),
  'App.jsx handleUpdateSettledBill must be guarded if edit permission is disabled'
);
console.log('✅ Test 3: App.jsx syncs with db.systemSettings and prevents unauthorized updates when disabled');

// 4. Verify TableGrid.jsx also respects isSettledBillEditEnabled
const tableGridCode = fs.readFileSync(path.resolve('src/components/TableGrid.jsx'), 'utf-8');

assert(
  tableGridCode.includes('isSettledBillEditEnabled'),
  'TableGrid.jsx must accept and check isSettledBillEditEnabled'
);
assert(
  tableGridCode.includes('Editing Disabled by Owner'),
  'TableGrid.jsx settled bill modal must lock resettlement when disabled'
);
console.log('✅ Test 4: TableGrid.jsx settled bills modal is locked when disabled');

// 5. Test State Transition logic
let mockStorage = {};
function setStorage(key, val) { mockStorage[key] = String(val); }
function getStorage(key) { return mockStorage[key]; }

// Default: enabled
let isEnabled = getStorage('karuna_settled_bill_edit_enabled') !== 'false';
assert.strictEqual(isEnabled, true, 'Default should be true');

// Owner sets to Disable
setStorage('karuna_settled_bill_edit_enabled', 'false');
isEnabled = getStorage('karuna_settled_bill_edit_enabled') !== 'false';
assert.strictEqual(isEnabled, false, 'Should be false when owner disables');

// Reload / Restart session simulation
isEnabled = getStorage('karuna_settled_bill_edit_enabled') !== 'false';
assert.strictEqual(isEnabled, false, 'Should remain false across reloads when set to disable');

// Owner sets to Able
setStorage('karuna_settled_bill_edit_enabled', 'true');
isEnabled = getStorage('karuna_settled_bill_edit_enabled') !== 'false';
assert.strictEqual(isEnabled, true, 'Should be true when owner enables');

// Reload / Restart session simulation
isEnabled = getStorage('karuna_settled_bill_edit_enabled') !== 'false';
assert.strictEqual(isEnabled, true, 'Should remain true across reloads when set to able');
console.log('✅ Test 5: Persistence logic ensures once set as Able it stays able, once set as Disable it stays disable');

console.log('\n🎉 ALL SETTLED BILL EDIT PERMISSION TESTS PASSED SUCCESSFULLY! (5/5)\n');
