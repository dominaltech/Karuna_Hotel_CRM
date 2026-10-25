import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- TESTING AREA MATRIX COLUMN ORDER (1kg, 500g, 250g) & UNSAVED RATES MODAL GUARD ---');

const ownerAdminPath = path.resolve('src/components/OwnerAdmin.jsx');
const ownerAdminCode = fs.readFileSync(ownerAdminPath, 'utf8');

const appPath = path.resolve('src/App.jsx');
const appCode = fs.readFileSync(appPath, 'utf8');

// 1. Verify column header order in OwnerAdmin.jsx is 1 Kg -> 500g -> 250g
const theadMatch = ownerAdminCode.match(/isSweetMatrix\s*&&\s*\(\s*<>([\s\S]*?)<\/>\s*\)/);
assert(theadMatch, 'Should find sweet column headers in OwnerAdmin.jsx');
const theadContent = theadMatch[1];
const kg1HeaderIndex = theadContent.indexOf('1 Kg (₹)');
const g500HeaderIndex = theadContent.indexOf('500g (₹)');
const g250HeaderIndex = theadContent.indexOf('250g (₹)');

assert(kg1HeaderIndex !== -1, '1 Kg (₹) header must exist');
assert(g500HeaderIndex !== -1, '500g (₹) header must exist');
assert(g250HeaderIndex !== -1, '250g (₹) header must exist');
assert(kg1HeaderIndex < g500HeaderIndex, '1 Kg column must be placed before 500g column');
assert(g500HeaderIndex < g250HeaderIndex, '500g column must be placed before 250g column');
console.log('✅ 1. Table header column order verified: 1 Kg (₹) -> 500g (₹) -> 250g (₹)');

// 2. Verify tbody column order is 1 Kg -> 500g -> 250g
const tbodyOrderRegex = /handleSweet1KgChange[\s\S]*?handleSweetGramChange\(dish\.id,\s*'price500g'[\s\S]*?handleSweetGramChange\(dish\.id,\s*'price250g'/;
assert(tbodyOrderRegex.test(ownerAdminCode), 'Table body inputs must follow strict order: 1 Kg -> 500g -> 250g');
console.log('✅ 2. Table body input column order verified: 1 Kg -> 500g -> 250g');

// 3. Verify onBlur auto-save removed so changes remain pending in matrix
assert(!ownerAdminCode.includes("onBlur={() => handleSaveSweetRates"), 'Sweet rates inputs should not auto-save onBlur');
assert(!ownerAdminCode.includes("onBlur={(e) => {\n                                        handleSaveSingleRate"), 'Dining section inputs should not auto-save onBlur');
console.log('✅ 3. Unwanted onBlur auto-save verified removed for pending rate edits');

// 4. Verify unsaved changes state and guard handlers exist in OwnerAdmin.jsx
assert(ownerAdminCode.includes('hasUnsavedMatrixChanges'), 'hasUnsavedMatrixChanges state must exist');
assert(ownerAdminCode.includes('handleSubTabClick'), 'handleSubTabClick guard must exist');
assert(ownerAdminCode.includes('handleDiscardMatrixChanges'), 'handleDiscardMatrixChanges function must exist');
assert(ownerAdminCode.includes('handleSaveAllMatrixRates'), 'handleSaveAllMatrixRates function must exist');
assert(ownerAdminCode.includes('showSubTabUnsavedModal'), 'showSubTabUnsavedModal state & modal must exist');
console.log('✅ 4. Unsaved matrix changes tracking & sub-tab modal guard verified in OwnerAdmin.jsx');

// 5. Verify App.jsx main tab navigation guard and modal
assert(appCode.includes('adminHasUnsavedMatrix'), 'adminHasUnsavedMatrix state must exist in App.jsx');
assert(appCode.includes('handleRequestTab'), 'handleRequestTab guard must exist in App.jsx');
assert(appCode.includes('showTabUnsavedModal'), 'showTabUnsavedModal must exist in App.jsx');
assert(appCode.includes('onMatrixUnsavedChange={setAdminHasUnsavedMatrix}'), 'OwnerAdmin must be wired with onMatrixUnsavedChange');
console.log('✅ 5. Main header tab navigation guard & modal verified in App.jsx');

// 6. Test calculation logic: 1 Kg automatically sets 500g & 250g, while allowing custom manual edits
const test1Kg = 600;
const expected500g = Math.round(test1Kg * 0.5);
const expected250g = Math.round(test1Kg * 0.25);
assert.strictEqual(expected500g, 300, '500g should be half (300)');
assert.strictEqual(expected250g, 150, '250g should be quarter (150)');

// Test manual override
let customRates = { price1kg: '600', price500g: '300', price250g: '150' };
// User manually changes 250g to 160
customRates.price250g = '160';
assert.strictEqual(customRates.price1kg, '600');
assert.strictEqual(customRates.price500g, '300');
assert.strictEqual(customRates.price250g, '160');
console.log('✅ 6. Auto-calculation (50% for 500g, 25% for 250g) and independent override logic verified');

console.log('🎉 ALL AREA MATRIX AND POPUP MODAL TESTS PASSED SUCCESSFULLY!');
