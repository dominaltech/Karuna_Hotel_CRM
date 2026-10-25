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
    stockMode: 'raw_material_wise',
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
  dbState.preOrders = Array.isArray(dbState.preOrders) ? dbState.preOrders : [];
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
  if (collectionName === 'systemSettings') {
    return dbState.systemSettings || {};
  }
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
  if (collectionName === 'systemSettings') return collection;
  return collection.find((item) => item && String(item.id) === String(id)) || null;
}

export function insertItem(collectionName, itemData) {
  if (collectionName === 'systemSettings') {
    dbState.systemSettings = {
      ...(dbState.systemSettings || {}),
      ...itemData
    };
    scheduleSaveDatabase();
    return dbState.systemSettings;
  }
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
  if (collectionName === 'systemSettings') {
    dbState.systemSettings = {
      ...(dbState.systemSettings || {}),
      ...updatedFields
    };
    scheduleSaveDatabase();
    return dbState.systemSettings;
  }
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
    invoiceNo: billData.invoiceNo || `INV-M-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${newBillId + 100}`,
    status: 'settled',
    createdAt: billData.createdAt || new Date().toISOString()
  };
  dbState.bills.push(newBill);

  // 2. Deduct Dish Finished Stock Inventory (Raw materials were already deducted upon dish integration)
  const dishes = dbState.dishes || [];

  if (Array.isArray(billData.items)) {
    for (const item of billData.items) {
      if (item.isPreOrderAdvance || billData.isPreOrderAdvance) {
        continue; // Skip stock deduction for advance payment placeholder
      }
      const unitWeight = parseItemWeightInKg(item);
      const qtyCount = parseFloat(item.qty) || 1;
      const totalSoldKg = Math.round(unitWeight * qtyCount * 1000) / 1000;

      // 1. Calculate sold amount (kg for weight/sweets or count for plates)
      const matchedDish = dishes.find((d) => d && (d.id === item.id || d.srNo === item.srNo || (d.name && item.name && d.name.toLowerCase().trim() === item.name.toLowerCase().trim())));
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
        }
      }

      // 2. Real-time automatic deduction of Raw Materials based on dish recipe mapping
      // e.g., 1 Kg Gulab Jamun recipe with 1 Kg Sugar -> 1 Kg sold reduces 1 Kg Sugar; 500g reduces 0.5 Kg Sugar
      dbState.recipes = cleanAndDeduplicateRecipes(dbState.recipes);
      const dishIdToMatch = matchedDish ? matchedDish.id : item.id;
      const dishNameToMatch = (matchedDish?.name || item.name || '').toLowerCase().trim();
      let dishRecipes = dishIdToMatch
        ? (dbState.recipes || []).filter((r) => r && String(r.dishId) === String(dishIdToMatch))
        : [];
      if (dishRecipes.length === 0 && dishNameToMatch) {
        dishRecipes = (dbState.recipes || []).filter((r) => r && r.dishName && r.dishName.toLowerCase().trim() === dishNameToMatch);
      }

      if (dishRecipes.length > 0) {
        const rawMaterials = dbState.rawMaterials || [];
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
              invoiceNo: newBill.invoiceNo || ''
            };
            rm.remainingLogs = [saleLog, ...(Array.isArray(rm.remainingLogs) ? rm.remainingLogs : [])].slice(0, 30);
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
    const isSweet = table.sectionId === 5 || (table.name && String(table.name).toUpperCase().startsWith('S')) || table.isSweet;
    const isSplit = Boolean(table.isSplit || (table.name && table.name.includes('-')) || table.parentTable || table.baseName);

    if (isParcel || isSweet) {
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
      if (Array.isArray(dbState.sections) && dbState.sections.length > 0) {
        for (const sec of dbState.sections) {
          if (sectionPrices[sec.id] === undefined) {
            const extra = parseFloat(sec.extraCharge) || 0;
            sectionPrices[sec.id] = newPrice + extra;
          }
        }
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
        hasMultiplePrices: hasVariantUpdates,
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
    'preOrders',
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
          }
        }

        // Deduct Raw Materials based on dish recipe measurement ratio
        dbState.recipes = cleanAndDeduplicateRecipes(dbState.recipes);
        const dishIdToMatch = matchedDish ? matchedDish.id : item.id;
        const dishNameToMatch = (matchedDish?.name || item.name || '').toLowerCase().trim();
        let dishRecipes = dishIdToMatch
          ? (dbState.recipes || []).filter((r) => r && String(r.dishId) === String(dishIdToMatch))
          : [];
        if (dishRecipes.length === 0 && dishNameToMatch) {
          dishRecipes = (dbState.recipes || []).filter((r) => r && r.dishName && r.dishName.toLowerCase().trim() === dishNameToMatch);
        }
        const rawMaterials = dbState.rawMaterials || [];
        const isWeightSale = (item.weightKg !== undefined && item.weightKg !== null && !isNaN(parseFloat(item.weightKg))) ||
          (item.unit && (item.unit.toLowerCase().includes('kg') || (item.unit.toLowerCase().includes('g') && !item.unit.toLowerCase().includes('plate'))));
        for (const rec of dishRecipes) {
          let rm = rec.rawMaterialId ? rawMaterials.find((m) => m && String(m.id) === String(rec.rawMaterialId)) : null;
          if (!rm && rec.rawMaterialName) {
            rm = rawMaterials.find((m) => m && m.name && m.name.toLowerCase().trim() === rec.rawMaterialName.toLowerCase().trim());
          }
          if (rm) {
            const hasTablePlateRecipe = rec.tableQtyRequired !== undefined && rec.tableQtyRequired !== null && parseFloat(rec.tableQtyRequired) > 0;
            let rmDeduction = 0;

            if (!isWeightSale && hasTablePlateRecipe) {
              const tableBase = parseFloat(rec.tableBaseQty || 1) || 1;
              const ratio = qtyCount / tableBase;
              rmDeduction = Math.round(ratio * parseFloat(rec.tableQtyRequired) * 1000) / 1000;
            } else {
              const baseQty = parseFloat(matchedDish?.recipeBaseQty || rec.baseQty || 1) || 1;
              const ratio = totalSold / baseQty;
              rmDeduction = Math.round(ratio * (parseFloat(rec.qtyRequired) || 0) * 1000) / 1000;
            }
            if (rmDeduction > 0) {
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
                invoiceNo: newBill.invoiceNo || ''
              };
              rm.remainingLogs = [saleLog, ...(Array.isArray(rm.remainingLogs) ? rm.remainingLogs : [])].slice(0, 30);
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

