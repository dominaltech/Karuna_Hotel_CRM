// Excel & CSV export and import helpers with price column validation for Karuna Hotel ERP

export function isSweetDish(dish) {
  if (!dish) return false;
  return Boolean(
    dish.categoryId === 2 ||
    dish.counter?.toLowerCase() === 'sweets' ||
    dish.hasMultiplePrices ||
    (dish.variants && dish.variants.length > 0) ||
    dish.pricePerKg !== undefined
  );
}

// 1. Export Breakfast Items to CSV
// Columns: Sr. No., Dish Name, Marathi Name, Category, Sub Category, Dining, First Floor, AC, Parcel
export function exportBreakfastItemsToCSV(dishes = [], categories = [], subCategories = []) {
  const categoryMap = {};
  (categories || []).forEach(c => { categoryMap[c.id] = c.name; });
  const subCategoryMap = {};
  (subCategories || []).forEach(s => { subCategoryMap[s.id] = s.name; });

  const breakfastDishes = (dishes || []).filter(d => !isSweetDish(d));

  const headers = ['Sr. No.', 'Dish Name', 'Marathi Name', 'Category', 'Sub Category', 'Dining', 'First Floor', 'AC', 'Parcel'];
  const rows = breakfastDishes.map(dish => {
    const diningPrice = dish.sectionPrices?.['1'] ?? dish.sectionPrices?.[1] ?? dish.price ?? 0;
    const firstFloorPrice = dish.sectionPrices?.['2'] ?? dish.sectionPrices?.[2] ?? dish.price ?? 0;
    const acPrice = dish.sectionPrices?.['3'] ?? dish.sectionPrices?.[3] ?? (dish.price ? dish.price + 10 : 0);
    const parcelPrice = dish.sectionPrices?.['4'] ?? dish.sectionPrices?.[4] ?? dish.price ?? 0;

    return [
      dish.srNo || dish.id || '',
      `"${(dish.name || '').replace(/"/g, '""')}"`,
      `"${(dish.marathiName || '').replace(/"/g, '""')}"`,
      `"${(categoryMap[dish.categoryId] || 'Breakfast').replace(/"/g, '""')}"`,
      `"${(subCategoryMap[dish.subCategoryId] || '').replace(/"/g, '""')}"`,
      diningPrice,
      firstFloorPrice,
      acPrice,
      parcelPrice
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  if (typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Karuna_Breakfast_Menu_Rates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return csvContent;
}

// 2. Export Sweets Items to CSV
// Columns: Sr. No., Dish Name, Marathi Name, Category, Sub Category, Dining, First Floor, AC, Parcel, 250g, 500g, 1Kg
export function exportSweetsItemsToCSV(dishes = [], categories = [], subCategories = []) {
  const categoryMap = {};
  (categories || []).forEach(c => { categoryMap[c.id] = c.name; });
  const subCategoryMap = {};
  (subCategories || []).forEach(s => { subCategoryMap[s.id] = s.name; });

  const sweetDishes = (dishes || []).filter(d => isSweetDish(d));

  const headers = ['Sr. No.', 'Dish Name', 'Marathi Name', 'Category', 'Sub Category', 'Dining', 'First Floor', 'AC', 'Parcel', '250g', '500g', '1Kg'];
  const rows = sweetDishes.map(dish => {
    const diningPrice = dish.sectionPrices?.['1'] ?? dish.sectionPrices?.[1] ?? (dish.price || '');
    const firstFloorPrice = dish.sectionPrices?.['2'] ?? dish.sectionPrices?.[2] ?? (dish.price || '');
    const acPrice = dish.sectionPrices?.['3'] ?? dish.sectionPrices?.[3] ?? (dish.price || '');
    const parcelPrice = dish.sectionPrices?.['4'] ?? dish.sectionPrices?.[4] ?? (dish.price || '');

    const p250 = dish.variants?.find(v => v.unit && v.unit.toLowerCase().includes('250'))?.price ?? (dish.pricePerKg ? Math.round(dish.pricePerKg * 0.25) : (dish.price || 0));
    const p500 = dish.variants?.find(v => v.unit && v.unit.toLowerCase().includes('500'))?.price ?? (dish.pricePerKg ? Math.round(dish.pricePerKg * 0.5) : ((dish.price || 0) * 2));
    const p1kg = dish.variants?.find(v => v.unit && (v.unit.toLowerCase().includes('1kg') || (v.unit.toLowerCase().includes('1') && !v.unit.toLowerCase().includes('250'))))?.price ?? (dish.pricePerKg || ((dish.price || 0) * 4));

    return [
      dish.srNo || dish.id || '',
      `"${(dish.name || '').replace(/"/g, '""')}"`,
      `"${(dish.marathiName || '').replace(/"/g, '""')}"`,
      `"${(categoryMap[dish.categoryId] || 'Sweets').replace(/"/g, '""')}"`,
      `"${(subCategoryMap[dish.subCategoryId] || '').replace(/"/g, '""')}"`,
      diningPrice,
      firstFloorPrice,
      acPrice,
      parcelPrice,
      p250,
      p500,
      p1kg
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  if (typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Karuna_Sweets_Menu_Rates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return csvContent;
}

// Backward-compatible general export
export function exportFoodItemsToCSV(dishes = [], categories = [], subCategories = []) {
  exportBreakfastItemsToCSV(dishes, categories, subCategories);
}

function cleanNumber(str) {
  if (str === undefined || str === null) return NaN;
  const s = String(str).replace(/[₹\s,]|rs\.?|\/-/gi, '').trim();
  if (s === '') return NaN;
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

  // Identify Section Price Columns
  const diningColIndex = headers.findIndex(h => h.includes('dining') || h.includes('dine in') || h.includes('डायनिंग') || h.includes('डाइनिंग') || h === 'dine');
  const firstFloorColIndex = headers.findIndex(h => h.includes('first floor') || h.includes('1st floor') || h.includes('पहिला मजला') || h.includes('मजला') || (h.includes('first') && !h.includes('name')));
  const acColIndex = headers.findIndex(h => h === 'ac' || h.includes('ac hall') || h.includes('ac area') || h.includes('ac rate') || h.includes('एसी'));
  const parcelColIndex = headers.findIndex(h => h.includes('parcel') || h.includes('पार्सल'));

  // Identify Sweets Portion Columns
  const price250gColIndex = headers.findIndex(h => h.includes('250') || h.includes('पाव किलो'));
  const price500gColIndex = headers.findIndex(h => h.includes('500') || h.includes('अर्धा किलो'));
  const price1kgColIndex = headers.findIndex(h => (h.includes('1kg') || h.includes('1 kg') || h.includes('1 kilo') || h.includes('1kilo') || h.includes('एक किलो')) || (h.includes('per kg') && !h.includes('250') && !h.includes('500')));

  // Legacy single price column (Price or Base Rate Per Kg)
  const legacyPricePerKgIndex = price1kgColIndex !== -1 ? price1kgColIndex : headers.findIndex(h => h.includes('per kg') || h.includes('kilo') || h.includes('किलो'));
  const legacyPriceIndex = headers.findIndex((h, idx) => idx !== legacyPricePerKgIndex && (h === 'price (₹)' || h === 'price' || h.includes('mrp') || h.includes('किंमत') || (h.includes('rate') && !h.includes('dining') && !h.includes('first') && !h.includes('ac') && !h.includes('parcel'))));

  const hasAnyPriceColumn = [
    diningColIndex,
    firstFloorColIndex,
    acColIndex,
    parcelColIndex,
    price250gColIndex,
    price500gColIndex,
    price1kgColIndex,
    legacyPriceIndex,
    legacyPricePerKgIndex
  ].some(idx => idx !== -1);

  if (!hasAnyPriceColumn) {
    return {
      success: false,
      missingPriceAlert: true,
      error: 'CRITICAL ALERT: Missing price columns in the imported CSV file! Expected columns like "Dining", "First Floor", "AC", "Parcel", "250g", "500g", "1Kg", or "Price". Price update aborted to prevent corruption.'
    };
  }

  const nameColIndex = headers.findIndex(h => h.includes('dish name') || h.includes('name') || h.includes('पदार्थ') || h.includes('नाव'));
  const marathiColIndex = headers.findIndex(h => h.includes('marathi') || h.includes('मराठी'));
  const srNoColIndex = headers.findIndex(h => h.startsWith('sr') || h.includes('code') || h.includes('क्रमांक') || h === 'no' || h === 'no.' || h.includes('sr. no') || h.includes('sr no'));
  const subCategoryColIndex = headers.findIndex(h => h.includes('sub category') || h.includes('sub-category') || h.includes('subcategory') || h.includes('उपविभाग') || h.includes('उप'));
  const categoryColIndex = headers.findIndex((h, idx) => idx !== subCategoryColIndex && (h.includes('category') || h.includes('division') || h.includes('विभाग') || h.includes('कॅटेगरी')));

  const parsedItems = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const cols = splitCSVRow(row, delimiter);
    if (cols.length < 2) continue;

    const name = nameColIndex !== -1 ? cols[nameColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const marathiName = marathiColIndex !== -1 ? cols[marathiColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const category = categoryColIndex !== -1 ? cols[categoryColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const subCategory = subCategoryColIndex !== -1 ? cols[subCategoryColIndex]?.replace(/^"|"$/g, '').trim() : '';

    const diningPrice = diningColIndex !== -1 ? cleanNumber(cols[diningColIndex]) : NaN;
    const firstFloorPrice = firstFloorColIndex !== -1 ? cleanNumber(cols[firstFloorColIndex]) : NaN;
    const acPrice = acColIndex !== -1 ? cleanNumber(cols[acColIndex]) : NaN;
    const parcelPrice = parcelColIndex !== -1 ? cleanNumber(cols[parcelColIndex]) : NaN;

    const price250g = price250gColIndex !== -1 ? cleanNumber(cols[price250gColIndex]) : NaN;
    const price500g = price500gColIndex !== -1 ? cleanNumber(cols[price500gColIndex]) : NaN;
    const price1kg = price1kgColIndex !== -1 ? cleanNumber(cols[price1kgColIndex]) : (legacyPricePerKgIndex !== -1 ? cleanNumber(cols[legacyPricePerKgIndex]) : NaN);
    const legacyPrice = legacyPriceIndex !== -1 ? cleanNumber(cols[legacyPriceIndex]) : NaN;

    // Determine baseline price
    let basePrice = !isNaN(diningPrice)
      ? diningPrice
      : (!isNaN(price250g)
        ? price250g
        : (!isNaN(legacyPrice)
          ? legacyPrice
          : (!isNaN(firstFloorPrice)
            ? firstFloorPrice
            : (!isNaN(parcelPrice) ? parcelPrice : (!isNaN(acPrice) ? acPrice : NaN)))));

    const hasAnyValidPriceInRow = [
      diningPrice,
      firstFloorPrice,
      acPrice,
      parcelPrice,
      price250g,
      price500g,
      price1kg,
      legacyPrice
    ].some(val => !isNaN(val));

    if (!hasAnyValidPriceInRow) {
      if (!name) continue;
      return {
        success: false,
        missingPriceAlert: true,
        error: `Row ${i + 1} ("${name || 'Unnamed'}") has no valid prices in rate columns! Rate update aborted.`
      };
    }

    const srNoRaw = srNoColIndex !== -1 ? cols[srNoColIndex]?.replace(/^"|"$/g, '').trim() : '';
    const srNo = srNoRaw ? parseInt(srNoRaw.replace(/[^0-9]/g, ''), 10) : undefined;

    parsedItems.push({
      srNo: !isNaN(srNo) ? srNo : undefined,
      name,
      marathiName,
      category: category || undefined,
      subCategory: subCategory || undefined,
      price: !isNaN(basePrice) ? basePrice : undefined,
      diningPrice: !isNaN(diningPrice) ? diningPrice : undefined,
      firstFloorPrice: !isNaN(firstFloorPrice) ? firstFloorPrice : undefined,
      acPrice: !isNaN(acPrice) ? acPrice : undefined,
      parcelPrice: !isNaN(parcelPrice) ? parcelPrice : undefined,
      price250g: !isNaN(price250g) ? price250g : undefined,
      price500g: !isNaN(price500g) ? price500g : undefined,
      price1kg: !isNaN(price1kg) ? price1kg : undefined,
      pricePerKg: !isNaN(price1kg) ? price1kg : undefined
    });
  }

  if (parsedItems.length === 0) {
    return { success: false, error: 'No valid dish rows with prices found in the imported file.' };
  }

  return { success: true, items: parsedItems };
}
