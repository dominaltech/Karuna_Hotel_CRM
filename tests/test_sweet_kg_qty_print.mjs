import assert from 'assert';
import { formatItemQtyDisplay, printThermalReceipt } from '../src/utils/receiptUtils.js';

console.log('Testing Sweet / Kg Qty Display & Receipt Formatting...\n');

// Test 1: 50g sweet priced at 25 added 2 times
const item2x50g = {
  id: 101,
  name: 'Gulab Jamun',
  unit: '50g',
  weightKg: 0.05,
  price: 25,
  qty: 2
};
const display2x50g = formatItemQtyDisplay(item2x50g);
console.log('Test 1 - 2x 50g display:', display2x50g);
assert.strictEqual(display2x50g, '2x50g', '50g added twice must display as 2x50g');

// Test 2: 50g sweet added 3 times
const item3x50g = {
  id: 101,
  name: 'Gulab Jamun',
  unit: '50g',
  weightKg: 0.05,
  price: 25,
  qty: 3
};
const display3x50g = formatItemQtyDisplay(item3x50g);
console.log('Test 2 - 3x 50g display:', display3x50g);
assert.strictEqual(display3x50g, '3x50g', '50g added thrice must display as 3x50g');

// Test 3: 50g sweet added 1 time
const item1x50g = {
  id: 101,
  name: 'Gulab Jamun',
  unit: '50g',
  weightKg: 0.05,
  price: 25,
  qty: 1
};
const display1x50g = formatItemQtyDisplay(item1x50g);
console.log('Test 3 - 1x 50g display:', display1x50g);
assert.strictEqual(display1x50g, '50g', '50g added once must display as 50g');

// Test 4: 250g sweet added 2 times
const item2x250g = {
  id: 102,
  name: 'Kaju Katli',
  unit: '250g',
  weightKg: 0.25,
  price: 225,
  qty: 2
};
const display2x250g = formatItemQtyDisplay(item2x250g);
console.log('Test 4 - 2x 250g display:', display2x250g);
assert.strictEqual(display2x250g, '2x250g', '250g added twice must display as 2x250g');

// Test 5: 1 Kg sweet added 2 times
const item2x1Kg = {
  id: 102,
  name: 'Kaju Katli',
  unit: '1 Kg',
  weightKg: 1,
  price: 900,
  qty: 2
};
const display2x1Kg = formatItemQtyDisplay(item2x1Kg);
console.log('Test 5 - 2x 1 Kg display:', display2x1Kg);
assert.strictEqual(display2x1Kg, '2x1 Kg', '1 Kg added twice must display as 2x1 Kg');

// Test 6: Sanitization - If unit accidentally had price like "₹25 50g" or "25 50g"
const itemDirtyUnit = {
  id: 101,
  name: 'Gulab Jamun',
  unit: '₹25 50g',
  weightKg: 0.05,
  price: 25,
  qty: 2
};
const displayDirty = formatItemQtyDisplay(itemDirtyUnit);
console.log('Test 6 - Dirty unit sanitization:', displayDirty);
assert.strictEqual(displayDirty, '2x50g', 'Leading price in unit must be stripped');

// Test 7: Standard non-kg item (e.g. Masala Dosa qty = 2)
const itemStandard = {
  id: 20,
  name: 'Masala Dosa',
  price: 70,
  qty: 2
};
const displayStandard = formatItemQtyDisplay(itemStandard);
console.log('Test 7 - Standard item display:', displayStandard);
assert.strictEqual(displayStandard, '2', 'Standard item must display numeric qty');

console.log('\nAll formatItemQtyDisplay unit tests passed successfully!\n');
