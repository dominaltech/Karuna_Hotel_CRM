import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Edit3,
  Search,
  Hash,
  FileText,
  Plus,
  Minus,
  Save,
  X,
  History,
  Printer,
  Calendar,
  Layers,
  Receipt,
  Monitor,
  Filter,
  Lock,
  Ban
} from 'lucide-react';
import { printThermalReceipt } from '../utils/receiptUtils';
import { AVAILABLE_COUNTERS } from './Header';

// Helper to compute a detailed changelog description when a settled bill is edited
function computeDetailedChangeDescription(oldBill, newBill) {
  const oldItems = oldBill?.items || [];
  const newItems = newBill?.items || [];
  const changes = [];

  const oldMap = new Map();
  oldItems.forEach((it) => {
    const key = it.name || it.id;
    oldMap.set(key, parseFloat(it.qty) || 1);
  });

  const newMap = new Map();
  newItems.forEach((it) => {
    const key = it.name || it.id;
    newMap.set(key, parseFloat(it.qty) || 1);
  });

  // Check additions and increases
  newMap.forEach((qty, name) => {
    const oldQty = oldMap.get(name) || 0;
    if (oldQty === 0) {
      changes.push(`+ Added ${qty}x ${name}`);
    } else if (qty > oldQty) {
      changes.push(`↑ Increased ${name} (+${qty - oldQty})`);
    } else if (qty < oldQty) {
      changes.push(`↓ Reduced ${name} (-${oldQty - qty})`);
    }
  });

  // Check removals
  oldMap.forEach((oldQty, name) => {
    if (!newMap.has(name) || newMap.get(name) <= 0) {
      changes.push(`✕ Removed ${oldQty}x ${name}`);
    }
  });

  // Check discount changes
  const oldDisc = parseFloat(oldBill.discountAmount || oldBill.discount) || 0;
  const newDisc = parseFloat(newBill.discountAmount || newBill.discount) || 0;
  if (Math.abs(newDisc - oldDisc) > 0.01) {
    changes.push(`Discount: ₹${newDisc.toFixed(2)}`);
  }

  // Check extra charges
  const oldDel = parseFloat(oldBill.deliveryCharge) || 0;
  const newDel = parseFloat(newBill.deliveryCharge) || 0;
  if (Math.abs(newDel - oldDel) > 0.01) changes.push(`Delivery: ₹${newDel}`);

  const oldCont = parseFloat(oldBill.containerCharge) || 0;
  const newCont = parseFloat(newBill.containerCharge) || 0;
  if (Math.abs(newCont - oldCont) > 0.01) changes.push(`Container: ₹${newCont}`);

  const oldTip = parseFloat(oldBill.waiterTip) || 0;
  const newTip = parseFloat(newBill.waiterTip) || 0;
  if (Math.abs(newTip - oldTip) > 0.01) changes.push(`Tip: ₹${newTip}`);

  const oldServ = parseFloat(oldBill.serviceCharge) || 0;
  const newServ = parseFloat(newBill.serviceCharge) || 0;
  if (Math.abs(newServ - oldServ) > 0.01) changes.push(`Service: ₹${newServ}`);

  const oldTot = parseFloat(oldBill.total !== undefined ? oldBill.total : (oldBill.finalTotal || 0)) || 0;
  const newTot = parseFloat(newBill.total !== undefined ? newBill.total : (newBill.finalTotal || 0)) || 0;

  if (changes.length > 0) {
    return `${changes.join(', ')} • Total: ₹${oldTot.toFixed(2)} → ₹${newTot.toFixed(2)}`;
  } else if (Math.abs(newTot - oldTot) > 0.01) {
    return `Total adjusted: ₹${oldTot.toFixed(2)} → ₹${newTot.toFixed(2)}`;
  } else {
    return `Resettled Bill (${oldBill.tableNo || 'Takeaway'}) - Total: ₹${newTot.toFixed(2)}`;
  }
}

export default function SettledBills({
  settledBills,
  allDishes,
  billLogs = [],
  onUpdateSettledBill,
  printLanguage = 'mr',
  isSettledBillEditEnabled: propIsSettledBillEditEnabled
}) {
  const isSettledBillEditEnabled = propIsSettledBillEditEnabled !== undefined
    ? propIsSettledBillEditEnabled
    : (localStorage.getItem('karuna_settled_bill_edit_enabled') !== 'false');

  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('today'); // 'today' | 'all' | 'edited'
  const [counterFilter, setCounterFilter] = useState('all'); // 'all' | counterName
  const [selectedBill, setSelectedBill] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [editedItems, setEditedItems] = useState([]);
  const [addDishId, setAddDishId] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Optional Charges State for Bill Editing / Resettlement
  const [editedDiscountValue, setEditedDiscountValue] = useState('');
  const [editedDiscountType, setEditedDiscountType] = useState('₹');
  const [editedDeliveryCharge, setEditedDeliveryCharge] = useState('');
  const [editedContainerCharge, setEditedContainerCharge] = useState('');
  const [editedWaiterTip, setEditedWaiterTip] = useState('');
  const [editedServiceChargeValue, setEditedServiceChargeValue] = useState('');
  const [editedServiceChargeType, setEditedServiceChargeType] = useState('₹');

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

  const todayStr = getLocalDateStr(new Date());

  // Edit Logs & Modification Helpers
  const getBillEditLogs = (bill) => {
    if (!bill) return [];
    return (billLogs || []).filter((l) => String(l.billId) === String(bill.id));
  };

  const isBillEdited = (bill) => {
    return Boolean(bill.isResettled || getBillEditLogs(bill).length > 0);
  };

  // Count only today's edited bills
  const totalEditedCount = (settledBills || []).filter((b) => {
    if (!b || b.isPreOrderAdvance) return false;
    const billDateStr = b.createdAt ? getLocalDateStr(b.createdAt) : todayStr;
    return billDateStr === todayStr && isBillEdited(b);
  }).length;

  // Filter bills by Time Period: strictly Today's Bills ('today' | 'edited')
  // Requirement: Past historical bills are excluded; only today's settled bills are shown
  const baseTimeBills = (settledBills || []).filter((b) => {
    if (!b || b.isPreOrderAdvance) return false;
    const billDateStr = b.createdAt ? getLocalDateStr(b.createdAt) : todayStr;
    if (billDateStr !== todayStr) return false;
    if (timeFilter === 'edited') return isBillEdited(b);
    return true;
  });

  // Filter by Counter
  const baseCounterBills = baseTimeBills.filter((b) => {
    if (counterFilter === 'all') return true;
    const bCounter = (b.counter || '').toLowerCase();
    return bCounter.includes(counterFilter.toLowerCase());
  });

  // Filter by Search Query (Table, Area, Counter, Payment, Items, or Log descriptions)
  const displayedBills = baseCounterBills.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const bLogs = getBillEditLogs(b);
    return (
      (b.tokenNo && b.tokenNo.toString().includes(q)) ||
      (b.id && b.id.toString().includes(q)) ||
      (b.tableNo || '').toLowerCase().includes(q) ||
      (b.sectionName || '').toLowerCase().includes(q) ||
      (b.counter || '').toLowerCase().includes(q) ||
      (b.paymentDetails?.mode || b.paymentMode || '').toLowerCase().includes(q) ||
      (b.items || []).some((i) => (i.name || '').toLowerCase().includes(q)) ||
      bLogs.some((l) => (l.changeDescription || '').toLowerCase().includes(q))
    );
  });

  const getPaymentModeBadge = (bill) => {
    const details = bill.paymentDetails;
    const modeStr = (typeof details === 'object' && details?.mode) 
      ? details.mode 
      : (typeof details === 'string' ? details : (bill.paymentMode || bill.paymentMethod || 'Cash'));
    const mode = String(modeStr).toLowerCase();

    if (mode === 'cash') {
      return (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
          Cash
        </span>
      );
    }

    if (mode === 'online' || mode === 'upi' || mode.includes('upi')) {
      return (
        <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-md">
          Online UPI
        </span>
      );
    }

    if (mode === 'card') {
      return (
        <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-md">
          Card
        </span>
      );
    }

    if (mode === 'split' || mode.includes('+')) {
      const cashAmt = details?.cash || 0;
      const onlineAmt = details?.online || 0;
      return (
        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center space-x-1">
          <span>Split: {cashAmt || onlineAmt ? `₹${cashAmt} / ₹${onlineAmt}` : modeStr}</span>
        </span>
      );
    }

    return (
      <span className="bg-stone-100 text-stone-800 text-[10px] font-black px-2 py-0.5 rounded-md">
        {modeStr}
      </span>
    );
  };

  const getCounterBadge = (counterName) => {
    const name = counterName || 'Counter 1';
    let colorClass = 'bg-stone-100 text-stone-800 border-stone-200';
    if (name.includes('1')) colorClass = 'bg-blue-50 text-blue-800 border-blue-200';
    else if (name.includes('2')) colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
    else if (name.includes('3')) colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    else if (name.includes('Master')) colorClass = 'bg-purple-50 text-purple-800 border-purple-200';

    return (
      <span className={`border text-[10px] font-black px-2 py-0.5 rounded-md inline-flex items-center space-x-1 ${colorClass}`}>
        <Monitor className="w-3 h-3 opacity-70" />
        <span className="truncate max-w-[130px]">{name}</span>
      </span>
    );
  };

  // Open Bill Modal to Add/Remove items & Resettle
  const handleOpenBillModal = (bill) => {
    setSelectedBill(bill);
    setEditedItems(JSON.parse(JSON.stringify(bill.items || [])));
    setIsEditing(true); // Open directly in edit mode for adding/removing items
    setAddDishId('');

    // Pre-populate charges from settled bill
    const rawDiscVal = bill.discountValue !== undefined && bill.discountValue !== ''
      ? bill.discountValue
      : (bill.discountAmount !== undefined ? bill.discountAmount : (bill.discount || ''));
    setEditedDiscountValue(rawDiscVal ? String(rawDiscVal) : '');
    setEditedDiscountType(bill.discountType || '₹');

    setEditedDeliveryCharge(bill.deliveryCharge ? String(bill.deliveryCharge) : '');
    setEditedContainerCharge(bill.containerCharge ? String(bill.containerCharge) : '');
    setEditedWaiterTip(bill.waiterTip ? String(bill.waiterTip) : '');

    const rawServVal = bill.serviceChargeValue !== undefined && bill.serviceChargeValue !== ''
      ? bill.serviceChargeValue
      : (bill.serviceCharge ? String(bill.serviceCharge) : '');
    setEditedServiceChargeValue(rawServVal ? String(rawServVal) : '');
    setEditedServiceChargeType(bill.serviceChargeType || '₹');
  };

  const handleUpdateItemQty = (index, delta) => {
    const updated = [...editedItems];
    const newQty = (parseFloat(updated[index].qty) || 1) + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].qty = newQty;
    }
    setEditedItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = [...editedItems];
    updated.splice(index, 1);
    setEditedItems(updated);
  };

  const handleAddNewDishToBill = () => {
    if (!addDishId) return;
    const dish = allDishes.find((d) => d.id === parseInt(addDishId) || d.id === addDishId);
    if (!dish) return;

    const existingIdx = editedItems.findIndex((i) => i.id === dish.id || i.name === dish.name);
    if (existingIdx !== -1) {
      const updated = [...editedItems];
      updated[existingIdx].qty = (parseFloat(updated[existingIdx].qty) || 1) + 1;
      setEditedItems(updated);
    } else {
      setEditedItems([
        ...editedItems,
        {
          id: dish.id,
          srNo: dish.srNo,
          name: dish.name,
          price: dish.price || 0,
          qty: 1,
          unit: dish.unit || null
        }
      ]);
    }
    setAddDishId('');
  };

  // Live item subtotal & charges calculations
  const liveItemsSubtotal = editedItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  const parsedEditDisc = parseFloat(editedDiscountValue) || 0;
  const editDiscAmount = editedDiscountType === '%'
    ? Math.round(((liveItemsSubtotal * parsedEditDisc) / 100) * 100) / 100
    : parsedEditDisc;

  const parsedEditService = parseFloat(editedServiceChargeValue) || 0;
  const editServiceAmount = editedServiceChargeType === '%'
    ? Math.round(((liveItemsSubtotal * parsedEditService) / 100) * 100) / 100
    : parsedEditService;

  const editDeliveryAmount = parseFloat(editedDeliveryCharge) || 0;
  const editContainerAmount = parseFloat(editedContainerCharge) || 0;
  const editWaiterTipAmount = parseFloat(editedWaiterTip) || 0;

  const liveCalculatedTotal = Math.max(
    0,
    liveItemsSubtotal - editDiscAmount + editDeliveryAmount + editContainerAmount + editWaiterTipAmount + editServiceAmount
  );
  const liveFinalTotal = Math.round(liveCalculatedTotal * 100) / 100;

  const handleSaveBillModifications = () => {
    if (!selectedBill) return;
    if (!isSettledBillEditEnabled) {
      setToastMessage('Editing settled bills is disabled by owner in UPI Settings.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const updatedBill = {
      ...selectedBill,
      items: editedItems,
      subtotal: liveItemsSubtotal,
      discount: editDiscAmount,
      discountAmount: editDiscAmount,
      discountType: editedDiscountType,
      discountValue: parsedEditDisc,
      deliveryCharge: editDeliveryAmount,
      containerCharge: editContainerAmount,
      waiterTip: editWaiterTipAmount,
      serviceCharge: editServiceAmount,
      serviceChargeType: editedServiceChargeType,
      serviceChargeValue: parsedEditService,
      total: liveFinalTotal,
      finalTotal: liveFinalTotal,
      grandTotal: liveFinalTotal,
      paymentMode: selectedBill.paymentMode || selectedBill.paymentDetails?.mode || 'Cash',
      paymentDetails: selectedBill.paymentDetails && typeof selectedBill.paymentDetails === 'object'
        ? {
            ...selectedBill.paymentDetails,
            cash: (selectedBill.paymentDetails.mode === 'Cash' || !selectedBill.paymentDetails.mode) ? liveFinalTotal : selectedBill.paymentDetails.cash,
            online: (selectedBill.paymentDetails.mode === 'Online' || selectedBill.paymentDetails.mode === 'UPI') ? liveFinalTotal : selectedBill.paymentDetails.online,
            card: selectedBill.paymentDetails.mode === 'Card' ? liveFinalTotal : selectedBill.paymentDetails.card
          }
        : selectedBill.paymentDetails,
      isResettled: true,
      resettledAt: new Date().toISOString()
    };

    const changeDescription = computeDetailedChangeDescription(selectedBill, updatedBill);
    onUpdateSettledBill(updatedBill, changeDescription);
    
    setToastMessage(`Bill (${selectedBill.tableNo || 'Takeaway'}) Resettled Successfully! Total: ₹${liveFinalTotal.toFixed(2)}`);
    setTimeout(() => setToastMessage(null), 3000);

    setSelectedBill(null);
  };

  const relatedLogs = (billLogs || []).filter((log) => String(log.billId) === String(selectedBill?.id));
  const liveTotal = liveFinalTotal;

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-100 overflow-y-auto select-none min-h-0 h-full relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-xl animate-in slide-in-from-top duration-200 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <span>Today's Settled Bills</span>
            </h2>
            {isSettledBillEditEnabled ? (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center space-x-1 shadow-2xs">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Edit: Able</span>
              </span>
            ) : (
              <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center space-x-1 shadow-2xs" title="Bill editing is disabled by owner in Owner > UPI tab">
                <Lock className="w-3 h-3 text-rose-600" />
                <span>Edit: Disabled by Owner</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isSettledBillEditEnabled
              ? "Click any settled bill to view items, modify & resettle, and inspect edit audit logs"
              : "Click any settled bill to view items and reprint receipts (Editing is locked by owner)"}
          </p>
        </div>

        {/* Filter Controls: Today vs All Time vs Edited Bills + Counter Filter + Search */}
        <div className="flex flex-wrap items-center gap-3 pr-12">
          
          {/* Today's vs Edited Bills Toggle */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                timeFilter === 'today'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Bills</span>
            </button>

            <button
              onClick={() => setTimeFilter('edited')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                timeFilter === 'edited'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50'
              }`}
              title="Show only today's settled bills that have been edited or modified"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edited Bills ({totalEditedCount})</span>
            </button>
          </div>

          {/* Counter Filter Dropdown */}
          <div className="flex items-center space-x-1.5 bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={counterFilter}
              onChange={(e) => setCounterFilter(e.target.value)}
              className="text-xs font-bold text-neutral-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All Counters</option>
              {AVAILABLE_COUNTERS.map((c) => (
                <option key={`opt-c-${c.id}`} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table, counter, items, logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-300 text-neutral-900 text-xs font-semibold rounded-xl pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-neutral-900 shadow-2xs"
            />
          </div>

        </div>
      </div>

      {/* Full Bills Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-extrabold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Table / Area</th>
                <th className="py-3.5 px-4">Counter</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Payment Mode</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Edit / Audit Logs</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    {timeFilter === 'edited'
                      ? 'No edited bills found matching current filters.'
                      : 'No settled bills found matching current filters.'}
                  </td>
                </tr>
              ) : (
                displayedBills.map((bill, bIdx) => {
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
                  const logsForBill = getBillEditLogs(bill);
                  const isEdited = isBillEdited(bill);

                  return (
                    <tr
                      key={`settled-row-${bill.id || bIdx}`}
                      onClick={() => handleOpenBillModal(bill)}
                      className={`cursor-pointer transition-colors ${
                        isEdited
                          ? 'bg-amber-50/25 hover:bg-amber-50/60 border-l-4 border-l-amber-500'
                          : 'hover:bg-blue-50/50'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="font-extrabold text-neutral-900">{bill.tableNo || 'Takeaway'}</div>
                          {isEdited && (
                            <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs">
                              EDITED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-500 font-medium">
                          {bill.isPreOrderAdvance ? (
                            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-black inline-block mt-0.5">
                              Pre-Order Advance (अ‍ॅडव्हान्स जमा)
                            </span>
                          ) : bill.isPreOrderSettlement ? (
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-black inline-block mt-0.5">
                              Pre-Order Settled (शिल्लक जमा)
                            </span>
                          ) : (
                            bill.sectionName || 'Dine In'
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getCounterBadge(bill.counter)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="max-w-[220px] truncate text-stone-700 font-semibold" title={(bill.items || []).map(i => `${i.name} (${i.unit || i.qty})`).join(', ')}>
                          {(bill.items || []).map((i) => `${i.name} × ${i.unit || i.qty}`).join(', ') || 'No Items'}
                        </div>
                        <div className="text-[10px] text-stone-400 font-bold">
                          {bill.items?.length || 0} item lines
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getPaymentModeBadge(bill)}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 font-medium">
                        <div>{formattedDate}</div>
                        <div className="text-[10px] text-stone-400">{formattedTime}</div>
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        {isEdited ? (
                          <div className="space-y-1 max-w-[260px]">
                            <div className="flex items-center space-x-1.5">
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md inline-flex items-center space-x-1">
                                <History className="w-3 h-3 text-amber-700" />
                                <span>Edited ({logsForBill.length || 1})</span>
                              </span>
                            </div>
                            {logsForBill.length > 0 ? (
                              <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-2 text-xs shadow-2xs">
                                <div className="text-[10px] font-extrabold text-amber-800 flex items-center justify-between">
                                  <span>{logsForBill[logsForBill.length - 1].timestamp}</span>
                                  <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1 rounded font-black">Latest</span>
                                </div>
                                <div className="text-[11px] text-amber-950 font-semibold mt-0.5 line-clamp-2" title={logsForBill[logsForBill.length - 1].changeDescription}>
                                  {logsForBill[logsForBill.length - 1].changeDescription}
                                </div>
                                {logsForBill.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenBillModal(bill)}
                                    className="text-[10px] font-black text-amber-700 hover:text-amber-900 underline mt-1 block cursor-pointer"
                                  >
                                    View all {logsForBill.length} edit logs →
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-1.5">
                                Resettled & Modified
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-semibold text-[11px] inline-flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5 text-slate-300" />
                            <span>Original (Unchanged)</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-sm text-neutral-900">
                          ₹{(bill.total !== undefined ? bill.total : (bill.finalTotal || 0)).toFixed(2)}
                        </div>
                        {bill.isPreOrderSettlement && bill.orderTotal && (
                          <div className="text-[9.5px] text-slate-500 font-bold">
                            Total: ₹{Number(bill.orderTotal).toFixed(0)} (Adv: ₹{Number(bill.advancePaid || 0).toFixed(0)})
                          </div>
                        )}
                        {bill.isPreOrderAdvance && (
                          <div className="text-[9.5px] text-amber-700 font-bold">
                            Advance Collected
                          </div>
                        )}
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
                                <span className="text-[10px] font-bold text-slate-400 block w-full text-right">
                                  Subtotal: ₹{Number(bill.subtotal).toFixed(2)}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              printThermalReceipt(bill, { language: printLanguage });
                            }}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                            title="Reprint Bill Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={!isSettledBillEditEnabled}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isSettledBillEditEnabled) return;
                              handleOpenBillModal(bill);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center space-x-1 transition-all shadow-2xs ${
                              isSettledBillEditEnabled
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                            }`}
                            title={isSettledBillEditEnabled ? 'Edit and resettle this bill' : 'Editing settled bills is disabled by owner in Owner > UPI Tab'}
                          >
                            {isSettledBillEditEnabled ? <Edit3 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{isSettledBillEditEnabled ? 'Edit / Resettle' : 'Edit Disabled'}</span>
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

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs font-bold text-slate-500">
          <span>Showing {displayedBills.length} settled orders</span>
          <span>Total: ₹{displayedBills.reduce((s, b) => s + (b.total || 0), 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Bill View / Edit / Resettle Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isSettledBillEditEnabled ? 'Edit & Resettle Bill' : 'View Settled Bill'}: {selectedBill.tableNo || 'Takeaway'}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                    <span>{selectedBill.sectionName || 'Dine In Area'}</span>
                    <span>•</span>
                    <span>{selectedBill.counter || 'Counter 1'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const billToReprint = {
                      ...selectedBill,
                      items: editedItems,
                      subtotal: liveItemsSubtotal,
                      discount: editDiscAmount,
                      discountAmount: editDiscAmount,
                      discountType: editedDiscountType,
                      deliveryCharge: editDeliveryAmount,
                      containerCharge: editContainerAmount,
                      waiterTip: editWaiterTipAmount,
                      serviceCharge: editServiceAmount,
                      total: liveFinalTotal,
                      finalTotal: liveFinalTotal,
                      grandTotal: liveFinalTotal
                    };
                    printThermalReceipt(billToReprint, { language: printLanguage });
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all border border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Reprint Receipt</span>
                </button>

                <button
                  onClick={() => setSelectedBill(null)}
                  className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              
              {/* Security Warning Banner when Disabled by Owner */}
              {!isSettledBillEditEnabled && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-2xs">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>View-Only Mode: Bill editing is disabled by owner in Owner &gt; UPI Tab. Modifying items or resettling is locked.</span>
                </div>
              )}

              {/* Payment & Grand Total Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 font-bold block">Payment Mode</span>
                  <div className="mt-0.5">{getPaymentModeBadge(selectedBill)}</div>
                </div>
                <div className="text-center">
                  <span className="text-slate-500 font-bold block">Items Subtotal</span>
                  <span className="text-sm font-extrabold text-slate-700">₹{liveItemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-bold block">Net Total Amount</span>
                  <span className="text-lg font-black text-blue-600">₹{liveFinalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Items List (Add / Remove Items & Adjust Quantities) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider">
                    Add / Remove Items in Bill
                  </span>
                  <span className="text-xs font-bold text-stone-400">
                    {editedItems.length} item lines
                  </span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                  {editedItems.length === 0 ? (
                    <div className="p-4 text-center text-stone-400 font-semibold text-xs">
                      No items in bill. Add a dish below to resettle.
                    </div>
                  ) : (
                    editedItems.map((item, idx) => {
                      const itemQty = item.qty !== undefined ? item.qty : 1;
                      const lineAmount = (item.price || 0) * itemQty;

                      return (
                        <div
                          key={`modal-item-${item.id || item.name}-${idx}`}
                          className="p-3 flex items-center justify-between text-xs bg-white"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <h4 className="font-extrabold text-neutral-900">{item.name}</h4>
                              {item.isParcel && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded">
                                  📦 Parcel
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-stone-500 font-medium">
                                ₹{item.price} {item.unit ? `(${item.unit})` : ''} • Line: ₹{lineAmount}
                              </span>
                              {isSettledBillEditEnabled && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editedItems];
                                    updated[idx].isParcel = !updated[idx].isParcel;
                                    setEditedItems(updated);
                                  }}
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded cursor-pointer border ${
                                    item.isParcel
                                      ? 'bg-amber-500 text-white border-amber-600'
                                      : 'bg-stone-100 text-stone-600 hover:bg-amber-50 border-stone-200'
                                  }`}
                                >
                                  {item.isParcel ? '📦 Parcel ✓' : '+ Parcel'}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {isSettledBillEditEnabled ? (
                              <>
                                {/* (-) and (+) Qty Stepper */}
                                <div className="flex items-center space-x-1 bg-stone-100 border border-stone-300 rounded-lg p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQty(idx, -1)}
                                    className="w-6 h-6 hover:bg-stone-200 text-stone-800 font-black rounded flex items-center justify-center cursor-pointer"
                                    title="Reduce quantity"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="font-black px-2 text-xs text-neutral-900">{itemQty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQty(idx, 1)}
                                    className="w-6 h-6 hover:bg-stone-200 text-stone-800 font-black rounded flex items-center justify-center cursor-pointer"
                                    title="Increase quantity"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Remove Item Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                                  title="Remove item from bill"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="font-black px-2.5 py-1 text-xs text-neutral-800 bg-stone-100 rounded-lg border border-stone-200">
                                Qty: {itemQty}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Dish Selector Dropdown */}
                {isSettledBillEditEnabled && (
                  <div className="flex items-center space-x-2 pt-2">
                    <select
                      value={addDishId}
                      onChange={(e) => setAddDishId(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 cursor-pointer"
                    >
                      <option value="">+ Select dish to add to this bill...</option>
                      {allDishes.map((d) => (
                        <option key={`add-dish-opt-${d.id}`} value={d.id}>
                          #{d.srNo || d.id} - {d.name} (₹{d.price})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddNewDishToBill}
                      disabled={!addDishId}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-40 shadow-2xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Optional Charges & Discounts Section (Requirement 9 & Followup) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                  Optional Charges & Discounts
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                  {/* 1. Discount */}
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-700">1. Discount</span>
                      {isSettledBillEditEnabled && (
                        <button
                          type="button"
                          onClick={() => setEditedDiscountType(editedDiscountType === '₹' ? '%' : '₹')}
                          className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer shadow-2xs"
                          title="Toggle Price (₹) or Percentage (%)"
                        >
                          {editedDiscountType}
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      disabled={!isSettledBillEditEnabled}
                      placeholder={`0 (${editedDiscountType})`}
                      value={editedDiscountValue}
                      onChange={(e) => setEditedDiscountValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs disabled:opacity-60"
                    />
                    {editDiscAmount > 0 && (
                      <span className="text-[10px] font-black text-emerald-600 mt-0.5 block truncate">
                        -₹{editDiscAmount.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* 2. Delivery Charge */}
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <span className="font-extrabold text-slate-700 block mb-1">2. Delivery (₹)</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      disabled={!isSettledBillEditEnabled}
                      placeholder="₹ 0"
                      value={editedDeliveryCharge}
                      onChange={(e) => setEditedDeliveryCharge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs disabled:opacity-60"
                    />
                  </div>

                  {/* 3. Container Charge */}
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <span className="font-extrabold text-slate-700 block mb-1">3. Container (₹)</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      disabled={!isSettledBillEditEnabled}
                      placeholder="₹ 0"
                      value={editedContainerCharge}
                      onChange={(e) => setEditedContainerCharge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs disabled:opacity-60"
                    />
                  </div>

                  {/* 4. Waiter Tip */}
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <span className="font-extrabold text-slate-700 block mb-1">4. Waiter Tip (₹)</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      disabled={!isSettledBillEditEnabled}
                      placeholder="₹ 0"
                      value={editedWaiterTip}
                      onChange={(e) => setEditedWaiterTip(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs disabled:opacity-60"
                    />
                  </div>

                  {/* 5. Service Charge */}
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-700">5. Service Chg</span>
                      {isSettledBillEditEnabled && (
                        <button
                          type="button"
                          onClick={() => setEditedServiceChargeType(editedServiceChargeType === '₹' ? '%' : '₹')}
                          className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer shadow-2xs"
                          title="Toggle Price (₹) or Percentage (%)"
                        >
                          {editedServiceChargeType}
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      disabled={!isSettledBillEditEnabled}
                      placeholder={`0 (${editedServiceChargeType})`}
                      value={editedServiceChargeValue}
                      onChange={(e) => setEditedServiceChargeValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-black text-slate-900 outline-none text-xs disabled:opacity-60"
                    />
                    {editServiceAmount > 0 && (
                      <span className="text-[10px] font-black text-blue-600 mt-0.5 block truncate">
                        +₹{editServiceAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Audit History Logs */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                  <History className="w-3.5 h-3.5 text-amber-600" />
                  <span>Resettle & Modification Audit Logs ({relatedLogs.length})</span>
                </span>
                {relatedLogs.length > 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto text-xs">
                    {relatedLogs.map((log, lIdx) => (
                      <div key={`log-${lIdx}`} className="text-amber-950 font-medium border-b border-amber-100 last:border-0 pb-1.5">
                        <span className="text-amber-700 font-bold font-mono text-[10px]">[{log.timestamp}]</span>{' '}
                        <span className="font-semibold">{log.changeDescription}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-500 font-medium italic">
                    No modifications recorded yet. Any item or price changes made will appear here and in the Settled tab.
                  </div>
                )}
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-500">
                {isSettledBillEditEnabled ? (
                  <>Resettling will update bill total to <span className="font-black text-slate-900">₹{liveTotal.toFixed(2)}</span></>
                ) : (
                  <>Bill Total: <span className="font-black text-slate-900">₹{liveTotal.toFixed(2)}</span> (Read-Only)</>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="bg-white border border-stone-300 text-stone-700 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer hover:bg-stone-50"
                >
                  {isSettledBillEditEnabled ? 'Cancel' : 'Close'}
                </button>
                {isSettledBillEditEnabled ? (
                  <button
                    type="button"
                    onClick={handleSaveBillModifications}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Resettle Bill</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Editing Disabled by Owner</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
