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
  offline_queue: 'id, invoiceNo, tokenNo, createdAt, counterId, synced',
  preOrders: 'id, orderNo, customerName, customerPhone, deliveryDate, deliveryTime, status, createdAt'
});

// Full Default Initial Dataset
export const DEFAULT_INITIAL_DATA = {
  categories: [
    {
        "id": 1,
        "name": "Breakfast Division (नाश्ता)",
        "isFixed": true,
        "srNo": 1
    },
    {
        "id": 2,
        "name": "Sweets & Mithai Division (मिठाई)",
        "isFixed": true,
        "srNo": 2
    }
],
  subCategories: [
    {
        "id": 1,
        "name": "Snacks & Namkeen",
        "marathiName": "फरसाण आणि नमकीन",
        "parentCategoryId": 1,
        "srNo": 1
    },
    {
        "id": 2,
        "name": "Breakfast",
        "marathiName": "नाश्ता",
        "parentCategoryId": 1,
        "srNo": 2
    },
    {
        "id": 3,
        "name": "Dosa & Uttappa",
        "marathiName": "डोसा आणि उत्तप्पा",
        "parentCategoryId": 1,
        "srNo": 3
    },
    {
        "id": 4,
        "name": "Pav Bhaji & Meals",
        "marathiName": "पाव भाजी आणि जेवण",
        "parentCategoryId": 1,
        "srNo": 4
    },
    {
        "id": 5,
        "name": "Accompaniments",
        "marathiName": "सहपदार्थ / चटणी",
        "parentCategoryId": 1,
        "srNo": 5
    },
    {
        "id": 6,
        "name": "Tea & Beverages",
        "marathiName": "चहा आणि पेये",
        "parentCategoryId": 1,
        "srNo": 6
    },
    {
        "id": 7,
        "name": "Single Portions",
        "marathiName": "सिंगल पोर्शन्स",
        "parentCategoryId": 1,
        "srNo": 7
    },
    {
        "id": 8,
        "name": "Egg Dishes",
        "marathiName": "अंडीचे पदार्थ",
        "parentCategoryId": 1,
        "srNo": 8
    },
    {
        "id": 9,
        "name": "Sweets",
        "marathiName": "मिठाई",
        "parentCategoryId": 2,
        "srNo": 1
    }
],
  sections: [
    { id: 1, name: 'Dine In Area', extraCharge: 0, color: 'blue' },
    { id: 2, name: 'First Floor', extraCharge: 0, color: 'emerald' },
    { id: 3, name: 'AC Hall', extraCharge: 0, color: 'purple' },
    { id: 4, name: 'Parcels', extraCharge: 0, color: 'amber' },
    { id: 5, name: 'Sweets', extraCharge: 0, color: 'rose' }
  ],
  dishes: [
    {
        "id": 1,
        "srNo": 101,
        "name": "Puri Bhaji",
        "marathiName": "पुरी भाजी",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 75,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 75,
            "2": 75,
            "3": 85,
            "4": 75
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": [
            {
                "name": "4 Puris",
                "qty": "1 portion"
            },
            {
                "name": "Potato Bhaji",
                "qty": "1 bowl"
            }
        ]
    },
    {
        "id": 2,
        "srNo": 102,
        "name": "Upma",
        "marathiName": "उपमा",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 50,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 50,
            "2": 50,
            "3": 60,
            "4": 50
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 3,
        "srNo": 103,
        "name": "Poha",
        "marathiName": "पोहे",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": [
            {
                "name": "Sev & Lemon",
                "qty": "1"
            }
        ]
    },
    {
        "id": 4,
        "srNo": 104,
        "name": "Sheera",
        "marathiName": "शिरा",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 45,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 45,
            "2": 45,
            "3": 55,
            "4": 45
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 5,
        "srNo": 105,
        "name": "Idli",
        "marathiName": "इडली सांबार",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 50,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 50,
            "2": 50,
            "3": 60,
            "4": 50
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": [
            {
                "name": "2 Idlis",
                "qty": "1 plate"
            },
            {
                "name": "Sambar & Chutney",
                "qty": "1"
            }
        ]
    },
    {
        "id": 6,
        "srNo": 106,
        "name": "Idli Vada",
        "marathiName": "इडली वडा मिक्स",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 60,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 60,
            "2": 60,
            "3": 70,
            "4": 60
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": [
            {
                "name": "1 Idli 1 Vada",
                "qty": "1 plate"
            }
        ]
    },
    {
        "id": 7,
        "srNo": 107,
        "name": "Vada Sambar",
        "marathiName": "वडा सांबार",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 60,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 60,
            "2": 60,
            "3": 70,
            "4": 60
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": [
            {
                "name": "2 Vadas",
                "qty": "1 plate"
            }
        ]
    },
    {
        "id": 8,
        "srNo": 108,
        "name": "Sabudana Vada",
        "marathiName": "साबुदाणा वडा",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 70,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 70,
            "2": 70,
            "3": 80,
            "4": 70
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 9,
        "srNo": 109,
        "name": "Sabudana Khichdi",
        "marathiName": "साबुदाणा खिचडी",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 60,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 60,
            "2": 60,
            "3": 70,
            "4": 60
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": [
            {
                "name": "Curd",
                "qty": "1 bowl"
            }
        ]
    },
    {
        "id": 10,
        "srNo": 110,
        "name": "Dahi Vada",
        "marathiName": "दही वडा",
        "categoryId": 1,
        "subCategoryId": 2,
        "price": 70,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 70,
            "2": 70,
            "3": 80,
            "4": 70
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 11,
        "srNo": 111,
        "name": "Batata Chivda",
        "marathiName": "बटाटा चिवडा",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 40,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 40,
            "2": 40,
            "3": 45,
            "4": 40
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 12,
        "srNo": 112,
        "name": "Sabudana Chivda",
        "marathiName": "साबुदाणा चिवडा",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 40,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 40,
            "2": 40,
            "3": 45,
            "4": 40
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 13,
        "srNo": 113,
        "name": "Farsan",
        "marathiName": "फरसाण",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 14,
        "srNo": 114,
        "name": "Potato Wafers",
        "marathiName": "बटाटा वेफर्स",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 30,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 30,
            "2": 30,
            "3": 35,
            "4": 30
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 15,
        "srNo": 115,
        "name": "Papdi",
        "marathiName": "पापडी",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 16,
        "srNo": 116,
        "name": "Kachori",
        "marathiName": "कचोरी",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 40,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 40,
            "2": 40,
            "3": 45,
            "4": 40
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 17,
        "srNo": 117,
        "name": "Samosa",
        "marathiName": "समोसा",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 40,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 40,
            "2": 40,
            "3": 45,
            "4": 40
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 18,
        "srNo": 118,
        "name": "Dhokla",
        "marathiName": "ढोकळा",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 45,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 45,
            "2": 45,
            "3": 55,
            "4": 45
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 19,
        "srNo": 119,
        "name": "Batata Vada",
        "marathiName": "बटाटा वडा",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 40,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 40,
            "2": 40,
            "3": 45,
            "4": 40
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 20,
        "srNo": 120,
        "name": "Pakoda",
        "marathiName": "पकोडा",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 50,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 50,
            "2": 50,
            "3": 60,
            "4": 50
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 21,
        "srNo": 121,
        "name": "Bhaji",
        "marathiName": "कांदा भजी",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 50,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 50,
            "2": 50,
            "3": 60,
            "4": 50
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 22,
        "srNo": 122,
        "name": "Masala Sev",
        "marathiName": "मसाला शेव",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 23,
        "srNo": 123,
        "name": "Bhavnagari Sev",
        "marathiName": "भावनगरी शेव",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 24,
        "srNo": 124,
        "name": "Khara",
        "marathiName": "खारा",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 25,
        "srNo": 125,
        "name": "Sev",
        "marathiName": "शेव",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 30,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 30,
            "2": 30,
            "3": 35,
            "4": 30
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 26,
        "srNo": 126,
        "name": "Corn Chivda",
        "marathiName": "कॉर्न चिवडा",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 27,
        "srNo": 127,
        "name": "Boondi Namkeen",
        "marathiName": "बुंदी नमकीन",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 28,
        "srNo": 128,
        "name": "Bhakarwadi",
        "marathiName": "बाकरवडी",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 45,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 45,
            "2": 45,
            "3": 55,
            "4": 45
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 29,
        "srNo": 129,
        "name": "Shankarpali",
        "marathiName": "शंकरपाळी",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 40,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 40,
            "2": 40,
            "3": 45,
            "4": 40
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 30,
        "srNo": 130,
        "name": "Zero Sev",
        "marathiName": "झिरो शेव",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 31,
        "srNo": 131,
        "name": "Chakli",
        "marathiName": "चकली",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 40,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 40,
            "2": 40,
            "3": 45,
            "4": 40
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 32,
        "srNo": 132,
        "name": "Garlic Sev",
        "marathiName": "लसूण शेव",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 33,
        "srNo": 133,
        "name": "Ghati Sev",
        "marathiName": "घाटी शेव",
        "categoryId": 1,
        "subCategoryId": 1,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 35,
        "srNo": 141,
        "name": "Paper Dosa",
        "marathiName": "पेपर डोसा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 65,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 65,
            "2": 65,
            "3": 75,
            "4": 65
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 36,
        "srNo": 142,
        "name": "Masala Dosa",
        "marathiName": "मसाला डोसा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 70,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 70,
            "2": 70,
            "3": 80,
            "4": 70
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 37,
        "srNo": 143,
        "name": "Cheese Dosa",
        "marathiName": "चीज डोसा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 90,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 90,
            "2": 90,
            "3": 100,
            "4": 90
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 38,
        "srNo": 144,
        "name": "Paneer Butter Dosa",
        "marathiName": "पनीर बटर डोसा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 110,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 110,
            "2": 110,
            "3": 120,
            "4": 110
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 39,
        "srNo": 145,
        "name": "Butter Dosa",
        "marathiName": "बटर डोसा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 80,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 80,
            "2": 80,
            "3": 90,
            "4": 80
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 40,
        "srNo": 146,
        "name": "Palak Paneer Dosa",
        "marathiName": "पालक पनीर डोसा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 110,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 110,
            "2": 110,
            "3": 120,
            "4": 110
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 41,
        "srNo": 147,
        "name": "Uttappa",
        "marathiName": "उत्तप्पा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 65,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 65,
            "2": 65,
            "3": 75,
            "4": 65
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 42,
        "srNo": 148,
        "name": "Paneer Uttappa",
        "marathiName": "पनीर उत्तप्पा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 95,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 95,
            "2": 95,
            "3": 105,
            "4": 95
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 43,
        "srNo": 149,
        "name": "Butter Uttappa",
        "marathiName": "बटर उत्तप्पा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 80,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 80,
            "2": 80,
            "3": 90,
            "4": 80
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 44,
        "srNo": 150,
        "name": "Cheese Uttappa",
        "marathiName": "चीज उत्तप्पा",
        "categoryId": 1,
        "subCategoryId": 3,
        "price": 95,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 95,
            "2": 95,
            "3": 105,
            "4": 95
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 45,
        "srNo": 151,
        "name": "Pav Bhaji",
        "marathiName": "पाव भाजी",
        "categoryId": 1,
        "subCategoryId": 4,
        "price": 85,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 85,
            "2": 85,
            "3": 95,
            "4": 85
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 46,
        "srNo": 152,
        "name": "Paneer Pav Bhaji",
        "marathiName": "पनीर पाव भाजी",
        "categoryId": 1,
        "subCategoryId": 4,
        "price": 105,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 105,
            "2": 105,
            "3": 115,
            "4": 105
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 47,
        "srNo": 153,
        "name": "Cheese Pav Bhaji",
        "marathiName": "चीज पाव भाजी",
        "categoryId": 1,
        "subCategoryId": 4,
        "price": 110,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 110,
            "2": 110,
            "3": 120,
            "4": 110
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 48,
        "srNo": 154,
        "name": "Rice Plate",
        "marathiName": "राईस प्लेट",
        "categoryId": 1,
        "subCategoryId": 4,
        "price": 120,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 120,
            "2": 120,
            "3": 130,
            "4": 120
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 49,
        "srNo": 155,
        "name": "Dal Rice",
        "marathiName": "डाळ भात",
        "categoryId": 1,
        "subCategoryId": 4,
        "price": 75,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 75,
            "2": 75,
            "3": 85,
            "4": 75
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 50,
        "srNo": 156,
        "name": "Bhakri Rice Plate",
        "marathiName": "भाकरी राईस प्लेट",
        "categoryId": 1,
        "subCategoryId": 4,
        "price": 135,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 135,
            "2": 135,
            "3": 145,
            "4": 135
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 51,
        "srNo": 157,
        "name": "Usal",
        "marathiName": "उसळ",
        "categoryId": 1,
        "subCategoryId": 4,
        "price": 50,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 50,
            "2": 50,
            "3": 60,
            "4": 50
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 52,
        "srNo": 158,
        "name": "Koshimbir",
        "marathiName": "कोशिंबीर",
        "categoryId": 1,
        "subCategoryId": 4,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 53,
        "srNo": 161,
        "name": "Curd",
        "marathiName": "दही",
        "categoryId": 1,
        "subCategoryId": 5,
        "price": 25,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 25,
            "2": 25,
            "3": 30,
            "4": 25
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 54,
        "srNo": 162,
        "name": "Peanut Chutney",
        "marathiName": "शेंगदाणा चटणी",
        "categoryId": 1,
        "subCategoryId": 5,
        "price": 20,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 20,
            "2": 20,
            "3": 25,
            "4": 20
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 55,
        "srNo": 163,
        "name": "Chutney",
        "marathiName": "चटणी",
        "categoryId": 1,
        "subCategoryId": 5,
        "price": 15,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 15,
            "2": 15,
            "3": 20,
            "4": 15
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 56,
        "srNo": 164,
        "name": "Papad",
        "marathiName": "पापड",
        "categoryId": 1,
        "subCategoryId": 5,
        "price": 15,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 15,
            "2": 15,
            "3": 20,
            "4": 15
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 57,
        "srNo": 165,
        "name": "Pav",
        "marathiName": "पाव",
        "categoryId": 1,
        "subCategoryId": 5,
        "price": 15,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 15,
            "2": 15,
            "3": 20,
            "4": 15
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 58,
        "srNo": 166,
        "name": "Butter Pav",
        "marathiName": "बटर पाव",
        "categoryId": 1,
        "subCategoryId": 5,
        "price": 25,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 25,
            "2": 25,
            "3": 30,
            "4": 25
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 59,
        "srNo": 167,
        "name": "Butter",
        "marathiName": "बटर",
        "categoryId": 1,
        "subCategoryId": 5,
        "price": 20,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 20,
            "2": 20,
            "3": 25,
            "4": 20
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 60,
        "srNo": 168,
        "name": "Cheese",
        "marathiName": "चीज",
        "categoryId": 1,
        "subCategoryId": 5,
        "price": 25,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 25,
            "2": 25,
            "3": 30,
            "4": 25
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 61,
        "srNo": 169,
        "name": "Masala Shev",
        "marathiName": "मसाला शेव",
        "categoryId": 1,
        "subCategoryId": 5,
        "price": 20,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 20,
            "2": 20,
            "3": 25,
            "4": 20
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 62,
        "srNo": 171,
        "name": "Tea",
        "marathiName": "चहा",
        "categoryId": 1,
        "subCategoryId": 6,
        "price": 15,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 15,
            "2": 15,
            "3": 20,
            "4": 15
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 63,
        "srNo": 172,
        "name": "Special Tea",
        "marathiName": "स्पेशल चहा",
        "categoryId": 1,
        "subCategoryId": 6,
        "price": 20,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 20,
            "2": 20,
            "3": 25,
            "4": 20
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 64,
        "srNo": 173,
        "name": "Nescafe Coffee",
        "marathiName": "नेस्कॅफे कॉफी",
        "categoryId": 1,
        "subCategoryId": 6,
        "price": 30,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 30,
            "2": 30,
            "3": 35,
            "4": 30
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 65,
        "srNo": 174,
        "name": "Masala Milk",
        "marathiName": "मसाला दूध",
        "categoryId": 1,
        "subCategoryId": 6,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 66,
        "srNo": 175,
        "name": "Lassi",
        "marathiName": "लस्सी",
        "categoryId": 1,
        "subCategoryId": 6,
        "price": 40,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 40,
            "2": 40,
            "3": 45,
            "4": 40
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 67,
        "srNo": 176,
        "name": "Bisleri Water 500 ml",
        "marathiName": "बिसलेरी वॉटर ५०० मिली",
        "categoryId": 1,
        "subCategoryId": 6,
        "price": 10,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 10,
            "2": 10,
            "3": 15,
            "4": 10
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 68,
        "srNo": 177,
        "name": "Bisleri Water 1 L",
        "marathiName": "बिसलेरी वॉटर १ लिटर",
        "categoryId": 1,
        "subCategoryId": 6,
        "price": 20,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 20,
            "2": 20,
            "3": 25,
            "4": 20
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 69,
        "srNo": 178,
        "name": "Bisleri Water 2 L",
        "marathiName": "बिसलेरी वॉटर २ लिटर",
        "categoryId": 1,
        "subCategoryId": 6,
        "price": 30,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 30,
            "2": 30,
            "3": 35,
            "4": 30
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 70,
        "srNo": 181,
        "name": "Single Sabudana Vada",
        "marathiName": "सिंगल साबुदाणा वडा",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 71,
        "srNo": 182,
        "name": "Single Idli",
        "marathiName": "सिंगल इडली",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 25,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 25,
            "2": 25,
            "3": 30,
            "4": 25
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 72,
        "srNo": 183,
        "name": "Single Vada",
        "marathiName": "सिंगल वडा",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 30,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 30,
            "2": 30,
            "3": 35,
            "4": 30
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 73,
        "srNo": 184,
        "name": "Single Dahi Vada",
        "marathiName": "सिंगल दही वडा",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 35,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 35,
            "2": 35,
            "3": 40,
            "4": 35
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 74,
        "srNo": 185,
        "name": "Single Samosa",
        "marathiName": "सिंगल समोसा",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 20,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 20,
            "2": 20,
            "3": 25,
            "4": 20
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 75,
        "srNo": 186,
        "name": "Single Batata Vada",
        "marathiName": "सिंगल बटाटा वडा",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 20,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 20,
            "2": 20,
            "3": 25,
            "4": 20
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 76,
        "srNo": 187,
        "name": "Single Idli Vada",
        "marathiName": "सिंगल इडली वडा",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 50,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 50,
            "2": 50,
            "3": 60,
            "4": 50
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 77,
        "srNo": 188,
        "name": "Idli 1 Piece",
        "marathiName": "इडली १ नग",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 25,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 25,
            "2": 25,
            "3": 30,
            "4": 25
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 78,
        "srNo": 189,
        "name": "Vada 1 Piece",
        "marathiName": "वडा १ नग",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 30,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 30,
            "2": 30,
            "3": 35,
            "4": 30
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 79,
        "srNo": 190,
        "name": "Puri 2 Pieces",
        "marathiName": "पुरी २ नग",
        "categoryId": 1,
        "subCategoryId": 7,
        "price": 30,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 30,
            "2": 30,
            "3": 35,
            "4": 30
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 80,
        "srNo": 191,
        "name": "Omelette",
        "marathiName": "ऑम्लेट",
        "categoryId": 1,
        "subCategoryId": 8,
        "price": 50,
        "stockQty": 40,
        "hasMultiplePrices": false,
        "variants": [],
        "sectionPrices": {
            "1": 50,
            "2": 50,
            "3": 60,
            "4": 50
        },
        "counter": "Breakfast",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 82,
        "srNo": 202,
        "name": "Kunda",
        "marathiName": "कुंदा",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 100,
        "pricePerKg": 400,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 100
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 200
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 400
            }
        ],
        "sectionPrices": {
            "1": 100,
            "2": 100,
            "3": 100,
            "4": 100,
            "5": 100
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 83,
        "srNo": 203,
        "name": "Dudh Kunda",
        "marathiName": "दूध कुंदा",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 110,
        "pricePerKg": 440,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 110
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 220
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 440
            }
        ],
        "sectionPrices": {
            "1": 110,
            "2": 110,
            "3": 110,
            "4": 110,
            "5": 110
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 84,
        "srNo": 204,
        "name": "Petha",
        "marathiName": "पेठा",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 75,
        "pricePerKg": 300,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 75
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 150
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 300
            }
        ],
        "sectionPrices": {
            "1": 75,
            "2": 75,
            "3": 75,
            "4": 75,
            "5": 75
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 81,
        "srNo": 201,
        "name": "Gulab Jamun",
        "marathiName": "गुलाब जामुन",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 80,
        "pricePerKg": 320,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 80
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 160
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 320
            }
        ],
        "sectionPrices": {
            "1": 80,
            "2": 80,
            "3": 80,
            "4": 80,
            "5": 80
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 85,
        "srNo": 205,
        "name": "Sweet Gulab Jamun",
        "marathiName": "स्वीट गुलाब जामुन",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 85,
        "pricePerKg": 340,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 85
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 170
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 340
            }
        ],
        "sectionPrices": {
            "1": 85,
            "2": 85,
            "3": 85,
            "4": 85,
            "5": 85
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 86,
        "srNo": 206,
        "name": "Basundi",
        "marathiName": "बासुंदी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 90,
        "pricePerKg": 360,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 90
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 180
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 360
            }
        ],
        "sectionPrices": {
            "1": 90,
            "2": 90,
            "3": 90,
            "4": 90,
            "5": 90
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 87,
        "srNo": 207,
        "name": "Dink Laddu",
        "marathiName": "डिंक लाडू",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 100,
        "pricePerKg": 400,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 100
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 200
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 400
            }
        ],
        "sectionPrices": {
            "1": 100,
            "2": 100,
            "3": 100,
            "4": 100,
            "5": 100
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 88,
        "srNo": 208,
        "name": "Motichoor Laddu",
        "marathiName": "मोतीचूर लाडू",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 75,
        "pricePerKg": 300,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 75
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 150
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 300
            }
        ],
        "sectionPrices": {
            "1": 75,
            "2": 75,
            "3": 75,
            "4": 75,
            "5": 75
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 89,
        "srNo": 209,
        "name": "Special Motichoor Laddu",
        "marathiName": "स्पेशल मोतीचूर लाडू",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 90,
        "pricePerKg": 360,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 90
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 180
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 360
            }
        ],
        "sectionPrices": {
            "1": 90,
            "2": 90,
            "3": 90,
            "4": 90,
            "5": 90
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 90,
        "srNo": 210,
        "name": "Boondi Laddu",
        "marathiName": "बुंदी लाडू",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 70,
        "pricePerKg": 280,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 70
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 140
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 280
            }
        ],
        "sectionPrices": {
            "1": 70,
            "2": 70,
            "3": 70,
            "4": 70,
            "5": 70
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 91,
        "srNo": 211,
        "name": "Besan Laddu",
        "marathiName": "बेसन लाडू",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 80,
        "pricePerKg": 320,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 80
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 160
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 320
            }
        ],
        "sectionPrices": {
            "1": 80,
            "2": 80,
            "3": 80,
            "4": 80,
            "5": 80
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 92,
        "srNo": 212,
        "name": "Special Besan Laddu",
        "marathiName": "स्पेशल बेसन लाडू",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 95,
        "pricePerKg": 380,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 95
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 190
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 380
            }
        ],
        "sectionPrices": {
            "1": 95,
            "2": 95,
            "3": 95,
            "4": 95,
            "5": 95
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 93,
        "srNo": 213,
        "name": "Rajgira Laddu",
        "marathiName": "राजगिरा लाडू",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 60,
        "pricePerKg": 240,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 60
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 120
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 240
            }
        ],
        "sectionPrices": {
            "1": 60,
            "2": 60,
            "3": 60,
            "4": 60,
            "5": 60
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 94,
        "srNo": 214,
        "name": "Rava Laddu",
        "marathiName": "रवा लाडू",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 70,
        "pricePerKg": 280,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 70
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 140
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 280
            }
        ],
        "sectionPrices": {
            "1": 70,
            "2": 70,
            "3": 70,
            "4": 70,
            "5": 70
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 95,
        "srNo": 215,
        "name": "Peanut Laddu",
        "marathiName": "शेंगदाणा लाडू",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 60,
        "pricePerKg": 240,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 60
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 120
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 240
            }
        ],
        "sectionPrices": {
            "1": 60,
            "2": 60,
            "3": 60,
            "4": 60,
            "5": 60
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 34,
        "srNo": 216,
        "name": "Kaju Katli",
        "marathiName": "काजू कतली",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 250,
        "pricePerKg": 1000,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 250
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 500
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 1000
            }
        ],
        "sectionPrices": {
            "1": 250,
            "2": 250,
            "3": 250,
            "4": 250,
            "5": 250
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 96,
        "srNo": 217,
        "name": "Malai Barfi",
        "marathiName": "मलाई बर्फी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 120,
        "pricePerKg": 480,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 120
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 240
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 480
            }
        ],
        "sectionPrices": {
            "1": 120,
            "2": 120,
            "3": 120,
            "4": 120,
            "5": 120
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 97,
        "srNo": 218,
        "name": "Pista Barfi",
        "marathiName": "पिस्ता बर्फी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 130,
        "pricePerKg": 520,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 130
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 260
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 520
            }
        ],
        "sectionPrices": {
            "1": 130,
            "2": 130,
            "3": 130,
            "4": 130,
            "5": 130
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 98,
        "srNo": 219,
        "name": "Chocolate Barfi",
        "marathiName": "चॉकलेट बर्फी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 125,
        "pricePerKg": 500,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 125
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 250
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 500
            }
        ],
        "sectionPrices": {
            "1": 125,
            "2": 125,
            "3": 125,
            "4": 125,
            "5": 125
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 99,
        "srNo": 220,
        "name": "Mango Barfi",
        "marathiName": "मँगो बर्फी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 125,
        "pricePerKg": 500,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 125
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 250
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 500
            }
        ],
        "sectionPrices": {
            "1": 125,
            "2": 125,
            "3": 125,
            "4": 125,
            "5": 125
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 100,
        "srNo": 221,
        "name": "Orange Barfi",
        "marathiName": "ऑरेंज बर्फी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 125,
        "pricePerKg": 500,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 125
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 250
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 500
            }
        ],
        "sectionPrices": {
            "1": 125,
            "2": 125,
            "3": 125,
            "4": 125,
            "5": 125
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 101,
        "srNo": 222,
        "name": "Butterscotch Barfi",
        "marathiName": "बटरस्कॉच बर्फी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 125,
        "pricePerKg": 500,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 125
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 250
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 500
            }
        ],
        "sectionPrices": {
            "1": 125,
            "2": 125,
            "3": 125,
            "4": 125,
            "5": 125
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 102,
        "srNo": 223,
        "name": "Roll Barfi",
        "marathiName": "रोल बर्फी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 130,
        "pricePerKg": 520,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 130
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 260
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 520
            }
        ],
        "sectionPrices": {
            "1": 130,
            "2": 130,
            "3": 130,
            "4": 130,
            "5": 130
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 103,
        "srNo": 224,
        "name": "Badam Barfi",
        "marathiName": "बदाम बर्फी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 160,
        "pricePerKg": 640,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 160
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 320
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 640
            }
        ],
        "sectionPrices": {
            "1": 160,
            "2": 160,
            "3": 160,
            "4": 160,
            "5": 160
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 104,
        "srNo": 225,
        "name": "Anjeer Barfi",
        "marathiName": "अंजीर बर्फी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 180,
        "pricePerKg": 720,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 180
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 360
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 720
            }
        ],
        "sectionPrices": {
            "1": 180,
            "2": 180,
            "3": 180,
            "4": 180,
            "5": 180
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 105,
        "srNo": 226,
        "name": "Peda",
        "marathiName": "पेढा",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 100,
        "pricePerKg": 400,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 100
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 200
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 400
            }
        ],
        "sectionPrices": {
            "1": 100,
            "2": 100,
            "3": 100,
            "4": 100,
            "5": 100
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 106,
        "srNo": 227,
        "name": "Kesar Peda",
        "marathiName": "केसर पेढा",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 120,
        "pricePerKg": 480,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 120
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 240
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 480
            }
        ],
        "sectionPrices": {
            "1": 120,
            "2": 120,
            "3": 120,
            "4": 120,
            "5": 120
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 107,
        "srNo": 228,
        "name": "Malai Peda",
        "marathiName": "मलाई पेढा",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 110,
        "pricePerKg": 440,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 110
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 220
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 440
            }
        ],
        "sectionPrices": {
            "1": 110,
            "2": 110,
            "3": 110,
            "4": 110,
            "5": 110
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 108,
        "srNo": 229,
        "name": "Kandi Peda",
        "marathiName": "कांडी पेढा",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 110,
        "pricePerKg": 440,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 110
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 220
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 440
            }
        ],
        "sectionPrices": {
            "1": 110,
            "2": 110,
            "3": 110,
            "4": 110,
            "5": 110
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 109,
        "srNo": 230,
        "name": "Jalebi",
        "marathiName": "जिलेबी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 70,
        "pricePerKg": 280,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 70
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 140
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 280
            }
        ],
        "sectionPrices": {
            "1": 70,
            "2": 70,
            "3": 70,
            "4": 70,
            "5": 70
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 110,
        "srNo": 231,
        "name": "Balushahi",
        "marathiName": "बालुशाही",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 80,
        "pricePerKg": 320,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 80
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 160
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 320
            }
        ],
        "sectionPrices": {
            "1": 80,
            "2": 80,
            "3": 80,
            "4": 80,
            "5": 80
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 111,
        "srNo": 232,
        "name": "Kolkata Gulab Jamun",
        "marathiName": "कोलकाता गुलाब जामुन",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 90,
        "pricePerKg": 360,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 90
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 180
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 360
            }
        ],
        "sectionPrices": {
            "1": 90,
            "2": 90,
            "3": 90,
            "4": 90,
            "5": 90
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 112,
        "srNo": 233,
        "name": "Mysore Pak",
        "marathiName": "म्हैसूर पाक",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 100,
        "pricePerKg": 400,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 100
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 200
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 400
            }
        ],
        "sectionPrices": {
            "1": 100,
            "2": 100,
            "3": 100,
            "4": 100,
            "5": 100
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
    },
    {
        "id": 113,
        "srNo": 234,
        "name": "Son Papdi",
        "marathiName": "सोहन पापडी",
        "categoryId": 2,
        "subCategoryId": 9,
        "price": 75,
        "pricePerKg": 300,
        "stockQty": 30,
        "hasMultiplePrices": true,
        "variants": [
            {
                "unit": "250g",
                "weightKg": 0.25,
                "price": 75
            },
            {
                "unit": "500g",
                "weightKg": 0.5,
                "price": 150
            },
            {
                "unit": "1 Kg",
                "weightKg": 1,
                "price": 300
            }
        ],
        "sectionPrices": {
            "1": 75,
            "2": 75,
            "3": 75,
            "4": 75,
            "5": 75
        },
        "counter": "Sweets",
        "status": "In Stock",
        "subItems": []
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
    { id: 19, name: 'AC5', sectionId: 3, status: 'empty', currentCart: [], currentTokenNo: '1019', isSplit: false, createdAt: null }
  ],
  bills: [],
  billLogs: [],
  preOrders: [],
  rawMaterials: [
    { id: 1, name: 'Milk', quantity: 50, inwardQty: 50, minThreshold: 10, unit: 'Kg' },
    { id: 2, name: 'Sugar', quantity: 30, inwardQty: 30, minThreshold: 5, unit: 'Kg' },
    { id: 3, name: 'Rice Batter', quantity: 20, inwardQty: 20, minThreshold: 5, unit: 'Kg' },
    { id: 4, name: 'Paneer', quantity: 15, inwardQty: 15, minThreshold: 4, unit: 'Kg' },
    { id: 5, name: 'Cashew (Kaju)', quantity: 25, inwardQty: 25, minThreshold: 5, unit: 'Kg' },
    { id: 6, name: 'Mawa / Khoya', quantity: 18, inwardQty: 18, minThreshold: 4, unit: 'Kg' }
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
    stockMode: typeof window !== 'undefined' ? (localStorage.getItem('karuna_stock_mode') || 'raw_material_wise') : 'raw_material_wise',
    lastSyncTime: new Date().toISOString()
  }
};

// --- Dynamic Server IP & Networking ---
export function getServerConfig() {
  const isBrowser = typeof window !== 'undefined';
  const pageIsHttps = isBrowser && window.location.protocol === 'https:';

  let raw = '';
  if (isBrowser) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('server')) {
      raw = params.get('server').trim();
    } else {
      const saved = localStorage.getItem('karuna_server_ip');
      if (saved && saved.trim() !== '' && saved !== 'isServer' && saved !== '10.40.145.195') {
        raw = saved.trim();
      } else if (window.location.hostname && window.location.hostname !== '') {
        raw = window.location.hostname;
      }
    }
  }

  if (!raw) raw = '127.0.0.1';

  let hostname = raw;
  let port = '';
  let path = '';
  let isExplicitHttps = false;

  // Check if raw starts with protocol (e.g. http://, https://, ws://, wss://)
  if (/^https?:\/\//i.test(raw) || /^wss?:\/\//i.test(raw)) {
    try {
      const norm = raw.replace(/^ws:\/\//i, 'http://').replace(/^wss:\/\//i, 'https://');
      const parsed = new URL(norm);
      isExplicitHttps = raw.startsWith('https://') || raw.startsWith('wss://');
      hostname = parsed.hostname;
      port = parsed.port;
      path = parsed.pathname !== '/' ? parsed.pathname.replace(/\/$/, '') : '';
    } catch (e) {
      hostname = raw;
    }
  } else {
    // If raw is "host:port" or "host:port/path"
    if (hostname.includes(':')) {
      const parts = hostname.split(':');
      hostname = parts[0];
      const rest = parts.slice(1).join(':');
      if (rest.includes('/')) {
        const pParts = rest.split('/');
        port = pParts[0];
        path = '/' + pParts.slice(1).join('/');
      } else {
        port = rest;
      }
    } else if (hostname.includes('/')) {
      const parts = hostname.split('/');
      hostname = parts[0];
      path = '/' + parts.slice(1).join('/');
    }
  }

  hostname = (hostname || '127.0.0.1').trim();

  // If the web page was loaded over HTTPS, browsers unconditionally block unencrypted HTTP/WS (Mixed Content).
  // In that case, we MUST use secure protocols (WSS / HTTPS).
  const isSecure = pageIsHttps || isExplicitHttps;

  const isLocalOrIp = hostname === 'localhost' || hostname === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

  if (!port) {
    if (isLocalOrIp || !isSecure) {
      port = '3001';
    } else {
      // Public domain on HTTPS: default to standard 443 (empty port) unless user specified
      port = '';
    }
  }

  const portSuffix = port ? `:${port}` : '';
  const httpProto = isSecure ? 'https:' : 'http:';
  const wsProto = isSecure ? 'wss:' : 'ws:';

  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const apiBase = `${httpProto}//${hostname}${portSuffix}${cleanPath}/api`.replace(/\/+/g, '/').replace(':/', '://');
  const wsUrl = `${wsProto}//${hostname}${portSuffix}${cleanPath}`.replace(/\/+$/, '');

  return {
    raw,
    hostname,
    port,
    isSecure,
    pageIsHttps,
    isLocalOrIp,
    apiBase,
    wsUrl
  };
}

export function getServerIp() {
  return getServerConfig().hostname;
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
  return getServerConfig().apiBase;
};

export const getWsUrl = () => {
  return getServerConfig().wsUrl;
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
      result.push(r);
    } else {
      const existing = result[existingIdx];
      Object.assign(existing, r, {
        id: existing.id || r.id,
        rawMaterialId: existing.rawMaterialId || r.rawMaterialId,
        rawMaterialName: existing.rawMaterialName || r.rawMaterialName,
        currentStock: (r.currentStock !== undefined && r.currentStock !== null && r.currentStock !== '')
          ? r.currentStock
          : existing.currentStock,
        qtyRequired: (r.qtyRequired !== undefined && r.qtyRequired !== null) ? r.qtyRequired : existing.qtyRequired,
        baseQty: (r.baseQty !== undefined && r.baseQty !== null) ? r.baseQty : existing.baseQty,
        unit: r.unit || existing.unit,
        tableBaseQty: (r.tableBaseQty !== undefined && r.tableBaseQty !== null) ? r.tableBaseQty : existing.tableBaseQty,
        tableUnit: r.tableUnit || existing.tableUnit,
        tableQtyRequired: (r.tableQtyRequired !== undefined && r.tableQtyRequired !== null) ? r.tableQtyRequired : existing.tableQtyRequired
      });
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
    console.log('🔄 Connecting to Master Database Server:', wsUrl);
    wsClient = new WebSocket(wsUrl);

    wsClient.onopen = async () => {
      console.log('🟢 Connected to Master Database Server:', wsUrl);
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
        }, 5000);
      }
    };
  } catch (err) {
    console.warn('Unable to establish WebSocket connection (' + wsUrl + '):', err.message || err);
    setConnectionStatus(false);
    wsClient = null;
    loadLocalDexieFallback();
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        initWebSocketSync();
      }, 5000);
    }
  }
}

// Handle real-time broadcasts from Master Server
function handleServerBroadcast(msg) {
  if (!msg || typeof msg !== 'object') return;
  const {
    type,
    collection,
    data,
    id,
    bill,
    rawMaterials,
    recipes,
    dishes,
    updatedTable,
    deletedTableId,
    deletedTableIds,
    diningTables: syncTables,
    syncedBills,
    terminals
  } = msg;
  const targetId = id !== undefined ? id : (data?.id !== undefined ? data.id : null);

  switch (type) {
    case 'INSERT':
    case 'UPDATE': {
      if (collection === 'systemSettings' && data) {
        dbCache.systemSettings = { ...(dbCache.systemSettings || {}), ...data };
        notifyListeners(type, { collection, data: dbCache.systemSettings });
        localDb.systemSettings?.put(dbCache.systemSettings).catch(() => {});
        break;
      }
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
    }

    case 'DELETE': {
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
    }

    case 'BILL_SETTLED': {
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

      notifyListeners('BILL_SETTLED', {
        bill,
        rawMaterials,
        recipes: dbCache.recipes,
        dishes,
        updatedTable,
        deletedTableId,
        deletedTableIds,
        diningTables: dbCache.diningTables
      });
      break;
    }

    case 'OFFLINE_BILLS_SYNCED': {
      if (rawMaterials && dbCache.rawMaterials) dbCache.rawMaterials = rawMaterials;
      if (recipes && dbCache.recipes) {
        dbCache.recipes = cleanAndDeduplicateRecipes(recipes);
        localDb.recipes?.bulkPut(dbCache.recipes).catch(() => {});
      }
      if (dishes && dbCache.dishes) dbCache.dishes = dishes;
      if (Array.isArray(syncedBills || msg.syncedBills)) {
        (syncedBills || msg.syncedBills).forEach((b) => {
          const idx = dbCache.bills.findIndex((x) => String(x.id) === String(b.id));
          if (idx === -1) dbCache.bills.unshift(b);
          localDb.bills.put(b).catch(() => {});
        });
      }
      notifyListeners('OFFLINE_BILLS_SYNCED', msg);
      break;
    }

    case 'RELOAD_COLLECTION': {
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
    }

    case 'FULL_RESTORE': {
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
    }

    case 'TERMINAL_ROSTER_UPDATE': {
      notifyListeners('TERMINAL_ROSTER_UPDATE', terminals || msg.terminals);
      break;
    }

    default:
      break;
  }
}

// Fetch entire database snapshot on initial connect
export async function fetchAllDataFromServer() {
  try {
    const res = await fetch(`${getApiBase()}/all-data`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText || ''}`.trim());
    }
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

      // Crucial fix: Also copy systemSettings (object) to dbCache and Dexie, and sync localStorage
      if (json.data.systemSettings) {
        dbCache.systemSettings = {
          ...(dbCache.systemSettings || {}),
          ...json.data.systemSettings
        };
        if (json.data.systemSettings.stockMode) {
          localStorage.setItem('karuna_stock_mode', json.data.systemSettings.stockMode);
        }
        if (localDb.systemSettings) {
          localDb.systemSettings.put(dbCache.systemSettings).catch(() => {});
        }
      }

      // Always guarantee default dining tables exist
      dbCache.diningTables = ensureDefaultDiningTables(dbCache.diningTables || []);

      notifyListeners('BOOTSTRAP', dbCache);
    }
  } catch (err) {
    console.info('Master Server snapshot unavailable (' + (err.message || 'connection failed') + '). Loading local Dexie storage.');
    // Load local Dexie data
    await loadLocalDexieFallback();
  }
}

// Load data from local Dexie when offline
async function loadLocalDexieFallback() {
  try {
    const collections = ['categories', 'subCategories', 'dishes', 'sections', 'diningTables', 'bills', 'preOrders', 'rawMaterials', 'recipes'];
    for (const key of collections) {
      if (localDb[key]) {
        const items = await localDb[key].toArray();
        if (items && items.length > 0) {
          dbCache[key] = items;
        }
      }
    }
    if (localDb.systemSettings) {
      const settings = await localDb.systemSettings.toArray();
      if (settings && settings.length > 0) {
        dbCache.systemSettings = settings[0];
        if (settings[0].stockMode) {
          localStorage.setItem('karuna_stock_mode', settings[0].stockMode);
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
    if (this.name === 'systemSettings') {
      return dbCache.systemSettings ? [dbCache.systemSettings] : [];
    }
    return dbCache[this.name] ? [...dbCache[this.name]] : [];
  }

  async get(id) {
    if (this.name === 'systemSettings') {
      return dbCache.systemSettings || null;
    }
    if (!dbCache[this.name]) return null;
    return dbCache[this.name].find((item) => String(item.id) === String(id)) || null;
  }

  async count() {
    if (this.name === 'systemSettings') {
      return dbCache.systemSettings ? 1 : 0;
    }
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
    if (!itemData) return null;

    if (this.name === 'systemSettings') {
      dbCache.systemSettings = {
        ...(dbCache.systemSettings || {}),
        ...itemData
      };
      notifyListeners('UPDATE', { collection: 'systemSettings', data: dbCache.systemSettings });
      localDb.systemSettings?.put(dbCache.systemSettings).catch(() => {});

      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        try {
          wsClient.send(JSON.stringify({
            type: 'CLIENT_UPDATE',
            collection: 'systemSettings',
            id: 1,
            data: dbCache.systemSettings
          }));
        } catch (e) {}
      }

      try {
        await fetch(`${getApiBase()}/systemSettings/1`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbCache.systemSettings)
        });
      } catch (err) {
        console.warn('Local put fallback for systemSettings:', err);
      }

      return 1;
    }

    if (!itemData.id) return null;
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
    if (this.name === 'systemSettings') {
      return this.put({ id: id || 1, ...updatedFields });
    }
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

export function generatePreOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
  const storageKey = `karuna_seq_pre_${dateStr}`;
  let seq = 1;
  if (typeof localStorage !== 'undefined') {
    seq = parseInt(localStorage.getItem(storageKey) || '0', 10) + 1;
    localStorage.setItem(storageKey, String(seq));
  } else {
    seq = Math.floor(1 + Math.random() * 99);
  }
  return `PRE-${dateStr}-${String(seq).padStart(3, '0')}`;
}

export function checkPreOrderAlert(deliveryDateStr) {
  if (!deliveryDateStr) return { diffDays: 999, isTomorrow: false, isToday: false, isOverdue: false, isUrgent: false };
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  
  const [tY, tM, tD] = todayStr.split('-').map(Number);
  const [dY, dM, dD] = String(deliveryDateStr).split('-').map(Number);
  
  const dateToday = new Date(tY, tM - 1, tD);
  const dateDelivery = new Date(dY, dM - 1, dD);
  
  const diffMs = dateDelivery.getTime() - dateToday.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  return {
    diffDays,
    isTomorrow: diffDays === 1,
    isToday: diffDays === 0,
    isOverdue: diffDays < 0,
    isUrgent: diffDays === 1 || diffDays === 0 || diffDays < 0
  };
}

export function playAlertChime() {
  // Sound disabled per user request
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
  preOrders: new CollectionClient('preOrders'),
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
        if (item.isPreOrderAdvance || localBill.isPreOrderAdvance) {
          continue; // Skip stock deduction for advance payment placeholder
        }
        const unitWeight = parseItemWeightInKg(item);
        const qtyCount = parseFloat(item.qty) || 1;
        const totalSoldKg = Math.round(unitWeight * qtyCount * 1000) / 1000;

        const matchedDish = dbCache.dishes.find((d) => d && (d.id === item.id || d.srNo === item.srNo || (d.name && item.name && d.name.toLowerCase().trim() === item.name.toLowerCase().trim())));
        let totalSold = totalSoldKg;
        if (matchedDish) {
          const stockUnit = (matchedDish.stockUnit || '').toLowerCase();
          if (stockUnit === 'per plate' || stockUnit === 'plate') {
            totalSold = (item.weightKg !== undefined && item.weightKg !== null && !isNaN(parseFloat(item.weightKg)))
              ? Math.round(parseFloat(item.weightKg) * qtyCount * 1000) / 1000
              : qtyCount;
          }
          if (matchedDish.stockQty !== undefined) {
            matchedDish.stockQty = Math.max(0, Math.round(((matchedDish.stockQty || 0) - totalSold) * 1000) / 1000);
            matchedDish.status = matchedDish.stockQty > 0 ? 'In Stock' : 'Out of Stock';
            localDb.dishes?.put(matchedDish).catch(() => {});
          }
        }

        // Real-time automatic deduction of Raw Materials based on dish recipe mapping
        // e.g., 1 Kg Gulab Jamun recipe with 1 Kg Sugar -> 1 Kg sold reduces 1 Kg Sugar; 500g reduces 0.5 Kg Sugar
        dbCache.recipes = cleanAndDeduplicateRecipes(dbCache.recipes);
        const dishIdToMatch = matchedDish ? matchedDish.id : item.id;
        const dishNameToMatch = (matchedDish?.name || item.name || '').toLowerCase().trim();
        let dishRecipes = dishIdToMatch
          ? (dbCache.recipes || []).filter((r) => r && String(r.dishId) === String(dishIdToMatch))
          : [];
        if (dishRecipes.length === 0 && dishNameToMatch) {
          dishRecipes = (dbCache.recipes || []).filter((r) => r && r.dishName && r.dishName.toLowerCase().trim() === dishNameToMatch);
        }

        if (dishRecipes.length > 0) {
          const rawMaterials = dbCache.rawMaterials || [];
          const isWeightSale = (item.weightKg !== undefined && item.weightKg !== null && !isNaN(parseFloat(item.weightKg))) ||
            (item.unit && (item.unit.toLowerCase().includes('kg') || (item.unit.toLowerCase().includes('g') && !item.unit.toLowerCase().includes('plate'))));

          for (const rec of dishRecipes) {
            const hasTablePlateRecipe = rec.tableQtyRequired !== undefined && rec.tableQtyRequired !== null && parseFloat(rec.tableQtyRequired) > 0;
            let rmDeduction = 0;

            if (!isWeightSale && hasTablePlateRecipe) {
              // Dine-in Table / Per Plate sale
              const tableBase = parseFloat(rec.tableBaseQty || 1) || 1;
              const ratio = qtyCount / tableBase;
              rmDeduction = Math.round(ratio * parseFloat(rec.tableQtyRequired) * 1000) / 1000;
            } else {
              // Counter / Parcel Weight sale or standard dish
              const baseQty = parseFloat(rec.baseQty || (matchedDish?.recipeBaseQty) || 1) || 1;
              const ratio = totalSold / baseQty;
              rmDeduction = Math.round(ratio * (parseFloat(rec.qtyRequired) || 0) * 1000) / 1000;
            }
            if (rmDeduction <= 0) continue;

            let rm = rec.rawMaterialId ? rawMaterials.find((m) => m && String(m.id) === String(rec.rawMaterialId)) : null;
            if (!rm && rec.rawMaterialName) {
              rm = rawMaterials.find((m) => m && m.name && m.name.toLowerCase().trim() === rec.rawMaterialName.toLowerCase().trim());
            }

            if (rm) {
              const currentQty = parseFloat(rm.quantity !== undefined && rm.quantity !== null ? rm.quantity : (rm.inwardQty || 0)) || 0;
              const newQty = Math.max(0, Math.round((currentQty - rmDeduction) * 1000) / 1000);
              rm.quantity = newQty;
              rm.consumedQty = Math.round(((parseFloat(rm.consumedQty) || 0) + rmDeduction) * 1000) / 1000;

              const saleLog = {
                id: Date.now() + Math.random(),
                date: new Date().toISOString(),
                remainingQty: newQty,
                usedQty: newQty,
                mode: 'sale_deduct',
                amountEntered: rmDeduction,
                unit: rm.unit || 'Kg',
                dishName: matchedDish?.name || item.name || 'Dish',
                soldAmount: totalSold,
                invoiceNo: localBill.invoiceNo || ''
              };
              rm.remainingLogs = [saleLog, ...(Array.isArray(rm.remainingLogs) ? rm.remainingLogs : [])].slice(0, 30);
              localDb.rawMaterials?.put(rm).catch(() => {});
            }
          }
        }
      }
    }

    // 4. Reset table locally
    if (localBill.tableId) {
      const tIdx = dbCache.diningTables.findIndex((t) => String(t.id) === String(localBill.tableId));
      if (tIdx !== -1) {
        const t = dbCache.diningTables[tIdx];
        const isParcel = t.sectionId === 4 || (t.name && String(t.name).toUpperCase().startsWith('P')) || t.isParcel;
        const isSweet = t.sectionId === 5 || (t.name && String(t.name).toUpperCase().startsWith('S')) || t.isSweet;
        if (isParcel || isSweet) {
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
        if (!dish.sectionPrices || typeof dish.sectionPrices !== 'object') {
          dish.sectionPrices = {};
        }

        const hasExplicitSectionRates = (
          (item.diningPrice !== undefined && !isNaN(item.diningPrice)) ||
          (item.firstFloorPrice !== undefined && !isNaN(item.firstFloorPrice)) ||
          (item.acPrice !== undefined && !isNaN(item.acPrice)) ||
          (item.parcelPrice !== undefined && !isNaN(item.parcelPrice))
        );

        if (item.diningPrice !== undefined && !isNaN(item.diningPrice)) {
          dish.sectionPrices['1'] = item.diningPrice;
          dish.price = item.diningPrice;
        }
        if (item.firstFloorPrice !== undefined && !isNaN(item.firstFloorPrice)) {
          dish.sectionPrices['2'] = item.firstFloorPrice;
        }
        if (item.acPrice !== undefined && !isNaN(item.acPrice)) {
          dish.sectionPrices['3'] = item.acPrice;
        }
        if (item.parcelPrice !== undefined && !isNaN(item.parcelPrice)) {
          dish.sectionPrices['4'] = item.parcelPrice;
        }

        // If specific section rates were not provided, propagate item.price
        if (!hasExplicitSectionRates && item.price !== undefined && !isNaN(parseFloat(item.price))) {
          const oldPrice = parseFloat(dish.price) || 0;
          const newPrice = parseFloat(item.price);
          const priceDiff = newPrice - oldPrice;
          dish.price = newPrice;

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
        }

        // Multi-price sweet portion variants (250g, 500g, 1Kg)
        const hasVariantUpdates = (
          (item.price250g !== undefined && !isNaN(item.price250g)) ||
          (item.price500g !== undefined && !isNaN(item.price500g)) ||
          (item.price1kg !== undefined && !isNaN(item.price1kg)) ||
          (item.pricePerKg !== undefined && !isNaN(item.pricePerKg))
        );

        if (hasVariantUpdates) {
          dish.hasMultiplePrices = true;
          let p250 = (item.price250g !== undefined && !isNaN(item.price250g)) ? item.price250g : null;
          let p500 = (item.price500g !== undefined && !isNaN(item.price500g)) ? item.price500g : null;
          let p1kg = (item.price1kg !== undefined && !isNaN(item.price1kg)) ? item.price1kg : ((item.pricePerKg !== undefined && !isNaN(item.pricePerKg)) ? item.pricePerKg : null);

          if (p1kg === null && p250 !== null) p1kg = p250 * 4;
          if (p1kg === null && p500 !== null) p1kg = p500 * 2;
          if (p250 === null && p1kg !== null) p250 = Math.round(p1kg * 0.25);
          if (p500 === null && p1kg !== null) p500 = Math.round(p1kg * 0.5);

          p250 = p250 || 0;
          p500 = p500 || (p250 * 2);
          p1kg = p1kg || (p250 * 4);

          dish.pricePerKg = p1kg;
          dish.variants = [
            { unit: '250g', weightKg: 0.25, price: p250 },
            { unit: '500g', weightKg: 0.5, price: p500 },
            { unit: '1 Kg', weightKg: 1, price: p1kg }
          ];
          if (!hasExplicitSectionRates || dish.price === undefined || dish.price === 0) {
            dish.price = p250;
          }
        } else if (dish.hasMultiplePrices && item.price !== undefined && !isNaN(parseFloat(item.price))) {
          const newPrice = parseFloat(item.price);
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

        const hasVariantUpdates = (
          (item.price250g !== undefined && !isNaN(item.price250g)) ||
          (item.price500g !== undefined && !isNaN(item.price500g)) ||
          (item.price1kg !== undefined && !isNaN(item.price1kg)) ||
          (item.pricePerKg !== undefined && !isNaN(item.pricePerKg)) ||
          catId === 2
        );

        let p250 = (item.price250g !== undefined && !isNaN(item.price250g)) ? item.price250g : null;
        let p500 = (item.price500g !== undefined && !isNaN(item.price500g)) ? item.price500g : null;
        let p1kg = (item.price1kg !== undefined && !isNaN(item.price1kg)) ? item.price1kg : ((item.pricePerKg !== undefined && !isNaN(item.pricePerKg)) ? item.pricePerKg : null);

        let newPrice = (item.diningPrice !== undefined && !isNaN(item.diningPrice))
          ? item.diningPrice
          : ((item.price !== undefined && !isNaN(parseFloat(item.price))) ? parseFloat(item.price) : (p250 || 0));

        let variants = [];
        let pricePerKg = null;
        if (hasVariantUpdates) {
          if (p1kg === null && p250 !== null) p1kg = p250 * 4;
          if (p1kg === null && p500 !== null) p1kg = p500 * 2;
          if (p250 === null && p1kg !== null) p250 = Math.round(p1kg * 0.25);
          if (p500 === null && p1kg !== null) p500 = Math.round(p1kg * 0.5);

          p250 = p250 || newPrice || 0;
          p500 = p500 || (p250 * 2);
          p1kg = p1kg || (p250 * 4);

          pricePerKg = p1kg;
          variants = [
            { unit: '250g', weightKg: 0.25, price: p250 },
            { unit: '500g', weightKg: 0.5, price: p500 },
            { unit: '1 Kg', weightKg: 1, price: p1kg }
          ];
          if (!newPrice) newPrice = p250;
        }

        let counter = item.counter || (catId === 2 || hasVariantUpdates ? 'Sweets' : 'Breakfast');

        // Initialize sectionPrices
        const sectionPrices = {
          '1': (item.diningPrice !== undefined && !isNaN(item.diningPrice)) ? item.diningPrice : newPrice,
          '2': (item.firstFloorPrice !== undefined && !isNaN(item.firstFloorPrice)) ? item.firstFloorPrice : newPrice,
          '3': (item.acPrice !== undefined && !isNaN(item.acPrice)) ? item.acPrice : (newPrice + 10),
          '4': (item.parcelPrice !== undefined && !isNaN(item.parcelPrice)) ? item.parcelPrice : newPrice
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

// Section price helper - Area Matrix is the single source of truth for pricing
export function getDishPriceForSection(dish, sectionId) {
  if (!dish) return 0;
  // 1. If explicit section rate exists in sectionPrices, return it
  if (dish.sectionPrices && sectionId && dish.sectionPrices[sectionId] !== undefined && dish.sectionPrices[sectionId] !== '') {
    const customRate = parseFloat(dish.sectionPrices[sectionId]);
    if (!isNaN(customRate) && customRate > 0) {
      return customRate;
    }
  }
  // 2. If Dine In Area (id 1) exists in sectionPrices, use that
  if (dish.sectionPrices && dish.sectionPrices[1] !== undefined && dish.sectionPrices[1] !== '') {
    const dineInRate = parseFloat(dish.sectionPrices[1]);
    if (!isNaN(dineInRate) && dineInRate > 0) {
      return dineInRate;
    }
  }
  // 3. Fallback to any non-zero rate in sectionPrices
  if (dish.sectionPrices) {
    for (const val of Object.values(dish.sectionPrices)) {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return dish.price || 0;
}

// Helper to calculate sequential numbers for Parcels (P1..P99) and Sweets (S1..S99) cycling back to 1
export function getNextSequentialNumber(prefix, activeTables = []) {
  const normPrefix = String(prefix || 'P').toUpperCase();
  const storageKey = normPrefix === 'P' ? 'karuna_last_parcel_no' : 'karuna_last_sweet_no';
  let lastNo = 0;
  try {
    lastNo = parseInt(localStorage.getItem(storageKey), 10) || 0;
  } catch (e) {
    lastNo = 0;
  }

  const activeNumbers = new Set(
    (activeTables || [])
      .filter((t) => t && t.name && String(t.name).toUpperCase().startsWith(normPrefix))
      .map((t) => {
        const m = String(t.name).match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => n > 0)
  );

  let candidate = (lastNo % 99) + 1;
  let attempts = 0;
  while (activeNumbers.has(candidate) && attempts < 99) {
    candidate = (candidate % 99) + 1;
    attempts++;
  }

  try {
    localStorage.setItem(storageKey, String(candidate));
  } catch (e) {}

  return candidate;
}
