import assert from 'assert';
import { settleBillTransaction, getAllData } from '../server/db.js';

console.log('--- Testing Complete Raw Material Isolation Per Item ---');

const state = getAllData();

// Dish 1: Kaju Katli
const kajuKatli = {
  id: 8001,
  srNo: 801,
  name: 'Special Kaju Katli',
  stockQty: 20,
  stockUnit: 'kg',
  recipeBaseQty: 1, // 1 kg base
  accumulatedSold: 0,
  status: 'In Stock'
};

// Dish 2: Rasgulla
const rasgulla = {
  id: 8002,
  srNo: 802,
  name: 'Bengal Rasgulla',
  stockQty: 25,
  stockUnit: 'kg',
  recipeBaseQty: 1, // 1 kg base
  accumulatedSold: 0,
  status: 'In Stock'
};

// Raw materials
const rmKaju = { id: 7001, name: 'Cashew (Kaju)', quantity: 50, unit: 'Kg' };
const rmSugar = { id: 7002, name: 'Sugar', quantity: 50, unit: 'Kg' };
const rmMilk = { id: 7003, name: 'Milk', quantity: 50, unit: 'litre' };

// Kaju Katli Recipes:
// 1. Kaju: 0.5 Kg per 1 kg (currentStock: 10 Kg)
const recKajuKatli_Kaju = {
  id: 6001,
  dishId: 8001,
  rawMaterialId: 7001,
  rawMaterialName: 'Cashew (Kaju)',
  qtyRequired: 0.5,
  baseQty: 1,
  unit: 'Kg',
  currentStock: 10
};
// 2. Sugar: 0.4 Kg per 1 kg (currentStock: 8 Kg)
const recKajuKatli_Sugar = {
  id: 6002,
  dishId: 8001,
  rawMaterialId: 7002,
  rawMaterialName: 'Sugar',
  qtyRequired: 0.4,
  baseQty: 1,
  unit: 'Kg',
  currentStock: 8
};

// Rasgulla Recipes:
// 1. Milk: 0.8 Litre per 1 kg (currentStock: 15 Litre)
const recRasgulla_Milk = {
  id: 6003,
  dishId: 8002,
  rawMaterialId: 7003,
  rawMaterialName: 'Milk',
  qtyRequired: 0.8,
  baseQty: 1,
  unit: 'litre',
  currentStock: 15
};
// 2. Kaju: 0.2 Kg per 1 kg (currentStock: 5 Kg)
const recRasgulla_Kaju = {
  id: 6004,
  dishId: 8002,
  rawMaterialId: 7001,
  rawMaterialName: 'Cashew (Kaju)',
  qtyRequired: 0.2,
  baseQty: 1,
  unit: 'Kg',
  currentStock: 5
};

// Clean any leftover test IDs from previous runs
state.dishes = (state.dishes || []).filter(d => d && d.id !== 8001 && d.id !== 8002);
state.rawMaterials = (state.rawMaterials || []).filter(rm => rm && rm.id !== 7001 && rm.id !== 7002 && rm.id !== 7003);
state.recipes = (state.recipes || []).filter(r => r && ![6001, 6002, 6003, 6004].includes(r.id));

// Inject into state
state.dishes.push(kajuKatli, rasgulla);
state.rawMaterials.push(rmKaju, rmSugar, rmMilk);
state.recipes.push(recKajuKatli_Kaju, recKajuKatli_Sugar, recRasgulla_Milk, recRasgulla_Kaju);

// Test 1: Settle Bill for 1 kg Kaju Katli ONLY
console.log('\nStep 1: Selling 1 kg Kaju Katli...');
settleBillTransaction({
  items: [
    {
      id: 8001,
      name: 'Special Kaju Katli',
      qty: 1,
      weightKg: 1
    }
  ]
});

console.log('Kaju Katli Dish Stock:', kajuKatli.stockQty, '(Expected: 19)');
assert.strictEqual(kajuKatli.stockQty, 19);

console.log('Kaju Katli -> Kaju Stock:', recKajuKatli_Kaju.currentStock, '(Expected: 9.5)');
assert.strictEqual(recKajuKatli_Kaju.currentStock, 9.5);

console.log('Kaju Katli -> Sugar Stock:', recKajuKatli_Sugar.currentStock, '(Expected: 7.6)');
assert.strictEqual(recKajuKatli_Sugar.currentStock, 7.6);

console.log('\n--- Checking Rasgulla Stock (Should NOT be deducted!) ---');
console.log('Rasgulla -> Kaju Stock:', recRasgulla_Kaju.currentStock, '(Expected: 5.0 - UNTOUCHED!)');
assert.strictEqual(recRasgulla_Kaju.currentStock, 5, 'Rasgulla Kaju must remain untouched!');

console.log('Rasgulla -> Milk Stock:', recRasgulla_Milk.currentStock, '(Expected: 15.0 - UNTOUCHED!)');
assert.strictEqual(recRasgulla_Milk.currentStock, 15, 'Rasgulla Milk must remain untouched!');

// Test 2: Settle Bill for 1 kg Rasgulla ONLY
console.log('\nStep 2: Selling 1 kg Rasgulla...');
settleBillTransaction({
  items: [
    {
      id: 8002,
      name: 'Bengal Rasgulla',
      qty: 1,
      weightKg: 1
    }
  ]
});

console.log('Rasgulla Dish Stock:', rasgulla.stockQty, '(Expected: 24)');
assert.strictEqual(rasgulla.stockQty, 24);

console.log('Rasgulla -> Kaju Stock:', recRasgulla_Kaju.currentStock, '(Expected: 4.8)');
assert.strictEqual(recRasgulla_Kaju.currentStock, 4.8);

console.log('Rasgulla -> Milk Stock:', recRasgulla_Milk.currentStock, '(Expected: 14.2)');
assert.strictEqual(recRasgulla_Milk.currentStock, 14.2);

console.log('\n--- Checking Kaju Katli Stock (Should NOT be deducted further!) ---');
console.log('Kaju Katli -> Kaju Stock:', recKajuKatli_Kaju.currentStock, '(Expected: 9.5 - UNTOUCHED!)');
assert.strictEqual(recKajuKatli_Kaju.currentStock, 9.5);

console.log('Kaju Katli -> Sugar Stock:', recKajuKatli_Sugar.currentStock, '(Expected: 7.6 - UNTOUCHED!)');
assert.strictEqual(recKajuKatli_Sugar.currentStock, 7.6);

// Clean up test objects
state.dishes = (state.dishes || []).filter(d => d && d.id !== 8001 && d.id !== 8002);
state.rawMaterials = (state.rawMaterials || []).filter(rm => rm && rm.id !== 7001 && rm.id !== 7002 && rm.id !== 7003);
state.recipes = (state.recipes || []).filter(r => r && ![6001, 6002, 6003, 6004].includes(r.id));

console.log('\n🎉 ALL RAW MATERIAL ISOLATION TESTS PASSED 100%! ZERO CROSS-DEDUCTION!');
process.exit(0);
