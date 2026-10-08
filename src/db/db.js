// Central Master Database Client with Real-Time LAN WebSocket Sync & Offline-First Dexie Storage
import Dexie from 'dexie';

// 1. Local Embedded Dexie Database for 100% Offline Survival
export const localDb = new Dexie('KarunaPOS_Local_Store');
localDb.version(1).stores({
  categories: 'id, name, srNo',
  subCategories: 'id, name, parentCategoryId',
  dishes: 'id, srNo, name, categoryId, subCategoryId, counter, status',
  sections: 'id, name',
  diningTables: 'id, name, sectionId, status',
  bills: 'id, tokenNo, invoiceNo, createdAt, status, counterId',
  billLogs: 'id, billId, timestamp',
  rawMaterials: 'id, name',
  recipes: 'id, dishId',
  systemSettings: 'id',
  offline_queue: 'id, invoiceNo, tokenNo, createdAt, counterId, synced'
});

// Full Default Initial Dataset
export const DEFAULT_INITIAL_DATA = {
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

    // Sweets with Per-Kg Base Rate
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

// --- Dynamic Server IP & Networking ---
export function getServerIp() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('server')) return params.get('server').trim();

    const saved = localStorage.getItem('karuna_server_ip');
    if (saved && saved.trim() !== '' && saved !== 'isServer' && saved !== '10.40.145.195') {
      return saved.trim();
    }

    if (window.location.hostname && window.location.hostname !== '') {
      return window.location.hostname;
    }
  }
  return '127.0.0.1';
}

export function setServerIp(ip) {
  if (typeof window !== 'undefined' && ip && ip.trim() !== '') {
    const cleanIp = ip.trim();
    localStorage.setItem('karuna_server_ip', cleanIp);
    if (window.electronAPI?.setServerIp) {
      window.electronAPI.setServerIp(cleanIp);
    }
    initWebSocketSync(true);
    flushOfflineQueue().then(() => {
      fetchAllDataFromServer();
    });
  }
}

export const getApiBase = () => {
  const ip = getServerIp();
  const port = 3001;
  return `http://${ip}:${port}/api`;
};

export const getWsUrl = () => {
  const ip = getServerIp();
  const port = 3001;
  return `ws://${ip}:${port}`;
};

// In-Memory Synchronized Cache
const dbCache = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));

// Event Listeners for Real-Time React Component Updates
const listeners = new Set();
export function subscribeToDatabase(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(eventType, payload) {
  listeners.forEach((listener) => {
    try {
      listener(eventType, payload, { ...dbCache });
    } catch (err) {
      console.error('Error notifying DB listener:', err);
    }
  });
}

// Connection Status State
let isServerConnected = false;
const connectionListeners = new Set();
export function subscribeToConnectionStatus(callback) {
  connectionListeners.add(callback);
  callback(isServerConnected);
  return () => connectionListeners.delete(callback);
}

function setConnectionStatus(status) {
  if (isServerConnected !== status) {
    isServerConnected = status;
    connectionListeners.forEach((fn) => fn(status));
  }
}

// Offline Queue Counter and Listeners
let offlineQueueCount = 0;
const offlineListeners = new Set();
export function subscribeToOfflineQueue(callback) {
  offlineListeners.add(callback);
  callback(offlineQueueCount);
  return () => offlineListeners.delete(callback);
}

function setOfflineQueueCount(count) {
  offlineQueueCount = count;
  offlineListeners.forEach((fn) => fn(count));
}

export async function refreshOfflineQueueCount() {
  try {
    const count = await localDb.offline_queue.count();
    setOfflineQueueCount(count);
    return count;
  } catch (e) {
    return 0;
  }
}

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

        const defaultMatch = (DEFAULT_INITIAL_DATA?.diningTables || []).find(
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
  const defaults = DEFAULT_INITIAL_DATA?.diningTables || [];
  if (!Array.isArray(tables) || tables.length === 0) {
    return JSON.parse(JSON.stringify(defaults));
  }

  // Clean and collapse empty/settled split tables back to base tables
  return cleanAndPruneSplitTables(tables);
}

// High-speed LAN table sync loop (guarantees instant table state refresh across all devices)
if (typeof window !== 'undefined') {
  setInterval(async () => {
    if (isServerConnected) {
      try {
        const res = await fetch(`${getApiBase()}/diningTables`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const guaranteed = ensureDefaultDiningTables(json.data);
            const hasChanged = JSON.stringify(dbCache.diningTables) !== JSON.stringify(guaranteed);
            if (hasChanged) {
              dbCache.diningTables = guaranteed;
              notifyListeners('UPDATE', { collection: 'diningTables' });
            }
          }
        }
      } catch (e) {}
    }
  }, 1200);
}

// WebSocket Connection Management
let wsClient = null;
let reconnectTimer = null;
let activeCounterIdentity = 'Counter 1 (Breakfast & Snacks)';

export function setTerminalIdentity(name) {
  activeCounterIdentity = name;
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    try {
      wsClient.send(JSON.stringify({
        type: 'REGISTER_TERMINAL',
        name: activeCounterIdentity,
        counterId: getCounterPrefix(activeCounterIdentity),
        mode: 'DesktopPOS'
      }));
    } catch (e) {}
  }
}

export function initWebSocketSync(forceReconnect = false) {
  if (typeof window === 'undefined') return;

  const wsUrl = getWsUrl();
  if (wsClient && (wsClient.readyState === WebSocket.OPEN || wsClient.readyState === WebSocket.CONNECTING)) {
    if (!forceReconnect && wsClient.url === wsUrl) {
      return;
    }
    try {
      wsClient.onclose = null;
      wsClient.onerror = null;
      wsClient.close();
    } catch (e) {}
    wsClient = null;
  }

  try {
    console.log('🔄 Connecting to Master Database Server over LAN:', wsUrl);
    wsClient = new WebSocket(wsUrl);

    wsClient.onopen = async () => {
      console.log('🟢 Connected to Master Database Server over LAN:', wsUrl);
      setConnectionStatus(true);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      
      // Register current terminal identity
      setTerminalIdentity(localStorage.getItem('karuna_active_counter') || activeCounterIdentity);

      // FIRST: Flush all offline bills and active counter table updates to Master Server!
      await flushOfflineQueue();

      // THEN: Fetch updated snapshot from Master Server (which now includes Counter Laptop's changes!)
      await fetchAllDataFromServer();
    };

    wsClient.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerBroadcast(msg);
      } catch (err) {
        console.error('Failed to parse server WebSocket message:', err);
      }
    };

    wsClient.onerror = () => {
      setConnectionStatus(false);
    };

    wsClient.onclose = () => {
      console.log('🔴 Disconnected from Master Server. Running in Local Offline Mode...');
      setConnectionStatus(false);
      wsClient = null;
      loadLocalDexieFallback();
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          initWebSocketSync();
        }, 3000);
      }
    };
  } catch (err) {
    console.error('Error initializing WebSocket sync:', err);
    setConnectionStatus(false);
  }
}

// Handle real-time broadcasts from Master Server
function handleServerBroadcast(msg) {
  if (!msg || typeof msg !== 'object') return;
  const { type, collection, data, id, bill, rawMaterials, recipes, dishes, updatedTable, deletedTableId } = msg;
  const targetId = id !== undefined ? id : (data?.id !== undefined ? data.id : null);

  switch (type) {
    case 'INSERT':
    case 'UPDATE':
      if (dbCache[collection] && data) {
        let idx = dbCache[collection].findIndex((i) => i && String(i.id) === String(data.id));
        if (idx === -1 && collection === 'diningTables' && data.name) {
          idx = dbCache[collection].findIndex((i) => i && String(i.name).toUpperCase().trim() === String(data.name).toUpperCase().trim());
        }
        if (idx !== -1) {
          dbCache[collection][idx] = { ...dbCache[collection][idx], ...data };
        } else {
          dbCache[collection].push(data);
        }
        if (collection === 'diningTables') {
          dbCache.diningTables = ensureDefaultDiningTables(dbCache.diningTables);
        }
        notifyListeners(type, { collection, data });
        localDb[collection]?.put(data).catch(() => {});
      }
      break;

    case 'DELETE':
      if (dbCache[collection] && targetId !== null) {
        dbCache[collection] = dbCache[collection].filter((i) => {
          if (!i) return false;
          if (String(i.id) === String(targetId)) return false;
          if (collection === 'diningTables' && i.name && String(i.name).toUpperCase().trim() === String(targetId).toUpperCase().trim()) return false;
          return true;
        });
        notifyListeners('DELETE', { collection, id: targetId, data });
        localDb[collection]?.delete(targetId).catch(() => {});
      }
      break;

    case 'BILL_SETTLED':
      const { bill, rawMaterials, recipes, dishes, updatedTable, deletedTableId, deletedTableIds, diningTables: syncTables } = msg;
      if (bill && dbCache.bills) {
        const bIdx = dbCache.bills.findIndex((b) => b && String(b.id) === String(bill.id));
        if (bIdx === -1) dbCache.bills.unshift(bill);
        else dbCache.bills[bIdx] = bill;
        localDb.bills.put(bill).catch(() => {});
      }
      if (rawMaterials && dbCache.rawMaterials) {
        dbCache.rawMaterials = rawMaterials;
      }
      if (recipes && dbCache.recipes) {
        dbCache.recipes = cleanAndDeduplicateRecipes(recipes);
        localDb.recipes?.bulkPut(dbCache.recipes).catch(() => {});
      }
      if (dishes && dbCache.dishes) {
        dbCache.dishes = dishes;
      }

      if (Array.isArray(syncTables)) {
        dbCache.diningTables = ensureDefaultDiningTables(syncTables);
        for (const tbl of dbCache.diningTables) {
          localDb.diningTables.put(tbl).catch(() => {});
        }
      } else {
        if (updatedTable && dbCache.diningTables) {
          const tIdx = dbCache.diningTables.findIndex((t) => t && String(t.id) === String(updatedTable.id));
          if (tIdx !== -1) {
            dbCache.diningTables[tIdx] = updatedTable;
          } else {
            dbCache.diningTables.push(updatedTable);
          }
          localDb.diningTables.put(updatedTable).catch(() => {});
        }
        if (deletedTableId && dbCache.diningTables) {
          dbCache.diningTables = dbCache.diningTables.filter((t) => t && String(t.id) !== String(deletedTableId));
          localDb.diningTables.delete(deletedTableId).catch(() => {});
        }
        if (Array.isArray(deletedTableIds) && dbCache.diningTables) {
          for (const dId of deletedTableIds) {
            dbCache.diningTables = dbCache.diningTables.filter((t) => t && String(t.id) !== String(dId));
            localDb.diningTables.delete(dId).catch(() => {});
          }
        }
        dbCache.diningTables = ensureDefaultDiningTables(dbCache.diningTables);
      }

      notifyListeners('BILL_SETTLED', { bill, rawMaterials, recipes: dbCache.recipes, dishes, updatedTable, deletedTableId, deletedTableIds, diningTables: dbCache.diningTables });
      break;

    case 'OFFLINE_BILLS_SYNCED':
      if (rawMaterials && dbCache.rawMaterials) dbCache.rawMaterials = rawMaterials;
      if (recipes && dbCache.recipes) {
        dbCache.recipes = cleanAndDeduplicateRecipes(recipes);
        localDb.recipes?.bulkPut(dbCache.recipes).catch(() => {});
      }
      if (dishes && dbCache.dishes) dbCache.dishes = dishes;
      if (Array.isArray(msg.syncedBills)) {
        msg.syncedBills.forEach((b) => {
          const idx = dbCache.bills.findIndex((x) => String(x.id) === String(b.id));
          if (idx === -1) dbCache.bills.unshift(b);
          localDb.bills.put(b).catch(() => {});
        });
      }
      notifyListeners('OFFLINE_BILLS_SYNCED', msg);
      break;

    case 'RELOAD_COLLECTION':
      if (dbCache[collection] && Array.isArray(data)) {
        dbCache[collection] = data;
        if (localDb[collection]) {
          localDb[collection].clear().then(() => {
            if (data.length > 0) localDb[collection].bulkPut(data);
          }).catch(() => {});
        }
        notifyListeners('RELOAD_COLLECTION', { collection, data });
      }
      break;

    case 'FULL_RESTORE':
      if (data && typeof data === 'object') {
        const actualData = (data.data && typeof data.data === 'object' && !Array.isArray(data.data))
          ? data.data
          : data;
        const collections = ['categories', 'subCategories', 'dishes', 'sections', 'diningTables', 'bills', 'billLogs', 'rawMaterials', 'recipes'];
        collections.forEach(async (key) => {
          if (Array.isArray(actualData[key])) {
            dbCache[key] = actualData[key];
            if (localDb[key]) {
              try {
                await localDb[key].clear();
                if (actualData[key].length > 0) {
                  await localDb[key].bulkPut(actualData[key]);
                }
              } catch (e) {}
            }
          }
        });
        if (actualData.systemSettings) {
          dbCache.systemSettings = actualData.systemSettings;
        }
        dbCache.diningTables = ensureDefaultDiningTables(dbCache.diningTables);
        notifyListeners('FULL_RESTORE', { data: { ...dbCache } });
      }
      break;

    case 'TERMINAL_ROSTER_UPDATE':
      notifyListeners('TERMINAL_ROSTER_UPDATE', msg.terminals);
      break;

    default:
      break;
  }
}

// Fetch entire database snapshot on initial connect
export async function fetchAllDataFromServer() {
  try {
    const res = await fetch(`${getApiBase()}/all-data`);
    const json = await res.json();
    if (json.success && json.data) {
      Object.keys(json.data).forEach((key) => {
        if (Array.isArray(json.data[key])) {
          const seen = new Set();
          dbCache[key] = json.data[key].filter((item) => {
            if (!item) return false;
            const idKey = item.id !== undefined ? String(item.id) : JSON.stringify(item);
            if (seen.has(idKey)) return false;
            seen.add(idKey);
            return true;
          });

          // Persist snapshot into local Dexie
          if (localDb[key]) {
            localDb[key].bulkPut(dbCache[key]).catch(() => {});
          }
        }
      });

      // Always guarantee default dining tables exist
      dbCache.diningTables = ensureDefaultDiningTables(dbCache.diningTables || []);

      notifyListeners('BOOTSTRAP', dbCache);
    }
  } catch (err) {
    console.warn('Master Server offline. Loading snapshot from local Dexie storage:', err);
    // Load local Dexie data
    await loadLocalDexieFallback();
  }
}

// Load data from local Dexie when offline
async function loadLocalDexieFallback() {
  try {
    const collections = ['categories', 'subCategories', 'dishes', 'sections', 'diningTables', 'bills', 'rawMaterials', 'recipes'];
    for (const key of collections) {
      if (localDb[key]) {
        const items = await localDb[key].toArray();
        if (items && items.length > 0) {
          dbCache[key] = items;
        }
      }
    }
    dbCache.diningTables = ensureDefaultDiningTables(dbCache.diningTables || []);
    await refreshOfflineQueueCount();
    notifyListeners('BOOTSTRAP', dbCache);
  } catch (e) {
    console.warn('Local Dexie fallback error:', e);
  }
}

// Flush/Sync offline queue to Master Server
export async function flushOfflineQueue() {
  try {
    const pending = await localDb.offline_queue.toArray();

    if (!pending || pending.length === 0) {
      setOfflineQueueCount(0);
      return { success: true, count: 0 };
    }

    console.log(`📤 [Sync] Sending ${pending.length} offline bills to Master Server...`);
    const res = await fetch(`${getApiBase()}/bills/sync-offline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bills: pending })
    });

    const json = await res.json();
    if (json.success) {
      console.log(`✅ [Sync] Successfully merged offline bills into Master Server!`);
      await localDb.offline_queue.clear();
      setOfflineQueueCount(0);

      if (json.rawMaterials) dbCache.rawMaterials = json.rawMaterials;
      if (json.dishes) dbCache.dishes = json.dishes;
      notifyListeners('OFFLINE_BILLS_SYNCED', { syncedCount: json.syncedCount || 0 });

      return { success: true, count: json.syncedCount || 0 };
    }
  } catch (err) {
    console.warn('Server offline, buffered bills remain safely stored in local queue:', err);
    await refreshOfflineQueueCount();
    return { success: false, error: err.message };
  }
}

// Ensure defaults helper
export async function ensureDatabaseDefaults() {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('karuna_server_ip') === '10.40.145.195') {
      localStorage.removeItem('karuna_server_ip');
    }
    if (window.electronAPI?.getServerIp) {
      try {
        const ip = await window.electronAPI.getServerIp();
        if (ip && ip !== 'localhost' && ip !== 'isServer' && ip !== '10.40.145.195' && ip.trim() !== '') {
          localStorage.setItem('karuna_server_ip', ip.trim());
        }
      } catch (e) {}
    }
  }
  await loadLocalDexieFallback();
  initWebSocketSync(true);
  await fetchAllDataFromServer();
  await refreshOfflineQueueCount();
  return { ...dbCache };
}

// Generic Collection Client
class CollectionClient {
  constructor(collectionName) {
    this.name = collectionName;
  }

  async toArray() {
    return dbCache[this.name] ? [...dbCache[this.name]] : [];
  }

  async get(id) {
    if (!dbCache[this.name]) return null;
    return dbCache[this.name].find((item) => String(item.id) === String(id)) || null;
  }

  async count() {
    return dbCache[this.name] ? dbCache[this.name].length : 0;
  }

  async add(itemData) {
    const localId = Date.now() + Math.floor(Math.random() * 1000);
    const newItem = { ...itemData, id: itemData.id || localId };

    if (!dbCache[this.name]) dbCache[this.name] = [];

    // Prevent duplicate recipe mappings for the same dish & raw material
    if (this.name === 'recipes' && newItem.dishId) {
      const rmName = (newItem.rawMaterialName || '').trim().toLowerCase();
      const existingIdx = dbCache.recipes.findIndex((r) => 
        r && String(r.dishId) === String(newItem.dishId) &&
        (
          (newItem.rawMaterialId && String(r.rawMaterialId) === String(newItem.rawMaterialId)) ||
          (rmName && r.rawMaterialName && String(r.rawMaterialName).trim().toLowerCase() === rmName)
        )
      );
      if (existingIdx !== -1) {
        dbCache.recipes[existingIdx] = {
          ...dbCache.recipes[existingIdx],
          ...newItem,
          id: dbCache.recipes[existingIdx].id
        };
        notifyListeners('UPDATE', { collection: 'recipes', data: dbCache.recipes[existingIdx] });
        localDb.recipes?.put(dbCache.recipes[existingIdx]).catch(() => {});
        return dbCache.recipes[existingIdx].id;
      }
    }

    // Prevent duplicate dining table entries for the same name and section in client cache
    if (this.name === 'diningTables' && newItem.name) {
      const existingIdx = dbCache.diningTables.findIndex(
        (t) => t &&
        String(t.name).toUpperCase().trim() === String(newItem.name).toUpperCase().trim() &&
        String(t.sectionId) === String(newItem.sectionId)
      );
      if (existingIdx !== -1) {
        dbCache.diningTables[existingIdx] = {
          ...dbCache.diningTables[existingIdx],
          ...newItem,
          id: dbCache.diningTables[existingIdx].id
        };
        notifyListeners('UPDATE', { collection: 'diningTables', data: dbCache.diningTables[existingIdx] });
        localDb.diningTables?.put(dbCache.diningTables[existingIdx]).catch(() => {});
        return dbCache.diningTables[existingIdx].id;
      }
    }

    // If item with this ID already exists, update instead of duplicating
    const existingById = dbCache[this.name].findIndex((i) => i && String(i.id) === String(newItem.id));
    if (existingById !== -1) {
      dbCache[this.name][existingById] = { ...dbCache[this.name][existingById], ...newItem };
      notifyListeners('UPDATE', { collection: this.name, data: dbCache[this.name][existingById] });
      localDb[this.name]?.put(dbCache[this.name][existingById]).catch(() => {});
      return newItem.id;
    }

    dbCache[this.name].push(newItem);
    notifyListeners('INSERT', { collection: this.name, data: newItem });
    localDb[this.name]?.put(newItem).catch(() => {});

    try {
      const res = await fetch(`${getApiBase()}/${this.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const json = await res.json();
      if (json.success && json.data) {
        const idx = dbCache[this.name].findIndex((i) => i.id === newItem.id);
        if (idx !== -1) dbCache[this.name][idx] = json.data;
        notifyListeners('INSERT', { collection: this.name, data: json.data });
        localDb[this.name]?.put(json.data).catch(() => {});
        return json.data.id;
      }
    } catch (err) {
      console.warn(`Local write fallback for ${this.name}:`, err);
      // Fallback: send via WebSocket only if HTTP write failed and WS is open
      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        try {
          wsClient.send(JSON.stringify({
            type: 'CLIENT_INSERT',
            collection: this.name,
            data: newItem
          }));
        } catch (e) {}
      }
    }

    return newItem.id;
  }

  async put(itemData) {
    if (!itemData || !itemData.id) return null;
    if (!dbCache[this.name]) dbCache[this.name] = [];

    const idx = dbCache[this.name].findIndex((i) => String(i.id) === String(itemData.id));
    if (idx !== -1) {
      dbCache[this.name][idx] = { ...dbCache[this.name][idx], ...itemData };
    } else {
      dbCache[this.name].push(itemData);
    }
    notifyListeners('UPDATE', { collection: this.name, data: itemData });
    localDb[this.name]?.put(itemData).catch(() => {});

    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      try {
        wsClient.send(JSON.stringify({
          type: 'CLIENT_UPDATE',
          collection: this.name,
          id: itemData.id,
          data: itemData
        }));
      } catch (e) {}
    }

    try {
      const res = await fetch(`${getApiBase()}/${this.name}/${itemData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const json = await res.json();
      if (json.success && json.data) {
        return json.data.id;
      }
    } catch (err) {
      console.warn(`Local put fallback for ${this.name}:`, err);
    }

    return itemData.id;
  }

  async update(id, updatedFields) {
    if (!dbCache[this.name]) dbCache[this.name] = [];
    let idx = dbCache[this.name].findIndex((i) => i && String(i.id) === String(id));
    if (idx === -1 && this.name === 'diningTables' && updatedFields?.name) {
      idx = dbCache[this.name].findIndex((i) => i && String(i.name).toUpperCase() === String(updatedFields.name).toUpperCase());
    }

    if (idx === -1) {
      // Prevent creating invalid broken recipes without dishId
      if (this.name === 'recipes' && !updatedFields?.dishId) {
        return 0;
      }
      const numId = parseInt(id) || (dbCache[this.name].length + 1);
      const newItem = { id: numId, ...updatedFields };
      dbCache[this.name].push(newItem);
      notifyListeners('UPDATE', { collection: this.name, data: newItem });
      localDb[this.name]?.put(newItem).catch(() => {});

      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        try {
          wsClient.send(JSON.stringify({
            type: 'CLIENT_UPDATE',
            collection: this.name,
            id: numId,
            data: newItem
          }));
        } catch (e) {}
      }

      try {
        await fetch(`${getApiBase()}/${this.name}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields)
        });
      } catch (err) {}
      return 1;
    }

    const merged = { ...dbCache[this.name][idx], ...updatedFields };
    dbCache[this.name][idx] = merged;
    notifyListeners('UPDATE', { collection: this.name, data: merged });
    localDb[this.name]?.put(merged).catch(() => {});

    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      try {
        wsClient.send(JSON.stringify({
          type: 'CLIENT_UPDATE',
          collection: this.name,
          id: id,
          data: merged
        }));
      } catch (e) {}
    }

    try {
      await fetch(`${getApiBase()}/${this.name}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.warn(`Local update fallback for ${this.name}:`, err);
    }

    return 1;
  }

  async delete(id) {
    if (!dbCache[this.name]) return 0;
    dbCache[this.name] = dbCache[this.name].filter((i) => {
      if (!i) return false;
      if (String(i.id) === String(id)) return false;
      if (this.name === 'diningTables' && i.name && String(i.name).toUpperCase().trim() === String(id).toUpperCase().trim()) return false;
      return true;
    });
    notifyListeners('DELETE', { collection: this.name, data: { id } });
    localDb[this.name]?.delete(id).catch(() => {});

    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      try {
        wsClient.send(JSON.stringify({
          type: 'CLIENT_DELETE',
          collection: this.name,
          id: id
        }));
      } catch (e) {}
    }

    try {
      await fetch(`${getApiBase()}/${this.name}/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn(`Local delete fallback for ${this.name}:`, err);
    }

    return 1;
  }

  async bulkAdd(items) {
    if (!Array.isArray(items)) return [];
    for (const item of items) {
      await this.add(item);
    }
  }

  async clear() {
    dbCache[this.name] = [];
    notifyListeners('RELOAD_COLLECTION', { collection: this.name, data: [] });
    localDb[this.name]?.clear().catch(() => {});
  }
}

// Helpers for Item Weights & Counter Invoice Sequences
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

export function getCounterPrefix(counterName) {
  const nameLower = (counterName || '').toLowerCase();
  if (nameLower.includes('counter 2') || nameLower.includes('sweets')) return 'C2';
  if (nameLower.includes('counter 3') || nameLower.includes('parcel')) return 'C3';
  if (nameLower.includes('owner') || nameLower.includes('server')) return 'M';
  return 'C1';
}

export function generateCounterInvoiceNo(counterName) {
  const prefix = getCounterPrefix(counterName);
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // e.g. 260904
  const storageKey = `karuna_seq_${prefix}_${dateStr}`;
  let seq = 101;
  if (typeof localStorage !== 'undefined') {
    seq = parseInt(localStorage.getItem(storageKey) || '100', 10) + 1;
    localStorage.setItem(storageKey, String(seq));
  } else {
    seq = Math.floor(100 + Math.random() * 900);
  }

  return `INV-${prefix}-${dateStr}-${seq}`;
}

// Master Unified DB Object
export const db = {
  categories: new CollectionClient('categories'),
  subCategories: new CollectionClient('subCategories'),
  dishes: new CollectionClient('dishes'),
  sections: new CollectionClient('sections'),
  diningTables: new CollectionClient('diningTables'),
  bills: new CollectionClient('bills'),
  billLogs: new CollectionClient('billLogs'),
  rawMaterials: new CollectionClient('rawMaterials'),
  recipes: new CollectionClient('recipes'),
  systemSettings: new CollectionClient('systemSettings'),

  settleBill: async (billData) => {
    // Generate counter-specific invoice number if missing
    const activeCounter = localStorage.getItem('karuna_active_counter') || activeCounterIdentity;
    const bTotal = parseFloat(billData.total !== undefined ? billData.total : (billData.finalTotal || billData.grandTotal || 0)) || 0;
    const finalBillData = {
      ...billData,
      total: billData.total !== undefined ? billData.total : bTotal,
      finalTotal: billData.finalTotal !== undefined ? billData.finalTotal : bTotal,
      grandTotal: billData.grandTotal !== undefined ? billData.grandTotal : bTotal,
      paymentMode: billData.paymentMode || billData.paymentDetails?.mode || 'Cash',
      counterId: getCounterPrefix(activeCounter),
      counterName: activeCounter,
      invoiceNo: billData.invoiceNo || generateCounterInvoiceNo(activeCounter),
      createdAt: billData.createdAt || new Date().toISOString()
    };

    // Try online settle first
    try {
      const res = await fetch(`${getApiBase()}/bills/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalBillData)
      });
      const json = await res.json();
      if (json.success) {
        if (json.rawMaterials) dbCache.rawMaterials = json.rawMaterials;
        if (json.dishes) dbCache.dishes = json.dishes;

        if (Array.isArray(json.diningTables)) {
          dbCache.diningTables = ensureDefaultDiningTables(json.diningTables);
          for (const tbl of dbCache.diningTables) {
            localDb.diningTables.put(tbl).catch(() => {});
          }
        } else {
          if (json.updatedTable && dbCache.diningTables) {
            const tIdx = dbCache.diningTables.findIndex((t) => t && String(t.id) === String(json.updatedTable.id));
            if (tIdx !== -1) {
              dbCache.diningTables[tIdx] = json.updatedTable;
            } else {
              dbCache.diningTables.push(json.updatedTable);
            }
            localDb.diningTables.put(json.updatedTable).catch(() => {});
          }
          if (json.deletedTableId && dbCache.diningTables) {
            dbCache.diningTables = dbCache.diningTables.filter((t) => t && String(t.id) !== String(json.deletedTableId));
            localDb.diningTables.delete(json.deletedTableId).catch(() => {});
          }
          if (Array.isArray(json.deletedTableIds) && dbCache.diningTables) {
            for (const dId of json.deletedTableIds) {
              dbCache.diningTables = dbCache.diningTables.filter((t) => t && String(t.id) !== String(dId));
              localDb.diningTables.delete(dId).catch(() => {});
            }
          }
          dbCache.diningTables = ensureDefaultDiningTables(dbCache.diningTables);
        }

        localDb.bills.put(json.bill).catch(() => {});
        notifyListeners('BILL_SETTLED', {
          bill: json.bill,
          rawMaterials: json.rawMaterials,
          dishes: json.dishes,
          updatedTable: json.updatedTable,
          deletedTableId: json.deletedTableId,
          deletedTableIds: json.deletedTableIds,
          diningTables: dbCache.diningTables
        });
        return json;
      }
    } catch (err) {
      console.warn('⚡ [Offline Billing Active] Master Server unreachable, saving bill locally:', err);
    }

    // --- Offline Local Billing Fallback (Power-Cut Resilient) ---
    const localBill = {
      ...finalBillData,
      id: finalBillData.id || Date.now() + Math.floor(Math.random() * 1000),
      status: 'settled',
      isOfflineQueued: true
    };

    // 1. Add to in-memory cache
    dbCache.bills.unshift(localBill);

    // 2. Add to persistent Dexie storage & offline queue
    try {
      await localDb.bills.put(localBill);
      await localDb.offline_queue.put({
        ...localBill,
        queuedAt: new Date().toISOString(),
        synced: 0
      });
      await refreshOfflineQueueCount();
    } catch (e) {
      console.warn('Dexie queue error:', e);
    }

    // 3. Deduct dish stock locally
    if (Array.isArray(localBill.items)) {
      for (const item of localBill.items) {
        const unitWeight = parseItemWeightInKg(item);
        const qtyCount = parseFloat(item.qty) || 1;
        const totalSoldKg = Math.round(unitWeight * qtyCount * 1000) / 1000;

        const matchedDish = dbCache.dishes.find((d) => d && (d.id === item.id || d.srNo === item.srNo || (d.name && item.name && d.name.toLowerCase().trim() === item.name.toLowerCase().trim())));
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

          // Deduct linked raw materials based on recipe measurement ratio:
          // Full-batch only: Deduct if and only if cumulative sold reaches the set base quantity!
          const dishRecipes = (dbCache.recipes || []).filter((r) => r && String(r.dishId) === String(matchedDish.id));
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
                localDb.recipes?.put(rec).catch(() => {});
              }
            }
          }
          localDb.dishes?.put(matchedDish).catch(() => {});
        }
      }
    }

    // 4. Reset table locally
    if (localBill.tableId) {
      const tIdx = dbCache.diningTables.findIndex((t) => String(t.id) === String(localBill.tableId));
      if (tIdx !== -1) {
        const t = dbCache.diningTables[tIdx];
        const isParcel = t.sectionId === 4 || (t.name && String(t.name).toUpperCase().startsWith('P')) || t.isParcel;
        if (isParcel) {
          dbCache.diningTables.splice(tIdx, 1);
          localDb.diningTables.delete(t.id).catch(() => {});
        } else {
          const clearedTable = {
            ...t,
            status: 'empty',
            currentCart: [],
            currentTokenNo: '',
            lastPrintedCart: [],
            kotCount: 0,
            createdAt: null,
            customerName: '',
            pax: '1',
            waiter: 'Raju'
          };
          dbCache.diningTables[tIdx] = clearedTable;
          localDb.diningTables.put(clearedTable).catch(() => {});
        }
      }
    }

    dbCache.diningTables = ensureDefaultDiningTables(dbCache.diningTables);
    for (const tbl of dbCache.diningTables) {
      localDb.diningTables.put(tbl).catch(() => {});
    }

    notifyListeners('BILL_SETTLED', { bill: localBill, rawMaterials: dbCache.rawMaterials, recipes: dbCache.recipes, dishes: dbCache.dishes, diningTables: dbCache.diningTables });
    return { success: true, bill: localBill, isOffline: true };
  },

  bulkUpdatePrices: async (items) => {
    if (!Array.isArray(items) || items.length === 0) return [];

    // Helper to match dish
    const matchDish = (dish, item) => {
      if (!dish || !item) return false;
      if (item.srNo !== undefined && dish.srNo !== undefined && String(dish.srNo).trim() === String(item.srNo).trim()) return true;
      if (item.srNo !== undefined && dish.id !== undefined && String(dish.id).trim() === String(item.srNo).trim()) return true;
      if (item.id !== undefined && dish.id !== undefined && String(dish.id).trim() === String(item.id).trim()) return true;
      if (item.name && dish.name && dish.name.toLowerCase().trim() === item.name.toLowerCase().trim()) return true;
      if (item.marathiName && dish.marathiName && dish.marathiName.trim() === item.marathiName.trim()) return true;
      return false;
    };

    // 1. Update in-memory cache immediately
    if (!dbCache.dishes) dbCache.dishes = [];
    const updated = [];

    for (const item of items) {
      const dish = dbCache.dishes.find(d => matchDish(d, item));
      if (dish) {
        const oldPrice = parseFloat(dish.price) || 0;
        const newPrice = (item.price !== undefined && !isNaN(parseFloat(item.price))) ? parseFloat(item.price) : oldPrice;
        const priceDiff = newPrice - oldPrice;
        dish.price = newPrice;

        // Propagate to sectionPrices so POS Billing & Tables immediately reflect new rates
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

        // Multi-price sweet items
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
        updated.push(dish);
      } else {
        // BRAND NEW DISH IMPORTED VIA EXCEL
        if (!item.name && item.srNo === undefined) continue;

        const maxId = dbCache.dishes.reduce((max, d) => Math.max(max, parseInt(d.id, 10) || 0), 0);
        const newId = maxId + 1;

        const maxSrNo = dbCache.dishes.reduce((max, d) => Math.max(max, parseInt(d.srNo, 10) || 0), 100);
        const isSrNoTaken = item.srNo !== undefined && dbCache.dishes.some(d => String(d.srNo) === String(item.srNo));
        const newSrNo = (item.srNo !== undefined && !isNaN(item.srNo) && !isSrNoTaken) ? item.srNo : (maxSrNo + 1);

        // Resolve category & subCategory
        let catId = 1;
        let subCatId = 1;

        if (item.category && Array.isArray(dbCache.categories)) {
          const cMatch = dbCache.categories.find(c =>
            c.name && (c.name.toLowerCase().includes(item.category.toLowerCase().trim()) || item.category.toLowerCase().trim().includes(c.name.toLowerCase()))
          );
          if (cMatch) catId = cMatch.id;
        }

        if (item.subCategory && Array.isArray(dbCache.subCategories)) {
          const sMatch = dbCache.subCategories.find(s =>
            s.name && (s.name.toLowerCase().includes(item.subCategory.toLowerCase().trim()) || item.subCategory.toLowerCase().trim().includes(s.name.toLowerCase()))
          );
          if (sMatch) {
            subCatId = sMatch.id;
            if (sMatch.parentCategoryId) catId = sMatch.parentCategoryId;
          }
        } else if (Array.isArray(dbCache.subCategories)) {
          const defaultSub = dbCache.subCategories.find(s => s.parentCategoryId === catId);
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
        if (Array.isArray(dbCache.sections) && dbCache.sections.length > 0) {
          for (const sec of dbCache.sections) {
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

        dbCache.dishes.push(newDish);
        updated.push(newDish);
      }
    }

    // 2. Persist updated dishes to Dexie
    if (localDb.dishes && updated.length > 0) {
      localDb.dishes.bulkPut(updated).catch(() => {});
    }

    // 3. Notify listeners so React components update immediately!
    notifyListeners('RELOAD_COLLECTION', { collection: 'dishes', data: dbCache.dishes });

    // 4. Send to server
    try {
      const res = await fetch(`${getApiBase()}/dishes/bulk-prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (err) {
      console.warn('Failed to bulk update prices on server (applied locally):', err);
    }
    return updated;
  },

  exportBackup: async () => {
    try {
      const res = await fetch(`${getApiBase()}/database/backup`);
      return await res.json();
    } catch (e) {
      return { ...dbCache };
    }
  },

  restoreBackup: async (backupData) => {
    if (!backupData || typeof backupData !== 'object') {
      return { success: false, error: 'Invalid backup data format' };
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

    // 1. Update In-Memory Cache
    for (const key of collections) {
      if (Array.isArray(actualData[key])) {
        dbCache[key] = JSON.parse(JSON.stringify(actualData[key]));
      }
    }
    if (actualData.systemSettings) {
      dbCache.systemSettings = JSON.parse(JSON.stringify(actualData.systemSettings));
    }
    dbCache.diningTables = ensureDefaultDiningTables(dbCache.diningTables);

    // 2. Persist to Dexie localDb (clear old seed data & bulk put all restored data)
    for (const key of collections) {
      if (localDb[key] && Array.isArray(dbCache[key])) {
        try {
          await localDb[key].clear();
          if (dbCache[key].length > 0) {
            await localDb[key].bulkPut(dbCache[key]);
          }
        } catch (err) {
          console.warn(`Error writing restored ${key} to localDb:`, err);
        }
      }
    }

    // 3. Immediately Notify React UI Listeners
    notifyListeners('FULL_RESTORE', { data: { ...dbCache } });

    // 4. Send to Master Server (if online)
    try {
      const res = await fetch(`${getApiBase()}/database/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualData)
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (err) {
      console.warn('Server offline during restore, restored to local offline storage:', err);
    }

    return { success: true, data: { ...dbCache } };
  },

  getCacheSnapshot: () => ({ ...dbCache })
};

// Section price helper
export function getDishPriceForSection(dish, sectionId) {
  if (!dish) return 0;
  if (dish.sectionPrices && sectionId && dish.sectionPrices[sectionId] !== undefined && dish.sectionPrices[sectionId] !== '') {
    const customRate = parseFloat(dish.sectionPrices[sectionId]);
    if (!isNaN(customRate) && customRate > 0) {
      return customRate;
    }
  }
  return dish.price || 0;
}
