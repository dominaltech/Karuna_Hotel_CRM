import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  FileText,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Banknote,
  Smartphone,
  Split,
  CreditCard
} from 'lucide-react';
import { printThermalReceipt, formatItemQtyDisplay, getPrintDishName } from '../utils/receiptUtils';

export default function OrderCartPopup({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  activeSection,
  activeTable,
  onSettleBill
}) {
  const [tokenNo, setTokenNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  // 4 Payment Modes: 'cash' | 'online' | 'split' | 'card'
  const [paymentMode, setPaymentMode] = useState('cash');
  const [splitOnlineInput, setSplitOnlineInput] = useState('');
  const [splitCashInput, setSplitCashInput] = useState('');

  // 5 Optional Charges / Adjustments (Requirement 9)
  const [discountType, setDiscountType] = useState('₹'); // '₹' | '%'
  const [discountValue, setDiscountValue] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [containerCharge, setContainerCharge] = useState('');
  const [waiterTip, setWaiterTip] = useState('');
  const [serviceChargeType, setServiceChargeType] = useState('₹'); // '₹' | '%'
  const [serviceChargeValue, setServiceChargeValue] = useState('');

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  const parsedDiscount = parseFloat(discountValue) || 0;
  const discountAmount = discountType === '%'
    ? Math.round(((subtotal * parsedDiscount) / 100) * 100) / 100
    : parsedDiscount;

  const parsedService = parseFloat(serviceChargeValue) || 0;
  const serviceChargeAmount = serviceChargeType === '%'
    ? Math.round(((subtotal * parsedService) / 100) * 100) / 100
    : parsedService;

  const deliveryChargeAmount = parseFloat(deliveryCharge) || 0;
  const containerChargeAmount = parseFloat(containerCharge) || 0;
  const waiterTipAmount = parseFloat(waiterTip) || 0;

  const calculatedTotal = Math.max(
    0,
    subtotal - discountAmount + serviceChargeAmount + deliveryChargeAmount + containerChargeAmount + waiterTipAmount
  );
  const finalGrandTotal = Math.round(calculatedTotal * 100) / 100;

  // Initialize token and charges when opening (Requirement 1: No random '#' number!)
  useEffect(() => {
    if (isOpen) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      if (activeTable?.currentTokenNo) {
        setTokenNo(String(activeTable.currentTokenNo).replace(/^#/, ''));
      } else {
        const cleanNo = activeTable?.name ? String(activeTable.name).replace(/\D/g, '') : '1';
        setTokenNo(cleanNo || '1');
      }
      setPaymentMode('cash');
      setDiscountValue('');
      setDeliveryCharge('');
      setContainerCharge('');
      setWaiterTip('');
      setServiceChargeValue('');
    }
  }, [isOpen, activeTable]);

  // Keep split cash / online inputs synced with live final grand total
  useEffect(() => {
    if (paymentMode === 'cash') {
      setSplitCashInput(String(finalGrandTotal));
      setSplitOnlineInput('0');
    } else if (paymentMode === 'online') {
      setSplitOnlineInput(String(finalGrandTotal));
      setSplitCashInput('0');
    } else if (paymentMode === 'split') {
      const online = parseFloat(splitOnlineInput) || 0;
      const remainingCash = Math.max(0, finalGrandTotal - online);
      setSplitCashInput(String(remainingCash));
    }
  }, [finalGrandTotal, paymentMode]);

  const parsedOnlineSplit = parseFloat(splitOnlineInput) || 0;
  const parsedCashSplit = parseFloat(splitCashInput) || 0;

  const handleCheckout = (isPrint) => {
    if (isSubmittingRef.current || cartItems.length === 0) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    let paymentDetails = { mode: 'Cash', cash: finalGrandTotal, online: 0, card: 0 };

    if (paymentMode === 'cash') {
      paymentDetails = { mode: 'Cash', cash: finalGrandTotal, online: 0, card: 0 };
    } else if (paymentMode === 'online') {
      paymentDetails = { mode: 'Online', cash: 0, online: finalGrandTotal, card: 0 };
    } else if (paymentMode === 'card') {
      paymentDetails = { mode: 'Card', cash: 0, online: 0, card: finalGrandTotal };
    } else if (paymentMode === 'split') {
      paymentDetails = {
        mode: 'Split',
        cash: parsedCashSplit,
        online: parsedOnlineSplit,
        card: 0
      };
    }

    const billPayload = {
      tokenNo: String(tokenNo).replace(/^#/, ''),
      tableNo: activeTable ? activeTable.name : 'Takeaway',
      tableId: activeTable ? activeTable.id : null,
      items: cartItems,
      subtotal: subtotal,
      discount: discountAmount,
      discountAmount: discountAmount,
      discountType,
      discountValue: parsedDiscount,
      deliveryCharge: deliveryChargeAmount,
      containerCharge: containerChargeAmount,
      waiterTip: waiterTipAmount,
      serviceCharge: serviceChargeAmount,
      serviceChargeType,
      serviceChargeValue: parsedService,
      sectionName: activeSection?.name || 'Dine In Area',
      sectionExtraCharge: 0,
      total: finalGrandTotal,
      finalTotal: finalGrandTotal,
      grandTotal: finalGrandTotal,
      paymentDetails,
      paymentMode: paymentDetails.mode,
      createdAt: new Date().toISOString(),
      isPrinted: isPrint
    };

    if (isPrint) {
      setTimeout(() => {
        printThermalReceipt(billPayload);
      }, 50);
    }

    onSettleBill(billPayload);

    // Reset popup state
    setTokenNo('');
    setPaymentMode('cash');
    setSplitOnlineInput('0');
    setSplitCashInput('0');
    onClose();
  };

  // Keyboard shortcut listener: 'P' to Print & Settle, 'O' to Settle (No Print)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.repeat) return; // Prevent repeated triggers when key is held down

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleCheckout(true);
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        handleCheckout(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, cartItems, finalGrandTotal, paymentMode, parsedOnlineSplit, parsedCashSplit, tokenNo, activeTable, activeSection]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-100">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* Header with Table & Section info */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg">
              Settle Order & Bill
            </h3>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mt-0.5">
              <span>Table: <strong className="text-blue-600 font-black">{activeTable ? activeTable.name : 'Takeaway'}</strong></span>
              <span>•</span>
              <span>{activeSection?.name || 'Dine In Area'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-neutral-900 p-2 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Items List Preview (Enlarged rows and +/- controls) */}
        <div className="p-4 overflow-y-auto max-h-48 space-y-2 flex-1 border-b border-slate-100">
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">
            Bill Items Summary ({cartItems.length} items)
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-6 text-stone-400 text-xs font-semibold">
              No items in cart
            </div>
          ) : (
            cartItems.map((item, itemIdx) => {
              const itemQty = parseFloat(item.qty) || 1;
              const isKgItem = item.weightKg !== undefined || (item.unit && (item.unit.includes('g') || item.unit.toLowerCase().includes('kg'))) || item.hasMultiplePrices;
              const qtyDisplay = formatItemQtyDisplay(item);

              const lineAmount = (item.price || 0) * itemQty;
              const targetKey = item.cartItemId || item.id;

              return (
                <div
                  key={`cart-item-${item.cartItemId || item.id}-${itemIdx}`}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <h4 className="font-black text-slate-900 text-sm">{item.name}</h4>
                      {item.isParcel && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded">
                          📦 Parcel
                        </span>
                      )}
                    </div>
                    {item.customNote && (
                      <div className="text-[10px] font-bold text-blue-600 mt-0.5">{item.customNote}</div>
                    )}
                    <div className="text-xs font-semibold text-stone-500 mt-0.5">
                      Qty / Unit: <span className="font-black text-neutral-800">{qtyDisplay}</span> • Amount: <span className="font-black text-neutral-900">₹{lineAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {isKgItem ? (
                    <span className="font-black text-xs px-2.5 py-1 bg-white border border-stone-200 text-neutral-900 rounded-xl shadow-2xs">
                      {qtyDisplay}
                    </span>
                  ) : (
                    <div className="flex items-center space-x-1.5 bg-white border border-stone-300 rounded-xl p-1 shadow-2xs">
                      <button
                        onClick={() => onUpdateQty(targetKey, itemQty - 1, item.unit)}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-black text-sm cursor-pointer"
                        title="Reduce quantity"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <span className="font-black text-sm text-neutral-900 px-2 min-w-[24px] text-center">{qtyDisplay}</span>
                      <button
                        onClick={() => onUpdateQty(targetKey, itemQty + 1, item.unit)}
                        className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-black text-white flex items-center justify-center font-black text-sm cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onRemoveItem(targetKey, item.unit)}
                    className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer ml-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4.5 h-4.5 stroke-[2.2]" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Payment & Summary Footer */}
        <div className="p-4 bg-slate-50 space-y-3 overflow-y-auto">
          
          {/* Requirement 9: 5 Optional Charges (Discount, Delivery, Container, Tip, Service Charge) */}
          <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2 shadow-2xs">
            <div className="text-[10px] font-black text-stone-500 uppercase tracking-wider flex items-center justify-between">
              <span>Optional Charges & Adjustments</span>
              <span className="text-[9px] font-bold text-stone-400">All Optional</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {/* 1. Discount (Price & Percentage both applicable) */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-slate-700">1. Discount</span>
                  <button
                    type="button"
                    onClick={() => setDiscountType(discountType === '₹' ? '%' : '₹')}
                    className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer shadow-2xs"
                    title="Toggle between Price (₹) and Percentage (%)"
                  >
                    {discountType}
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder={`0 (${discountType})`}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs"
                />
                {discountAmount > 0 && (
                  <span className="text-[10px] font-black text-emerald-600 mt-0.5 block truncate">
                    -₹{discountAmount.toFixed(2)}
                  </span>
                )}
              </div>

              {/* 2. Delivery Charge */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                <span className="font-extrabold text-slate-700 block mb-1">2. Delivery (₹)</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="₹ 0"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs"
                />
              </div>

              {/* 3. Container Charge */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                <span className="font-extrabold text-slate-700 block mb-1">3. Container (₹)</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="₹ 0"
                  value={containerCharge}
                  onChange={(e) => setContainerCharge(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs"
                />
              </div>

              {/* 4. Waiter Tip */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                <span className="font-extrabold text-slate-700 block mb-1">4. Waiter Tip (₹)</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="₹ 0"
                  value={waiterTip}
                  onChange={(e) => setWaiterTip(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs"
                />
              </div>

              {/* 5. Service Charge */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-slate-700">5. Service Chg</span>
                  <button
                    type="button"
                    onClick={() => setServiceChargeType(serviceChargeType === '₹' ? '%' : '₹')}
                    className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer shadow-2xs"
                    title="Toggle between Price (₹) and Percentage (%)"
                  >
                    {serviceChargeType}
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder={`0 (${serviceChargeType})`}
                  value={serviceChargeValue}
                  onChange={(e) => setServiceChargeValue(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs"
                />
                {serviceChargeAmount > 0 && (
                  <span className="text-[10px] font-black text-blue-600 mt-0.5 block truncate">
                    +₹{serviceChargeAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grand Total Breakdown Row */}
          <div className="bg-white border border-stone-200 rounded-xl p-3 flex justify-between items-center shadow-xs">
            <div>
              <span className="text-xs font-black text-stone-500 uppercase tracking-wider block">Total Payable Amount</span>
              <span className="text-[11px] font-bold text-stone-400">
                Subtotal: ₹{subtotal.toFixed(2)}
                {discountAmount > 0 ? ` • Disc: -₹${discountAmount.toFixed(2)}` : ''}
              </span>
            </div>
            <span className="text-2xl font-black text-blue-600">₹{finalGrandTotal.toFixed(2)}</span>
          </div>

          {/* 4 Payment Options: Cash, Online, Split, Card */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">
              Select Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                  paymentMode === 'cash'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-stone-300 hover:bg-stone-50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('online')}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                  paymentMode === 'online'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-stone-300 hover:bg-stone-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Online</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMode('split');
                  setSplitOnlineInput('0');
                  setSplitCashInput(String(finalGrandTotal));
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                  paymentMode === 'split'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-stone-300 hover:bg-stone-50'
                }`}
              >
                <Split className="w-4 h-4" />
                <span>Split</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('card')}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                  paymentMode === 'card'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-stone-300 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>

            </div>

            {/* Split Dual Inputs with Auto Calculation & Hidden Spinners */}
            {paymentMode === 'split' && (
              <div className="bg-white border border-stone-300 rounded-xl p-3 space-y-3 mt-2">
                <div className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                  Split Payment Amounts
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Online Amount Input */}
                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1">
                      Online Amount (₹):
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={splitOnlineInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSplitOnlineInput(val);
                        const num = parseFloat(val) || 0;
                        const remainingCash = Math.max(0, finalGrandTotal - num);
                        setSplitCashInput(remainingCash > 0 ? String(remainingCash) : '0');
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Cash Amount Input */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Cash Amount (₹):
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={splitCashInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSplitCashInput(val);
                        const num = parseFloat(val) || 0;
                        const remainingOnline = Math.max(0, finalGrandTotal - num);
                        setSplitOnlineInput(remainingOnline > 0 ? String(remainingOnline) : '0');
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 flex justify-between items-center text-xs font-bold text-slate-800 border border-slate-200">
                  <span>Online: <strong className="text-slate-900 font-black">₹{parsedOnlineSplit}</strong></span>
                  <span className="text-slate-400">+</span>
                  <span>Cash: <strong className="text-blue-600 font-black">₹{parsedCashSplit}</strong></span>
                  <span className="text-slate-400">=</span>
                  <span>Total: <strong className="font-black text-slate-900">₹{finalGrandTotal.toFixed(2)}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons with Keyboard Shortcuts: 'O' for No Print, 'P' for Print */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleCheckout(false)}
              disabled={cartItems.length === 0}
              className="bg-white hover:bg-stone-100 border border-stone-300 text-neutral-900 font-extrabold text-xs py-3 rounded-xl shadow-2xs cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
              title="Press 'O' on keyboard"
            >
              <FileText className="w-4 h-4" />
              <span>[ O ] Settle (No Print)</span>
            </button>

            <button
              onClick={() => handleCheckout(true)}
              disabled={cartItems.length === 0}
              className="bg-neutral-900 hover:bg-black text-white font-extrabold text-xs py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
              title="Press 'P' on keyboard"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>[ P ] Settle & Print</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

