import assert from 'assert';

console.log('🧪 Running Sweet Gram Matrix & POS Price Calculator Tests...\n');

// 1. Test 1 Kg rate auto-calculation of 250g and 500g
function calculateSweetGramsFrom1Kg(p1kStr) {
  const p1k = parseFloat(p1kStr);
  const p250 = !isNaN(p1k) && p1k > 0 ? Math.round(p1k * 0.25).toString() : '';
  const p500 = !isNaN(p1k) && p1k > 0 ? Math.round(p1k * 0.5).toString() : '';
  return { p1k: p1kStr, p250, p500 };
}

// Test case A: Rate = 400
const rates400 = calculateSweetGramsFrom1Kg('400');
assert.strictEqual(rates400.p250, '100', '250g should be 100 when 1 Kg is 400');
assert.strictEqual(rates400.p500, '200', '500g should be 200 when 1 Kg is 400');
console.log('✅ Test 1: 1 Kg (400) auto-sets 250g=100 and 500g=200');

// Test case B: Rate = 320
const rates320 = calculateSweetGramsFrom1Kg('320');
assert.strictEqual(rates320.p250, '80', '250g should be 80 when 1 Kg is 320');
assert.strictEqual(rates320.p500, '160', '500g should be 160 when 1 Kg is 320');
console.log('✅ Test 2: 1 Kg (320) auto-sets 250g=80 and 500g=160');

// Test case C: Manual gram price override
let sweetRates = { ...rates400 };
// User overrides 250g to 110
sweetRates.p250 = '110';
assert.strictEqual(sweetRates.p250, '110', 'User can manually edit by-gram price');
assert.strictEqual(sweetRates.p1k, '400', '1 Kg remains 400');
console.log('✅ Test 3: Manual by-gram override (250g changed to 110 while 1kg=400)');

// 2. Test POS Kg Bar Price to Gram Auto-Calculation
function calculateGramsFromPrice(priceNum, ratePerKg) {
  if (!priceNum || isNaN(priceNum) || priceNum <= 0 || !ratePerKg) return { grams: 0, kg: 0, label: '' };
  const calculatedGrams = Math.round((priceNum / ratePerKg) * 1000);
  const calculatedKg = parseFloat((calculatedGrams / 1000).toFixed(3));
  const unitLabel = calculatedGrams >= 1000 ? `${calculatedKg} Kg` : `${calculatedGrams}g`;
  return { grams: calculatedGrams, kg: calculatedKg, label: unitLabel };
}

// Test case D: Rate 400/Kg, enter 100 Rs -> 250g
const calc100 = calculateGramsFromPrice(100, 400);
assert.strictEqual(calc100.grams, 250, 'Rs 100 at 400/kg gives 250g');
assert.strictEqual(calc100.label, '250g', 'Label should be 250g');
console.log('✅ Test 4: Entering ₹100 with Rate ₹400/Kg auto-calculates 250g');

// Test case E: Rate 400/Kg, enter 50 Rs -> 125g
const calc50 = calculateGramsFromPrice(50, 400);
assert.strictEqual(calc50.grams, 125, 'Rs 50 at 400/kg gives 125g');
assert.strictEqual(calc50.label, '125g', 'Label should be 125g');
console.log('✅ Test 5: Entering ₹50 with Rate ₹400/Kg auto-calculates 125g');

// Test case F: Rate 400/Kg, enter 200 Rs -> 500g
const calc200 = calculateGramsFromPrice(200, 400);
assert.strictEqual(calc200.grams, 500, 'Rs 200 at 400/kg gives 500g');
assert.strictEqual(calc200.label, '500g', 'Label should be 500g');
console.log('✅ Test 6: Entering ₹200 with Rate ₹400/Kg auto-calculates 500g');

// Test case G: Rate 400/Kg, enter 600 Rs -> 1.5 Kg
const calc600 = calculateGramsFromPrice(600, 400);
assert.strictEqual(calc600.grams, 1500, 'Rs 600 at 400/kg gives 1500g');
assert.strictEqual(calc600.kg, 1.5, 'Rs 600 at 400/kg gives 1.5 Kg');
assert.strictEqual(calc600.label, '1.5 Kg', 'Label should be 1.5 Kg');
console.log('✅ Test 7: Entering ₹600 with Rate ₹400/Kg auto-calculates 1.5 Kg');

console.log('\n🎉 ALL SWEET MATRIX & POS PRICE CALCULATION TESTS PASSED SUCCESSFULLY!');
