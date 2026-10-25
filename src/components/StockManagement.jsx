import React, { useState, useMemo, useEffect } from 'react';
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
  Edit3,
  ArrowDownCircle,
  Archive,
  Boxes,
  FileText,
  Calendar,
  Lock,
  PlusCircle,
  RotateCcw,
  Edit2,
  Info,
  History,
  Sparkles
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
  onDeleteDishRecipe,
  onUpdateDish,
  onSyncCache
}) {
  // Option 2 (Raw Material-Wise): 'raw_inward' (1. आलेला कच्चा माल) | 'raw_remaining' (2. शिल्लक कच्चा माल) | 'recipes' (3. रेसिपी / डिश मॅपिंग)
  const [activeStockSubTab, setActiveStockSubTab] = useState('raw_inward');

  // Recipe Mapping Sub-Tab State
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState('all');
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState('');
  const [modalDishCategoryFilter, setModalDishCategoryFilter] = useState('all');
  const [modalDishSearchQuery, setModalDishSearchQuery] = useState('');
  const [recipeBaseQty, setRecipeBaseQty] = useState('1');
  const [recipeBaseUnit, setRecipeBaseUnit] = useState('Kg');
  const [recipeTableBaseQty, setRecipeTableBaseQty] = useState('1');
  const [recipeTableBaseUnit, setRecipeTableBaseUnit] = useState('Plate');
  const [recipeIngredients, setRecipeIngredients] = useState([
    { id: 'ing-init-1', rawMaterialId: '', qtyRequired: '1', tableQtyRequired: '' }
  ]);

  // Raw Material Only Mode State & Modals
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [rawStatusFilter, setRawStatusFilter] = useState('all'); // 'all' | 'in' | 'low' | 'out'

  // Modals for Raw Material Only Mode:
  // 1. Add / Edit Raw Material modal
  const [editingRawMaterialModal, setEditingRawMaterialModal] = useState(null); // null | { isNew: true } | rm object
  const [rawMatFormName, setRawMatFormName] = useState('');
  const [rawMatFormUnit, setRawMatFormUnit] = useState('Kg');
  const [rawMatFormInitialInward, setRawMatFormInitialInward] = useState('');
  const [rawMatFormMinThreshold, setRawMatFormMinThreshold] = useState('2');

  // 2. Add Inward Stock Modal (enter how much raw material has come)
  const [inwardStockModal, setInwardStockModal] = useState(null); // null | rm object
  const [inwardAddQty, setInwardAddQty] = useState('');

  // 3. Adjust / Add Remaining Raw Material Stock Modal (where user sees available quantity clearly)
  const [remainingRawModal, setRemainingRawModal] = useState(null); // null | { rm, mode: 'set' | 'add', value: string }
  // 4. View All Remaining Logs Modal for Raw Material
  const [viewLogsModal, setViewLogsModal] = useState(null); // null | { rm, logs }
  // 5. Confirm Reset All Stock to 0 Modal
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  // Helper: Format log date and time
  const formatLogTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${datePart}, ${timePart}`;
    } catch {
      return '';
    }
  };

  // Show Toast Notification Helper
  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Edit/Add Raw Material Modal Helper
  const handleOpenRawMaterialModal = (rm = null) => {
    if (rm) {
      setEditingRawMaterialModal(rm);
      setRawMatFormName(rm.name || '');
      setRawMatFormUnit(rm.unit || 'Kg');
      setRawMatFormInitialInward(String(rm.inwardQty !== undefined && rm.inwardQty !== null ? rm.inwardQty : rm.quantity || 0));
      setRawMatFormMinThreshold(String(rm.minThreshold !== undefined && rm.minThreshold !== null ? rm.minThreshold : 2));
    } else {
      setEditingRawMaterialModal({ isNew: true });
      setRawMatFormName('');
      setRawMatFormUnit('Kg');
      setRawMatFormInitialInward('');
      setRawMatFormMinThreshold('2');
    }
  };

  // Save Raw Material Definition (New / Edit)
  const handleSaveRawMaterialEntity = async () => {
    const cleanName = rawMatFormName.trim();
    if (!cleanName) {
      showToast('Please enter a raw material name', 'error');
      return;
    }
    const initialInward = parseFloat(rawMatFormInitialInward) || 0;
    const minThreshold = parseFloat(rawMatFormMinThreshold) || 2;

    try {
      if (editingRawMaterialModal?.id) {
        // Edit existing
        const curInward = parseFloat(editingRawMaterialModal.inwardQty !== undefined && editingRawMaterialModal.inwardQty !== null ? editingRawMaterialModal.inwardQty : editingRawMaterialModal.quantity) || 0;
        const curRemaining = parseFloat(editingRawMaterialModal.remainingQty) || 0;
        const finalInward = Math.max(curInward, initialInward);
        const finalAvailable = Math.max(0, Math.round((finalInward - curRemaining) * 1000) / 1000);
        const updated = {
          ...editingRawMaterialModal,
          name: cleanName,
          unit: rawMatFormUnit,
          minThreshold: minThreshold,
          inwardQty: finalInward,
          remainingQty: curRemaining,
          quantity: finalAvailable
        };
        if (typeof onUpdateRawMaterial === 'function') {
          await onUpdateRawMaterial(editingRawMaterialModal.id, updated);
        } else {
          await db.rawMaterials.update(editingRawMaterialModal.id, updated);
        }
        showToast(`✓ Updated raw material "${cleanName}"`);
      } else {
        // Add new
        const newRm = {
          name: cleanName,
          unit: rawMatFormUnit,
          inwardQty: Math.max(0, initialInward),
          remainingQty: 0,
          quantity: Math.max(0, initialInward),
          minThreshold: minThreshold,
          createdAt: new Date().toISOString()
        };
        if (typeof onAddRawMaterial === 'function') {
          await onAddRawMaterial(newRm);
        } else {
          await db.rawMaterials.add(newRm);
        }
        showToast(`✓ Created new raw material "${cleanName}" with ${initialInward} ${rawMatFormUnit} inward stock!`);
      }

      if (typeof onSyncCache === 'function') onSyncCache();
      setEditingRawMaterialModal(null);
    } catch (err) {
      console.error('Error saving raw material entity:', err);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Delete Raw Material Entity
  const handleDeleteRawMaterialEntity = async (rm) => {
    if (!window.confirm(`Are you sure you want to delete raw material "${rm.name}"?`)) return;
    try {
      if (typeof onDeleteRawMaterial === 'function') {
        await onDeleteRawMaterial(rm.id);
      } else {
        await db.rawMaterials.delete(rm.id);
      }
      if (typeof onSyncCache === 'function') onSyncCache();
      showToast(`✓ Deleted raw material "${rm.name}"`);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Save Incoming Inward Stock Entry (User enters how much raw material has come into stock)
  const handleSaveInwardStock = async () => {
    if (!inwardStockModal) return;
    const incoming = parseFloat(inwardAddQty);
    if (isNaN(incoming) || incoming <= 0) {
      showToast('Please enter a valid incoming quantity greater than 0', 'error');
      return;
    }

    try {
      const curInward = parseFloat(inwardStockModal.inwardQty !== undefined && inwardStockModal.inwardQty !== null ? inwardStockModal.inwardQty : (inwardStockModal.quantity || 0)) || 0;
      const curRemaining = parseFloat(inwardStockModal.remainingQty) || 0;

      const newInward = Math.round((curInward + incoming) * 1000) / 1000;
      // Core Logic: (inward raw item - remaining raw item = available raw item)
      const newAvailable = Math.max(0, Math.round((newInward - curRemaining) * 1000) / 1000);

      const updated = {
        ...inwardStockModal,
        inwardQty: newInward,
        remainingQty: curRemaining,
        quantity: newAvailable,
        lastInwardDate: new Date().toISOString()
      };

      if (typeof onUpdateRawMaterial === 'function') {
        await onUpdateRawMaterial(inwardStockModal.id, updated);
      } else {
        await db.rawMaterials.update(inwardStockModal.id, updated);
      }

      if (typeof onSyncCache === 'function') onSyncCache();
      showToast(`✓ Added +${incoming} ${inwardStockModal.unit || 'Kg'} incoming stock for "${inwardStockModal.name}". Available: ${newAvailable} ${inwardStockModal.unit || 'Kg'}`);
      setInwardStockModal(null);
      setInwardAddQty('');
    } catch (err) {
      console.error('Error saving inward raw material:', err);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Save Remaining Raw Material Stock (When user enters remaining stock in remaining tab)
  // Core Logic: (inward raw item - remaining raw item = available raw item)
  const handleSaveRemainingRawStock = async () => {
    if (!remainingRawModal) return;
    const { rm, mode, value } = remainingRawModal;
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 0) {
      showToast('Please enter a valid non-negative quantity', 'error');
      return;
    }

    try {
      const curInward = parseFloat(rm.inwardQty !== undefined && rm.inwardQty !== null ? rm.inwardQty : (rm.quantity || 0)) || 0;
      const curRemaining = parseFloat(rm.remainingQty) || 0;

      const newRemaining = mode === 'add'
        ? Math.round((curRemaining + numVal) * 1000) / 1000
        : Math.round(numVal * 1000) / 1000;

      // Core Logic: (inward raw item - remaining raw item = available raw item / used)
      const newAvailable = Math.max(0, Math.round((curInward - newRemaining) * 1000) / 1000);

      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        remainingQty: newRemaining,
        usedQty: newAvailable,
        mode: mode,
        amountEntered: numVal,
        unit: rm.unit || 'Kg'
      };

      const existingLogs = Array.isArray(rm.remainingLogs) ? rm.remainingLogs : [];
      const updatedLogs = [newLog, ...existingLogs].slice(0, 20);

      const updated = {
        ...rm,
        inwardQty: curInward,
        remainingQty: newRemaining,
        quantity: newAvailable,
        remainingLogs: updatedLogs,
        lastRemainingDate: new Date().toISOString()
      };

      if (typeof onUpdateRawMaterial === 'function') {
        await onUpdateRawMaterial(rm.id, updated);
      } else {
        await db.rawMaterials.update(rm.id, updated);
      }

      if (typeof onSyncCache === 'function') onSyncCache();
      showToast(`✓ Remaining stock for "${rm.name}" recorded as ${newRemaining} ${rm.unit || 'Kg'}. Available: ${newAvailable} ${rm.unit || 'Kg'}`);
      setRemainingRawModal(null);
    } catch (err) {
      console.error('Error saving remaining raw material:', err);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Reset all raw material stocks to 0 (quantity: 0, inwardQty: 0, remainingQty: 0)
  const handleResetAllStockToZero = async () => {
    try {
      if (!rawMaterials || rawMaterials.length === 0) {
        showToast('No raw materials found to reset', 'info');
        setShowResetConfirmModal(false);
        return;
      }

      for (const rm of rawMaterials) {
        const updated = {
          ...rm,
          quantity: 0,
          inwardQty: 0,
          remainingQty: 0
        };

        if (typeof onUpdateRawMaterial === 'function') {
          await onUpdateRawMaterial(rm.id, updated);
        } else {
          await db.rawMaterials.update(rm.id, updated);
        }
      }

      if (typeof onSyncCache === 'function') onSyncCache();
      showToast(`✓ All raw material stock quantities have been reset to 0 (${rawMaterials.length} materials)`);
      setShowResetConfirmModal(false);
    } catch (err) {
      console.error('Error resetting all raw material stocks:', err);
      showToast(`Error: ${err.message}`, 'error');
      setShowResetConfirmModal(false);
    }
  };



  // =========================================================================
  // RECIPE MAPPING HELPERS & HANDLERS
  // =========================================================================
  // Helper: check if dish is sweet item
  const isDishSweetItem = (dish) => {
    if (!dish) return false;
    return Boolean(
      dish.hasMultiplePrices ||
      dish.categoryId === 2 ||
      (dish.categoryName && dish.categoryName.toLowerCase().includes('sweet')) ||
      (dish.counter && dish.counter.toLowerCase().includes('sweet')) ||
      (dish.unit && (dish.unit.toLowerCase().includes('kg') || dish.unit.toLowerCase().includes('g'))) ||
      (dish.name && (dish.name.toLowerCase().includes('(by kg)') || dish.name.toLowerCase().includes('/kg') || dish.name.toLowerCase().includes(' kg')))
    );
  };

  const groupedRecipes = useMemo(() => {
    const groups = {};
    for (const r of recipes || []) {
      if (!r || !r.dishId) continue;
      const key = String(r.dishId);
      if (!groups[key]) {
        const dish = (dishes || []).find((d) => d && String(d.id) === key);
        const cat = (categories || []).find((c) => c && c.id === dish?.categoryId);
        const isSweet = isDishSweetItem(dish);
        groups[key] = {
          dishId: r.dishId,
          dishName: r.dishName || dish?.name || `Dish #${r.dishId}`,
          marathiName: dish?.marathiName || '',
          categoryId: dish?.categoryId || 1,
          categoryName: cat?.name || '',
          baseQty: r.baseQty || 1,
          unit: r.unit || (isSweet ? 'Kg' : 'Plate'),
          tableBaseQty: r.tableBaseQty !== undefined && r.tableBaseQty !== null ? r.tableBaseQty : (isSweet ? 1 : null),
          tableUnit: r.tableUnit || (isSweet ? 'Plate' : null),
          isSweet: isSweet,
          ingredients: []
        };
      }
      const rm = (rawMaterials || []).find((m) => m && String(m.id) === String(r.rawMaterialId));
      groups[key].ingredients.push({
        ...r,
        rawMaterialId: r.rawMaterialId,
        rawMaterialName: r.rawMaterialName || rm?.name || `Material #${r.rawMaterialId}`,
        rawMaterialUnit: rm?.unit || r.unit || 'Kg',
        qtyRequired: parseFloat(r.qtyRequired) || 0,
        tableQtyRequired: (r.tableQtyRequired !== undefined && r.tableQtyRequired !== null && r.tableQtyRequired !== '')
          ? parseFloat(r.tableQtyRequired)
          : null
      });
    }
    return Object.values(groups);
  }, [recipes, dishes, categories, rawMaterials]);

  const filteredRecipes = useMemo(() => {
    let list = groupedRecipes;
    if (recipeCategoryFilter === 'sweet') {
      list = list.filter((gr) => gr.isSweet);
    } else if (recipeCategoryFilter === 'kitchen') {
      list = list.filter((gr) => !gr.isSweet);
    } else if (recipeCategoryFilter !== 'all') {
      list = list.filter((gr) => String(gr.categoryId) === String(recipeCategoryFilter));
    }
    if (recipeSearchQuery.trim()) {
      const q = recipeSearchQuery.toLowerCase().trim();
      list = list.filter((gr) =>
        gr.dishName.toLowerCase().includes(q) ||
        (gr.marathiName && gr.marathiName.toLowerCase().includes(q)) ||
        gr.ingredients.some((ing) => (ing.rawMaterialName || '').toLowerCase().includes(q))
      );
    }
    return list;
  }, [groupedRecipes, recipeCategoryFilter, recipeSearchQuery]);

  const handleOpenRecipeModal = (group = null) => {
    setModalDishCategoryFilter('all');
    setModalDishSearchQuery('');
    if (group) {
      const dish = (dishes || []).find((d) => String(d.id) === String(group.dishId));
      const isSweet = isDishSweetItem(dish) || group.isSweet;

      setSelectedDishId(String(group.dishId));
      setRecipeBaseQty(String(group.baseQty || 1));
      setRecipeBaseUnit(group.unit || (isSweet ? 'Kg' : 'Plate'));
      setRecipeTableBaseQty(String(group.tableBaseQty || 1));
      setRecipeTableBaseUnit(group.tableUnit || 'Plate');
      setRecipeIngredients(
        (group.ingredients || []).map((ing, idx) => ({
          id: `ing-${Date.now()}-${idx}`,
          rawMaterialId: String(ing.rawMaterialId || ''),
          qtyRequired: String(ing.qtyRequired || 1),
          tableQtyRequired: ing.tableQtyRequired !== undefined && ing.tableQtyRequired !== null ? String(ing.tableQtyRequired) : (isSweet ? '0.1' : '')
        }))
      );
    } else {
      const mappedDishIds = new Set((recipes || []).map((r) => r && String(r.dishId)));
      const unmapped = (dishes || []).find((d) => !mappedDishIds.has(String(d.id))) || dishes[0];
      const initialDishId = unmapped ? String(unmapped.id) : (dishes[0] ? String(dishes[0].id) : '');
      const isSweet = isDishSweetItem(unmapped);

      setSelectedDishId(initialDishId);
      setRecipeBaseQty('1');
      setRecipeBaseUnit(isSweet ? 'Kg' : 'Plate');
      setRecipeTableBaseQty('1');
      setRecipeTableBaseUnit('Plate');
      setRecipeIngredients([
        {
          id: `ing-${Date.now()}-0`,
          rawMaterialId: rawMaterials[0] ? String(rawMaterials[0].id) : '',
          qtyRequired: '1',
          tableQtyRequired: isSweet ? '0.1' : ''
        }
      ]);
    }
    setRecipeModalOpen(true);
  };

  const handleSelectDishChange = (dishId) => {
    setSelectedDishId(dishId);
    const dish = (dishes || []).find((d) => String(d.id) === String(dishId));
    const isSweet = isDishSweetItem(dish);
    const existing = groupedRecipes.find((g) => String(g.dishId) === String(dishId));

    if (existing) {
      setRecipeBaseQty(String(existing.baseQty || 1));
      setRecipeBaseUnit(existing.unit || (isSweet ? 'Kg' : 'Plate'));
      setRecipeTableBaseQty(String(existing.tableBaseQty || 1));
      setRecipeTableBaseUnit(existing.tableUnit || 'Plate');
      setRecipeIngredients(
        (existing.ingredients || []).map((ing, idx) => ({
          id: `ing-${Date.now()}-${idx}`,
          rawMaterialId: String(ing.rawMaterialId || ''),
          qtyRequired: String(ing.qtyRequired || 1),
          tableQtyRequired: ing.tableQtyRequired !== undefined && ing.tableQtyRequired !== null ? String(ing.tableQtyRequired) : (isSweet ? '0.1' : '')
        }))
      );
    } else {
      setRecipeBaseQty('1');
      setRecipeBaseUnit(isSweet ? 'Kg' : 'Plate');
      setRecipeTableBaseQty('1');
      setRecipeTableBaseUnit('Plate');
      setRecipeIngredients((prev) =>
        prev.map((i) => ({
          ...i,
          tableQtyRequired: isSweet && (!i.tableQtyRequired || i.tableQtyRequired === '') ? '0.1' : i.tableQtyRequired
        }))
      );
    }
  };

  const handleAddIngredientRow = () => {
    const usedRmIds = new Set(recipeIngredients.map((i) => String(i.rawMaterialId)));
    const unusedRm = (rawMaterials || []).find((m) => !usedRmIds.has(String(m.id))) || rawMaterials[0];
    const dish = (dishes || []).find((d) => String(d.id) === String(selectedDishId));
    const isSweet = isDishSweetItem(dish);

    setRecipeIngredients((prev) => [
      ...prev,
      {
        id: `ing-${Date.now()}-${prev.length}`,
        rawMaterialId: unusedRm ? String(unusedRm.id) : '',
        qtyRequired: '1',
        tableQtyRequired: isSweet ? '0.1' : ''
      }
    ]);
  };

  const handleRemoveIngredientRow = (ingId) => {
    if (recipeIngredients.length <= 1) {
      showToast('At least one raw material ingredient is required', 'error');
      return;
    }
    setRecipeIngredients((prev) => prev.filter((i) => i.id !== ingId));
  };

  const handleUpdateIngredient = (ingId, field, value) => {
    setRecipeIngredients((prev) => prev.map((i) => i.id === ingId ? { ...i, [field]: value } : i));
  };

  const handleSaveRecipeMappingEntity = async () => {
    if (!selectedDishId) {
      showToast('Please select a dish', 'error');
      return;
    }
    const baseQty = parseFloat(recipeBaseQty);
    if (isNaN(baseQty) || baseQty <= 0) {
      showToast('Please enter a valid base quantity greater than 0', 'error');
      return;
    }

    const dish = (dishes || []).find((d) => String(d.id) === String(selectedDishId));
    const isSweet = isDishSweetItem(dish);

    if (isSweet) {
      const tableBaseQtyNum = parseFloat(recipeTableBaseQty);
      if (isNaN(tableBaseQtyNum) || tableBaseQtyNum <= 0) {
        showToast('Please enter a valid table plate base quantity (e.g. 1 Plate)', 'error');
        return;
      }
    }

    const validIngredients = recipeIngredients.filter((i) => i.rawMaterialId && parseFloat(i.qtyRequired) > 0);
    if (validIngredients.length === 0) {
      showToast('Please add at least one raw material with a valid quantity', 'error');
      return;
    }

    const seenRms = new Set();
    for (const ing of validIngredients) {
      if (seenRms.has(ing.rawMaterialId)) {
        showToast('Duplicate raw material selected. Please combine them into one row.', 'error');
        return;
      }
      seenRms.add(ing.rawMaterialId);
    }

    const dishName = dish?.name || `Dish #${selectedDishId}`;
    const tableBaseQtyVal = isSweet ? (parseFloat(recipeTableBaseQty) || 1) : null;
    const tableUnitVal = isSweet ? recipeTableBaseUnit : null;

    const payload = {
      dishId: selectedDishId,
      dishName: dishName,
      baseQty: baseQty,
      unit: recipeBaseUnit,
      tableBaseQty: tableBaseQtyVal,
      tableUnit: tableUnitVal,
      ingredients: validIngredients.map((ing) => {
        const rm = (rawMaterials || []).find((m) => String(m.id) === String(ing.rawMaterialId));
        return {
          rawMaterialId: ing.rawMaterialId,
          rawMaterialName: rm ? rm.name : '',
          qtyRequired: parseFloat(ing.qtyRequired) || 0,
          tableQtyRequired: isSweet
            ? (ing.tableQtyRequired !== undefined && ing.tableQtyRequired !== '' && !isNaN(parseFloat(ing.tableQtyRequired))
                ? parseFloat(ing.tableQtyRequired)
                : null)
            : null
        };
      })
    };

    try {
      if (typeof onSaveRecipeMapping === 'function') {
        await onSaveRecipeMapping(payload);
      } else {
        const existingForDish = (recipes || []).filter((r) => r && String(r.dishId) === String(selectedDishId));
        for (const r of existingForDish) {
          try { await db.recipes.delete(r.id); } catch (e) {}
        }
        for (const ing of payload.ingredients) {
          await db.recipes.add({
            dishId: selectedDishId,
            dishName: dishName,
            baseQty: baseQty,
            unit: recipeBaseUnit,
            tableBaseQty: payload.tableBaseQty,
            tableUnit: payload.tableUnit,
            rawMaterialId: ing.rawMaterialId,
            rawMaterialName: ing.rawMaterialName,
            qtyRequired: ing.qtyRequired,
            tableQtyRequired: ing.tableQtyRequired
          });
        }
      }

      if (typeof onSyncCache === 'function') onSyncCache();
      showToast(`✓ Recipe mapping saved for "${dishName}"!`);
      setRecipeModalOpen(false);
    } catch (err) {
      console.error('Error saving recipe mapping:', err);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteRecipeMappingEntity = async (dishId, dishName) => {
    if (!window.confirm(`Are you sure you want to delete the recipe mapping for "${dishName}"?`)) return;
    try {
      if (typeof onDeleteDishRecipe === 'function') {
        await onDeleteDishRecipe(dishId);
      } else {
        const existingForDish = (recipes || []).filter((r) => r && String(r.dishId) === String(dishId));
        for (const r of existingForDish) {
          try { await db.recipes.delete(r.id); } catch (e) {}
        }
      }
      if (typeof onSyncCache === 'function') onSyncCache();
      showToast(`✓ Deleted recipe mapping for "${dishName}"`);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Filter Raw Materials for Raw Material-Wise Mode
  const filteredRawMaterials = useMemo(() => {
    return (rawMaterials || []).filter((rm) => {
      if (!rm) return false;
      if (rawSearchQuery.trim()) {
        const q = rawSearchQuery.toLowerCase().trim();
        const matchesName = (rm.name || '').toLowerCase().includes(q);
        const matchesMarathi = (rm.marathiName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesMarathi) return false;
      }
      const qty = parseFloat(rm.quantity !== undefined && rm.quantity !== null ? rm.quantity : (rm.inwardQty || 0)) || 0;
      const min = parseFloat(rm.minThreshold) || 2;
      if (rawStatusFilter === 'in' && qty <= min) return false;
      if (rawStatusFilter === 'low' && (qty <= 0 || qty > min)) return false;
      if (rawStatusFilter === 'out' && qty > 0) return false;
      return true;
    });
  }, [rawMaterials, rawSearchQuery, rawStatusFilter]);



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
          <div className="flex items-center space-x-2.5">
            <div className="p-2 text-white rounded-xl shadow-md bg-emerald-600 shadow-emerald-600/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Stock Master (कच्चा माल व्यवस्थापन)
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300">
                  📦 Raw Material-Wise
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-1">
                1. Inward: Record incoming raw materials • 2. Remaining: See available quantities • 3. Recipe: Auto-reduce raw materials on dish sale
              </p>
            </div>
          </div>
        </div>

        {/* 3 Master Sub-Tabs Switcher */}
        <div className="flex items-center space-x-2 bg-white border border-slate-300 rounded-2xl p-1.5 shadow-sm mr-12">
          <button
            onClick={() => setActiveStockSubTab('raw_inward')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center space-x-2 ${
              activeStockSubTab === 'raw_inward'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>1. Inward Stock (आलेला कच्चा माल)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeStockSubTab === 'raw_inward' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {rawMaterials.length} Items
            </span>
          </button>

          <button
            onClick={() => setActiveStockSubTab('raw_remaining')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center space-x-2 ${
              activeStockSubTab === 'raw_remaining'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>2. Remaining Stock (शिल्लक कच्चा माल)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeStockSubTab === 'raw_remaining' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {rawMaterials.filter((m) => (parseFloat(m.quantity) || 0) > 0).length} In Stock
            </span>
          </button>

          <button
            onClick={() => setActiveStockSubTab('recipes')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center space-x-2 ${
              activeStockSubTab === 'recipes'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-102'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>3. Recipe Mapping (रेसिपी / डिश मॅपिंग)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeStockSubTab === 'recipes' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {groupedRecipes.length} Recipes
            </span>
          </button>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* RAW MATERIAL-WISE STOCK: TOOLBAR, INWARD & REMAINING SUB-TABS             */}
      {/* ========================================================================= */}
        <div className="space-y-4">
          
          {/* Raw Materials Toolbar: Search, Status Filter & Add Raw Material */}
          {/* Raw Materials / Recipes Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {activeStockSubTab === 'recipes' ? (
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Box for Recipes */}
                <div className="relative min-w-[240px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dish or ingredient in recipes..."
                    value={recipeSearchQuery}
                    onChange={(e) => setRecipeSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  {recipeSearchQuery && (
                    <button
                      onClick={() => setRecipeSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter for Recipes */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-black">
                  <button
                    type="button"
                    onClick={() => setRecipeCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      recipeCategoryFilter === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({groupedRecipes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipeCategoryFilter('2')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      recipeCategoryFilter === '2' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Sweets (मिठाई)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipeCategoryFilter('1')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      recipeCategoryFilter === '1' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Breakfast (नाश्ता)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Box */}
                <div className="relative min-w-[220px] max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search raw material name..."
                    value={rawSearchQuery}
                    onChange={(e) => setRawSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  {rawSearchQuery && (
                    <button
                      onClick={() => setRawSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-black">
                  <button
                    type="button"
                    onClick={() => setRawStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      rawStatusFilter === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({rawMaterials.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawStatusFilter('in')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      rawStatusFilter === 'in' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawStatusFilter('low')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      rawStatusFilter === 'low' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Low Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawStatusFilter('out')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      rawStatusFilter === 'out' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions: Inward actions vs Recipe actions */}
            {activeStockSubTab === 'raw_inward' && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs hover:scale-102"
                  title="Reset all stock quantities to 0"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Reset All Stock (सर्व साठा ० करा)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenRawMaterialModal(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center space-x-1.5 hover:scale-102"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Raw Material (नवीन कच्चा माल)</span>
                </button>
              </div>
            )}

            {activeStockSubTab === 'recipes' && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleOpenRecipeModal(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-1.5 hover:scale-102"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Recipe Mapping (नवीन रेसिपी जोडा)</span>
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SUB-TAB 1: INWARD STOCK (आलेला कच्चा माल)                                */}
          {/* ========================================================================= */}
          {activeStockSubTab === 'raw_inward' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Guide Banner */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 shadow-md flex items-start space-x-3.5 border border-blue-700/50">
                <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl mt-0.5">
                  <ArrowDownCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    Step 1: Inward Stock Entry (आलेला कच्चा माल नोंदणी)
                  </h3>
                  <p className="text-xs text-blue-200 font-semibold mt-0.5 leading-relaxed">
                    First enter how much raw material has come into the kitchen / store. Click <strong>"+ Record Inward Stock"</strong> on any material below to record incoming supplies.
                  </p>
                </div>
              </div>

              {/* Stat Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Total Materials
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {rawMaterials.length}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">Configured Types</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    In Stock Items
                  </span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">
                    {rawMaterials.filter(m => (parseFloat(m.quantity) || 0) > (parseFloat(m.minThreshold) || 2)).length}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Ready to Use</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Low Stock Alerts
                  </span>
                  <span className="text-2xl font-black text-amber-500 mt-1 block">
                    {rawMaterials.filter(m => {
                      const q = parseFloat(m.quantity) || 0;
                      const min = parseFloat(m.minThreshold) || 2;
                      return q > 0 && q <= min;
                    }).length}
                  </span>
                  <span className="text-[11px] text-amber-700 font-semibold">Needs Refill</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Out of Stock
                  </span>
                  <span className="text-2xl font-black text-rose-600 mt-1 block">
                    {rawMaterials.filter(m => (parseFloat(m.quantity) || 0) <= 0).length}
                  </span>
                  <span className="text-[11px] text-rose-700 font-semibold">0 Available</span>
                </div>
              </div>

              {/* Raw Materials Inward Cards Grid */}
              {filteredRawMaterials.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-black text-sm text-slate-800">No Raw Materials Found</h4>
                  <p className="text-xs text-slate-500 font-semibold">
                    Click "+ Add New Raw Material" above to add your first kitchen item.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenRawMaterialModal(null)}
                    className="px-4 py-2 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    + Add New Raw Material
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredRawMaterials.map((rm) => {
                    const inwardQty = parseFloat(rm.inwardQty !== undefined && rm.inwardQty !== null ? rm.inwardQty : (rm.quantity || 0)) || 0;
                    const remainingQty = parseFloat(rm.remainingQty !== undefined && rm.remainingQty !== null ? rm.remainingQty : 0) || 0;
                    // Available quantity: uses rm.quantity which auto-decrements on sales, or (inwardQty - remainingQty)
                    const availableQty = (rm.quantity !== undefined && rm.quantity !== null)
                      ? Math.round(parseFloat(rm.quantity) * 1000) / 1000
                      : Math.max(0, Math.round((inwardQty - remainingQty) * 1000) / 1000);
                    const minThreshold = parseFloat(rm.minThreshold) || 2;
                    const isOut = availableQty <= 0;
                    const isLow = availableQty <= minThreshold && !isOut;

                    return (
                      <div
                        key={`rm-inward-${rm.id}`}
                        className="bg-white border-2 border-slate-200 hover:border-blue-400 rounded-3xl p-4 shadow-xs transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Top Row: Unit & Status */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              {rm.unit || 'Kg'}
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

                          {/* Raw Material Name */}
                          <h4 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                            {rm.name}
                          </h4>
                          {rm.marathiName && (
                            <p className="text-xs font-bold text-slate-500 mt-0.5">{rm.marathiName}</p>
                          )}

                          {/* Inward & Available Metrics Box */}
                          <div className="bg-slate-50 rounded-2xl p-3 my-3 border border-slate-200 space-y-1.5">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-bold text-slate-500">
                                Total Inward (आलेला माल):
                              </span>
                              <div className="text-right">
                                <span className="text-base font-black text-indigo-700">
                                  {inwardQty}
                                </span>
                                <span className="text-xs font-extrabold text-slate-500 ml-1">
                                  {rm.unit || 'Kg'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                              <span className="text-xs font-black text-slate-700">
                                Available Stock (उपलब्ध साठा):
                              </span>
                              <div className="text-right">
                                <span className={`text-base font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}`}>
                                  {availableQty} {rm.unit || 'Kg'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                            <span>Min Alert Limit:</span>
                            <span className="font-bold text-slate-600">{minThreshold} {rm.unit || 'Kg'}</span>
                          </div>
                        </div>

                        {/* Card Actions: Record Inward & Edit/Delete */}
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setInwardStockModal(rm);
                              setInwardAddQty('');
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/20"
                          >
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                            <span>+ Record Inward Stock (आलेला माल भरा)</span>
                          </button>

                          <div className="flex items-center space-x-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenRawMaterialModal(rm)}
                              className="flex-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <Edit2 className="w-3 h-3 text-slate-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRawMaterialEntity(rm)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete raw material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 2: REMAINING STOCK (शिल्लक कच्चा माल)                              */}
          {/* ========================================================================= */}
          {activeStockSubTab === 'raw_remaining' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Guide Banner */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 shadow-md flex items-start space-x-3.5 border border-emerald-700/50">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl mt-0.5">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    Step 2: Remaining Raw Material Stock (शिल्लक कच्चा माल व्यवस्थापन)
                  </h3>
                  <p className="text-xs text-emerald-200 font-semibold mt-0.5 leading-relaxed">
                    View the available quantity of each raw material. When you enter remaining stock, the available quantity is calculated as: <strong>Inward Raw Item - Remaining Raw Item = Available Raw Item</strong>.
                  </p>
                </div>
              </div>

              {/* Raw Materials Remaining Cards Grid */}
              {filteredRawMaterials.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-black text-sm text-slate-800">No Raw Materials Found</h4>
                  <p className="text-xs text-slate-500 font-semibold">
                    Go to the Inward Stock tab to record incoming stock or add raw materials.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredRawMaterials.map((rm) => {
                    const inwardQty = parseFloat(rm.inwardQty !== undefined && rm.inwardQty !== null ? rm.inwardQty : (rm.quantity || 0)) || 0;
                    const remainingQty = parseFloat(rm.remainingQty !== undefined && rm.remainingQty !== null ? rm.remainingQty : 0) || 0;
                    // Available quantity: uses rm.quantity which auto-decrements on sales, or (inwardQty - remainingQty)
                    const availableQty = (rm.quantity !== undefined && rm.quantity !== null)
                      ? Math.round(parseFloat(rm.quantity) * 1000) / 1000
                      : Math.max(0, Math.round((inwardQty - remainingQty) * 1000) / 1000);
                    const minThreshold = parseFloat(rm.minThreshold) || 2;
                    const isOut = availableQty <= 0;
                    const isLow = availableQty <= minThreshold && !isOut;

                    return (
                      <div
                        key={`rm-rem-${rm.id}`}
                        className={`bg-white border-2 rounded-3xl p-4 shadow-xs flex flex-col justify-between transition-all ${
                          isOut
                            ? 'border-rose-300 bg-rose-50/10'
                            : isLow
                            ? 'border-amber-300 bg-amber-50/10'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div>
                          {/* Top Row: Unit & Status (No # number) */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              {rm.unit || 'Kg'}
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

                          {/* Material Name */}
                          <h4 className="font-black text-sm text-slate-900">
                            {rm.name}
                          </h4>
                          {rm.marathiName && (
                            <p className="text-xs font-bold text-slate-500 mt-0.5">{rm.marathiName}</p>
                          )}

                          {/* AVAILABLE QUANTITY HERO BOX */}
                          <div className="bg-slate-50 rounded-2xl p-3 my-2.5 border border-slate-200 space-y-2">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-bold text-slate-600">
                                Available Stock (उपलब्ध साठा):
                              </span>
                              <div className="text-right">
                                <span className={`text-2xl font-black ${
                                  isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                                }`}>
                                  {availableQty}
                                </span>
                                <span className="text-xs font-extrabold text-slate-500 ml-1">
                                  {rm.unit || 'Kg'}
                                </span>
                              </div>
                            </div>

                            {/* Two Buttons: Set Remaining & + Add Remaining */}
                            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200">
                              <button
                                type="button"
                                onClick={() => setRemainingRawModal({ rm, mode: 'set', value: String(remainingQty) })}
                                className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-black text-xs py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1"
                                title="Set exact remaining stock"
                              >
                                <Edit3 className="w-3 h-3 text-slate-500" />
                                <span>Set Remaining</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setRemainingRawModal({ rm, mode: 'add', value: '1' })}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                                title="Add to remaining stock"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Add Remaining</span>
                              </button>
                            </div>
                          </div>

                          {/* Remaining Logs / History of Used & Remaining Entries */}
                          {(() => {
                            const logsToDisplay = Array.isArray(rm.remainingLogs) && rm.remainingLogs.length > 0
                              ? rm.remainingLogs
                              : (rm.remainingQty !== undefined && rm.remainingQty !== null && rm.lastRemainingDate)
                                ? [{
                                    id: 'initial',
                                    date: rm.lastRemainingDate,
                                    remainingQty: rm.remainingQty,
                                    usedQty: availableQty,
                                    mode: 'set',
                                    amountEntered: rm.remainingQty,
                                    unit: rm.unit || 'Kg'
                                  }]
                                : [];

                            return (
                              <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-black text-slate-700 border-b border-slate-200/70 pb-1">
                                  <span className="flex items-center space-x-1 text-slate-800">
                                    <History className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Remaining Logs (नोंद इतिहास)</span>
                                  </span>
                                  {logsToDisplay.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setViewLogsModal({ rm, logs: logsToDisplay })}
                                      className="text-[10px] text-blue-600 hover:text-blue-800 font-extrabold cursor-pointer hover:underline"
                                    >
                                      {logsToDisplay.length > 2 ? `All (${logsToDisplay.length})` : 'Details'}
                                    </button>
                                  )}
                                </div>

                                {logsToDisplay.length === 0 ? (
                                  <div className="py-2 text-center text-[10px] text-slate-400 font-bold flex items-center justify-center space-x-1">
                                    <span>No remaining logs recorded yet</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                                    {logsToDisplay.slice(0, 2).map((log, lIdx) => (
                                      <div
                                        key={`log-${rm.id}-${lIdx}`}
                                        className="flex items-center justify-between text-[10px] py-0.5 border-b border-slate-100 last:border-0"
                                      >
                                        <div>
                                          <span className="font-black text-amber-800">
                                            {log.remainingQty} {rm.unit || 'Kg'} Rem.
                                          </span>
                                          <span className="text-slate-300 mx-1">•</span>
                                          <span className="font-bold text-emerald-700">
                                            Avail: {log.usedQty !== undefined ? log.usedQty : Math.max(0, inwardQty - log.remainingQty)} {rm.unit || 'Kg'}
                                          </span>
                                        </div>
                                        <span className="text-slate-400 font-mono text-[9px]">
                                          {formatLogTime(log.date || log.timestamp)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Bottom Link to Inward */}
                        <div className="pt-2 border-t border-slate-100 mt-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStockSubTab('raw_inward');
                              setInwardStockModal(rm);
                              setInwardAddQty('');
                            }}
                            className="text-[11px] font-bold text-slate-500 hover:text-blue-600 cursor-pointer inline-flex items-center space-x-1"
                          >
                            <ArrowDownCircle className="w-3 h-3" />
                            <span>Go to Inward Stock</span>
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
          {/* SUB-TAB 3: RECIPE MAPPING (रेसिपी / डिश मॅपिंग)                            */}
          {/* ========================================================================= */}
          {activeStockSubTab === 'recipes' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Guide Banner */}
              <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-2xl p-4 shadow-md flex items-start space-x-3.5 border border-indigo-700/50">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl mt-0.5">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    Step 3: Dish &amp; Raw Material Recipe Mapping (रेसिपी मॅपिंग - विक्रीवर आपोआप साठा कमी करा)
                  </h3>
                  <p className="text-xs text-indigo-200 font-semibold mt-0.5 leading-relaxed">
                    Select a dish with base quantity (e.g. 1 Kg Gulab Jamun or 1 Plate Puri Bhaji), and add raw materials with required deduction quantities using the <strong>+</strong> button.
                    Whenever a bill is settled at POS, raw material stock will <strong>automatically reduce in real-time</strong> proportional to the sold quantity.
                  </p>
                </div>
              </div>

              {/* Stat Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Mapped Dishes
                  </span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 block">
                    {groupedRecipes.length}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">Configured Recipes</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Sweets Recipes
                  </span>
                  <span className="text-2xl font-black text-rose-600 mt-1 block">
                    {groupedRecipes.filter((g) => g.categoryId === 2 || g.unit === 'Kg').length}
                  </span>
                  <span className="text-[11px] text-rose-700 font-semibold">Kg / Grams Based</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Kitchen &amp; Meals
                  </span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">
                    {groupedRecipes.filter((g) => g.categoryId !== 2 && g.unit !== 'Kg').length}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Portion / Plate Based</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Linked Raw Materials
                  </span>
                  <span className="text-2xl font-black text-amber-600 mt-1 block">
                    {new Set((recipes || []).map((r) => r && String(r.rawMaterialId))).size}
                  </span>
                  <span className="text-[11px] text-amber-700 font-semibold">Active Ingredients</span>
                </div>
              </div>

              {/* Theme Filter & Search Bar */}
              {(() => {
                const mappedDishIds = new Set((recipes || []).map((r) => r && String(r.dishId)));
                const unmappedDishes = (dishes || []).filter((d) => d && !mappedDishIds.has(String(d.id)));

                return (
                  <div className="space-y-3">
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                      
                      {/* Theme Filter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRecipeCategoryFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                            recipeCategoryFilter === 'all'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>सर्व (All Recipes)</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                            recipeCategoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {groupedRecipes.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRecipeCategoryFilter('sweet')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                            recipeCategoryFilter === 'sweet'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs shadow-amber-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          <span>🍬 मिठाई (Sweets)</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                            recipeCategoryFilter === 'sweet' ? 'bg-black/20 text-white' : 'bg-amber-200 text-amber-900'
                          }`}>
                            {groupedRecipes.filter((g) => g.isSweet).length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRecipeCategoryFilter('kitchen')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                            recipeCategoryFilter === 'kitchen'
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs shadow-emerald-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          <span>🍳 नाश्ता / किचन (Kitchen)</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                            recipeCategoryFilter === 'kitchen' ? 'bg-black/20 text-white' : 'bg-emerald-200 text-emerald-900'
                          }`}>
                            {groupedRecipes.filter((g) => !g.isSweet).length}
                          </span>
                        </button>
                      </div>

                      {/* Search Bar & Action Buttons */}
                      <div className="flex items-center space-x-2 flex-1 sm:max-w-md ml-auto">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={recipeSearchQuery}
                            onChange={(e) => setRecipeSearchQuery(e.target.value)}
                            placeholder="डिश किंवा कच्चा माल शोधा (Search...)"
                            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                          />
                          {recipeSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setRecipeSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenRecipeModal(null)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-200 cursor-pointer flex items-center space-x-1.5 whitespace-nowrap transition active:scale-98"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>+ Map Recipe</span>
                        </button>
                      </div>

                    </div>

                    {/* Themed Unmapped Items Banner */}
                    {unmappedDishes.length > 0 && (
                      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-base">💡</span>
                          <div>
                            <span className="font-black text-amber-950">
                              {unmappedDishes.length} डिशेस मॅपिंग बाकी आहेत ({unmappedDishes.length} menu items unmapped)
                            </span>
                            <span className="text-[11px] text-amber-800 font-medium block">
                              उदा. {unmappedDishes.slice(0, 3).map((d) => d.name).join(', ')}{unmappedDishes.length > 3 ? '...' : ''}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (unmappedDishes[0]) {
                              handleOpenRecipeModal(null);
                              setSelectedDishId(String(unmappedDishes[0].id));
                            } else {
                              handleOpenRecipeModal(null);
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
                        >
                          Map Next Dish →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Recipe Cards Grid */}
              {filteredRecipes.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-3">
                  <ChefHat className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-black text-sm text-slate-800">No Recipe Mappings Found</h4>
                  <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
                    Click "+ Map Recipe" above to map your dish (e.g. Gulab Jamun 1 Kg to Sugar 1 Kg &amp; Mawa 0.5 Kg) for automatic stock decrement on sales.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenRecipeModal(null)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    + Create Recipe Mapping
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {filteredRecipes.map((gr) => {
                    const isSweet = Boolean(gr.isSweet || gr.categoryId === 2 || gr.unit === 'Kg' || (gr.tableBaseQty && gr.tableUnit));
                    
                    const cardTheme = isSweet ? {
                      wrapper: 'bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-yellow-50/80 border-2 border-amber-300 hover:border-amber-500 shadow-amber-100/50 hover:shadow-md',
                      badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-600 shadow-2xs',
                      title: 'text-amber-950 group-hover:text-amber-800',
                      subTitle: 'text-amber-800/80',
                      deductionBox: 'bg-white/90 border border-amber-200/90 shadow-2xs',
                      ingRow: 'bg-amber-50/70 border border-amber-200/60 text-amber-950',
                      ruleBox: 'bg-amber-100/80 border border-amber-200 text-amber-950',
                      editBtn: 'bg-amber-100/90 hover:bg-amber-200 text-amber-900 border border-amber-300'
                    } : {
                      wrapper: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-slate-50 border-2 border-emerald-300 hover:border-emerald-500 shadow-emerald-100/50 hover:shadow-md',
                      badge: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-700 shadow-2xs',
                      title: 'text-emerald-950 group-hover:text-emerald-800',
                      subTitle: 'text-emerald-800/80',
                      deductionBox: 'bg-white/90 border border-emerald-200/90 shadow-2xs',
                      ingRow: 'bg-emerald-50/70 border border-emerald-200/60 text-emerald-950',
                      ruleBox: 'bg-emerald-100/80 border border-emerald-200 text-emerald-950',
                      editBtn: 'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                    };

                    return (
                      <div
                        key={`recipe-group-${gr.dishId}`}
                        className={`rounded-3xl p-4 shadow-xs transition-all flex flex-col justify-between group ${cardTheme.wrapper}`}
                      >
                        <div>
                          {/* Top Row: Category badge & Base portion */}
                          <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg ${cardTheme.badge}`}>
                              {isSweet ? '🍬 मिठाई / Sweets' : (gr.categoryName ? `🍳 ${gr.categoryName}` : '🍳 Kitchen Dish')}
                            </span>
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200" title="Parcel Base">
                                पार्सल: {gr.baseQty} {gr.unit}
                              </span>
                              {isSweet && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200" title="Table Base">
                                  टेबल: {gr.tableBaseQty || 1} {gr.tableUnit || 'Plate'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Dish Name */}
                          <h4 className={`font-black text-base transition-colors ${cardTheme.title}`}>
                            {gr.dishName}
                          </h4>
                          {gr.marathiName && (
                            <p className={`text-xs font-bold mt-0.5 ${cardTheme.subTitle}`}>{gr.marathiName}</p>
                          )}

                          {/* Ingredients Deduction List */}
                          <div className={`rounded-2xl p-3 my-3 border space-y-2 ${cardTheme.deductionBox}`}>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                              <span>Raw Materials ({gr.ingredients.length}):</span>
                              <span className="font-mono">{isSweet ? 'Parcel vs Table' : `Per ${gr.baseQty} ${gr.unit}`}</span>
                            </div>
                            <div className="space-y-1.5">
                              {gr.ingredients.map((ing, idx) => (
                                <div
                                  key={`ing-row-${gr.dishId}-${idx}`}
                                  className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl border shadow-2xs ${cardTheme.ingRow}`}
                                >
                                  <div className="flex items-center space-x-1.5">
                                    <span className={isSweet ? 'text-amber-600 font-black' : 'text-emerald-600 font-black'}>•</span>
                                    <span className="font-extrabold text-slate-800">
                                      {ing.rawMaterialName}
                                    </span>
                                  </div>
                                  <div className="text-right flex items-center space-x-2">
                                    <div>
                                      <span className="text-[9px] text-indigo-600 font-bold block">पार्सल ({gr.baseQty} {gr.unit}):</span>
                                      <span className="font-black text-rose-600">
                                        -{ing.qtyRequired} <span className="text-[10px] font-bold text-slate-500">{ing.rawMaterialUnit}</span>
                                      </span>
                                    </div>
                                    {isSweet && ing.tableQtyRequired !== undefined && ing.tableQtyRequired !== null && (
                                      <div className="border-l border-slate-300 pl-2">
                                        <span className="text-[9px] text-emerald-700 font-bold block">टेबल ({gr.tableBaseQty || 1} {gr.tableUnit || 'Plate'}):</span>
                                        <span className="font-black text-emerald-600">
                                          -{ing.tableQtyRequired} <span className="text-[10px] font-bold text-slate-500">{ing.rawMaterialUnit}</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Automatic Formula Note */}
                          <div className={`p-2.5 rounded-xl border text-[10px] space-y-0.5 ${cardTheme.ruleBox}`}>
                            <span className="font-black block">⚡ Auto Decrement Rule:</span>
                            {isSweet ? (
                              <p className="font-medium">
                                पार्सल/काउंटर: १ किलो / ५०० ग्रॅम / २५० ग्रॅम वजनानुसार कमी • टेबल: १ प्लेट विक्रीवर टेबल बेस प्रमाणात कमी!
                              </p>
                            ) : (
                              <p className="font-medium">
                                Selling N plates automatically reduces N × recipe quantity
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Bottom Actions: Edit & Delete */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/80 mt-3">
                          <button
                            type="button"
                            onClick={() => handleOpenRecipeModal(gr)}
                            className={`font-black text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 ${cardTheme.editBtn}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Recipe</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRecipeMappingEntity(gr.dishId, gr.dishName)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

      {/* ========================================================================= */}
      {/* MODAL 4: INWARD RAW MATERIAL STOCK (नोंदवा आलेला कच्चा माल)                */}
      {/* ========================================================================= */}
      {inwardStockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ArrowDownCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    + Inward Stock / आलेला माल
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {inwardStockModal.name} ({inwardStockModal.unit || 'Kg'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInwardStockModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Current Overview Banner */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Total Inward:</span>
                  <span className="font-black text-slate-800">
                    {inwardStockModal.inwardQty !== undefined && inwardStockModal.inwardQty !== null ? inwardStockModal.inwardQty : (inwardStockModal.quantity || 0)} {inwardStockModal.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Remaining Stock:</span>
                  <span className="font-black text-amber-700">
                    {inwardStockModal.remainingQty || 0} {inwardStockModal.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Available:</span>
                  <span className="font-black text-emerald-700">
                    {inwardStockModal.quantity !== undefined && inwardStockModal.quantity !== null ? inwardStockModal.quantity : 0} {inwardStockModal.unit}
                  </span>
                </div>
              </div>

              {/* Input for Incoming Stock */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  How much stock has arrived? / किती माल आला? ({inwardStockModal.unit || 'Kg'}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  autoFocus
                  placeholder="e.g. 5 or 10"
                  value={inwardAddQty}
                  onChange={(e) => setInwardAddQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-base font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center space-x-1.5">
                {[1, 2, 5, 10, 25].map((preset) => (
                  <button
                    key={`inward-preset-${preset}`}
                    type="button"
                    onClick={() => setInwardAddQty(String(preset))}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              {/* Preview calculation */}
              {inwardAddQty && !isNaN(parseFloat(inwardAddQty)) && parseFloat(inwardAddQty) > 0 && (
                (() => {
                  const incoming = parseFloat(inwardAddQty) || 0;
                  const curInward = parseFloat(inwardStockModal.inwardQty !== undefined && inwardStockModal.inwardQty !== null ? inwardStockModal.inwardQty : (inwardStockModal.quantity || 0)) || 0;
                  const curRemaining = parseFloat(inwardStockModal.remainingQty) || 0;
                  const newInward = Math.round((curInward + incoming) * 1000) / 1000;
                  const newAvailable = Math.max(0, Math.round((newInward - curRemaining) * 1000) / 1000);

                  return (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold space-y-1">
                      <div className="flex justify-between">
                        <span>New Total Inward:</span>
                        <span className="font-black">{newInward} {inwardStockModal.unit}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-black text-sm">
                        <span>New Available Stock:</span>
                        <span className="text-emerald-700 font-black">{newAvailable} {inwardStockModal.unit}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 text-right">
                        ({newInward} Inward - {curRemaining} Remaining = {newAvailable} Available)
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setInwardStockModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInwardStock}
                disabled={inwardAddQty === '' || isNaN(parseFloat(inwardAddQty)) || parseFloat(inwardAddQty) <= 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-emerald-600/30"
              >
                Confirm Inward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADJUST / ADD REMAINING RAW STOCK (शिल्लक कच्चा माल नोंदवा)         */}
      {/* ========================================================================= */}
      {remainingRawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  {remainingRawModal.mode === 'add' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    {remainingRawModal.mode === 'add' ? '+ Add to Remaining' : 'Update Remaining Stock'}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {remainingRawModal.rm.name} ({remainingRawModal.rm.unit || 'Kg'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRemainingRawModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRemainingRawModal((prev) => ({
                  ...prev,
                  mode: 'set',
                  value: String(prev.rm.remainingQty !== undefined && prev.rm.remainingQty !== null ? prev.rm.remainingQty : 0)
                }))}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  remainingRawModal.mode === 'set' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Set Remaining (शिल्लक नोंदवा)
              </button>
              <button
                type="button"
                onClick={() => setRemainingRawModal((prev) => ({ ...prev, mode: 'add', value: '1' }))}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  remainingRawModal.mode === 'add' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                + Add Remaining (शिल्लक वाढवा)
              </button>
            </div>

            <div className="space-y-3">
              {/* CURRENT OVERVIEW HERO BANNER */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-blue-200/60">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                      Current Available Stock / उपलब्ध साठा
                    </span>
                    <span className="text-2xl font-black text-blue-950">
                      {remainingRawModal.rm.quantity !== undefined && remainingRawModal.rm.quantity !== null ? remainingRawModal.rm.quantity : 0}
                      <span className="text-xs font-bold text-blue-600 ml-1">{remainingRawModal.rm.unit}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 block">Remaining Recorded:</span>
                    <span className="text-sm font-black text-amber-700">
                      {remainingRawModal.rm.remainingQty || 0} {remainingRawModal.rm.unit}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 block mt-0.5">Available Stock:</span>
                    <span className="text-xs font-black text-emerald-700">
                      {remainingRawModal.rm.quantity !== undefined && remainingRawModal.rm.quantity !== null ? remainingRawModal.rm.quantity : 0} {remainingRawModal.rm.unit}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-extrabold text-blue-800 flex items-center justify-between">
                  <span>Current Status:</span>
                  <span className="font-mono">{remainingRawModal.rm.remainingQty || 0} Remaining • {remainingRawModal.rm.quantity || 0} Available</span>
                </div>
              </div>

              {/* Input Value */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  {remainingRawModal.mode === 'add' ? 'Quantity to Add to Remaining Stock' : 'Set Exact Remaining Stock Quantity'} ({remainingRawModal.rm.unit || 'Kg'}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  autoFocus
                  placeholder="e.g. 5"
                  value={remainingRawModal.value}
                  onChange={(e) => setRemainingRawModal((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-base font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center space-x-1.5">
                {[0.5, 1, 2, 5, 10].map((preset) => (
                  <button
                    key={`rem-preset-${preset}`}
                    type="button"
                    onClick={() => {
                      if (remainingRawModal.mode === 'add') {
                        setRemainingRawModal((prev) => ({ ...prev, value: String(preset) }));
                      } else {
                        const cur = parseFloat(remainingRawModal.value) || 0;
                        setRemainingRawModal((prev) => ({ ...prev, value: String(cur + preset) }));
                      }
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              {/* Live Preview */}
              {remainingRawModal.value !== '' && !isNaN(parseFloat(remainingRawModal.value)) && (
                (() => {
                  const val = parseFloat(remainingRawModal.value) || 0;
                  const curInward = parseFloat(remainingRawModal.rm.inwardQty !== undefined && remainingRawModal.rm.inwardQty !== null ? remainingRawModal.rm.inwardQty : (remainingRawModal.rm.quantity || 0)) || 0;
                  const curRemaining = parseFloat(remainingRawModal.rm.remainingQty) || 0;
                  const targetRemaining = remainingRawModal.mode === 'add'
                    ? Math.round((curRemaining + val) * 1000) / 1000
                    : Math.round(val * 1000) / 1000;
                  const calcAvailable = Math.max(0, Math.round((curInward - targetRemaining) * 1000) / 1000);

                  return (
                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 font-bold space-y-1">
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>New Remaining Stock:</span>
                        <span className="font-bold text-amber-700">{targetRemaining} {remainingRawModal.rm.unit}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-blue-200/60 font-black text-sm">
                        <span>Available Stock (उपलब्ध साठा):</span>
                        <span className="text-emerald-700 font-black text-base">
                          {calcAvailable} {remainingRawModal.rm.unit}
                        </span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRemainingRawModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRemainingRawStock}
                disabled={remainingRawModal.value === '' || isNaN(parseFloat(remainingRawModal.value))}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-blue-600/30"
              >
                {remainingRawModal.mode === 'add' ? 'Confirm Add' : 'Confirm Set'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CREATE / EDIT RAW MATERIAL MASTER RECORD                         */}
      {/* ========================================================================= */}
      {editingRawMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  {editingRawMaterialModal.isNew ? <PlusCircle className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    {editingRawMaterialModal.isNew ? 'Add Raw Material / नवीन कच्चा माल' : 'Edit Raw Material / दुरुस्त करा'}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {editingRawMaterialModal.isNew ? 'Define new raw ingredient' : editingRawMaterialModal.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRawMaterialModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Raw Material Name / नाव *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. साखर (Sugar), तेल (Oil), मैदा (Maida)..."
                  value={rawMatFormName}
                  onChange={(e) => setRawMatFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    Measurement Unit / एकक *
                  </label>
                  <select
                    value={rawMatFormUnit}
                    onChange={(e) => setRawMatFormUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                  >
                    <option value="Kg">Kg (किलो)</option>
                    <option value="Gm">Gm (ग्रॅम)</option>
                    <option value="Liter">Liter (लिटर)</option>
                    <option value="Ml">Ml (मिली)</option>
                    <option value="Pcs">Pcs (नग)</option>
                    <option value="Packet">Packet (पाकीट)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                    Low Stock Alert / अलर्ट मर्यादा
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 2"
                    value={rawMatFormMinThreshold}
                    onChange={(e) => setRawMatFormMinThreshold(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  {editingRawMaterialModal.isNew ? 'Initial Inward / आलेला माल' : 'Current Inward Recorded'} ({rawMatFormUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={rawMatFormInitialInward}
                  onChange={(e) => setRawMatFormInitialInward(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                  {editingRawMaterialModal.isNew
                    ? 'Initial inward quantity will be set as starting available stock.'
                    : 'Records total raw material received.'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingRawMaterialModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRawMaterialEntity}
                disabled={!rawMatFormName.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-indigo-600/30"
              >
                {editingRawMaterialModal.isNew ? 'Add Raw Material' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: VIEW ALL REMAINING LOGS HISTORY                                  */}
      {/* ========================================================================= */}
      {viewLogsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Remaining Logs / शिल्लक नोंद इतिहास
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {viewLogsModal.rm.name} {viewLogsModal.rm.marathiName ? `(${viewLogsModal.rm.marathiName})` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewLogsModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {viewLogsModal.logs.map((log, idx) => (
                <div
                  key={`full-log-${idx}`}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    {log.mode === 'sale_deduct' ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-rose-700 text-sm bg-rose-100/80 px-2 py-0.5 rounded-lg border border-rose-200">
                            -{log.amountEntered} {viewLogsModal.rm.unit || 'Kg'} Sold
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 font-black text-indigo-800">
                            POS Sale
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-800 mt-1">
                          Dish: <span className="text-slate-900 font-black">{log.dishName}</span> {log.soldAmount ? `(${log.soldAmount} sold)` : ''}
                        </div>
                        <div className="text-[10px] font-extrabold text-emerald-700">
                          Stock Left: {log.remainingQty} {viewLogsModal.rm.unit || 'Kg'} {log.invoiceNo ? `• Bill #${log.invoiceNo}` : ''}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-amber-800 text-sm">
                            {log.remainingQty} {viewLogsModal.rm.unit || 'Kg'} Remaining
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 font-bold text-slate-700">
                            {log.mode === 'add' ? `Added +${log.amountEntered}` : 'Set'}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                          Available Stock: {log.usedQty !== undefined ? log.usedQty : '—'} {viewLogsModal.rm.unit || 'Kg'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    {formatLogTime(log.date || log.timestamp)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewLogsModal(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: CREATE / EDIT RECIPE MAPPING MODAL                                */}
      {/* ========================================================================= */}
      {recipeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          {(() => {
            const currentDish = (dishes || []).find((d) => String(d.id) === String(selectedDishId));
            const isSweetDish = isDishSweetItem(currentDish);

            const modalFilteredDishes = (dishes || []).filter((d) => {
              if (!d) return false;
              const isSw = isDishSweetItem(d);
              if (modalDishCategoryFilter === 'sweet' && !isSw) return false;
              if (modalDishCategoryFilter === 'kitchen' && isSw) return false;
              if (modalDishSearchQuery.trim()) {
                const q = modalDishSearchQuery.toLowerCase().trim();
                const matchName = (d.name || '').toLowerCase().includes(q);
                const matchMr = (d.marathiName || '').toLowerCase().includes(q);
                const matchSr = String(d.srNo || '').includes(q);
                return matchName || matchMr || matchSr;
              }
              return true;
            });

            const modalTheme = isSweetDish ? {
              header: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white border-amber-500 shadow-md shadow-amber-900/10',
              iconBg: 'bg-amber-400/30 text-amber-100',
              title: '🍬 मिठाई रेसिपी मॅपिंग (Sweets Recipe Mapping)',
              subtitle: 'पार्सलमध्ये किलोने आणि टेबलवर प्लेटने स्वयंचलित साठा कपात',
              badge: 'Dual Base: Kg & Plate',
              cardBg: 'bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-yellow-50/60 border-amber-300',
              saveBtn: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-400/40',
              selectFocus: 'focus:ring-amber-500 border-amber-300 bg-amber-50/40',
              previewBg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-300'
            } : {
              header: 'bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 text-white border-emerald-600 shadow-md shadow-emerald-900/10',
              iconBg: 'bg-emerald-400/30 text-emerald-100',
              title: '🍳 नाश्ता / किचन रेसिपी मॅपिंग (Kitchen Recipe Mapping)',
              subtitle: 'डिश विक्रीवर प्रमाणानुसार कच्चा माल आपोआप कमी करा',
              badge: 'Per Plate Base',
              cardBg: 'bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50/60 border-emerald-300',
              saveBtn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-400/40',
              selectFocus: 'focus:ring-emerald-500 border-emerald-300 bg-emerald-50/40',
              previewBg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 border-emerald-300'
            };

            return (
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
                
                {/* Dynamic Themed Modal Header */}
                <div className={`p-4 flex items-center justify-between border-b ${modalTheme.header}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-2xl ${modalTheme.iconBg}`}>
                      {isSweetDish ? <Sparkles className="w-5 h-5 text-amber-200" /> : <ChefHat className="w-5 h-5 text-emerald-200" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-sm text-white">
                          {modalTheme.title}
                        </h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-black/25 text-white">
                          {modalTheme.badge}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 font-medium">
                        {modalTheme.subtitle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRecipeModalOpen(false)}
                    className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-3">
                  
                  {/* Themed Dish Selection Area */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase">
                        1. Select Menu Dish (डिश निवडा) *
                      </label>
                      
                      {/* Category Theme Quick Chips */}
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setModalDishCategoryFilter('all')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer transition ${
                            modalDishCategoryFilter === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          सर्व ({dishes.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalDishCategoryFilter('sweet')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer transition ${
                            modalDishCategoryFilter === 'sweet'
                              ? 'bg-amber-600 text-white'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          🍬 मिठाई ({dishes.filter(d => isDishSweetItem(d)).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalDishCategoryFilter('kitchen')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer transition ${
                            modalDishCategoryFilter === 'kitchen'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          🍳 नाश्ता ({dishes.filter(d => !isDishSweetItem(d)).length})
                        </button>
                      </div>
                    </div>

                    {/* Dish Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={modalDishSearchQuery}
                        onChange={(e) => setModalDishSearchQuery(e.target.value)}
                        placeholder="डिश शोधा... (उदा. Gulab Jamun, Poha, Misal)"
                        className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                      {modalDishSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setModalDishSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Dropdown Select with Formatted Options */}
                    <select
                      value={selectedDishId}
                      onChange={(e) => handleSelectDishChange(e.target.value)}
                      className={`w-full border-2 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none cursor-pointer transition ${modalTheme.selectFocus}`}
                    >
                      <option value="" disabled>-- Select a Dish ({modalFilteredDishes.length} available) --</option>
                      {modalFilteredDishes.map((d) => {
                        const isSw = isDishSweetItem(d);
                        return (
                          <option key={`opt-dish-${d.id}`} value={String(d.id)}>
                            {d.srNo ? `#${d.srNo} ` : ''}{d.name} {d.marathiName ? `(${d.marathiName})` : ''} — {isSw ? '🍬 मिठाई / Sweets' : '🍳 नाश्ता / Kitchen'}
                          </option>
                        );
                      })}
                    </select>

                    {/* Currently Active Themed Dish Banner */}
                    {currentDish && (
                      <div className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${modalTheme.cardBg}`}>
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xl">{isSweetDish ? '🍬' : '🍳'}</span>
                          <div>
                            <h4 className={`font-black text-sm ${isSweetDish ? 'text-amber-950' : 'text-emerald-950'}`}>
                              {currentDish.srNo ? `#${currentDish.srNo} ` : ''}{currentDish.name}
                            </h4>
                            {currentDish.marathiName && (
                              <p className={`text-xs font-bold ${isSweetDish ? 'text-amber-800' : 'text-emerald-800'}`}>
                                {currentDish.marathiName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border block ${
                            isSweetDish
                              ? 'bg-amber-200/80 text-amber-900 border-amber-300'
                              : 'bg-emerald-200/80 text-emerald-900 border-emerald-300'
                          }`}>
                            {isSweetDish ? 'मिठाई (Sweets Theme)' : 'किचन (Kitchen Theme)'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 mt-0.5 block">
                            {isSweetDish ? 'Parcel vs Table Base' : 'Plate / Portion Base'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Base Quantity and Unit Setters */}
                  {isSweetDish ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-black">
                        <span>🍬 मिठाई आयटम (दोन पद्धतींनी विक्री): पार्सलमध्ये किलोने आणि टेबलवर प्लेटने</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Setter 1: Parcel / Sweets Counter Base (Kg) */}
                        <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-indigo-900 uppercase">
                              1. पार्सल / काउंटर (वजन) *
                            </label>
                            <span className="text-[9px] font-bold bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded">
                              Parcel Base
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={recipeBaseQty}
                              onChange={(e) => setRecipeBaseQty(e.target.value)}
                              placeholder="1"
                              className="w-1/2 bg-white border border-indigo-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 text-center"
                            />
                            <select
                              value={recipeBaseUnit}
                              onChange={(e) => setRecipeBaseUnit(e.target.value)}
                              className="w-1/2 bg-white border border-indigo-300 rounded-xl px-2 py-1.5 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                            >
                              <option value="Kg">Kg (किलो)</option>
                              <option value="Gm">Gm (ग्रॅम)</option>
                            </select>
                          </div>
                          <span className="text-[9px] text-indigo-600 font-bold block">
                            उदा. १ किलो विक्रीसाठी
                          </span>
                        </div>

                        {/* Setter 2: Dining Table Base (Plate) */}
                        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-emerald-900 uppercase">
                              2. डायनिंग टेबल (प्लेट प्रमाण) *
                            </label>
                            <span className="text-[9px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">
                              Table Base
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              step="1"
                              min="1"
                              value={recipeTableBaseQty}
                              onChange={(e) => setRecipeTableBaseQty(e.target.value)}
                              placeholder="1"
                              className="w-1/2 bg-white border border-emerald-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 text-center"
                            />
                            <select
                              value={recipeTableBaseUnit}
                              onChange={(e) => setRecipeTableBaseUnit(e.target.value)}
                              className="w-1/2 bg-white border border-emerald-300 rounded-xl px-2 py-1.5 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                            >
                              <option value="Plate">Plate (प्लेट)</option>
                              <option value="Portion">Portion (पोर्शन)</option>
                              <option value="Pcs">Pcs (नग)</option>
                            </select>
                          </div>
                          <span className="text-[9px] text-emerald-700 font-bold block">
                            उदा. १ प्लेट टेबलवर खाण्यासाठी
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Regular Item Base Setter (Plate, Cup, etc.) */
                    <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200">
                      <div>
                        <label className="text-[10px] font-black text-emerald-900 uppercase block mb-1">
                          Dish Base Quantity (डिशचे प्रमाण) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={recipeBaseQty}
                          onChange={(e) => setRecipeBaseQty(e.target.value)}
                          placeholder="e.g. 1"
                          className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                        <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                          उदा. १ प्लेट किंवा १ कप
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-emerald-900 uppercase block mb-1">
                          Base Unit (एकक) *
                        </label>
                        <select
                          value={recipeBaseUnit}
                          onChange={(e) => setRecipeBaseUnit(e.target.value)}
                          className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                        >
                          <option value="Plate">Plate (प्लेट)</option>
                          <option value="Cup">Cup (कप / वाटी)</option>
                          <option value="Portion">Portion (पोर्शन)</option>
                          <option value="Pcs">Pcs (नग)</option>
                          <option value="Kg">Kg (किलो)</option>
                          <option value="Gm">Gm (ग्रॅम)</option>
                          <option value="Liter">Liter (लिटर)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Raw Materials to Deduct with Dynamic Rows & '+' Button */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                        Raw Materials to Reduce (कमी करावयाचा कच्चा माल) *
                      </label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSweetDish ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {recipeIngredients.length} Ingredients
                      </span>
                    </div>

                    <div className="space-y-2">
                      {recipeIngredients.map((ing, idx) => {
                        const selectedRm = (rawMaterials || []).find((m) => String(m.id) === String(ing.rawMaterialId));
                        const rmUnit = selectedRm?.unit || 'Kg';

                        return (
                          <div
                            key={ing.id || `ing-row-${idx}`}
                            className={`border p-3 rounded-2xl space-y-2 transition-all ${
                              isSweetDish
                                ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                                : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {/* Material Dropdown */}
                              <div className="flex-1">
                                <select
                                  value={ing.rawMaterialId}
                                  onChange={(e) => handleUpdateIngredient(ing.id, 'rawMaterialId', e.target.value)}
                                  className={`w-full bg-white border rounded-xl px-2.5 py-1.5 text-xs font-black text-slate-900 outline-none cursor-pointer transition ${
                                    isSweetDish ? 'border-amber-300 focus:ring-2 focus:ring-amber-500' : 'border-emerald-300 focus:ring-2 focus:ring-emerald-500'
                                  }`}
                                >
                                  <option value="" disabled>-- Select Raw Material --</option>
                                  {(rawMaterials || []).map((rm) => (
                                    <option key={`rm-opt-${rm.id}`} value={String(rm.id)}>
                                      {rm.name} {rm.marathiName ? `(${rm.marathiName})` : ''} ({rm.unit || 'Kg'})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Delete Row Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveIngredientRow(ing.id)}
                                disabled={recipeIngredients.length <= 1}
                                className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Remove this ingredient row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {isSweetDish ? (
                              /* Dual Quantity Inputs for Sweet Item */
                              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60">
                                <div className="flex items-center space-x-1.5 bg-indigo-50/70 p-1.5 rounded-xl border border-indigo-200">
                                  <span className="text-[10px] font-black text-indigo-900 whitespace-nowrap">
                                    पार्सल ({recipeBaseQty} {recipeBaseUnit}):
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0.001"
                                    value={ing.qtyRequired}
                                    onChange={(e) => handleUpdateIngredient(ing.id, 'qtyRequired', e.target.value)}
                                    placeholder="उदा. 1"
                                    className="w-full bg-white border border-indigo-300 rounded-lg px-2 py-1 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 text-center"
                                  />
                                  <span className="text-[10px] font-black text-indigo-800">
                                    {rmUnit}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1.5 bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-200">
                                  <span className="text-[10px] font-black text-emerald-900 whitespace-nowrap">
                                    टेबल ({recipeTableBaseQty} {recipeTableBaseUnit}):
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0.001"
                                    value={ing.tableQtyRequired !== undefined && ing.tableQtyRequired !== null ? ing.tableQtyRequired : ''}
                                    onChange={(e) => handleUpdateIngredient(ing.id, 'tableQtyRequired', e.target.value)}
                                    placeholder="उदा. 0.1"
                                    className="w-full bg-white border border-emerald-300 rounded-lg px-2 py-1 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 text-center"
                                  />
                                  <span className="text-[10px] font-black text-emerald-800">
                                    {rmUnit}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              /* Single Quantity Input for Regular Item */
                              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                                <span className="text-[10px] font-black text-emerald-900">
                                  प्रमाण प्रति {recipeBaseQty} {recipeBaseUnit}:
                                </span>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    step="0.05"
                                    min="0.01"
                                    value={ing.qtyRequired}
                                    onChange={(e) => handleUpdateIngredient(ing.id, 'qtyRequired', e.target.value)}
                                    placeholder="Qty"
                                    className="w-24 bg-white border border-emerald-300 rounded-xl px-2.5 py-1 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 text-center"
                                  />
                                  <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                                    {rmUnit}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* '+' Button to Add More Raw Materials to reduce */}
                    <button
                      type="button"
                      onClick={handleAddIngredientRow}
                      className={`w-full py-2.5 border-2 border-dashed font-black text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs ${
                        isSweetDish
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 hover:border-amber-400'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 hover:border-emerald-400'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Another Raw Material (आणखी कच्चा माल जोडा)</span>
                    </button>
                  </div>

                  {/* Dynamic Live Reduction Example Box */}
                  {(() => {
                    const dishLabel = currentDish?.name || 'Selected Dish';
                    const bQty = parseFloat(recipeBaseQty) || 1;
                    const validIngs = recipeIngredients.filter((i) => i.rawMaterialId && parseFloat(i.qtyRequired) > 0);

                    return (
                      <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${modalTheme.previewBg}`}>
                        <div className={`flex items-center space-x-1.5 font-black ${isSweetDish ? 'text-amber-950' : 'text-emerald-950'}`}>
                          <Sparkles className={`w-4 h-4 ${isSweetDish ? 'text-amber-600' : 'text-emerald-600'}`} />
                          <span>कसा साठा कमी होईल? (Automatic Stock Decrement Preview):</span>
                        </div>

                        {validIngs.length === 0 ? (
                          <p className="text-slate-500 font-medium text-[11px]">
                            Select a dish and add raw materials to see live deduction calculation.
                          </p>
                        ) : (
                          <div className="space-y-1 text-[11px] font-bold text-slate-700">
                            {isSweetDish ? (
                              <>
                                <div className="flex items-center justify-between text-indigo-900 font-extrabold">
                                  <span>• १ किलो विक्रीवर (पार्सल / काउंटर):</span>
                                  <span>
                                    {validIngs.map((i) => {
                                      const rm = (rawMaterials || []).find((m) => String(m.id) === String(i.rawMaterialId));
                                      const deduct = Math.round((1 / bQty) * (parseFloat(i.qtyRequired) || 0) * 1000) / 1000;
                                      return `${rm?.name || 'Item'}: -${deduct} ${rm?.unit || 'Kg'}`;
                                    }).join(', ')}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-blue-800">
                                  <span>• ५०० ग्रॅम विक्रीवर (पार्सल / काउंटर):</span>
                                  <span>
                                    {validIngs.map((i) => {
                                      const rm = (rawMaterials || []).find((m) => String(m.id) === String(i.rawMaterialId));
                                      const deduct = Math.round((0.5 / bQty) * (parseFloat(i.qtyRequired) || 0) * 1000) / 1000;
                                      return `${rm?.name || 'Item'}: -${deduct} ${rm?.unit || 'Kg'}`;
                                    }).join(', ')}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-emerald-800 font-black">
                                  <span>• १ प्लेट विक्रीवर (डायनिंग टेबल):</span>
                                  <span>
                                    {validIngs.map((i) => {
                                      const rm = (rawMaterials || []).find((m) => String(m.id) === String(i.rawMaterialId));
                                      const tDeduct = parseFloat(i.tableQtyRequired) || (Math.round((0.1 / bQty) * (parseFloat(i.qtyRequired) || 0) * 1000) / 1000);
                                      return `${rm?.name || 'Item'}: -${tDeduct} ${rm?.unit || 'Kg'}`;
                                    }).join(', ')}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between text-emerald-950 font-extrabold">
                                  <span>• १ {recipeBaseUnit} विक्रीवर ({dishLabel}):</span>
                                  <span>
                                    {validIngs.map((i) => {
                                      const rm = (rawMaterials || []).find((m) => String(m.id) === String(i.rawMaterialId));
                                      const deduct = Math.round((1 / bQty) * (parseFloat(i.qtyRequired) || 0) * 1000) / 1000;
                                      return `${rm?.name || 'Item'}: -${deduct} ${rm?.unit || 'Kg'}`;
                                    }).join(', ')}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-emerald-800">
                                  <span>• २ {recipeBaseUnit} विक्रीवर:</span>
                                  <span>
                                    {validIngs.map((i) => {
                                      const rm = (rawMaterials || []).find((m) => String(m.id) === String(i.rawMaterialId));
                                      const deduct = Math.round((2 / bQty) * (parseFloat(i.qtyRequired) || 0) * 1000) / 1000;
                                      return `${rm?.name || 'Item'}: -${deduct} ${rm?.unit || 'Kg'}`;
                                    }).join(', ')}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Themed Modal Actions */}
                <div className="flex items-center space-x-2 p-4 border-t border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setRecipeModalOpen(false)}
                    className="flex-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRecipeMappingEntity}
                    disabled={!selectedDishId || recipeIngredients.filter((i) => i.rawMaterialId && parseFloat(i.qtyRequired) > 0).length === 0}
                    className={`flex-1 font-black text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-40 transition-all ${modalTheme.saveBtn}`}
                  >
                    Save Recipe Mapping (रेसिपी सेव्ह करा)
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: CONFIRM RESET ALL RAW MATERIAL STOCKS TO ZERO                    */}
      {/* ========================================================================= */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Reset All Stock to 0? / सर्व साठा ० करायचा का?
                </h3>
                <p className="text-xs text-slate-600 font-semibold mt-1 leading-relaxed">
                  Are you sure you want to reset all raw materials? This action will set <strong>Inward Stock</strong>, <strong>Remaining Stock</strong>, and <strong>Available Stock to 0</strong> for all {rawMaterials.length} materials.
                </p>
                <p className="text-[11px] text-rose-600 font-bold mt-1.5">
                  ⚠️ This cannot be undone. You will need to re-enter incoming raw material stock.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllStockToZero}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-rose-600/30 flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Yes, Reset to 0 (होय, ० करा)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
