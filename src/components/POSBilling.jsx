import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Sparkles,
  ArrowLeft,
  Printer,
  Utensils,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  X,
  Edit2,
  Check,
  Receipt
} from 'lucide-react';
import TableGrid, { getSectionTheme } from './TableGrid';
import { printKOTReceipt, printThermalReceipt, formatItemQtyDisplay, getPrintDishName } from '../utils/receiptUtils';
import { db, getDishPriceForSection } from '../db/db';

const formatTokenNumber = (token, table) => {
  if (token) return String(token).replace(/^#/, '');
  if (table?.currentTokenNo) return String(table.currentTokenNo).replace(/^#/, '');
  if (table?.id) return String(1000 + (parseInt(table.id) || 1));
  return '1000';
};

export default function POSBilling({
  currentZoom = 100,
  dishes,
  categories,
  subCategories,
  sections,
  tables,
  activeSection,
  setActiveSection,
  activeTable,
  settledBillsCount,
  settledBills,
  allDishes,
  billLogs,
  onUpdateSettledBill,
  onSelectTable,
  onSaveTableOrder,
  onOpenAddTableModal,
  onNavigateToSettled,
  onOpenOrderPopupForTable,
  onSplitTable,
  onDeleteTable,
  cartItems,
  onAddToCart,
  onReduceFromCart,
  onUpdateCartItem,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onSettleBill,
  printLanguage = 'mr',
  activeCounter = '',
  isSettledBillEditEnabled,
  preOrders = []
}) {
  const sortedCategories = [...categories].sort((a, b) => (a.srNo || 0) - (b.srNo || 0));

  const [selectedMainCatId, setSelectedMainCatId] = useState(sortedCategories[0]?.id || 1);
  const [selectedSubCatId, setSelectedSubCatId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [noticeToast, setNoticeToast] = useState(null);
  const searchInputRef = useRef(null);
  const cartListRef = useRef(null);
  const [rememberedAreaFilter, setRememberedAreaFilter] = useState('all');

  // Auto-scroll cart list container to bottom whenever cart items update
  useEffect(() => {
    if (cartListRef.current) {
      cartListRef.current.scrollTop = cartListRef.current.scrollHeight;
    }
  }, [cartItems]);
  
  const [shortCodeInput, setShortCodeInput] = useState('');
  
  // Footer bar active dish for multi-price options (Requirement 1)
  const [activeFooterDish, setActiveFooterDish] = useState(null);
  const [customKgInput, setCustomKgInput] = useState('');
  const [sweetEntryMode, setSweetEntryMode] = useState('kg'); // 'kg' | 'price'
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [editingCartItemIndex, setEditingCartItemIndex] = useState(null); // in-place cart edit index
  const [isParcelMode, setIsParcelMode] = useState(false); // Toggle to add items as Parcel from top search bar

  // Cart inline editing state (Requirement 3)
  const [editingCartItemId, setEditingCartItemId] = useState(null); // id of item being edited
  const [editingField, setEditingField] = useState(null); // 'qty' | 'price' | null
  const [editValue, setEditValue] = useState('');

  // Table Metadata (Customer, Pax, Waiter, Note, Token)
  const [customerName, setCustomerName] = useState(activeTable?.customerName || '');
  const [paxCount, setPaxCount] = useState(activeTable?.pax || '1');
  const [orderNote, setOrderNote] = useState('');
  const [waiterName, setWaiterName] = useState(activeTable?.waiter || 'Raju');
  const [tokenNo, setTokenNo] = useState(activeTable?.currentTokenNo || '');

  // Input editing toggles
  const [editingMeta, setEditingMeta] = useState(null); // 'customer' | 'pax' | 'note' | 'waiter' | null
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  const handleSaveOrderClick = () => {
    onSaveTableOrder();
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);
  };

  // Cancel Active Order Handler (No browser confirm popup!)
  const handleCancelOrderClick = () => {
    if (!activeTable) return;
    setShowCancelOrderModal(true);
  };

  // Table Bill Release Handler (Prints thermal bill & turns table status to RED 'bill_released')
  const handleReleaseTableBillClick = async () => {
    if (!activeTable || cartItems.length === 0) return;

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0);
    const total = subtotal;

    const billObj = {
      tokenNo: activeTable.currentTokenNo || (1000 + (parseInt(activeTable.id) || 1)).toString(),
      tableNo: activeTable.name || 'Takeaway',
      sectionName: activeSection?.name || 'Dine In Area',
      items: cartItems,
      subtotal,
      total,
      paymentDetails: { mode: 'UNPAID (Table Bill Released)' },
      createdAt: new Date().toISOString()
    };

    try {
      printThermalReceipt(billObj);
    } catch (e) {
      console.warn('Bill print error or skipped:', e);
    }

    await db.diningTables.update(activeTable.id, {
      status: 'bill_released',
      currentCart: cartItems,
      currentTokenNo: billObj.tokenNo,
      createdAt: activeTable.createdAt || new Date().toISOString()
    });

    if (typeof onSelectTable === 'function') {
      onSelectTable(null);
    }
  };

  // Ensure default main category matches table (lock to Sweets if sweet table)
  useEffect(() => {
    const isSweetTable = Boolean(activeTable?.isSweet || (activeTable?.name && String(activeTable.name).toUpperCase().startsWith('S')) || activeTable?.sectionId === 5);
    if (isSweetTable) {
      const sweetCat = sortedCategories.find((c) => c.id === 2 || c.name?.toLowerCase().includes('sweet'));
      setSelectedMainCatId(sweetCat ? sweetCat.id : 2);
      setSelectedSubCatId('all');
    } else if (sortedCategories && sortedCategories.length > 0) {
      setSelectedMainCatId(sortedCategories[0].id);
      setSelectedSubCatId('all');
    }
    setActiveFooterDish(null);
    setEditingCartItemId(null);
    setIsParcelMode(false);
  }, [activeTable?.id]);

  // Sync table metadata
  useEffect(() => {
    if (activeTable) {
      setCustomerName(activeTable.customerName || '');
      setPaxCount(activeTable.pax || '1');
      setWaiterName(activeTable.waiter || 'Raju');
      setTokenNo(activeTable.currentTokenNo || (1000 + (parseInt(activeTable.id) || 1)).toString());
    }
  }, [activeTable]);

  // KOT Print Handler
  const handlePrintKOT = async () => {
    if (cartItems.length === 0) return;

    const lastPrinted = activeTable?.lastPrintedCart || [];
    const newItemsToPrint = [];

    for (const item of cartItems) {
      const prev = lastPrinted.find(
        (p) => p.id === item.id && (p.unit || '') === (item.unit || '') && (p.customNote || '') === (item.customNote || '') && Boolean(p.isParcel) === Boolean(item.isParcel)
      );
      const prevQty = prev ? prev.qty : 0;
      const diffQty = item.qty - prevQty;

      if (diffQty > 0) {
        newItemsToPrint.push({
          ...item,
          qty: diffQty,
          qtyDisplay: item.unit || `${diffQty}`
        });
      }
    }

    const itemsToDispatch = newItemsToPrint.length > 0 ? newItemsToPrint : cartItems;
    const currentKotCount = (activeTable?.kotCount || 0) + (newItemsToPrint.length > 0 || !activeTable?.lastPrintedCart ? 1 : 0);

    printKOTReceipt({
      tableNo: activeTable ? activeTable.name : 'Takeaway',
      billNo: activeTable?.currentBillNo || activeTable?.currentTokenNo?.replace(/^#/, '') || (activeTable?.name ? String(activeTable.name).replace(/\D/g, '') : '') || '1',
      tokenNo: activeTable?.currentTokenNo ? String(activeTable.currentTokenNo).replace(/^#/, '') : (activeTable?.name ? String(activeTable.name).replace(/\D/g, '') : '1'),
      sectionName: activeSection?.name || 'FIRST FLOOR',
      kotRunNo: currentKotCount || 1,
      items: itemsToDispatch,
      orderNote,
      waiter: waiterName,
      language: printLanguage
    });

    if (activeTable) {
      await db.diningTables.update(activeTable.id, {
        lastPrintedCart: cartItems,
        kotCount: currentKotCount,
        status: 'occupied'
      });
      activeTable.lastPrintedCart = cartItems;
      activeTable.kotCount = currentKotCount;
    }

    if (typeof onSelectTable === 'function') {
      onSelectTable(null);
    }
  };

  // Keyboard shortcut listener ('K' to save, 'J' to print KOT, 'R' to release bill, 'L' to settle, 'F2' for shortcode)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      // 'J' to Save & Print KOT
      if ((e.key === 'j' || e.key === 'J') && cartItems.length > 0) {
        e.preventDefault();
        handlePrintKOT();
        return;
      }

      // 'K' to Save without KOT (Returns to table grid)
      if ((e.key === 'k' || e.key === 'K') && activeTable && cartItems.length > 0) {
        e.preventDefault();
        handleSaveOrderClick();
        return;
      }

      // 'R' to Release Table Bill
      if ((e.key === 'r' || e.key === 'R') && activeTable && cartItems.length > 0) {
        e.preventDefault();
        handleReleaseTableBillClick();
        return;
      }

      // 'L' to Settle Order
      if ((e.key === 'l' || e.key === 'L') && cartItems.length > 0) {
        e.preventDefault();
        if (typeof onOpenOrderPopupForTable === 'function') {
          onOpenOrderPopupForTable(activeTable);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTable, cartItems, onSaveTableOrder, handlePrintKOT, onOpenOrderPopupForTable]);

  // Helper: ONLY sweet items that are sold in Kg get the bottom portion bar
  const isSweetKgDish = (dish) => {
    if (!dish) return false;
    const isSweet = (
      dish.categoryId === 2 ||
      (dish.counter && dish.counter.toLowerCase().includes('sweet')) ||
      (dish.categoryName && dish.categoryName.toLowerCase().includes('sweet'))
    );
    if (!isSweet) return false;

    // Must be sold in Kg (per-Kg pricing, multiple portion variants, or Kg/g unit)
    return Boolean(
      dish.pricePerKg ||
      (dish.hasMultiplePrices && dish.variants && dish.variants.length > 0) ||
      (dish.unit && (dish.unit.toLowerCase().includes('kg') || dish.unit.toLowerCase().includes('g'))) ||
      (dish.name && (dish.name.toLowerCase().includes('(by kg)') || dish.name.toLowerCase().includes('/kg') || dish.name.toLowerCase().includes(' kg')))
    );
  };

  const isSweetTable = Boolean(
    activeTable?.isSweet ||
    (activeTable?.name && String(activeTable.name).toUpperCase().startsWith('S')) ||
    activeTable?.sectionId === 5
  );

  // Helper: check if current order is in parcel or sweet section (where Kg portion bar is permitted)
  const resolvedCounter = activeCounter || (typeof window !== 'undefined' ? (localStorage.getItem('karuna_active_counter') || '') : '');
  const isParcelOrSweetContext = Boolean(
    isParcelMode ||
    activeSection?.id === 4 ||
    activeSection?.id === 5 ||
    activeTable?.sectionId === 4 ||
    activeTable?.sectionId === 5 ||
    activeTable?.isParcel ||
    isSweetTable ||
    (activeTable?.name && String(activeTable.name).toUpperCase().startsWith('P')) ||
    (activeTable?.name && String(activeTable.name).toUpperCase().startsWith('S')) ||
    (resolvedCounter && resolvedCounter.toLowerCase().includes('sweet'))
  );

  // Directly select dish and add to cart with inline quantity prompt
  const handleSelectDish = (dish) => {
    if (!dish) return;
    setEditingCartItemIndex(null);

    // Commit any active inline edit first
    if (editingCartItemId && editingField === 'qty') {
      const curIdx = cartItems.findIndex((ci) => (ci.cartItemId || ci.id) === editingCartItemId);
      if (curIdx !== -1) {
        handleCommitInlineEdit(cartItems[curIdx], curIdx);
      }
    }

    // 1. Sweets in Parcel or Sweet Section: Show the Kg portion bar
    if (isSweetKgDish(dish) && isParcelOrSweetContext) {
      if (activeFooterDish?.id === dish.id) {
        setActiveFooterDish(null);
      } else {
        setActiveFooterDish(dish);
        setCustomKgInput('');
        setCustomPriceInput('');
      }
      return;
    }

    // 2. In dining table (or regular items): DO NOT show kg bar. Directly ask per plate quantity saved in area rate matrix!
    setActiveFooterDish(null);

    const currentSectionId = activeTable?.sectionId || activeSection?.id || 1;
    const activePrice = getDishPriceForSection(dish, currentSectionId);
    const unit = (isSweetKgDish(dish) || !dish.unit || dish.unit.toLowerCase().includes('kg')) ? 'Plate' : dish.unit;

    // Check if matching item is in cart
    const existingIndex = cartItems.findIndex((ci) => {
      const matchIdentity = ci.id === dish.id || (ci.name && dish.name && ci.name === dish.name);
      if (!matchIdentity) return false;
      const itemUnit = ci.unit || (ci.weightKg ? `${ci.weightKg} Kg` : null);
      if ((itemUnit || '') !== (unit || '')) return false;
      if (Boolean(ci.isParcel) !== Boolean(isParcelMode)) return false;
      return true;
    });

    const targetKey = existingIndex !== -1
      ? (cartItems[existingIndex].cartItemId || cartItems[existingIndex].id)
      : (dish.cartItemId || `${dish.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);

    const currentQty = existingIndex !== -1 ? (parseFloat(cartItems[existingIndex].qty) || 1) : 0;
    const nextQty = existingIndex !== -1 ? (currentQty + 1).toString() : '1';

    onAddToCart({
      ...dish,
      cartItemId: targetKey,
      price: activePrice,
      unit: unit,
      weightKg: null,
      qty: 1,
      isParcel: isParcelMode
    });

    // Directly ask quantity in adding item cart - auto-focused for instant typing and Enter key confirmation
    setEditingCartItemId(targetKey);
    setEditingField('qty');
    setEditValue(nextQty);

    setTimeout(() => {
      if (cartListRef.current) {
        cartListRef.current.scrollTop = cartListRef.current.scrollHeight;
      }
    }, 60);
  };

  // Handle Dish Card Click (from Menu Grid)
  const handleDishCardClick = (dish) => {
    handleSelectDish(dish);
  };

  // Handle Option Click from Footer Bar
  const handleSelectOptionFromFooter = (variant) => {
    if (!activeFooterDish) return;
    const weightKg = variant.weightKg || (variant.unit?.includes('250') ? 0.25 : variant.unit?.includes('500') ? 0.5 : (variant.unit?.includes('1') ? 1 : null));
    const ratePerKg = activeFooterDish.pricePerKg || activeFooterDish.price || (activeFooterDish.variants?.[0]?.price ? activeFooterDish.variants[0].price * 4 : 300);
    const price = variant.price !== undefined ? variant.price : (weightKg ? Math.round(weightKg * ratePerKg) : activeFooterDish.price);

    onAddToCart({
      ...activeFooterDish,
      price: price,
      unit: variant.unit,
      weightKg: weightKg,
      qty: 1,
      isParcel: isParcelMode
    });
  };

  // Handle Custom Kg entry from Footer Bar
  const handleAddCustomKg = (e) => {
    if (e) e.preventDefault();
    if (!activeFooterDish) return;
    const kg = parseFloat(customKgInput);
    if (!kg || isNaN(kg) || kg <= 0) return;

    const ratePerKg = activeFooterDish.pricePerKg || activeFooterDish.price || (activeFooterDish.variants?.[0]?.price ? activeFooterDish.variants[0].price * 4 : 300);
    const calculatedPrice = Math.round(kg * ratePerKg);

    onAddToCart({
      ...activeFooterDish,
      price: calculatedPrice,
      unit: `${kg} Kg`,
      weightKg: kg,
      qty: 1,
      isParcel: isParcelMode
    });
    setCustomKgInput('');
  };

  // Handle Reducing Custom Kg item from cart
  const handleReduceCustomKg = () => {
    if (!activeFooterDish || typeof onReduceFromCart !== 'function') return;
    const kg = parseFloat(customKgInput);
    if (kg && !isNaN(kg) && kg > 0) {
      onReduceFromCart({ ...activeFooterDish, unit: `${kg} Kg` });
    } else {
      const match = cartItems.slice().reverse().find((i) => (i.id === activeFooterDish.id || i.name === activeFooterDish.name) && i.weightKg);
      if (match) {
        onReduceFromCart({ ...activeFooterDish, unit: match.unit });
      } else {
        onReduceFromCart(activeFooterDish);
      }
    }
  };

  // Handle Custom Price (₹) entry from Footer Bar: Automatically calculates grams
  const handleAddCustomPrice = (e) => {
    if (e) e.preventDefault();
    if (!activeFooterDish) return;
    const priceNum = parseFloat(customPriceInput);
    if (!priceNum || isNaN(priceNum) || priceNum <= 0) return;

    const ratePerKg = activeFooterDish.pricePerKg || (activeFooterDish.variants?.find((v) => v.unit === '1 Kg' || v.unit === '1Kg')?.price) || activeFooterDish.sectionPrices?.[5] || (activeFooterDish.price ? activeFooterDish.price * 4 : 320);
    const calculatedGrams = Math.round((priceNum / ratePerKg) * 1000);
    const calculatedKg = parseFloat((calculatedGrams / 1000).toFixed(3));
    const unitLabel = calculatedGrams >= 1000 ? `${calculatedKg} Kg` : `${calculatedGrams}g`;

    onAddToCart({
      ...activeFooterDish,
      price: priceNum,
      unit: unitLabel,
      weightKg: calculatedKg,
      qty: 1,
      isParcel: isParcelMode
    });
    setCustomPriceInput('');
  };

  // Handle Reducing Custom Price item from cart
  const handleReduceCustomPrice = () => {
    if (!activeFooterDish || typeof onReduceFromCart !== 'function') return;
    const priceNum = parseFloat(customPriceInput);
    if (priceNum && !isNaN(priceNum) && priceNum > 0) {
      const ratePerKg = activeFooterDish.pricePerKg || (activeFooterDish.variants?.find((v) => v.unit === '1 Kg' || v.unit === '1Kg')?.price) || activeFooterDish.sectionPrices?.[5] || (activeFooterDish.price ? activeFooterDish.price * 4 : 320);
      const calculatedGrams = Math.round((priceNum / ratePerKg) * 1000);
      const calculatedKg = parseFloat((calculatedGrams / 1000).toFixed(3));
      const unitLabel = calculatedGrams >= 1000 ? `${calculatedKg} Kg` : `${calculatedGrams}g`;
      onReduceFromCart({ ...activeFooterDish, unit: unitLabel });
    } else {
      const match = cartItems.slice().reverse().find((i) => (i.id === activeFooterDish.id || i.name === activeFooterDish.name) && i.weightKg);
      if (match) {
        onReduceFromCart({ ...activeFooterDish, unit: match.unit });
      } else {
        onReduceFromCart(activeFooterDish);
      }
    }
  };

  // Handle Unified Search submit (Enter in Search box adds dish and directly asks quantity in cart)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const foundDish = dishes.find(
      (d) => d.srNo?.toString() === query || d.name.toLowerCase() === query.toLowerCase()
    );

    const targetDish = foundDish || (filteredDishes.length === 1 ? filteredDishes[0] : null);

    if (targetDish) {
      handleSelectDish(targetDish);
      setSearchQuery('');
    } else {
      setNoticeToast(`No dish found matching "${query}"`);
      setTimeout(() => setNoticeToast(null), 2500);
    }
  };

  // Handle clicking cart item (opens bottom bar with -,+ controls ONLY for sweet kg items in parcel/sweet section)
  const handleCartItemClick = (item, itemIdx) => {
    const originalDish = dishes.find((d) => d.id === item.id || d.name === item.name) || item;
    if (isSweetKgDish(originalDish) && isParcelOrSweetContext) {
      setActiveFooterDish(originalDish);
      setEditingCartItemIndex(itemIdx);
    } else {
      setActiveFooterDish(null);
      setEditingCartItemIndex(null);
    }
  };

  // Commit inline edit for Qty in Cart
  const handleCommitInlineEdit = (item, itemIdx) => {
    if (editingField === 'qty') {
      const val = parseFloat(editValue);
      if (!isNaN(val) && val > 0) {
        const isKgItem = Boolean(item.weightKg || (item.unit && (item.unit.includes('g') || item.unit.toLowerCase().includes('kg'))));
        const originalDish = dishes.find((d) => d.id === item.id || d.name === item.name);
        if (isKgItem && originalDish && originalDish.pricePerKg) {
          onUpdateCartItem(itemIdx, {
            qty: 1,
            price: Math.round(val * originalDish.pricePerKg),
            unit: `${val} Kg`,
            weightKg: val,
            qtyDisplay: `${val} Kg`
          });
        } else {
          onUpdateCartQty(item.cartItemId || item.id, val, item.unit);
        }
      }
    }
    setEditingCartItemId(null);
    setEditingField(null);
    setEditValue('');
  };

  // Filter Categories: If sweet table, only show sweets division
  const displayedCategories = isSweetTable
    ? sortedCategories.filter((c) => c.id === 2 || c.name?.toLowerCase().includes('sweet'))
    : sortedCategories;

  // Filter Sub Categories for selected Main Division
  const currentSubCats = subCategories.filter(
    (sc) => sc.parentCategoryId === selectedMainCatId
  );

  // Filter Dishes by Division, Sub-Category & Search Query (lock to Sweets if sweet table)
  const filteredDishes = dishes.filter((dish) => {
    if (isSweetTable && dish.categoryId !== 2 && !dish.counter?.toLowerCase().includes('sweet') && !dish.categoryName?.toLowerCase().includes('sweet')) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = dish.name.toLowerCase().includes(q);
      const matchMarathi = dish.marathiName?.toLowerCase().includes(q);
      const matchCode = dish.srNo?.toString().includes(q);
      return matchName || matchMarathi || matchCode;
    }
    if (dish.categoryId !== selectedMainCatId) return false;
    if (selectedSubCatId !== 'all' && dish.subCategoryId !== selectedSubCatId) return false;
    return true;
  });

  // Calculate Grand Total
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  // If no table is active, render TableGrid
  if (!activeTable) {
    return (
      <TableGrid
        currentZoom={currentZoom}
        tables={tables}
        sections={sections}
        settledBillsCount={settledBillsCount}
        settledBills={settledBills}
        allDishes={allDishes || dishes}
        billLogs={billLogs}
        onUpdateSettledBill={onUpdateSettledBill}
        initialAreaFilter={rememberedAreaFilter}
        onAreaFilterChange={setRememberedAreaFilter}
        onSelectTable={onSelectTable}
        onOpenAddTableModal={onOpenAddTableModal}
        onNavigateToSettled={onNavigateToSettled}
        onSplitTable={onSplitTable}
        onDeleteTable={onDeleteTable}
        printLanguage={printLanguage}
        isSettledBillEditEnabled={isSettledBillEditEnabled}
        preOrders={preOrders}
        onOpenOrderPopupForTable={(tbl) => {
          if (tbl) {
            onSelectTable(tbl);
          }
          if (typeof onOpenOrderPopupForTable === 'function') {
            onOpenOrderPopupForTable(tbl);
          }
        }}
      />
    );
  }

  const activeTheme = getSectionTheme(activeSection?.name);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100 select-none min-h-0">
      
      {/* COLUMN 1: LEFT DIVISIONS & SUB-CATEGORIES SIDEBAR */}
      <aside className="w-44 bg-white border-r border-stone-200 flex flex-col shrink-0">
        
        {/* Main Divisions (Breakfast & Sweets) */}
        <div className="p-2 border-b border-stone-200 space-y-1 bg-slate-50">
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-wider px-1 mb-0.5">
            Menu Divisions
          </div>
          {displayedCategories.map((cat, catIdx) => {
            const isSelected = selectedMainCatId === cat.id;
            return (
              <button
                key={`main-cat-${cat.id}-${catIdx}`}
                onClick={() => {
                  setSelectedMainCatId(cat.id);
                  setSelectedSubCatId('all');
                }}
                className={`w-full text-left py-2 px-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {cat.isFixed && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-slate-700 text-slate-200 shrink-0 ml-1">
                    Fixed
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-Categories for Active Main Category */}
        <div className="p-2 flex-1 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1 mb-0.5">
            Sub Categories
          </div>

          <button
            onClick={() => setSelectedSubCatId('all')}
            className={`w-full text-left py-2 px-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer leading-tight ${
              selectedSubCatId === 'all'
                ? 'bg-blue-50 text-blue-900 border border-blue-200 font-black shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <div className="flex flex-col">
              <span>All Items</span>
              <span className={`text-[11px] font-semibold mt-0.5 ${selectedSubCatId === 'all' ? 'text-blue-700' : 'text-slate-500'}`}>
                सर्व पदार्थ
              </span>
            </div>
          </button>

          {currentSubCats.map((sc, scIdx) => {
            const isSelected = selectedSubCatId === sc.id;
            return (
              <button
                key={`sub-cat-${sc.id}-${scIdx}`}
                onClick={() => setSelectedSubCatId(sc.id)}
                className={`w-full text-left py-2 px-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer leading-tight ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900 border border-blue-200 font-black shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex flex-col">
                  <span>{sc.name}</span>
                  {sc.marathiName && (
                    <span className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                      {sc.marathiName}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </aside>

      {/* COLUMN 2: CENTER DISHES GRID AREA & STICKY FOOTER OPTIONS BAR */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-100 relative overflow-hidden">
        
        {/* Top Header Controls Bar */}
        <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center gap-3 flex-1">
            {/* Colorful Bold Back Button */}
            <button
              onClick={() => onSelectTable(null)}
              className="bg-neutral-900 hover:bg-black text-white font-black text-sm px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5 stroke-[3]" />
              <span>Back</span>
            </button>

            {/* Single Unified Search Bar for Item Name or Code */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4.5 h-4.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search items by name or code (e.g. 101, Sheera) + Enter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-300 text-neutral-900 text-sm font-bold rounded-xl pl-10 pr-20 py-2.5 outline-none focus:ring-2 focus:ring-neutral-900 shadow-2xs placeholder:text-stone-400 placeholder:font-normal"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-stone-900 hover:bg-black text-white text-xs font-black px-3 rounded-lg cursor-pointer flex items-center space-x-1"
              >
                <span>↵ ENTER</span>
              </button>
            </form>

            {/* Parcel Mode Toggle Button on Right Side of Search Bar */}
            <button
              type="button"
              onClick={() => setIsParcelMode((prev) => !prev)}
              className={`px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center space-x-1.5 border shadow-2xs shrink-0 ${
                isParcelMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                  : 'bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 border-slate-300'
              }`}
              title={isParcelMode ? 'Parcel Mode ACTIVE: Next items added will be tagged as Parcel' : 'Click to turn ON Parcel Mode for adding items'}
            >
              <span className="text-sm">📦</span>
              <span>{isParcelMode ? 'Parcel Mode: ON' : '+ Add as Parcel'}</span>
            </button>
          </div>

        </div>



        {/* Dishes Grid (Larger Cards with Clear Images & Bold Text - Exactly 5 per row) */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 pb-4">
            {filteredDishes.map((dish, dishIdx) => {
              const dishActivePrice = getDishPriceForSection(dish, activeSection?.id);
              const matchingCartItems = cartItems.filter((ci) => ci.id === dish.id || ci.name === dish.name);
              const inCart = matchingCartItems.length > 0;
              let cartBadgeText = '';
              if (matchingCartItems.length === 1) {
                const item = matchingCartItems[0];
                if (item.unit) {
                  cartBadgeText = item.qty > 1 ? `${item.qty}x ${item.unit}` : item.unit;
                } else {
                  cartBadgeText = `${item.qty}`;
                }
              } else if (matchingCartItems.length > 1) {
                cartBadgeText = `${matchingCartItems.length} Items`;
              }

              const hasMulti = dish.hasMultiplePrices && dish.variants && dish.variants.length > 0;
              const isFooterActive = activeFooterDish?.id === dish.id;

              const cardMarathiName = (
                dish.marathiName ||
                allDishes?.find((d) => d.id === dish.id || (d.name && dish.name && d.name.toLowerCase() === dish.name.toLowerCase()))?.marathiName ||
                getPrintDishName(dish, 'mr') ||
                ''
              ).trim();
              const showCardMarathi = Boolean(cardMarathiName && cardMarathiName.toLowerCase() !== (dish.name || '').trim().toLowerCase());

              return (
                <button
                  type="button"
                  key={`dish-card-${dish.id}-${dishIdx}`}
                  onClick={() => handleDishCardClick(dish)}
                  className={`bg-white rounded-2xl p-3.5 text-left border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[200px] sm:min-h-[216px] relative hover:shadow-xl ${
                    isFooterActive && isParcelOrSweetContext
                      ? 'border-amber-600 ring-2 ring-amber-400 bg-amber-50/20'
                      : inCart
                      ? 'border-neutral-900 ring-2 ring-neutral-200 shadow-md'
                      : 'border-stone-300/90 hover:border-neutral-900'
                  }`}
                >
                  {/* Top Item Code Badge */}
                  <span className="absolute top-3 left-3 bg-stone-100/90 text-stone-800 border border-stone-300 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-2xs z-10">
                    #{dish.srNo || dish.id}
                  </span>

                  {/* Image Box */}
                  <div className="w-full h-20 sm:h-24 bg-[#F9F6F0] rounded-xl flex items-center justify-center border border-stone-200/80 mb-2 relative shrink-0">
                    <ImageIcon className="w-9 h-9 text-stone-400" />
                  </div>

                  <div className="flex-1 flex flex-col justify-start">
                    <div className="font-black text-sm sm:text-base text-neutral-900 line-clamp-1 leading-tight" title={dish.name}>
                      {dish.name}
                    </div>
                    {showCardMarathi && (
                      <div className="text-xs sm:text-sm font-bold text-amber-950 bg-amber-50/95 border border-amber-200/80 px-2 py-0.5 rounded-md truncate mt-1 shadow-2xs block text-left leading-snug">
                        {cardMarathiName}
                      </div>
                    )}
                  </div>

                  {/* Price Badge */}
                  <div className="flex items-center justify-between mt-auto pt-1 w-full">
                    {hasMulti && isParcelOrSweetContext ? (
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black px-2.5 py-1 rounded-lg truncate w-full text-center">
                        ₹{dish.pricePerKg ? `${dish.pricePerKg}/Kg` : `${dish.variants[0]?.price} (Opts)`}
                      </span>
                    ) : (
                      <span className="font-black text-base text-blue-600">
                        ₹{dishActivePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {inCart && (
                    <div className="absolute top-3 right-3 bg-neutral-900 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm z-10">
                      {cartBadgeText}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* DOCKED BOTTOM BAR FOR SWEET KG ITEMS (Only in Parcel or Sweet section) */}
        {activeFooterDish && isSweetKgDish(activeFooterDish) && isParcelOrSweetContext && (() => {
          const defaultRate = activeFooterDish.pricePerKg || (activeFooterDish.variants?.find((v) => v.unit === '1 Kg' || v.unit === '1Kg')?.price) || activeFooterDish.sectionPrices?.[5] || activeFooterDish.price || (activeFooterDish.variants?.[0]?.price ? activeFooterDish.variants[0].price * 4 : 320);
          const variants = (activeFooterDish.variants && activeFooterDish.variants.length > 0)
            ? activeFooterDish.variants
            : [
                { unit: '250g', weightKg: 0.25, price: Math.round(defaultRate * 0.25) },
                { unit: '500g', weightKg: 0.5, price: Math.round(defaultRate * 0.5) },
                { unit: '1 Kg', weightKg: 1, price: Math.round(defaultRate) }
              ];
          const rateDisplay = activeFooterDish.pricePerKg || (activeFooterDish.variants?.find((v) => v.unit === '1 Kg' || v.unit === '1Kg')?.price) || activeFooterDish.sectionPrices?.[5] || defaultRate;
          
          // Match cart items for this dish to determine if it has already been added
          const matchingCartItems = cartItems.filter(
            (ci) => ci.id === activeFooterDish.id || ci.name === activeFooterDish.name
          );
          const matchingCustomKgItem = matchingCartItems.find(
            (ci) => ci.weightKg && !['250g', '500g', '1Kg'].includes(ci.unit)
          );
          const canDecrementCustom = Boolean(matchingCustomKgItem && matchingCustomKgItem.qty > 0);

          return (
            <div className="shrink-0 px-3 pb-3 pt-0 bg-slate-100 z-30 animate-in slide-in-from-bottom-2 duration-150">
              <div className="bg-white border-2 border-blue-600 rounded-2xl shadow-xl p-3 sm:p-3.5 px-4 sm:px-5 space-y-2.5">
                {/* Top Row: Dish Name & Rate Badge + Custom Entry Mode Toggle (UP) + Close Button */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <h4 className="font-black text-base sm:text-lg text-slate-900 leading-tight flex items-center gap-2 truncate">
                      <span>{activeFooterDish.name}</span>
                      {activeFooterDish.marathiName && activeFooterDish.marathiName !== activeFooterDish.name && (
                        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                          ({activeFooterDish.marathiName})
                        </span>
                      )}
                    </h4>
                    <span className="text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
                      #{activeFooterDish.srNo || activeFooterDish.id} • Rate: ₹{rateDisplay} {activeFooterDish.pricePerKg ? `(₹${activeFooterDish.pricePerKg}/Kg)` : ''}
                    </span>
                  </div>

                  {/* Option Toggle moved UP into Top Row & Close Button */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-300 text-xs font-black select-none shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setSweetEntryMode('kg')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                          sweetEntryMode === 'kg'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-black'
                            : 'text-slate-600 hover:text-slate-900 font-bold'
                        }`}
                      >
                        <span>⚖️</span>
                        <span>By Kg</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSweetEntryMode('price')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                          sweetEntryMode === 'price'
                            ? 'bg-emerald-600 text-white shadow-sm font-black'
                            : 'text-slate-600 hover:text-slate-900 font-bold'
                        }`}
                      >
                        <span>💰</span>
                        <span>By Price (₹)</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveFooterDish(null)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Large Portion Buttons & Custom Kg/Price Entry - Perfectly Aligned */}
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
                  {/* Portion Variants (250g, 500g, 1Kg) */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-[340px]">
                    {variants.map((v, vIdx) => {
                      const matchingVariantItem = matchingCartItems.find((ci) => ci.unit === v.unit);
                      const variantQty = matchingVariantItem ? matchingVariantItem.qty : 0;
                      const canDecrement = variantQty > 0;

                      return (
                        <div
                          key={`opt-btn-${v.unit}-${vIdx}`}
                          className={`flex-1 rounded-2xl p-1.5 shadow-xs flex items-center justify-between transition-all min-w-[105px] h-14 border-2 ${
                            variantQty > 0
                              ? 'border-blue-600 bg-blue-50/30'
                              : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                          }`}
                        >
                          {/* (-) Minus Button on Left: Always rendered for symmetry and perfect alignment */}
                          <button
                            type="button"
                            disabled={!canDecrement}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canDecrement && typeof onReduceFromCart === 'function') {
                                onReduceFromCart({ ...activeFooterDish, unit: v.unit });
                              }
                            }}
                            className={`w-10 h-10 rounded-xl font-black flex items-center justify-center transition text-base shrink-0 ${
                              canDecrement
                                ? 'bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 shadow-xs cursor-pointer'
                                : 'opacity-20 cursor-not-allowed bg-slate-100 border border-slate-200 text-slate-400'
                            }`}
                            title={canDecrement ? 'Reduce from cart' : 'Not in cart'}
                          >
                            <Minus className="w-4 h-4 stroke-[3]" />
                          </button>

                          {/* Center Option Label: Perfectly centered */}
                          <button
                            type="button"
                            onClick={() => handleSelectOptionFromFooter(v)}
                            className="flex-1 px-1 py-0.5 cursor-pointer flex flex-col items-center justify-center text-slate-900 text-center leading-tight select-none"
                          >
                            <span className="font-black text-xs sm:text-sm">{v.unit}</span>
                            <span className="text-blue-600 font-black text-xs sm:text-sm">₹{v.price}</span>
                            <div className="h-3 flex items-center justify-center">
                              {variantQty > 0 ? (
                                <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 rounded-full leading-none">
                                  {variantQty} in cart
                                </span>
                              ) : null}
                            </div>
                          </button>

                          {/* (+) Plus Button on Right */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOptionFromFooter(v);
                            }}
                            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center cursor-pointer transition text-base shadow-xs shrink-0"
                            title="Add to cart"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subtle Vertical Divider */}
                  <div className="hidden lg:block h-10 w-px bg-slate-200 shrink-0 mx-0.5" />

                  {/* Custom Weight / Price Entry Form (Aligned at h-14 height) */}
                  <div className="shrink-0">
                    {sweetEntryMode === 'kg' ? (
                      <form
                        onSubmit={handleAddCustomKg}
                        className="flex items-center gap-2 bg-slate-50 border-2 border-slate-300 focus-within:border-blue-600 rounded-2xl p-1.5 shadow-xs shrink-0 h-14"
                      >
                        {/* (-) Minus button for custom kg only if already in cart */}
                        {canDecrementCustom && (
                          <button
                            type="button"
                            onClick={handleReduceCustomKg}
                            className="w-10 h-10 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 font-black flex items-center justify-center cursor-pointer transition text-base shrink-0 shadow-xs"
                            title="Reduce custom quantity"
                          >
                            <Minus className="w-4 h-4 stroke-[3]" />
                          </button>
                        )}

                        <div className="flex items-center px-1.5">
                          <input
                            type="number"
                            step="0.05"
                            min="0.05"
                            placeholder="0.75"
                            value={customKgInput}
                            onChange={(e) => setCustomKgInput(e.target.value)}
                            className="w-20 sm:w-24 text-center text-sm font-black text-neutral-900 outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal"
                          />
                          <span className="text-xs font-black text-stone-500 pr-1 select-none">Kg</span>
                        </div>

                        {(() => {
                          const kgNum = parseFloat(customKgInput);
                          const p = (!isNaN(kgNum) && kgNum > 0 && defaultRate > 0) ? Math.round(kgNum * defaultRate) : 0;
                          if (!p) return null;
                          return (
                            <span className="text-xs font-black text-blue-800 bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-200 select-none whitespace-nowrap animate-in fade-in">
                              = ₹{p}
                            </span>
                          );
                        })()}

                        <button
                          type="submit"
                          disabled={!customKgInput || parseFloat(customKgInput) <= 0}
                          className="h-10 bg-neutral-900 hover:bg-black text-white font-black text-xs px-4 rounded-xl cursor-pointer disabled:opacity-40 shadow-xs flex items-center space-x-1 shrink-0"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Add Kg</span>
                        </button>
                      </form>
                    ) : (
                      <form
                        onSubmit={handleAddCustomPrice}
                        className="flex items-center gap-2 bg-emerald-50/40 border-2 border-emerald-500 focus-within:border-emerald-600 rounded-2xl p-1.5 shadow-xs shrink-0 h-14"
                      >
                        {canDecrementCustom && (
                          <button
                            type="button"
                            onClick={handleReduceCustomPrice}
                            className="w-10 h-10 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-emerald-300 font-black flex items-center justify-center cursor-pointer transition text-base shrink-0 shadow-xs"
                            title="Reduce custom quantity"
                          >
                            <Minus className="w-4 h-4 stroke-[3]" />
                          </button>
                        )}

                        <div className="flex items-center px-1.5">
                          <span className="text-sm font-black text-emerald-700 select-none mr-1">₹</span>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            placeholder="Amount (e.g. 100)"
                            value={customPriceInput}
                            onChange={(e) => setCustomPriceInput(e.target.value)}
                            className="w-24 sm:w-32 text-center text-sm font-black text-neutral-900 outline-none bg-transparent placeholder:text-stone-400 placeholder:text-xs"
                          />
                        </div>

                        {/* Live Auto-calculated Grams Display Badge */}
                        {(() => {
                          const pNum = parseFloat(customPriceInput);
                          const g = (!isNaN(pNum) && pNum > 0 && defaultRate > 0) ? Math.round((pNum / defaultRate) * 1000) : 0;
                          if (!g) return null;
                          return (
                            <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300 animate-in fade-in select-none whitespace-nowrap">
                              ➔ {g >= 1000 ? `${(g / 1000).toFixed(2)} Kg` : `${g}g`}
                            </span>
                          );
                        })()}

                        <button
                          type="submit"
                          disabled={!customPriceInput || parseFloat(customPriceInput) <= 0}
                          className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 rounded-xl cursor-pointer disabled:opacity-40 shadow-xs flex items-center space-x-1 shrink-0"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Add Price</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </main>

      {/* COLUMN 3: RIGHT SIDE ITEMS CART (Enlarged Items & Controls) */}
      <aside className="w-full sm:w-[400px] md:w-[440px] lg:w-[480px] xl:w-[500px] bg-white border-l border-stone-200 flex flex-col shrink-0 shadow-lg select-none">
        
        {/* Top Dark Header Bar (TABLE, TOKEN, CUSTOMER) */}
        <div className="bg-[#111111] text-white p-3 flex items-center justify-between text-xs font-bold border-b border-stone-800">
          
          <div className="text-center">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">TABLE</span>
            <span className="text-amber-400 font-extrabold text-sm">{activeTable.name}</span>
          </div>

          <div className="text-center cursor-pointer" onClick={() => setEditingMeta(editingMeta === 'token' ? null : 'token')}>
            <span className="text-[10px] text-stone-400 block uppercase font-bold">TOKEN</span>
            <span className="text-emerald-400 font-extrabold text-sm bg-stone-900 px-2.5 py-0.5 rounded border border-stone-700 hover:border-emerald-500 transition-colors shadow-xs">
              {formatTokenNumber(tokenNo, activeTable)}
            </span>
          </div>

          <div className="text-center cursor-pointer" onClick={() => setEditingMeta(editingMeta === 'customer' ? null : 'customer')}>
            <span className="text-[10px] text-stone-400 block uppercase font-bold">CUSTOMER</span>
            <span className="text-white hover:underline truncate max-w-[150px] block">
              {customerName ? customerName : '+ Add'}
            </span>
          </div>

        </div>

        {/* Metadata Drawer */}
        {editingMeta && (
          <div className="bg-slate-50 p-3 border-b border-slate-300 flex items-center space-x-2 text-xs">
            {editingMeta === 'token' && (
              <input
                type="text"
                autoFocus
                placeholder="Token Number (e.g. 1000)"
                value={tokenNo}
                onChange={(e) => {
                  setTokenNo(e.target.value);
                  if (activeTable) {
                    activeTable.currentTokenNo = e.target.value;
                    db.diningTables.update(activeTable.id, { currentTokenNo: e.target.value });
                  }
                }}
                className="w-full bg-white border border-stone-300 rounded-lg p-1.5 font-bold text-neutral-900 outline-none"
              />
            )}
            {editingMeta === 'customer' && (
              <input
                type="text"
                autoFocus
                placeholder="Enter Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-1.5 font-bold text-neutral-900 outline-none"
              />
            )}
            {editingMeta === 'pax' && (
              <input
                type="number"
                autoFocus
                placeholder="Pax Count"
                value={paxCount}
                onChange={(e) => setPaxCount(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-1.5 font-bold text-neutral-900 outline-none"
              />
            )}
            {editingMeta === 'note' && (
              <input
                type="text"
                autoFocus
                placeholder="Order Note"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-1.5 font-bold text-neutral-900 outline-none"
              />
            )}
            <button
              onClick={() => setEditingMeta(null)}
              className="bg-neutral-900 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* Table Column Headers */}
        <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 grid grid-cols-[1fr_112px_100px] items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-wider">
          <div className="text-left pl-1">ITEMS</div>
          <div className="text-center">QTY / UNIT</div>
          <div className="text-right pr-1">AMOUNT</div>
        </div>

        {/* Cart Items List */}
        <div ref={cartListRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <Utensils className="w-12 h-12 text-stone-300 mb-3 stroke-[1.5]" />
              <p className="text-xs font-semibold max-w-[200px] leading-relaxed text-stone-500">
                Cart is empty. Click items or type short code + Enter.
              </p>
            </div>
          ) : (
            cartItems.map((item, itemIdx) => {
              const itemQty = parseFloat(item.qty) || 1;
              const isKgItem = Boolean(item.weightKg || (item.unit && (item.unit.includes('g') || item.unit.toLowerCase().includes('kg'))));
              const qtyDisplay = formatItemQtyDisplay(item);

              const lineAmount = (item.price || 0) * itemQty;
              const targetKey = item.cartItemId || item.id;
              const isEditingQty = editingCartItemId === targetKey && editingField === 'qty';

              return (
                <div
                  key={`side-cart-item-${item.cartItemId || item.id}-${item.unit || ''}-${itemIdx}`}
                  onClick={() => {
                    handleCartItemClick(item, itemIdx);
                    setEditingCartItemId(targetKey);
                    setEditingField('qty');
                    setEditValue(itemQty.toString());
                  }}
                  className={`grid grid-cols-[1fr_112px_100px] items-center gap-2 py-2.5 border-b border-stone-200 text-xs text-neutral-800 rounded-xl px-2.5 cursor-pointer transition-colors ${
                    isEditingQty
                      ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400 shadow-xs'
                      : editingCartItemIndex === itemIdx
                      ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400 shadow-xs'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  {/* Clean Item Name + Parcel Tag */}
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="font-black text-neutral-900 text-sm leading-tight">
                        {item.name}
                      </span>
                      {item.isParcel && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded shadow-2xs shrink-0">
                          📦 Parcel
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-semibold text-stone-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>Code: {item.srNo || item.id}</span>
                      {item.customNote && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded truncate max-w-[110px]">
                          {item.customNote}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* QTY / Unit Column (Direct Inline Quantity Input on Enter) */}
                  <div className="flex items-center justify-center w-full" onClick={(e) => e.stopPropagation()}>
                    {isEditingQty ? (
                      <div className="flex items-center justify-center space-x-1 animate-in zoom-in-95 duration-100">
                        <input
                          ref={(el) => {
                            if (el) {
                              el.focus();
                              el.select();
                            }
                          }}
                          type="number"
                          step={item.unit && item.unit.includes('Kg') ? '0.1' : '1'}
                          min="0.1"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCommitInlineEdit(item, itemIdx);
                            }
                            if (e.key === 'Escape') {
                              setEditingCartItemId(null);
                            }
                          }}
                          onBlur={() => {
                            handleCommitInlineEdit(item, itemIdx);
                          }}
                          className="w-16 bg-amber-50 border-2 border-amber-500 text-center text-sm font-black rounded-lg p-1 outline-none ring-2 ring-amber-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommitInlineEdit(item, itemIdx)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-1.5 py-1 rounded-md cursor-pointer shadow-xs"
                          title="Confirm quantity (Enter ↵)"
                        >
                          ↵
                        </button>
                      </div>
                    ) : isKgItem ? (
                      /* Kg Item: Clean prominent badge */
                      <span
                        onClick={() => handleCartItemClick(item, itemIdx)}
                        className="font-black text-xs px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-center whitespace-nowrap hover:bg-blue-100 cursor-pointer shadow-2xs max-w-[100px] truncate"
                        title="Click to change portion"
                      >
                        {qtyDisplay}
                      </span>
                    ) : (
                      /* Regular Item: Stepper buttons with clear spacing */
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onUpdateCartQty(targetKey, itemQty - 1, item.unit)}
                          className="w-7.5 h-7.5 rounded-lg bg-stone-100 hover:bg-stone-300 active:scale-95 text-stone-900 flex items-center justify-center font-black cursor-pointer text-sm shadow-2xs transition shrink-0"
                          title="Reduce quantity"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <span
                          onClick={() => {
                            setEditingCartItemId(targetKey);
                            setEditingField('qty');
                            setEditValue(itemQty.toString());
                          }}
                          className="font-black text-sm px-1 text-center min-w-[20px] whitespace-nowrap hover:bg-amber-100 hover:text-amber-900 rounded cursor-text"
                          title="Click to type quantity"
                        >
                          {qtyDisplay}
                        </span>
                        <button
                          onClick={() => onUpdateCartQty(targetKey, itemQty + 1, item.unit)}
                          className="w-7.5 h-7.5 rounded-lg bg-stone-900 hover:bg-black active:scale-95 text-white flex items-center justify-center font-black cursor-pointer text-sm shadow-2xs transition shrink-0"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Amount Column + Delete Button (Clean alignment, no overlap with QTY) */}
                  <div className="flex items-center justify-end space-x-1.5 font-black text-neutral-900 text-sm w-full" onClick={(e) => e.stopPropagation()}>
                    <span className="whitespace-nowrap font-black">₹{lineAmount.toFixed(2)}</span>
                    <button
                      onClick={() => onRemoveCartItem(targetKey, item.unit)}
                      className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition shadow-2xs shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Actions & Total */}
        <div className="p-3 border-t border-stone-200 bg-slate-50 space-y-2.5 pb-4">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white border border-stone-200 px-3 py-2 rounded-xl shadow-xs">
              <span className="text-xs font-black text-stone-500 uppercase tracking-wider">Total :</span>
              <span className="text-2xl font-black text-blue-600">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Action Buttons with Safe Spacing to Prevent Mistouch */}
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handlePrintKOT}
                  disabled={cartItems.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-2 rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
                  title="Save & Print KOT Ticket (Press J)"
                >
                  <Printer className="w-4 h-4" />
                  <span>KOT (J)</span>
                </button>

                <button
                  onClick={handleSaveOrderClick}
                  disabled={cartItems.length === 0}
                  className={`font-black text-xs py-3 px-2 rounded-xl cursor-pointer disabled:opacity-40 flex items-center justify-center space-x-1.5 transition-all border ${
                    isSavedFeedback
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-stone-100 border-stone-300 text-neutral-800'
                  }`}
                  title="Save Order without KOT (Press K)"
                >
                  <span>{isSavedFeedback ? '✓ Saved!' : 'NO KOT (K)'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleReleaseTableBillClick}
                  disabled={cartItems.length === 0}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs py-3 px-2 rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
                  title="Release/Print Table Bill (Turns table RED, Press R)"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Table Bill</span>
                </button>

                {/* RED Cancel Order Button */}
                <button
                  onClick={handleCancelOrderClick}
                  disabled={cartItems.length === 0}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 px-2 rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
                  title="Cancel Active Order"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Cancel Order</span>
                </button>
              </div>

              {/* Full Width Settle Button */}
              <button
                onClick={() => {
                  if (typeof onOpenOrderPopupForTable === 'function') {
                    onOpenOrderPopupForTable(activeTable);
                  }
                }}
                disabled={cartItems.length === 0}
                className="w-full bg-neutral-900 hover:bg-black text-white font-black text-sm py-3.5 px-2 rounded-xl shadow-md cursor-pointer disabled:opacity-40 flex items-center justify-center space-x-2"
                title="Settle Order & Bill (Press L)"
              >
                <span>Settle (L)</span>
              </button>
            </div>

          </div>

        </div>

      </aside>

      {/* Custom Cancel Order Confirmation Modal (No browser popups!) */}
      {showCancelOrderModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-lg text-neutral-900">Cancel Active Order?</h3>
                <p className="text-xs font-bold text-stone-500">
                  Table {activeTable?.name} - This will clear all items and reset table to empty.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelOrderModal(false)}
                className="py-3 bg-stone-100 hover:bg-stone-200 text-neutral-800 font-black rounded-xl text-xs transition cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!activeTable) return;
                  const isParcel = activeTable.isParcel || activeTable.sectionId === 4 || (activeTable.name && String(activeTable.name).toUpperCase().startsWith('P'));
                  if (isParcel) {
                    await db.diningTables.delete(activeTable.id);
                  } else {
                    await db.diningTables.update(activeTable.id, {
                      status: 'empty',
                      currentCart: [],
                      createdAt: null,
                      currentTokenNo: ''
                    });
                  }
                  if (typeof onClearCart === 'function') onClearCart();
                  if (typeof onSelectTable === 'function') onSelectTable(null);
                  setShowCancelOrderModal(false);
                }}
                className="py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}





      {/* Notice Toast Message */}
      {noticeToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-200 flex items-center space-x-2 border border-stone-700">
          <span>{noticeToast}</span>
        </div>
      )}

    </div>
  );
}
