import React, { useState, useEffect, useRef } from 'react';
import { 
  db, 
  ensureDatabaseDefaults, 
  cleanAndPruneSplitTables,
  cleanAndDeduplicateRecipes,
  subscribeToDatabase, 
  subscribeToConnectionStatus, 
  subscribeToOfflineQueue, 
  flushOfflineQueue, 
  refreshOfflineQueueCount,
  setTerminalIdentity,
  DEFAULT_INITIAL_DATA 
} from './db/db';
import Header from './components/Header';
import POSBilling from './components/POSBilling';
import OrderCartPopup from './components/OrderCartPopup';
import CreateNewTableModal from './components/CreateNewTableModal';
import SettledBills from './components/SettledBills';
import OwnerAdmin from './components/OwnerAdmin';
import StockManagement from './components/StockManagement';
import ServerMonitorPanel from './components/ServerMonitorPanel';
import PreOrderManagement from './components/PreOrderManagement';
import OtherRecords from './components/OtherRecords';
import { checkPreOrderAlert } from './db/db';
import { formatItemQtyDisplay, getPrintDishName } from './utils/receiptUtils';
import { ShieldCheck, Lock, X, Check, ChevronDown, ChevronUp, AlertTriangle, RotateCcw, Save } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'settle' | 'stock' | 'server' | 'admin'
  const [adminHasUnsavedMatrix, setAdminHasUnsavedMatrix] = useState(false);
  const matrixActionsRef = useRef(null);
  const [pendingTabNavigation, setPendingTabNavigation] = useState(null);
  const [showTabUnsavedModal, setShowTabUnsavedModal] = useState(false);

  // Tab navigation guard: prompts user to save or discard before switching main tabs if Matrix has unsaved rates
  const handleRequestTab = (targetTab) => {
    if (targetTab === activeTab) return;
    if (activeTab === 'admin' && adminHasUnsavedMatrix) {
      setPendingTabNavigation(targetTab);
      setShowTabUnsavedModal(true);
      return;
    }
    setActiveTab(targetTab);
  };
  const [isServerConnected, setIsServerConnected] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Owner PIN Modal Security
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [activeCounter, setActiveCounterState] = useState(() => {
    return localStorage.getItem('karuna_active_counter') || 'Counter 1 (Breakfast & Snacks)';
  });

  // Print Language State ('mr' | 'en') - Persisted to LocalStorage
  const [printLanguage, setPrintLanguage] = useState(() => {
    return localStorage.getItem('karuna_print_language') || 'mr';
  });

  const handleLanguageChange = (lang) => {
    setPrintLanguage(lang);
    localStorage.setItem('karuna_print_language', lang);
  };

  const handleSelectCounter = (counterName) => {
    setActiveCounterState(counterName);
    localStorage.setItem('karuna_active_counter', counterName);
    setTerminalIdentity(counterName);
  };

  // Real-Time Master Database State
  const [categories, setCategories] = useState(DEFAULT_INITIAL_DATA.categories);
  const [subCategories, setSubCategories] = useState(DEFAULT_INITIAL_DATA.subCategories);
  const [dishes, setDishes] = useState(DEFAULT_INITIAL_DATA.dishes);
  const [sections, setSections] = useState(DEFAULT_INITIAL_DATA.sections);
  const [tables, setTables] = useState(DEFAULT_INITIAL_DATA.diningTables);
  const [bills, setBills] = useState([]);
  const [billLogs, setBillLogs] = useState([]);
  const [preOrders, setPreOrders] = useState([]);
  const [dismissedUrgentAlert, setDismissedUrgentAlert] = useState(false);
  const [rawMaterials, setRawMaterials] = useState(DEFAULT_INITIAL_DATA.rawMaterials);
  const [recipes, setRecipes] = useState(DEFAULT_INITIAL_DATA.recipes);
  const [stockMode, setStockMode] = useState('raw_material_wise');
  // Settle Tab Edit Button Access Control (Persisted to localStorage & Dexie/Server db.systemSettings)
  const [isSettledBillEditEnabled, setIsSettledBillEditEnabled] = useState(() => {
    return localStorage.getItem('karuna_settled_bill_edit_enabled') !== 'false';
  });

  // Other Records Count for Header Badge
  const [otherRecordsCount, setOtherRecordsCount] = useState(() => {
    try {
      const saved = localStorage.getItem('karuna_other_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch (e) {}
    return 4;
  });

  // Cart State & Active Table State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTable, setActiveTable] = useState(null);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);

  // Helper to deduplicate array items by ID or Name & auto-collapse empty split tables (D9-B, etc.)
  const deduplicateById = (arr, isTableCollection = false, isSectionCollection = false) => {
    if (!Array.isArray(arr)) return [];
    const map = new Map();
    arr.forEach((item) => {
      if (!item) return;
      let key;
      if (isTableCollection && item.name) {
        key = `${item.sectionId || ''}_${String(item.name).toUpperCase().trim()}`;
      } else if (isSectionCollection && item.name) {
        let cleanName = String(item.name).trim();
        if (cleanName.toLowerCase().includes('parcel')) cleanName = 'Parcels';
        key = cleanName.toLowerCase();
      } else {
        key = item.id !== undefined ? String(item.id) : JSON.stringify(item);
      }

      const existing = map.get(key);
      if (!existing) {
        map.set(key, isSectionCollection && item.name && item.name.toLowerCase().includes('parcel') ? { ...item, name: 'Parcels' } : item);
      } else {
        if (isSectionCollection) {
          if (item.id < existing.id) {
            map.set(key, item.name && item.name.toLowerCase().includes('parcel') ? { ...item, name: 'Parcels' } : item);
          }
        } else if (isTableCollection) {
          const itemHasCart = item.status === 'occupied' || item.status === 'bill_released' || (item.currentCart && item.currentCart.length > 0);
          const existingHasCart = existing.status === 'occupied' || existing.status === 'bill_released' || (existing.currentCart && existing.currentCart.length > 0);

          if (itemHasCart && !existingHasCart) {
            map.set(key, item);
          } else if (itemHasCart && existingHasCart) {
            map.set(key, { ...existing, ...item, currentCart: item.currentCart?.length ? item.currentCart : existing.currentCart });
          } else {
            map.set(key, { ...existing, ...item });
          }
        } else {
          map.set(key, item);
        }
      }
    });

    let result = Array.from(map.values());

    if (isSectionCollection) {
      const hasParcels = result.some((s) => s.name && s.name.toLowerCase().includes('parcel'));
      if (!hasParcels) {
        result.push({ id: 4, name: 'Parcels', extraCharge: 0, color: 'amber' });
      }
      const hasSweets = result.some((s) => s.name && s.name.toLowerCase().includes('sweet'));
      if (!hasSweets) {
        result.push({ id: 5, name: 'Sweets', extraCharge: 0, color: 'rose' });
      }
      const regularSections = result.filter((s) => !s.name || (!s.name.toLowerCase().includes('parcel') && !s.name.toLowerCase().includes('sweet')));
      const parcelSections = result.filter((s) => s.name && s.name.toLowerCase().includes('parcel'));
      const sweetSections = result.filter((s) => s.name && s.name.toLowerCase().includes('sweet'));
      result = [...regularSections, ...parcelSections, ...sweetSections];
    }

    if (isTableCollection) {
      // Clean and collapse empty/settled split tables back into base table
      result = cleanAndPruneSplitTables(result);
      // Ensure settled/empty parcel and sweet carts disappear from the grid
      result = result.filter((t) => {
        const isP = t.sectionId === 4 || (t.name && String(t.name).toUpperCase().startsWith('P')) || t.isParcel;
        const isS = t.sectionId === 5 || (t.name && String(t.name).toUpperCase().startsWith('S')) || t.isSweet;
        if ((isP || isS) && (t.status === 'empty' || !t.currentCart || t.currentCart.length === 0) && t.status !== 'bill_released') {
          return false;
        }
        return true;
      });
    }

    return result;
  };

  // Helper to sync all React state from database cache
  const syncStateFromCache = (cache) => {
    const target = cache || (db.getCacheSnapshot ? db.getCacheSnapshot() : null) || {};
    if (target.categories) setCategories(deduplicateById(target.categories));
    if (target.subCategories) setSubCategories(deduplicateById(target.subCategories));
    if (target.dishes) setDishes(deduplicateById(target.dishes));
    if (target.sections) setSections(deduplicateById(target.sections, false, true));
    if (target.diningTables) setTables(deduplicateById(target.diningTables, true));
    if (target.bills) setBills(deduplicateById(target.bills));
    if (target.billLogs) setBillLogs(deduplicateById(target.billLogs));
    if (target.preOrders) setPreOrders(deduplicateById(target.preOrders));
    if (target.rawMaterials) setRawMaterials(deduplicateById(target.rawMaterials));
    if (target.recipes) setRecipes(cleanAndDeduplicateRecipes(target.recipes));
    if (target.systemSettings?.stockMode) {
      setStockMode(target.systemSettings.stockMode);
      localStorage.setItem('karuna_stock_mode', target.systemSettings.stockMode);
    }
    if (target.systemSettings?.settledBillEditEnabled !== undefined) {
      const isEnabled = Boolean(target.systemSettings.settledBillEditEnabled);
      setIsSettledBillEditEnabled(isEnabled);
      localStorage.setItem('karuna_settled_bill_edit_enabled', String(isEnabled));
    }
  };

  const activeTableRef = useRef(activeTable);
  activeTableRef.current = activeTable;

  // Initialize DB & WebSocket connection
  useEffect(() => {
    // 1. Connection status listener
    const unsubscribeConn = subscribeToConnectionStatus((status) => {
      setIsServerConnected(status);
    });

    // 2. Offline Queue listener
    const unsubscribeQueue = subscribeToOfflineQueue((count) => {
      setOfflineQueueCount(count);
    });

    // 3. Database changes listener
    const unsubscribeDb = subscribeToDatabase((eventType, payload, fullCache) => {
      syncStateFromCache(fullCache);

      const curTable = activeTableRef.current;
      if (curTable && fullCache?.diningTables) {
        if (eventType === 'BILL_SETTLED' && payload?.deletedTableId === curTable.id) {
          setActiveTable(null);
          setCartItems([]);
          setIsCartOpen(false);
        } else if (payload?.collection === 'diningTables' && String(payload?.id) === String(curTable.id)) {
          if (eventType === 'DELETE') {
            setActiveTable(null);
            setCartItems([]);
            setIsCartOpen(false);
          }
        } else {
          const matched = fullCache.diningTables.find((t) => String(t.id) === String(curTable.id));
          if (matched && matched.status === 'occupied' && matched.currentCart) {
            setCartItems([...matched.currentCart]);
          }
        }
      }
    });

    // 4. Load defaults and bootstrap
    ensureDatabaseDefaults().then((cache) => {
      if (cache) {
        syncStateFromCache(cache);
        try {
          const savedTableId = sessionStorage.getItem('karuna_active_table_id');
          if (savedTableId && cache.diningTables) {
            const matchedTable = cache.diningTables.find((t) => String(t.id) === String(savedTableId));
            if (matchedTable) {
              setActiveTable(matchedTable);
              setCartItems(matchedTable.currentCart || []);
              if (matchedTable.sectionId && cache.sections) {
                const matchSec = cache.sections.find((s) => s.id === matchedTable.sectionId);
                if (matchSec) setActiveSectionState(matchSec);
              }
            }
          }
        } catch (e) {}
      }
    });

    return () => {
      unsubscribeConn();
      unsubscribeQueue();
      unsubscribeDb();
    };
  }, []);

  // Force Sync Action
  const handleForceSync = async () => {
    await flushOfflineQueue();
    await refreshOfflineQueueCount();
  };

  // Owner PIN Protection
  const handleRequestAdminTab = () => {
    if (activeCounter.toLowerCase().includes('owner') || activeCounter.toLowerCase().includes('master')) {
      setActiveTab('admin');
    } else {
      setPinInput('');
      setPinError('');
      setIsPinModalOpen(true);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '8446' || pinInput === '9999') {
      setIsPinModalOpen(false);
      setActiveTab('admin');
    } else {
      setPinError('Invalid Owner PIN! Default is 1234');
    }
  };

  // Active Dining Section State
  const [activeSectionState, setActiveSectionState] = useState(null);
  const activeSection = activeSectionState || sections[0] || { id: 1, name: 'Dine In Area', extraCharge: 0 };

  // Select Table Handling
  const handleSelectTable = (tableObj) => {
    if (!tableObj || tableObj.nativeEvent || tableObj.id === undefined) {
      if (!tableObj) {
        try {
          sessionStorage.removeItem('karuna_active_table_id');
        } catch (e) {}
        setActiveTable(null);
        setCartItems([]);
        setIsCartOpen(false);
      }
      return;
    }

    try {
      sessionStorage.setItem('karuna_active_table_id', String(tableObj.id));
    } catch (e) {}
    
    const latestTable = tables.find((t) => String(t.id) === String(tableObj.id)) || tableObj;
    setActiveTable(latestTable);
    
    if (latestTable.sectionId) {
      const matchSec = sections.find((s) => s.id === latestTable.sectionId);
      if (matchSec) setActiveSectionState(matchSec);
    }

    // Preserve existing cartItems if selecting the same active table and cart is not empty
    if (activeTableRef.current && String(activeTableRef.current.id) === String(latestTable.id) && cartItems.length > 0) {
      // Keep current cart items intact
    } else {
      setCartItems(latestTable.currentCart || []);
    }
  };

  // Split Table Action
  const handleSplitTable = async (parentTable) => {
    if (!parentTable) return;

    const rawName = String(parentTable.name || '').trim();
    const rootName = (parentTable.baseName || parentTable.parentTable || rawName.replace(/-[A-Z]$/i, '')).trim();
    const baseTableId = parentTable.baseTableId || parentTable.id;
    const baseSectionId = parentTable.sectionId;

    const existingSplits = tables.filter(
      (t) => t.parentTable === rootName || t.baseName === rootName || t.name.startsWith(`${rootName}-`) || t.name === rootName
    );

    let targetSplitTable = null;

    if (!parentTable.isSplit && !parentTable.name.includes('-')) {
      await db.diningTables.update(parentTable.id, {
        name: `${rootName}-A`,
        isSplit: true,
        parentTable: rootName,
        baseName: rootName,
        baseTableId: baseTableId,
        sectionId: baseSectionId,
        customerName: parentTable.customerName || 'Customer 1'
      });

      const splitBData = {
        name: `${rootName}-B`,
        sectionId: baseSectionId,
        status: 'empty',
        currentCart: [],
        currentTokenNo: Math.floor(1000 + Math.random() * 9000).toString(),
        isSplit: true,
        parentTable: rootName,
        baseName: rootName,
        baseTableId: baseTableId,
        customerName: 'Customer 2',
        createdAt: null
      };
      const newId = await db.diningTables.add(splitBData);
      targetSplitTable = { ...splitBData, id: newId };
    } else {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      let nextLetter = 'C';
      for (const l of letters) {
        if (!existingSplits.some((t) => t.name === `${rootName}-${l}`)) {
          nextLetter = l;
          break;
        }
      }

      const nextCustomerNum = existingSplits.length + 1;
      const newSplitData = {
        name: `${rootName}-${nextLetter}`,
        sectionId: baseSectionId,
        status: 'empty',
        currentCart: [],
        currentTokenNo: Math.floor(1000 + Math.random() * 9000).toString(),
        isSplit: true,
        parentTable: rootName,
        baseName: rootName,
        baseTableId: baseTableId,
        customerName: `Customer ${nextCustomerNum}`,
        createdAt: null
      };
      const newId = await db.diningTables.add(newSplitData);
      targetSplitTable = { ...newSplitData, id: newId };
    }

    if (targetSplitTable) {
      handleSelectTable(targetSplitTable);
    }
  };

  // Add Table / Card from Admin
  const handleAddTable = async (tableData) => {
    const trimmedName = (tableData.name || '').trim();
    const targetSectionId = tableData.sectionId;
    const isParcel = Boolean(tableData.isParcel);

    // 1. Check if table with this name already exists in target section
    const existingInSec = tables.find(
      (t) => t && String(t.sectionId) === String(targetSectionId) && String(t.name).toUpperCase().trim() === trimmedName.toUpperCase()
    );
    if (existingInSec) {
      await db.diningTables.update(existingInSec.id, {
        isParcel,
        status: existingInSec.status || 'empty'
      });
      syncStateFromCache();
      return existingInSec.id;
    }

    // 2. Check if table with this name exists in an orphaned/unknown section, re-assign it to target section!
    const existingElsewhere = tables.find(
      (t) => t && String(t.name).toUpperCase().trim() === trimmedName.toUpperCase() &&
      (!sections.some((s) => String(s.id) === String(t.sectionId)))
    );
    if (existingElsewhere) {
      await db.diningTables.update(existingElsewhere.id, {
        sectionId: targetSectionId,
        isParcel
      });
      syncStateFromCache();
      return existingElsewhere.id;
    }

    // 3. Otherwise insert fresh new table
    const newTable = {
      name: trimmedName,
      sectionId: targetSectionId,
      status: 'empty',
      currentCart: [],
      currentTokenNo: Math.floor(1000 + Math.random() * 9000).toString(),
      isSplit: false,
      isParcel,
      createdAt: null
    };
    const newId = await db.diningTables.add(newTable);
    syncStateFromCache();
    return newId;
  };

  // Delete / Remove Table
  const handleDeleteTable = async (tableId) => {
    if (activeTable && (activeTable.id === tableId || activeTable.name === tableId)) {
      setActiveTable(null);
      setCartItems([]);
      setIsCartOpen(false);
    }
    await db.diningTables.delete(tableId);
    syncStateFromCache();
  };

  // Create Table in Modal
  const handleCreateTableAndOpenMenu = async (tableData) => {
    const newId = await db.diningTables.add(tableData);
    const createdTable = { ...tableData, id: newId };
    syncStateFromCache();
    
    if (tableData.sectionId) {
      const matchSec = sections.find((s) => String(s.id) === String(tableData.sectionId));
      if (matchSec) setActiveSectionState(matchSec);
    }

    setActiveTable(createdTable);
    setCartItems([]);
    setIsCartOpen(false);
  };

  // Save Order by Pressing 'K' Key
  const handleSaveTableOrder = async () => {
    if (!activeTable || cartItems.length === 0) return;

    const assignedToken = (activeTable.currentTokenNo && parseInt(activeTable.currentTokenNo) >= 100)
      ? activeTable.currentTokenNo
      : String(1000 + (parseInt(activeTable.id) || 1));
    const orderStartTime = (activeTable.status === 'occupied' && activeTable.createdAt)
      ? activeTable.createdAt
      : new Date().toISOString();

    await db.diningTables.update(activeTable.id, {
      status: 'occupied',
      currentCart: cartItems,
      currentTokenNo: assignedToken,
      createdAt: orderStartTime
    });

    try {
      sessionStorage.removeItem('karuna_active_table_id');
    } catch (e) {}
    setActiveTable(null);
    setCartItems([]);
    setIsCartOpen(false);
  };

  // Cart Management - Single Line Item Per Dish (Increases quantity instead of duplicating rows)
  const handleAddToCart = async (dishItem) => {
    const noteKey = dishItem.customNote || '';
    const initialQty = dishItem.qty !== undefined ? dishItem.qty : 1;
    const unitKey = dishItem.unit || (dishItem.weightKg ? `${dishItem.weightKg} Kg` : null);
    const isParcel = Boolean(dishItem.isParcel);

    // Match existing cart item by Dish ID or Name AND matching variant unit, parcel status, and note
    const existingIndex = cartItems.findIndex((item) => {
      const matchIdentity = item.id === dishItem.id || (item.name && dishItem.name && item.name === dishItem.name);
      if (!matchIdentity) return false;
      const itemUnit = item.unit || (item.weightKg ? `${item.weightKg} Kg` : null);
      if ((itemUnit || '') !== (unitKey || '')) return false;
      if (Boolean(item.isParcel) !== isParcel) return false;
      if (noteKey !== (item.customNote || '')) return false;
      return true;
    });

    let updated;
    const resolvedMarathi = (
      dishItem.marathiName ||
      dishes?.find((d) => d.id === dishItem.id || (d.name && dishItem.name && d.name.toLowerCase() === dishItem.name.toLowerCase()))?.marathiName ||
      getPrintDishName(dishItem, 'mr') ||
      ''
    ).trim();

    if (existingIndex !== -1) {
      updated = [...cartItems];
      const existing = updated[existingIndex];
      const newQty = (parseFloat(existing.qty) || 1) + initialQty;
      
      const rawUnit = unitKey || existing.unit;
      const cleanUnit = rawUnit ? rawUnit.replace(/^\d+\s*[xX×]\s*/, '').trim() : null;
      const newPrice = dishItem.price !== undefined ? dishItem.price : existing.price;
      const newWeight = dishItem.weightKg !== undefined ? dishItem.weightKg : existing.weightKg;

      const updatedItem = {
        ...existing,
        qty: newQty,
        unit: cleanUnit,
        price: newPrice,
        weightKg: newWeight,
        marathiName: resolvedMarathi || existing.marathiName || ''
      };
      updatedItem.qtyDisplay = formatItemQtyDisplay(updatedItem);
      updated[existingIndex] = updatedItem;
    } else {
      const rawUnit = unitKey;
      const cleanUnit = rawUnit ? rawUnit.replace(/^\d+\s*[xX×]\s*/, '').trim() : null;
      const cartItemId = dishItem.cartItemId || `${dishItem.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      
      const newItem = {
        ...dishItem,
        marathiName: resolvedMarathi,
        cartItemId,
        qty: initialQty,
        unit: cleanUnit,
        isParcel
      };
      newItem.qtyDisplay = formatItemQtyDisplay(newItem);
      updated = [...cartItems, newItem];
    }

    setCartItems(updated);

    if (activeTable) {
      const orderStartTime = (activeTable.status === 'occupied' && activeTable.createdAt)
        ? activeTable.createdAt
        : new Date().toISOString();

      setActiveTable((prev) => prev ? { ...prev, currentCart: updated, status: 'occupied', createdAt: orderStartTime } : prev);

      await db.diningTables.update(activeTable.id, {
        currentCart: updated,
        status: 'occupied',
        createdAt: orderStartTime
      });
    }
  };

  const handleReduceFromCart = async (dishItem) => {
    if (!dishItem) return;
    const targetUnit = dishItem.unit || (dishItem.weightKg ? `${dishItem.weightKg} Kg` : null);
    const existingIndex = cartItems.findIndex((item) => {
      const matchIdentity = item.id === dishItem.id || (item.name && dishItem.name && item.name === dishItem.name);
      if (!matchIdentity) return false;
      if (targetUnit && item.unit && item.unit !== targetUnit) return false;
      if (dishItem.isParcel !== undefined && Boolean(item.isParcel) !== Boolean(dishItem.isParcel)) return false;
      return true;
    });
    if (existingIndex === -1) return;

    const existing = cartItems[existingIndex];
    const curQty = parseFloat(existing.qty) || 1;

    let updated;
    if (curQty > 1) {
      updated = [...cartItems];
      const newQty = curQty - 1;
      const updatedItem = {
        ...existing,
        qty: newQty
      };
      updatedItem.qtyDisplay = formatItemQtyDisplay(updatedItem);
      updated[existingIndex] = updatedItem;
    } else {
      updated = cartItems.filter((_, idx) => idx !== existingIndex);
    }

    setCartItems(updated);

    if (activeTable) {
      setActiveTable((prev) => prev ? { ...prev, currentCart: updated, status: updated.length > 0 ? 'occupied' : 'empty' } : prev);
      await db.diningTables.update(activeTable.id, {
        currentCart: updated,
        status: updated.length > 0 ? 'occupied' : 'empty'
      });
    }
  };

  const handleUpdateCartItem = async (index, updatedFields) => {
    if (index < 0 || index >= cartItems.length) return;
    const updated = [...cartItems];
    updated[index] = { ...updated[index], ...updatedFields };
    setCartItems(updated);
    if (activeTable) {
      setActiveTable((prev) => prev ? { ...prev, currentCart: updated } : prev);
      await db.diningTables.update(activeTable.id, { currentCart: updated });
    }
  };

  const handleUpdateCartQty = async (targetKey, newQty, unit) => {
    let updated;
    if (newQty <= 0) {
      updated = cartItems.filter((i) => (i.cartItemId ? i.cartItemId !== targetKey : (i.id !== targetKey || (unit && i.unit !== unit))));
    } else {
      updated = cartItems.map((i) => {
        const matches = i.cartItemId ? i.cartItemId === targetKey : (i.id === targetKey && (!unit || i.unit === unit));
        if (matches) {
          const updatedItem = { ...i, qty: newQty };
          updatedItem.qtyDisplay = formatItemQtyDisplay(updatedItem);
          return updatedItem;
        }
        return i;
      });
    }
    setCartItems(updated);

    if (activeTable) {
      setActiveTable((prev) => prev ? { ...prev, currentCart: updated, status: updated.length > 0 ? 'occupied' : 'empty' } : prev);
      await db.diningTables.update(activeTable.id, {
        currentCart: updated,
        status: updated.length > 0 ? 'occupied' : 'empty'
      });
    }
  };

  const handleRemoveCartItem = async (targetKey, unit) => {
    const updated = cartItems.filter((i) => (i.cartItemId ? i.cartItemId !== targetKey : (i.id !== targetKey || (unit && i.unit !== unit))));
    setCartItems(updated);

    if (activeTable) {
      setActiveTable((prev) => prev ? { ...prev, currentCart: updated, status: updated.length > 0 ? 'occupied' : 'empty' } : prev);
      await db.diningTables.update(activeTable.id, {
        currentCart: updated,
        status: updated.length > 0 ? 'occupied' : 'empty'
      });
    }
  };

  // Settle Bill Action
  const handleSettleBill = async (billData) => {
    const tableId = billData.tableId || activeTable?.id;
    const targetTable = tables.find((t) => String(t.id) === String(tableId)) || activeTable;

    const billTotal = billData.total !== undefined ? billData.total : (billData.finalTotal || 0);
    const payload = {
      ...billData,
      tableId: tableId || null,
      tokenNo: billData.tokenNo || targetTable?.currentTokenNo || (1000 + (parseInt(tableId) || 1)).toString(),
      tableNo: billData.tableNo || (targetTable ? targetTable.name : 'Takeaway'),
      items: billData.items || cartItems,
      subtotal: billData.subtotal !== undefined ? billData.subtotal : billTotal,
      discount: billData.discount || 0,
      discountAmount: billData.discountAmount || billData.discount || 0,
      discountType: billData.discountType || '₹',
      discountValue: billData.discountValue || 0,
      deliveryCharge: parseFloat(billData.deliveryCharge) || 0,
      containerCharge: parseFloat(billData.containerCharge) || 0,
      waiterTip: parseFloat(billData.waiterTip) || 0,
      serviceCharge: parseFloat(billData.serviceCharge) || 0,
      serviceChargeType: billData.serviceChargeType || '₹',
      serviceChargeValue: billData.serviceChargeValue || 0,
      sectionName: billData.sectionName || activeSection?.name || 'Dine In Area',
      sectionExtraCharge: 0,
      total: billTotal,
      finalTotal: billTotal,
      grandTotal: billTotal,
      paymentMode: billData.paymentMode || billData.paymentDetails?.mode || 'Cash',
      counter: activeCounter,
      paymentDetails: billData.paymentDetails || { mode: billData.paymentMode || 'Cash', cash: billTotal, online: 0, card: 0 },
      status: 'settled',
      createdAt: billData.createdAt || new Date().toISOString()
    };

    const result = await db.settleBill(payload);

    if (targetTable) {
      const isParcel = targetTable.sectionId === 4 || (targetTable.name && String(targetTable.name).toUpperCase().startsWith('P')) || targetTable.isParcel;
      const isSweet = targetTable.sectionId === 5 || (targetTable.name && String(targetTable.name).toUpperCase().startsWith('S')) || targetTable.isSweet;
      if (isParcel || isSweet) {
        try {
          await db.diningTables.delete(targetTable.id);
        } catch (e) {}
      }
    }

    try {
      sessionStorage.removeItem('karuna_active_table_id');
    } catch (e) {}
    setActiveTable(null);
    setCartItems([]);
    setIsCartOpen(false);
    setActiveTab('pos');
    return result;
  };

  // Update Settled Bill
  const handleUpdateSettledBill = async (updatedBill, changeDescription) => {
    if (!isSettledBillEditEnabled) {
      console.warn('Bill update blocked: settled bill editing is disabled by owner in UPI Settings.');
      return;
    }
    const finalAmount = updatedBill.finalTotal !== undefined ? updatedBill.finalTotal : (updatedBill.total || 0);
    const pMode = updatedBill.paymentMode || updatedBill.paymentDetails?.mode || 'Cash';
    await db.bills.update(updatedBill.id, {
      items: updatedBill.items,
      subtotal: updatedBill.subtotal !== undefined ? updatedBill.subtotal : finalAmount,
      discount: updatedBill.discount || 0,
      discountAmount: updatedBill.discountAmount || updatedBill.discount || 0,
      discountType: updatedBill.discountType || '₹',
      discountValue: updatedBill.discountValue || 0,
      deliveryCharge: parseFloat(updatedBill.deliveryCharge) || 0,
      containerCharge: parseFloat(updatedBill.containerCharge) || 0,
      waiterTip: parseFloat(updatedBill.waiterTip) || 0,
      serviceCharge: parseFloat(updatedBill.serviceCharge) || 0,
      serviceChargeType: updatedBill.serviceChargeType || '₹',
      serviceChargeValue: updatedBill.serviceChargeValue || 0,
      total: updatedBill.total !== undefined ? updatedBill.total : finalAmount,
      finalTotal: finalAmount,
      grandTotal: finalAmount,
      paymentMode: pMode,
      isResettled: true,
      resettledAt: updatedBill.resettledAt || new Date().toISOString()
    });

    await db.billLogs.add({
      billId: updatedBill.id,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' }),
      changeDescription
    });
  };

  // Toggle Settle Tab Edit Permission from Owner Admin (UPI Tab)
  const handleToggleSettledBillEdit = async (enabled) => {
    setIsSettledBillEditEnabled(enabled);
    localStorage.setItem('karuna_settled_bill_edit_enabled', String(enabled));
    try {
      await db.systemSettings.put({
        id: 1,
        settledBillEditEnabled: enabled,
        lastSyncTime: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving settledBillEditEnabled setting:', err);
    }
  };

  // Owner Admin Handlers
  const handleAddDish = async (dishData) => {
    await db.dishes.add(dishData);
  };

  const handleUpdateDish = async (idOrDish, optionalDishData) => {
    if (typeof idOrDish === 'object' && idOrDish !== null) {
      await db.dishes.put(idOrDish);
    } else if (idOrDish !== undefined && idOrDish !== null && optionalDishData) {
      const existing = await db.dishes.get(idOrDish);
      if (existing) {
        await db.dishes.put({ ...existing, ...optionalDishData, id: idOrDish });
      } else {
        await db.dishes.put({ ...optionalDishData, id: idOrDish });
      }
    }
  };

  const handleDeleteDish = async (id) => {
    await db.dishes.delete(id);
  };

  const handleAddSubCategory = async (subCatData) => {
    await db.subCategories.add(subCatData);
  };

  const handleDeleteSubCategory = async (id) => {
    await db.subCategories.delete(id);
  };

  const handleUpdateSection = async (id, updatedFields) => {
    await db.sections.update(id, updatedFields);
  };

  const handleAddSection = async (sectionData) => {
    await db.sections.add(sectionData);
  };

  const handleDeleteSection = async (id) => {
    await db.sections.delete(id);
    const orphanedTables = tables.filter((t) => t && t.sectionId === id);
    for (const t of orphanedTables) {
      await db.diningTables.delete(t.id);
    }
  };

  const handleBulkUpdatePrices = async (importedItems) => {
    await db.bulkUpdatePrices(importedItems);
  };

  // Stock Management Handlers
  const handleAddRawMaterial = async (rmData) => {
    const id = await db.rawMaterials.add(rmData);
    syncStateFromCache();
    return id;
  };

  const handleUpdateRawMaterial = async (idOrData, updatedFields) => {
    if (typeof idOrData === 'object' && idOrData !== null) {
      await db.rawMaterials.put(idOrData);
    } else if (updatedFields) {
      await db.rawMaterials.update(idOrData, updatedFields);
    }
    syncStateFromCache();
  };

  const handleDeleteRawMaterial = async (id) => {
    await db.rawMaterials.delete(id);
    syncStateFromCache();
  };

  const handleSaveRecipeMapping = async (recipeData) => {
    if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
      const dishId = recipeData.dishId;
      const baseQty = parseFloat(recipeData.baseQty) || 1;
      const baseUnit = recipeData.unit || 'Kg';
      const dishName = recipeData.dishName || '';
      const tableBaseQty = (recipeData.tableBaseQty !== undefined && recipeData.tableBaseQty !== null && recipeData.tableBaseQty !== '')
        ? parseFloat(recipeData.tableBaseQty)
        : null;
      const tableUnit = recipeData.tableUnit || null;

      // Remove existing recipes for this dish to prevent duplicates
      const existingForDish = recipes.filter((r) => r && String(r.dishId) === String(dishId));
      for (const r of existingForDish) {
        try {
          await db.recipes.delete(r.id);
        } catch (e) {}
      }

      // Add each ingredient row
      for (const ing of recipeData.ingredients) {
        if (!ing.rawMaterialId && !ing.rawMaterialName) continue;
        await db.recipes.add({
          dishId: dishId,
          dishName: dishName,
          baseQty: baseQty,
          unit: baseUnit,
          tableBaseQty: tableBaseQty,
          tableUnit: tableUnit,
          rawMaterialId: ing.rawMaterialId,
          rawMaterialName: ing.rawMaterialName || '',
          qtyRequired: parseFloat(ing.qtyRequired) || 0,
          tableQtyRequired: (ing.tableQtyRequired !== undefined && ing.tableQtyRequired !== null && ing.tableQtyRequired !== '')
            ? parseFloat(ing.tableQtyRequired)
            : null
        });
      }
      syncStateFromCache();
      return;
    }

    const rmName = (recipeData.rawMaterialName || '').trim().toLowerCase();
    const existing = recipes.find(
      (r) => String(r.dishId) === String(recipeData.dishId) &&
             (
               (recipeData.rawMaterialId && String(r.rawMaterialId) === String(recipeData.rawMaterialId)) ||
               (rmName && r.rawMaterialName && String(r.rawMaterialName).trim().toLowerCase() === rmName)
             )
    );
    if (existing) {
      await db.recipes.update(existing.id, {
        ...existing,
        ...recipeData,
        baseQty: recipeData.baseQty || existing.baseQty || 1,
        id: existing.id
      });
    } else {
      await db.recipes.add({
        ...recipeData,
        baseQty: recipeData.baseQty || 1
      });
    }
    syncStateFromCache();
  };

  const handleDeleteDishRecipe = async (dishId) => {
    const existingForDish = recipes.filter((r) => r && String(r.dishId) === String(dishId));
    for (const r of existingForDish) {
      try {
        await db.recipes.delete(r.id);
      } catch (e) {}
    }
    syncStateFromCache();
  };

  const handleUpdateStockMode = async (newMode) => {
    setStockMode(newMode);
    localStorage.setItem('karuna_stock_mode', newMode);
    try {
      await db.systemSettings.put({
        id: 1,
        stockMode: newMode,
        lastSyncTime: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Error saving stockMode:', e);
    }
    const snapshot = db.getCacheSnapshot ? db.getCacheSnapshot() : null;
    if (snapshot) {
      if (!snapshot.systemSettings) snapshot.systemSettings = {};
      snapshot.systemSettings.stockMode = newMode;
    }
    syncStateFromCache(snapshot);
  };

  const [isHeaderHidden, setIsHeaderHidden] = useState(() => {
    return localStorage.getItem('karuna_header_hidden') === 'true';
  });

  const toggleHeaderHidden = () => {
    setIsHeaderHidden((prev) => {
      const next = !prev;
      localStorage.setItem('karuna_header_hidden', String(next));
      return next;
    });
  };

  const pendingCartCount = cartItems.reduce((acc, i) => acc + (parseFloat(i.qty) || 1), 0);

  // Urgent Pre-Orders calculation (Due Tomorrow or Due Today)
  const urgentOrders = React.useMemo(() => {
    return preOrders.filter((order) => {
      if (order.status === 'completed' || order.status === 'cancelled') return false;
      const alert = checkPreOrderAlert(order.deliveryDate);
      return alert.isTomorrow || alert.isToday;
    });
  }, [preOrders]);

  const urgentOrdersCount = urgentOrders.length;

  const handleAddPreOrder = async (orderData) => {
    const advance = parseFloat(orderData.advancePayment || 0);
    const total = parseFloat(orderData.totalAmount || 0);
    const isFullyPaid = Boolean(
      orderData.isFullPayment ||
      orderData.fullPaymentPaid ||
      (total > 0 && advance >= total)
    );

    const newId = await db.preOrders.add({
      ...orderData,
      status: isFullyPaid ? 'confirmed' : 'pending',
      paymentStatus: isFullyPaid ? 'fully_paid' : (advance > 0 ? 'advance_paid' : 'unpaid'),
      isFullPayment: isFullyPaid,
      fullPaymentPaid: isFullyPaid,
      balanceAmount: isFullyPaid ? 0 : Math.max(0, total - advance),
      deliveryStatus: orderData.deliveryStatus || 'pending'
    });

    // Requirement:
    // "in pre order tab when a order is placed then that order should not show in settle tab because its payment is pending when it is settled fully then only it should settle"
    // "and also if a customer pay full payment of order then give an option while taking order then that order should shown in settle other waise those order who's payment is pending that order should not show in settle tab"
    if (isFullyPaid) {
      try {
        const advMode = orderData.advancePaymentMode || 'Cash';
        const isCash = advMode.toLowerCase().includes('cash');
        const settledBillPayload = {
          tableNo: `Pre-Order: ${orderData.orderNo || ''}`,
          sectionName: 'Pre-Orders (Settled)',
          sectionId: 4,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          isPreOrderSettlement: true,
          isPreOrderFullPayment: true,
          preOrderId: newId,
          preOrderNo: orderData.orderNo,
          items: (orderData.items || []).map((item) => ({
            ...item,
            qty: item.qty || 1,
            price: item.price || 0,
            total: (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1),
            isParcel: true
          })),
          subtotal: orderData.subtotal || total,
          discount: orderData.discount || 0,
          discountAmount: orderData.discount || 0,
          total: total,
          finalTotal: total,
          grandTotal: total,
          advancePaid: total,
          paymentMode: advMode,
          paymentDetails: {
            mode: advMode,
            cash: isCash ? total : 0,
            online: !isCash ? total : 0,
            card: advMode === 'Card' ? total : 0,
            advancePaid: total,
            fullPayment: true
          },
          counter: activeCounter,
          createdAt: orderData.createdAt || new Date().toISOString(),
          settledAt: new Date().toISOString(),
          notes: `Pre-Order ${orderData.orderNo} 100% full payment received at booking. Event Date: ${orderData.deliveryDate} ${orderData.deliveryTime || ''}`
        };

        const settledResult = await db.settleBill(settledBillPayload);
        if (settledResult?.bill) {
          await db.preOrders.update(newId, {
            settledBillInvoiceNo: settledResult.bill.invoiceNo || '',
            settledBillId: settledResult.bill.id,
            settledAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error settling full-payment pre-order bill:', err);
      }
    } else {
      // Payment is pending (balance > 0).
      // DO NOT settle into db.bills so it NEVER appears in the Settle tab!
    }

    return newId;
  };

  const handleUpdatePreOrder = async (orderId, updatedFields) => {
    await db.preOrders.update(orderId, updatedFields);

    const existingOrder = preOrders.find((o) => String(o.id) === String(orderId));
    if (!existingOrder) return;

    const merged = { ...existingOrder, ...updatedFields };
    const advance = parseFloat(merged.advancePayment || 0);
    const total = parseFloat(merged.totalAmount || 0);
    const isFullyPaid = Boolean(
      merged.isFullPayment ||
      merged.fullPaymentPaid ||
      (total > 0 && advance >= total)
    );

    // If order was updated to full payment and not yet settled, settle it into bills!
    if (isFullyPaid && !existingOrder.settledBillId && !existingOrder.settledBillInvoiceNo) {
      try {
        const advMode = merged.advancePaymentMode || 'Cash';
        const isCash = advMode.toLowerCase().includes('cash');
        const settledBillPayload = {
          tableNo: `Pre-Order: ${merged.orderNo || ''}`,
          sectionName: 'Pre-Orders (Settled)',
          sectionId: 4,
          customerName: merged.customerName,
          customerPhone: merged.customerPhone,
          isPreOrderSettlement: true,
          isPreOrderFullPayment: true,
          preOrderId: orderId,
          preOrderNo: merged.orderNo,
          items: (merged.items || []).map((item) => ({
            ...item,
            qty: item.qty || 1,
            price: item.price || 0,
            total: (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1),
            isParcel: true
          })),
          subtotal: merged.subtotal || total,
          discount: merged.discount || 0,
          discountAmount: merged.discount || 0,
          total: total,
          finalTotal: total,
          grandTotal: total,
          advancePaid: total,
          paymentMode: advMode,
          paymentDetails: {
            mode: advMode,
            cash: isCash ? total : 0,
            online: !isCash ? total : 0,
            card: advMode === 'Card' ? total : 0,
            advancePaid: total,
            fullPayment: true
          },
          counter: activeCounter,
          createdAt: merged.createdAt || new Date().toISOString(),
          settledAt: new Date().toISOString(),
          notes: `Pre-Order ${merged.orderNo} updated to full payment.`
        };

        const settledResult = await db.settleBill(settledBillPayload);
        if (settledResult?.bill) {
          await db.preOrders.update(orderId, {
            settledBillInvoiceNo: settledResult.bill.invoiceNo || '',
            settledBillId: settledResult.bill.id,
            settledAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error settling pre-order on full payment update:', err);
      }
    }
  };

  const handleDeletePreOrder = async (orderId) => {
    return await db.preOrders.delete(orderId);
  };

  const handleSettlePreOrderToBill = async (preOrder, balancePaymentMode = 'Cash') => {
    if (!preOrder) return;
    const finalTotal = parseFloat(preOrder.totalAmount || 0);
    const advance = parseFloat(preOrder.advancePayment || 0);
    const discount = parseFloat(preOrder.discount || 0);
    const subtotal = preOrder.subtotal !== undefined ? parseFloat(preOrder.subtotal) : (finalTotal + discount);
    const balance = parseFloat(preOrder.balanceAmount !== undefined ? preOrder.balanceAmount : Math.max(0, finalTotal - advance));
    const isCash = (balancePaymentMode || '').toLowerCase().includes('cash');

    // Requirement: When settled fully, then only it should settle into final bill!
    const billPayload = {
      tableNo: `Pre-Order: ${preOrder.orderNo || ''}`,
      customerName: preOrder.customerName,
      customerPhone: preOrder.customerPhone,
      pax: 'Bulk',
      sectionName: 'Pre-Orders (Settled)',
      sectionId: 4,
      isPreOrderSettlement: true,
      preOrderId: preOrder.id,
      preOrderNo: preOrder.orderNo,
      items: (preOrder.items || []).map((item) => ({
        ...item,
        qty: item.qty || 1,
        price: item.price || 0,
        total: (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1),
        isParcel: true
      })),
      orderTotal: finalTotal,
      subtotal: subtotal,
      discount: discount,
      discountAmount: discount,
      advancePaid: advance,
      advanceBillInvoiceNo: preOrder.advanceBillInvoiceNo || null,
      total: balance > 0 ? balance : finalTotal, // Remaining payment collected on settlement day
      finalTotal: balance > 0 ? balance : finalTotal,
      grandTotal: balance > 0 ? balance : finalTotal,
      paymentMode: balancePaymentMode,
      paymentDetails: {
        mode: balancePaymentMode,
        cash: isCash ? (balance > 0 ? balance : finalTotal) : 0,
        online: !isCash ? (balance > 0 ? balance : finalTotal) : 0,
        card: balancePaymentMode === 'Card' ? (balance > 0 ? balance : finalTotal) : 0,
        orderTotal: finalTotal,
        advancePaid: advance,
        advanceMode: preOrder.advancePaymentMode || 'Cash',
        balancePaid: balance,
        balanceMode: balancePaymentMode
      },
      counter: activeCounter,
      createdAt: new Date().toISOString(), // Today's settlement date
      notes: `Pre-Order ${preOrder.orderNo} final settlement. Remaining balance collected today: ₹${balance} (${balancePaymentMode}). Advance of ₹${advance} recorded on booking. Event Date: ${preOrder.deliveryDate} ${preOrder.deliveryTime || ''}`
    };

    const settledResult = await db.settleBill(billPayload);

    await db.preOrders.update(preOrder.id, {
      status: 'completed',
      deliveryStatus: 'delivered',
      settledAt: new Date().toISOString(),
      settledBillInvoiceNo: settledResult?.bill?.invoiceNo || '',
      settledBillId: settledResult?.bill?.id || null,
      balanceCollected: balance,
      balanceCollectedMode: balancePaymentMode
    });

    return settledResult;
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden select-none relative">
      
      {(!activeTable || activeTab !== 'pos') && !isHeaderHidden && (
        <Header
          activeTab={activeTab}
          setActiveTab={handleRequestTab}
          pendingCartCount={pendingCartCount}
          urgentPreOrdersCount={urgentOrdersCount}
          otherRecordsCount={otherRecordsCount}
          activeCounter={activeCounter}
          onSelectCounter={handleSelectCounter}
          isServerConnected={isServerConnected}
          offlineQueueCount={offlineQueueCount}
          onForceSync={handleForceSync}
          onRequestAdminTab={handleRequestAdminTab}
          onToggleHeaderHidden={toggleHeaderHidden}
          printLanguage={printLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* Global Pre-Order Alert Banner for Due Tomorrow / Due Today */}
      {urgentOrders.length > 0 && !dismissedUrgentAlert && activeTab !== 'preorder' && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white px-4 py-2 flex items-center justify-between shadow-lg shrink-0 select-none animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping mr-1 inline-block shrink-0" />
            <AlertTriangle className="w-5 h-5 text-yellow-200 shrink-0" />
            <div className="text-xs">
              <span className="font-black tracking-wide mr-2">
                🚨 PRE-ORDER ALERT:
              </span>
              <span className="font-bold">
                {urgentOrders.length} bulk order{urgentOrders.length > 1 ? 's' : ''} scheduled for tomorrow / today!
              </span>
              <span className="hidden md:inline text-amber-100 ml-2">
                ({urgentOrders[0]?.customerName} - {urgentOrders[0]?.customerPhone}, Delivery: {urgentOrders[0]?.deliveryDate})
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => handleRequestTab('preorder')}
              className="px-3 py-1 bg-white text-orange-900 hover:bg-orange-50 font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Open Pre-Order Tab →
            </button>
            <button
              onClick={() => setDismissedUrgentAlert(true)}
              className="p-1 hover:bg-black/20 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
              title="Dismiss alert banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Expand Header Button (shown ONLY when header is hidden) */}
      {isHeaderHidden && (!activeTable || activeTab !== 'pos') && (
        <button
          type="button"
          onClick={toggleHeaderHidden}
          className="fixed top-3 right-3 z-50 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer shadow-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:scale-105 active:scale-95 animate-in slide-in-from-top-2"
          title="Show Navigation Header"
        >
          <ChevronDown className="w-5 h-5 text-blue-400 stroke-[3]" />
        </button>
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {activeTab === 'pos' && (
          <POSBilling
            dishes={dishes}
            categories={categories}
            subCategories={subCategories}
            sections={sections}
            tables={tables}
            activeSection={activeSection}
            setActiveSection={setActiveSectionState}
            activeTable={activeTable}
            settledBillsCount={bills.length}
            settledBills={bills}
            allDishes={dishes}
            billLogs={billLogs}
            activeCounter={activeCounter}
            onUpdateSettledBill={handleUpdateSettledBill}
            onSelectTable={handleSelectTable}
            onSaveTableOrder={handleSaveTableOrder}
            onOpenAddTableModal={() => setIsAddTableModalOpen(true)}
            onNavigateToSettled={() => handleRequestTab('settle')}
            onOpenOrderPopupForTable={(tbl) => {
              if (tbl) {
                const targetTable = tables.find((t) => String(t.id) === String(tbl.id)) || tbl;
                if (!activeTable || String(activeTable.id) !== String(targetTable.id)) {
                  handleSelectTable(targetTable);
                } else {
                  setActiveTable((prev) => prev ? { ...prev, currentCart: cartItems.length > 0 ? cartItems : (targetTable.currentCart || []) } : targetTable);
                }
              }
              setIsCartOpen(true);
            }}
            onSplitTable={handleSplitTable}
            onDeleteTable={handleDeleteTable}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onReduceFromCart={handleReduceFromCart}
            onUpdateCartItem={handleUpdateCartItem}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={() => setCartItems([])}
            onSettleBill={handleSettleBill}
            printLanguage={printLanguage}
            isSettledBillEditEnabled={isSettledBillEditEnabled}
            preOrders={preOrders}
          />
        )}

        {activeTab === 'preorder' && (
          <PreOrderManagement
            preOrders={preOrders}
            dishes={dishes}
            categories={categories}
            subCategories={subCategories}
            onAddPreOrder={handleAddPreOrder}
            onUpdatePreOrder={handleUpdatePreOrder}
            onDeletePreOrder={handleDeletePreOrder}
            onSettlePreOrderToBill={handleSettlePreOrderToBill}
            printLanguage={printLanguage}
            activeCounter={activeCounter}
          />
        )}

        {activeTab === 'settle' && (
          <SettledBills
            settledBills={bills}
            allDishes={dishes}
            billLogs={billLogs}
            onUpdateSettledBill={handleUpdateSettledBill}
            printLanguage={printLanguage}
            isSettledBillEditEnabled={isSettledBillEditEnabled}
          />
        )}

        {activeTab === 'stock' && (
          <StockManagement
            stockMode={stockMode}
            rawMaterials={rawMaterials}
            dishes={dishes}
            categories={categories}
            subCategories={subCategories}
            recipes={recipes}
            onAddRawMaterial={handleAddRawMaterial}
            onUpdateRawMaterial={handleUpdateRawMaterial}
            onDeleteRawMaterial={handleDeleteRawMaterial}
            onSaveRecipeMapping={handleSaveRecipeMapping}
            onDeleteDishRecipe={handleDeleteDishRecipe}
            onUpdateDish={handleUpdateDish}
            onSyncCache={syncStateFromCache}
          />
        )}

        {activeTab === 'other' && (
          <OtherRecords
            printLanguage={printLanguage}
            onRecordsChange={(updatedRecords) => setOtherRecordsCount(updatedRecords.length)}
          />
        )}

        {activeTab === 'server' && (
          <ServerMonitorPanel
            isServerConnected={isServerConnected}
            bills={bills}
            dishes={dishes}
            offlineQueueCount={offlineQueueCount}
            activeCounter={activeCounter}
          />
        )}

        {activeTab === 'admin' && (
          <OwnerAdmin
            dishes={dishes}
            categories={categories}
            subCategories={subCategories}
            sections={sections}
            tables={tables}
            bills={bills}
            billLogs={billLogs}
            preOrders={preOrders}
            onAddDish={handleAddDish}
            onUpdateDish={handleUpdateDish}
            onDeleteDish={handleDeleteDish}
            onAddSubCategory={handleAddSubCategory}
            onDeleteSubCategory={handleDeleteSubCategory}
            onUpdateSection={handleUpdateSection}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onAddTable={handleAddTable}
            onDeleteTable={handleDeleteTable}
            onBulkUpdatePrices={handleBulkUpdatePrices}
            onUpdateSettledBill={handleUpdateSettledBill}
            printLanguage={printLanguage}
            isSettledBillEditEnabled={isSettledBillEditEnabled}
            onToggleSettledBillEdit={handleToggleSettledBillEdit}
            onMatrixUnsavedChange={setAdminHasUnsavedMatrix}
            onRegisterMatrixActions={(actions) => {
              matrixActionsRef.current = actions;
            }}
          />
        )}

      </div>

      {/* Owner PIN Security Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Owner Verification</h3>
                  <p className="text-xs text-slate-400">Enter PIN to access Admin Controls</p>
                </div>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: 1234)"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-center text-2xl tracking-widest text-white font-mono focus:outline-none focus:border-purple-500"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-1.5 text-center font-medium">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-600/30"
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CreateNewTableModal
        isOpen={isAddTableModalOpen}
        onClose={() => setIsAddTableModalOpen(false)}
        sections={sections}
        tables={tables}
        onCreateTableAndOpenMenu={handleCreateTableAndOpenMenu}
      />

      <OrderCartPopup
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        activeSection={activeSection}
        activeTable={activeTable}
        onSettleBill={handleSettleBill}
      />

      {/* Modal to Save or Discard Area Matrix Rates when leaving Admin Tab */}
      {showTabUnsavedModal && (
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
                  if (matrixActionsRef.current?.save) {
                    await matrixActionsRef.current.save();
                  }
                  setAdminHasUnsavedMatrix(false);
                  setShowTabUnsavedModal(false);
                  if (pendingTabNavigation) {
                    setActiveTab(pendingTabNavigation);
                    setPendingTabNavigation(null);
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
                  if (matrixActionsRef.current?.discard) {
                    matrixActionsRef.current.discard();
                  }
                  setAdminHasUnsavedMatrix(false);
                  setShowTabUnsavedModal(false);
                  if (pendingTabNavigation) {
                    setActiveTab(pendingTabNavigation);
                    setPendingTabNavigation(null);
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
                  setShowTabUnsavedModal(false);
                  setPendingTabNavigation(null);
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
