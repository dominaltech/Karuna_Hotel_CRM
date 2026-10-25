import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  MapPin,
  ListOrdered,
  Layers,
  AlertTriangle,
  Save,
  Check,
  CheckCircle2,
  Lock,
  Tag,
  FileSpreadsheet,
  Database,
  ArrowLeft,
  ChevronRight,
  Utensils,
  FolderPlus,
  FolderOpen,
  DollarSign,
  Search,
  Image as ImageIcon,
  Sparkles,
  Coffee,
  Candy,
  Monitor,
  TrendingUp,
  Banknote,
  Smartphone,
  CreditCard,
  History,
  Printer,
  Receipt,
  Filter,
  Calendar,
  X,
  Edit3,
  QrCode,
  Package,
  CheckCircle,
  Sliders,
  Ban,
  RotateCcw
} from 'lucide-react';
import { db, getDishPriceForSection } from '../db/db';
import { 
  exportBreakfastItemsToCSV, 
  exportSweetsItemsToCSV, 
  exportFoodItemsToCSV, 
  parseCSVAndValidateRates 
} from '../utils/excelUtils';
import { printThermalReceipt } from '../utils/receiptUtils';
import { generateRevenuePDFReport } from '../utils/pdfUtils';
import { AVAILABLE_COUNTERS } from './Header';

export default function OwnerAdmin({
  dishes,
  categories,
  subCategories,
  sections,
  tables = [],
  bills = [],
  billLogs = [],
  onAddDish,
  onUpdateDish,
  onDeleteDish,
  onAddSubCategory,
  onDeleteSubCategory,
  onUpdateSection,
  onAddSection,
  onDeleteSection,
  onAddTable,
  onDeleteTable,
  onBulkUpdatePrices,
  onUpdateSettledBill,
  printLanguage = 'mr',
  isSettledBillEditEnabled: propIsSettledBillEditEnabled,
  onToggleSettledBillEdit,
  preOrders = [],
  onMatrixUnsavedChange,
  onRegisterMatrixActions
}) {
  const sortSectionsWithParcelsLast = (secArray) => {
    if (!Array.isArray(secArray)) return [];
    const nonParcels = secArray.filter((s) => !s || !s.name || !s.name.toLowerCase().includes('parcel'));
    const parcels = secArray.filter((s) => s && s.name && s.name.toLowerCase().includes('parcel'));
    return [...nonParcels, ...parcels];
  };
  const [activeAdminSubTab, setActiveAdminSubTab] = useState('dishes'); // 'dishes' | 'history' | 'sections' | 'upi' | 'backup'
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  // Menu Management Division & Sub-Division Filters (Matching Reference Image)
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('all'); // 'all' | divisionId
  const [selectedSubDivisionFilter, setSelectedSubDivisionFilter] = useState('all'); // 'all' | subCatId
  const [dishSearchQuery, setDishSearchQuery] = useState('');

  // Sub-Category Add / Edit Modal State
  const [showAddSubCatModal, setShowAddSubCatModal] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState('');
  const [newSubCatParentId, setNewSubCatParentId] = useState(1);
  const [editingSubCat, setEditingSubCat] = useState(null);

  // Dish Add Modal State (With Base Per-Kg Rate & Multi-Price - Requirement 8)
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishMarathiName, setNewDishMarathiName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishPricePerKg, setNewDishPricePerKg] = useState('');
  const [newDishSrNo, setNewDishSrNo] = useState('');
  const [newDishCatId, setNewDishCatId] = useState(1);
  const [newDishSubCatId, setNewDishSubCatId] = useState(subCategories[0]?.id || 1);
  const [newDishCounter, setNewDishCounter] = useState('Breakfast');
  const [newDishHasMultiplePrices, setNewDishHasMultiplePrices] = useState(false);
  const [newDishVariants, setNewDishVariants] = useState([
    { unit: '250g', weightKg: 0.25, price: '' },
    { unit: '500g', weightKg: 0.5, price: '' },
    { unit: '1 Kg', weightKg: 1, price: '' }
  ]);

  // Edit Dish Modal State
  const [editingDish, setEditingDish] = useState(null);
  // UPI Setting State & Settle Tab Edit Button Permission
  const [upiId, setUpiId] = useState(localStorage.getItem('karuna_upi_id') || '8446091809@ybl');
  const [payeeName, setPayeeName] = useState(localStorage.getItem('karuna_payee_name') || 'Karuna Hotel');
  const [upiSavedToast, setUpiSavedToast] = useState(false);
  const [isSettledBillEditEnabled, setIsSettledBillEditEnabled] = useState(() => {
    if (propIsSettledBillEditEnabled !== undefined) return propIsSettledBillEditEnabled;
    return localStorage.getItem('karuna_settled_bill_edit_enabled') !== 'false';
  });

  useEffect(() => {
    if (propIsSettledBillEditEnabled !== undefined) {
      setIsSettledBillEditEnabled(propIsSettledBillEditEnabled);
    }
  }, [propIsSettledBillEditEnabled]);

  // Instant toggle for Settle tab bill edit permission
  const handleToggleEditPermission = async (enableVal) => {
    setIsSettledBillEditEnabled(enableVal);
    localStorage.setItem('karuna_settled_bill_edit_enabled', String(enableVal));
    if (typeof onToggleSettledBillEdit === 'function') {
      onToggleSettledBillEdit(enableVal);
    }
    try {
      await db.systemSettings.put({
        id: 1,
        hotelName: payeeName.trim(),
        upiId: upiId.trim(),
        payeeName: payeeName.trim(),
        settledBillEditEnabled: enableVal,
        lastSyncTime: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Failed to update settledBillEditEnabled in systemSettings:', err);
    }
  };

  // Backup & Import Feedback State
  const [bulkRatesMessage, setBulkRatesMessage] = useState(null);
  const [jsonRestoreMessage, setJsonRestoreMessage] = useState(null);

  // Section Rates Matrix Local State
  const [dishSectionRates, setDishSectionRates] = useState({});
  const [ratesSavedFeedback, setRatesSavedFeedback] = useState(false);
  const [matrixFilterCat, setMatrixFilterCat] = useState('1');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
  const [hasUnsavedMatrixChanges, setHasUnsavedMatrixChanges] = useState(false);
  const [pendingSubTab, setPendingSubTab] = useState(null);
  const [showSubTabUnsavedModal, setShowSubTabUnsavedModal] = useState(false);

  // Notify parent of unsaved matrix changes
  useEffect(() => {
    if (typeof onMatrixUnsavedChange === 'function') {
      onMatrixUnsavedChange(hasUnsavedMatrixChanges);
    }
  }, [hasUnsavedMatrixChanges, onMatrixUnsavedChange]);

  // Warn user before closing or reloading browser window if changes unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedMatrixChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedMatrixChanges]);

  // Dining Area & Table Management State
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const [addTableAreaId, setAddTableAreaId] = useState(null);
  const [newTableName, setNewTableName] = useState('');
  const [isNewCardParcel, setIsNewCardParcel] = useState(false);

  const getSuggestedPrefix = (secName, isParcel) => {
    if (isParcel) return 'P';
    const s = (secName || '').toLowerCase().trim();
    if (s.includes('dine') || s.includes('dining') || s.includes('ground')) return 'D';
    if (s.includes('first') || s.includes('floor')) return 'F';
    if (s.includes('ac')) return 'AC';
    if (s.includes('parcel') || s.includes('takeaway')) return 'P';
    if (s.includes('roof') || s.includes('top')) return 'R';
    if (s.includes('garden')) return 'G';
    const firstChar = (secName || '').trim().charAt(0).toUpperCase();
    return /[A-Z]/.test(firstChar) ? firstChar : 'T';
  };

  const getNextAvailableCardName = (secName, isParcel) => {
    const prefix = getSuggestedPrefix(secName, isParcel);
    let num = 1;
    let candidate = `${prefix}${num}`;
    while (tables.some((t) => t && String(t.name).toUpperCase().trim() === candidate.toUpperCase())) {
      num++;
      candidate = `${prefix}${num}`;
    }
    return candidate;
  };

  // History Tab Filters & Modal State (Requirement 11)
  const [historyTimeFilter, setHistoryTimeFilter] = useState('all'); // 'all' | 'date'
  const [historySelectedDate, setHistorySelectedDate] = useState('');
  const [historyCounterFilter, setHistoryCounterFilter] = useState('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historySelectedBill, setHistorySelectedBill] = useState(null);

  // Auto-calculate portion prices when Base Per-Kg Rate changes (Requirement 8)
  const handleBasePricePerKgChange = (val, isEditingMode = false) => {
    const rate = parseFloat(val);
    if (isEditingMode && editingDish) {
      setEditingDish({
        ...editingDish,
        pricePerKg: val,
        variants: [
          { unit: '250g', weightKg: 0.25, price: !isNaN(rate) ? Math.round(rate * 0.25) : '' },
          { unit: '500g', weightKg: 0.5, price: !isNaN(rate) ? Math.round(rate * 0.5) : '' },
          { unit: '1 Kg', weightKg: 1, price: !isNaN(rate) ? rate : '' }
        ]
      });
    } else {
      setNewDishPricePerKg(val);
      setNewDishVariants([
        { unit: '250g', weightKg: 0.25, price: !isNaN(rate) ? Math.round(rate * 0.25) : '' },
        { unit: '500g', weightKg: 0.5, price: !isNaN(rate) ? Math.round(rate * 0.5) : '' },
        { unit: '1 Kg', weightKg: 1, price: !isNaN(rate) ? rate : '' }
      ]);
    }
  };

  // Sync section rates matrix and sweet portion rates from dishes without wiping active local edits
  useEffect(() => {
    if (dishes && dishes.length > 0) {
      setDishSectionRates((prev) => {
        const next = { ...prev };
        dishes.forEach((d) => {
          const isSweet = d.categoryId === 2 || d.counter?.toLowerCase() === 'sweets';
          const p1k = d.pricePerKg || d.variants?.find((v) => v.unit === '1 Kg' || v.unit === '1Kg')?.price || (d.price ? d.price * 4 : 320);
          const p250 = d.variants?.find((v) => v.unit === '250g')?.price || d.price || Math.round(p1k * 0.25);
          const p500 = d.variants?.find((v) => v.unit === '500g')?.price || (d.price ? d.price * 2 : Math.round(p1k * 0.5));

          next[d.id] = {
            ...(d.sectionPrices || {}),
            ...(isSweet
              ? {
                  price1kg: p1k !== undefined && p1k !== null ? p1k.toString() : '',
                  price250g: p250 !== undefined && p250 !== null ? p250.toString() : '',
                  price500g: p500 !== undefined && p500 !== null ? p500.toString() : ''
                }
              : {}),
            ...(prev[d.id] || {})
          };
        });
        return next;
      });
    }
  }, [dishes]);

  // Handle 1 Kg price entry for Sweet dishes: Automatically calculates 250g and 500g prices
  const handleSweet1KgChange = (dishId, new1KgStr) => {
    setHasUnsavedMatrixChanges(true);
    const p1k = parseFloat(new1KgStr);
    const p250 = !isNaN(p1k) && p1k > 0 ? Math.round(p1k * 0.25).toString() : '';
    const p500 = !isNaN(p1k) && p1k > 0 ? Math.round(p1k * 0.5).toString() : '';

    setDishSectionRates((prev) => ({
      ...prev,
      [dishId]: {
        ...(prev[dishId] || {}),
        price1kg: new1KgStr,
        price250g: p250,
        price500g: p500,
        5: new1KgStr // Also update section 5 (Sweets area)
      }
    }));
  };

  // Handle by-gram price entry (250g or 500g) manually changed by user
  const handleSweetGramChange = (dishId, gramKey, newGramStr) => {
    setHasUnsavedMatrixChanges(true);
    setDishSectionRates((prev) => ({
      ...prev,
      [dishId]: {
        ...(prev[dishId] || {}),
        [gramKey]: newGramStr
      }
    }));
  };

  // Bulk save all modified area matrix rates
  const handleSaveAllMatrixRates = async () => {
    for (const d of dishes) {
      const rates = dishSectionRates[d.id] || d.sectionPrices || {};
      const isSweet = d.categoryId === 2 || d.counter?.toLowerCase() === 'sweets';
      if (isSweet) {
        const p1k = parseFloat(rates.price1kg !== undefined && rates.price1kg !== '' ? rates.price1kg : (d.pricePerKg || 320));
        const p250 = parseFloat(rates.price250g !== undefined && rates.price250g !== '' ? rates.price250g : (!isNaN(p1k) ? Math.round(p1k * 0.25) : 80));
        const p500 = parseFloat(rates.price500g !== undefined && rates.price500g !== '' ? rates.price500g : (!isNaN(p1k) ? Math.round(p1k * 0.5) : 160));

        const cleanRates = { ...(d.sectionPrices || {}) };
        Object.entries(rates).forEach(([key, val]) => {
          if (key !== 'price1kg' && key !== 'price250g' && key !== 'price500g') {
            const num = parseFloat(val);
            if (!isNaN(num) && num > 0) cleanRates[key] = num;
            else delete cleanRates[key];
          }
        });
        if (!isNaN(p1k) && p1k > 0) cleanRates[5] = p1k;

        const updatedDish = {
          ...d,
          pricePerKg: !isNaN(p1k) && p1k > 0 ? p1k : d.pricePerKg,
          price: !isNaN(p250) && p250 > 0 ? p250 : d.price,
          variants: [
            { unit: '250g', weightKg: 0.25, price: !isNaN(p250) && p250 > 0 ? p250 : Math.round(p1k * 0.25) },
            { unit: '500g', weightKg: 0.5, price: !isNaN(p500) && p500 > 0 ? p500 : Math.round(p1k * 0.5) },
            { unit: '1 Kg', weightKg: 1, price: !isNaN(p1k) && p1k > 0 ? p1k : 320 }
          ],
          sectionPrices: cleanRates
        };
        await db.dishes.update(d.id, updatedDish);
        if (typeof onUpdateDish === 'function') onUpdateDish(d.id, updatedDish);
      } else {
        const cleanRates = {};
        Object.entries(rates).forEach(([secId, rateVal]) => {
          const num = parseFloat(rateVal);
          if (!isNaN(num) && num > 0) cleanRates[secId] = num;
        });
        const basePrice = cleanRates[1] || cleanRates[4] || cleanRates[2] || cleanRates[3] || d.price;
        await db.dishes.update(d.id, { sectionPrices: cleanRates, price: basePrice });
        if (typeof onUpdateDish === 'function') onUpdateDish(d.id, { ...d, sectionPrices: cleanRates, price: basePrice });
      }
    }
    setHasUnsavedMatrixChanges(false);
    setRatesSavedFeedback(true);
    setTimeout(() => setRatesSavedFeedback(false), 2000);
  };

  // Revert matrix edits to original database values
  const handleDiscardMatrixChanges = () => {
    if (dishes && dishes.length > 0) {
      const freshRates = {};
      dishes.forEach((d) => {
        const isSweet = d.categoryId === 2 || d.counter?.toLowerCase() === 'sweets';
        const p1k = d.pricePerKg || d.variants?.find((v) => v.unit === '1 Kg' || v.unit === '1Kg')?.price || (d.price ? d.price * 4 : 320);
        const p250 = d.variants?.find((v) => v.unit === '250g')?.price || d.price || Math.round(p1k * 0.25);
        const p500 = d.variants?.find((v) => v.unit === '500g')?.price || (d.price ? d.price * 2 : Math.round(p1k * 0.5));

        freshRates[d.id] = {
          ...(d.sectionPrices || {}),
          ...(isSweet
            ? {
                price1kg: p1k !== undefined && p1k !== null ? p1k.toString() : '',
                price250g: p250 !== undefined && p250 !== null ? p250.toString() : '',
                price500g: p500 !== undefined && p500 !== null ? p500.toString() : ''
              }
            : {})
        };
      });
      setDishSectionRates(freshRates);
    }
    setHasUnsavedMatrixChanges(false);
  };

  // Register matrix actions with parent container
  useEffect(() => {
    if (typeof onRegisterMatrixActions === 'function') {
      onRegisterMatrixActions({
        save: handleSaveAllMatrixRates,
        discard: handleDiscardMatrixChanges
      });
    }
  }, [onRegisterMatrixActions, dishes, dishSectionRates]);

  // Sub-tab navigation guard: prompts user to save or discard before switching sub-tabs
  const handleSubTabClick = (targetSubTab) => {
    if (targetSubTab === activeAdminSubTab) return;
    if (activeAdminSubTab === 'sections' && hasUnsavedMatrixChanges) {
      setPendingSubTab(targetSubTab);
      setShowSubTabUnsavedModal(true);
      return;
    }
    setActiveAdminSubTab(targetSubTab);
  };

  // Persist Sweet dish rates (1kg, 250g, 500g and section prices)
  const handleSaveSweetRates = async (dishId) => {
    const dish = dishes.find((d) => d.id === dishId);
    if (!dish) return;
    const rates = dishSectionRates[dishId] || {};

    const p1k = parseFloat(rates.price1kg !== undefined && rates.price1kg !== '' ? rates.price1kg : (dish.pricePerKg || 320));
    const p250 = parseFloat(rates.price250g !== undefined && rates.price250g !== '' ? rates.price250g : (!isNaN(p1k) ? Math.round(p1k * 0.25) : 80));
    const p500 = parseFloat(rates.price500g !== undefined && rates.price500g !== '' ? rates.price500g : (!isNaN(p1k) ? Math.round(p1k * 0.5) : 160));

    const cleanRates = { ...(dish.sectionPrices || {}) };
    Object.entries(rates).forEach(([key, val]) => {
      if (key !== 'price1kg' && key !== 'price250g' && key !== 'price500g') {
        const num = parseFloat(val);
        if (!isNaN(num) && num > 0) {
          cleanRates[key] = num;
        } else {
          delete cleanRates[key];
        }
      }
    });
    if (!isNaN(p1k) && p1k > 0) {
      cleanRates[5] = p1k;
    }

    const updatedDish = {
      ...dish,
      pricePerKg: !isNaN(p1k) && p1k > 0 ? p1k : dish.pricePerKg,
      price: !isNaN(p250) && p250 > 0 ? p250 : dish.price,
      variants: [
        { unit: '250g', weightKg: 0.25, price: !isNaN(p250) && p250 > 0 ? p250 : Math.round(p1k * 0.25) },
        { unit: '500g', weightKg: 0.5, price: !isNaN(p500) && p500 > 0 ? p500 : Math.round(p1k * 0.5) },
        { unit: '1 Kg', weightKg: 1, price: !isNaN(p1k) && p1k > 0 ? p1k : 320 }
      ],
      sectionPrices: cleanRates
    };

    try {
      await db.dishes.update(dishId, updatedDish);
      if (typeof onUpdateDish === 'function') {
        onUpdateDish(dishId, updatedDish);
      }
    } catch (err) {
      console.warn('Auto-save sweet matrix rates error:', err);
    }
  };

  // Instantly save area rate when user leaves box or presses Enter
  const handleSaveSingleRate = async (dishId, secId, rawVal) => {
    const val = rawVal !== undefined ? rawVal : (dishSectionRates[dishId]?.[secId] || '');
    const num = parseFloat(val);
    const dish = dishes.find((d) => d.id === dishId);
    if (!dish) return;

    const currentRates = {
      ...(dish.sectionPrices || {}),
      ...(dishSectionRates[dishId] || {})
    };

    if (!isNaN(num) && num > 0) {
      currentRates[secId] = num;
    } else {
      delete currentRates[secId];
    }

    setDishSectionRates((prev) => ({
      ...prev,
      [dishId]: {
        ...(prev[dishId] || {}),
        [secId]: !isNaN(num) && num > 0 ? num.toString() : ''
      }
    }));

    const basePrice = currentRates[1] || currentRates[4] || currentRates[2] || currentRates[3] || (!isNaN(num) && num > 0 ? num : dish.price);

    try {
      await db.dishes.update(dishId, { sectionPrices: currentRates, price: basePrice });
      if (typeof onUpdateDish === 'function') {
        onUpdateDish(dishId, { ...dish, sectionPrices: currentRates, price: basePrice });
      }
    } catch (err) {
      console.warn('Auto-save matrix rate error:', err);
    }
  };

  // Handle Save New Dish (Rates and prices are set exclusively in Area Matrix tab)
  const handleSaveNewDish = () => {
    if (!newDishName) return;

    const isSweet = parseInt(newDishCatId) === 2 || newDishCounter === 'Sweets';

    onAddDish({
      srNo: newDishSrNo ? parseInt(newDishSrNo) : Math.floor(100 + Math.random() * 900),
      name: newDishName.trim(),
      marathiName: newDishMarathiName.trim(),
      categoryId: parseInt(newDishCatId) || 1,
      subCategoryId: parseInt(newDishSubCatId) || 1,
      price: 0,
      pricePerKg: null,
      stockQty: 9999,
      counter: newDishCounter,
      status: 'In Stock',
      hasMultiplePrices: isSweet,
      variants: [],
      sectionPrices: {},
      subItems: []
    });

    // Reset Form
    setNewDishName('');
    setNewDishMarathiName('');
    setNewDishPrice('');
    setNewDishPricePerKg('');
    setNewDishSrNo('');
    setNewDishHasMultiplePrices(false);
    setShowAddDishModal(false);
  };

  // Handle Save Dish Edits (Rates and prices are preserved from Area Matrix tab)
  const handleSaveDishEdits = () => {
    if (!editingDish) return;
    onUpdateDish(editingDish.id, {
      ...editingDish,
      stockQty: editingDish.stockQty !== undefined ? (parseFloat(editingDish.stockQty) || 9999) : 9999
    });
    setEditingDish(null);
  };

  // Handle Save Sub-Category
  const handleSaveSubCategory = () => {
    if (!newSubCatName) return;
    if (editingSubCat) {
      // Update
      const sub = subCategories.find((s) => s.id === editingSubCat.id);
      if (sub) {
        sub.name = newSubCatName.trim();
        db.subCategories.update(sub.id, { name: sub.name });
      }
      setEditingSubCat(null);
    } else {
      onAddSubCategory({
        name: newSubCatName.trim(),
        parentCategoryId: parseInt(newSubCatParentId) || 1
      });
    }
    setNewSubCatName('');
    setShowAddSubCatModal(false);
  };

  // Save UPI Settings to LocalStorage & Server SystemSettings
  const handleSaveUpiSettings = async () => {
    const cleanUpi = upiId.trim();
    const cleanPayee = payeeName.trim();
    localStorage.setItem('karuna_upi_id', cleanUpi);
    localStorage.setItem('karuna_payee_name', cleanPayee);
    localStorage.setItem('karuna_settled_bill_edit_enabled', String(isSettledBillEditEnabled));
    if (typeof onToggleSettledBillEdit === 'function') {
      onToggleSettledBillEdit(isSettledBillEditEnabled);
    }
    try {
      await db.systemSettings.put({
        id: 1,
        hotelName: cleanPayee,
        upiId: cleanUpi,
        payeeName: cleanPayee,
        settledBillEditEnabled: isSettledBillEditEnabled,
        lastSyncTime: new Date().toISOString()
      });
    } catch (e) {}
    setUpiSavedToast(true);
    setTimeout(() => setUpiSavedToast(false), 4000);
  };

  // Bulk Import Excel / CSV Menu Rates
  const handleImportExcelFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result;
        if (!text) {
          setBulkRatesMessage({ success: false, text: 'File content is empty.' });
          return;
        }
        const validation = parseCSVAndValidateRates(text);
        if (!validation.success) {
          setBulkRatesMessage({ success: false, text: validation.error || 'Failed to parse CSV file.' });
          return;
        }

        const updated = await onBulkUpdatePrices(validation.items);
        const count = Array.isArray(updated) && updated.length > 0 ? updated.length : validation.items.length;
        setBulkRatesMessage({
          success: true,
          text: `✓ Successfully updated prices for ${count} dishes in menu!`
        });
      } catch (err) {
        setBulkRatesMessage({ success: false, text: `Error importing file: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Import JSON Full Database Backup
  const handleImportJsonBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const jsonStr = evt.target?.result;
        const parsed = JSON.parse(jsonStr);
        if (!parsed || typeof parsed !== 'object') {
          setJsonRestoreMessage({ success: false, text: 'Invalid JSON backup format.' });
          return;
        }

        const countCategories = parsed.categories?.length || parsed.data?.categories?.length || 0;
        const countDishes = parsed.dishes?.length || parsed.data?.dishes?.length || 0;
        const countBills = parsed.bills?.length || parsed.data?.bills?.length || 0;

        setConfirmDialog({
          title: 'Restore Database Backup?',
          message: `Are you sure you want to restore this JSON backup? This will restore and update ${countDishes} dishes, ${countCategories} categories, and ${countBills} bills into the system.`,
          confirmText: 'Yes, Restore Database',
          confirmColor: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30',
          onConfirm: async () => {
            const res = await db.restoreBackup(parsed);
            if (res && res.error) {
              setJsonRestoreMessage({ success: false, text: `Restore error: ${res.error}` });
            } else {
              setJsonRestoreMessage({
                success: true,
                text: `✓ Database restored successfully! Loaded ${countDishes} dishes, ${countCategories} categories, and ${countBills} bills.`
              });
            }
          }
        });
      } catch (err) {
        setJsonRestoreMessage({ success: false, text: `Invalid JSON file: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter Dishes for Menu Management
  const filteredDishes = dishes.filter((dish) => {
    if (selectedDivisionFilter !== 'all' && dish.categoryId !== parseInt(selectedDivisionFilter)) return false;
    if (selectedSubDivisionFilter !== 'all' && dish.subCategoryId !== parseInt(selectedSubDivisionFilter)) return false;
    if (dishSearchQuery.trim()) {
      const q = dishSearchQuery.toLowerCase();
      const mName = dish.name.toLowerCase().includes(q);
      const mMarathi = dish.marathiName?.toLowerCase().includes(q);
      const mCode = dish.srNo?.toString().includes(q);
      return mName || mMarathi || mCode;
    }
    return true;
  });

  // Calculate Sub-Category Dish Counts
  const getSubCatDishCount = (subCatId) => {
    return dishes.filter((d) => d.subCategoryId === subCatId).length;
  };

  // Helper for accurate local YYYY-MM-DD date string
  const getLocalDateStr = (dateObjOrStr) => {
    if (!dateObjOrStr) return '';
    const d = new Date(dateObjOrStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter Bills for History Tab (Requirement 8: Date-Wise / All Time)
  const baseTimeBills = bills.filter((b) => {
    if (historyTimeFilter === 'all' || !historySelectedDate) return true;
    if (!b.createdAt) return false;
    return getLocalDateStr(b.createdAt) === historySelectedDate;
  });

  const baseCounterBills = baseTimeBills.filter((b) => {
    if (historyCounterFilter === 'all') return true;
    return (b.counter || '').toLowerCase().includes(historyCounterFilter.toLowerCase());
  });

  const displayedHistoryBills = baseCounterBills.filter((b) => {
    if (!historySearchQuery.trim()) return true;
    const q = historySearchQuery.toLowerCase();
    return (
      b.tokenNo?.toString().includes(q) ||
      b.id?.toString().includes(q) ||
      (b.tableNo || '').toLowerCase().includes(q) ||
      (b.counter || '').toLowerCase().includes(q)
    );
  });

  // Metric Totals for History Tab
  const totalHistoryRevenue = baseCounterBills.reduce((sum, b) => sum + (b.total || 0), 0);

  // Today's Revenue Calculation (Always live for today regardless of history filter)
  const todayDateStr = getLocalDateStr(new Date());
  const todaySettledBills = (bills || []).filter((b) => {
    if (!b?.createdAt) return false;
    if (b.isPreOrderAdvance) return false;
    return getLocalDateStr(b.createdAt) === todayDateStr;
  });
  const todayAdvanceRevenue = (preOrders || []).reduce((sum, po) => {
    if (!po?.createdAt) return sum;
    if (getLocalDateStr(po.createdAt) !== todayDateStr) return sum;
    if (po.isFullPayment || po.fullPaymentPaid) return sum;
    return sum + (parseFloat(po.advancePayment) || 0);
  }, 0);
  const todaySettledBillsRevenue = todaySettledBills.reduce((sum, b) => {
    const amt = parseFloat(b.total !== undefined ? b.total : (b.finalTotal || b.grandTotal || 0)) || 0;
    return sum + amt;
  }, 0);
  const todayTotalRevenue = todaySettledBillsRevenue + todayAdvanceRevenue;
  const todaySettledCount = todaySettledBills.length;

  let totalCash = 0;
  let totalOnline = 0;
  let totalCard = 0;

  let totalDiscounts = 0;
  let totalDelivery = 0;
  let totalContainer = 0;
  let totalWaiterTips = 0;
  let totalServiceCharges = 0;

  baseCounterBills.forEach((b) => {
    const disc = parseFloat(b.discountAmount) || (typeof b.discount === 'number' ? b.discount : (parseFloat(b.discount?.amount || b.discount?.value) || 0));
    totalDiscounts += disc;
    totalDelivery += parseFloat(b.deliveryCharge) || 0;
    totalContainer += parseFloat(b.containerCharge) || 0;
    totalWaiterTips += parseFloat(b.waiterTip) || 0;
    totalServiceCharges += parseFloat(b.serviceCharge) || 0;

    if (b.paymentDetails) {
      if (b.paymentDetails.cash) totalCash += parseFloat(b.paymentDetails.cash) || 0;
      if (b.paymentDetails.online || b.paymentDetails.upi) totalOnline += parseFloat(b.paymentDetails.online || b.paymentDetails.upi) || 0;
      if (b.paymentDetails.card) totalCard += parseFloat(b.paymentDetails.card) || 0;

      if (!b.paymentDetails.cash && !b.paymentDetails.online && !b.paymentDetails.upi && !b.paymentDetails.card) {
        const mode = (b.paymentDetails.mode || '').toLowerCase();
        if (mode.includes('cash')) totalCash += b.total || 0;
        else if (mode.includes('online') || mode.includes('upi')) totalOnline += b.total || 0;
        else if (mode.includes('card')) totalCard += b.total || 0;
        else totalCash += b.total || 0;
      }
    } else {
      totalCash += b.total || 0;
    }
  });

  // Counter Breakdown for History Tab
  const counterBreakdown = {};
  AVAILABLE_COUNTERS.forEach((c) => {
    counterBreakdown[c.name] = { total: 0, count: 0, shortName: c.shortName };
  });
  baseTimeBills.forEach((b) => {
    const cName = b.counter || 'Counter 1 (Breakfast & Snacks)';
    if (!counterBreakdown[cName]) {
      counterBreakdown[cName] = { total: 0, count: 0, shortName: cName.split(' ')[0] };
    }
    counterBreakdown[cName].total += (b.total || 0);
    counterBreakdown[cName].count += 1;
  });

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-100 overflow-y-auto select-none min-h-0">
      
      {/* Top Header & Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Owner Administration & Master Settings
            </h2>
            <p className="text-xs text-stone-500 font-semibold">
              Manage menu divisions, per-kg rates, counter breakdowns, bills audit history & area rates
            </p>
          </div>
        </div>

        {/* 4 Main Owner Sub-Tabs */}
        <div className="flex items-center space-x-2 bg-white border border-stone-200 rounded-xl p-1.5 shadow-2xs mr-12">
          
          <button
            onClick={() => handleSubTabClick('dishes')}
            className={`px-3.5 py-2 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeAdminSubTab === 'dishes'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu & Dishes</span>
          </button>

          <button
            onClick={() => handleSubTabClick('history')}
            className={`px-3.5 py-2 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeAdminSubTab === 'history'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Bills & Revenue Reports</span>
          </button>

          <button
            onClick={() => handleSubTabClick('sections')}
            className={`px-3.5 py-2 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeAdminSubTab === 'sections'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Area Rates Matrix</span>
            {hasUnsavedMatrixChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-1 inline-block" />
            )}
          </button>

          <button
            onClick={() => handleSubTabClick('upi')}
            className={`px-3.5 py-2 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeAdminSubTab === 'upi'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI Setting</span>
          </button>

          <button
            onClick={() => handleSubTabClick('backup')}
            className={`px-3.5 py-2 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeAdminSubTab === 'backup'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup & Restore</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: MENU DIVISIONS, CATEGORIES & DISHES (Matches Reference Design) */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'dishes' && (
        <div className="space-y-6">
          
          {/* Top Title Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-base font-black text-neutral-900">
                Menu Divisions, Categories & Dishes
              </h3>
              <p className="text-xs text-stone-500 font-semibold mt-0.5">
                Main Divisions (Breakfast & Sweets) with custom sub-divisions, dishes, rates, stock, and photos
              </p>
            </div>
          </div>

          {/* Division Pills Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-white border border-stone-200 rounded-2xl p-2.5 shadow-xs">
            <button
              onClick={() => {
                setSelectedDivisionFilter('all');
                setSelectedSubDivisionFilter('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedDivisionFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Divisions</span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedDivisionFilter === cat.id;
              const Icon = cat.id === 1 ? Coffee : Candy;
              return (
                <button
                  key={`div-filter-${cat.id}`}
                  onClick={() => {
                    setSelectedDivisionFilter(cat.id);
                    setSelectedSubDivisionFilter('all');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Divisions Pills Group with Section Add Button (Requirement 7) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                Sub-Divisions & Categories
              </span>
              
              {/* + + Add Sub-Category Button inside section (Requirement 7) */}
              <button
                onClick={() => {
                  setEditingSubCat(null);
                  setNewSubCatName('');
                  setShowAddSubCatModal(true);
                }}
                className="bg-stone-100 hover:bg-stone-200 text-neutral-900 border border-stone-300 font-extrabold text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ + Add Sub-Category</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedSubDivisionFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedSubDivisionFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                All Sub-divisions ({subCategories.length})
              </button>

              {subCategories
                .filter((sc) => (selectedDivisionFilter === 'all' ? true : sc.parentCategoryId === parseInt(selectedDivisionFilter)))
                .map((sc) => {
                  const isSel = selectedSubDivisionFilter === sc.id;
                  const dishCount = getSubCatDishCount(sc.id);

                  return (
                    <div
                      key={`sub-div-pill-${sc.id}`}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSel
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedSubDivisionFilter(sc.id)}
                        className="cursor-pointer font-black"
                      >
                        <span>{sc.name}{sc.marathiName ? ` (${sc.marathiName})` : ''} ({dishCount})</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSubCat(sc);
                          setNewSubCatName(sc.name);
                          setShowAddSubCatModal(true);
                        }}
                        className="opacity-70 hover:opacity-100 p-0.5 cursor-pointer ml-1"
                        title="Edit Category Name"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDialog({
                            title: 'Delete Sub-Category?',
                            message: `Are you sure you want to delete sub-category "${sc.name}"?`,
                            confirmText: 'Yes, Delete',
                            confirmColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30',
                            onConfirm: () => {
                              onDeleteSubCategory(sc.id);
                            }
                          });
                        }}
                        className="opacity-70 hover:opacity-100 hover:text-rose-500 p-0.5 cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Search Bar with + + Add New Dish Button inside Section (Requirement 7) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-stone-200 rounded-2xl p-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dish by name or code..."
                value={dishSearchQuery}
                onChange={(e) => setDishSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-500">
                Showing {filteredDishes.length} Dishes
              </span>

              {/* + + Add New Dish Button inside section (Requirement 7) */}
              <button
                onClick={() => setShowAddDishModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ + Add New Dish</span>
              </button>
            </div>
          </div>

          {/* Dishes Table (Exact Columns Matching Image) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-extrabold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-3 text-center">Photo</th>
                    <th className="py-3 px-4">Dish Name (English)</th>
                    <th className="py-3 px-4">पदार्थाचे नाव (मराठी)</th>
                    <th className="py-3 px-4">Sub-Category</th>
                    <th className="py-3 px-4 text-center">Counter</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDishes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                        No dishes found matching the current division or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredDishes.map((dish, dIdx) => {
                      const subCat = subCategories.find((s) => s.id === dish.subCategoryId);
                      const isMulti = dish.hasMultiplePrices && dish.variants?.length > 0;

                      return (
                        <tr
                          key={`dish-row-${dish.id || dIdx}`}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          {/* Code */}
                          <td className="py-3 px-4 font-mono font-black text-slate-900">
                            <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md text-xs">
                              #{dish.srNo || dish.id}
                            </span>
                          </td>

                          {/* Photo */}
                          <td className="py-3 px-3 text-center">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 mx-auto flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          </td>

                          {/* Dish Name (English) */}
                          <td className="py-3 px-4 font-extrabold text-slate-900">
                            {dish.name}
                          </td>

                          {/* मराठी नाव */}
                          <td className="py-3 px-4 font-bold text-slate-600">
                            {dish.marathiName || '-'}
                          </td>

                          {/* Sub-Category */}
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {subCat?.name || 'General'}{subCat?.marathiName ? ` (${subCat.marathiName})` : ''}
                            </span>
                          </td>

                          {/* Counter */}
                          <td className="py-3 px-4 text-center">
                            <span className="bg-stone-100 text-stone-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-stone-200">
                              {dish.counter || 'Breakfast'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => setEditingDish(JSON.parse(JSON.stringify(dish)))}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                                title="Edit Dish"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setConfirmDialog({
                                    title: 'Delete Dish Item?',
                                    message: `Are you sure you want to delete dish "${dish.name}"?`,
                                    confirmText: 'Yes, Delete Dish',
                                    confirmColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30',
                                    onConfirm: () => {
                                      onDeleteDish(dish.id);
                                    }
                                  });
                                }}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete Dish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: BILLING HISTORY & REVENUE REPORTS (Requirement 11)             */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'history' && (
        <div className="space-y-6">
          
          {/* Top Filter Controls: Today vs All Time, Counter Dropdown, Search */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-base font-black text-neutral-900">
                Master Sales & Billing History
              </h3>
              <p className="text-xs text-stone-500 font-semibold mt-0.5">
                Executive revenue overview, payment mode breakdown, and full audit logs
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Calendar Date-Wise Picker & All Time Button */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <input
                    type="date"
                    value={historySelectedDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHistorySelectedDate(val);
                      setHistoryTimeFilter(val ? 'date' : 'all');
                    }}
                    className="text-xs font-black text-slate-800 bg-transparent outline-none cursor-pointer"
                    title="Filter revenue by specific date"
                  />
                  {historySelectedDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setHistorySelectedDate('');
                        setHistoryTimeFilter('all');
                      }}
                      className="text-slate-400 hover:text-slate-700 text-xs font-black px-1 rounded cursor-pointer"
                      title="Clear date (Show All Time)"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setHistorySelectedDate('');
                    setHistoryTimeFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                    historyTimeFilter === 'all' && !historySelectedDate
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:text-black hover:bg-slate-50 shadow-2xs'
                  }`}
                  title="Show all time cumulative revenue"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>All Time</span>
                </button>

                {/* Download Revenue PDF Button (Requirement 8) */}
                <button
                  type="button"
                  onClick={() => {
                    generateRevenuePDFReport({
                      bills: displayedHistoryBills,
                      metrics: {
                        totalRevenue: totalHistoryRevenue,
                        totalBills: baseCounterBills.length,
                        cashTotal: totalCash,
                        onlineTotal: totalOnline,
                        cardTotal: totalCard,
                        totalDiscounts,
                        totalDelivery,
                        totalContainer,
                        totalWaiterTips,
                        totalServiceCharges
                      },
                      dateFilterLabel: historySelectedDate ? `Date: ${historySelectedDate}` : 'All Time',
                      counterFilterLabel: historyCounterFilter === 'all' ? 'All Counters' : historyCounterFilter,
                      selectedDate: historySelectedDate || null
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  title="Download and print full PDF Revenue Report"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download Revenue PDF</span>
                </button>
              </div>

              {/* Counter Filter */}
              <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={historyCounterFilter}
                  onChange={(e) => setHistoryCounterFilter(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                >
                  <option value="all">All Counters</option>
                  {AVAILABLE_COUNTERS.map((c) => (
                    <option key={`h-opt-c-${c.id}`} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search table, counter, items..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-xl pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* ALL SUMMARY METRIC BOXES WITH CHARGES (Requirement 8, 9 & 11) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
            
            {/* 1. Today's Revenue Box */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-3.5 shadow-xs border border-emerald-500 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-100 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">Today's Revenue</span>
                <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white/20">
                  Live
                </span>
              </div>
              <div className="text-xl font-black text-white tracking-tight">₹{todayTotalRevenue.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-emerald-100/90 mt-1 flex items-center justify-between">
                <span>{todaySettledCount} Bills Today</span>
                <span className="text-emerald-200 text-[9px] font-extrabold">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            </div>

            {/* 2. Total Sales in Active Filter */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {historySelectedDate ? 'Selected Date' : (historyTimeFilter === 'all' ? 'All-Time Total' : 'Total Sales')}
                </span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-black text-neutral-900">₹{totalHistoryRevenue.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">{baseCounterBills.length} Bills in Filter</div>
            </div>

            {/* 3. Cash Total */}
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Cash Total</span>
                <Banknote className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-emerald-800">₹{totalCash.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">Direct Cash Drawer</div>
            </div>

            {/* 4. Online / UPI */}
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Online / UPI</span>
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-black text-blue-800">₹{totalOnline.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">QR Phone Payments</div>
            </div>

            {/* 5. Card Total */}
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Card Total</span>
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg font-black text-purple-800">₹{totalCard.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">POS Card Swipes</div>
            </div>

            {/* 6. Discounts */}
            <div className="bg-white border border-rose-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">Discounts</span>
                <Tag className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-lg font-black text-rose-700">₹{totalDiscounts.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-rose-500 mt-1">Total Concessions</div>
            </div>

            {/* 7. Extra Charges */}
            <div className="bg-white border border-amber-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-500 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Extra Charges</span>
                <Layers className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-lg font-black text-amber-800">
                ₹{(totalDelivery + totalContainer + totalWaiterTips + totalServiceCharges).toFixed(2)}
              </div>
              <div className="text-[9px] font-bold text-stone-500 mt-1 truncate" title={`Del: ₹${totalDelivery} | Cont: ₹${totalContainer} | Tip: ₹${totalWaiterTips} | Serv: ₹${totalServiceCharges}`}>
                Del: ₹{totalDelivery.toFixed(0)} • Cont: ₹{totalContainer.toFixed(0)} • Tip: ₹{totalWaiterTips.toFixed(0)}
              </div>
            </div>

            {/* 8. Settled Count */}
            <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Settled Count</span>
                <Receipt className="w-4 h-4 text-neutral-800" />
              </div>
              <div className="text-lg font-black text-neutral-900">{displayedHistoryBills.length}</div>
              <div className="text-[10px] font-bold text-stone-500 mt-1">Active Filter View</div>
            </div>
          </div>

          {/* COUNTER-WISE SALES BREAKDOWN CARDS */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Monitor className="w-3.5 h-3.5" />
              <span>Counter-Wise Revenue Breakdown</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(counterBreakdown).map(([cName, data], cIdx) => (
                <div
                  key={`history-cbreak-${cIdx}`}
                  className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                      {data.shortName || cName}
                    </span>
                    <h4 className="font-extrabold text-xs text-neutral-800 line-clamp-1 mt-0.5">
                      {cName}
                    </h4>
                  </div>
                  <div className="mt-3 flex justify-between items-baseline pt-2 border-t border-stone-100">
                    <span className="text-lg font-black text-neutral-900">₹{data.total.toFixed(2)}</span>
                    <span className="text-[11px] font-bold text-stone-500">{data.count} bills</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FULL SETTLED BILLS TABLE (Requirement 11) */}
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-extrabold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Table / Area</th>
                    <th className="py-3 px-4">Counter</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayedHistoryBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400 font-semibold">
                        No billing history records found.
                      </td>
                    </tr>
                  ) : (
                    displayedHistoryBills.map((bill, bIdx) => {
                      const billDate = new Date(bill.createdAt || Date.now());
                      const formattedDate = billDate.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      });
                      const formattedTime = billDate.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });

                      return (
                        <tr key={`h-bill-${bill.id || bIdx}`} className="hover:bg-amber-50/30">
                          <td className="py-3 px-4 font-bold text-neutral-900">
                            {bill.tableNo || 'Takeaway'}
                          </td>
                          <td className="py-3 px-4 font-bold text-stone-700">
                            {bill.counter || 'Counter 1'}
                          </td>
                          <td className="py-3 px-4 text-stone-700 max-w-[200px] truncate">
                            {(bill.items || []).map((i) => `${i.name} (${i.unit || i.qty})`).join(', ')}
                          </td>
                          <td className="py-3 px-4 font-bold">
                            {bill.paymentDetails?.mode || 'Cash'}
                          </td>
                          <td className="py-3 px-4 text-stone-600">
                            <div>{formattedDate}</div>
                            <div className="text-[10px] text-stone-400">{formattedTime}</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-black text-sm text-neutral-900">
                              ₹{(bill.total !== undefined ? bill.total : (bill.finalTotal || 0)).toFixed(2)}
                            </div>
                            {(() => {
                              const bDisc = parseFloat(bill.discountAmount) || (typeof bill.discount === 'number' ? bill.discount : (parseFloat(bill.discount?.amount || bill.discount?.value) || 0));
                              const bDel = parseFloat(bill.deliveryCharge) || 0;
                              const bCont = parseFloat(bill.containerCharge) || 0;
                              const bTip = parseFloat(bill.waiterTip) || 0;
                              const bServ = parseFloat(bill.serviceCharge) || 0;
                              const hasAny = bDisc > 0 || bDel > 0 || bCont > 0 || bTip > 0 || bServ > 0;
                              if (!hasAny) return null;
                              return (
                                <div className="flex flex-wrap justify-end gap-1 mt-1 max-w-[210px] ml-auto">
                                  {bDisc > 0 && (
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                      Disc -₹{bDisc.toFixed(2)}
                                    </span>
                                  )}
                                  {bDel > 0 && (
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                      Del +₹{bDel.toFixed(2)}
                                    </span>
                                  )}
                                  {bCont > 0 && (
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                      Cont +₹{bCont.toFixed(2)}
                                    </span>
                                  )}
                                  {bTip > 0 && (
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Tip +₹{bTip.toFixed(2)}
                                    </span>
                                  )}
                                  {bServ > 0 && (
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      Serv +₹{bServ.toFixed(2)}
                                    </span>
                                  )}
                                  {bill.subtotal !== undefined && bill.subtotal !== bill.total && (
                                    <span className="text-[10px] font-bold text-stone-400 block w-full text-right">
                                      Subtotal: ₹{Number(bill.subtotal).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => printThermalReceipt(bill, { language: printLanguage })}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                                title="Reprint Bill"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: DINING AREA RATES MATRIX                                       */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* SUB-TAB 3: DINING AREAS, TABLES & PRICE MATRIX                            */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'sections' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* SECTION 1: DINING AREAS & TABLES CRUD MANAGER */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-black text-neutral-900 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-amber-700" />
                  <span>Dining Areas & Cards Setup</span>
                </h3>
                <p className="text-xs text-stone-500 font-semibold mt-0.5">
                  Create, rename, or delete dining areas and manage cards/boxes per section.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewAreaName('');
                  setShowAddAreaModal(true);
                }}
                className="bg-neutral-900 hover:bg-black text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Add New Area</span>
              </button>
            </div>

            {/* List of Dining Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortSectionsWithParcelsLast(sections).map((sec) => {
                const secTables = tables.filter((t) => t && (t.sectionId === sec.id || String(t.sectionId) === String(sec.id)));

                return (
                  <div key={`admin-sec-card-${sec.id}`} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                    
                    {/* Area Title & Edit/Delete Actions */}
                    <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200">
                      {editingSectionId === sec.id ? (
                        <div className="flex items-center space-x-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingSectionName}
                            onChange={(e) => setEditingSectionName(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-black text-slate-900 outline-none flex-1"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (editingSectionName.trim()) {
                                if (typeof onUpdateSection === 'function') {
                                  await onUpdateSection(sec.id, { name: editingSectionName.trim() });
                                } else {
                                  await db.sections.update(sec.id, { name: editingSectionName.trim() });
                                }
                              }
                              setEditingSectionId(null);
                            }}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                            title="Save Name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSectionId(null)}
                            className="p-1.5 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Utensils className="w-4 h-4 text-amber-700" />
                          <span className="font-black text-sm text-neutral-900">{sec.name}</span>
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                            {secTables.length} Cards
                          </span>
                        </div>
                      )}

                      {editingSectionId !== sec.id && (
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSectionId(sec.id);
                              setEditingSectionName(sec.name);
                            }}
                            className="p-1.5 text-stone-600 hover:text-neutral-900 hover:bg-stone-100 rounded-lg cursor-pointer"
                            title="Edit Area Name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDialog({
                                title: 'Delete Dining Area?',
                                message: `Are you sure you want to delete Dining Area "${sec.name}"?`,
                                confirmText: 'Yes, Delete Area',
                                confirmColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30',
                                onConfirm: async () => {
                                  if (typeof onDeleteSection === 'function') {
                                    await onDeleteSection(sec.id);
                                  } else {
                                    await db.sections.delete(sec.id);
                                  }
                                }
                              });
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Area"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tables Grid under this Area */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {secTables.map((tbl) => (
                          <div
                            key={`admin-tbl-${tbl.id}`}
                            className={`border rounded-xl px-2.5 py-1 text-xs font-extrabold flex items-center space-x-1.5 shadow-2xs group ${
                              tbl.isParcel
                                ? 'bg-amber-50 border-amber-300 text-amber-950'
                                : 'bg-white border-stone-300 text-neutral-800'
                            }`}
                          >
                            <span>{tbl.name}</span>
                            {tbl.isParcel && (
                              <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                                Parcel
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDialog({
                                  title: 'Remove Card?',
                                  message: `Are you sure you want to remove card "${tbl.name}" from ${sec.name}?`,
                                  confirmText: 'Yes, Remove Card',
                                  confirmColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30',
                                  onConfirm: async () => {
                                    if (typeof onDeleteTable === 'function') {
                                      await onDeleteTable(tbl.id);
                                    } else {
                                      await db.diningTables.delete(tbl.id);
                                    }
                                  }
                                });
                              }}
                              className="text-stone-300 group-hover:text-rose-600 cursor-pointer p-0.5"
                              title="Delete Table"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Card to Area Input */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (addTableAreaId === sec.id && newTableName.trim()) {
                            const newCardPayload = {
                              name: newTableName.trim(),
                              sectionId: sec.id,
                              status: 'empty',
                              currentCart: [],
                              currentTokenNo: Math.floor(1000 + Math.random() * 9000).toString(),
                              isParcel: Boolean(isNewCardParcel),
                              createdAt: null
                            };
                            if (typeof onAddTable === 'function') {
                              await onAddTable(newCardPayload);
                            } else {
                              await db.diningTables.add(newCardPayload);
                            }
                            setNewTableName('');
                            setAddTableAreaId(null);
                            setIsNewCardParcel(false);
                          }
                        }}
                        className="flex flex-wrap items-center gap-2 pt-1"
                      >
                        {addTableAreaId === sec.id ? (
                          <div className="flex flex-wrap items-center gap-2 w-full">
                            <input
                              type="text"
                              placeholder={isNewCardParcel ? "Parcel box (e.g. P5)" : "Table card (e.g. D9, AC6, T1)"}
                              autoFocus
                              value={newTableName}
                              onChange={(e) => setNewTableName(e.target.value)}
                              className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-900 outline-none flex-1 min-w-[120px]"
                            />
                            
                            {/* Card Type Toggle */}
                            <label className="flex items-center space-x-1.5 text-xs font-black cursor-pointer px-2 py-1 bg-white border border-stone-200 rounded-lg select-none">
                              <input
                                type="checkbox"
                                checked={isNewCardParcel}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setIsNewCardParcel(checked);
                                  setNewTableName(getNextAvailableCardName(sec.name, checked));
                                }}
                                className="w-3.5 h-3.5 rounded text-amber-600 cursor-pointer"
                              />
                              <span className={isNewCardParcel ? 'text-amber-800' : 'text-stone-600'}>
                                {isNewCardParcel ? '📦 Parcel / Takeaway' : '🍽️ Dining Table'}
                              </span>
                            </label>

                            <button
                              type="submit"
                              className="bg-neutral-900 hover:bg-black text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAddTableAreaId(null);
                                setIsNewCardParcel(false);
                              }}
                              className="bg-stone-200 text-stone-700 font-bold text-xs px-2.5 py-1.5 rounded-xl cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAddTableAreaId(sec.id);
                                setIsNewCardParcel(false);
                                setNewTableName(getNextAvailableCardName(sec.name, false));
                              }}
                              className="text-xs font-black text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add Table Card</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAddTableAreaId(sec.id);
                                setIsNewCardParcel(true);
                                setNewTableName(getNextAvailableCardName(sec.name, true));
                              }}
                              className="text-xs font-black text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add Parcel Card</span>
                            </button>
                          </div>
                        )}
                      </form>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: DINING AREA PRICE MATRIX */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-neutral-900">
                  Dining Area Price Matrix
                </h3>
                {hasUnsavedMatrixChanges && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 rounded-full animate-pulse">
                    Unsaved Changes / जतन न केलेले बदल
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-semibold mt-0.5">
                Set custom prices per dish for different sections (e.g. First Floor, AC Hall, Parcels, Sweets)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {hasUnsavedMatrixChanges && (
                <button
                  type="button"
                  onClick={handleDiscardMatrixChanges}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-black text-xs px-3.5 py-2 rounded-xl border border-stone-300 cursor-pointer transition-all flex items-center space-x-1.5"
                  title="Discard changes and revert to database rates"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Discard Changes</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveAllMatrixRates}
                className="bg-neutral-900 hover:bg-black text-white font-black text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{ratesSavedFeedback ? '✓ Rates Saved!' : 'Save All Matrix Rates'}</span>
              </button>
            </div>
          </div>

          {/* Category Filter for Matrix: Strictly Two Filters (Breakfast & Sweet) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setMatrixFilterCat('1')}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center space-x-2 ${
                  matrixFilterCat === '1'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>Breakfast ({dishes.filter((d) => d.categoryId === 1).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMatrixFilterCat('2')}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center space-x-2 ${
                  matrixFilterCat === '2'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Candy className="w-4 h-4" />
                <span>Sweet ({dishes.filter((d) => d.categoryId === 2).length})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dish name or code..."
                value={matrixSearchQuery}
                onChange={(e) => setMatrixSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-7 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {matrixSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMatrixSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {(() => {
            const isSweetMatrix = matrixFilterCat === '2';

            // For Breakfast: show normal dining sections (Dine In, First Floor, AC Hall, Parcels) - hide section 5 (Sweets)
            // For Sweet: remove Parcels (section 4), remove section 5, show dining areas + 250g + 500g + 1 Kg
            const relevantSections = isSweetMatrix
              ? sections.filter((s) => s.id !== 4 && s.id !== 5 && !s.name?.toLowerCase().includes('parcel') && !s.name?.toLowerCase().includes('sweet'))
              : sections.filter((s) => s.id !== 5 && !s.name?.toLowerCase().includes('sweet'));

            const matrixFilteredDishes = dishes.filter((dish) => {
              if (isSweetMatrix) {
                if (dish.categoryId !== 2 && dish.counter?.toLowerCase() !== 'sweets') return false;
              } else {
                if (dish.categoryId !== 1 && dish.counter?.toLowerCase() === 'sweets') return false;
              }
              if (matrixSearchQuery.trim()) {
                const q = matrixSearchQuery.toLowerCase().trim();
                const matchName = dish.name?.toLowerCase().includes(q);
                const matchMarathi = dish.marathiName?.toLowerCase().includes(q);
                const matchCode = dish.srNo?.toString().includes(q) || dish.id?.toString().includes(q);
                return matchName || matchMarathi || matchCode;
              }
              return true;
            });

            const totalColumns = relevantSections.length + 2 + (isSweetMatrix ? 3 : 0);

            return (
              <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-extrabold text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4 w-20">Code</th>
                        <th className="py-3 px-4 min-w-[200px]">Dish Name</th>
                        {relevantSections.map((sec) => (
                          <th key={`sec-rate-th-${sec.id}`} className="py-3 px-4 text-center">
                            {sec.name} (₹)
                          </th>
                        ))}
                        {isSweetMatrix && (
                          <>
                            <th className="py-3 px-4 text-center bg-rose-50 text-rose-900 border-l border-rose-200">
                              1 Kg (₹)
                            </th>
                            <th className="py-3 px-4 text-center bg-amber-50 text-amber-900">
                              500g (₹)
                            </th>
                            <th className="py-3 px-4 text-center bg-amber-50 text-amber-900 border-r border-amber-200">
                              250g (₹)
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matrixFilteredDishes.length === 0 ? (
                        <tr>
                          <td colSpan={totalColumns} className="py-8 text-center text-stone-400 font-semibold">
                            No dishes found matching filter.
                          </td>
                        </tr>
                      ) : (
                        matrixFilteredDishes.map((dish) => {
                          const rates = dishSectionRates[dish.id] || {};

                          return (
                            <tr key={`matrix-d-${dish.id}`} className="hover:bg-blue-50/20">
                              <td className="py-3 px-4 font-mono font-bold text-slate-600">#{dish.srNo || dish.id}</td>
                              <td className="py-3 px-4">
                                <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{dish.name}</div>
                                {dish.marathiName && (
                                  <div className="text-xs font-black text-blue-900 mt-0.5">
                                    {dish.marathiName}
                                  </div>
                                )}
                              </td>

                              {/* Dining Areas */}
                              {relevantSections.map((sec) => {
                                const currentVal = rates[sec.id] !== undefined
                                  ? rates[sec.id]
                                  : (dish.sectionPrices?.[sec.id] !== undefined ? dish.sectionPrices[sec.id] : '');

                                return (
                                  <td key={`matrix-input-${dish.id}-${sec.id}`} className="py-3 px-4 text-center">
                                    <input
                                      type="number"
                                      placeholder={dish.price ? dish.price.toString() : '0'}
                                      value={currentVal}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setHasUnsavedMatrixChanges(true);
                                        setDishSectionRates((prev) => ({
                                          ...prev,
                                          [dish.id]: {
                                            ...(prev[dish.id] || {}),
                                            [sec.id]: val
                                          }
                                        }));
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const allInputs = Array.from(document.querySelectorAll('.matrix-rate-input'));
                                          const currentIndex = allInputs.indexOf(e.target);
                                          if (currentIndex !== -1 && currentIndex + 1 < allInputs.length) {
                                            allInputs[currentIndex + 1].focus();
                                            allInputs[currentIndex + 1].select();
                                          }
                                        }
                                      }}
                                      className="matrix-rate-input w-20 sm:w-24 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500 rounded-lg p-1.5 text-center font-black outline-none text-xs transition-all"
                                    />
                                  </td>
                                );
                              })}

                              {/* Sweet 1 Kg, 500g, 250g Columns in Strict 1kg -> 500g -> 250g Order */}
                              {isSweetMatrix && (
                                <>
                                  {/* 1 Kg Column (Entering 1 Kg sets 500g and 250g automatically) */}
                                  <td className="py-3 px-4 text-center bg-rose-50/30 border-l border-rose-100">
                                    <input
                                      type="number"
                                      placeholder={dish.pricePerKg || dish.variants?.find((v) => v.unit === '1 Kg' || v.unit === '1Kg')?.price || dish.sectionPrices?.[5] || (dish.price ? dish.price * 4 : '320')}
                                      value={
                                        rates.price1kg !== undefined
                                          ? rates.price1kg
                                          : (dish.pricePerKg || dish.variants?.find((v) => v.unit === '1 Kg' || v.unit === '1Kg')?.price || dish.sectionPrices?.[5] || (dish.price ? dish.price * 4 : '320'))
                                      }
                                      onChange={(e) => handleSweet1KgChange(dish.id, e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const allInputs = Array.from(document.querySelectorAll('.matrix-rate-input'));
                                          const currentIndex = allInputs.indexOf(e.target);
                                          if (currentIndex !== -1 && currentIndex + 1 < allInputs.length) {
                                            allInputs[currentIndex + 1].focus();
                                            allInputs[currentIndex + 1].select();
                                          }
                                        }
                                      }}
                                      className="matrix-rate-input w-20 sm:w-24 bg-rose-50 border border-rose-300 focus:bg-white focus:border-rose-600 focus:ring-2 focus:ring-rose-500 rounded-lg p-1.5 text-center font-black outline-none text-xs transition-all text-rose-900"
                                      title="Price for 1 Kg (entering sets 500g and 250g automatically)"
                                    />
                                  </td>

                                  {/* 500g Column */}
                                  <td className="py-3 px-4 text-center bg-amber-50/30">
                                    <input
                                      type="number"
                                      placeholder={dish.variants?.find((v) => v.unit === '500g')?.price || (dish.price ? dish.price * 2 : '160')}
                                      value={
                                        rates.price500g !== undefined
                                          ? rates.price500g
                                          : (dish.variants?.find((v) => v.unit === '500g')?.price || (dish.price ? dish.price * 2 : ''))
                                      }
                                      onChange={(e) => handleSweetGramChange(dish.id, 'price500g', e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const allInputs = Array.from(document.querySelectorAll('.matrix-rate-input'));
                                          const currentIndex = allInputs.indexOf(e.target);
                                          if (currentIndex !== -1 && currentIndex + 1 < allInputs.length) {
                                            allInputs[currentIndex + 1].focus();
                                            allInputs[currentIndex + 1].select();
                                          }
                                        }
                                      }}
                                      className="matrix-rate-input w-20 sm:w-24 bg-amber-50 border border-amber-300 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500 rounded-lg p-1.5 text-center font-black outline-none text-xs transition-all text-amber-900"
                                      title="Price for 500g (can be edited independently)"
                                    />
                                  </td>

                                  {/* 250g Column */}
                                  <td className="py-3 px-4 text-center bg-amber-50/30 border-r border-amber-100">
                                    <input
                                      type="number"
                                      placeholder={dish.variants?.find((v) => v.unit === '250g')?.price || dish.price || '80'}
                                      value={
                                        rates.price250g !== undefined
                                          ? rates.price250g
                                          : (dish.variants?.find((v) => v.unit === '250g')?.price || dish.price || '')
                                      }
                                      onChange={(e) => handleSweetGramChange(dish.id, 'price250g', e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const allInputs = Array.from(document.querySelectorAll('.matrix-rate-input'));
                                          const currentIndex = allInputs.indexOf(e.target);
                                          if (currentIndex !== -1 && currentIndex + 1 < allInputs.length) {
                                            allInputs[currentIndex + 1].focus();
                                            allInputs[currentIndex + 1].select();
                                          }
                                        }
                                      }}
                                      className="matrix-rate-input w-20 sm:w-24 bg-amber-50 border border-amber-300 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500 rounded-lg p-1.5 text-center font-black outline-none text-xs transition-all text-amber-900"
                                      title="Price for 250g (can be edited independently)"
                                    />
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Add Area Modal */}
          {showAddAreaModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
              <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-neutral-900 flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-amber-700" />
                    <span>Add New Dining Area</span>
                  </h3>
                  <button
                    onClick={() => setShowAddAreaModal(false)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-900 block mb-1.5">
                    Area Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Roof Top / Garden"
                    autoFocus
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAreaModal(false)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (newAreaName.trim()) {
                        const newSec = {
                          name: newAreaName.trim(),
                          extraCharge: 0,
                          color: 'blue'
                        };
                        if (typeof onAddSection === 'function') {
                          await onAddSection(newSec);
                        } else {
                          await db.sections.add(newSec);
                        }
                        setNewAreaName('');
                        setShowAddAreaModal(false);
                      }
                    }}
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer"
                  >
                    Save Area
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}



      {/* ========================================================================= */}
      {/* SUB-TAB 4: DYNAMIC UPI QR CODE SETTINGS (Matches Mockup)                  */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'upi' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl space-y-6">
            
            {/* Header */}
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2.5">
                <QrCode className="w-5 h-5 text-blue-600" />
                <span>Dynamic UPI QR Code Settings</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
                Enter your Google Pay / PhonePe / Paytm / Bank VPA UPI ID below. The software automatically computes exact bill total dynamically and renders a scannable UPI QR code on every customer bill.
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-900 block mb-1.5">
                  Dynamic UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8446091809@ybl"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-900 block mb-1.5">
                  Account / Payee Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karuna Hotel"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Live QR Preview Box (₹100 Demo) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="bg-white p-2 border border-stone-300 rounded-xl shadow-xs shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`upi://pay?pa=${upiId || '8446091809@ybl'}&pn=${payeeName || 'Karuna Hotel'}&am=100&cu=INR`)}&margin=1`}
                  alt="UPI QR Preview"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-black text-sm text-neutral-900">
                  Live QR Preview (₹100 Demo)
                </h4>
                <p className="text-xs text-stone-500 font-semibold">
                  Scan with PhonePe / GPay / Paytm to test UPI ID format and instant verification
                </p>
                <div className="text-[11px] font-mono font-bold text-amber-800 pt-1">
                  UPI VPA: {upiId || '8446091809@ybl'}
                </div>
              </div>
            </div>

            {/* Settle Tab Edit Button Access Control (Enable / Disable) */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                      isSettledBillEditEnabled ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}>
                      {isSettledBillEditEnabled ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">
                        Settle Tab Edit Button Permission (बिल एडिट पर्याय)
                      </h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          isSettledBillEditEnabled 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {isSettledBillEditEnabled ? 'STATUS: ABLE (सुरू)' : 'STATUS: DISABLE (बंद)'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold pt-1 leading-relaxed">
                    Set whether the <strong>Edit / Resettle</strong> button in the <strong>Settle Tab</strong> is Able or Disable. Once set as Able, it will always stay able; once set as Disable, it will always stay disable.
                  </p>
                </div>
              </div>

              {/* Able / Disable Toggle Control */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleEditPermission(true)}
                  className={`py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer border-2 ${
                    isSettledBillEditEnabled
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Able (सुरू / Enable)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleEditPermission(false)}
                  className={`py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer border-2 ${
                    !isSettledBillEditEnabled
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400/40'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-900'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  <span>Disable (बंद / Lock)</span>
                </button>
              </div>

              {/* Status explanation notice */}
              <div className={`p-3 rounded-xl text-xs font-bold border ${
                isSettledBillEditEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {isSettledBillEditEnabled ? (
                  <span>✓ <strong>Edit button is ABLE:</strong> The Edit button in the Settle tab is active. Staff can modify items, charges, and resettle bills.</span>
                ) : (
                  <span>🔒 <strong>Edit button is DISABLE:</strong> The Edit button in the Settle tab is locked and disabled. No one can edit or alter settled bills.</span>
                )}
              </div>
            </div>

            {/* Success Feedback Banner */}
            {upiSavedToast && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✓ Settings saved successfully! UPI configuration and Settle Tab edit permissions are updated.</span>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveUpiSettings}
                disabled={!upiId.trim()}
                className="bg-neutral-900 hover:bg-black text-white font-black text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-2 disabled:opacity-40"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save UPI & Security Settings</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: BACKUP & RESTORE DATABASE & BULK RATES IMPORT / EXPORT         */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'backup' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Menu Rates Bulk Excel / CSV (Export & Import) */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="font-black text-sm text-neutral-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Menu Dishes Bulk Rates (Excel / CSV)</span>
              </h4>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Export all food dish rates to a CSV / Excel spreadsheet, edit prices in bulk offline, and import back into the system with 1 click.
              </p>

              {bulkRatesMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                  bulkRatesMessage.success
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}>
                  {bulkRatesMessage.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{bulkRatesMessage.text}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Export Breakfast Button */}
                <button
                  type="button"
                  onClick={() => exportBreakfastItemsToCSV(dishes, categories, subCategories)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-xs transition-colors"
                  title="Download Breakfast Excel (with Dining, First Floor, AC, Parcel columns)"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Breakfast Excel</span>
                </button>

                {/* Export Sweets Button */}
                <button
                  type="button"
                  onClick={() => exportSweetsItemsToCSV(dishes, categories, subCategories)}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-black text-xs px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-xs transition-colors"
                  title="Download Sweets Excel (with Dining, First Floor, AC, Parcel, 250g, 500g, 1Kg columns)"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Sweets Excel</span>
                </button>

                {/* Import Button */}
                <label className="bg-neutral-900 hover:bg-black text-white font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-xs transition-colors">
                  <Upload className="w-4 h-4 text-amber-300" />
                  <span>Import Excel / CSV File</span>
                  <input
                    type="file"
                    accept=".csv, .txt, .xlsx"
                    onChange={handleImportExcelFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* JSON Full Database Backup & Restore */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="font-black text-sm text-neutral-900 flex items-center space-x-2">
                <Database className="w-4 h-4 text-amber-700" />
                <span>Full System Database (JSON)</span>
              </h4>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Complete database backup including all categories, dishes, raw materials, stock, recipes, and settled bills.
              </p>

              {jsonRestoreMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                  jsonRestoreMessage.success
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}>
                  {jsonRestoreMessage.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{jsonRestoreMessage.text}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Export JSON */}
                <button
                  type="button"
                  onClick={async () => {
                    const backup = await db.exportBackup();
                    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `karuna_pos_backup_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                  }}
                  className="bg-neutral-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON Backup</span>
                </button>

                {/* Import JSON */}
                <label className="bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-xs transition-colors">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Import JSON Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJsonBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW DISH (With Base Per-Kg Rate & Multi-Price - Requirement 8) */}
      {/* ========================================================================= */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-black text-neutral-900 text-base">
                + + Add New Dish to Menu
              </h3>
              <button
                onClick={() => setShowAddDishModal(false)}
                className="text-stone-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-stone-500 uppercase block mb-1">
                    Dish Name (English) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kaju Katli"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    पदार्थाचे नाव (मराठी)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. काजू कतली"
                    value={newDishMarathiName}
                    onChange={(e) => setNewDishMarathiName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    Code #
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 201"
                    value={newDishSrNo}
                    onChange={(e) => setNewDishSrNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    Division
                  </label>
                  <select
                    value={newDishCatId}
                    onChange={(e) => setNewDishCatId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    {categories.map((c) => (
                      <option key={`opt-cat-${c.id}`} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    Sub-Category
                  </label>
                  <select
                    value={newDishSubCatId}
                    onChange={(e) => setNewDishSubCatId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    {subCategories.map((s) => (
                      <option key={`opt-sub-${s.id}`} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Counter Assignment
                </label>
                <select
                  value={newDishCounter}
                  onChange={(e) => setNewDishCounter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="Breakfast">Breakfast & Snacks</option>
                  <option value="Sweets">Sweets & Farsan</option>
                  <option value="Parcel">Parcel & Takeaway</option>
                </select>
              </div>

              {/* Rates Managed Exclusively in Area Matrix Tab */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-2.5">
                <span className="text-base select-none">📌</span>
                <div className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-black block text-blue-950 mb-0.5">Rates Set in Area Matrix Tab Only</span>
                  Prices for Dine In, First Floor, AC, Parcels, and Sweets (250g, 500g, 1 Kg) are configured exclusively in the <strong>Dining Area Price Matrix</strong> tab after adding the dish.
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => setShowAddDishModal(false)}
                className="flex-1 bg-stone-100 text-stone-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewDish}
                disabled={!newDishName}
                className="flex-1 bg-neutral-900 hover:bg-black text-white font-black text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-40"
              >
                Save Dish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT DISH                                                          */}
      {/* ========================================================================= */}
      {editingDish && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-black text-neutral-900 text-base">
                Edit Dish: {editingDish.name}
              </h3>
              <button onClick={() => setEditingDish(null)} className="text-stone-400 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-stone-500 uppercase block mb-1">
                    Dish Name (English)
                  </label>
                  <input
                    type="text"
                    value={editingDish.name || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    पदार्थाचे नाव (मराठी)
                  </label>
                  <input
                    type="text"
                    value={editingDish.marathiName || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, marathiName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              {/* Rates Managed Exclusively in Area Matrix Tab */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-2.5">
                <span className="text-base select-none">📌</span>
                <div className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-black block text-blue-950 mb-0.5">Rates Set in Area Matrix Tab Only</span>
                  Prices for all areas (Dine In, First Floor, AC, Parcels) and sweet portion weights (250g, 500g, 1 Kg) are managed exclusively in the <strong>Dining Area Price Matrix</strong> tab.
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => setEditingDish(null)}
                className="flex-1 bg-stone-100 text-stone-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDishEdits}
                className="flex-1 bg-neutral-900 hover:bg-black text-white font-black text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SUB-CATEGORY                                            */}
      {/* ========================================================================= */}
      {showAddSubCatModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-black text-neutral-900 text-sm">
                {editingSubCat ? 'Edit Sub-Category' : '+ + Add Sub-Category'}
              </h3>
              <button onClick={() => setShowAddSubCatModal(false)} className="text-stone-400 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-stone-500 uppercase block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. South Indian Specials"
                  value={newSubCatName}
                  onChange={(e) => setNewSubCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                />
              </div>

              {!editingSubCat && (
                <div>
                  <label className="text-[10px] font-black text-stone-500 uppercase block mb-1">
                    Parent Division
                  </label>
                  <select
                    value={newSubCatParentId}
                    onChange={(e) => setNewSubCatParentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    {categories.map((c) => (
                      <option key={`opt-pcat-${c.id}`} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => setShowAddSubCatModal(false)}
                className="flex-1 bg-stone-100 text-stone-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubCategory}
                disabled={!newSubCatName}
                className="flex-1 bg-neutral-900 hover:bg-black text-white font-black text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal (No browser popups!) */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-lg text-neutral-900">{confirmDialog.title}</h3>
                <p className="text-xs font-bold text-stone-500">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="py-3 bg-stone-100 hover:bg-stone-200 text-neutral-800 font-black rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (confirmDialog.onConfirm) {
                    await confirmDialog.onConfirm();
                  }
                  setConfirmDialog(null);
                }}
                className={`py-3 ${confirmDialog.confirmColor || 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'} text-white font-black rounded-xl text-xs transition shadow-lg cursor-pointer`}
              >
                {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Save or Discard Rates when leaving Area Matrix */}
      {showSubTabUnsavedModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-lg text-neutral-900">
                  Save Changes to Rates?
                </h3>
                <p className="text-xs font-bold text-stone-500">
                  दर बदल जतन करायचे आहेत का?
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-semibold">
              You have modified rates in the Area Rates Matrix that have not been saved yet. Would you like to save these new rates or discard the changes before switching tabs?
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  await handleSaveAllMatrixRates();
                  setShowSubTabUnsavedModal(false);
                  if (pendingSubTab) {
                    setActiveAdminSubTab(pendingSubTab);
                    setPendingSubTab(null);
                  }
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Rates & Continue (दर जतन करा)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDiscardMatrixChanges();
                  setShowSubTabUnsavedModal(false);
                  if (pendingSubTab) {
                    setActiveAdminSubTab(pendingSubTab);
                    setPendingSubTab(null);
                  }
                }}
                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded-xl text-xs transition border border-rose-200 cursor-pointer flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Discard Changes (बदल रद्द करा)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSubTabUnsavedModal(false);
                  setPendingSubTab(null);
                }}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Stay on Matrix Tab (इथेच थांबा)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
