import assert from 'assert';
import {
  settleBillTransaction,
  getCollection,
  insertItem,
  updateItem,
  deleteItem
} from '../server/db.js';

console.log('🧪 Starting Recipe-Based Automatic Stock Decrement Test Suite...');

// 1. Setup Raw Materials: Sugar (id: 2) & Mawa (id: 6)
let rawMaterials = getCollection('rawMaterials');
let sugar = rawMaterials.find(m => m && (m.id === 2 || m.name.toLowerCase().includes('sugar')));
if (!sugar) {
  sugar = insertItem('rawMaterials', { id: 2, name: 'Sugar', quantity: 50, inwardQty: 50, unit: 'Kg' });
} else {
  updateItem('rawMaterials', sugar.id, { ...sugar, quantity: 50, inwardQty: 50 });
}

let mawa = rawMaterials.find(m => m && (m.id === 6 || m.name.toLowerCase().includes('mawa')));
if (!mawa) {
  mawa = insertItem('rawMaterials', { id: 6, name: 'Mawa / Khoya', quantity: 30, inwardQty: 30, unit: 'Kg' });
} else {
  updateItem('rawMaterials', mawa.id, { ...mawa, quantity: 30, inwardQty: 30 });
}

// 2. Setup Dish: Gulab Jamun (id: 33)
let dishes = getCollection('dishes');
let gulabJamun = dishes.find(d => d && (d.id === 33 || d.name.toLowerCase().includes('gulab jamun')));
if (!gulabJamun) {
  gulabJamun = insertItem('dishes', {
    id: 33,
    srNo: 201,
    name: 'Gulab Jamun',
    marathiName: 'गुलाबजामुन',
    categoryId: 2,
    price: 360,
    pricePerKg: 360,
    hasMultiplePrices: true,
    variants: [
      { unit: '250g', weightKg: 0.25, price: 90 },
      { unit: '500g', weightKg: 0.5, price: 180 },
      { unit: '1 Kg', weightKg: 1, price: 360 }
    ]
  });
}

// 3. Clear existing recipes for dish 33 and add recipe:
// Base: 1 Kg Gulab Jamun -> 1 Kg Sugar AND 0.5 Kg Mawa
let recipes = getCollection('recipes');
const oldRecipes = recipes.filter(r => r && String(r.dishId) === String(gulabJamun.id));
for (const r of oldRecipes) {
  deleteItem('recipes', r.id);
}

const recipeSugar = insertItem('recipes', {
  dishId: gulabJamun.id,
  dishName: gulabJamun.name,
  baseQty: 1,
  unit: 'Kg',
  rawMaterialId: sugar.id,
  rawMaterialName: sugar.name,
  qtyRequired: 1
});

const recipeMawa = insertItem('recipes', {
  dishId: gulabJamun.id,
  dishName: gulabJamun.name,
  baseQty: 1,
  unit: 'Kg',
  rawMaterialId: mawa.id,
  rawMaterialName: mawa.name,
  qtyRequired: 0.5
});

console.log('✅ Configured Recipe: 1 Kg Gulab Jamun requires 1 Kg Sugar & 0.5 Kg Mawa');

// TEST 1: Sell 1 Kg Gulab Jamun -> Sugar reduces by 1 Kg (50 -> 49), Mawa reduces by 0.5 Kg (30 -> 29.5)
const bill1 = {
  id: 999001,
  invoiceNo: 'TEST-INV-001',
  items: [
    {
      id: gulabJamun.id,
      name: gulabJamun.name,
      qty: 1,
      unit: '1 Kg',
      weightKg: 1,
      price: 360
    }
  ],
  total: 360,
  finalTotal: 360,
  paymentMode: 'Cash'
};

const res1 = settleBillTransaction(bill1);
const sugarAfter1 = res1.rawMaterials.find(m => String(m.id) === String(sugar.id));
const mawaAfter1 = res1.rawMaterials.find(m => String(m.id) === String(mawa.id));

console.log(`Test 1 (1 Kg Sold): Sugar Available: ${sugarAfter1.quantity} Kg (Expected: 49)`);
console.log(`Test 1 (1 Kg Sold): Mawa Available: ${mawaAfter1.quantity} Kg (Expected: 29.5)`);
assert.strictEqual(sugarAfter1.quantity, 49, 'Sugar should reduce by exactly 1 Kg when 1 Kg Gulab Jamun is sold');
assert.strictEqual(mawaAfter1.quantity, 29.5, 'Mawa should reduce by exactly 0.5 Kg when 1 Kg Gulab Jamun is sold');

// Check remainingLogs
assert.ok(sugarAfter1.remainingLogs && sugarAfter1.remainingLogs.length > 0, 'Should have logged sale deduction');
const log1 = sugarAfter1.remainingLogs[0];
assert.strictEqual(log1.mode, 'sale_deduct');
assert.strictEqual(log1.amountEntered, 1);
assert.strictEqual(log1.dishName, gulabJamun.name);
console.log('✅ Test 1 Passed: 1 Kg Gulab Jamun correctly reduced 1 Kg Sugar & 0.5 Kg Mawa with audit log');

// TEST 2: Sell 500g (0.5 Kg) Gulab Jamun -> Sugar reduces by 0.5 Kg (49 -> 48.5), Mawa reduces by 0.25 Kg (29.5 -> 29.25)
const bill2 = {
  id: 999002,
  invoiceNo: 'TEST-INV-002',
  items: [
    {
      id: gulabJamun.id,
      name: gulabJamun.name,
      qty: 1,
      unit: '500g',
      weightKg: 0.5,
      price: 180
    }
  ],
  total: 180,
  finalTotal: 180,
  paymentMode: 'Cash'
};

const res2 = settleBillTransaction(bill2);
const sugarAfter2 = res2.rawMaterials.find(m => String(m.id) === String(sugar.id));
const mawaAfter2 = res2.rawMaterials.find(m => String(m.id) === String(mawa.id));

console.log(`Test 2 (500g Sold): Sugar Available: ${sugarAfter2.quantity} Kg (Expected: 48.5)`);
console.log(`Test 2 (500g Sold): Mawa Available: ${mawaAfter2.quantity} Kg (Expected: 29.25)`);
assert.strictEqual(sugarAfter2.quantity, 48.5, 'Sugar should reduce by 0.5 Kg for 500g sweet');
assert.strictEqual(mawaAfter2.quantity, 29.25, 'Mawa should reduce by 0.25 Kg for 500g sweet');
console.log('✅ Test 2 Passed: 500g Gulab Jamun correctly reduced 0.5 Kg Sugar & 0.25 Kg Mawa');

// TEST 3: Sell 250g (0.25 Kg) Gulab Jamun -> Sugar reduces by 0.25 Kg (48.5 -> 48.25), Mawa reduces by 0.125 Kg (29.25 -> 29.125)
const bill3 = {
  id: 999003,
  invoiceNo: 'TEST-INV-003',
  items: [
    {
      id: gulabJamun.id,
      name: gulabJamun.name,
      qty: 1,
      unit: '250g',
      weightKg: 0.25,
      price: 90
    }
  ],
  total: 90,
  finalTotal: 90,
  paymentMode: 'Cash'
};

const res3 = settleBillTransaction(bill3);
const sugarAfter3 = res3.rawMaterials.find(m => String(m.id) === String(sugar.id));
const mawaAfter3 = res3.rawMaterials.find(m => String(m.id) === String(mawa.id));

console.log(`Test 3 (250g Sold): Sugar Available: ${sugarAfter3.quantity} Kg (Expected: 48.25)`);
console.log(`Test 3 (250g Sold): Mawa Available: ${mawaAfter3.quantity} Kg (Expected: 29.125)`);
assert.strictEqual(sugarAfter3.quantity, 48.25, 'Sugar should reduce by 0.25 Kg for 250g sweet');
assert.strictEqual(mawaAfter3.quantity, 29.125, 'Mawa should reduce by 0.125 Kg for 250g sweet');
console.log('✅ Test 3 Passed: 250g Gulab Jamun correctly reduced 0.25 Kg Sugar & 0.125 Kg Mawa');

// Clean up test bills
deleteItem('bills', 999001);
deleteItem('bills', 999002);
deleteItem('bills', 999003);

console.log('🎉 ALL RECIPE-BASED AUTOMATIC STOCK DECREMENT TESTS PASSED WITH 100% SUCCESS!');
