// PDF Report generator for Low Stock Raw Materials

export function generateLowStockPDFReport(lowStockItems) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    console.warn('Print pop-up window was blocked by the browser. Please allow pop-ups for this POS site.');
    return;
  }
  const dateStr = new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Low Stock Raw Materials Report - Karuna Hotel</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
        .header { border-bottom: 3px solid #dc2626; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { margin: 0; color: #991b1b; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
        .header p { margin: 5px 0 0 0; color: #64748b; font-size: 13px; }
        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-weight: 600; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f8fafc; color: #334155; text-align: left; padding: 12px; font-size: 13px; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .badge-danger { background-color: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 12px; display: inline-block; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KARUNA HOTEL - LOW STOCK REPORT</h1>
        <p>Generated on: ${dateStr}</p>
      </div>

      <div class="alert-box">
        ⚠️ CRITICAL INVENTORY WARNING: ${lowStockItems.length} item(s) are below minimum threshold levels. Urgent replenishment required.
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Raw Material Name</th>
            <th>Current Stock</th>
            <th>Minimum Threshold</th>
            <th>Unit</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${lowStockItems.map((item, index) => `
            <tr>
              <td><strong>${index + 1}</strong></td>
              <td><strong>${item.name}</strong></td>
              <td style="color: #dc2626; font-weight: bold;">${item.quantity}</td>
              <td>${item.minThreshold}</td>
              <td>${item.unit}</td>
              <td><span class="badge-danger">LOW STOCK</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        Karuna Hotel POS & Inventory ERP Software • Confidential Report
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
 * PDF Revenue & Sales Report Generator
 * Generates printable executive revenue report with date of download and date filter
 */
export function generateRevenuePDFReport({
  bills = [],
  metrics = {},
  dateFilterLabel = 'All Time',
  counterFilterLabel = 'All Counters',
  selectedDate = null
}) {
  const printWindow = window.open('', '_blank', 'width=950,height=950');
  if (!printWindow) {
    alert('Please allow popups to view and download the Revenue Report PDF.');
    return;
  }

  const downloadDateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const displayFilterText = selectedDate
    ? `Specific Date: ${new Date(selectedDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}`
    : dateFilterLabel;

  const totalRev = parseFloat(metrics.totalRevenue || 0);
  const totalBillsCount = metrics.totalBills !== undefined ? metrics.totalBills : bills.length;
  const cashRev = parseFloat(metrics.cashTotal || 0);
  const onlineRev = parseFloat(metrics.onlineTotal || 0);
  const cardRev = parseFloat(metrics.cardTotal || 0);
  const totalDiscounts = parseFloat(metrics.totalDiscounts || 0);
  const totalDelivery = parseFloat(metrics.totalDelivery || 0);
  const totalContainer = parseFloat(metrics.totalContainer || 0);
  const totalWaiterTips = parseFloat(metrics.totalWaiterTips || 0);
  const totalServiceCharges = parseFloat(metrics.totalServiceCharges || 0);
  const totalExtraCharges = parseFloat(
    metrics.totalExtraCharges !== undefined
      ? metrics.totalExtraCharges
      : (totalDelivery + totalContainer + totalWaiterTips + totalServiceCharges)
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Revenue Report - Karuna Hotel</title>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px 30px; color: #0f172a; margin: 0; background: #fff; }
        .header { border-bottom: 3px solid #1e293b; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
        .header h1 { margin: 0; color: #0f172a; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; }
        .header .sub { margin-top: 4px; color: #64748b; font-size: 12px; font-weight: 600; }
        .header-meta { text-align: right; font-size: 12px; color: #475569; }
        .header-meta strong { color: #0f172a; }
        
        .scope-banner { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
        .scope-banner .tag { background: #2563eb; color: #fff; font-weight: 800; padding: 3px 10px; border-radius: 6px; font-size: 11px; text-transform: uppercase; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-bottom: 24px; }
        .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 12px; text-align: left; }
        .kpi-label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
        .kpi-val { font-size: 16px; font-weight: 900; color: #0f172a; }
        .kpi-sub { font-size: 9.5px; font-weight: 600; color: #94a3b8; margin-top: 2px; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th { background-color: #f1f5f9; color: #334155; text-align: left; padding: 9px 10px; font-size: 11px; border-bottom: 2px solid #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #1e293b; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .mode-badge { display: inline-block; padding: 2px 7px; border-radius: 5px; font-size: 9.5px; font-weight: 800; text-transform: uppercase; }
        .mode-cash { background: #dcfce7; color: #15803d; }
        .mode-online { background: #ede9fe; color: #6d28d9; }
        .mode-card { background: #e0f2fe; color: #0369a1; }
        .mode-split { background: #fef3c7; color: #b45309; }

        .charge-badge { display: inline-block; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 4px; margin-left: 3px; }
        .charge-disc { background: #ffe4e6; color: #be123c; }
        .charge-del { background: #dbeafe; color: #1d4ed8; }
        .charge-cont { background: #fef3c7; color: #b45309; }
        .charge-tip { background: #d1fae5; color: #047857; }
        .charge-serv { background: #e0e7ff; color: #4338ca; }

        .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; font-weight: 600; }
        
        @media print {
          body { padding: 15px; }
          .no-print { display: none; }
          @page { margin: 10mm; size: auto; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Karuna Hotel — Sales & Revenue Report</h1>
          <div class="sub">Hotel Management ERP System • Official Audit Statement</div>
        </div>
        <div class="header-meta">
          <div>Report Type: <strong>${displayFilterText}</strong></div>
          <div>Downloaded On: <strong>${downloadDateStr}</strong></div>
          <div>Scope: <strong>${counterFilterLabel}</strong></div>
        </div>
      </div>

      <div class="scope-banner">
        <div>
          <strong>Report Period:</strong> ${displayFilterText} &nbsp;•&nbsp; 
          <strong>Counter:</strong> ${counterFilterLabel}
        </div>
        <div class="tag">Verified Official Record</div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card" style="border-left: 4px solid #2563eb;">
          <div class="kpi-label">Total Revenue</div>
          <div class="kpi-val" style="color: #2563eb;">₹${totalRev.toFixed(2)}</div>
          <div class="kpi-sub">${totalBillsCount} Bills Settled</div>
        </div>

        <div class="kpi-card" style="border-left: 4px solid #16a34a;">
          <div class="kpi-label">Cash Sales</div>
          <div class="kpi-val" style="color: #16a34a;">₹${cashRev.toFixed(2)}</div>
          <div class="kpi-sub">Direct Cash</div>
        </div>

        <div class="kpi-card" style="border-left: 4px solid #7c3aed;">
          <div class="kpi-label">Online / UPI</div>
          <div class="kpi-val" style="color: #7c3aed;">₹${onlineRev.toFixed(2)}</div>
          <div class="kpi-sub">QR & Net Banking</div>
        </div>

        <div class="kpi-card" style="border-left: 4px solid #0284c7;">
          <div class="kpi-label">Card Sales</div>
          <div class="kpi-val" style="color: #0284c7;">₹${cardRev.toFixed(2)}</div>
          <div class="kpi-sub">Debit/Credit POS</div>
        </div>

        <div class="kpi-card" style="border-left: 4px solid #e11d48;">
          <div class="kpi-label">Discounts Given</div>
          <div class="kpi-val" style="color: #e11d48;">₹${totalDiscounts.toFixed(2)}</div>
          <div class="kpi-sub">Total Deductions</div>
        </div>

        <div class="kpi-card" style="border-left: 4px solid #0d9488;">
          <div class="kpi-label">Extra Charges</div>
          <div class="kpi-val" style="color: #0d9488;">₹${totalExtraCharges.toFixed(2)}</div>
          <div class="kpi-sub">Del, Cont, Tip, Serv</div>
        </div>

        <div class="kpi-card" style="border-left: 4px solid #d97706;">
          <div class="kpi-label">Average / Bill</div>
          <div class="kpi-val" style="color: #d97706;">₹${totalBillsCount > 0 ? (totalRev / totalBillsCount).toFixed(2) : '0.00'}</div>
          <div class="kpi-sub">Avg Ticket Size</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Bill / Inv No</th>
            <th>Table / Parcel</th>
            <th>Date & Time</th>
            <th>Payment Mode</th>
            <th style="text-align: center;">Items</th>
            <th style="text-align: right;">Amount & Charges (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${bills.length === 0 ? `
            <tr>
              <td colspan="7" style="text-align: center; padding: 25px; color: #94a3b8; font-weight: bold;">
                No bills found for the selected date or filter.
              </td>
            </tr>
          ` : bills.map((b, idx) => {
            const bAmount = parseFloat(b.finalTotal || b.grandTotal || b.total || 0) || 0;
            const bDate = b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—';
            const bMode = (b.paymentMode || b.paymentDetails?.mode || 'CASH').toUpperCase();
            let modeClass = 'mode-cash';
            if (bMode.includes('ONLINE') || bMode.includes('UPI')) modeClass = 'mode-online';
            else if (bMode.includes('CARD')) modeClass = 'mode-card';
            else if (bMode.includes('SPLIT')) modeClass = 'mode-split';

            const itemsCount = b.items ? b.items.reduce((s, it) => s + (parseFloat(it.qty) || 1), 0) : 0;
            const billIdDisplay = b.invoiceNo || b.billNo || b.id;

            const bDisc = parseFloat(b.discountAmount) || (typeof b.discount === 'number' ? b.discount : (parseFloat(b.discount?.amount || b.discount?.value) || 0));
            const bDel = parseFloat(b.deliveryCharge) || 0;
            const bCont = parseFloat(b.containerCharge) || 0;
            const bTip = parseFloat(b.waiterTip) || 0;
            const bServ = parseFloat(b.serviceCharge) || 0;

            const chargesBadges = [];
            if (bDisc > 0) chargesBadges.push(`<span class="charge-badge charge-disc">Disc -₹${bDisc.toFixed(2)}</span>`);
            if (bDel > 0) chargesBadges.push(`<span class="charge-badge charge-del">Del +₹${bDel.toFixed(2)}</span>`);
            if (bCont > 0) chargesBadges.push(`<span class="charge-badge charge-cont">Cont +₹${bCont.toFixed(2)}</span>`);
            if (bTip > 0) chargesBadges.push(`<span class="charge-badge charge-tip">Tip +₹${bTip.toFixed(2)}</span>`);
            if (bServ > 0) chargesBadges.push(`<span class="charge-badge charge-serv">Serv +₹${bServ.toFixed(2)}</span>`);

            return `
              <tr>
                <td style="font-weight: 700; color: #64748b;">${idx + 1}</td>
                <td style="font-weight: 800; font-family: monospace;">${billIdDisplay}</td>
                <td style="font-weight: 800;">${b.tableName || b.tableNo || 'Takeaway'}</td>
                <td>${bDate}</td>
                <td><span class="mode-badge ${modeClass}">${bMode}</span></td>
                <td style="text-align: center; font-weight: 700;">${itemsCount}</td>
                <td style="text-align: right;">
                  <div style="font-weight: 900; color: #0f172a; font-size: 12px;">₹${bAmount.toFixed(2)}</div>
                  ${chargesBadges.length > 0 ? `<div style="margin-top: 3px;">${chargesBadges.join(' ')}</div>` : ''}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        Karuna Hotel POS & ERP Suite • Generated on ${downloadDateStr} • Page 1 of 1
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
