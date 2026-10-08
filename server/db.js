import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'karuna_pos_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Complete Default Seed Data for Karuna Hotel
export const DEFAULT_DATABASE_DATA = {
  categories: [
    { id: 1, name: 'Breakfast Division (नाश्ता)', isFixed: true, srNo: 1 },
    { id: 2, name: 'Sweets & Mithai Division (मिठाई)', isFixed: true, srNo: 2 }
  ],
  subCategories: [
    { id: 1, name: 'Breakfast & Snacks', parentCategoryId: 1, srNo: 1 },
    { id: 2, name: 'Single Items', parentCategoryId: 1, srNo: 2 },
    { id: 3, name: 'Dosa & Uttappa', parentCategoryId: 1, srNo: 3 },
    { id: 4, name: 'Pav Bhaji & Meals', parentCategoryId: 1, srNo: 4 },
    { id: 5, name: 'Indian Bread', parentCategoryId: 1, srNo: 5 },
    { id: 6, name: 'Tea, Coffee & Cold Drinks', parentCategoryId: 1, srNo: 6 },
    { id: 7, name: 'Extras & Sides', parentCategoryId: 1, srNo: 7 },
    { id: 8, name: 'Sweets & Mithai', parentCategoryId: 2, srNo: 1 },
    { id: 9, name: 'Ladoo, Pedha & Kunda', parentCategoryId: 2, srNo: 2 },
    { id: 10, name: 'Barfi Specials', parentCategoryId: 2, srNo: 3 },
    { id: 11, name: 'Farsan, Namkeen & Chivda', parentCategoryId: 2, srNo: 4 }
  ],
  sections: [
    { id: 1, name: 'Dine In Area', extraCharge: 0, color: 'blue' },
    { id: 2, name: 'First Floor', extraCharge: 0, color: 'emerald' },
    { id: 3, name: 'AC Hall', extraCharge: 0, color: 'purple' },
    { id: 4, name: 'Parcels', extraCharge: 0, color: 'amber' }
  ],
  dishes: [
    { id: 1, srNo: 101, name: 'Single Idli Vada', marathiName: 'सिंगल इडली वडा', categoryId: 1, subCategoryId: 1, price: 50, stockQty: 30, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 50, 2: 50, 3: 60, 4: 50 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: 'Chutney', qty: '1' }, { name: 'Sambar', qty: '1' }] },
    { id: 2, srNo: 102, name: 'Uppit', marathiName: 'उप्पीट', categoryId: 1, subCategoryId: 1, price: 50, stockQty: 25, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 50, 2: 50, 3: 60, 4: 50 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 3, srNo: 103, name: 'Pohe', marathiName: 'पोहे', categoryId: 1, subCategoryId: 1, price: 35, stockQty: 30, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 35, 2: 35, 3: 45, 4: 35 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: 'Sev & Lemon', qty: '1' }] },
    { id: 4, srNo: 104, name: 'Sheera', marathiName: 'शिरा', categoryId: 1, subCategoryId: 1, price: 45, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 45, 2: 45, 3: 55, 4: 45 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 5, srNo: 105, name: 'Puri Bhaji', marathiName: 'पुरी भाजी', categoryId: 1, subCategoryId: 1, price: 75, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 75, 2: 75, 3: 85, 4: 75 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: '4 Puris', qty: '1 portion' }, { name: 'Potato Bhaji', qty: '1 bowl' }] },
    { id: 6, srNo: 106, name: 'Idli', marathiName: 'इडली सांबार', categoryId: 1, subCategoryId: 1, price: 50, stockQty: 40, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 50, 2: 50, 3: 60, 4: 50 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: '2 Idlis', qty: '1 plate' }, { name: 'Sambar & Chutney', qty: '1' }] },
    { id: 7, srNo: 107, name: 'Vada Sambar', marathiName: 'वडा सांबार', categoryId: 1, subCategoryId: 1, price: 60, stockQty: 35, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 60, 2: 60, 3: 70, 4: 60 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: '2 Vadas', qty: '1 plate' }] },
    { id: 8, srNo: 108, name: 'Idli Vada', marathiName: 'इडली वडा मिक्स', categoryId: 1, subCategoryId: 1, price: 60, stockQty: 30, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 60, 2: 60, 3: 70, 4: 60 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: '1 Idli 1 Vada', qty: '1 plate' }] },
    { id: 9, srNo: 109, name: 'Shabu Vada', marathiName: 'शाबू वडा', categoryId: 1, subCategoryId: 1, price: 70, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 70, 2: 70, 3: 80, 4: 70 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 10, srNo: 110, name: 'Shabu Khichdi', marathiName: 'शाबू खिचडी', categoryId: 1, subCategoryId: 1, price: 60, stockQty: 25, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 60, 2: 60, 3: 70, 4: 60 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: 'Curd', qty: '1 bowl' }] },
    { id: 11, srNo: 111, name: 'Dahi Vada', marathiName: 'दही वडा', categoryId: 1, subCategoryId: 1, price: 70, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 70, 2: 70, 3: 80, 4: 70 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 12, srNo: 112, name: 'Batata Vada', marathiName: 'बटाटा वडा', categoryId: 1, subCategoryId: 1, price: 40, stockQty: 40, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 40, 2: 40, 3: 50, 4: 40 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 13, srNo: 113, name: 'Samosa', marathiName: 'समोसा', categoryId: 1, subCategoryId: 1, price: 40, stockQty: 30, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 40, 2: 40, 3: 50, 4: 40 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 14, srNo: 114, name: 'Kachori', marathiName: 'कचोरी', categoryId: 1, subCategoryId: 1, price: 40, stockQty: 25, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 40, 2: 40, 3: 50, 4: 40 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 15, srNo: 115, name: 'Dhokla', marathiName: 'ढोकळा', categoryId: 1, subCategoryId: 1, price: 45, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 45, 2: 45, 3: 55, 4: 45 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 16, srNo: 116, name: 'Bhaji (Pakoda)', marathiName: 'कांदा भजी', categoryId: 1, subCategoryId: 1, price: 50, stockQty: 25, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 50, 2: 50, 3: 60, 4: 50 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 17, srNo: 117, name: 'Pakoda', marathiName: 'पकोडा', categoryId: 1, subCategoryId: 1, price: 50, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 50, 2: 50, 3: 60, 4: 50 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 18, srNo: 118, name: 'Papdi', marathiName: 'पापडी', categoryId: 1, subCategoryId: 1, price: 35, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 35, 2: 35, 3: 45, 4: 35 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 19, srNo: 121, name: 'Plain Dosa', marathiName: 'प्लेन डोसा', categoryId: 1, subCategoryId: 3, price: 55, stockQty: 30, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 55, 2: 55, 3: 65, 4: 55 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: 'Chutney & Sambar', qty: '1' }] },
    { id: 20, srNo: 122, name: 'Masala Dosa', marathiName: 'मसाला डोसा', categoryId: 1, subCategoryId: 3, price: 70, stockQty: 35, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 70, 2: 70, 3: 80, 4: 70 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: 'Potato Masala, Chutney, Sambar', qty: '1' }] },
    { id: 21, srNo: 123, name: 'Mysore Masala Dosa', marathiName: 'म्हैसूर मसाला डोसा', categoryId: 1, subCategoryId: 3, price: 85, stockQty: 25, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 85, 2: 85, 3: 95, 4: 85 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 22, srNo: 124, name: 'Cheese Masala Dosa', marathiName: 'चीज मसाला डोसा', categoryId: 1, subCategoryId: 3, price: 95, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 95, 2: 95, 3: 105, 4: 95 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 23, srNo: 125, name: 'Onion Uttappa', marathiName: 'कांदा उत्तप्पा', categoryId: 1, subCategoryId: 3, price: 75, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 75, 2: 75, 3: 85, 4: 75 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 24, srNo: 126, name: 'Tomato Onion Uttappa', marathiName: 'टोमॅटो कांदा उत्तप्पा', categoryId: 1, subCategoryId: 3, price: 80, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 80, 2: 80, 3: 90, 4: 80 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 25, srNo: 131, name: 'Butter Pav Bhaji', marathiName: 'बटर पाव भाजी', categoryId: 1, subCategoryId: 4, price: 90, stockQty: 30, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 90, 2: 90, 3: 100, 4: 90 }, counter: 'Breakfast', status: 'In Stock', subItems: [{ name: '2 Pavs', qty: '1 pair' }, { name: 'Bhaji', qty: '1 bowl' }] },
    { id: 26, srNo: 132, name: 'Cheese Pav Bhaji', marathiName: 'चीज पाव भाजी', categoryId: 1, subCategoryId: 4, price: 110, stockQty: 25, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 110, 2: 110, 3: 125, 4: 110 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 27, srNo: 133, name: 'Extra Pav (Pair)', marathiName: 'एक्स्ट्रा पाव जोडी', categoryId: 1, subCategoryId: 4, price: 25, stockQty: 50, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 25, 2: 25, 3: 30, 4: 25 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 28, srNo: 134, name: 'Special Thali Meal', marathiName: 'स्पेशल थाळी जेवण', categoryId: 1, subCategoryId: 4, price: 140, stockQty: 20, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 140, 2: 140, 3: 160, 4: 140 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 29, srNo: 141, name: 'Special Tea', marathiName: 'स्पेशल चहा', categoryId: 1, subCategoryId: 6, price: 20, stockQty: 100, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 20, 2: 20, 3: 25, 4: 20 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 30, srNo: 142, name: 'Filter Coffee', marathiName: 'फिल्टर कॉफी', categoryId: 1, subCategoryId: 6, price: 30, stockQty: 50, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 30, 2: 30, 3: 35, 4: 30 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 31, srNo: 143, name: 'Cold Drink / Lassi', marathiName: 'लस्सी / कोल्ड ड्रिंक', categoryId: 1, subCategoryId: 6, price: 40, stockQty: 30, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 40, 2: 40, 3: 45, 4: 40 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },
    { id: 32, srNo: 144, name: 'Mineral Water (1L)', marathiName: 'मिनरल वॉटर (१L)', categoryId: 1, subCategoryId: 6, price: 20, stockQty: 50, hasMultiplePrices: false, variants: [], sectionPrices: { 1: 20, 2: 20, 3: 20, 4: 20 }, counter: 'Breakfast', status: 'In Stock', subItems: [] },

    // Sweets with Per-Kg Base Price & Multi-Price Portions (in Kg)
    {
      id: 33,
      srNo: 201,
      name: 'Gulab Jamun',
      marathiName: 'गुलाब जामुन',
      categoryId: 2,
      subCategoryId: 8,
      price: 80,
      pricePerKg: 320,
      stockQty: 20,
      hasMultiplePrices: true,
      variants: [
        { unit: '250g', weightKg: 0.25, price: 80 },
        { unit: '500g', weightKg: 0.5, price: 160 },
        { unit: '1 Kg', weightKg: 1, price: 320 }
      ],
      sectionPrices: {},
      counter: 'Sweets',
      status: 'In Stock',
      subItems: []
    },
    {
      id: 34,
      srNo: 202,
      name: 'Kaju Katli',
      marathiName: 'काजू कतली',
      categoryId: 2,
      subCategoryId: 8,
      price: 225,
      pricePerKg: 900,
      stockQty: 25,
      hasMultiplePrices: true,
      variants: [
        { unit: '250g', weightKg: 0.25, price: 225 },
        { unit: '500g', weightKg: 0.5, price: 450 },
        { unit: '1 Kg', weightKg: 1, price: 900 }
      ],
      sectionPrices: {},
      counter: 'Sweets',
      status: 'In Stock',
      subItems: []
    },
    {
      id: 35,
      srNo: 203,
      name: 'Rasgulla',
      marathiName: 'रसगुल्ला',
      categoryId: 2,
      subCategoryId: 8,
      price: 90,
      pricePerKg: 350,
      stockQty: 18,
      hasMultiplePrices: true,
      variants: [
        { unit: '250g', weightKg: 0.25, price: 90 },
        { unit: '500g', weightKg: 0.5, price: 175 },
        { unit: '1 Kg', weightKg: 1, price: 350 }
      ],
      sectionPrices: {},
      counter: 'Sweets',
      status: 'In Stock',
      subItems: []
    },
    {
      id: 36,
      srNo: 204,
      name: 'Motichoor Laddu',
      marathiName: 'मोतीचूर लाडू',
      categoryId: 2,
      subCategoryId: 9,
      price: 75,
      pricePerKg: 300,
      stockQty: 30,
      hasMultiplePrices: true,
      variants: [
        { unit: '250g', weightKg: 0.25, price: 75 },
        { unit: '500g', weightKg: 0.5, price: 150 },
        { unit: '1 Kg', weightKg: 1, price: 300 }
      ],
      sectionPrices: {},
      counter: 'Sweets',
      status: 'In Stock',
      subItems: []
    },
    {
      id: 37,
      srNo: 205,
      name: 'Special Peda',
      marathiName: 'स्पेशल पेढा',
      categoryId: 2,
      subCategoryId: 9,
      price: 105,
      pricePerKg: 420,
      stockQty: 22,
      hasMultiplePrices: true,
      variants: [
        { unit: '250g', weightKg: 0.25, price: 105 },
        { unit: '500g', weightKg: 0.5, price: 210 },
        { unit: '1 Kg', weightKg: 1, price: 420 }
      ],
      sectionPrices: {},
      counter: 'Sweets',
      status: 'In Stock',
      subItems: []
    }
  ],
  diningTables: [
    { id: 1, name: 'D1', sectionId: 1, status: 'empty', currentCart: [], currentTokenNo: '1001', isSplit: false, createdAt: null },
    { id: 2, name: 'D2', sectionId: 1, status: 'empty', currentCart: [], currentTokenNo: '1002', isSplit: false, createdAt: null },
    { id: 3, name: 'D3', sectionId: 1, status: 'empty', currentCart: [], currentTokenNo: '1003', isSplit: false, createdAt: null },
    { id: 4, name: 'D4', sectionId: 1, status: 'empty', currentCart: [], currentTokenNo: '1004', isSplit: false, createdAt: null },
    { id: 5, name: 'D5', sectionId: 1, status: 'empty', currentCart: [], currentTokenNo: '1005', isSplit: false, createdAt: null },
    { id: 6, name: 'D6', sectionId: 1, status: 'empty', currentCart: [], currentTokenNo: '1006', isSplit: false, createdAt: null },
    { id: 7, name: 'D7', sectionId: 1, status: 'empty', currentCart: [], currentTokenNo: '1007', isSplit: false, createdAt: null },
    { id: 8, name: 'D8', sectionId: 1, status: 'empty', currentCart: [], currentTokenNo: '1008', isSplit: false, createdAt: null },
    { id: 9, name: 'F1', sectionId: 2, status: 'empty', currentCart: [], currentTokenNo: '1009', isSplit: false, createdAt: null },
    { id: 10, name: 'F2', sectionId: 2, status: 'empty', currentCart: [], currentTokenNo: '1010', isSplit: false, createdAt: null },
    { id: 11, name: 'F3', sectionId: 2, status: 'empty', currentCart: [], currentTokenNo: '1011', isSplit: false, createdAt: null },
    { id: 12, name: 'F4', sectionId: 2, status: 'empty', currentCart: [], currentTokenNo: '1012', isSplit: false, createdAt: null },
    { id: 13, name: 'F5', sectionId: 2, status: 'empty', currentCart: [], currentTokenNo: '1013', isSplit: false, createdAt: null },
    { id: 14, name: 'F6', sectionId: 2, status: 'empty', currentCart: [], currentTokenNo: '1014', isSplit: false, createdAt: null },
    { id: 15, name: 'AC1', sectionId: 3, status: 'empty', currentCart: [], currentTokenNo: '1015', isSplit: false, createdAt: null },
    { id: 16, name: 'AC2', sectionId: 3, status: 'empty', currentCart: [], currentTokenNo: '1016', isSplit: false, createdAt: null },
    { id: 17, name: 'AC3', sectionId: 3, status: 'empty', currentCart: [], currentTokenNo: '1017', isSplit: false, createdAt: null },
    { id: 18, name: 'AC4', sectionId: 3, status: 'empty', currentCart: [], currentTokenNo: '1018', isSplit: false, createdAt: null },
    { id: 19, name: 'AC5', sectionId: 3, status: 'empty', currentCart: [], currentTokenNo: '1019', isSplit: false, createdAt: null },
    { id: 20, name: 'P1', sectionId: 4, status: 'empty', currentCart: [], currentTokenNo: '1020', isSplit: false, createdAt: null },
    { id: 21, name: 'P2', sectionId: 4, status: 'empty', currentCart: [], currentTokenNo: '1021', isSplit: false, createdAt: null },
    { id: 22, name: 'P3', sectionId: 4, status: 'empty', currentCart: [], currentTokenNo: '1022', isSplit: false, createdAt: null },
    { id: 23, name: 'P4', sectionId: 4, status: 'empty', currentCart: [], currentTokenNo: '1023', isSplit: false, createdAt: null }
  ],
  bills: [],
  billLogs: [],
  rawMaterials: [
    { id: 1, name: 'Milk', quantity: 50, minThreshold: 10, unit: 'Kg' },
    { id: 2, name: 'Sugar', quantity: 30, minThreshold: 5, unit: 'Kg' },
    { id: 3, name: 'Rice Batter', quantity: 20, minThreshold: 5, unit: 'Kg' },
    { id: 4, name: 'Paneer', quantity: 15, minThreshold: 4, unit: 'Kg' },
    { id: 5, name: 'Cashew (Kaju)', quantity: 25, minThreshold: 5, unit: 'Kg' },
    { id: 6, name: 'Mawa / Khoya', quantity: 18, minThreshold: 4, unit: 'Kg' }
  ],
  recipes: [
    { id: 1, dishId: 1, rawMaterialId: 3, qtyRequired: 0.2 },
    { id: 2, dishId: 33, rawMaterialId: 1, qtyRequired: 0.5 },
    { id: 3, dishId: 33, rawMaterialId: 2, qtyRequired: 0.2 },
    { id: 4, dishId: 34, rawMaterialId: 5, qtyRequired: 0.6 },
    { id: 5, dishId: 34, rawMaterialId: 2, qtyRequired: 0.3 }
  ],
  systemSettings: {
    hotelName: 'Karuna Hotel',
    location: 'Solapur',
    phone: '8446091809',
    lastSyncTime: new Date().toISOString()
  }
};

// In-memory Database State
let dbState = JSON.parse(JSON.stringify(DEFAULT_DATABASE_DATA));

// Clean and deduplicate recipes (eliminates double-entries and orphaned recipes without dishId)
export function cleanAndDeduplicateRecipes(recipes = []) {
  if (!Array.isArray(recipes)) return [];
  const result = [];
  for (const r of recipes) {
    if (!r || !r.dishId) continue;
    const rmName = (r.rawMaterialName || '').trim().toLowerCase();
    const rmId = r.rawMaterialId !== undefined && r.rawMaterialId !== null && r.rawMaterialId !== '' ? String(r.rawMaterialId) : null;
    if (!rmId && !rmName) continue;

    const existingIdx = result.findIndex((item) => {
      if (String(item.dishId) !== String(r.dishId)) return false;
      const itemRmId = item.rawMaterialId !== undefined && item.rawMaterialId !== null && item.rawMaterialId !== '' ? String(item.rawMaterialId) : null;
      const itemRmName = (item.rawMaterialName || '').trim().toLowerCase();
      if (rmId && itemRmId && rmId === itemRmId) return true;
      if (rmName && itemRmName && rmName === itemRmName) return true;
      return false;
    });

    if (existingIdx === -1) {
      result.push({ ...r });
    } else {
      const existing = result[existingIdx];
      result[existingIdx] = {
        ...existing,
        ...r,
        id: existing.id || r.id,
        rawMaterialId: existing.rawMaterialId || r.rawMaterialId,
        rawMaterialName: existing.rawMaterialName || r.rawMaterialName,
        currentStock: (r.currentStock !== undefined && r.currentStock !== null && r.currentStock !== '')
          ? r.currentStock
          : existing.currentStock,
        qtyRequired: (r.qtyRequired !== undefined && r.qtyRequired !== null) ? r.qtyRequired : existing.qtyRequired,
        baseQty: (r.baseQty !== undefined && r.baseQty !== null) ? r.baseQty : existing.baseQty,
        unit: r.unit || existing.unit
      };
    }
  }
  return result;
}

// Clean, deduplicate and consolidate sections and tables
export function cleanAndDeduplicateSectionsAndTables(sections = [], tables = []) {
  if (!Array.isArray(sections)) sections = [];
  if (!Array.isArray(tables)) tables = [];

  const sectionMap = new Map();
  const sectionIdRedirect = new Map(); // oldId -> canonicalId

  // 1. Process and deduplicate sections by normalized name
  for (const sec of sections) {
    if (!sec || !sec.name) continue;
    const norm = String(sec.name).trim().toLowerCase();
    if (!sectionMap.has(norm)) {
      sectionMap.set(norm, { ...sec });
    } else {
      const canonical = sectionMap.get(norm);
      if (sec.id && canonical.id && String(sec.id) !== String(canonical.id)) {
        sectionIdRedirect.set(String(sec.id), canonical.id);
      }
    }
  }

  // Ensure default sections are present or mapped
  const defaultSections = DEFAULT_DATABASE_DATA.sections || [];
  defaultSections.forEach((defSec) => {
    const defNorm = String(defSec.name).trim().toLowerCase();
    let matched = null;
    for (const [norm, sec] of sectionMap.entries()) {
      if (
        norm === defNorm ||
        (defNorm.includes('dine') && norm.includes('dine')) ||
        (defNorm.includes('ac') && norm.includes('ac')) ||
        (defNorm.includes('first') && norm.includes('first')) ||
        (defNorm.includes('parcel') && norm.includes('parcel'))
      ) {
        matched = sec;
        break;
      }
    }

    if (matched) {
      if (String(defSec.id) !== String(matched.id)) {
        sectionIdRedirect.set(String(defSec.id), matched.id);
      }
    } else {
      sectionMap.set(defNorm, { ...defSec });
    }
  });

  const finalSections = Array.from(sectionMap.values());

  // 2. Re-map tables to canonical section IDs and deduplicate duplicate tables in same section
  const tableMap = new Map();
  for (const tbl of tables) {
    if (!tbl || !tbl.name) continue;
    let secId = tbl.sectionId;
    if (secId !== undefined && secId !== null && sectionIdRedirect.has(String(secId))) {
      secId = sectionIdRedirect.get(String(secId));
    }

    // If sectionId is still orphaned/invalid, attempt to infer from table name
    if (!finalSections.some((s) => String(s.id) === String(secId))) {
      const upperName = String(tbl.name).toUpperCase().trim();
      if (upperName.startsWith('D')) {
        const dSec = finalSections.find((s) => s.name.toLowerCase().includes('dine'));
        if (dSec) secId = dSec.id;
      } else if (upperName.startsWith('F')) {
        const fSec = finalSections.find((s) => s.name.toLowerCase().includes('first'));
        if (fSec) secId = fSec.id;
      } else if (upperName.startsWith('AC')) {
        const acSec = finalSections.find((s) => s.name.toLowerCase().includes('ac'));
        if (acSec) secId = acSec.id;
      } else if (upperName.startsWith('P') || tbl.isParcel) {
        const pSec = finalSections.find((s) => s.name.toLowerCase().includes('parcel'));
        if (pSec) secId = pSec.id;
      }
    }

    const isParcel = Boolean(
      tbl.isParcel ||
      String(tbl.name).toUpperCase().trim().startsWith('P') ||
      finalSections.find((s) => String(s.id) === String(secId) && s.name.toLowerCase().includes('parcel'))
    );

    const updatedTable = {
      ...tbl,
      sectionId: secId !== undefined && secId !== null ? secId : (finalSections[0]?.id || 1),
      isParcel
    };

    const key = `${updatedTable.sectionId}_${String(updatedTable.name).toUpperCase().trim()}`;
    if (!tableMap.has(key)) {
      tableMap.set(key, updatedTable);
    } else {
      const existing = tableMap.get(key);
      const updatedHasCart = (updatedTable.status === 'occupied' || updatedTable.status === 'bill_released') && updatedTable.currentCart?.length > 0;
      const existingHasCart = (existing.status === 'occupied' || existing.status === 'bill_released') && existing.currentCart?.length > 0;
      if (updatedHasCart && !existingHasCart) {
        tableMap.set(key, updatedTable);
      } else if (updatedHasCart && existingHasCart) {
        tableMap.set(key, { ...existing, ...updatedTable });
      }
    }
  }

  return {
    sections: finalSections,
    diningTables: Array.from(tableMap.values())
  };
}

// Auto-collapse empty split tables (e.g. D1-A and D1-B back to D1 when cleared/settled)
export function cleanAndPruneSplitTables(tables = []) {
  if (!Array.isArray(tables) || tables.length === 0) {
    return [];
  }

  let result = [...tables];

  // Find all split base names present in the CURRENT tables array
  const activeBaseNames = new Set();
  result.forEach((t) => {
    if (!t || !t.name) return;
    const raw = String(t.baseName || t.parentTable || t.name).trim();
    if (raw.includes('-')) {
      const base = raw.replace(/-[A-Z]$/i, '').trim().toUpperCase();
      if (base) activeBaseNames.add(base);
    } else if (t.isSplit && raw) {
      activeBaseNames.add(raw.toUpperCase());
    } else if (String(t.name).trim().match(/-[A-Z]$/i)) {
      const base = String(t.name).trim().replace(/-[A-Z]$/i, '').toUpperCase();
      if (base) activeBaseNames.add(base);
    }
  });

  activeBaseNames.forEach((baseName) => {
    const splitMatches = result.filter((t) => {
      if (!t || !t.name) return false;
      const upper = String(t.name).toUpperCase().trim();
      const parentUpper = t.parentTable ? String(t.parentTable).toUpperCase().trim() : '';
      const baseUpper = t.baseName ? String(t.baseName).toUpperCase().trim() : '';
      return upper === baseName || upper.startsWith(`${baseName}-`) || parentUpper === baseName || baseUpper === baseName;
    });

    if (splitMatches.length > 0) {
      const occupiedMatches = splitMatches.filter(
        (m) => m.status === 'occupied' || m.status === 'bill_released' || (m.currentCart && m.currentCart.length > 0)
      );

      // If NO split portion is occupied (all portions are settled or empty):
      // Collapse all back to a single normal base table (e.g. F1, C1, D1)
      if (occupiedMatches.length === 0) {
        result = result.filter((t) => {
          if (!t || !t.name) return false;
          const upper = String(t.name).toUpperCase().trim();
          const parentUpper = t.parentTable ? String(t.parentTable).toUpperCase().trim() : '';
          const baseUpper = t.baseName ? String(t.baseName).toUpperCase().trim() : '';
          return !(upper === baseName || upper.startsWith(`${baseName}-`) || parentUpper === baseName || baseUpper === baseName);
        });

        const defaultMatch = (DEFAULT_DATABASE_DATA.diningTables || []).find(
          (d) => d && d.name && d.name.toUpperCase() === baseName
        );
        const sampleWithBaseId = splitMatches.find((m) => m.baseTableId);
        const sampleA = splitMatches.find((m) => m.name && m.name.toUpperCase().endsWith('-A'));
        const firstNumericSample = splitMatches.find((m) => typeof m.id === 'number');
        const fallbackSample = splitMatches[0];

        const rawBaseId = (sampleWithBaseId && sampleWithBaseId.baseTableId) ||
          (defaultMatch && defaultMatch.id) ||
          (sampleA && sampleA.id) ||
          (firstNumericSample && firstNumericSample.id) ||
          fallbackSample.id;

        const baseId = !isNaN(parseInt(rawBaseId)) ? parseInt(rawBaseId) : rawBaseId;
        const sectionId = (defaultMatch && defaultMatch.sectionId) || fallbackSample.sectionId || 1;

        result.push({
          ...fallbackSample,
          id: baseId,
          name: baseName,
          sectionId: sectionId,
          status: 'empty',
          currentCart: [],
          currentTokenNo: (defaultMatch && defaultMatch.currentTokenNo) || (1000 + (parseInt(baseId) || 1)).toString(),
          isSplit: false,
          parentTable: null,
          baseName: null,
          baseTableId: null,
          customerName: '',
          pax: '1',
          waiter: 'Raju',
          lastPrintedCart: [],
          kotCount: 0,
          createdAt: null,
          parcelStatus: null
        });
      }
    }
  });

  return result;
}

export function ensureDefaultDiningTables(tables = []) {
  const defaults = DEFAULT_DATABASE_DATA.diningTables || [];
  if (!Array.isArray(tables) || tables.length === 0) {
    return JSON.parse(JSON.stringify(defaults));
  }

  // Clean and collapse empty/settled split tables back to base tables
  return cleanAndPruneSplitTables(tables);
}

// Load Database from Disk
export function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === 'object') {
        dbState = { ...DEFAULT_DATABASE_DATA, ...parsed };
      }
    } else {
      saveDatabaseSync();
    }
  } catch (err) {
    console.error('Error loading database file from disk:', err);
    dbState = JSON.parse(JSON.stringify(DEFAULT_DATABASE_DATA));
  }

  const cleaned = cleanAndDeduplicateSectionsAndTables(dbState.sections, dbState.diningTables);
  dbState.sections = cleaned.sections;
  dbState.diningTables = ensureDefaultDiningTables(cleaned.diningTables);
  dbState.recipes = cleanAndDeduplicateRecipes(dbState.recipes);
  saveDatabaseSync();
}

// Synchronous Save to Disk
export function saveDatabaseSync() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file to disk:', err);
  }
}

// Debounced Asynchronous Save to Disk
let saveTimer = null;
export function scheduleSaveDatabase() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to disk:', err);
    }
  }, 100);
}

// --- Generic CRUD Operations ---

export function getAllData() {
  if (dbState) {
    dbState.diningTables = ensureDefaultDiningTables(dbState.diningTables || []);
    dbState.recipes = cleanAndDeduplicateRecipes(dbState.recipes || []);
  }
  return dbState;
}

export function getCollection(collectionName) {
  if (collectionName === 'diningTables') {
    dbState.diningTables = ensureDefaultDiningTables(dbState.diningTables || []);
    return dbState.diningTables;
  }
  if (collectionName === 'recipes') {
    dbState.recipes = cleanAndDeduplicateRecipes(dbState.recipes || []);
    return dbState.recipes;
  }
  return dbState[collectionName] || [];
}

export function getById(collectionName, id) {
  const collection = getCollection(collectionName);
  return collection.find((item) => item && String(item.id) === String(id)) || null;
}

export function insertItem(collectionName, itemData) {
  if (!dbState[collectionName]) {
    dbState[collectionName] = [];
  }
  const collection = dbState[collectionName];

  // Prevent duplicate recipe mappings for the same dish & raw material
  if (collectionName === 'recipes' && itemData && itemData.dishId) {
    const rmName = (itemData.rawMaterialName || '').trim().toLowerCase();
    const existingIdx = collection.findIndex((r) => 
      r && String(r.dishId) === String(itemData.dishId) &&
      (
        (itemData.rawMaterialId && String(r.rawMaterialId) === String(itemData.rawMaterialId)) ||
        (rmName && r.rawMaterialName && String(r.rawMaterialName).trim().toLowerCase() === rmName)
      )
    );
    if (existingIdx !== -1) {
      collection[existingIdx] = {
        ...collection[existingIdx],
        ...itemData,
        id: collection[existingIdx].id
      };
      scheduleSaveDatabase();
      return collection[existingIdx];
    }
  }

  // Prevent duplicate dining table entries for the same name and section
  if (collectionName === 'diningTables' && itemData && itemData.name) {
    const existingIdx = collection.findIndex(
      (item) => item &&
      String(item.name).toUpperCase().trim() === String(itemData.name).toUpperCase().trim() &&
      String(item.sectionId) === String(itemData.sectionId)
    );
    if (existingIdx !== -1) {
      collection[existingIdx] = {
        ...collection[existingIdx],
        ...itemData,
        id: collection[existingIdx].id
      };
      scheduleSaveDatabase();
      return collection[existingIdx];
    }

    // If table exists in an orphaned section not in sections list, re-assign it to this section
    const orphanedIdx = collection.findIndex(
      (item) => item &&
      String(item.name).toUpperCase().trim() === String(itemData.name).toUpperCase().trim() &&
      (!dbState.sections || !dbState.sections.some((s) => String(s.id) === String(item.sectionId)))
    );
    if (orphanedIdx !== -1) {
      collection[orphanedIdx] = {
        ...collection[orphanedIdx],
        ...itemData,
        id: collection[orphanedIdx].id,
        sectionId: itemData.sectionId
      };
      scheduleSaveDatabase();
      return collection[orphanedIdx];
    }
  }

  // If itemData has an id that already exists in collection, update instead of duplicating
  if (itemData && itemData.id !== undefined && itemData.id !== null) {
    const existingIdx = collection.findIndex((item) => item && String(item.id) === String(itemData.id));
    if (existingIdx !== -1) {
      collection[existingIdx] = {
        ...collection[existingIdx],
        ...itemData
      };
      scheduleSaveDatabase();
      return collection[existingIdx];
    }
  }

  let newId = 1;
  if (collection.length > 0) {
    const maxId = collection.reduce((max, item) => (item && typeof item.id === 'number' && item.id > max ? item.id : max), 0);
    newId = maxId + 1;
  }

  const newItem = { ...itemData, id: itemData.id || newId };
  collection.push(newItem);
  scheduleSaveDatabase();
  return newItem;
}

export function updateItem(collectionName, id, updatedFields) {
  if (!dbState[collectionName]) dbState[collectionName] = [];
  const collection = dbState[collectionName];
  let index = collection.findIndex((item) => item && String(item.id) === String(id));
  if (index === -1 && collectionName === 'diningTables' && updatedFields?.name) {
    index = collection.findIndex((item) => item && String(item.name).toUpperCase() === String(updatedFields.name).toUpperCase());
  }
  if (index === -1) {
    // Prevent creating invalid broken recipes without dishId
    if (collectionName === 'recipes' && !updatedFields?.dishId) {
      return null;
    }
    const numId = parseInt(id) || (collection.length + 1);
    const created = { id: numId, ...updatedFields };
    collection.push(created);
    scheduleSaveDatabase();
    return created;
  }
  collection[index] = { ...collection[index], ...updatedFields };
  scheduleSaveDatabase();
  return collection[index];
}

export function deleteItem(collectionName, id) {
  if (!dbState[collectionName]) return false;
  const initialLength = dbState[collectionName].length;
  dbState[collectionName] = dbState[collectionName].filter((item) => {
    if (!item) return false;
    if (String(item.id) === String(id)) return false;
    if (collectionName === 'diningTables' && item.name && String(item.name).toUpperCase().trim() === String(id).toUpperCase().trim()) return false;
    return true;
  });
  const changed = dbState[collectionName].length !== initialLength;
  if (changed) scheduleSaveDatabase();
  return changed;
}

export function bulkAddItems(collectionName, items) {
  if (!dbState[collectionName]) {
    dbState[collectionName] = [];
  }
  if (!Array.isArray(items)) return [];
  const added = [];
  for (const item of items) {
    added.push(insertItem(collectionName, item));
  }
  return added;
}

export function clearCollection(collectionName) {
  dbState[collectionName] = [];
  scheduleSaveDatabase();
  return true;
}

// Parse item weight in Kg
// Parse item weight in Kg (accurately parses weightKg, custom Kg, grams, or regular unit qty)
export function parseItemWeightInKg(item) {
  if (item.weightKg !== undefined && item.weightKg !== null && !isNaN(parseFloat(item.weightKg))) {
    return parseFloat(item.weightKg);
  }
  const unitStr = (item.unit || '').toLowerCase().trim();
  if (unitStr.includes('kg')) {
    const num = parseFloat(unitStr.replace('kg', '').trim());
    return isNaN(num) ? 1 : num;
  }
  if (unitStr.includes('g') && !unitStr.includes('kg')) {
    const num = parseFloat(unitStr.replace('g', '').trim());
    return isNaN(num) ? 1 : num / 1000;
  }
  return 1;
}

// Atomic Transaction: Bill Settlement (Creates Bill + Deducts Raw Materials & Dish Stock + Clears Table)
export function settleBillTransaction(billData) {
  if (!dbState.bills) dbState.bills = [];
  
  // 1. Generate new Bill ID
  let newBillId = 1;
  if (dbState.bills.length > 0) {
    const maxBillId = dbState.bills.reduce((max, b) => (b && b.id > max ? b.id : max), 0);
    newBillId = maxBillId + 1;
  }

  const billTotal = parseFloat(billData.total !== undefined ? billData.total : (billData.finalTotal || billData.grandTotal || 0)) || 0;
  const newBill = {
    ...billData,
    id: newBillId,
    total: billData.total !== undefined ? billData.total : billTotal,
    finalTotal: billData.finalTotal !== undefined ? billData.finalTotal : billTotal,
    grandTotal: billData.grandTotal !== undefined ? billData.grandTotal : billTotal,
    paymentMode: billData.paymentMode || billData.paymentDetails?.mode || 'Cash',
    status: 'settled',
    createdAt: billData.createdAt || new Date().toISOString()
  };
  dbState.bills.push(newBill);

  // 2. Deduct Dish Finished Stock Inventory (Raw materials were already deducted upon dish integration)
  const dishes = dbState.dishes || [];

  if (Array.isArray(billData.items)) {
    for (const item of billData.items) {
      const unitWeight = parseItemWeightInKg(item);
      const qtyCount = parseFloat(item.qty) || 1;
      const totalSoldKg = Math.round(unitWeight * qtyCount * 1000) / 1000;

      // Deduct Finished Dish Stock Only
      const matchedDish = dishes.find((d) => d && (d.id === item.id || d.srNo === item.srNo || (d.name && item.name && d.name.toLowerCase().trim() === item.name.toLowerCase().trim())));
      if (matchedDish && matchedDish.stockQty !== undefined) {
        let totalSold = totalSoldKg;
        const stockUnit = (matchedDish.stockUnit || '').toLowerCase();
        if (stockUnit === 'per plate' || stockUnit === 'plate') {
          totalSold = (item.weightKg !== undefined && item.weightKg !== null && !isNaN(parseFloat(item.weightKg)))
            ? Math.round(parseFloat(item.weightKg) * qtyCount * 1000) / 1000
            : qtyCount;
        }
        matchedDish.stockQty = Math.max(0, Math.round(((matchedDish.stockQty || 0) - totalSold) * 1000) / 1000);
        matchedDish.status = matchedDish.stockQty > 0 ? 'In Stock' : 'Out of Stock';

        // Deduct Raw Materials based on dish recipe measurement ratio:
        // Full-batch only: Deduct if and only if cumulative sold reaches the set base quantity!
        dbState.recipes = cleanAndDeduplicateRecipes(dbState.recipes);
        const dishRecipes = (dbState.recipes || []).filter((r) => r && String(r.dishId) === String(matchedDish.id));
        if (dishRecipes.length > 0) {
          const baseQty = parseFloat(matchedDish.recipeBaseQty || (dishRecipes[0]?.baseQty) || 1) || 1;
          const prevAccum = parseFloat(matchedDish.accumulatedSold) || 0;
          const currentAccum = Math.round((prevAccum + totalSold) * 1000) / 1000;
          const batchesCompleted = Math.floor(Math.round(currentAccum * 1000) / Math.round(baseQty * 1000));
          matchedDish.accumulatedSold = Math.max(0, Math.round((currentAccum - (batchesCompleted * baseQty)) * 1000) / 1000);

          if (batchesCompleted >= 1) {
            for (const rec of dishRecipes) {
              const rmDeduction = Math.round(batchesCompleted * (parseFloat(rec.qtyRequired) || 0) * 1000) / 1000;
              const currentStock = (rec.currentStock !== undefined && rec.currentStock !== null)
                ? (parseFloat(rec.currentStock) || 0)
                : 10;

              rec.currentStock = Math.max(0, Math.round((currentStock - rmDeduction) * 1000) / 1000);
            }
          }
        }
      }
    }
  }

  // 3. Reset / Delete Dining Table
  let updatedTable = null;
  let deletedTableId = null;
  let deletedTableIds = [];
  let table = null;

  if (billData.tableId) {
    table = getById('diningTables', billData.tableId);
  }
  if (!table && billData.tableNo) {
    const allTables = getCollection('diningTables');
    table = allTables.find((t) => t && (
      String(t.name).toUpperCase().trim() === String(billData.tableNo).toUpperCase().trim() ||
      String(t.id) === String(billData.tableNo)
    )) || null;
  }

  if (table) {
    const isParcel = table.sectionId === 4 || (table.name && String(table.name).toUpperCase().startsWith('P')) || table.isParcel;
    const isSplit = Boolean(table.isSplit || (table.name && table.name.includes('-')) || table.parentTable || table.baseName);

    if (isParcel) {
      deleteItem('diningTables', table.id);
      deletedTableId = table.id;
    } else if (isSplit) {
      // Clear current split table
      table = updateItem('diningTables', table.id, {
        status: 'empty',
        currentCart: [],
        currentTokenNo: '',
        lastPrintedCart: [],
        kotCount: 0,
        createdAt: null,
        customerName: '',
        pax: '1',
        waiter: 'Raju'
      });

      const rawName = String(table.name || '').trim();
      const baseName = (table.baseName || table.parentTable || rawName.replace(/-[A-Z]$/i, '')).trim().toUpperCase();

      const allSplits = (dbState.diningTables || []).filter((t) => {
        if (!t || !t.name) return false;
        const u = String(t.name).toUpperCase().trim();
        const p = t.parentTable ? String(t.parentTable).toUpperCase().trim() : '';
        const b = t.baseName ? String(t.baseName).toUpperCase().trim() : '';
        return u === baseName || u.startsWith(`${baseName}-`) || p === baseName || b === baseName;
      });

      const anyOccupied = allSplits.some(
        (m) => m.status === 'occupied' || m.status === 'bill_released' || (m.currentCart && m.currentCart.length > 0)
      );

      if (!anyOccupied) {
        // ALL split portions are settled! Collapse back to single base table (e.g. F1, C1)
        const defaultMatch = (DEFAULT_DATABASE_DATA.diningTables || []).find((d) => d && d.name && d.name.toUpperCase() === baseName);
        const sampleWithBaseId = allSplits.find((m) => m.baseTableId);
        const sampleA = allSplits.find((m) => m.name && m.name.toUpperCase().endsWith('-A'));
        const firstNumeric = allSplits.find((m) => typeof m.id === 'number');
        const fallback = allSplits[0] || table;

        const rawBaseId = (sampleWithBaseId && sampleWithBaseId.baseTableId) ||
          (defaultMatch && defaultMatch.id) ||
          (sampleA && sampleA.id) ||
          (firstNumeric && firstNumeric.id) ||
          fallback.id;
        const baseId = !isNaN(parseInt(rawBaseId)) ? parseInt(rawBaseId) : rawBaseId;
        const sectionId = (defaultMatch && defaultMatch.sectionId) || fallback.sectionId || 1;

        // Delete extra split child rows
        const idsToDelete = allSplits.filter((s) => s.id !== baseId).map((s) => s.id);
        idsToDelete.forEach((id) => deleteItem('diningTables', id));
        deletedTableIds = idsToDelete;
        if (idsToDelete.includes(table.id)) {
          deletedTableId = table.id;
        }

        const restoredTable = {
          ...fallback,
          id: baseId,
          name: baseName,
          sectionId: sectionId,
          status: 'empty',
          currentCart: [],
          currentTokenNo: (defaultMatch && defaultMatch.currentTokenNo) || (1000 + (parseInt(baseId) || 1)).toString(),
          isSplit: false,
          parentTable: null,
          baseName: null,
          baseTableId: null,
          customerName: '',
          pax: '1',
          waiter: 'Raju',
          lastPrintedCart: [],
          kotCount: 0,
          createdAt: null
        };

        const existingBaseIdx = (dbState.diningTables || []).findIndex((t) => t && t.id === baseId);
        if (existingBaseIdx !== -1) {
          dbState.diningTables[existingBaseIdx] = restoredTable;
        } else {
          dbState.diningTables.push(restoredTable);
        }
        updatedTable = restoredTable;
      } else {
        updatedTable = table;
      }
    } else {
      updatedTable = updateItem('diningTables', table.id, {
        status: 'empty',
        currentCart: [],
        currentTokenNo: '',
        lastPrintedCart: [],
        kotCount: 0,
        createdAt: null,
        customerName: '',
        pax: '1',
        waiter: 'Raju'
      });
    }
  }

  // Guarantee valid default dining tables & persist
  dbState.diningTables = ensureDefaultDiningTables(dbState.diningTables);
  dbState.recipes = cleanAndDeduplicateRecipes(dbState.recipes);

  saveDatabaseSync();

  return {
    bill: newBill,
    rawMaterials: dbState.rawMaterials,
    recipes: dbState.recipes,
    dishes: dbState.dishes,
    updatedTable,
    deletedTableId,
    deletedTableIds
  };
}

// Helper to match dish by srNo, ID, English Name, or Marathi Name
export function matchDish(dish, item) {
  if (!dish || !item) return false;
  if (item.srNo !== undefined && dish.srNo !== undefined && String(dish.srNo).trim() === String(item.srNo).trim()) {
    return true;
  }
  if (item.srNo !== undefined && dish.id !== undefined && String(dish.id).trim() === String(item.srNo).trim()) {
    return true;
  }
  if (item.id !== undefined && dish.id !== undefined && String(dish.id).trim() === String(item.id).trim()) {
    return true;
  }
  if (item.name && dish.name && dish.name.toLowerCase().trim() === item.name.toLowerCase().trim()) {
    return true;
  }
  if (item.marathiName && dish.marathiName && dish.marathiName.trim() === item.marathiName.trim()) {
    return true;
  }
  return false;
}

// Bulk update dish prices
export function bulkUpdateDishPrices(items) {
  if (!Array.isArray(items)) return [];
  if (!Array.isArray(dbState.dishes)) dbState.dishes = [];
  const updatedDishes = [];

  for (const item of items) {
    const dish = dbState.dishes.find((d) => matchDish(d, item));
    if (dish) {
      const oldPrice = parseFloat(dish.price) || 0;
      const newPrice = (item.price !== undefined && !isNaN(parseFloat(item.price))) ? parseFloat(item.price) : oldPrice;
      const priceDiff = newPrice - oldPrice;
      dish.price = newPrice;

      // 1. Update sectionPrices so POS Billing & Table Ordering reflect the new price!
      if (!dish.sectionPrices || typeof dish.sectionPrices !== 'object') {
        dish.sectionPrices = {};
      }
      const secKeys = Object.keys(dish.sectionPrices);
      if (secKeys.length > 0) {
        for (const secId of secKeys) {
          const oldSecPrice = parseFloat(dish.sectionPrices[secId]);
          if (!isNaN(oldSecPrice)) {
            if (oldSecPrice === oldPrice || secId === '1' || secId === '4') {
              dish.sectionPrices[secId] = newPrice;
            } else {
              dish.sectionPrices[secId] = Math.max(0, Math.round(oldSecPrice + priceDiff));
            }
          }
        }
      } else {
        dish.sectionPrices['1'] = newPrice;
      }

      // 2. Handle Multi-Price / Sweets items
      if (item.pricePerKg !== undefined && !isNaN(parseFloat(item.pricePerKg))) {
        dish.pricePerKg = parseFloat(item.pricePerKg);
        if (dish.hasMultiplePrices) {
          dish.variants = [
            { unit: '250g', weightKg: 0.25, price: Math.round(dish.pricePerKg * 0.25) },
            { unit: '500g', weightKg: 0.5, price: Math.round(dish.pricePerKg * 0.5) },
            { unit: '1 Kg', weightKg: 1, price: Math.round(dish.pricePerKg) }
          ];
          dish.price = Math.round(dish.pricePerKg * 0.25);
        }
      } else if (dish.hasMultiplePrices && newPrice !== oldPrice && oldPrice > 0) {
        dish.pricePerKg = Math.round(newPrice * 4);
        dish.variants = [
          { unit: '250g', weightKg: 0.25, price: Math.round(newPrice) },
          { unit: '500g', weightKg: 0.5, price: Math.round(newPrice * 2) },
          { unit: '1 Kg', weightKg: 1, price: Math.round(newPrice * 4) }
        ];
      }

      if (item.name) dish.name = item.name;
      if (item.marathiName) dish.marathiName = item.marathiName;
      updatedDishes.push(dish);
    } else {
      // BRAND NEW DISH IMPORTED VIA EXCEL
      if (!item.name && item.srNo === undefined) continue;

      const maxId = dbState.dishes.reduce((max, d) => Math.max(max, parseInt(d.id, 10) || 0), 0);
      const newId = maxId + 1;

      const maxSrNo = dbState.dishes.reduce((max, d) => Math.max(max, parseInt(d.srNo, 10) || 0), 100);
      const isSrNoTaken = item.srNo !== undefined && dbState.dishes.some(d => String(d.srNo) === String(item.srNo));
      const newSrNo = (item.srNo !== undefined && !isNaN(item.srNo) && !isSrNoTaken) ? item.srNo : (maxSrNo + 1);

      // Resolve category & subCategory
      let catId = 1;
      let subCatId = 1;

      if (item.category && Array.isArray(dbState.categories)) {
        const cMatch = dbState.categories.find(c =>
          c.name && (c.name.toLowerCase().includes(item.category.toLowerCase().trim()) || item.category.toLowerCase().trim().includes(c.name.toLowerCase()))
        );
        if (cMatch) catId = cMatch.id;
      }

      if (item.subCategory && Array.isArray(dbState.subCategories)) {
        const sMatch = dbState.subCategories.find(s =>
          s.name && (s.name.toLowerCase().includes(item.subCategory.toLowerCase().trim()) || item.subCategory.toLowerCase().trim().includes(s.name.toLowerCase()))
        );
        if (sMatch) {
          subCatId = sMatch.id;
          if (sMatch.parentCategoryId) catId = sMatch.parentCategoryId;
        }
      } else if (Array.isArray(dbState.subCategories)) {
        const defaultSub = dbState.subCategories.find(s => s.parentCategoryId === catId);
        if (defaultSub) subCatId = defaultSub.id;
      }

      let hasMultiplePrices = item.pricePerKg !== undefined && !isNaN(parseFloat(item.pricePerKg)) && parseFloat(item.pricePerKg) > 0;
      let pricePerKg = hasMultiplePrices ? parseFloat(item.pricePerKg) : null;
      let newPrice = (item.price !== undefined && !isNaN(parseFloat(item.price))) ? parseFloat(item.price) : 0;
      if (hasMultiplePrices && (!newPrice || newPrice === 0)) {
        newPrice = Math.round(pricePerKg * 0.25);
      }

      let variants = [];
      if (hasMultiplePrices) {
        variants = [
          { unit: '250g', weightKg: 0.25, price: Math.round(pricePerKg * 0.25) },
          { unit: '500g', weightKg: 0.5, price: Math.round(pricePerKg * 0.5) },
          { unit: '1 Kg', weightKg: 1, price: Math.round(pricePerKg) }
        ];
      }

      let counter = item.counter || (catId === 2 || hasMultiplePrices ? 'Sweets' : 'Breakfast');

      // Initialize sectionPrices
      const sectionPrices = {
        '1': newPrice,
        '4': newPrice
      };
      if (Array.isArray(dbState.sections) && dbState.sections.length > 0) {
        for (const sec of dbState.sections) {
          const extra = parseFloat(sec.extraCharge) || 0;
          sectionPrices[sec.id] = newPrice + extra;
        }
      } else {
        sectionPrices['2'] = newPrice;
        sectionPrices['3'] = newPrice;
      }

      const newDish = {
        id: newId,
        srNo: newSrNo,
        name: item.name || `Dish ${newSrNo}`,
        marathiName: item.marathiName || '',
        categoryId: catId,
        subCategoryId: subCatId,
        price: newPrice,
        pricePerKg: pricePerKg,
        hasMultiplePrices: hasMultiplePrices,
        variants: variants,
        sectionPrices: sectionPrices,
        counter: counter,
        status: 'In Stock',
        stockQty: 30,
        subItems: []
      };

      dbState.dishes.push(newDish);
      updatedDishes.push(newDish);
    }
  }
  saveDatabaseSync();
  return updatedDishes;
}

// Full Database Backup & Restore
export function getFullBackup() {
  return {
    version: 3,
    appName: 'KarunaPOS',
    exportedAt: new Date().toISOString(),
    ...dbState
  };
}

export function restoreFullBackup(backupData) {
  if (!backupData || typeof backupData !== 'object') {
    throw new Error('Invalid backup data format');
  }

  const actualData = (backupData.data && typeof backupData.data === 'object' && !Array.isArray(backupData.data))
    ? backupData.data
    : backupData;

  const collections = [
    'categories',
    'subCategories',
    'dishes',
    'sections',
    'diningTables',
    'bills',
    'billLogs',
    'rawMaterials',
    'recipes'
  ];

  for (const key of collections) {
    if (Array.isArray(actualData[key])) {
      dbState[key] = actualData[key];
    }
  }

  if (actualData.systemSettings) {
    dbState.systemSettings = actualData.systemSettings;
  }

  dbState.diningTables = ensureDefaultDiningTables(dbState.diningTables);
  saveDatabaseSync();
  return dbState;
}

// 11. Batch Sync Offline Bills (When a counter reconnects after offline work or power cut)
export function syncOfflineBillsBatch(offlineBills = [], occupiedTables = []) {
  if (Array.isArray(occupiedTables) && occupiedTables.length > 0) {
    for (const occTbl of occupiedTables) {
      if (occTbl && occTbl.id) {
        updateItem('diningTables', occTbl.id, occTbl);
      }
    }
  }

  if (!Array.isArray(offlineBills) || offlineBills.length === 0) {
    return { syncedCount: 0, syncedBills: [], rawMaterials: dbState.rawMaterials, dishes: dbState.dishes };
  }

  const existingBills = dbState.bills || [];
  const existingIds = new Set(existingBills.map((b) => b && String(b.id)));
  const existingInvNos = new Set(existingBills.map((b) => b && b.invoiceNo && String(b.invoiceNo)));

  const syncedBills = [];
  const dishes = dbState.dishes || [];

  for (const billData of offlineBills) {
    if (!billData) continue;
    
    // Check if already synced via unique Bill ID or Invoice Number
    const idStr = String(billData.id);
    const invStr = billData.invoiceNo ? String(billData.invoiceNo) : null;

    if (existingIds.has(idStr) || (invStr && existingInvNos.has(invStr))) {
      console.log(`⏩ [Offline Sync] Bill ${invStr || idStr} already in database, skipping duplicate.`);
      continue;
    }

    const billTotal = parseFloat(billData.total !== undefined ? billData.total : (billData.finalTotal || billData.grandTotal || 0)) || 0;
    const newBill = {
      ...billData,
      id: billData.id || Date.now() + Math.floor(Math.random() * 1000),
      total: billData.total !== undefined ? billData.total : billTotal,
      finalTotal: billData.finalTotal !== undefined ? billData.finalTotal : billTotal,
      grandTotal: billData.grandTotal !== undefined ? billData.grandTotal : billTotal,
      paymentMode: billData.paymentMode || billData.paymentDetails?.mode || 'Cash',
      status: 'settled',
      syncedAt: new Date().toISOString(),
      wasOffline: true
    };

    dbState.bills.push(newBill);
    existingIds.add(String(newBill.id));
    if (invStr) existingInvNos.add(invStr);
    syncedBills.push(newBill);

    // Deduct stock for synced items
    if (Array.isArray(billData.items)) {
      for (const item of billData.items) {
        const unitWeight = parseItemWeightInKg(item);
        const qtyCount = parseFloat(item.qty) || 1;
        const totalSoldKg = Math.round(unitWeight * qtyCount * 1000) / 1000;

        const matchedDish = dishes.find((d) => d && (d.id === item.id || d.srNo === item.srNo || (d.name && item.name && d.name.toLowerCase().trim() === item.name.toLowerCase().trim())));
        if (matchedDish && matchedDish.stockQty !== undefined) {
          let totalSold = totalSoldKg;
          const stockUnit = (matchedDish.stockUnit || '').toLowerCase();
          if (stockUnit === 'per plate' || stockUnit === 'plate') {
            totalSold = (item.weightKg !== undefined && item.weightKg !== null && !isNaN(parseFloat(item.weightKg)))
              ? Math.round(parseFloat(item.weightKg) * qtyCount * 1000) / 1000
              : qtyCount;
          }
          matchedDish.stockQty = Math.max(0, Math.round(((matchedDish.stockQty || 0) - totalSold) * 1000) / 1000);
          matchedDish.status = matchedDish.stockQty > 0 ? 'In Stock' : 'Out of Stock';

          // Deduct Raw Materials based on dish recipe measurement ratio
          const dishRecipes = (dbState.recipes || []).filter((r) => r && String(r.dishId) === String(matchedDish.id));
          const rawMaterials = dbState.rawMaterials || [];
          for (const rec of dishRecipes) {
            const rm = rawMaterials.find((m) => m && String(m.id) === String(rec.rawMaterialId));
            if (rm) {
              const baseQty = parseFloat(matchedDish.recipeBaseQty || rec.baseQty || 1) || 1;
              const rmDeduction = Math.round((totalSold / baseQty) * (parseFloat(rec.qtyRequired) || 0) * 1000) / 1000;
              rm.quantity = Math.max(0, Math.round(((rm.quantity || 0) - rmDeduction) * 1000) / 1000);
            }
          }
        }
      }
    }
  }

  if (syncedBills.length > 0) {
    scheduleSaveDatabase();
    console.log(`✅ [Offline Sync] Successfully synced ${syncedBills.length} offline bills into Master Database.`);
  }

  return {
    syncedCount: syncedBills.length,
    syncedBills,
    rawMaterials: dbState.rawMaterials,
    recipes: dbState.recipes,
    dishes: dbState.dishes
  };
}

// 12. Automated Hourly Backups
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export function createAutomatedBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `karuna_backup_${timestamp}.json`);
    const backupData = getFullBackup();
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    
    // Prune old backups (keep last 30 snapshots)
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('karuna_backup_') && f.endsWith('.json'))
      .map((f) => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 30) {
      files.slice(30).forEach((file) => {
        try { fs.unlinkSync(path.join(BACKUP_DIR, file.name)); } catch (e) {}
      });
    }

    return { success: true, file: backupPath, time: new Date().toISOString() };
  } catch (err) {
    console.error('Error creating automated backup:', err);
    return { success: false, error: err.message };
  }
}

// Hourly backup interval
setInterval(createAutomatedBackup, 1000 * 60 * 60);

// Initialize and save to disk on module load
loadDatabase();
saveDatabaseSync();
createAutomatedBackup();

