import QRCode from 'qrcode';

export function printKOTReceipt({ tableNo, tokenNo, kotRunNo = 1, items, orderNote, waiter }) {
  if (!items || items.length === 0) return;

  const printWindow = window.open('', '_blank', 'width=420,height=600');
  if (!printWindow) {
    console.warn('Print pop-up window was blocked by the browser. Please allow pop-ups for this POS site.');
    return;
  }
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateFormatted = `${day}-${month}-${year}`;

  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const tokenFormatted = tokenNo ? String(tokenNo).replace(/^#/, '') : (kotRunNo ? `${kotRunNo}` : '1000');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>KOT - Karuna Hotel</title>
      <meta charset="utf-8">
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
          width: 72mm;
          max-width: 72mm;
          margin: 0 auto;
          padding: 4px;
          background: #fff;
          color: #000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 13px;
          line-height: 1.35;
          overflow-x: hidden;
        }
        .kot-card {
          border: 2px dashed #000;
          border-radius: 6px;
          padding: 8px 10px;
          background: #fff;
          width: 100%;
          box-sizing: border-box;
        }
        .kot-title {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
          text-align: center;
          color: #000;
        }
        .kot-subtitle {
          font-size: 10.5px;
          font-weight: 800;
          color: #334155;
          letter-spacing: 0.8px;
          margin-top: 1px;
          text-align: center;
          text-transform: uppercase;
        }
        .dashed-divider {
          border-top: 1.5px dashed #000;
          margin: 6px 0;
        }
        .meta-group {
          font-size: 12.5px;
          font-weight: 800;
          line-height: 1.4;
          color: #000;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }
        .items-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }
        .items-header {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          font-weight: 900;
          color: #000;
          padding: 2px 0;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 3.5px 0;
          font-size: 13.5px;
          font-weight: 900;
          color: #000;
        }
        .item-name {
          flex: 1;
          padding-right: 6px;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .item-qty {
          font-size: 14.5px;
          font-weight: 900;
          text-align: right;
          white-space: nowrap;
          shrink-0;
        }
        .footer-text {
          font-size: 10.5px;
          font-weight: 700;
          color: #475569;
          text-align: center;
          margin-top: 4px;
        }
        @media print {
          html, body {
            width: 72mm !important;
            max-width: 72mm !important;
            margin: 0 auto !important;
            padding: 2px !important;
            overflow-x: hidden !important;
          }
          .kot-card {
            border: 2px dashed #000 !important;
            width: 100% !important;
            max-width: 72mm !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="kot-card">
        <h1 class="kot-title">K. O. T.</h1>
        <div class="kot-subtitle">KITCHEN ORDER TICKET</div>
        
        <div class="dashed-divider"></div>
        
        <div class="meta-group">
          <div class="meta-row">
            <span>Table: ${tableNo || 'Takeaway'}</span>
            <span>Token: #${tokenFormatted}</span>
          </div>
          <div class="meta-row">
            <span>Date: ${dateFormatted}</span>
            <span>Time: ${timeStr}</span>
          </div>
          ${orderNote ? `<div style="margin-top: 3px; font-size: 11px; color: #b91c1c;">Note: ${orderNote}</div>` : ''}
        </div>
        
        <div class="dashed-divider"></div>
        
        <div class="items-header">
          <span>Item</span>
          <span>Qty</span>
        </div>
        
        <div class="dashed-divider" style="margin: 3px 0;"></div>
        
        <div>
          ${items.map(item => {
            const qtyStr = item.unit || item.qtyDisplay || item.qty;
            const isParcel = item.isParcel || (item.customNote && item.customNote.toLowerCase().includes('parcel'));
            const displayName = `${item.name}${isParcel ? ' <span style="color:#b91c1c; font-weight:900;">[PARCEL]</span>' : ''}`;
            return `
              <div class="item-row">
                <div class="item-name">
                  ${displayName}
                  ${item.customNote && !item.customNote.toLowerCase().includes('parcel') ? `<div style="font-size: 10px; font-weight: normal; font-style: italic; color: #475569;">(${item.customNote})</div>` : ''}
                </div>
                <div class="item-qty">${qtyStr}</div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="dashed-divider"></div>
        
        <div class="footer-text">
          Karuna Hotel Kitchen System
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

export async function printThermalReceipt(billData) {
  const printWindow = window.open('', '_blank', 'width=440,height=650');
  if (!printWindow) {
    console.warn('Print pop-up window was blocked by the browser. Please allow pop-ups for this POS site.');
    return;
  }
  const billDate = new Date(billData.createdAt || Date.now());
  
  const day = String(billDate.getDate()).padStart(2, '0');
  const month = String(billDate.getMonth() + 1).padStart(2, '0');
  const year = billDate.getFullYear();
  const dateFormatted = `${day}-${month}-${year}`;

  const timeFormatted = billDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const billNumber = billData.invoiceNo || billData.id || billData.tokenNo || '1';
  const tokenFormatted = billData.tokenNo ? String(billData.tokenNo).replace(/^#/, '') : (billData.id || '1000');
  const tableName = billData.tableNo || '14A';
  const sectionName = (billData.sectionName || 'Dine In Area').toUpperCase();
  const waiterName = billData.waiter || billData.paymentDetails?.waiter || 'Staff';
  const grandTotal = billData.total || 0;

  // Dynamically resolve UPI configurations
  const upiId = (typeof localStorage !== 'undefined' && localStorage.getItem('karuna_upi_id')) || '8446091809@ybl';
  const payeeName = (typeof localStorage !== 'undefined' && localStorage.getItem('karuna_payee_name')) || 'Karuna Hotel';
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR`;
  
  let qrCodeUrl = '';
  try {
    qrCodeUrl = await QRCode.toDataURL(upiString, {
      margin: 1,
      width: 110,
      errorCorrectionLevel: 'M'
    });
  } catch (e) {
    qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiString)}&margin=1`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cash Memo - Karuna Hotel</title>
      <meta charset="utf-8">
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
          width: 72mm;
          max-width: 72mm;
          margin: 0 auto;
          padding: 4px 6px;
          color: #000;
          background: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 12.5px;
          line-height: 1.3;
          overflow-x: hidden;
        }
        .bill-container {
          width: 100%;
          max-width: 72mm;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin-bottom: 5px;
        }
        .hotel-name {
          font-size: 20px;
          font-weight: 900;
          margin: 0 0 2px 0;
          letter-spacing: -0.2px;
          color: #000;
        }
        .location, .phone {
          font-size: 12px;
          font-weight: 700;
          margin: 1px 0;
          color: #000;
        }
        .cash-memo-title {
          font-size: 16px;
          font-weight: 900;
          margin: 5px 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #000;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 2px;
          color: #000;
        }
        .dashed-line {
          border-top: 1.5px dashed #000;
          margin: 5px 0;
        }
        .items-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 12.5px;
        }
        .items-table th {
          padding: 2.5px 0;
          font-weight: 900;
          color: #000;
          font-size: 12px;
        }
        .items-table td {
          padding: 3px 0;
          font-weight: 800;
          color: #000;
          vertical-align: top;
        }
        .col-item {
          width: 48%;
          text-align: left;
          padding-right: 4px;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .col-qty {
          width: 24%;
          text-align: center;
          font-weight: 900;
          word-break: break-word;
        }
        .col-amount {
          width: 28%;
          text-align: right;
          font-weight: 900;
          white-space: nowrap;
        }
        .bottom-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
          margin-top: 6px;
        }
        .qr-block {
          width: 44%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .scan-title {
          font-size: 9.5px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          margin-bottom: 2px;
          color: #000;
          text-align: center;
        }
        .qr-wrapper {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .qr-img {
          width: 68px;
          height: 68px;
          display: block;
        }
        .total-block {
          width: 54%;
          text-align: right;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-left: 2px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 15px;
          font-weight: 900;
          color: #000;
        }
        .total-amount {
          font-size: 19px;
          font-weight: 900;
          color: #000;
        }
        .thank-you {
          font-size: 11px;
          font-weight: 800;
          text-align: center;
          margin-top: 6px;
          color: #000;
        }
        @media print {
          html, body {
            width: 72mm !important;
            max-width: 72mm !important;
            margin: 0 auto !important;
            padding: 2px 2px !important;
            overflow-x: hidden !important;
          }
          .bill-container {
            width: 100% !important;
            max-width: 72mm !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <div class="header">
          <h1 class="hotel-name">Karuna Hotel</h1>
          <div class="location">Solapur</div>
          <div class="phone">8446091809</div>
          <h2 class="cash-memo-title">CASH-MEMO</h2>
        </div>

        <div class="info-row">
          <div>Table No : ${tableName}</div>
          <div>Bill No : ${billNumber}</div>
        </div>
        <div class="info-row">
          <div>Section : ${sectionName}</div>
          <div>Token : #${tokenFormatted}</div>
        </div>
        <div class="info-row">
          <div>Date : ${dateFormatted}</div>
          <div>Time : ${timeFormatted}</div>
        </div>

        <div class="dashed-line"></div>

        <table class="items-table">
          <thead>
            <tr>
              <th class="col-item">Item</th>
              <th class="col-qty">Qty/Unit</th>
              <th class="col-amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="3" style="padding: 0;">
                <div class="dashed-line" style="margin: 2px 0 4px 0;"></div>
              </td>
            </tr>
            ${(billData.items || []).map(item => {
              const itemQty = parseFloat(item.qty) || 1;
              const isKgItem = item.weightKg !== undefined || (item.unit && (item.unit.includes('g') || item.unit.toLowerCase().includes('kg'))) || item.hasMultiplePrices;
              let qtyDisplay;
              if (isKgItem) {
                if (itemQty > 1 && item.unit && !item.unit.startsWith(`${itemQty} `) && !item.unit.startsWith(`${itemQty}×`)) {
                  qtyDisplay = `${itemQty} × ${item.unit}`;
                } else {
                  qtyDisplay = item.unit || `${itemQty} Kg`;
                }
              } else {
                qtyDisplay = `${itemQty}`;
              }
              const lineAmount = Math.round(((item.price || 0) * itemQty) * 100) / 100;
              const isParcel = item.isParcel || (item.customNote && item.customNote.toLowerCase().includes('parcel'));
              const displayName = `${item.name}${isParcel ? ' (Parcel)' : ''}`;
              return `
                <tr>
                  <td class="col-item">${displayName}</td>
                  <td class="col-qty">${qtyDisplay}</td>
                  <td class="col-amount">₹${lineAmount.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="dashed-line"></div>

        <div class="bottom-section">
          <div class="qr-block">
            <div class="scan-title">SCAN ME TO PAY!</div>
            <div class="qr-wrapper">
              <img class="qr-img" src="${qrCodeUrl}" alt="UPI QR" />
            </div>
          </div>

          <div class="total-block">
            <div>
              <div class="total-row">
                <span>Total:</span>
                <span class="total-amount">₹${grandTotal}</span>
              </div>
              <div class="dashed-line" style="margin: 4px 0;"></div>
            </div>
            <div class="thank-you">
              Thank You! Visit Again!
            </div>
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
