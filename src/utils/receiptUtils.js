import QRCode from 'qrcode';
import { QR_SCAN_PHONE_ICON_DATA_URL } from './qrScanPhoneIcon.js';

// Comprehensive dictionary for English -> Marathi dish translation
export const MARATHI_DISH_MAP = {
  'single idli vada': 'सिंगल इडली वडा',
  'single shabu vada': 'सिंगल शाबूवडा',
  'single sabudana vada': 'सिंगल शाबूवडा',
  'shabu vada': 'शाबू वडा',
  'sabudana vada': 'शाबू वडा',
  'shabu khichdi': 'शाबू खिचडी',
  'sabudana khichdi': 'शाबू खिचडी',
  'special tea': 'स्पे. चहा',
  'special chaha': 'स्पे. चहा',
  'tea': 'चहा',
  'chaha': 'चहा',
  'chai': 'चहा',
  'puri bhaji': 'पुरी भाजी',
  'pohe': 'पोहे',
  'poha': 'पोहे',
  'kanda pohe': 'कांदा पोहे',
  'uppit': 'उप्पीट',
  'upma': 'उप्पीट',
  'sheera': 'शिरा',
  'idli': 'इडली सांबार',
  'idli sambar': 'इडली सांबार',
  'vada sambar': 'वडा सांबार',
  'idli vada': 'इडली वडा मिक्स',
  'idli vada mix': 'इडली वडा मिक्स',
  'dahi vada': 'दही वडा',
  'batata vada': 'बटाटा वडा',
  'vada pav': 'वडा पाव',
  'misal pav': 'मिसळ पाव',
  'samosa': 'समोसा',
  'kachori': 'कचोरी',
  'dhokla': 'ढोकळा',
  'bhaji': 'कांदा भजी',
  'bhaji (pakoda)': 'कांदा भजी',
  'kanda bhaji': 'कांदा भजी',
  'pakoda': 'पकोडा',
  'papdi': 'पापडी',
  'plain dosa': 'प्लेन डोसा',
  'masala dosa': 'मसाला डोसा',
  'mysore masala dosa': 'म्हैसूर मसाला डोसा',
  'cheese masala dosa': 'चीज मसाला डोसा',
  'onion uttappa': 'कांदा उत्तप्पा',
  'tomato onion uttappa': 'टोमॅटो कांदा उत्तप्पा',
  'butter pav bhaji': 'बटर पाव भाजी',
  'cheese pav bhaji': 'चीज पाव भाजी',
  'pav bhaji': 'पाव भाजी',
  'extra pav (pair)': 'एक्स्ट्रा पाव जोडी',
  'extra pav': 'एक्स्ट्रा पाव',
  'special thali meal': 'स्पेशल थाळी जेवण',
  'thali': 'थाळी',
  'filter coffee': 'फिल्टर कॉफी',
  'coffee': 'कॉफी',
  'cold drink / lassi': 'लस्सी / कोल्ड ड्रिंक',
  'lassi': 'लस्सी',
  'sweet lassi': 'स्वीट लस्सी',
  'taak': 'ताक',
  'buttermilk': 'ताक',
  'butter milk': 'ताक',
  'mineral water (1l)': 'मिनरल वॉटर (१L)',
  'mineral water': 'मिनरल वॉटर',
  'water bottle': 'पाण्याची बाटली',
  'gulab jamun': 'गुलाब जामुन',
  'kaju katli': 'काजू कतली',
  'rasgulla': 'रसगुल्ला',
  'motichoor laddu': 'मोतीचूर लाडू',
  'special peda': 'स्पेशल पेढा',
  'kaju peda': 'काजू पेढा',
  'milk cake': 'मिल्क केक',
  'malai peda': 'मलाई पेढा',
  'kaju roll': 'काजू रोल',
  'besan laddu': 'बेसन लाडू',
  'soan papdi': 'सोन पापडी',
  'cham cham': 'चम चम',
  'kalakand': 'कलाकंद',
  'jalebi': 'जिलेबी',
  'mysore pak': 'म्हैसूर पाक',
  'rasmalai': 'रसमलाई',
  'dry fruit halwa': 'ड्रायफ्रूट हलवा',
  'anjeer roll': 'अंजीर रोल',
  'badam katli': 'बदाम कतली',
  'dharwad peda': 'धारवाड पेढा'
};

// Reverse dictionary for Marathi -> English dish translation
export const ENGLISH_DISH_MAP = {
  'सिंगल इडली वडा': 'Single Idli Vada',
  'सिंगल शाबूवडा': 'Single Shabu Vada',
  'शाबू वडा': 'Shabu Vada',
  'शाबू खिचडी': 'Shabu Khichdi',
  'स्पे. चहा': 'Special Tea',
  'स्पेशल चहा': 'Special Tea',
  'चहा': 'Tea',
  'पुरी भाजी': 'Puri Bhaji',
  'पोहे': 'Pohe',
  'कांदा पोहे': 'Kanda Pohe',
  'उप्पीट': 'Uppit',
  'शिरा': 'Sheera',
  'इडली सांबार': 'Idli',
  'वडा सांबार': 'Vada Sambar',
  'इडली वडा मिक्स': 'Idli Vada',
  'दही वडा': 'Dahi Vada',
  'बटाटा वडा': 'Batata Vada',
  'वडा पाव': 'Vada Pav',
  'मिसळ पाव': 'Misal Pav',
  'समोसा': 'Samosa',
  'कचोरी': 'Kachori',
  'ढोकळा': 'Dhokla',
  'कांदा भजी': 'Bhaji (Pakoda)',
  'पकोडा': 'Pakoda',
  'पापडी': 'Papdi',
  'प्लेन डोसा': 'Plain Dosa',
  'मसाला डोसा': 'Masala Dosa',
  'म्हैसूर मसाला डोसा': 'Mysore Masala Dosa',
  'चीज मसाला डोसा': 'Cheese Masala Dosa',
  'कांदा उत्तप्पा': 'Onion Uttappa',
  'टोमॅटो कांदा उत्तप्पा': 'Tomato Onion Uttappa',
  'बटर पाव भाजी': 'Butter Pav Bhaji',
  'चीज पाव भाजी': 'Cheese Pav Bhaji',
  'पाव भाजी': 'Pav Bhaji',
  'एक्स्ट्रा पाव जोडी': 'Extra Pav (Pair)',
  'एक्स्ट्रा पाव': 'Extra Pav',
  'स्पेशल थाळी जेवण': 'Special Thali Meal',
  'थाळी': 'Thali Meal',
  'फिल्टर कॉफी': 'Filter Coffee',
  'कॉफी': 'Coffee',
  'लस्सी / कोल्ड ड्रिंक': 'Cold Drink / Lassi',
  'लस्सी': 'Lassi',
  'ताक': 'Taak (Buttermilk)',
  'मिनरल वॉटर (१L)': 'Mineral Water (1L)',
  'मिनरल वॉटर': 'Mineral Water',
  'गुलाब जामुन': 'Gulab Jamun',
  'काजू कतली': 'Kaju Katli',
  'रसगुल्ला': 'Rasgulla',
  'मोतीचूर लाडू': 'Motichoor Laddu',
  'स्पेशल पेढा': 'Special Peda',
  'काजू पेढा': 'Kaju Peda',
  'मिल्क केक': 'Milk Cake',
  'मलाई पेढा': 'Malai Peda',
  'काजू रोल': 'Kaju Roll',
  'बेसन लाडू': 'Besan Laddu',
  'सोन पापडी': 'Soan Papdi',
  'चम चम': 'Cham Cham',
  'कलाकंद': 'Kalakand',
  'जिलेबी': 'Jalebi',
  'म्हैसूर पाक': 'Mysore Pak',
  'रसमलाई': 'Rasmalai',
  'ड्रायफ्रूट हलवा': 'Dry Fruit Halwa',
  'अंजीर रोल': 'Anjeer Roll',
  'बदाम कतली': 'Badam Katli',
  'धारवाड पेढा': 'Dharwad Peda'
};

// Retrieve currently active print language ('mr' | 'en')
export function getPrintLanguage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('karuna_print_language') || 'mr';
  }
  return 'mr';
}

// Translate dish name strictly according to selected language
export function getPrintDishName(item, language) {
  if (!item) return '';
  const lang = language || getPrintLanguage();
  const rawName = (item.name || item.dishName || item.title || '').trim();
  const rawMarathi = (item.marathiName || item.dish?.marathiName || '').trim();
  const rawEnglish = (item.englishName || '').trim();

  const isDevanagari = (str) => /[\u0900-\u097F]/.test(str);

  if (lang === 'en') {
    // English requested
    if (rawEnglish) return rawEnglish;
    if (rawName && !isDevanagari(rawName)) return rawName;
    if (rawName && isDevanagari(rawName) && ENGLISH_DISH_MAP[rawName]) {
      return ENGLISH_DISH_MAP[rawName];
    }
    if (rawMarathi && ENGLISH_DISH_MAP[rawMarathi]) {
      return ENGLISH_DISH_MAP[rawMarathi];
    }
    return rawName || rawMarathi || 'Item';
  } else {
    // Marathi requested ('mr')
    if (rawMarathi) return rawMarathi;
    if (rawName && isDevanagari(rawName)) return rawName;
    const lower = rawName.toLowerCase();
    if (MARATHI_DISH_MAP[lower]) return MARATHI_DISH_MAP[lower];
    for (const [key, val] of Object.entries(MARATHI_DISH_MAP)) {
      if (lower.includes(key)) return val;
    }
    return rawName || 'आयटम';
  }
}

// 12-Hour AM/PM Time Formatter
export function format12HourTime(dateVal = new Date()) {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal || Date.now());
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' becomes '12'
  const hoursStr = String(hours).padStart(2, '0');
  return `${hoursStr}:${minutes} ${ampm}`;
}

// DD-MM-YYYY Date Formatter
export function formatReceiptDate(dateVal = new Date()) {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal || Date.now());
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Print Kitchen Order Ticket (KOT)
 * Matches exact layout provided in Photo 1
 */
export function printKOTReceipt({
  tableNo,
  billNo,
  tokenNo,
  sectionName = 'FIRST FLOOR',
  kotRunNo = 1,
  items = [],
  orderNote,
  waiter = 'Raju',
  language
}) {
  if (!items || items.length === 0) return;

  const printWindow = window.open('', '_blank', 'width=420,height=600');
  if (!printWindow) {
    console.warn('Print pop-up window was blocked by the browser. Please allow pop-ups for this POS site.');
    return;
  }

  const now = new Date();
  const dateFormatted = formatReceiptDate(now);
  const timeFormatted = format12HourTime(now);
  const currentLang = language || getPrintLanguage();

  // KOT title line (e.g., 'KOT No : Checking' or token number)
  const kotNoDisplay = tokenNo || (kotRunNo ? `${kotRunNo}` : 'Checking');
  const tableDisplay = tableNo || 'Takeaway';
  const billNoDisplay = billNo || tokenNo?.replace(/^#/, '') || (tableNo ? String(tableNo).replace(/\D/g, '') : '') || '1';
  const waiterDisplay = waiter || 'Raju';
  const sectionDisplay = (sectionName || 'FIRST FLOOR').toUpperCase();

  const itemsHtml = items.map((item) => {
    const dishName = getPrintDishName(item, currentLang);
    const qty = item.unit || item.qtyDisplay || item.qty || 1;
    const isParcel = item.isParcel || (item.customNote && item.customNote.toLowerCase().includes('parcel'));
    const displayName = `${dishName}${isParcel ? ' [PARCEL]' : ''}`;
    return `
      <tr>
        <td class="col-item">
          ${displayName}
          ${item.customNote && !item.customNote.toLowerCase().includes('parcel') ? `<div style="font-size: 10px; font-weight: normal; font-style: italic; color: #475569;">(${item.customNote})</div>` : ''}
        </td>
        <td class="col-qty">${qty}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>KOT - Karuna Hotel</title>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Zen+Dots&display=swap" rel="stylesheet">
      <style>
        @page {
          size: 72mm auto;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          width: 100%;
          margin: 0 auto !important;
          padding: 0 !important;
          background: #fff;
          color: #000;
          font-family: 'Nunito Sans', 'Montserrat', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif;
          font-size: 12px;
          line-height: 1.35;
          display: flex;
          justify-content: center;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .receipt-container {
          width: 65mm;
          max-width: 65mm;
          margin: 0 auto;
          padding: 2mm 2mm;
          box-sizing: border-box;
        }
        .kot-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 17px;
          font-weight: 800;
          text-align: center;
          color: #000;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin-bottom: 2px;
        }
        .meta-table td {
          padding: 1.5px 0;
          font-family: 'Nunito Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          color: #000;
        }
        .meta-left {
          text-align: left;
          width: 53%;
          padding-right: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .meta-right {
          text-align: right;
          width: 47%;
          padding-left: 2px;
          white-space: nowrap;
        }
        .dashed-line {
          border-top: 1.5px dashed #000;
          margin: 4px 0;
          width: 100%;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .items-table th {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #000;
          padding: 2px 0;
        }
        .items-table td {
          padding: 3px 0;
          font-family: 'Nunito Sans', 'Noto Sans Devanagari', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          color: #000;
          vertical-align: top;
        }
        .col-item {
          width: 78%;
          text-align: left;
          word-break: break-word;
          padding-right: 4px;
        }
        .col-qty {
          width: 22%;
          text-align: right;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          white-space: nowrap;
        }
        @media print {
          html, body {
            width: 72mm !important;
            max-width: 72mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
          }
          .receipt-container {
            width: 65mm !important;
            max-width: 65mm !important;
            margin: 0 auto !important;
            padding: 2mm 2mm !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="kot-title">KOT No : ${kotNoDisplay}</div>

        <table class="meta-table">
          <tr>
            <td class="meta-left">Table No : ${tableDisplay}</td>
            <td class="meta-right">Bill No : ${billNoDisplay}</td>
          </tr>
          <tr>
            <td class="meta-left">Section : <span style="font-size: 10px; font-weight: 700;">${sectionDisplay}</span></td>
            <td class="meta-right">Date : ${dateFormatted}</td>
          </tr>
          <tr>
            <td class="meta-left">Waiter : ${waiterDisplay}</td>
            <td class="meta-right">Time : ${timeFormatted}</td>
          </tr>
        </table>

        <div class="dashed-line"></div>

        <table class="items-table">
          <thead>
            <tr>
              <th class="col-item">Item</th>
              <th class="col-qty">Qty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="2" style="padding: 0;">
                <div class="dashed-line" style="margin: 2px 0 3px 0;"></div>
              </td>
            </tr>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="dashed-line"></div>
        ${orderNote ? `<div style="font-size: 11px; font-weight: 600; margin-top: 3px; color: #000;">Note: ${orderNote}</div>` : ''}
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Print Cash-Memo Thermal Receipt (Customer Bill)
 * Matches exact layout provided in Photo 2 with Smartphone Scanner Icon & Google Fonts
 */
export async function printThermalReceipt(billData, options = {}) {
  const printWindow = window.open('', '_blank', 'width=440,height=650');
  if (!printWindow) {
    console.warn('Print pop-up window was blocked by the browser. Please allow pop-ups for this POS site.');
    return;
  }

  const billDate = new Date(billData.createdAt || Date.now());
  const dateFormatted = formatReceiptDate(billDate);
  const timeFormatted = format12HourTime(billDate);
  const currentLang = options.language || getPrintLanguage();

  const billNumber = billData.invoiceNo || billData.id || billData.tokenNo || '6';
  const tableName = billData.tableNo || '16A';
  const sectionName = (billData.sectionName || 'FIRST FLOOR').toUpperCase();
  const waiterName = billData.waiter || billData.paymentDetails?.waiter || 'Raju';
  const grandTotal = billData.total || billData.grandTotal || 0;

  // Dynamically resolve UPI configurations
  const upiId = (typeof localStorage !== 'undefined' && localStorage.getItem('karuna_upi_id')) || '8446091809@ybl';
  const payeeName = (typeof localStorage !== 'undefined' && localStorage.getItem('karuna_payee_name')) || 'Karuna Hotel';
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR`;

  let qrCodeUrl = '';
  try {
    qrCodeUrl = await QRCode.toDataURL(upiString, {
      margin: 1,
      width: 100,
      errorCorrectionLevel: 'M'
    });
  } catch (e) {
    qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiString)}&margin=1`;
  }

  const itemsHtml = (billData.items || []).map((item) => {
    const dishName = getPrintDishName(item, currentLang);
    const itemQty = parseFloat(item.qty) || 1;
    const itemPrice = parseFloat(item.price) || 0;
    const lineAmount = Math.round((itemPrice * itemQty) * 100) / 100;
    const isKgItem = item.weightKg !== undefined || (item.unit && (item.unit.includes('g') || item.unit.toLowerCase().includes('kg')));
    const qtyDisplay = isKgItem ? (item.unit || `${itemQty}`) : `${itemQty}`;
    const isParcel = item.isParcel || (item.customNote && item.customNote.toLowerCase().includes('parcel'));
    const displayName = `${dishName}${isParcel ? ' (Parcel)' : ''}`;

    return `
      <tr>
        <td class="col-item">${displayName}</td>
        <td class="col-price">${itemPrice}</td>
        <td class="col-qty">${qtyDisplay}</td>
        <td class="col-amount">${lineAmount}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cash Memo - Karuna Hotel</title>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Zen+Dots&display=swap" rel="stylesheet">
      <style>
        @page {
          size: 72mm auto;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          width: 100%;
          margin: 0 auto !important;
          padding: 0 !important;
          background: #fff;
          color: #000;
          font-family: 'Nunito Sans', 'Montserrat', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif;
          font-size: 12px;
          line-height: 1.3;
          display: flex;
          justify-content: center;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .receipt-container {
          width: 65mm;
          max-width: 65mm;
          margin: 0 auto;
          padding: 2mm 2mm;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin-bottom: 3px;
        }
        .hotel-name {
          font-family: 'Montserrat', 'Playfair Display', sans-serif;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #000;
          margin-bottom: 1px;
        }
        .location, .phone {
          font-family: 'Nunito Sans', 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #000;
          margin-bottom: 1px;
        }
        .cash-memo-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #000;
          margin-top: 3px;
          margin-bottom: 4px;
        }
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin-bottom: 2px;
        }
        .meta-table td {
          padding: 1.5px 0;
          font-family: 'Nunito Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          color: #000;
        }
        .meta-left {
          text-align: left;
          width: 53%;
          padding-right: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .meta-right {
          text-align: right;
          width: 47%;
          padding-left: 2px;
          white-space: nowrap;
        }
        .dashed-line {
          border-top: 1.5px dashed #000;
          margin: 4px 0;
          width: 100%;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .items-table th {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #000;
          padding: 2px 0;
        }
        .items-table td {
          padding: 2.5px 0;
          font-family: 'Nunito Sans', 'Noto Sans Devanagari', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #000;
          vertical-align: top;
        }
        .col-item {
          width: 44%;
          text-align: left;
          word-break: break-word;
          padding-right: 3px;
        }
        .col-price {
          width: 18%;
          text-align: right;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          padding-right: 3px;
          white-space: nowrap;
        }
        .col-qty {
          width: 14%;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          padding-right: 2px;
          white-space: nowrap;
        }
        .col-amount {
          width: 24%;
          text-align: right;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          white-space: nowrap;
        }
        .bottom-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          box-sizing: border-box;
          margin-top: 5px;
        }
        .qr-col {
          width: 48%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .scan-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: #000;
          margin-bottom: 3px;
          white-space: nowrap;
        }
        .phone-qr-wrapper {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .phone-scanner-icon {
          width: 44px;
          height: 50px;
          object-fit: contain;
          flex-shrink: 0;
          display: block;
        }
        .qr-img {
          width: 50px;
          height: 50px;
          display: block;
          flex-shrink: 0;
        }
        .total-col {
          width: 50%;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          padding-left: 2px;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          width: 100%;
        }
        .total-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #000;
        }
        .total-val {
          font-family: 'Montserrat', sans-serif;
          font-size: 19px;
          font-weight: 800;
          color: #000;
        }
        .thank-you-text {
          font-family: 'Nunito Sans', 'Montserrat', sans-serif;
          font-size: 9.5px;
          font-weight: 800;
          color: #000;
          text-align: right;
          width: 100%;
          margin-top: 3px;
          letter-spacing: -0.2px;
          white-space: nowrap;
        }
        @media print {
          html, body {
            width: 72mm !important;
            max-width: 72mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
          }
          .receipt-container {
            width: 65mm !important;
            max-width: 65mm !important;
            margin: 0 auto !important;
            padding: 2mm 2mm !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <h1 class="hotel-name">Karuna Hotel</h1>
          <div class="location">Solapur</div>
          <div class="phone">8446091809</div>
          <h2 class="cash-memo-title">CASH-MEMO</h2>
        </div>

        <table class="meta-table">
          <tr>
            <td class="meta-left">Table No : ${tableName}</td>
            <td class="meta-right">Bill No : ${billNumber}</td>
          </tr>
          <tr>
            <td class="meta-left">Section : <span style="font-size: 10px; font-weight: 700;">${sectionName}</span></td>
            <td class="meta-right">Date : ${dateFormatted}</td>
          </tr>
          <tr>
            <td class="meta-left">Waiter : ${waiterName}</td>
            <td class="meta-right">Time : ${timeFormatted}</td>
          </tr>
        </table>

        <div class="dashed-line"></div>

        <table class="items-table">
          <thead>
            <tr>
              <th class="col-item">Item</th>
              <th class="col-price">Price</th>
              <th class="col-qty">Qty</th>
              <th class="col-amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="4" style="padding: 0;">
                <div class="dashed-line" style="margin: 2px 0 3px 0;"></div>
              </td>
            </tr>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="dashed-line"></div>

        <div class="bottom-section">
          <div class="qr-col">
            <div class="scan-title">SCAN ME TO PAY!</div>
            <div class="phone-qr-wrapper">
              <img class="phone-scanner-icon" src="${QR_SCAN_PHONE_ICON_DATA_URL}" alt="Scan QR" />
              <img class="qr-img" src="${qrCodeUrl}" alt="UPI QR" />
            </div>
          </div>

          <div class="total-col">
            <div class="total-line">
              <span class="total-label">Total:</span>
              <span class="total-val">₹${grandTotal}</span>
            </div>
            <div class="dashed-line" style="margin: 4px 0;"></div>
            <div class="thank-you-text">Thank You! Visit Again!</div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
