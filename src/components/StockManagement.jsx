import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  Trash2,
  CheckCircle,
  Layers,
  Search,
  Scale,
  X,
  ChefHat,
  Settings,
  Droplet,
  Disc,
  Check,
  TrendingUp,
  Sliders,
  Edit3
} from 'lucide-react';
import { db, cleanAndDeduplicateRecipes } from '../db/db';

export default function StockManagement({
  rawMaterials = [],
  dishes = [],
  categories = [],
  subCategories = [],
  recipes = [],
  onAddRawMaterial,
  onUpdateRawMaterial,
  onDeleteRawMaterial,
  onSaveRecipeMapping,
  onUpdateDish,
  onSyncCache
}) {
  // 2 Master Sub-Tabs: 'setting' (1. प्रमाण व रेसिपी सेटिंग) | 'remaining' (2. शिल्लक स्टॉक)
  const [activeStockSubTab, setActiveStockSubTab] = useState('remaining');

  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedSubCatFilter, setSelectedSubCatFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'in' | 'low' | 'out'
  const [remainingViewFilter, setRemainingViewFilter] = useState('configured'); // 'configured' | 'all'

  // Modal States
  const [editingDishSettings, setEditingDishSettings] = useState(null); // Setting Tab Modal
  const [adjustingDish, setAdjustingDish] = useState(null); // Remaining Tab: Adjust Dish Stock Modal
  const [adjustingRawMaterial, setAdjustingRawMaterial] = useState(null); // Remaining Tab: Adjust Raw Material Stock Modal

  const [toastMessage, setToastMessage] = useState(null);

  // Show Toast Notification Helper
  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Recipe configuration state inside "Setting" modal
  const [selectedUnit, setSelectedUnit] = useState('kg'); // 'kg' | 'litre' | 'per plate'
  const [tempBaseQty, setTempBaseQty] = useState(''); // Base measurement quantity (starts blank)
  const [recipeRows, setRecipeRows] = useState([]); // [{ id, rawMaterialId, rawMaterialName, qtyRequired, unit, currentStock }]

  // Set of dish IDs that have a configured recipe in `recipes`
  const configuredDishIds = useMemo(() => {
    const set = new Set();
    (recipes || []).forEach((r) => {
      if (r && r.dishId) set.add(String(r.dishId));
    });
    return set;
  }, [recipes]);

  // Open Dish Setting Modal (Strictly for setting measurement & raw materials ratio)
  const handleOpenDishSetting = async (dish) => {
    setEditingDishSettings(dish);

    // Determine existing unit or default
    let defaultUnit = dish.stockUnit;
    if (!defaultUnit) {
      if (dish.pricePerKg || dish.hasMultiplePrices) defaultUnit = 'kg';
      else if (dish.counter === 'Sweets') defaultUnit = 'kg';
      else defaultUnit = 'per plate';
    }
    setSelectedUnit(defaultUnit);

    // Always fetch latest data from db cache to ensure all raw materials & recipes are fresh
    const currentRecipes = await db.recipes.toArray();
    const currentRawMaterials = await db.rawMaterials.toArray();

    const existingRecipes = cleanAndDeduplicateRecipes(
      (currentRecipes || []).filter((r) => r && String(r.dishId) === String(dish.id))
    );
    let baseQty = dish.recipeBaseQty;
    if (!baseQty && existingRecipes.length > 0 && existingRecipes[0].baseQty) {
      baseQty = existingRecipes[0].baseQty;
    }
    setTempBaseQty(baseQty !== undefined && baseQty !== null && !isNaN(baseQty) ? String(baseQty) : '');

    // Load existing recipes for this dish with their stock
    if (existingRecipes.length > 0) {
      const rows = existingRecipes.map((r) => {
        const rm = (currentRawMaterials || []).find((m) => m && String(m.id) === String(r.rawMaterialId)) ||
                   (rawMaterials || []).find((m) => m && String(m.id) === String(r.rawMaterialId));
        const currentStockVal = (r.currentStock !== undefined && r.currentStock !== null && r.currentStock !== '')
          ? r.currentStock
          : (rm && rm.quantity !== undefined && rm.quantity !== null ? rm.quantity : '');
        return {
          id: r.id,
          rawMaterialId: r.rawMaterialId || (rm ? rm.id : ''),
          rawMaterialName: r.rawMaterialName || rm?.name || '',
          qtyRequired: r.qtyRequired !== undefined && r.qtyRequired !== null ? String(r.qtyRequired) : '',
          unit: r.unit || rm?.unit || 'Kg',
          currentStock: currentStockVal !== '' ? String(currentStockVal) : ''
        };
      });
      setRecipeRows(rows);
    } else {
      // Default empty single row
      setRecipeRows([
        {
          rawMaterialId: '',
          rawMaterialName: '',
          qtyRequired: '',
          unit: 'Kg',
          currentStock: ''
        }
      ]);
    }
  };

  // Save Dish Recipe & Measurement Settings
  const handleSaveDishSettings = async () => {
    if (!editingDishSettings) return;

    try {
      const parsedBase = parseFloat(tempBaseQty);
      const newBaseQty = isNaN(parsedBase) || parsedBase <= 0 ? 1 : Math.round(parsedBase * 1000) / 1000;

      // 1. Update dish stockUnit and recipeBaseQty
      const updatedDishFields = {
        ...editingDishSettings,
        stockUnit: selectedUnit,
        recipeBaseQty: newBaseQty,
        accumulatedSold: 0
      };

      if (typeof onUpdateDish === 'function') {
        await onUpdateDish(editingDishSettings.id, updatedDishFields);
      } else {
        await db.dishes.update(editingDishSettings.id, updatedDishFields);
      }
      editingDishSettings.stockUnit = selectedUnit;
      editingDishSettings.recipeBaseQty = newBaseQty;
      editingDishSettings.accumulatedSold = 0;

      // 2. Fetch latest rawMaterials & recipes from database
      const dbRawMaterials = await db.rawMaterials.toArray();
      const tempMaterials = [...dbRawMaterials];

      const validRows = [];
      for (const row of recipeRows) {
        const rmName = (row.rawMaterialName || '').trim();
        const qtyReq = parseFloat(row.qtyRequired);

        if (!rmName || isNaN(qtyReq) || qtyReq <= 0) continue;

        // Check if raw material exists by name or ID
        let existingRm = tempMaterials.find(
          (m) => m && m.name && m.name.toLowerCase().trim() === rmName.toLowerCase()
        );
        if (!existingRm && row.rawMaterialId) {
          existingRm = tempMaterials.find((m) => m && String(m.id) === String(row.rawMaterialId));
        }

        const parsedStock = parseFloat(row.currentStock);
        const initialStock = !isNaN(parsedStock) && parsedStock >= 0
          ? Math.round(parsedStock * 1000) / 1000
          : 0;

        let rmId;
        if (!existingRm) {
          const newRm = {
            name: rmName,
            quantity: initialStock,
            minThreshold: 2,
            unit: row.unit || 'Kg'
          };
          let createdId;
          if (typeof onAddRawMaterial === 'function') {
            createdId = await onAddRawMaterial(newRm);
          } else {
            createdId = await db.rawMaterials.add(newRm);
          }
          rmId = createdId || Date.now();
          tempMaterials.push({ ...newRm, id: rmId });
        } else {
          rmId = existingRm.id;
          if (row.currentStock !== '' && !isNaN(parsedStock)) {
            await db.rawMaterials.update(existingRm.id, { quantity: initialStock });
          }
        }

        validRows.push({
          id: row.id,
          dishId: editingDishSettings.id,
          rawMaterialId: rmId,
          rawMaterialName: rmName,
          qtyRequired: Math.round(qtyReq * 1000) / 1000,
          baseQty: newBaseQty,
          unit: row.unit || 'Kg',
          currentStock: initialStock
        });
      }

      // 3. Synchronize recipes atomically for this dish:
      const allDbRecipes = await db.recipes.toArray();
      const existingDishRecipes = cleanAndDeduplicateRecipes(
        (allDbRecipes || []).filter((r) => r && String(r.dishId) === String(editingDishSettings.id))
      );

      // (a) Delete recipes that user deliberately removed (not in validRows)
      for (const oldRec of existingDishRecipes) {
        const oldRm = tempMaterials.find((m) => m && String(m.id) === String(oldRec.rawMaterialId));
        const oldName = (oldRec.rawMaterialName || oldRm?.name || '').toLowerCase().trim();

        const stillInNewRows = validRows.some((vr) => {
          if (vr.id && oldRec.id && String(vr.id) === String(oldRec.id)) return true;
          if (vr.rawMaterialId && oldRec.rawMaterialId && String(vr.rawMaterialId) === String(oldRec.rawMaterialId)) return true;
          if (oldName && vr.rawMaterialName && vr.rawMaterialName.toLowerCase().trim() === oldName) return true;
          return false;
        });

        if (!stillInNewRows) {
          await db.recipes.delete(oldRec.id);
        }
      }

      // (b) Update existing matching recipes (preserving them) or add new ones
      for (const vRow of validRows) {
        const vRmName = (vRow.rawMaterialName || '').toLowerCase().trim();
        const matchingExisting = existingDishRecipes.find((oldRec) => {
          if (vRow.id && oldRec.id && String(vRow.id) === String(oldRec.id)) return true;
          if (vRow.rawMaterialId && oldRec.rawMaterialId && String(vRow.rawMaterialId) === String(oldRec.rawMaterialId)) return true;
          const oldRm = tempMaterials.find((m) => m && String(m.id) === String(oldRec.rawMaterialId));
          const oldName = (oldRec.rawMaterialName || oldRm?.name || '').toLowerCase().trim();
          if (oldName && vRmName && oldName === vRmName) return true;
          return false;
        });

        if (matchingExisting) {
          await db.recipes.update(matchingExisting.id, {
            ...matchingExisting,
            ...vRow,
            id: matchingExisting.id
          });
        } else {
          await db.recipes.add({
            dishId: vRow.dishId,
            rawMaterialId: vRow.rawMaterialId,
            rawMaterialName: vRow.rawMaterialName,
            qtyRequired: vRow.qtyRequired,
            baseQty: vRow.baseQty,
            unit: vRow.unit,
            currentStock: vRow.currentStock
          });
        }
      }

      if (typeof onSyncCache === 'function') {
        onSyncCache();
      }

      showToast(`✓ Measurement & Recipe saved for "${editingDishSettings.name}"!`);
      setEditingDishSettings(null);
    } catch (err) {
      console.error('Error saving dish stock settings:', err);
      showToast(`Error saving settings: ${err.message}`, 'error');
    }
  };

  // Add Recipe Row in Setting Modal (blank fields without pre-typed quantities)
  const handleAddRecipeRow = () => {
    setRecipeRows((prev) => [
      ...prev,
      {
        rawMaterialId: '',
        rawMaterialName: '',
        qtyRequired: '',
        unit: 'Kg',
        currentStock: ''
      }
    ]);
  };

  // Remove Recipe Row in Setting Modal
  const handleRemoveRecipeRow = (index) => {
    setRecipeRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update Recipe Row in Setting Modal
  const handleUpdateRecipeRow = (index, field, value) => {
    setRecipeRows((prev) => {
      const updated = [...prev];
      if (field === 'rawMaterialName') {
        const matched = rawMaterials.find(
          (m) => m.name && m.name.toLowerCase().trim() === (value || '').toLowerCase().trim()
        );
        updated[index] = {
          ...updated[index],
          rawMaterialName: value,
          rawMaterialId: matched ? matched.id : '', // Reset ID if not matching an existing material
          unit: matched?.unit || updated[index].unit
        };
      } else if (field === 'rawMaterialId') {
        const matched = rawMaterials.find((m) => String(m.id) === String(value));
        updated[index] = {
          ...updated[index],
          rawMaterialId: matched ? matched.id : value,
          rawMaterialName: matched ? matched.name : updated[index].rawMaterialName,
          unit: matched?.unit || updated[index].unit
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Handle Save / Update Dish Stock in Remaining Tab
  const handleSaveDishStockAdjustment = async () => {
    if (!adjustingDish) return;
    const { dish, mode, value } = adjustingDish;
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 0) return;

    try {
      const current = parseFloat(dish.stockQty) || 0;
      const newStock = mode === 'add'
        ? Math.round((current + numVal) * 1000) / 1000
        : Math.round(numVal * 1000) / 1000;

      const updatedFields = {
        stockQty: newStock,
        status: newStock > 0 ? 'In Stock' : 'Out of Stock'
      };

      if (typeof onUpdateDish === 'function') {
        await onUpdateDish(dish.id, updatedFields);
      } else {
        await db.dishes.update(dish.id, updatedFields);
      }
      dish.stockQty = newStock;
      dish.status = updatedFields.status;

      const unit = dish.stockUnit || (dish.pricePerKg ? 'kg' : 'plates');
      showToast(`✓ Stock for "${dish.name}" updated to ${newStock} ${unit}`);
      setAdjustingDish(null);
    } catch (err) {
      console.error('Error saving dish stock:', err);
      showToast(`Error saving stock: ${err.message}`, 'error');
    }
  };

  // Handle Save / Update Raw Material Stock in Remaining Tab (For that item only)
  const handleSaveRawMaterialStockAdjustment = async () => {
    if (!adjustingRawMaterial) return;
    const { recipe, rawMaterial, dish, mode, value } = adjustingRawMaterial;
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 0) return;

    try {
      const current = parseFloat(
        recipe?.currentStock !== undefined && recipe?.currentStock !== null
          ? recipe.currentStock
          : 0
      ) || 0;

      const newStock = mode === 'add'
        ? Math.round((current + numVal) * 1000) / 1000
        : Math.round(numVal * 1000) / 1000;

      // Update recipe record in db.recipes (strictly for this dish only)
      if (recipe && recipe.id) {
        await db.recipes.update(recipe.id, { currentStock: newStock });
        recipe.currentStock = newStock;
      }

      const rmName = recipe?.rawMaterialName || rawMaterial?.name || 'Raw Material';
      showToast(`✓ Stock for "${rmName}" (${dish?.name || 'Item'}) set to ${newStock} ${recipe?.unit || 'Kg'}`);
      setAdjustingRawMaterial(null);
    } catch (err) {
      console.error('Error saving raw material stock:', err);
      showToast(`Error saving stock: ${err.message}`, 'error');
    }
  };

  // Filter Dishes:
  // - In 'setting' tab: show all dishes so user can pick any dish to configure!
  // - In 'remaining' tab: show configured dishes by default, or all dishes if toggle selected
  const filteredDishes = useMemo(() => {
    return (dishes || []).filter((d) => {
      // In remaining tab, filter by configured dishes if view filter is 'configured'
      if (activeStockSubTab === 'remaining' && remainingViewFilter === 'configured') {
        if (!configuredDishIds.has(String(d.id))) {
          return false;
        }
      }

      // Category filter
      if (selectedCategoryFilter !== 'all' && String(d.categoryId) !== String(selectedCategoryFilter)) {
        return false;
      }
      // Sub-category filter
      if (selectedSubCatFilter !== 'all' && String(d.subCategoryId) !== String(selectedSubCatFilter)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (d.name || '').toLowerCase().includes(q);
        const matchesMarathi = (d.marathiName || '').toLowerCase().includes(q);
        const matchesSrNo = String(d.srNo || '').includes(q);
        if (!matchesName && !matchesMarathi && !matchesSrNo) return false;
      }
      // Stock Status filter (for remaining dishes tab)
      if (activeStockSubTab === 'remaining' && stockStatusFilter !== 'all') {
        const qty = parseFloat(d.stockQty) || 0;
        if (stockStatusFilter === 'in' && qty <= 2) return false;
        if (stockStatusFilter === 'low' && (qty <= 0 || qty > 2)) return false;
        if (stockStatusFilter === 'out' && qty > 0) return false;
      }
      return true;
    });
  }, [dishes, activeStockSubTab, remainingViewFilter, configuredDishIds, selectedCategoryFilter, selectedSubCatFilter, searchQuery, stockStatusFilter]);

  // Helper to format unit display badge
  const getUnitBadge = (unit) => {
    switch ((unit || '').toLowerCase()) {
      case 'kg':
        return { label: 'kg (किलो)', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Scale };
      case 'litre':
      case 'littre':
        return { label: 'litre (लिटर)', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Droplet };
      case 'per plate':
      case 'plate':
        return { label: 'per plate (प्लेट)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Disc };
      default:
        return { label: 'per plate (प्लेट)', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Disc };
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-100 overflow-y-auto select-none min-h-0">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-16 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-black flex items-center space-x-2 animate-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : 'bg-slate-900 text-emerald-300 border-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header & 2 Master Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/30">
              <Package className="w-5 h-5" />
            </div>
            <span>Stock Master (स्टॉक व्यवस्थापन)</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Setting: Set measurement base &amp; add raw materials • Remaining: View remaining quantities &amp; increase stock
          </p>
        </div>

        {/* 2 Master Sub-Tabs Switcher */}
        <div className="flex items-center space-x-2 bg-white border border-slate-300 rounded-2xl p-1.5 shadow-sm mr-12">
          <button
            onClick={() => setActiveStockSubTab('setting')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center space-x-2 ${
              activeStockSubTab === 'setting'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>1. Setting (प्रमाण व रेसिपी सेटिंग)</span>
          </button>

          <button
            onClick={() => setActiveStockSubTab('remaining')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center space-x-2 ${
              activeStockSubTab === 'remaining'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>2. Remaining Stock (शिल्लक स्टॉक)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeStockSubTab === 'remaining' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {configuredDishIds.size} Setted
            </span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Division & Sub-Category & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 mb-4 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Category / Division Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Division:</span>
            </span>
            <button
              onClick={() => {
                setSelectedCategoryFilter('all');
                setSelectedSubCatFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                selectedCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Divisions (सर्व)
            </button>
            {categories.map((c) => (
              <button
                key={`cat-filter-${c.id}`}
                onClick={() => {
                  setSelectedCategoryFilter(c.id);
                  setSelectedSubCatFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  String(selectedCategoryFilter) === String(c.id)
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeStockSubTab === 'remaining' ? "Search setted items..." : "Search all dishes to set..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">
            Sub-Category:
          </span>
          <button
            onClick={() => setSelectedSubCatFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold cursor-pointer transition-all ${
              selectedSubCatFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            All Sub-Categories
          </button>
          {subCategories
            .filter((s) => selectedCategoryFilter === 'all' || String(s.parentCategoryId) === String(selectedCategoryFilter))
            .map((sc) => (
              <button
                key={`subcat-pill-${sc.id}`}
                onClick={() => setSelectedSubCatFilter(sc.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold cursor-pointer transition-all ${
                  String(selectedSubCatFilter) === String(sc.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sc.name}
              </button>
            ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: SETTING (प्रमाण व रेसिपी सेटिंग)                                 */}
      {/* ========================================================================= */}
      {activeStockSubTab === 'setting' && (
        <div className="space-y-4">
          
          {/* Guide Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 shadow-md flex items-start space-x-3.5 border border-blue-700/50">
            <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl mt-0.5">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">
                Item Measurement &amp; Raw Material Consumption Setting (प्रमाण व रेसिपी सेटिंग)
              </h3>
              <p className="text-xs text-blue-200 font-semibold mt-0.5 leading-relaxed">
                Click any food item below to define its measurement unit (<strong>kg</strong>, <strong>litre</strong>, or <strong>per plate</strong>) and base sold quantity (e.g. <strong>1 kg</strong>).
                Add raw materials (e.g. <strong>0.5 kg Sugar</strong>, <strong>0.8 kg Khoya</strong>). When that set base quantity is sold at POS, the raw materials are automatically deducted from that item.
                <strong> Note:</strong> Raw materials can only be created/added here in Setting.
              </p>
            </div>
          </div>

          {/* Dishes Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDishes.map((dish) => {
              const dishRecipes = cleanAndDeduplicateRecipes((recipes || []).filter((r) => String(r.dishId) === String(dish.id)));
              const isConfigured = dishRecipes.length > 0;
              const unit = dish.stockUnit || (dish.pricePerKg ? 'kg' : 'per plate');
              const unitInfo = getUnitBadge(unit);
              const UnitIcon = unitInfo.icon;
              const baseQty = dish.recipeBaseQty || (dishRecipes[0]?.baseQty) || 1;
              const subCat = subCategories.find((s) => s.id === dish.subCategoryId);

              return (
                <div
                  key={`setting-card-${dish.id}`}
                  onClick={() => handleOpenDishSetting(dish)}
                  className={`bg-white border-2 rounded-2xl p-4 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 ${
                    isConfigured ? 'border-indigo-200 hover:border-indigo-600' : 'border-slate-200 hover:border-blue-600'
                  }`}
                >
                  <div>
                    {/* Top Row: Sr. No. & Unit Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                        #{dish.srNo || dish.id}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center space-x-1 ${unitInfo.color}`}>
                        <UnitIcon className="w-3 h-3" />
                        <span>{unitInfo.label}</span>
                      </span>
                    </div>

                    {/* Dish Names */}
                    <h4 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {dish.name}
                    </h4>
                    {dish.marathiName && (
                      <p className="text-xs font-bold text-slate-500 mt-0.5">
                        {dish.marathiName}
                      </p>
                    )}

                    {/* Division & Sub-Category */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {subCat && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {subCat.name}
                        </span>
                      )}
                      {isConfigured ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                          <Check className="w-2.5 h-2.5 inline" />
                          <span>Configured in Remaining</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          Not Configured
                        </span>
                      )}
                    </div>

                    {/* Configured Raw Materials Preview */}
                    <div className="bg-slate-50 rounded-xl p-2.5 my-3 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          Measurement Rule:
                        </span>
                        {isConfigured && (
                          <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                            When {baseQty} {unit} sold
                          </span>
                        )}
                      </div>

                      {!isConfigured ? (
                        <div className="text-[11px] text-amber-700 font-bold flex items-center space-x-1 py-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>No measurement set. Click to configure.</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {dishRecipes.map((r, rIdx) => {
                            const rm = rawMaterials.find((m) => String(m.id) === String(r.rawMaterialId));
                            const rmName = r.rawMaterialName || rm?.name || 'Material';
                            const curStock = r.currentStock !== undefined && r.currentStock !== null ? r.currentStock : 10;
                            return (
                              <div
                                key={`r-preview-${r.id || rIdx}`}
                                className="flex items-center justify-between text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-md"
                              >
                                <span className="font-bold text-slate-700 truncate max-w-[110px]" title={rmName}>
                                  {rmName}:
                                </span>
                                <div className="text-right">
                                  <span className="font-black text-indigo-700">
                                    {r.qtyRequired} {r.unit || 'Kg'}
                                  </span>
                                  <span className="text-[9px] text-slate-400 ml-1">
                                    (Stock: {curStock})
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDishSetting(dish);
                    }}
                    className={`w-full font-black text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs ${
                      isConfigured
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
                        : 'bg-slate-100 group-hover:bg-blue-600 text-slate-800 group-hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{isConfigured ? '⚙️ Edit Measurement & Recipes' : '⚙️ Set Measurement & Recipes'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: REMAINING STOCK (शिल्लक स्टॉक)                                  */}
      {/* ========================================================================= */}
      {activeStockSubTab === 'remaining' && (
        <div className="space-y-4">
          
          {/* Header Controls: Status filter & View mode */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                <span>Remaining Dishes &amp; Raw Material Stock (शिल्लक पदार्थ व कच्चा माल)</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-black">
                  {filteredDishes.length} Items
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Each card shows the dish stock and its linked raw materials. You can increase stock for the dish or any ingredient directly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-black">
                <button
                  type="button"
                  onClick={() => setRemainingViewFilter('configured')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    remainingViewFilter === 'configured' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Configured Only ({configuredDishIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => setRemainingViewFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    remainingViewFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All Items ({dishes.length})
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-black">
                <button
                  onClick={() => setStockStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    stockStatusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStockStatusFilter('in')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    stockStatusFilter === 'in' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  In Stock (&gt;2)
                </button>
                <button
                  onClick={() => setStockStatusFilter('low')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    stockStatusFilter === 'low' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Low (0-2)
                </button>
                <button
                  onClick={() => setStockStatusFilter('out')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    stockStatusFilter === 'out' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Out (0)
                </button>
              </div>
            </div>
          </div>

          {/* Empty State if No Configured Dishes */}
          {filteredDishes.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Sliders className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-black text-slate-900">
                  No Configured Dishes Found
                </h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Go to the <strong>1. Setting</strong> tab, click any food item (e.g. Gulab Jamun), define its measurement base quantity and raw materials, and it will appear here.
                </p>
              </div>
              <button
                onClick={() => setActiveStockSubTab('setting')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>👉 Go to 1. Setting Tab to Configure Items</span>
              </button>
            </div>
          ) : (
            /* Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDishes.map((dish) => {
                const currentStock = Math.max(0, parseFloat(dish.stockQty) || 0);
                const isOut = currentStock <= 0;
                const isLow = currentStock <= 2 && !isOut;
                const dishUnit = dish.stockUnit || (dish.pricePerKg ? 'kg' : 'plates');
                const unitInfo = getUnitBadge(dishUnit);
                const UnitIcon = unitInfo.icon;
                const dishRecipes = cleanAndDeduplicateRecipes((recipes || []).filter((r) => String(r.dishId) === String(dish.id)));
                const baseQty = dish.recipeBaseQty || (dishRecipes[0]?.baseQty) || 1;
                const isConfigured = dishRecipes.length > 0;
                const accumSold = parseFloat(dish.accumulatedSold) || 0;
                const remainingToBatch = Math.max(0, Math.round((baseQty - accumSold) * 1000) / 1000);

                return (
                  <div
                    key={`rem-dish-card-${dish.id}`}
                    className={`bg-white border-2 rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all duration-150 ${
                      isOut
                        ? 'border-rose-300 bg-rose-50/10'
                        : isLow
                        ? 'border-amber-300 bg-amber-50/10'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div>
                      {/* Top Row: Code & Status */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          #{dish.srNo || dish.id}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center space-x-1 ${unitInfo.color}`}>
                            <UnitIcon className="w-3 h-3" />
                            <span>{unitInfo.label}</span>
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Dish Name */}
                      <h4 className="font-black text-sm text-slate-900">
                        {dish.name}
                      </h4>
                      {dish.marathiName && (
                        <p className="text-xs font-bold text-slate-500 mt-0.5">
                          {dish.marathiName}
                        </p>
                      )}

                      {/* 1. DISH REMAINING STOCK PANEL */}
                      <div className="bg-slate-50 rounded-2xl p-3 my-2.5 border border-slate-200">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-slate-500">
                            Remaining Item Stock:
                          </span>
                          <div className="text-right">
                            <span className={`text-2xl font-black ${
                              isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                            }`}>
                              {currentStock}
                            </span>
                            <span className="text-xs font-extrabold text-slate-500 ml-1">
                              {dishUnit}
                            </span>
                          </div>
                        </div>

                        {/* Dish Stock Action Buttons */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2 mt-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => setAdjustingDish({ dish, mode: 'set', value: String(currentStock) })}
                            className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-black text-xs py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1"
                            title="Set exact stock"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Set Stock</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAdjustingDish({ dish, mode: 'add', value: '1' })}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                            title="Increase item stock"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Increase</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. DEDUCTION RULE & PROGRESS BANNER */}
                      {isConfigured ? (
                        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-2.5 mb-2.5 text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-black text-indigo-900">
                            <span>Deduction Batch:</span>
                            <span>Every {baseQty} {dishUnit} Sold</span>
                          </div>
                          {accumSold > 0 ? (
                            <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 pt-0.5 border-t border-indigo-100">
                              <span>Sold: {accumSold} / {baseQty} {dishUnit}</span>
                              <span className="text-amber-700">({remainingToBatch} {dishUnit} left to deduct)</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 font-semibold">
                              Ready: Deducts ingredients when {baseQty} {dishUnit} is reached.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-2.5 text-xs text-amber-800 font-bold flex items-center justify-between">
                          <span>No recipe set</span>
                          <button
                            onClick={() => handleOpenDishSetting(dish)}
                            className="text-[11px] underline text-blue-600 font-black cursor-pointer"
                          >
                            Set Recipe 👉
                          </button>
                        </div>
                      )}

                      {/* 3. LINKED RAW MATERIALS (FOR THIS ITEM ONLY) */}
                      <div className="space-y-1.5 my-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                            <span>Linked Raw Materials (for this item):</span>
                          </span>
                        </div>

                        {dishRecipes.length === 0 ? (
                          <div className="text-[11px] text-slate-400 italic py-1">
                            No raw materials linked. Go to Setting tab to configure.
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {dishRecipes.map((r, rIdx) => {
                              const rm = rawMaterials.find((m) => String(m.id) === String(r.rawMaterialId));
                              const rmName = r.rawMaterialName || rm?.name || 'Raw Material';
                              const currentStockVal = r.currentStock !== undefined && r.currentStock !== null
                                ? r.currentStock
                                : 10;
                              const unit = r.unit || rm?.unit || 'Kg';
                              const isRmOut = parseFloat(currentStockVal) <= 0;

                              return (
                                <div
                                  key={`dish-rm-rem-${dish.id}-${r.id || rIdx}`}
                                  className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs flex flex-col space-y-1.5"
                                >
                                  {/* Row 1: Name and Stock */}
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-black text-slate-800 truncate block max-w-[130px]" title={rmName}>
                                        {rmName}
                                      </span>
                                      <span className="text-[9px] font-semibold text-slate-400">
                                        ({r.qtyRequired} {unit} per {baseQty} {dishUnit})
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className={`text-sm font-black ${isRmOut ? 'text-rose-600' : 'text-emerald-700'}`}>
                                        {currentStockVal} {unit}
                                      </span>
                                      <span className="text-[9px] text-slate-400 block font-bold">remaining</span>
                                    </div>
                                  </div>

                                  {/* Row 2: Increase and Set Buttons for this Raw Material */}
                                  <div className="flex items-center space-x-1 pt-1 border-t border-slate-200/60">
                                    <button
                                      type="button"
                                      onClick={() => setAdjustingRawMaterial({
                                        recipe: r,
                                        rawMaterial: rm,
                                        dish,
                                        mode: 'set',
                                        value: String(currentStockVal)
                                      })}
                                      className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-extrabold text-[10px] py-1 rounded-md transition-colors cursor-pointer flex items-center justify-center space-x-0.5"
                                      title={`Set exact stock for ${rmName}`}
                                    >
                                      <Edit3 className="w-2.5 h-2.5 text-slate-400" />
                                      <span>Set</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setAdjustingRawMaterial({
                                        recipe: r,
                                        rawMaterial: rm,
                                        dish,
                                        mode: 'add',
                                        value: '1'
                                      })}
                                      className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] py-1 rounded-md transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                                      title={`Increase stock for ${rmName}`}
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                      <span>+ Increase Stock</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Link to Setting */}
                    <div className="pt-2 border-t border-slate-100 mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDishSetting(dish)}
                        className="text-[11px] font-bold text-slate-500 hover:text-blue-600 cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Edit Recipe Setting</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DISH MEASUREMENT & RECIPE SETTING (SETTING TAB ONLY)             */}
      {/* ========================================================================= */}
      {editingDishSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Measurement &amp; Recipe Settings
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    #{editingDishSettings.srNo || editingDishSettings.id} - {editingDishSettings.name} {editingDishSettings.marathiName ? `(${editingDishSettings.marathiName})` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingDishSettings(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Select Dish Unit */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                1. Select Food Item Unit (पदार्थाचे युनिट निवडा) *
              </label>
              <div className="grid grid-cols-3 gap-2">
                
                {/* kg */}
                <button
                  type="button"
                  onClick={() => setSelectedUnit('kg')}
                  className={`p-3 rounded-2xl border-2 font-black text-xs flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    selectedUnit === 'kg'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Scale className="w-5 h-5 text-blue-600" />
                  <span>kg (किलो)</span>
                  <span className="text-[9px] font-semibold text-slate-400">Sweets, Farsan</span>
                </button>

                {/* litre */}
                <button
                  type="button"
                  onClick={() => setSelectedUnit('litre')}
                  className={`p-3 rounded-2xl border-2 font-black text-xs flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    selectedUnit === 'litre'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Droplet className="w-5 h-5 text-cyan-600" />
                  <span>litre (लिटर)</span>
                  <span className="text-[9px] font-semibold text-slate-400">Tea, Coffee, Milk</span>
                </button>

                {/* per plate */}
                <button
                  type="button"
                  onClick={() => setSelectedUnit('per plate')}
                  className={`p-3 rounded-2xl border-2 font-black text-xs flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    selectedUnit === 'per plate'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Disc className="w-5 h-5 text-emerald-600" />
                  <span>per plate (प्लेट)</span>
                  <span className="text-[9px] font-semibold text-slate-400">Meals, Snacks, Dosa</span>
                </button>
              </div>
            </div>

            {/* Step 2: Set Measurement Base Quantity */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                2. Measurement Base Quantity (प्रमाण नग / वजन) *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  placeholder="e.g. 1"
                  value={tempBaseQty}
                  onChange={(e) => setTempBaseQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-black text-xs text-slate-700 whitespace-nowrap">
                  {selectedUnit}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Define the portion size (e.g. <strong>1 kg</strong>). When <strong>1 kg</strong> of this item is sold in billing, the raw materials configured below are deducted.
              </p>
            </div>

            {/* Step 3: Raw Materials Required for this Base Quantity */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    3. Raw Materials per {tempBaseQty || '1'} {selectedUnit} (कच्चा माल प्रमाण)
                  </label>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Set required ingredient quantities and initial stock for this item.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRecipeRow}
                  className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black hover:bg-blue-100 cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Material</span>
                </button>
              </div>

              {/* Rows List */}
              <div className="space-y-2.5">
                {recipeRows.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500 font-semibold">
                    No raw materials added yet. Click "+ Add Material" above to define ingredients.
                  </div>
                ) : (
                  recipeRows.map((row, idx) => (
                    <div
                      key={`recipe-row-${idx}`}
                      className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        {/* Raw Material Custom Name (No dropdown, user types any raw material) */}
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase block">
                            Raw Material *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter raw material name (e.g. Sugar, Kaju, Milk)"
                            value={row.rawMaterialName}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateRecipeRow(idx, 'rawMaterialName', val);
                            }}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        {/* Quantity required for this batch */}
                        <div className="w-24">
                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">
                            Qty required *
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            placeholder="e.g. 0.5"
                            value={row.qtyRequired}
                            onChange={(e) => handleUpdateRecipeRow(idx, 'qtyRequired', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-black text-slate-900 outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        {/* Unit */}
                        <div className="w-20">
                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">
                            Unit
                          </label>
                          <select
                            value={row.unit}
                            onChange={(e) => handleUpdateRecipeRow(idx, 'unit', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-900 outline-none"
                          >
                            <option value="Kg">Kg</option>
                            <option value="gm">gm</option>
                            <option value="litre">litre</option>
                            <option value="ml">ml</option>
                          </select>
                        </div>

                        {/* Delete Row Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipeRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer mt-3"
                          title="Remove ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Initial Stock for this item */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                        <span className="text-[10px] font-bold text-slate-500">
                          Initial Stock for this item ({row.unit || 'Kg'}):
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="e.g. 10"
                          value={row.currentStock || ''}
                          onChange={(e) => handleUpdateRecipeRow(idx, 'currentStock', e.target.value)}
                          className="w-28 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-black text-emerald-700 outline-none focus:ring-1 focus:ring-emerald-600 text-right"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingDishSettings(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDishSettings}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-2xl cursor-pointer transition-all shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Measurement Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADJUST DISH STOCK (REMAINING TAB)                                */}
      {/* ========================================================================= */}
      {adjustingDish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  {adjustingDish.mode === 'add' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    {adjustingDish.mode === 'add' ? '+ Increase Item Stock' : 'Set Item Stock'}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {adjustingDish.dish.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdjustingDish(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAdjustingDish((prev) => ({ ...prev, mode: 'set', value: String(prev.dish.stockQty || 0) }))}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  adjustingDish.mode === 'set' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Set Exact Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustingDish((prev) => ({ ...prev, mode: 'add', value: '1' }))}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  adjustingDish.mode === 'add' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                + Increase Stock
              </button>
            </div>

            <div className="space-y-3">
              {/* Current Stock Banner */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Current Remaining Stock:</span>
                <span className="font-black text-sm text-slate-900">
                  {adjustingDish.dish.stockQty || 0} {adjustingDish.dish.stockUnit || (adjustingDish.dish.pricePerKg ? 'kg' : 'plates')}
                </span>
              </div>

              {/* Input Value */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  {adjustingDish.mode === 'add' ? 'Quantity to Add' : 'New Exact Remaining Quantity'} ({adjustingDish.dish.stockUnit || (adjustingDish.dish.pricePerKg ? 'kg' : 'plates')}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  autoFocus
                  placeholder="e.g. 1"
                  value={adjustingDish.value}
                  onChange={(e) => setAdjustingDish((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Quick Presets for adding */}
              {adjustingDish.mode === 'add' && (
                <div className="flex items-center space-x-1.5">
                  {[0.5, 1, 2, 5, 10].map((preset) => (
                    <button
                      key={`preset-dish-${preset}`}
                      type="button"
                      onClick={() => setAdjustingDish((prev) => ({ ...prev, value: String(preset) }))}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAdjustingDish(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDishStockAdjustment}
                disabled={adjustingDish.value === '' || isNaN(parseFloat(adjustingDish.value))}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-emerald-600/30"
              >
                {adjustingDish.mode === 'add' ? 'Confirm Add' : 'Confirm Set'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADJUST RAW MATERIAL STOCK (REMAINING TAB - FOR THIS ITEM ONLY)    */}
      {/* ========================================================================= */}
      {adjustingRawMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  {adjustingRawMaterial.mode === 'add' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    {adjustingRawMaterial.mode === 'add' ? '+ Increase Raw Material' : 'Set Raw Material Stock'}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {adjustingRawMaterial.recipe?.rawMaterialName || adjustingRawMaterial.rawMaterial?.name || 'Material'} • {adjustingRawMaterial.dish?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdjustingRawMaterial(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAdjustingRawMaterial((prev) => ({
                  ...prev,
                  mode: 'set',
                  value: String(prev.recipe?.currentStock !== undefined && prev.recipe?.currentStock !== null ? prev.recipe.currentStock : 10)
                }))}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  adjustingRawMaterial.mode === 'set' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Set Exact Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustingRawMaterial((prev) => ({ ...prev, mode: 'add', value: '1' }))}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  adjustingRawMaterial.mode === 'add' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                + Increase Stock
              </button>
            </div>

            <div className="space-y-3">
              {/* Current Stock Banner */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Current Stock for this item:</span>
                <span className="font-black text-sm text-slate-900">
                  {adjustingRawMaterial.recipe?.currentStock !== undefined && adjustingRawMaterial.recipe?.currentStock !== null
                    ? adjustingRawMaterial.recipe.currentStock
                    : 10} {adjustingRawMaterial.recipe?.unit || 'Kg'}
                </span>
              </div>

              {/* Input Value */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  {adjustingRawMaterial.mode === 'add' ? 'Quantity to Add' : 'New Exact Remaining Quantity'} ({adjustingRawMaterial.recipe?.unit || 'Kg'}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  autoFocus
                  placeholder="e.g. 1"
                  value={adjustingRawMaterial.value}
                  onChange={(e) => setAdjustingRawMaterial((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Quick Presets for adding */}
              {adjustingRawMaterial.mode === 'add' && (
                <div className="flex items-center space-x-1.5">
                  {[0.2, 0.5, 1, 2, 5].map((preset) => (
                    <button
                      key={`preset-rm-${preset}`}
                      type="button"
                      onClick={() => setAdjustingRawMaterial((prev) => ({ ...prev, value: String(preset) }))}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAdjustingRawMaterial(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRawMaterialStockAdjustment}
                disabled={adjustingRawMaterial.value === '' || isNaN(parseFloat(adjustingRawMaterial.value))}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-emerald-600/30"
              >
                {adjustingRawMaterial.mode === 'add' ? 'Confirm Add' : 'Confirm Set'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
