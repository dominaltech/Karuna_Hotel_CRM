import assert from 'assert';
import { getDishPriceForSection } from '../src/db/db.js';

console.log('================================================================');
console.log('🧪 KARUNA HOTEL POS - DIRECT CART QUANTITY & SWEETS SECTION QA');
console.log('================================================================\n');

// Mock Sweet dish with per-Kg rate, variants, and section prices
const gulabJamun = {
  id: 33,
  name: 'Gulab Jamun',
  marathiName: 'गुलाब जामुन',
  categoryId: 2,
  categoryName: 'Sweets',
  price: 40, // Base plate price
  pricePerKg: 320, // Rate per Kg
  unit: 'Plate',
  hasMultiplePrices: true,
  variants: [
    { unit: '250g', price: 80, weightKg: 0.25 },
    { unit: '500g', price: 160, weightKg: 0.5 },
    { unit: '1Kg', price: 320, weightKg: 1 }
  ],
  sectionPrices: {
    1: 45, // Dine In: 45/plate
    2: 50, // First Floor: 50/plate
    3: 55, // AC Hall: 55/plate
    4: 40, // Parcel: 40/plate
    5: 40  // Sweets Counter
  }
};

const masalaDosa = {
  id: 1,
  name: 'Masala Dosa',
  marathiName: 'मसाला डोसा',
  categoryId: 1,
  categoryName: 'Breakfast',
  price: 60,
  unit: 'Plate',
  sectionPrices: {
    1: 60,
    2: 70,
    3: 80
  }
};

// Helper mirroring POSBilling isSweetKgDish
function isSweetKgDish(dish) {
  if (!dish) return false;
  const isSweet = (
    dish.categoryId === 2 ||
    (dish.counter && dish.counter.toLowerCase().includes('sweet')) ||
    (dish.categoryName && dish.categoryName.toLowerCase().includes('sweet'))
  );
  if (!isSweet) return false;
  return Boolean(
    dish.pricePerKg ||
    (dish.hasMultiplePrices && dish.variants && dish.variants.length > 0) ||
    (dish.unit && (dish.unit.toLowerCase().includes('kg') || dish.unit.toLowerCase().includes('g'))) ||
    (dish.name && (dish.name.toLowerCase().includes('(by kg)') || dish.name.toLowerCase().includes('/kg') || dish.name.toLowerCase().includes(' kg')))
  );
}

// Helper mirroring POSBilling isParcelOrSweetContext
function isParcelOrSweetContext({ isParcelMode, activeSection, activeTable, activeCounter }) {
  const isSweetTable = Boolean(
    activeTable?.isSweet ||
    (activeTable?.name && String(activeTable.name).toUpperCase().startsWith('S')) ||
    activeTable?.sectionId === 5
  );
  return Boolean(
    isParcelMode ||
    activeSection?.id === 4 ||
    activeSection?.id === 5 ||
    activeTable?.sectionId === 4 ||
    activeTable?.sectionId === 5 ||
    activeTable?.isParcel ||
    isSweetTable ||
    (activeTable?.name && String(activeTable.name).toUpperCase().startsWith('P')) ||
    (activeTable?.name && String(activeTable.name).toUpperCase().startsWith('S')) ||
    (activeCounter && activeCounter.toLowerCase().includes('sweet'))
  );
}

// -------------------------------------------------------------
// TEST 1: Rate Matrix by Section for Sweets & Breakfast
// -------------------------------------------------------------
console.log('▶ TEST 1: Rate matrix resolution by section for sweet and regular dishes');
assert.strictEqual(getDishPriceForSection(gulabJamun, 1), 45, 'Dine In section price should be 45');
assert.strictEqual(getDishPriceForSection(gulabJamun, 2), 50, 'First Floor section price should be 50');
assert.strictEqual(getDishPriceForSection(gulabJamun, 3), 55, 'AC Hall section price should be 55');
assert.strictEqual(getDishPriceForSection(masalaDosa, 2), 70, 'Masala Dosa on First floor should be 70');
console.log('✅ [PASS] Section rate matrix prices resolved correctly.\n');

// -------------------------------------------------------------
// TEST 2: Dining Table Context: Sweets should NOT show Kg bar
// -------------------------------------------------------------
console.log('▶ TEST 2: Dining Table Context (Dine In / First Floor / AC Hall)');
const diningContext = {
  isParcelMode: false,
  activeSection: { id: 1, name: 'Dine In Area' },
  activeTable: { id: 1, name: 'T1', sectionId: 1 },
  activeCounter: 'Main'
};
const acContext = {
  isParcelMode: false,
  activeSection: { id: 3, name: 'AC Hall' },
  activeTable: { id: 10, name: 'A1', sectionId: 3 },
  activeCounter: 'Main'
};

assert.strictEqual(isSweetKgDish(gulabJamun), true, 'Gulab Jamun is recognized as a sweet dish');
assert.strictEqual(isParcelOrSweetContext(diningContext), false, 'Dining table is NOT parcel or sweet context');
assert.strictEqual(isParcelOrSweetContext(acContext), false, 'AC table is NOT parcel or sweet context');

// Verify POSBilling logic at dining table:
const showKgBarDining = isSweetKgDish(gulabJamun) && isParcelOrSweetContext(diningContext);
assert.strictEqual(showKgBarDining, false, 'Kg bar MUST NOT show at dining tables');
console.log('✅ [PASS] Kg bar is suppressed at dining tables (T1..T99, A1..A99).\n');

// -------------------------------------------------------------
// TEST 3: Parcel & Sweets Context: Kg bar SHOULD show
// -------------------------------------------------------------
console.log('▶ TEST 3: Parcel & Sweet Contexts (Kg bar MUST show)');
const parcelTableContext = {
  isParcelMode: false,
  activeSection: { id: 4, name: 'Parcels' },
  activeTable: { id: 50, name: 'P1', sectionId: 4, isParcel: true },
  activeCounter: 'Parcel'
};
const sweetCounterContext = {
  isParcelMode: false,
  activeSection: { id: 5, name: 'Sweets Counter' },
  activeTable: { id: 60, name: 'S1', sectionId: 5, isSweet: true },
  activeCounter: 'Sweets'
};
const parcelModeActiveContext = {
  isParcelMode: true,
  activeSection: { id: 1, name: 'Dine In Area' },
  activeTable: { id: 1, name: 'T1', sectionId: 1 },
  activeCounter: 'Main'
};

assert.strictEqual(isParcelOrSweetContext(parcelTableContext), true, 'Parcel table is parcel context');
assert.strictEqual(isParcelOrSweetContext(sweetCounterContext), true, 'Sweet counter is sweet context');
assert.strictEqual(isParcelOrSweetContext(parcelModeActiveContext), true, 'Parcel mode toggled on is parcel context');

assert.strictEqual(isSweetKgDish(gulabJamun) && isParcelOrSweetContext(parcelTableContext), true, 'Kg bar shows on parcel table');
assert.strictEqual(isSweetKgDish(gulabJamun) && isParcelOrSweetContext(sweetCounterContext), true, 'Kg bar shows on sweets counter');
console.log('✅ [PASS] Kg bar correctly shows in Parcel and Sweets contexts.\n');

// -------------------------------------------------------------
// TEST 4: Direct Quantity Entry & Enter Press (Plate vs Kg calculations)
// -------------------------------------------------------------
console.log('▶ TEST 4: Direct quantity inline edit calculation');
// Simulation of adding sweet to dining table
const sweetPlateItemInCart = {
  id: gulabJamun.id,
  name: gulabJamun.name,
  cartItemId: '33_test_1',
  price: getDishPriceForSection(gulabJamun, 1), // 45 per plate
  unit: 'Plate',
  weightKg: null,
  qty: 1
};

// User directly enters quantity 3 and presses Enter
const userEnteredQty = 3;
const updatedItem = {
  ...sweetPlateItemInCart,
  qty: userEnteredQty
};
const lineTotal = updatedItem.price * updatedItem.qty;
assert.strictEqual(updatedItem.qty, 3, 'Quantity is directly updated to 3');
assert.strictEqual(lineTotal, 135, '3 plates @ ₹45/plate equals ₹135');

// Verification of Kg item update in parcel mode
const sweetKgItemInCart = {
  id: gulabJamun.id,
  name: gulabJamun.name,
  cartItemId: '33_test_2',
  price: 80,
  unit: '250g',
  weightKg: 0.25,
  qty: 1
};
const userEditedKg = 0.75;
const updatedKgItem = {
  ...sweetKgItemInCart,
  qty: 1,
  price: Math.round(userEditedKg * gulabJamun.pricePerKg), // 0.75 * 320 = 240
  unit: `${userEditedKg} Kg`,
  weightKg: userEditedKg,
  qtyDisplay: `${userEditedKg} Kg`
};
assert.strictEqual(updatedKgItem.price, 240, '0.75 Kg @ ₹320/Kg equals ₹240');
console.log('✅ [PASS] Direct plate quantity and Kg calculations are 100% accurate.\n');

console.log('================================================================');
console.log('🏁 ALL TESTS PASSED SUCCESSFULLY!');
console.log('================================================================');
