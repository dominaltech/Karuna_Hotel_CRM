// Excel & CSV export and import helpers with price column validation for Karuna Hotel ERP

export function exportFoodItemsToCSV(dishes = [], categories = [], subCategories = []) {
  const categoryMap = {};
  (categories || []).forEach(c => { categoryMap[c.id] = c.name; });
  const subCategoryMap = {};
  (subCategories || []).forEach(s => { subCategoryMap[s.id] = s.name; });

  const headers = ['Sr. No.', 'Dish Name', 'Marathi Name', 'Category', 'Sub Category', 'Price (₹)', 'Base Rate Per Kg (₹)', 'Counter'];
  const rows = (dishes || []).map(dish => [
    dish.srNo || dish.id || '',
    `"${(dish.name || '').replace(/"/g, '""')}"`,
    `"${(dish.marathiName || '').replace(/"/g, '""')}"`,
    `"${(categoryMap[dish.categoryId] || '').replace(/"/g, '""')}"`,
    `"${(subCategoryMap[dish.subCategoryId] || '').replace(/"/g, '""')}"`,
    dish.price || 0,
    dish.pricePerKg || dish.sweetPricePerKg || '',
    `"${(dish.counter || 'Breakfast').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Karuna_POS_Menu_Rates_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function cleanNumber(str) {
  if (str === undefined || str === null) return NaN;
  const s = String(str).replace(/[₹\s,]|rs\.?|\/-/gi, '').trim();
  return parseFloat(s);
}

export function parseCSVAndValidateRates(fileContent) {
  const cleanContent = (fileContent || '').replace(/^\uFEFF/, '');
  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) {
    return { success: false, error: 'File is empty!' };
  }

  // Detect delimiter: comma, semicolon, or tab
  const firstLine = lines[0];
  let delimiter = ',';
  if (!firstLine.includes(',') && firstLine.includes(';')) delimiter = ';';
  else if (!firstLine.includes(',') && firstLine.includes('\t')) delimiter = '\t';

  // Helper to split row respecting quotes
  function splitCSVRow(row, delim) {
    const cols = [];
    let inQuote = false;
    let curr = '';
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      if (char === '"' && row[c + 1] === '"') {
        curr += '"';
        c++;
      } else if (char === '"') {
        inQuote = !inQuote;
      } else if (char === delim && !inQuote) {
        cols.push(curr.trim());
        curr = '';
      } else {
        curr += char;
      }
    }
    cols.push(curr.trim());
    return cols;
  }

  // Parse header line
  const headerCols = splitCSVRow(lines[0], delimiter);
  const headers = headerCols.map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  
  const pricePerKgColIndex = headers.findIndex(h => h.includes('per kg') || h.includes('per kilo') || h.includes('kilo') || h.includes('sweet') || h.includes('किलो'));
  const priceColIndex = headers.findIndex((h, idx) => idx !== pricePerKgColIndex && (h === 'price (₹)' || h.includes('price') || h.includes('rate') || h.includes('mrp') || h.includes('amount') || h.includes('किंमत') || h.includes('दर')));

  if (priceColIndex === -1) {
    return {
      success: false,
      missingPriceAlert: true,
      error: 'CRITICAL ALERT: Missing "Price" column in the imported CSV file! Price update aborted to prevent corruption.'
    };
  }

  const nameColIndex = headers.findIndex(h => h.includes('dish name') || h.includes('name') || h.includes('पदार्थ') || h.includes('नाव'));
  const marathiColIndex = headers.findIndex(h => h.includes('marathi') || h.includes('मराठी'));
  const srNoColIndex = headers.findIndex(h => h.startsWith('sr') || h.includes('code') || h.includes('क्रमांक') || h === 'no' || h === 'no.' || h.includes('sr. no') || h.includes('sr no'));
  const subCategoryColIndex = headers.findIndex(h => h.includes('sub category') || h.includes('sub-category') || h.includes('subcategory') || h.includes('उपविभाग') || h.includes('उप कॅटेगरी') || h.includes('उप'));
  const categoryColIndex = headers.findIndex((h, idx) => idx !== subCategoryColIndex && (h.includes('category') || h.includes('division') || h.includes('विभाग') || h.includes('कॅटेगरी')));
  const counterColIndex = headers.findIndex(h => h.includes('counter') || h.includes('काऊंटर') || h.includes('काउंटर'));

  const parsedItems = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const cols = splitCSVRow(row, delimiter);
    if (cols.length < 2) continue;

    const name = nameColIndex !== -1 ? cols[nameColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const marathiName = marathiColIndex !== -1 ? cols[marathiColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const category = categoryColIndex !== -1 ? cols[categoryColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const subCategory = subCategoryColIndex !== -1 ? cols[subCategoryColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const counter = counterColIndex !== -1 ? cols[counterColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const priceStr = cols[priceColIndex]?.replace(/^"|"$/g, '').trim();
    const price = cleanNumber(priceStr);

    if (isNaN(price)) {
      // If price string is completely empty, skip updating this row rather than failing the whole file
      if (!priceStr) continue;
      return {
        success: false,
        missingPriceAlert: true,
        error: `Row ${i + 1} ("${name || 'Unnamed'}") has an invalid or missing price value ("${priceStr}")! Rate update aborted.`
      };
    }

    const pricePerKgStr = pricePerKgColIndex !== -1 ? cols[pricePerKgColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const pricePerKg = cleanNumber(pricePerKgStr);

    const srNoRaw = srNoColIndex !== -1 ? cols[srNoColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const srNo = srNoRaw ? parseInt(srNoRaw.replace(/[^0-9]/g, ''), 10) : undefined;

    parsedItems.push({
      srNo: !isNaN(srNo) ? srNo : undefined,
      name,
      marathiName,
      category: category || undefined,
      subCategory: subCategory || undefined,
      counter: counter || undefined,
      price,
      pricePerKg: !isNaN(pricePerKg) ? pricePerKg : undefined
    });
  }

  if (parsedItems.length === 0) {
    return { success: false, error: 'No valid dish rows with prices found in the imported file.' };
  }

  return { success: true, items: parsedItems };
}
