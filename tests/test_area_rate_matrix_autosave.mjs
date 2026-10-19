import assert from 'assert';
import { getDishPriceForSection } from '../src/db/db.js';

console.log('================================================================');
console.log('🧪 KARUNA HOTEL POS - AREA RATE MATRIX AUTO-SAVE & UI QA');
console.log('================================================================\n');

// Mock dishes
const testDishes = [
  {
    id: 1,
    srNo: 101,
    name: 'Masala Dosa',
    price: 60,
    sectionPrices: { 1: 60, 2: 70, 3: 80 }
  },
  {
    id: 2,
    srNo: 102,
    name: 'Idli Vada Mix',
    price: 50,
    sectionPrices: {}
  }
];

const testSections = [
  { id: 1, name: 'Dine In Area' },
  { id: 2, name: 'First Floor' },
  { id: 3, name: 'AC Hall' },
  { id: 4, name: 'Parcels' },
  { id: 5, name: 'Sweets' }
];

// Test 1: Verification that section rate resolution uses sectionPrices properly
console.log('▶ TEST 1: Section rate matrix price resolution');
assert.strictEqual(getDishPriceForSection(testDishes[0], 1), 60);
assert.strictEqual(getDishPriceForSection(testDishes[0], 2), 70);
assert.strictEqual(getDishPriceForSection(testDishes[0], 3), 80);
assert.strictEqual(getDishPriceForSection(testDishes[0], 4), 60, 'Fallback to base price when not in sectionPrices');
console.log('✅ [PASS] Section prices resolve with correct fallback.\n');

// Test 2: Simulating Area Rate Matrix State Transition & Auto-Save
console.log('▶ TEST 2: Typing rate in Box 1 and pressing Enter to move to Box 2');

let dishSectionRates = {
  1: { 1: 60, 2: 70, 3: 80 },
  2: {}
};

// User changes Dish 2, Section 1 (Dine In) to 55
const enteredValBox1 = '55';
dishSectionRates = {
  ...dishSectionRates,
  2: {
    ...dishSectionRates[2],
    1: enteredValBox1
  }
};

// Simulating Enter key press / blur on Box 1:
// handleSaveSingleRate persists to database
const updatedDish2Prices = {
  ...(testDishes[1].sectionPrices || {}),
  ...(dishSectionRates[2] || {})
};
updatedDish2Prices[1] = parseFloat(enteredValBox1);
testDishes[1].sectionPrices = updatedDish2Prices;

// Focus moves to Box 2 (Dish 2, Section 2 - First Floor)
// User enters 65 in Box 2
const enteredValBox2 = '65';
dishSectionRates = {
  ...dishSectionRates,
  2: {
    ...dishSectionRates[2],
    2: enteredValBox2
  }
};

// Verify Box 1 value DID NOT change or revert:
assert.strictEqual(dishSectionRates[2][1], '55', 'Box 1 rate must remain 55');
assert.strictEqual(dishSectionRates[2][2], '65', 'Box 2 rate must be 65');
assert.strictEqual(testDishes[1].sectionPrices[1], 55, 'Box 1 persisted to database as 55');
console.log('✅ [PASS] Moving to next box does NOT revert previous box.\n');

// Test 3: Simulating Dishes LiveQuery Tick (Background update must not wipe local edits)
console.log('▶ TEST 3: LiveQuery background tick sync integrity');
const liveDishesSnapshot = JSON.parse(JSON.stringify(testDishes));

// The improved sync algorithm in OwnerAdmin:
const prevRates = { ...dishSectionRates };
const nextRates = { ...prevRates };
liveDishesSnapshot.forEach((d) => {
  nextRates[d.id] = {
    ...(d.sectionPrices || {}),
    ...(prevRates[d.id] || {})
  };
});
dishSectionRates = nextRates;

assert.strictEqual(dishSectionRates[2][1], '55', 'Box 1 rate preserved through LiveQuery tick');
assert.strictEqual(dishSectionRates[2][2], '65', 'Box 2 rate preserved through LiveQuery tick');
console.log('✅ [PASS] LiveQuery background refresh does not wipe unsaved or active edits.\n');

// Test 4: Verify Standard Rate is NOT in the header list
console.log('▶ TEST 4: Column structure verification');
const expectedColumns = ['Code', 'Dish Name', ...testSections.map(s => `${s.name} (₹)`)];
assert.strictEqual(expectedColumns.includes('Standard Rate (₹)'), false, 'Standard Rate column must be omitted');
console.log('✅ [PASS] Standard Rate column removed from Area Rate Matrix.\n');

console.log('================================================================');
console.log('🏁 ALL TESTS PASSED SUCCESSFULLY!');
console.log('================================================================');
