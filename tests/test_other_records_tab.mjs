// Automated Test Suite for "Other" Records Tab Features
import assert from 'assert';

console.log('--- STARTING "OTHER" TAB RECORDS TEST SUITE ---');

// Mock localStorage
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

const STORAGE_KEY = 'karuna_other_records';

// 1. Test Initial Creation & Validation
console.log('\nTesting 1: Creating New Records with Name, Quantity, Unit (kg, liter, gram)...');

function createRecord(name, quantity, unit, notes = '') {
  assert(name && name.trim(), 'Name is required');
  const numQty = parseFloat(quantity);
  assert(!isNaN(numQty) && numQty >= 0, 'Quantity must be >= 0');
  assert(['kg', 'liter', 'gram'].includes(unit), 'Unit must be kg, liter, or gram');

  return {
    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    quantity: Math.round(numQty * 1000) / 1000,
    unit: unit,
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

let records = [];

// Add record 1: Buffalo Milk in liter
const milkRecord = createRecord('दूध (Buffalo Milk)', 25, 'liter', 'Dairy morning');
records.push(milkRecord);
assert.strictEqual(records[0].name, 'दूध (Buffalo Milk)');
assert.strictEqual(records[0].quantity, 25);
assert.strictEqual(records[0].unit, 'liter');
console.log('✓ Milk record created in liters:', records[0].name, records[0].quantity, records[0].unit);

// Add record 2: Sugar in kg
const sugarRecord = createRecord('साखर (Sugar)', 100, 'kg', 'Store room');
records.push(sugarRecord);
assert.strictEqual(records[1].quantity, 100);
assert.strictEqual(records[1].unit, 'kg');
console.log('✓ Sugar record created in kg:', records[1].name, records[1].quantity, records[1].unit);

// Add record 3: Cardamom in gram
const cardamomRecord = createRecord('इलायची (Cardamom)', 750, 'gram', 'Spices shelf');
records.push(cardamomRecord);
assert.strictEqual(records[2].quantity, 750);
assert.strictEqual(records[2].unit, 'gram');
console.log('✓ Cardamom record created in gram:', records[2].name, records[2].quantity, records[2].unit);

// 2. Test Persistence to Storage
console.log('\nTesting 2: Persisting records to localStorage...');
localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
const savedJson = localStorage.getItem(STORAGE_KEY);
assert(savedJson, 'Storage must have saved data');
const loadedRecords = JSON.parse(savedJson);
assert.strictEqual(loadedRecords.length, 3);
console.log('✓ Persisted 3 records and verified retrieval from localStorage');

// 3. Test Interactive Increase and Decrease on Cart
console.log('\nTesting 3: Cart Quantity Increment and Decrement...');

function adjustQuantity(recordsList, recordId, delta) {
  return recordsList.map((r) => {
    if (r.id !== recordId) return r;
    const newQty = Math.max(0, Math.round((r.quantity + delta) * 1000) / 1000);
    return {
      ...r,
      quantity: newQty,
      updatedAt: new Date().toISOString()
    };
  });
}

// Increase Milk by +1 liter
records = adjustQuantity(records, milkRecord.id, 1);
assert.strictEqual(records.find((r) => r.id === milkRecord.id).quantity, 26);
console.log('✓ Milk increased from 25 -> 26 liter (+1)');

// Increase Milk by +5 liter
records = adjustQuantity(records, milkRecord.id, 5);
assert.strictEqual(records.find((r) => r.id === milkRecord.id).quantity, 31);
console.log('✓ Milk increased from 26 -> 31 liter (+5)');

// Decrease Sugar by -10 kg (step -5 x 2)
records = adjustQuantity(records, sugarRecord.id, -5);
records = adjustQuantity(records, sugarRecord.id, -5);
assert.strictEqual(records.find((r) => r.id === sugarRecord.id).quantity, 90);
console.log('✓ Sugar decreased from 100 -> 90 kg (-10)');

// Increase Gram item (Cardamom) by +250g
records = adjustQuantity(records, cardamomRecord.id, 250);
assert.strictEqual(records.find((r) => r.id === cardamomRecord.id).quantity, 1000);
console.log('✓ Cardamom increased from 750g -> 1000g (+250g)');

// Decrease Gram item (Cardamom) by -50g
records = adjustQuantity(records, cardamomRecord.id, -50);
assert.strictEqual(records.find((r) => r.id === cardamomRecord.id).quantity, 950);
console.log('✓ Cardamom decreased from 1000g -> 950g (-50g)');

// 4. Test Zero Clamp (Cannot go negative)
console.log('\nTesting 4: Zero Clamping (prevent negative quantity)...');
records = adjustQuantity(records, milkRecord.id, -100);
assert.strictEqual(records.find((r) => r.id === milkRecord.id).quantity, 0);
console.log('✓ Subtracting 100 from 31 correctly clamped at 0 (never negative)');

// 5. Test Direct Inline Quantity Set
console.log('\nTesting 5: Direct Inline Quantity Setting...');
function setExactQuantity(recordsList, recordId, exactVal) {
  const num = parseFloat(exactVal);
  assert(!isNaN(num) && num >= 0, 'Valid quantity');
  return recordsList.map((r) =>
    r.id === recordId ? { ...r, quantity: Math.round(num * 1000) / 1000 } : r
  );
}

records = setExactQuantity(records, milkRecord.id, 18.5);
assert.strictEqual(records.find((r) => r.id === milkRecord.id).quantity, 18.5);
console.log('✓ Directly set Milk quantity to 18.5 liter');

// 6. Test Delete Record
console.log('\nTesting 6: Delete Record from Cart...');
records = records.filter((r) => r.id !== sugarRecord.id);
assert.strictEqual(records.length, 2);
assert(!records.some((r) => r.id === sugarRecord.id));
console.log('✓ Sugar record successfully deleted. Remaining records:', records.length);

console.log('\n========================================');
console.log('🎉 ALL "OTHER" TAB RECORD TESTS PASSED 100%!');
console.log('========================================');
