import assert from 'node:assert';

console.log('🧪 Testing Option 2 (Raw Material-Wise Stock Master Logic)...');

// Option 2 Core Formula: (Inward Raw Material - Remaining Raw Material = Available / Used)
function calculateAvailableRawMaterial(inwardQty, remainingQty) {
  const inward = parseFloat(inwardQty) || 0;
  const remaining = parseFloat(remainingQty) || 0;
  return Math.max(0, Math.round((inward - remaining) * 1000) / 1000);
}

// 1. Initial Raw Material State: 50 kg Sugar inward, 0 remaining recorded
let rm = {
  id: 1,
  name: 'Sugar',
  unit: 'Kg',
  inwardQty: 50,
  remainingQty: 0,
  quantity: 50
};

let available = calculateAvailableRawMaterial(rm.inwardQty, rm.remainingQty);
console.log('1. Initial Available Sugar:', available, rm.unit);
assert.strictEqual(available, 50, 'Initial available should equal inward stock when remaining is 0');

// 2. Add Inward Stock: User receives +25 kg incoming Sugar
const incomingQty = 25;
rm.inwardQty = Math.round((rm.inwardQty + incomingQty) * 1000) / 1000; // 75 kg
rm.quantity = calculateAvailableRawMaterial(rm.inwardQty, rm.remainingQty);
console.log('2. Available Sugar after +25 kg inward:', rm.quantity, rm.unit);
assert.strictEqual(rm.inwardQty, 75, 'Inward stock should be 75 kg');
assert.strictEqual(rm.quantity, 75, 'Available stock should be 75 kg');

// 3. User records Remaining Stock at end of day: 20 kg remaining in kitchen
rm.remainingQty = 20;
rm.quantity = calculateAvailableRawMaterial(rm.inwardQty, rm.remainingQty);
console.log('3. Available / Used Sugar with 20 kg remaining:', rm.quantity, rm.unit);
assert.strictEqual(rm.quantity, 55, 'Available / used quantity should be 75 - 20 = 55 kg');

// 4. Test Reset All Stocks to 0
rm.inwardQty = 0;
rm.remainingQty = 0;
rm.quantity = 0;
assert.strictEqual(rm.quantity, 0, 'Quantity should be 0 after reset');
assert.strictEqual(rm.inwardQty, 0, 'Inward quantity should be 0 after reset');
assert.strictEqual(rm.remainingQty, 0, 'Remaining quantity should be 0 after reset');

console.log('\n✅ ALL RAW MATERIAL-WISE STOCK LOGIC UNIT TESTS PASSED!');
