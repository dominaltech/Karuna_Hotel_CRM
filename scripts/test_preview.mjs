import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QR_SCAN_PHONE_ICON_DATA_URL } from '../src/utils/qrScanPhoneIcon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Preview Test</title>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f1f5f9; display: flex; justify-content: center; padding: 20px; font-family: 'Nunito Sans', sans-serif; }
    .receipt-container {
      width: 65mm;
      max-width: 65mm;
      background: #fff;
      padding: 2mm 2mm;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      border: 1px solid #e2e8f0;
      color: #000;
    }
    .header { text-align: center; margin-bottom: 3px; }
    .hotel-name { font-family: 'Montserrat', sans-serif; font-size: 19px; font-weight: 800; }
    .location, .phone { font-family: 'Nunito Sans', sans-serif; font-size: 12px; font-weight: 700; }
    .cash-memo-title { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 800; margin-top: 3px; margin-bottom: 4px; }
    
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
      padding-right: 6px;
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
      padding: 2px 0;
    }
    .items-table td {
      padding: 2.5px 0;
      font-family: 'Nunito Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
    }
    .col-item { width: 44%; text-align: left; }
    .col-price { width: 18%; text-align: right; font-family: 'Montserrat', sans-serif; font-weight: 700; }
    .col-qty { width: 14%; text-align: center; font-family: 'Montserrat', sans-serif; font-weight: 700; }
    .col-amount { width: 24%; text-align: right; font-family: 'Montserrat', sans-serif; font-weight: 800; }

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
      border: 1px solid #000;
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
      font-size: 15px;
      font-weight: 700;
    }
    .total-val {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px;
      font-weight: 800;
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
        <td class="meta-left">Table No : F2</td>
        <td class="meta-right">Bill No : 4451</td>
      </tr>
      <tr>
        <td class="meta-left">Section : <span style="font-size: 11px;">FIRST FLOOR</span></td>
        <td class="meta-right">Date : 01-10-2026</td>
      </tr>
      <tr>
        <td class="meta-left">Waiter : Raju</td>
        <td class="meta-right">Time : 01:28 PM</td>
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
        <tr>
          <td class="col-item">पोहे</td>
          <td class="col-price">35</td>
          <td class="col-qty">3</td>
          <td class="col-amount">105</td>
        </tr>
      </tbody>
    </table>

    <div class="dashed-line"></div>

    <div class="bottom-section">
      <div class="qr-col">
        <div class="scan-title">SCAN ME TO PAY!</div>
        <div class="phone-qr-wrapper">
          <img class="phone-scanner-icon" src="${QR_SCAN_PHONE_ICON_DATA_URL}" alt="Scan QR" />
          <div class="qr-img" style="display:flex;align-items:center;justify-content:center;font-size:9px;">QR CODE</div>
        </div>
      </div>

      <div class="total-col">
        <div class="total-line">
          <span class="total-label">Total:</span>
          <span class="total-val">₹105</span>
        </div>
        <div class="dashed-line" style="margin: 4px 0;"></div>
        <div class="thank-you-text">Thank You! Visit Again!</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.resolve(__dirname, '../public/test_preview.html'), html, 'utf8');
console.log('Written public/test_preview.html');
