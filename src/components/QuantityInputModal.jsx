import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, ShoppingCart, CornerDownLeft, Package } from 'lucide-react';
import { getDishPriceForSection } from '../db/db';
import { getPrintDishName } from '../utils/receiptUtils';

export default function QuantityInputModal({
  isOpen,
  dish,
  activeSection,
  initialParcelMode = false,
  cartItems = [],
  allDishes = [],
  printLanguage = 'mr',
  onClose,
  onConfirm
}) {
  const [qty, setQty] = useState('1');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isParcel, setIsParcel] = useState(initialParcelMode);
  const inputRef = useRef(null);

  // Check if dish is a Sweets/Kg item
  const isKgItem = Boolean(
    dish?.pricePerKg ||
    (dish?.unit && (dish.unit.includes('g') || dish.unit.toLowerCase().includes('kg'))) ||
    dish?.categoryId === 2 ||
    dish?.hasMultiplePrices
  );

  // Reset & prepare state whenever modal opens or dish changes
  useEffect(() => {
    if (isOpen && dish) {
      setQty('1');
      setIsParcel(initialParcelMode);

      if (dish.variants && dish.variants.length > 0) {
        setSelectedVariant(dish.variants[0]);
      } else {
        setSelectedVariant(null);
      }

      // Automatically focus and select the quantity input field for instant typing
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, dish, initialParcelMode]);

  // Global Keyboard Shortcuts (Enter to confirm, Escape to cancel)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dish) return null;

  // Calculate Active Price
  const basePrice = getDishPriceForSection(dish, activeSection?.id);
  const activeRate = selectedVariant ? selectedVariant.price : (dish.pricePerKg || basePrice || 0);

  // Marathi Name lookup
  const marathiTitle = (
    dish.marathiName ||
    allDishes.find((d) => d.id === dish.id || (d.name && dish.name && d.name.toLowerCase() === dish.name.toLowerCase()))?.marathiName ||
    getPrintDishName(dish, 'mr') ||
    ''
  ).trim();
  const showMarathi = Boolean(marathiTitle && marathiTitle.toLowerCase() !== (dish.name || '').trim().toLowerCase());

  // Existing Cart Qty for this item
  const currentInCartItems = cartItems.filter((i) => i.id === dish.id || i.name === dish.name);
  const totalInCartQty = currentInCartItems.reduce((acc, curr) => acc + (parseFloat(curr.qty) || 0), 0);

  // Parse numerical qty
  const parsedQty = parseFloat(qty);
  const validQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 0;
  const calculatedTotal = Math.round(activeRate * validQty * 100) / 100;

  // Handle Form Submission / Enter Key
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validQty || validQty <= 0) {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
      return;
    }

    const unit = selectedVariant
      ? selectedVariant.unit
      : (dish.unit || (isKgItem ? `${validQty} Kg` : 'Plate'));

    const weightKg = selectedVariant?.weightKg !== undefined
      ? selectedVariant.weightKg
      : (dish.weightKg || (unit.includes('Kg') ? parseFloat(unit) || validQty : null));

    onConfirm({
      dish,
      qty: validQty,
      price: activeRate,
      unit,
      weightKg,
      isParcel
    });
  };

  const handleStep = (delta) => {
    const stepVal = isKgItem && (qty.includes('.') || delta < 1 && delta > -1) ? 0.25 : 1;
    const current = parseFloat(qty) || 0;
    const nextVal = Math.max(stepVal, Math.round((current + delta) * 100) / 100);
    setQty(String(nextVal));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSetPreset = (presetVal) => {
    setQty(String(presetVal));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg shrink-0 shadow-2xs">
              #{dish.srNo || dish.id}
            </span>
            <div className="min-w-0">
              <h3 className="font-black text-base sm:text-lg text-white leading-tight truncate">
                {dish.name}
              </h3>
              {showMarathi && (
                <p className="text-xs font-bold text-amber-300 truncate mt-0.5">
                  {marathiTitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Rate & Cart Status Bar */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-3 px-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Rate / Unit
              </span>
              <span className="text-base font-black text-blue-700">
                ₹{activeRate.toFixed(2)}
                {selectedVariant ? ` (${selectedVariant.unit})` : dish.pricePerKg ? '/Kg' : ''}
              </span>
            </div>

            {totalInCartQty > 0 && (
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-2.5 py-1 rounded-xl shadow-2xs">
                In Cart: {totalInCartQty}
              </span>
            )}
          </div>

          {/* Variant Selector (if dish has multiple portions/weights) */}
          {dish.variants && dish.variants.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Select Option / Portion:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {dish.variants.map((v, vIdx) => {
                  const isSelected = selectedVariant?.unit === v.unit;
                  return (
                    <button
                      key={`variant-btn-${v.unit}-${vIdx}`}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        if (inputRef.current) inputRef.current.focus();
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                      }`}
                    >
                      <span className="font-black text-xs">{v.unit}</span>
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                        ₹{v.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Large Quantity Stepper & Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="quantity-modal-input"
                className="text-xs font-black text-slate-900 uppercase tracking-wider"
              >
                Enter Quantity:
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                Type quantity & press Enter ↵
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Stepper Minus (-) Button */}
              <button
                type="button"
                onClick={() => handleStep(-1)}
                className="w-13 h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 border border-slate-300 flex items-center justify-center font-black cursor-pointer shadow-xs transition shrink-0"
                title="Decrease quantity"
              >
                <Minus className="w-6 h-6 stroke-[3]" />
              </button>

              {/* Central Focused Input Field */}
              <div className="flex-1 relative">
                <input
                  id="quantity-modal-input"
                  ref={inputRef}
                  type="number"
                  step={isKgItem ? '0.05' : '1'}
                  min={isKgItem ? '0.05' : '1'}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-full h-13 bg-white border-2 border-slate-400 focus:border-slate-950 text-center font-black text-2xl sm:text-3xl text-slate-950 rounded-2xl shadow-inner outline-none transition focus:ring-4 focus:ring-slate-200"
                  placeholder="1"
                  autoComplete="off"
                />
              </div>

              {/* Stepper Plus (+) Button */}
              <button
                type="button"
                onClick={() => handleStep(1)}
                className="w-13 h-13 rounded-2xl bg-slate-900 hover:bg-black active:scale-95 text-white flex items-center justify-center font-black cursor-pointer shadow-xs transition shrink-0"
                title="Increase quantity"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Quick Preset Number Buttons */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            {(isKgItem
              ? [0.25, 0.5, 1, 2, 5]
              : [1, 2, 3, 4, 5, 10]
            ).map((pVal) => (
              <button
                key={`preset-${pVal}`}
                type="button"
                onClick={() => handleSetPreset(pVal)}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer shadow-2xs ${
                  parseFloat(qty) === pVal
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {isKgItem ? `${pVal}k` : pVal}
              </button>
            ))}
          </div>

          {/* Parcel Mode Checkbox / Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsParcel((prev) => !prev)}
              className={`w-full py-2.5 px-3 rounded-2xl border transition flex items-center justify-between cursor-pointer shadow-2xs ${
                isParcel
                  ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 shadow-sm'
                  : 'bg-slate-50 hover:bg-amber-50 text-slate-800 border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="w-4.5 h-4.5 stroke-[2.5]" />
                <span className="font-black text-xs sm:text-sm">
                  {isParcel ? 'Parcel Item (Packaging / Takeaway)' : 'Pack as Parcel?'}
                </span>
              </div>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${isParcel ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {isParcel ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Live Calculated Total Display */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 px-4 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">
              Total for {validQty} {selectedVariant?.unit || dish.unit || 'Item'}{validQty > 1 ? 's' : ''}:
            </span>
            <span className="text-xl font-black text-blue-900">
              ₹{calculatedTotal.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm rounded-2xl border border-slate-300 cursor-pointer transition"
            >
              Cancel (Esc)
            </button>

            <button
              type="submit"
              className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg cursor-pointer transition flex items-center justify-center space-x-2 border border-emerald-500"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
              <span>Add to Cart</span>
              <span className="bg-emerald-800/80 text-[11px] px-2 py-0.5 rounded-md flex items-center font-bold">
                <CornerDownLeft className="w-3.5 h-3.5 mr-0.5" /> Enter
              </span>
            </button>
          </div>

          {/* Helper Keyboard Tip */}
          <p className="text-[11px] text-center font-bold text-slate-400 select-none pt-1">
            Tip: Press <span className="font-black text-slate-700">Enter ↵</span> to add immediately, or <span className="font-black text-slate-700">Esc</span> to cancel
          </p>

        </form>

      </div>
    </div>
  );
}
