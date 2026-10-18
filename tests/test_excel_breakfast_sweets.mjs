import assert from 'assert';
import http from 'http';
import {
  exportBreakfastItemsToCSV,
  exportSweetsItemsToCSV,
  parseCSVAndValidateRates,
  isSweetDish
} from '../src/utils/excelUtils.js';

function apiRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:3001');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('--- TESTING BREAKFAST & SWEETS EXCEL EXPORT & IMPORT ---');

  // Sample dishes
  const mockCategories = [
    { id: '1', name: 'Snacks' },
    { id: '2', name: 'Sweets & Mithai' }
  ];
  const mockSubCategories = [
    { id: '1', categoryId: '1', name: 'South Indian' },
    { id: '2', categoryId: '2', name: 'Bengali Sweets' }
  ];
  const mockDishes = [
    {
      id: 'dish-1',
      srNo: 101,
      name: 'Masala Dosa',
      marathiName: 'मसाला डोसा',
      categoryId: '1',
      subCategoryId: '1',
      price: 60,
      sectionPrices: { '1': 60, '2': 65, '3': 75, '4': 60 },
      isSweet: false
    },
    {
      id: 'dish-2',
      srNo: 201,
      name: 'Kaju Katli',
      marathiName: 'काजू कतली',
      categoryId: '2',
      subCategoryId: '2',
      price: 250,
      pricePerKg: 1000,
      sectionPrices: { '1': 250, '2': 250, '3': 280, '4': 250 },
      variants: [
        { unit: '250g', weightKg: 0.25, price: 250 },
        { unit: '500g', weightKg: 0.5, price: 500 },
        { unit: '1 Kg', weightKg: 1, price: 1000 }
      ],
      isSweet: true
    }
  ];

  // 1. Verify Breakfast CSV Generation
  const breakfastCSV = exportBreakfastItemsToCSV(mockDishes, mockCategories, mockSubCategories);
  console.log('Breakfast CSV Output Preview:\n', breakfastCSV);

  assert(!breakfastCSV.includes('Base Rate'), 'Breakfast CSV must NOT contain "Base Rate"');
  assert(!breakfastCSV.includes('Counter'), 'Breakfast CSV must NOT contain "Counter"');
  assert(breakfastCSV.includes('Dining'), 'Breakfast CSV must contain "Dining"');
  assert(breakfastCSV.includes('First Floor'), 'Breakfast CSV must contain "First Floor"');
  assert(breakfastCSV.includes('AC'), 'Breakfast CSV must contain "AC"');
  assert(breakfastCSV.includes('Parcel'), 'Breakfast CSV must contain "Parcel"');
  assert(!breakfastCSV.includes('Kaju Katli'), 'Breakfast CSV must not contain sweets like Kaju Katli');
  assert(breakfastCSV.includes('Masala Dosa'), 'Breakfast CSV must contain Masala Dosa');
  console.log('✅ Breakfast CSV column structure verified');

  // 2. Verify Sweets CSV Generation
  const sweetsCSV = exportSweetsItemsToCSV(mockDishes, mockCategories, mockSubCategories);
  console.log('Sweets CSV Output Preview:\n', sweetsCSV);

  assert(!sweetsCSV.includes('Base Rate'), 'Sweets CSV must NOT contain "Base Rate"');
  assert(!sweetsCSV.includes('Counter'), 'Sweets CSV must NOT contain "Counter"');
  assert(sweetsCSV.includes('Dining'), 'Sweets CSV must contain "Dining"');
  assert(sweetsCSV.includes('First Floor'), 'Sweets CSV must contain "First Floor"');
  assert(sweetsCSV.includes('AC'), 'Sweets CSV must contain "AC"');
  assert(sweetsCSV.includes('Parcel'), 'Sweets CSV must contain "Parcel"');
  assert(sweetsCSV.includes('250g'), 'Sweets CSV must contain "250g"');
  assert(sweetsCSV.includes('500g'), 'Sweets CSV must contain "500g"');
  assert(sweetsCSV.includes('1Kg'), 'Sweets CSV must contain "1Kg"');
  assert(sweetsCSV.includes('Kaju Katli'), 'Sweets CSV must contain Kaju Katli');
  assert(!sweetsCSV.includes('Masala Dosa'), 'Sweets CSV must not contain breakfast dishes like Masala Dosa');
  console.log('✅ Sweets CSV column structure verified');

  // 3. Test CSV Parsing of Sweets with new columns & rates
  const parseResult = parseCSVAndValidateRates(sweetsCSV);
  assert.strictEqual(parseResult.success, true, 'Parsing must succeed');
  const parsedSweets = parseResult.items;
  assert.strictEqual(parsedSweets.length, 1, '1 Sweet parsed');
  assert.strictEqual(parsedSweets[0].name, 'Kaju Katli');
  assert.strictEqual(parsedSweets[0].diningPrice, 250);
  assert.strictEqual(parsedSweets[0].firstFloorPrice, 250);
  assert.strictEqual(parsedSweets[0].acPrice, 280);
  assert.strictEqual(parsedSweets[0].parcelPrice, 250);
  assert.strictEqual(parsedSweets[0].price250g, 250);
  assert.strictEqual(parsedSweets[0].price500g, 500);
  assert.strictEqual(parsedSweets[0].price1kg, 1000);
  console.log('✅ Sweets CSV parsing verified with all rate columns');

  // 4. Test Server Bulk Price Update with new columns
  console.log('Testing Server API /api/dishes/bulk-prices with new section & sweet portion prices...');
  const dishesRes = await apiRequest('/api/dishes');
  const allDishes = dishesRes.data.data;
  const dbUppit = allDishes.find(d => d.name === 'Uppit' || d.srNo === 102);
  const dbJamun = allDishes.find(d => d.name === 'Gulab Jamun' || d.srNo === 201);
  assert(dbUppit, 'Found Uppit in DB');
  assert(dbJamun, 'Found Gulab Jamun in DB');

  const updatePayload = {
    items: [
      {
        srNo: dbUppit.srNo,
        name: dbUppit.name,
        price: 55,
        diningPrice: 55,
        firstFloorPrice: 58,
        acPrice: 70,
        parcelPrice: 55
      },
      {
        srNo: dbJamun.srNo,
        name: dbJamun.name,
        price: 120,
        diningPrice: 120,
        firstFloorPrice: 120,
        acPrice: 140,
        parcelPrice: 120,
        price250g: 120,
        price500g: 230,
        price1kg: 450
      }
    ]
  };

  const updateRes = await apiRequest('/api/dishes/bulk-prices', 'POST', updatePayload);
  assert.strictEqual(updateRes.status, 200, 'POST /api/dishes/bulk-prices responded 200');
  assert.strictEqual(updateRes.data.success, true);

  // Check persisted values in DB
  const verifyRes = await apiRequest('/api/dishes');
  const verifiedUppit = verifyRes.data.data.find(d => d.id === dbUppit.id);
  const verifiedJamun = verifyRes.data.data.find(d => d.id === dbJamun.id);

  assert.strictEqual(verifiedUppit.price, 55, 'Uppit price updated');
  assert.strictEqual(verifiedUppit.sectionPrices['1'], 55, 'Uppit Dining updated');
  assert.strictEqual(verifiedUppit.sectionPrices['2'], 58, 'Uppit First Floor updated');
  assert.strictEqual(verifiedUppit.sectionPrices['3'], 70, 'Uppit AC updated');
  assert.strictEqual(verifiedUppit.sectionPrices['4'], 55, 'Uppit Parcel updated');

  assert.strictEqual(verifiedJamun.sectionPrices['1'], 120, 'Jamun Dining updated');
  assert.strictEqual(verifiedJamun.sectionPrices['2'], 120, 'Jamun First Floor updated');
  assert.strictEqual(verifiedJamun.sectionPrices['3'], 140, 'Jamun AC updated');
  assert.strictEqual(verifiedJamun.sectionPrices['4'], 120, 'Jamun Parcel updated');
  assert.strictEqual(verifiedJamun.variants[0].price, 120, 'Jamun 250g variant updated to 120');
  assert.strictEqual(verifiedJamun.variants[1].price, 230, 'Jamun 500g variant updated to 230');
  assert.strictEqual(verifiedJamun.variants[2].price, 450, 'Jamun 1Kg variant updated to 450');
  assert.strictEqual(verifiedJamun.pricePerKg, 450, 'Jamun pricePerKg updated to 450');

  console.log('✅ Master Server DB bulkUpdateDishPrices accurately updated all section rates and portion rates!');
  console.log('🎉 ALL EXCEL TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
