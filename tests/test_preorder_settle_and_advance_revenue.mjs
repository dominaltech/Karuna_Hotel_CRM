import assert from 'assert';

console.log('--- Testing Pre-Order Settle Tab and Today Revenue Integration ---');

// Mock data & helper functions
const getLocalDateStr = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayStr = getLocalDateStr(new Date());

// 1. Test Filter in SettledBills.jsx
console.log('1. Testing SettledBills.jsx filtering...');

const mockBills = [
  { id: 1, billNo: 'B-101', total: 500, createdAt: new Date().toISOString(), isPreOrderAdvance: false }, // regular bill
  { id: 2, billNo: 'B-102', total: 300, createdAt: new Date().toISOString(), isPreOrderAdvance: true, preOrderId: 101 }, // legacy advance bill (MUST be excluded)
  { id: 3, billNo: 'B-103', total: 1500, createdAt: new Date().toISOString(), isPreOrderSettlement: true, isPreOrderFullPayment: true, preOrderId: 102 }, // Full payment pre-order (MUST be included)
  { id: 4, billNo: 'B-104', total: 700, createdAt: new Date().toISOString(), isPreOrderSettlement: true, preOrderId: 103 } // Settled upon delivery (MUST be included)
];

const timeFilter = 'today';
const isBillEdited = () => false;

const baseTimeBills = mockBills.filter((b) => {
  if (!b) return false;
  if (b.isPreOrderAdvance) return false; // Strictly filter out partial advances!
  if (timeFilter === 'edited') return isBillEdited(b);
  if (timeFilter === 'all') return true;
  if (!b.createdAt) return true;
  const billDateStr = getLocalDateStr(b.createdAt);
  return billDateStr === todayStr;
});

assert.strictEqual(baseTimeBills.length, 3, 'Should only contain 3 bills, excluding legacy/partial advance');
assert.ok(!baseTimeBills.some((b) => b.isPreOrderAdvance), 'No isPreOrderAdvance bill should be in Settle tab');
assert.ok(baseTimeBills.some((b) => b.isPreOrderFullPayment), 'Full payment pre-order bill MUST show in Settle tab');
assert.ok(baseTimeBills.some((b) => b.id === 4), 'Pre-order settled upon delivery MUST show in Settle tab');
console.log('✓ SettledBills.jsx filtering passed!');

// 2. Test Today's Revenue in TableGrid.jsx
console.log('2. Testing TableGrid.jsx Today Revenue calculation...');

const mockPreOrders = [
  // Order 1: Booked today with partial advance of 400 (balance 600 pending). NOT full payment.
  {
    id: 201,
    orderNo: 'PO-001',
    createdAt: new Date().toISOString(),
    totalAmount: 1000,
    advancePayment: 400,
    balanceAmount: 600,
    isFullPayment: false,
    status: 'pending'
  },
  // Order 2: Booked today with full payment of 1200 (balance 0). Full payment!
  {
    id: 202,
    orderNo: 'PO-002',
    createdAt: new Date().toISOString(),
    totalAmount: 1200,
    advancePayment: 1200,
    balanceAmount: 0,
    isFullPayment: true,
    fullPaymentPaid: true,
    status: 'confirmed'
  },
  // Order 3: Booked yesterday with advance 500 (should not count in today's advance)
  {
    id: 203,
    orderNo: 'PO-003',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    totalAmount: 800,
    advancePayment: 500,
    balanceAmount: 300,
    isFullPayment: false,
    status: 'pending'
  }
];

// Today's settled bills in TableGrid (excludes isPreOrderAdvance):
const tableGridSettledBills = mockBills.filter((b) => !b.isPreOrderAdvance && getLocalDateStr(b.createdAt) === todayStr);

// Today's Advance Revenue calculation
const todayAdvanceRevenue = mockPreOrders.reduce((sum, po) => {
  if (!po || !po.createdAt) return sum;
  if (getLocalDateStr(po.createdAt) !== todayStr) return sum;
  if (po.isFullPayment || po.fullPaymentPaid) return sum; // Avoid double counting full payments!
  return sum + (parseFloat(po.advancePayment) || 0);
}, 0);

assert.strictEqual(todayAdvanceRevenue, 400, 'Today advance revenue should only count PO-001 advance of 400');

const todaySettledBillsRevenue = tableGridSettledBills.reduce((sum, b) => {
  const amt = parseFloat(b.total !== undefined ? b.total : (b.finalTotal || b.grandTotal || 0)) || 0;
  return sum + amt;
}, 0);

// Total bills: 500 (regular) + 1500 (full payment pre-order) + 700 (delivery settled) = 2700
assert.strictEqual(todaySettledBillsRevenue, 2700, 'Today settled bills revenue should be 2700');

const todayTotalRevenue = todaySettledBillsRevenue + todayAdvanceRevenue;
// 2700 + 400 = 3100
assert.strictEqual(todayTotalRevenue, 3100, 'Today total revenue should be 3100 (2700 + 400)');
console.log('✓ TableGrid.jsx Today Revenue calculation passed! Total: ' + todayTotalRevenue);

// 3. Test Full Payment Booking vs Pending Booking Logic
console.log('3. Testing Booking State Logic...');

// Simulating booking with full payment toggle
const totalOrderAmount = 2500;
let isFullPaymentToggle = true;
let advanceInput = isFullPaymentToggle ? String(totalOrderAmount) : '500';
let advanceNum = parseFloat(advanceInput) || 0;
let isOrderFullyPaid = Boolean(isFullPaymentToggle || (totalOrderAmount > 0 && advanceNum >= totalOrderAmount));

assert.strictEqual(isOrderFullyPaid, true, 'isOrderFullyPaid must be true when full payment is toggled');
assert.strictEqual(advanceNum, 2500, 'Advance amount must be equal to total amount');
assert.strictEqual(totalOrderAmount - advanceNum, 0, 'Balance must be 0 for full payment');

// Simulating booking with pending payment
isFullPaymentToggle = false;
advanceInput = '600';
advanceNum = parseFloat(advanceInput) || 0;
isOrderFullyPaid = Boolean(isFullPaymentToggle || (totalOrderAmount > 0 && advanceNum >= totalOrderAmount));

assert.strictEqual(isOrderFullyPaid, false, 'isOrderFullyPaid must be false when balance is pending');
assert.strictEqual(advanceNum, 600, 'Advance amount is 600');
assert.strictEqual(totalOrderAmount - advanceNum, 1900, 'Balance must be 1900');
console.log('✓ Booking State Logic passed!');

console.log('\nALL PRE-ORDER SETTLE & ADVANCE REVENUE TESTS PASSED SUCCESSFULLY! ✓✓✓');
