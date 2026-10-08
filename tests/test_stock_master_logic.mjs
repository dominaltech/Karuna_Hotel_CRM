import assert from 'node:assert';

console.log('🧪 Testing Stock Master Logic (Setting & Remaining Dishes)...');

// Sample dish
const dish = {
  id: 34,
  name: 'Kaju Katli',
  marathiName: 'काजू कतली',
  stockUnit: 'kg',
  stockQty: 10 // 10 kg
};

// Raw materials
const rawMaterials = [
  { id: 1, name: 'Sugar', unit: 'Kg' },
  { id: 2, name: 'Cashew (Kaju)', unit: 'Kg' }
];

// Recipe mapping for Kaju Katli: 0.5 kg Sugar and 0.5 kg Kaju per 1 kg of Kaju Katli
const recipes = [
  { id: 101, dishId: 34, rawMaterialId: 1, qtyRequired: 0.5, unit: 'Kg' },
  { id: 102, dishId: 34, rawMaterialId: 2, qtyRequired: 0.5, unit: 'Kg' }
];

// Calculation helper function (mirrors StockManagement.jsx)
function calculateDishRawMaterials(targetDish, dishRecipes, allRawMaterials) {
  const stock = Math.max(0, parseFloat(targetDish.stockQty) || 0);
  return dishRecipes.map((r) => {
    const rm = allRawMaterials.find((m) => m.id === r.rawMaterialId);
    const rawRemaining = Math.round(stock * (parseFloat(r.qtyRequired) || 0) * 1000) / 1000;
    return {
      rawMaterialId: r.rawMaterialId,
      rawMaterialName: rm?.name,
      qtyRequiredPerUnit: r.qtyRequired,
      rawRemaining,
      unit: r.unit || rm?.unit || 'Kg'
    };
  });
}

// 1. Initial State: 10 kg Kaju Katli
let breakdown = calculateDishRawMaterials(dish, recipes, rawMaterials);
console.log('1. Initial breakdown for 10 kg Kaju Katli:');
console.log(breakdown);

const sugarInitial = breakdown.find(b => b.rawMaterialName === 'Sugar');
const kajuInitial = breakdown.find(b => b.rawMaterialName === 'Cashew (Kaju)');
assert.strictEqual(sugarInitial.rawRemaining, 5.0, 'Sugar remaining is 5.0 kg for 10 kg dish');
assert.strictEqual(kajuInitial.rawRemaining, 5.0, 'Kaju remaining is 5.0 kg for 10 kg dish');

// 2. Simulate sale of 2 kg Kaju Katli (e.g. at POS)
const soldKg = 2;
dish.stockQty = Math.max(0, dish.stockQty - soldKg);
breakdown = calculateDishRawMaterials(dish, recipes, rawMaterials);
console.log('\n2. Breakdown after selling 2 kg (Remaining dish: ' + dish.stockQty + ' kg):');
console.log(breakdown);

const sugarAfterSale = breakdown.find(b => b.rawMaterialName === 'Sugar');
const kajuAfterSale = breakdown.find(b => b.rawMaterialName === 'Cashew (Kaju)');
assert.strictEqual(sugarAfterSale.rawRemaining, 4.0, 'Sugar remaining decreased to 4.0 kg');
assert.strictEqual(kajuAfterSale.rawRemaining, 4.0, 'Kaju remaining decreased to 4.0 kg');

// 3. Simulate user clicking "+ Increase Stock" by +3 kg in Remaining Dishes tab
const addedKg = 3;
dish.stockQty += addedKg; // now 11 kg
breakdown = calculateDishRawMaterials(dish, recipes, rawMaterials);
console.log('\n3. Breakdown after adding +3 kg dish stock (Remaining dish: ' + dish.stockQty + ' kg):');
console.log(breakdown);

const sugarAfterAdd = breakdown.find(b => b.rawMaterialName === 'Sugar');
const kajuAfterAdd = breakdown.find(b => b.rawMaterialName === 'Cashew (Kaju)');
assert.strictEqual(sugarAfterAdd.rawRemaining, 5.5, 'Sugar remaining automatically increased to 5.5 kg');
assert.strictEqual(kajuAfterAdd.rawRemaining, 5.5, 'Kaju remaining automatically increased to 5.5 kg');

// 4. Test Plate-based dish (e.g. Idli Vada with Rice Batter)
const plateDish = {
  id: 1,
  name: 'Single Idli Vada',
  stockUnit: 'per plate',
  stockQty: 30 // 30 plates
};
const plateRecipes = [
  { id: 201, dishId: 1, rawMaterialId: 3, qtyRequired: 0.15, unit: 'Kg' } // 0.15 kg batter per plate
];
const batterRm = [{ id: 3, name: 'Rice Batter', unit: 'Kg' }];

const plateBreakdown = calculateDishRawMaterials(plateDish, plateRecipes, batterRm);
console.log('\n4. Breakdown for 30 plates Single Idli Vada (0.15 kg batter/plate):');
console.log(plateBreakdown);
assert.strictEqual(plateBreakdown[0].rawRemaining, 4.5, '4.5 kg batter remaining for 30 plates');

console.log('\n✅ ALL STOCK MASTER LOGIC UNIT TESTS PASSED!');
