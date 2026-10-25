import assert from 'assert';
import {
  cleanAndDeduplicateRecipes,
  parseItemWeightInKg,
  settleBillTransaction
} from '../server/db.js';

console.log('--- STARTING DUAL BASE SETTER RECIPE TEST (OPTION B) ---');

// 1. Verify cleanAndDeduplicateRecipes preserves tableBaseQty, tableUnit, and tableQtyRequired
const sampleRecipes = [
  {
    id: 101,
    dishId: 2,
    dishName: 'Gulab Jamun',
    baseQty: 1,
    unit: 'Kg',
    tableBaseQty: 1,
    tableUnit: 'Plate',
    rawMaterialId: 10,
    rawMaterialName: 'Sugar',
    qtyRequired: 1.0,
    tableQtyRequired: 0.1
  },
  {
    id: 102,
    dishId: 2,
    dishName: 'Gulab Jamun',
    baseQty: 1,
    unit: 'Kg',
    tableBaseQty: 1,
    tableUnit: 'Plate',
    rawMaterialId: 20,
    rawMaterialName: 'Mawa',
    qtyRequired: 0.5,
    tableQtyRequired: 0.05
  }
];

const cleaned = cleanAndDeduplicateRecipes(sampleRecipes);
assert.strictEqual(cleaned.length, 2, 'Should keep both ingredients');
assert.strictEqual(cleaned[0].tableQtyRequired, 0.1, 'Sugar tableQtyRequired should be 0.1');
assert.strictEqual(cleaned[1].tableQtyRequired, 0.05, 'Mawa tableQtyRequired should be 0.05');
assert.strictEqual(cleaned[0].tableBaseQty, 1, 'tableBaseQty should be 1');
assert.strictEqual(cleaned[0].tableUnit, 'Plate', 'tableUnit should be Plate');
console.log('✓ cleanAndDeduplicateRecipes correctly preserved tableBaseQty and tableQtyRequired');

// 2. Setup mock dbState in server/db.js for testing settleBillTransaction
import * as serverDbModule from '../server/db.js';
// Fetch current dbState through module or settleBillTransaction
const initialSugar = 50.0;
const initialMawa = 25.0;

// Set initial mock data in dbState reliably
const rms = serverDbModule.getCollection('rawMaterials');
let sugar = rms.find((m) => m.id === 10);
if (sugar) {
  sugar.quantity = initialSugar;
  sugar.consumedQty = 0;
} else {
  serverDbModule.bulkAddItems('rawMaterials', [
    { id: 10, name: 'Sugar', unit: 'Kg', quantity: initialSugar, consumedQty: 0 }
  ]);
}

let mawa = rms.find((m) => m.id === 20);
if (mawa) {
  mawa.quantity = initialMawa;
  mawa.consumedQty = 0;
} else {
  serverDbModule.bulkAddItems('rawMaterials', [
    { id: 20, name: 'Mawa', unit: 'Kg', quantity: initialMawa, consumedQty: 0 }
  ]);
}

const dishes = serverDbModule.getCollection('dishes');
if (!dishes.some((d) => d.id === 2)) {
  serverDbModule.bulkAddItems('dishes', [
    { id: 2, name: 'Gulab Jamun', categoryId: 2, hasMultiplePrices: true, unit: 'Kg', stockQty: 100 }
  ]);
}

// Replace recipes for dish 2
const currentRecipes = serverDbModule.getCollection('recipes');
const filteredRecs = currentRecipes.filter((r) => r && r.dishId !== 2);
serverDbModule.clearCollection('recipes');
serverDbModule.bulkAddItems('recipes', [...filteredRecs, ...sampleRecipes]);

// TEST SCENARIO A: Parcel / Sweets Counter Weight Sale (500g Gulab Jamun)
console.log('\nTesting Scenario A: 500g Gulab Jamun sold at Sweets/Parcel Counter...');
const parcelBill = {
  invoiceNo: 'TEST-PARCEL-001',
  orderType: 'parcel',
  total: 200,
  items: [
    {
      id: 2,
      name: 'Gulab Jamun',
      unit: '500g',
      weightKg: 0.5,
      qty: 1,
      price: 200
    }
  ]
};

const resultBillA = settleBillTransaction(parcelBill);
assert.ok(resultBillA, 'Bill A should settle successfully');

// Check raw materials in dbState
const rawMaterialsAfterA = serverDbModule.getCollection('rawMaterials');
const sugarA = rawMaterialsAfterA.find((m) => m.id === 10);
const mawaA = rawMaterialsAfterA.find((m) => m.id === 20);

// 500g / 1 Kg = 0.5x ratio. Sugar: 50 - 0.5 = 49.5 Kg. Mawa: 25 - 0.25 = 24.75 Kg.
console.log(`Sugar remaining: ${sugarA.quantity} (Expected: 49.5)`);
console.log(`Mawa remaining: ${mawaA.quantity} (Expected: 24.75)`);
assert.strictEqual(sugarA.quantity, 49.5, 'Sugar should reduce by exactly 0.5 Kg for 500g sale');
assert.strictEqual(mawaA.quantity, 24.75, 'Mawa should reduce by exactly 0.25 Kg for 500g sale');
console.log('✓ Scenario A PASSED: Weight sale deducted 500g proportion correctly!');

// TEST SCENARIO B: Dining Table Per-Plate Sale (1 Plate Gulab Jamun)
console.log('\nTesting Scenario B: 1 Plate Gulab Jamun ordered at Dining Table...');
const tableBill1 = {
  invoiceNo: 'TEST-TABLE-001',
  orderType: 'dine_in',
  tableId: 1,
  total: 60,
  items: [
    {
      id: 2,
      name: 'Gulab Jamun',
      unit: 'Plate',
      weightKg: null,
      qty: 1,
      price: 60
    }
  ]
};

settleBillTransaction(tableBill1);

const rawMaterialsAfterB = serverDbModule.getCollection('rawMaterials');
const sugarB = rawMaterialsAfterB.find((m) => m.id === 10);
const mawaB = rawMaterialsAfterB.find((m) => m.id === 20);

// 1 Plate uses tableQtyRequired: Sugar = 0.1 Kg, Mawa = 0.05 Kg
// Sugar: 49.5 - 0.1 = 49.4 Kg. Mawa: 24.75 - 0.05 = 24.70 Kg.
console.log(`Sugar remaining: ${sugarB.quantity} (Expected: 49.4)`);
console.log(`Mawa remaining: ${mawaB.quantity} (Expected: 24.7)`);
assert.strictEqual(sugarB.quantity, 49.4, 'Sugar should reduce by exactly 0.1 Kg for 1 Plate dining table sale');
assert.strictEqual(mawaB.quantity, 24.7, 'Mawa should reduce by exactly 0.05 Kg for 1 Plate dining table sale');
console.log('✓ Scenario B PASSED: 1 Plate dining table sale deducted 0.1 Kg Sugar & 0.05 Kg Mawa!');

// TEST SCENARIO C: Dining Table Multi-Plate Sale (3 Plates Gulab Jamun)
console.log('\nTesting Scenario C: 3 Plates Gulab Jamun ordered at Table 4...');
const tableBill3 = {
  invoiceNo: 'TEST-TABLE-002',
  orderType: 'dine_in',
  tableId: 4,
  total: 180,
  items: [
    {
      id: 2,
      name: 'Gulab Jamun',
      unit: 'Plate',
      weightKg: null,
      qty: 3,
      price: 60
    }
  ]
};

settleBillTransaction(tableBill3);

const rawMaterialsAfterC = serverDbModule.getCollection('rawMaterials');
const sugarC = rawMaterialsAfterC.find((m) => m.id === 10);
const mawaC = rawMaterialsAfterC.find((m) => m.id === 20);

// 3 Plates = 3 * 0.1 = 0.3 Kg Sugar, 3 * 0.05 = 0.15 Kg Mawa
// Sugar: 49.4 - 0.3 = 49.1 Kg. Mawa: 24.7 - 0.15 = 24.55 Kg.
console.log(`Sugar remaining: ${sugarC.quantity} (Expected: 49.1)`);
console.log(`Mawa remaining: ${mawaC.quantity} (Expected: 24.55)`);
assert.strictEqual(sugarC.quantity, 49.1, 'Sugar should reduce by exactly 0.3 Kg for 3 Plates dining table sale');
assert.strictEqual(mawaC.quantity, 24.55, 'Mawa should reduce by exactly 0.15 Kg for 3 Plates dining table sale');
console.log('✓ Scenario C PASSED: 3 Plates dining table sale deducted 3x table base correctly!');

console.log('\n========================================');
console.log('🎉 ALL SWEET DUAL BASE RECIPE TESTS PASSED 100%!');
console.log('========================================\n');
