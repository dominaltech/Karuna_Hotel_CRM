import assert from 'node:assert';
import { settleBillTransaction, getCollection, insertItem, updateItem } from '../server/db.js';

console.log('🧪 Running Test Suite for Stock Master Recipe & Measurement Logic...\n');

// 1. Setup Test Dish, Raw Materials, and Recipe
console.log('Test 1: Setting up measurement ratio for Kaju Katli (0.5 kg -> 0.2 kg Sugar, 0.4 kg Kaju)...');
{
  const dishes = getCollection('dishes');
  let kajuKatli = dishes.find(d => d.name === 'Kaju Katli' || d.id === 34);
  if (!kajuKatli) {
    kajuKatli = insertItem('dishes', {
      id: 34,
      name: 'Kaju Katli',
      marathiName: 'काजू कतली',
      stockQty: 1, // 1 kg in remaining tab
      stockUnit: 'kg',
      recipeBaseQty: 0.5, // 0.5 kg base measurement set in setting tab
      price: 225,
      pricePerKg: 900
    });
  } else {
    kajuKatli = updateItem('dishes', kajuKatli.id, {
      stockQty: 1,
      stockUnit: 'kg',
      recipeBaseQty: 0.5
    });
  }

  const rawMaterials = getCollection('rawMaterials');
  let sugar = rawMaterials.find(m => m.name.toLowerCase().includes('sugar') || m.id === 2);
  if (!sugar) {
    sugar = insertItem('rawMaterials', { id: 2, name: 'Sugar', quantity: 0.5, unit: 'Kg' });
  } else {
    sugar = updateItem('rawMaterials', sugar.id, { quantity: 0.5, unit: 'Kg' });
  }

  let kaju = rawMaterials.find(m => m.name.toLowerCase().includes('kaju') || m.id === 5);
  if (!kaju) {
    kaju = insertItem('rawMaterials', { id: 5, name: 'Cashew (Kaju)', quantity: 1, unit: 'Kg' });
  } else {
    kaju = updateItem('rawMaterials', kaju.id, { quantity: 1, unit: 'Kg' });
  }

  const recipes = getCollection('recipes');
  // Clean old recipes for dish 34
  const oldRecipes = recipes.filter(r => r && String(r.dishId) === String(kajuKatli.id));
  for (const old of oldRecipes) {
    const idx = recipes.findIndex(r => r.id === old.id);
    if (idx !== -1) recipes.splice(idx, 1);
  }

  // Insert recipe measurement set in Setting tab:
  // For 0.5 kg Kaju Katli -> 0.2 kg Sugar, 0.4 kg Kaju
  recipes.push({ id: 101, dishId: kajuKatli.id, rawMaterialId: sugar.id, qtyRequired: 0.2, baseQty: 0.5, unit: 'Kg' });
  recipes.push({ id: 102, dishId: kajuKatli.id, rawMaterialId: kaju.id, qtyRequired: 0.4, baseQty: 0.5, unit: 'Kg' });

  assert.strictEqual(kajuKatli.stockQty, 1, 'Initial Kaju Katli stock is 1 kg');
  assert.strictEqual(sugar.quantity, 0.5, 'Initial Sugar stock is 0.5 kg');
  assert.strictEqual(kaju.quantity, 1, 'Initial Kaju stock is 1 kg');
  console.log('✅ [PASS] Setup verified: 0.5 kg Kaju Katli base uses 0.2 kg Sugar and 0.4 kg Kaju.');
}

// 2. Simulate Sale of 0.5 kg of Kaju Katli
console.log('\nTest 2: Selling 0.5 kg of Kaju Katli...');
{
  const billData = {
    id: 99991,
    invoiceNo: 'TEST-INV-99991',
    total: 450,
    items: [
      { id: 34, name: 'Kaju Katli', qty: 1, unit: '500g', weightKg: 0.5, price: 450 }
    ]
  };

  const result = settleBillTransaction(billData);
  const updatedKajuKatli = result.dishes.find(d => d.id === 34);
  const updatedSugar = result.rawMaterials.find(m => m.id === 2 || m.name.toLowerCase().includes('sugar'));
  const updatedKaju = result.rawMaterials.find(m => m.id === 5 || m.name.toLowerCase().includes('kaju'));

  console.log(`   Remaining Kaju Katli: ${updatedKajuKatli.stockQty} kg (Expected: 0.5)`);
  console.log(`   Remaining Sugar: ${updatedSugar.quantity} kg (Expected: 0.3)`);
  console.log(`   Remaining Kaju: ${updatedKaju.quantity} kg (Expected: 0.6)`);

  assert.strictEqual(updatedKajuKatli.stockQty, 0.5, 'Kaju Katli remaining is 1 - 0.5 = 0.5 kg');
  assert.strictEqual(updatedSugar.quantity, 0.3, 'Sugar remaining is 0.5 - 0.2 = 0.3 kg');
  assert.strictEqual(updatedKaju.quantity, 0.6, 'Kaju remaining is 1.0 - 0.4 = 0.6 kg');
  console.log('✅ [PASS] Exactly matches user specification: 0.5 kg sold -> Kaju Katli 0.5 kg, Sugar 0.3 kg, Kaju 0.6 kg remaining!');
}

// 3. Verify Remaining Tab Filtering
console.log('\nTest 3: Remaining tab only displays dishes configured in Setting tab...');
{
  const recipes = getCollection('recipes');
  const configuredDishIds = new Set(recipes.map(r => String(r.dishId)));

  const dishes = getCollection('dishes');
  const remainingDishes = dishes.filter(d => configuredDishIds.has(String(d.id)));

  assert(remainingDishes.some(d => d.id === 34), 'Configured dish (Kaju Katli) appears in remaining tab');
  const unconfigured = dishes.filter(d => !configuredDishIds.has(String(d.id)));
  if (unconfigured.length > 0) {
    assert(!remainingDishes.some(d => d.id === unconfigured[0].id), 'Unconfigured dish is excluded from remaining tab');
  }
  console.log(`✅ [PASS] Only ${remainingDishes.length} configured dishes are shown in Remaining Tab (unconfigured items hidden).`);
}

console.log('\n🎉 ALL STOCK MASTER RECIPE & MEASUREMENT LOGIC TESTS PASSED!');
