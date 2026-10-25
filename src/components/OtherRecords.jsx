import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Edit2, 
  Search, 
  X, 
  Check, 
  Save, 
  ClipboardList, 
  Scale, 
  Milk, 
  Package, 
  Sparkles, 
  RotateCcw,
  Clock,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const STORAGE_KEY = 'karuna_other_records';

const PRESET_NAMES = [
  'दूध (Milk)',
  'खवा (Mawa)',
  'साखर (Sugar)',
  'मैदा (Maida)',
  'तूप (Pure Ghee)',
  'तेल (Cooking Oil)',
  'कांदा (Onions)',
  'पॅकिंग बॉक्स (Boxes)',
  'काजू (Cashews)',
  'बदाम (Almonds)'
];

export default function OtherRecords({ printLanguage = 'mr', onRecordsChange }) {
  // Load records from localStorage with offline-first persistence
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse other records from localStorage', e);
    }
    return [
      {
        id: 'rec_demo_1',
        name: 'दूध (Buffalo Milk)',
        quantity: 20,
        unit: 'liter',
        notes: 'सकाळचा डेअरी स्टॉक',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rec_demo_2',
        name: 'साखर (Sugar Bag)',
        quantity: 50,
        unit: 'kg',
        notes: 'गोडाऊन मधून आणलेली पोती',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rec_demo_3',
        name: 'खवा (Fresh Mawa)',
        quantity: 15,
        unit: 'kg',
        notes: 'गुलाब जामुनसाठी',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rec_demo_4',
        name: 'इलायची पावडर (Cardamom)',
        quantity: 500,
        unit: 'gram',
        notes: 'मसाला बॉक्स',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('all'); // 'all' | 'kg' | 'liter' | 'gram'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'name' | 'qty_desc' | 'qty_asc'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    notes: ''
  });
  const [formError, setFormError] = useState('');

  // Inline Quantity Edit State (recordId -> temp string value)
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [inlineQtyValue, setInlineQtyValue] = useState('');

  // Delete Confirmation State
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Form Input Refs for smooth keyboard Enter navigation
  const nameInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const unitSelectRef = useRef(null);
  const saveBtnRef = useRef(null);

  // Save to localStorage & notify parent whenever records change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      if (onRecordsChange) {
        onRecordsChange(records);
      }
    } catch (e) {
      console.error('Failed to save other records to localStorage', e);
    }
  }, [records, onRecordsChange]);

  // Focus name input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 80);
    }
  }, [isModalOpen]);

  // Open Add Record Modal
  const handleOpenAddModal = () => {
    setEditingRecordId(null);
    setFormData({
      name: '',
      quantity: '1',
      unit: 'kg',
      notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Record Modal
  const handleOpenEditModal = (rec) => {
    setEditingRecordId(rec.id);
    setFormData({
      name: rec.name,
      quantity: String(rec.quantity),
      unit: rec.unit || 'kg',
      notes: rec.notes || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle Save (Add or Update)
  const handleSaveRecord = (e) => {
    if (e) e.preventDefault();

    const cleanName = formData.name.trim();
    if (!cleanName) {
      setFormError('कृपया रेकॉर्डचे नाव प्रविष्ट करा (Please enter record name)');
      nameInputRef.current?.focus();
      return;
    }

    const numQty = parseFloat(formData.quantity);
    if (isNaN(numQty) || numQty < 0) {
      setFormError('कृपया वैध संख्या प्रविष्ट करा (Please enter valid quantity >= 0)');
      qtyInputRef.current?.focus();
      return;
    }

    const cleanUnit = formData.unit || 'kg';

    if (editingRecordId) {
      // Update existing record
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingRecordId
            ? {
                ...r,
                name: cleanName,
                quantity: Math.round(numQty * 1000) / 1000,
                unit: cleanUnit,
                notes: formData.notes.trim(),
                updatedAt: new Date().toISOString()
              }
            : r
        )
      );
    } else {
      // Create new record
      const newRec = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: cleanName,
        quantity: Math.round(numQty * 1000) / 1000,
        unit: cleanUnit,
        notes: formData.notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRecords((prev) => [newRec, ...prev]);
    }

    setIsModalOpen(false);
    setEditingRecordId(null);
  };

  // Adjust Quantity (+ / -) by step
  const handleAdjustQuantity = (recordId, delta) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const newQty = Math.max(0, Math.round((r.quantity + delta) * 1000) / 1000);
        return {
          ...r,
          quantity: newQty,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  // Set Exact Quantity
  const handleSetExactQuantity = (recordId, exactValue) => {
    const num = parseFloat(exactValue);
    if (isNaN(num) || num < 0) return;
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          quantity: Math.round(num * 1000) / 1000,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  // Commit Inline Qty Edit
  const handleCommitInlineEdit = (recordId) => {
    handleSetExactQuantity(recordId, inlineQtyValue);
    setInlineEditingId(null);
  };

  // Delete Record
  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
    setRecordToDelete(null);
  };

  // Keyboard navigation inside modal
  const handleFormKeyDown = (e, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentField === 'name') {
        qtyInputRef.current?.focus();
        qtyInputRef.current?.select();
      } else if (currentField === 'quantity') {
        unitSelectRef.current?.focus();
      } else if (currentField === 'unit') {
        handleSaveRecord();
      }
    }
  };

  // Unit theme helpers
  const getUnitTheme = (unit) => {
    switch (unit) {
      case 'kg':
        return {
          label: 'kg (किलो)',
          short: 'kg',
          icon: Scale,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
          activeBg: 'bg-amber-500 text-white shadow-amber-200',
          accentBorder: 'hover:border-amber-400 focus-within:border-amber-500',
          cardBorder: 'border-amber-200/80',
          steppers: [-5, -1, -0.5, 0.5, 1, 5]
        };
      case 'liter':
        return {
          label: 'liter (लिटर)',
          short: 'liter',
          icon: Milk,
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
          gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
          activeBg: 'bg-sky-500 text-white shadow-sky-200',
          accentBorder: 'hover:border-sky-400 focus-within:border-sky-500',
          cardBorder: 'border-sky-200/80',
          steppers: [-5, -1, -0.5, 0.5, 1, 5]
        };
      case 'gram':
      default:
        return {
          label: 'gram (ग्रॅम)',
          short: 'gram',
          icon: Package,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
          activeBg: 'bg-purple-500 text-white shadow-purple-200',
          accentBorder: 'hover:border-purple-400 focus-within:border-purple-500',
          cardBorder: 'border-purple-200/80',
          steppers: [-500, -100, -50, 50, 100, 500]
        };
    }
  };

  // Filter & Sort records
  const filteredRecords = records
    .filter((r) => {
      if (unitFilter !== 'all' && r.unit !== unitFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        String(r.quantity).includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'qty_desc') return b.quantity - a.quantity;
      if (sortBy === 'qty_asc') return a.quantity - b.quantity;
      // 'recent' by default
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });

  // Calculate summary statistics
  const totalKg = records
    .filter((r) => r.unit === 'kg')
    .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const totalLiter = records
    .filter((r) => r.unit === 'liter')
    .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const totalGram = records
    .filter((r) => r.unit === 'gram')
    .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden select-none">
      
      {/* Top Hero Banner & Actions */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 shadow-xs shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Title & Description */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Other Records
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-black rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  इतर नोंदी व ट्रॅकर
                </span>
                <span className="text-xs font-bold text-slate-500">
                  ({records.length} {records.length === 1 ? 'Record' : 'Records'})
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Keep quick custom records (Name, Quantity, Unit: kg/liter/gram) with live interactive quantity carts.
              </p>
            </div>
          </div>

          {/* Quick Stat Badges & Add Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Kg Stat */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-bold text-amber-900">
                <span className="font-black text-xs text-amber-950">{totalKg.toLocaleString()}</span> kg
              </span>
            </div>

            {/* Liter Stat */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-xl">
              <Milk className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-[11px] font-bold text-sky-900">
                <span className="font-black text-xs text-sky-950">{totalLiter.toLocaleString()}</span> liter
              </span>
            </div>

            {/* Gram Stat */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl">
              <Package className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] font-bold text-purple-900">
                <span className="font-black text-xs text-purple-950">{totalGram.toLocaleString()}</span> g
              </span>
            </div>

            {/* Primary '+ Add Record' Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Record / नोंद जोडा</span>
            </button>

          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Unit Filter Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Records', count: records.length },
              { id: 'kg', label: '⚖️ kg (किलो)', count: records.filter((r) => r.unit === 'kg').length },
              { id: 'liter', label: '🥛 liter (लिटर)', count: records.filter((r) => r.unit === 'liter').length },
              { id: 'gram', label: '🥄 gram (ग्रॅम)', count: records.filter((r) => r.unit === 'gram').length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setUnitFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  unitFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
                <span className="ml-1 opacity-70 text-[10px]">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Box & Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records / नाव शोधा..."
                className="w-full pl-8 pr-7 py-1 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-xs focus:outline-hidden cursor-pointer text-slate-700"
              >
                <option value="recent">Recent First</option>
                <option value="name">Name (A-Z)</option>
                <option value="qty_desc">Qty: High to Low</option>
                <option value="qty_asc">Qty: Low to High</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Main Records Carts Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredRecords.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white border border-dashed border-slate-300 rounded-3xl max-w-lg mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-3 shadow-xs">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              {searchQuery || unitFilter !== 'all' ? 'कोणतीही नोंद सापडली नाही (No Records Found)' : 'कोणतीही नोंद उपलब्ध नाही (No Records Yet)'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              {searchQuery || unitFilter !== 'all'
                ? 'तुमच्या शोध निकषांशी जुळणारी कोणतीही नोंद नाही. कृपया फिल्टर बदला.'
                : 'नवीन रेकॉर्ड तयार करण्यासाठी खालील बटणावर क्लिक करा आणि नाव, प्रमाण व युनिट (kg, liter, gram) प्रविष्ट करा.'}
            </p>
            {searchQuery || unitFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setUnitFilter('all');
                }}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-500/20 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ पहिली नोंद जोडा (Add First Record)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredRecords.map((rec) => {
              const theme = getUnitTheme(rec.unit);
              const UnitIcon = theme.icon;
              const isInlineEditing = inlineEditingId === rec.id;

              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-2xl border ${theme.cardBorder} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative group`}
                >
                  {/* Subtle unit gradient tint at top */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

                  {/* Card Content Top: Title & Actions */}
                  <div className="p-3.5 pb-2">
                    
                    {/* Header: Name, Unit Badge, and Edit/Delete Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${theme.badgeColor}`}>
                            <UnitIcon className="w-3 h-3" />
                            <span>{theme.short.toUpperCase()}</span>
                          </span>
                          {rec.notes && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={rec.notes}>
                              • {rec.notes}
                            </span>
                          )}
                        </div>
                        <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug truncate" title={rec.name}>
                          {rec.name}
                        </h3>
                      </div>

                      {/* Action buttons: Edit & Delete */}
                      <div className="flex items-center space-x-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(rec)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                          title="Edit record name or unit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecordToDelete(rec)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Central Quantity Display with Interactive Stepper */}
                    <div className="my-3.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2">
                      
                      {/* Decrease Button (-) */}
                      <button
                        type="button"
                        onClick={() => handleAdjustQuantity(rec.id, rec.unit === 'gram' ? -50 : -1)}
                        disabled={rec.quantity <= 0}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black transition-all cursor-pointer ${
                          rec.quantity <= 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 shadow-2xs active:scale-90'
                        }`}
                        title={`Decrease by ${rec.unit === 'gram' ? '50g' : '1 ' + rec.unit}`}
                      >
                        <Minus className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Display / Direct Inline Input */}
                      <div className="flex-1 text-center min-w-0">
                        {isInlineEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              autoFocus
                              value={inlineQtyValue}
                              onChange={(e) => setInlineQtyValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommitInlineEdit(rec.id);
                                if (e.key === 'Escape') setInlineEditingId(null);
                              }}
                              className="w-20 px-1 py-0.5 text-center font-black text-base text-slate-900 bg-white border-2 border-teal-500 rounded-lg focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleCommitInlineEdit(rec.id)}
                              className="p-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setInlineEditingId(rec.id);
                              setInlineQtyValue(String(rec.quantity));
                            }}
                            className="cursor-pointer hover:bg-white/80 rounded-lg py-0.5 px-1 transition group/qty"
                            title="Click to type exact quantity"
                          >
                            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
                              {rec.quantity}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                              {rec.unit}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Increase Button (+) */}
                      <button
                        type="button"
                        onClick={() => handleAdjustQuantity(rec.id, rec.unit === 'gram' ? 50 : 1)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 hover:border-emerald-300 shadow-2xs active:scale-90 flex items-center justify-center font-black transition-all cursor-pointer"
                        title={`Increase by ${rec.unit === 'gram' ? '50g' : '1 ' + rec.unit}`}
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>

                    </div>

                    {/* Quick Step Adjustment Pills */}
                    <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5">
                      {theme.steppers.map((step) => {
                        const isPlus = step > 0;
                        return (
                          <button
                            key={step}
                            type="button"
                            onClick={() => handleAdjustQuantity(rec.id, step)}
                            disabled={!isPlus && rec.quantity + step < 0}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                              isPlus
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 active:scale-90'
                                : rec.quantity + step < 0
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 active:scale-90'
                            }`}
                            title={`${isPlus ? 'Add' : 'Deduct'} ${Math.abs(step)} ${rec.unit}`}
                          >
                            {isPlus ? `+${step}` : step}
                          </button>
                        );
                      })}
                    </div>

                  </div>

                  {/* Card Footer: Timestamp */}
                  <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(rec.updatedAt || rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetExactQuantity(rec.id, 0)}
                      disabled={rec.quantity === 0}
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded transition ${
                        rec.quantity === 0
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                      }`}
                      title="Reset quantity to 0"
                    >
                      Reset 0
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Creation & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight leading-tight">
                    {editingRecordId ? 'नोंद संपादित करा (Edit Record)' : 'नवीन नोंद जोडा (Add Record)'}
                  </h3>
                  <p className="text-[11px] text-teal-100 font-medium">
                    Name, Quantity & Unit (kg, liter, gram)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
              
              {/* Error Alert */}
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Record / Item Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  1. वस्तू / रेकॉर्डचे नाव (Record Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formError) setFormError('');
                  }}
                  onKeyDown={(e) => handleFormKeyDown(e, 'name')}
                  placeholder="उदा. दूध (Milk), खवा (Mawa), साखर, पॅकिंग बॉक्स..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-teal-500 font-bold text-slate-800"
                />
                
                {/* Quick suggestions chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-bold mr-1 self-center">उदा:</span>
                  {PRESET_NAMES.slice(0, 5).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, name: preset });
                        qtyInputRef.current?.focus();
                        qtyInputRef.current?.select();
                      }}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 rounded-md transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Quantity Input */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  2. प्रमाण / संख्या (Quantity) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={qtyInputRef}
                    type="number"
                    step="any"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => {
                      setFormData({ ...formData, quantity: e.target.value });
                      if (formError) setFormError('');
                    }}
                    onKeyDown={(e) => handleFormKeyDown(e, 'quantity')}
                    placeholder="उदा. 5, 250, 10.5..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:border-teal-500 font-bold text-slate-800 pr-16"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase">
                    {formData.unit}
                  </span>
                </div>
              </div>

              {/* 3. Unit Selector (kg, liter, gram) */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  3. एकक / युनिट (Unit) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'kg', label: 'kg (किलो)', sub: 'Kilogram', icon: Scale, color: 'amber' },
                    { id: 'liter', label: 'liter (लिटर)', sub: 'Liquid', icon: Milk, color: 'sky' },
                    { id: 'gram', label: 'gram (ग्रॅम)', sub: 'Gram/Portion', icon: Package, color: 'purple' }
                  ].map((unitItem) => {
                    const isSelected = formData.unit === unitItem.id;
                    const Icon = unitItem.icon;
                    return (
                      <button
                        key={unitItem.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, unit: unitItem.id })}
                        className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 text-teal-900 shadow-xs scale-102 font-black'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600 font-bold'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span className="text-xs leading-tight">{unitItem.id}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{unitItem.label.split(' ')[1]}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Fallback hidden/accessible select */}
                <select
                  ref={unitSelectRef}
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  onKeyDown={(e) => handleFormKeyDown(e, 'unit')}
                  className="sr-only"
                >
                  <option value="kg">kg (Kilogram)</option>
                  <option value="liter">liter (Liter)</option>
                  <option value="gram">gram (Gram)</option>
                </select>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  टीप / तपशील (Optional Notes)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="उदा. काउंटर २ साठी, सकाळी डिलिव्हरी..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-teal-500 text-slate-700"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  रद्द करा (Cancel)
                </button>
                <button
                  ref={saveBtnRef}
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-500/20 active:scale-95 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingRecordId ? 'बदल जतन करा (Save Changes)' : 'नोंद जतन करा (Save Record)'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-sm shadow-2xl p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">नोंद हटवायची आहे का?</h3>
              <p className="text-xs text-slate-500 mt-1">
                तुम्ही <span className="font-bold text-slate-800">"{recordToDelete.name}"</span> ({recordToDelete.quantity} {recordToDelete.unit}) ही नोंद हटवू इच्छिता का?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                नाही (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-500/20 transition cursor-pointer"
              >
                होय, हटवा (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
