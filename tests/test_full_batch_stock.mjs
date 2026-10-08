import assert from 'assert';
import { settleBillTransaction } from '../server/db.js';

// Setup test in server/db.js environment
console.log('--- Testing Full-Batch Stock Maintenance Logic ---');

// Mock a test dish
const testDish = {
  id: 9991,
  srNo: 991,
  name: 'Special Gulab Jamun',
  marathiName: 'गुलाब जाम',
  stockQty: 10,
  stockUnit: 'kg',
  recipeBaseQty: 1, // When 1 kg is sold
  accumulatedSold: 0,
  status: 'In Stock'
};

// Mock raw material
const testSugar = {
  id: 8881,
  name: 'Sugar (GM)',
  quantity: 20, // 20 kg
  unit: 'Kg'
};

// Mock recipe: 1 kg Gulab Jamun consumes 0.5 kg Sugar
const testRecipe = {
  id: 7771,
  dishId: 9991,
  rawMaterialId: 8881,
  qtyRequired: 0.5,
  baseQty: 1,
  unit: 'Kg',
  currentStock: 20
};

// Set server/db state
import { getAllData } from '../server/db.js';
const state = getAllData();
state.dishes.push(testDish);
state.rawMaterials.push(testSugar);
state.recipes.push(testRecipe);

// Test 1: Sell 0.5 kg (Less than baseQty of 1 kg)
console.log('\nTest 1: Sell 0.5 kg Gulab Jamun (Less than 1 kg)');
const bill1 = settleBillTransaction({
  items: [
    {
      id: 9991,
      name: 'Special Gulab Jamun',
      qty: 1,
      weightKg: 0.5
    }
  ]
});

console.log('Dish stockQty:', testDish.stockQty, '(Expected: 9.5)');
assert.strictEqual(testDish.stockQty, 9.5, 'Dish stock should decrease by 0.5');

console.log('Dish accumulatedSold:', testDish.accumulatedSold, '(Expected: 0.5)');
assert.strictEqual(testDish.accumulatedSold, 0.5, 'Accumulated sold should be 0.5');

console.log('Recipe currentStock:', testRecipe.currentStock, '(Expected: 20 - not deducted yet!)');
assert.strictEqual(testRecipe.currentStock, 20, 'Raw material should NOT deduct until 1 kg is sold');

// Test 2: Sell another 0.5 kg (Reaching 1 kg cumulative!)
console.log('\nTest 2: Sell another 0.5 kg Gulab Jamun (Reaching full 1 kg)');
const bill2 = settleBillTransaction({
  items: [
    {
      id: 9991,
      name: 'Special Gulab Jamun',
      qty: 1,
      weightKg: 0.5
    }
  ]
});

console.log('Dish stockQty:', testDish.stockQty, '(Expected: 9.0)');
assert.strictEqual(testDish.stockQty, 9.0, 'Dish stock should decrease to 9.0');

console.log('Dish accumulatedSold:', testDish.accumulatedSold, '(Expected: 0)');
assert.strictEqual(testDish.accumulatedSold, 0, 'Accumulated sold should reset to 0');

console.log('Recipe currentStock:', testRecipe.currentStock, '(Expected: 19.5 - exactly 0.5 kg Sugar deducted!)');
assert.strictEqual(testRecipe.currentStock, 19.5, 'Raw material should deduct 0.5 kg');

// Test 3: Sell 2.5 kg at once (2 full batches + 0.5 kg remainder)
console.log('\nTest 3: Sell 2.5 kg Gulab Jamun at once (2 full batches + 0.5 kg remainder)');
const bill3 = settleBillTransaction({
  items: [
    {
      id: 9991,
      name: 'Special Gulab Jamun',
      qty: 1,
      weightKg: 2.5
    }
  ]
});

console.log('Dish stockQty:', testDish.stockQty, '(Expected: 6.5)');
assert.strictEqual(testDish.stockQty, 6.5, 'Dish stock should decrease by 2.5 to 6.5');

console.log('Dish accumulatedSold:', testDish.accumulatedSold, '(Expected: 0.5)');
assert.strictEqual(testDish.accumulatedSold, 0.5, 'Accumulated sold should be 0.5 remainder');

console.log('Recipe currentStock:', testRecipe.currentStock, '(Expected: 18.5 - 2 batches = 1.0 kg Sugar deducted!)');
assert.strictEqual(testRecipe.currentStock, 18.5, 'Raw material should deduct 2 * 0.5 = 1.0 kg');

console.log('\n✅ ALL FULL-BATCH STOCK LOGIC TESTS PASSED PERFECTLY!');
process.exit(0);
