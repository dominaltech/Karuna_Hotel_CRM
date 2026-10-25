import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CalendarClock,
  Plus,
  Minus,
  Trash2,
  Search,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  Phone,
  IndianRupee,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Check,
  X,
  CreditCard,
  Edit2,
  FileText,
  AlertCircle,
  Copy,
  Receipt,
  RotateCcw,
  Camera,
  Image as ImageIcon,
  Upload,
  Eye,
  Download
} from 'lucide-react';
import { printPreOrderReceipt, formatReceiptDate, formatItemQtyDisplay, getPrintDishName } from '../utils/receiptUtils';
import { generatePreOrderNumber, checkPreOrderAlert } from '../db/db';
import QuantityInputModal from './QuantityInputModal';

export default function PreOrderManagement({
  preOrders = [],
  dishes = [],
  categories = [],
  subCategories = [],
  onAddPreOrder,
  onUpdatePreOrder,
  onDeletePreOrder,
  onSettlePreOrderToBill,
  printLanguage = 'mr',
  activeCounter = 'Counter 1'
}) {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'create' | 'edit'
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'tomorrow' | 'today' | 'upcoming'
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTabCatId, setActiveTabCatId] = useState('all');
  const [dishSearchQuery, setDishSearchQuery] = useState('');

  // Editing existing order
  const [editingOrderId, setEditingOrderId] = useState(null);

  // New Pre-Order Form State
  const [cartItems, setCartItems] = useState([]);
  const [selectedDishForQty, setSelectedDishForQty] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Default delivery date: tomorrow
  const getTomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [deliveryDate, setDeliveryDate] = useState(getTomorrowDateStr());
  const [deliveryTime, setDeliveryTime] = useState('11:00');
  const [discount, setDiscount] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [advancePaymentMode, setAdvancePaymentMode] = useState('Cash');
  const [isFullPayment, setIsFullPayment] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [attachedImages, setAttachedImages] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);
  const [formError, setFormError] = useState('');

  // Keyboard Enter navigation refs for rapid form entry
  const customerNameInputRef = useRef(null);
  const customerPhoneInputRef = useRef(null);
  const deliveryDateInputRef = useRef(null);
  const deliveryTimeInputRef = useRef(null);
  const discountInputRef = useRef(null);
  const advancePaymentInputRef = useRef(null);
  const orderNotesInputRef = useRef(null);

  // Custom bulk item modal / popover
  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemQty, setCustomItemQty] = useState('1');
  const [customItemUnit, setCustomItemUnit] = useState('Kg');
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Settle Modal State
  const [settleModalOrder, setSettleModalOrder] = useState(null);
  const [settlePaymentMode, setSettlePaymentMode] = useState('Cash');

  // Sweets weight quick modal/drawer
  const [selectedSweetDish, setSelectedSweetDish] = useState(null);
  const [customKgInput, setCustomKgInput] = useState('');

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live financial calculations (Subtotal, Discount, Net Total, Advance, Balance)
  const subtotalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseFloat(item.qty) || 1;
      return sum + (price * qty);
    }, 0);
  }, [cartItems]);

  const discountNum = Math.max(0, parseFloat(discount) || 0);
  const totalAmount = Math.max(0, subtotalAmount - discountNum);
  const advanceNum = parseFloat(advancePayment) || 0;
  const balanceAmount = Math.max(0, totalAmount - advanceNum);

  // Toggle 100% Full Payment Option
  const handleToggleFullPayment = () => {
    if (!isFullPayment) {
      setIsFullPayment(true);
      if (totalAmount > 0) {
        setAdvancePayment(String(totalAmount));
      }
    } else {
      setIsFullPayment(false);
      setAdvancePayment('');
    }
  };

  // Handle Advance Payment input with auto-detection of full payment
  const handleAdvanceInputChange = (val) => {
    setAdvancePayment(val);
    const num = parseFloat(val) || 0;
    if (totalAmount > 0 && num >= totalAmount) {
      setIsFullPayment(true);
    } else {
      setIsFullPayment(false);
    }
  };

  // Keep full payment in sync if total changes while full payment is toggled on
  useEffect(() => {
    if (isFullPayment && totalAmount > 0) {
      setAdvancePayment(String(totalAmount));
    }
  }, [totalAmount, isFullPayment]);

  // Filtered menu dishes for item selection
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      if (!dish) return false;
      if (activeTabCatId !== 'all' && String(dish.categoryId) !== String(activeTabCatId)) {
        return false;
      }
      if (dishSearchQuery.trim()) {
        const q = dishSearchQuery.toLowerCase().trim();
        const matchesName = (dish.name || '').toLowerCase().includes(q);
        const matchesMarathi = (dish.marathiName || '').toLowerCase().includes(q);
        const matchesSrNo = String(dish.srNo || '').includes(q);
        return matchesName || matchesMarathi || matchesSrNo;
      }
      return true;
    });
  }, [dishes, activeTabCatId, dishSearchQuery]);

  // Enriched Pre-Orders with Alert Status & Stats (Strictly Upcoming - Excludes Delivered & Cancelled)
  const upcomingPreOrders = useMemo(() => {
    return (preOrders || [])
      .filter((order) => {
        if (!order || order.status === 'cancelled') return false;
        if (order.status === 'completed' && order.deliveryStatus === 'delivered') return false;
        if (order.status === 'completed' && !order.isFullPayment && order.settledAt) return false;
        return true;
      })
      .map((order) => {
        const alertInfo = checkPreOrderAlert(order.deliveryDate);
        return {
          ...order,
          alertInfo
        };
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.deliveryDate || '2099-01-01'}T${a.deliveryTime || '00:00'}`);
        const dateB = new Date(`${b.deliveryDate || '2099-01-01'}T${b.deliveryTime || '00:00'}`);
        return dateA - dateB;
      });
  }, [preOrders]);

  // Overall Statistics for Upcoming Pre-Orders
  const stats = useMemo(() => {
    let dueTomorrowCount = 0;
    let dueTodayCount = 0;
    let upcomingCount = 0;
    let totalAdvance = 0;
    let totalBalance = 0;

    upcomingPreOrders.forEach((o) => {
      if (o.alertInfo?.isTomorrow) dueTomorrowCount++;
      else if (o.alertInfo?.isToday) dueTodayCount++;
      else upcomingCount++;

      totalAdvance += (parseFloat(o.advancePayment) || 0);
      totalBalance += (parseFloat(o.balanceAmount !== undefined ? o.balanceAmount : (o.totalAmount - o.advancePayment)) || 0);
    });

    return {
      dueTomorrowCount,
      dueTodayCount,
      upcomingCount,
      totalActive: upcomingPreOrders.length,
      totalAdvance,
      totalBalance
    };
  }, [upcomingPreOrders]);

  // Filtered Upcoming Pre-Orders List (strictly upcoming orders, no completed or cancelled)
  const displayedOrders = useMemo(() => {
    return upcomingPreOrders.filter((order) => {
      // Status filter
      if (selectedFilter === 'tomorrow') {
        if (!order.alertInfo?.isTomorrow) return false;
      } else if (selectedFilter === 'today') {
        if (!order.alertInfo?.isToday) return false;
      } else if (selectedFilter === 'upcoming') {
        if (order.alertInfo?.isTomorrow || order.alertInfo?.isToday || order.alertInfo?.isOverdue) return false;
      }

      // Date picker filter
      if (dateFilter && order.deliveryDate !== dateFilter) {
        return false;
      }

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (order.customerName || '').toLowerCase().includes(q);
        const matchesPhone = (order.customerPhone || '').includes(q);
        const matchesNo = (order.orderNo || '').toLowerCase().includes(q);
        const matchesItems = (order.items || []).some((i) => (i.name || '').toLowerCase().includes(q));
        return matchesName || matchesPhone || matchesNo || matchesItems;
      }

      return true;
    });
  }, [upcomingPreOrders, selectedFilter, dateFilter, searchQuery]);

  // Helper: check if dish is sweet / kg
  const isSweetsDish = (dish) => {
    if (!dish) return false;
    if (dish.pricePerKg) return true;
    if (dish.categoryId === 2) return true;
    if (dish.counter && dish.counter.toLowerCase().includes('sweet')) return true;
    if (dish.categoryName && dish.categoryName.toLowerCase().includes('sweet')) return true;
    if (dish.unit && (dish.unit.toLowerCase().includes('kg') || dish.unit.toLowerCase().includes('g'))) return true;
    if (dish.name && (dish.name.toLowerCase().includes('(by kg)') || dish.name.toLowerCase().includes('/kg') || dish.name.toLowerCase().includes(' kg'))) return true;
    if (dish.variants && dish.variants.some(v => v.unit && (v.unit.toLowerCase().includes('kg') || v.unit.toLowerCase().includes('g')))) return true;
    if (dish.hasMultiplePrices) return true;
    return false;
  };

  // Add Item to Cart
  const handleAddToCart = (dish, customOption = null) => {
    const isSweet = isSweetsDish(dish);

    if (isSweet && !customOption) {
      setSelectedSweetDish(dish);
      setCustomKgInput('');
      return;
    }

    const price = customOption?.price !== undefined ? customOption.price : (dish.price || 0);
    const unit = customOption?.unit || dish.unit || (isSweet ? '1 Kg' : 'Plate');
    const weightKg = customOption?.weightKg !== undefined ? customOption.weightKg : (dish.weightKg || (unit.includes('Kg') ? parseFloat(unit) || 1 : null));
    const qtyToAdd = customOption?.qty !== undefined ? customOption.qty : 1;

    setCartItems((prev) => {
      // Match existing item by id and unit
      const existingIdx = prev.findIndex((i) => i.id === dish.id && i.unit === unit);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: updated[existingIdx].qty + qtyToAdd
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: dish.id,
            name: dish.name,
            marathiName: dish.marathiName,
            price: price,
            unit: unit,
            weightKg: weightKg,
            qty: qtyToAdd,
            categoryId: dish.categoryId
          }
        ];
      }
    });

    setSelectedSweetDish(null);
  };

  // Confirm quantity from QuantityInputModal for Pre-Order
  const handleConfirmQuantityPreOrder = ({ dish, qty, price, unit, weightKg }) => {
    handleAddToCart(dish, { qty, price, unit, weightKg });
    setSelectedDishForQty(null);
  };

  // Add Custom Bulk Item
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!customItemName.trim()) return;
    const price = parseFloat(customItemPrice) || 0;
    const qty = parseFloat(customItemQty) || 1;

    setCartItems((prev) => [
      ...prev,
      {
        id: `custom_${Date.now()}`,
        name: customItemName.trim(),
        marathiName: customItemName.trim(),
        price: price,
        unit: customItemUnit.trim() || 'Custom',
        qty: qty,
        isCustom: true
      }
    ]);

    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemQty('1');
    setIsCustomItemOpen(false);
  };

  // Increment / Decrement Cart Item
  const handleUpdateQty = (index, delta) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      if (!cur) return prev;
      const newQty = cur.qty + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = { ...cur, qty: newQty };
      return updated;
    });
  };

  // Remove Cart Item
  const handleRemoveCartItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Image Upload & Compression
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setAttachedImages((prev) => [...prev, compressedDataUrl]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Remove attached image
  const handleRemoveImage = (index) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset Form
  const handleResetForm = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryDate(getTomorrowDateStr());
    setDeliveryTime('11:00');
    setDiscount('');
    setAdvancePayment('');
    setIsFullPayment(false);
    setAdvancePaymentMode('Cash');
    setOrderNotes('');
    setAttachedImages([]);
    setFormError('');
    setEditingOrderId(null);
    setCurrentView('list');
  };

  // Open Edit Form for Pre-Order
  const handleStartEdit = (order) => {
    setEditingOrderId(order.id);
    setCartItems(order.items || []);
    setCustomerName(order.customerName || '');
    setCustomerPhone(order.customerPhone || '');
    setDeliveryDate(order.deliveryDate || getTomorrowDateStr());
    setDeliveryTime(order.deliveryTime || '11:00');
    setDiscount(order.discount !== undefined && order.discount !== '' ? String(order.discount) : '');
    setAdvancePayment(String(order.advancePayment || ''));
    setIsFullPayment(Boolean(order.isFullPayment || order.fullPaymentPaid || (order.balanceAmount === 0 && (parseFloat(order.advancePayment) || 0) >= (parseFloat(order.totalAmount) || 0))));
    setAdvancePaymentMode(order.advancePaymentMode || 'Cash');
    setOrderNotes(order.notes || '');
    setAttachedImages(Array.isArray(order.images) ? order.images : (order.image ? [order.image] : []));
    setFormError('');
    setCurrentView('create');
  };

  // Save Pre-Order (New or Edit)
  const handleSavePreOrder = async (shouldPrint = false) => {
    setFormError('');

    if (cartItems.length === 0) {
      setFormError('कृपया या बल्क ऑर्डरसाठी किमान एक पदार्थ निवडा! (Please select at least one item)');
      return;
    }

    if (!customerName.trim()) {
      setFormError('कृपया ग्राहकाचे पूर्ण नाव टाका! (Please enter customer name)');
      return;
    }

    if (!customerPhone.trim()) {
      setFormError('कृपया ग्राहकाचा १० अंकी मोबाईल नंबर टाका! (Please enter 10-digit mobile number)');
      return;
    }

    if (!deliveryDate) {
      setFormError('कृपया डिलिव्हरी / ऑर्डर तारीख निवडा! (Please select delivery date)');
      return;
    }

    const isOrderFullyPaid = Boolean(isFullPayment || (totalAmount > 0 && advanceNum >= totalAmount));

    const orderData = {
      orderNo: editingOrderId ? (preOrders.find((o) => o.id === editingOrderId)?.orderNo || generatePreOrderNumber()) : generatePreOrderNumber(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime || '11:00',
      items: cartItems,
      subtotal: subtotalAmount,
      discount: discountNum,
      totalAmount: totalAmount,
      advancePayment: isOrderFullyPaid ? totalAmount : advanceNum,
      advancePaymentMode: advancePaymentMode,
      balanceAmount: isOrderFullyPaid ? 0 : balanceAmount,
      isFullPayment: isOrderFullyPaid,
      fullPaymentPaid: isOrderFullyPaid,
      paymentStatus: isOrderFullyPaid ? 'fully_paid' : (advanceNum > 0 ? 'advance_paid' : 'unpaid'),
      images: attachedImages,
      notes: orderNotes.trim(),
      status: isOrderFullyPaid ? 'confirmed' : 'pending',
      deliveryStatus: 'pending',
      bookedByCounter: activeCounter,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingOrderId) {
        await onUpdatePreOrder(editingOrderId, orderData);
        showToast(`Pre-Order ${orderData.orderNo} updated successfully!`);
      } else {
        orderData.createdAt = new Date().toISOString();
        const newId = await onAddPreOrder(orderData);
        orderData.id = newId;
        showToast(`Pre-Order ${orderData.orderNo} booked successfully!`);
      }

      if (shouldPrint) {
        printPreOrderReceipt(orderData, { language: printLanguage });
      }

      handleResetForm();
    } catch (err) {
      console.error('Error saving pre-order:', err);
      setFormError('Failed to save pre-order: ' + err.message);
    }
  };

  // Convert Pre-Order to Settled POS Bill
  const handleConfirmSettleBill = async () => {
    if (!settleModalOrder) return;
    try {
      await onSettlePreOrderToBill(settleModalOrder, settlePaymentMode);
      showToast(`Pre-Order ${settleModalOrder.orderNo} settled into final bill!`);
      setSettleModalOrder(null);
    } catch (err) {
      console.error('Error settling pre-order:', err);
      alert('Failed to settle pre-order to bill: ' + err.message);
    }
  };

  // Print Pre-Order Slip
  const handlePrintSlip = (order) => {
    printPreOrderReceipt(order, { language: printLanguage });
    showToast(`Printing slip for ${order.orderNo}...`);
  };

  // Quick preset delivery times
  const timePresets = [
    { label: 'Morning (08:00 AM)', value: '08:00' },
    { label: 'Brunch (11:00 AM)', value: '11:00' },
    { label: 'Lunch (01:00 PM)', value: '13:00' },
    { label: 'Tea Time (04:30 PM)', value: '16:30' },
    { label: 'Evening (07:00 PM)', value: '19:00' },
    { label: 'Dinner (08:30 PM)', value: '20:30' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / System Alert for Due Tomorrow Orders */}
      {stats.dueTomorrowCount > 0 && selectedFilter !== 'tomorrow' && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white px-4 py-2 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-full bg-white animate-ping mr-1 inline-block" />
            <AlertTriangle className="w-5 h-5 text-yellow-200 shrink-0" />
            <div className="flex items-center gap-2 text-xs font-black tracking-wide">
              <span>SYSTEM PRE-ORDER ALERT:</span>
              <span className="bg-black/30 px-2 py-0.5 rounded-md font-mono">
                {stats.dueTomorrowCount} Bulk Order{stats.dueTomorrowCount > 1 ? 's' : ''} Due Tomorrow!
              </span>
              <span className="hidden md:inline text-amber-100 font-medium">
                Preparation required today. Check order items & balances.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedFilter('tomorrow');
              setCurrentView('list');
            }}
            className="px-3 py-1 bg-white text-orange-900 hover:bg-orange-50 rounded-xl text-xs font-black shadow-xs transition cursor-pointer shrink-0"
          >
            View Due Orders →
          </button>
        </div>
      )}

      {/* Main Top Header Controls */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-3 shrink-0">
        
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-200">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Bulk Pre-Orders Management
              </h2>
              <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                बल्क प्री-ऑर्डर
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Accept advanced catering & bulk sweet bookings with auto-balance calculation and 1-day advance preparation alerts.
            </p>
          </div>
        </div>

        {/* Action Toggle: View List vs Create New */}
        <div className="flex items-center space-x-2">
          {currentView === 'create' ? (
            <button
              onClick={handleResetForm}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back to Orders List</span>
            </button>
          ) : (
            <button
              onClick={() => {
                handleResetForm();
                setCurrentView('create');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-orange-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Take Bulk Pre-Order</span>
            </button>
          )}
        </div>

      </div>

      {/* CONTENT AREA */}
      {currentView === 'create' ? (
        /* CREATE / EDIT ORDER WORKFLOW */
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SECTION: Item Selection Menu */}
          <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-200 overflow-hidden">
            
            {/* Search and Category Filter Toolbar */}
            <div className="p-3 bg-white border-b border-slate-200 space-y-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={dishSearchQuery}
                    onChange={(e) => setDishSearchQuery(e.target.value)}
                    placeholder="मेनू पदार्थ नाव, मराठी नाव किंवा नंबरने शोधा... (Search menu dish)"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                  {dishSearchQuery && (
                    <button
                      onClick={() => setDishSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomItemOpen(true)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                  title="Add custom item not listed in regular menu (e.g. Special Box, Buffet Item)"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>+ सानुकूल पदार्थ (+ Custom Item)</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setActiveTabCatId('all')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                    activeTabCatId === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={`pre-cat-${cat.id}`}
                    onClick={() => setActiveTabCatId(cat.id)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                      activeTabCatId === cat.id
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Dish Cards Grid */}
            <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 content-start">
              {filteredDishes.map((dish) => {
                const isSweet = isSweetsDish(dish);
                const printTitle = getPrintDishName(dish, printLanguage);

                return (
                  <div
                    key={`pre-dish-${dish.id}`}
                    onClick={() => {
                      if (isSweet) {
                        setSelectedSweetDish(dish);
                        setSelectedDishForQty(null);
                        setCustomKgInput('');
                      } else {
                        setSelectedSweetDish(null);
                        setSelectedDishForQty(dish);
                      }
                    }}
                    className={`bg-white border rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer group active:scale-98 select-none ${
                      selectedSweetDish?.id === dish.id
                        ? 'border-pink-500 ring-2 ring-pink-300 shadow-md bg-pink-50/20'
                        : selectedDishForQty?.id === dish.id
                        ? 'border-orange-500 ring-2 ring-orange-300 shadow-md bg-orange-50/20'
                        : 'border-slate-200 hover:border-orange-400 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>#{dish.srNo || dish.id}</span>
                        {isSweet && (
                          <span className="bg-pink-100 text-pink-700 font-extrabold px-1.5 py-0.5 rounded-md uppercase text-[9px]">
                            By Kg
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-orange-600 transition line-clamp-2">
                        {printTitle}
                      </h4>
                      {printLanguage === 'mr' && dish.marathiName && dish.name !== dish.marathiName && (
                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                          {dish.name}
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">
                        ₹{dish.pricePerKg ? `${dish.pricePerKg}/Kg` : dish.price}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-orange-50 group-hover:bg-orange-600 group-hover:text-white text-orange-600 flex items-center justify-center text-xs font-black transition">
                        +
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal for Sweets Weight Selection (Quick Portions in Kg) */}
            {selectedSweetDish && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-black text-pink-600 uppercase tracking-wider">
                        Select Bulk Weight
                      </span>
                      <h3 className="text-sm font-black text-slate-900">
                        {getPrintDishName(selectedSweetDish, printLanguage)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Base Rate: ₹{selectedSweetDish.pricePerKg || selectedSweetDish.price || 300}/Kg
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSweetDish(null)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Standard Kg Presets */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { unit: '250g', weightKg: 0.25 },
                      { unit: '500g', weightKg: 0.5 },
                      { unit: '1 Kg', weightKg: 1 },
                      { unit: '2 Kg', weightKg: 2 },
                      { unit: '3 Kg', weightKg: 3 },
                      { unit: '5 Kg', weightKg: 5 },
                      { unit: '10 Kg', weightKg: 10 },
                      { unit: '20 Kg', weightKg: 20 }
                    ].map((opt) => {
                      const ratePerKg = selectedSweetDish.pricePerKg || selectedSweetDish.price || (selectedSweetDish.variants?.[0]?.price ? selectedSweetDish.variants[0].price * 4 : 320);
                      const optPrice = Math.round(opt.weightKg * ratePerKg);
                      return (
                        <button
                          key={opt.unit}
                          onClick={() => handleAddToCart(selectedSweetDish, {
                            unit: opt.unit,
                            weightKg: opt.weightKg,
                            price: optPrice,
                            qty: 1
                          })}
                          className="p-2.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-400 rounded-xl text-center transition cursor-pointer"
                        >
                          <div className="text-xs font-black text-slate-900">{opt.unit}</div>
                          <div className="text-[10px] font-bold text-orange-600">₹{optPrice}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Weight in Kg */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                      Or Custom Weight (in Kg):
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        value={customKgInput}
                        onChange={(e) => setCustomKgInput(e.target.value)}
                        placeholder="e.g. 7.5 (Kg)"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => {
                          const kg = parseFloat(customKgInput);
                          if (!kg || isNaN(kg) || kg <= 0) return;
                          const ratePerKg = selectedSweetDish.pricePerKg || selectedSweetDish.price || 320;
                          const calcPrice = Math.round(kg * ratePerKg);
                          handleAddToCart(selectedSweetDish, {
                            unit: `${kg} Kg`,
                            weightKg: kg,
                            price: calcPrice,
                            qty: 1
                          });
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        वजन जोडा (Add Weight)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Bulk Item Modal */}
            {isCustomItemOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-900">
                      नवीन सानुकूल पदार्थ जोडा (Add Custom Item)
                    </h3>
                    <button
                      onClick={() => setIsCustomItemOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddCustomItem} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                        पदार्थाचे नाव / तपशील (Item Name):
                      </label>
                      <input
                        type="text"
                        required
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        placeholder="उदा. स्पेशल मावा बर्फी १० किलो बॉक्स"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                          एकक / युनिट (Unit):
                        </label>
                        <input
                          type="text"
                          value={customItemUnit}
                          onChange={(e) => setCustomItemUnit(e.target.value)}
                          placeholder="उदा. किलो (Kg), बॉक्स, पॅक"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                          नग / प्रमाण (Quantity):
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={customItemQty}
                          onChange={(e) => setCustomItemQty(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                        दर / किंमत प्रति युनिट (Rate ₹):
                      </label>
                      <input
                        type="number"
                        step="1"
                        required
                        value={customItemPrice}
                        onChange={(e) => setCustomItemPrice(e.target.value)}
                        placeholder="किंमत ₹ मध्ये टाका"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCustomItemOpen(false)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        रद्द करा (Cancel)
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-sm transition cursor-pointer"
                      >
                        पदार्थ जोडा (Add Item)
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SECTION: Cart + Customer Info + Financial Calculation */}
          <div className="w-full md:w-[500px] lg:w-[580px] xl:w-[640px] 2xl:w-[700px] bg-white flex flex-col border-l border-slate-200 shrink-0 overflow-y-auto shadow-sm">
            
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center space-x-2.5">
                <span className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Bulk Order Cart
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-800">
                  {cartItems.length} Item{cartItems.length !== 1 ? 's' : ''}
                </span>
              </div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Selected Items Scrollable List */}
            <div className="max-h-60 overflow-y-auto p-3.5 space-y-2 border-b border-slate-200 bg-white shrink-0">
              {cartItems.length === 0 ? (
                <div className="py-7 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-slate-400" />
                  <p className="text-xs font-bold">No items added yet</p>
                  <p className="text-[10px] text-slate-400">Click on menu dishes or add custom items</p>
                </div>
              ) : (
                cartItems.map((item, idx) => {
                  const itemSubtotal = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1);
                  return (
                    <div
                      key={`pre-cart-${item.id}-${idx}`}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs hover:border-slate-300 transition"
                    >
                      <div className="flex-1 pr-3">
                        <div className="font-bold text-slate-900 text-sm truncate">
                          {getPrintDishName(item, printLanguage)}
                        </div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-bold">{item.unit}</span>
                          <span>•</span>
                          <span>₹{item.price} each</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleUpdateQty(idx, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 cursor-pointer text-sm transition"
                        >
                          -
                        </button>
                        <span className="w-9 text-center font-black text-sm text-slate-900">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(idx, 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 cursor-pointer text-sm transition"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveCartItem(idx)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 transition ml-1 cursor-pointer rounded-lg hover:bg-rose-50"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="w-20 text-right font-black text-sm text-slate-900 font-mono">
                        ₹{itemSubtotal.toFixed(0)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* CUSTOMER & EVENT DETAILS FORM (As explicitly required by user) */}
            <div className="p-4 space-y-4 flex-1">
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-orange-600" />
                <span>Customer & Schedule Information</span>
              </div>

              {/* ROW 1: Customer Name & Mobile Number (Perfect 2-Column Alignment) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Customer Name */}
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 flex items-center justify-between mb-1.5 h-5">
                    <span>ग्राहकाचे नाव (Customer Name) <span className="text-rose-500">*</span>:</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={customerNameInputRef}
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          customerPhoneInputRef.current?.focus();
                        }
                      }}
                      placeholder="उदा. रमेश पाटील (Enter Full Name)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 flex items-center justify-between mb-1.5 h-5">
                    <span>मोबाईल नंबर (Phone Number) <span className="text-rose-500">*</span>:</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={customerPhoneInputRef}
                      type="tel"
                      maxLength={10}
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          deliveryDateInputRef.current?.focus();
                        }
                      }}
                      placeholder="१० अंकी मोबाईल नंबर (उदा. 9876543210)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* ROW 2: Date of Order & Time of Delivery (Perfect 2-Column Alignment) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 flex items-center justify-between mb-1.5 h-5">
                    <span>डिलिव्हरी तारीख (Delivery Date) <span className="text-rose-500">*</span>:</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={deliveryDateInputRef}
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          deliveryTimeInputRef.current?.focus();
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 flex items-center justify-between mb-1.5 h-5">
                    <span>डिलिव्हरी / पिकअप वेळ (Time):</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={deliveryTimeInputRef}
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          discountInputRef.current?.focus();
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Time quick chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                {[
                  { label: 'सकाळ (08:00 AM)', value: '08:00' },
                  { label: 'सकाळ (11:00 AM)', value: '11:00' },
                  { label: 'दुपार (01:00 PM)', value: '13:00' },
                  { label: 'संध्याकाळ (04:30 PM)', value: '16:30' },
                  { label: 'संध्याकाळ (07:00 PM)', value: '19:00' },
                  { label: 'रात्री (08:30 PM)', value: '20:30' }
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setDeliveryTime(t.value)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap border transition cursor-pointer ${
                      deliveryTime === t.value
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ROW 3: Discount & Advance Payment (With Perfectly Matched Header Heights & Alignments) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
                <div>
                  <div className="flex items-center justify-between mb-1.5 h-6">
                    <label className="text-[11px] font-extrabold text-slate-700">
                      सवलत / डिस्काउंट (Discount ₹):
                    </label>
                  </div>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={discountInputRef}
                      type="number"
                      step="1"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          advancePaymentInputRef.current?.focus();
                        }
                      }}
                      placeholder="उदा. १०० (Discount)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 h-6">
                    <label className="text-[11px] font-extrabold text-slate-700">
                      अ‍ॅडव्हान्स (Advance ₹):
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleFullPayment}
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        isFullPayment
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                      title="Customer pays full order amount now"
                    >
                      <span>⚡</span>
                      <span>{isFullPayment ? '✓ १००% पूर्ण भरणा' : '१००% पूर्ण भरणा (Full Pay)'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={advancePaymentInputRef}
                      type="number"
                      step="1"
                      min="0"
                      value={advancePayment}
                      onChange={(e) => handleAdvanceInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          orderNotesInputRef.current?.focus();
                        }
                      }}
                      placeholder="उदा. ५०० (Advance)"
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs font-mono font-bold outline-none transition ${
                        isFullPayment
                          ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 focus:ring-2 focus:ring-emerald-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* ROW 4: Full Payment vs Pending Payment Option Banner */}
              <div
                onClick={handleToggleFullPayment}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isFullPayment
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isFullPayment}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleFullPayment();
                    }}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <span>ग्राहकाने पूर्ण भरणा केला (Customer Paid Full Payment)</span>
                      {isFullPayment && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-extrabold">
                          ✓ Settle Tab मध्ये नोंद
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                      {isFullPayment
                        ? '✓ हे बिल थेट Settle Tab मध्ये जमा होईल (This bill will be shown directly in Settle Tab)'
                        : 'पेमेंट बाकी असल्यास हे बिल Settle Tab मध्ये दिसणार नाही (Pending pre-orders are hidden from Settle Tab until fully settled)'}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg shrink-0 ml-2 ${
                  isFullPayment ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isFullPayment ? 'पूर्ण भरणा (Full)' : 'पेंडिंग (Pending)'}
                </span>
              </div>

              {/* ROW 5: Payment Mode & Special Instructions in a 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 block mb-1.5">
                    {isFullPayment ? 'पेमेंट प्रकार (Payment Mode):' : 'अ‍ॅडव्हान्स पेमेंट प्रकार (Advance Mode):'}
                  </label>
                  <select
                    value={advancePaymentMode}
                    onChange={(e) => setAdvancePaymentMode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Cash">रोख (Cash)</option>
                    <option value="UPI / QR">ऑनलाईन UPI / QR कोड</option>
                    <option value="Card">डेबिट / क्रेडिट कार्ड</option>
                    <option value="Bank Transfer">बँक ट्रान्सफर / NEFT</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 block mb-1.5">
                    विशेष सूचना (Special Instructions):
                  </label>
                  <input
                    ref={orderNotesInputRef}
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="उदा. वाढदिवस पार्टी, १ किलो पॅकिंग..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Attach Reference Photos / Images (Req 2) */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-orange-600" />
                    <span>ऑर्डर संदर्भ फोटो जोडा (Attach Order Photos):</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {attachedImages.length} फोटो जोडले
                  </span>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="preorder-image-input"
                    className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-orange-50 hover:bg-orange-100 border border-dashed border-orange-300 rounded-xl text-orange-700 font-bold text-xs cursor-pointer transition active:scale-98"
                  >
                    <Upload className="w-4 h-4 text-orange-600" />
                    <span>+ फोटो / इमेज अपलोड करा (Upload Reference Images)</span>
                  </label>
                  <input
                    type="file"
                    id="preorder-image-input"
                    accept="image/*"
                    multiple
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {attachedImages.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      {attachedImages.map((imgSrc, imgIdx) => (
                        <div key={`img-att-${imgIdx}`} className="relative group shrink-0">
                          <img
                            src={imgSrc}
                            alt={`Order Ref ${imgIdx + 1}`}
                            onClick={() => setViewingImage(imgSrc)}
                            className="w-16 h-16 object-cover rounded-lg border border-slate-300 hover:border-orange-500 cursor-pointer shadow-xs transition"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(imgIdx)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div
                            onClick={() => setViewingImage(imgSrc)}
                            className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-white cursor-pointer transition"
                          >
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    केटरिंग ऑर्डर, केक डिझाइन, मिठाई बॉक्स किंवा सॅम्पलचा फोटो जोडा. हा फोटो या ऑर्डरसोबत कायम राहील.
                  </p>
                </div>
              </div>

              {/* Form Validation Notice */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* REAL-TIME BALANCE AMOUNT CALCULATION */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-2.5 border border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>एकूण ऑर्डर रक्कम (Subtotal):</span>
                  <span className="font-mono font-bold text-sm text-white">
                    ₹{subtotalAmount.toFixed(2)}
                  </span>
                </div>

                {discountNum > 0 && (
                  <div className="flex items-center justify-between text-xs text-rose-300">
                    <span>सवलत / डिस्काउंट (Discount):</span>
                    <span className="font-mono font-bold text-sm">
                      - ₹{discountNum.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span>निव्वळ एकूण रक्कम (Net Total):</span>
                  <span className="font-mono text-sm text-amber-300">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span>जमा अ‍ॅडव्हान्स (Advance Paid):</span>
                  <span className="font-mono font-bold text-sm">
                    - ₹{advanceNum.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">
                      शिल्लक देय रक्कम (Balance Due):
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                      balanceAmount === 0
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 animate-pulse border border-rose-500/30'
                    }`}>
                      {balanceAmount === 0 ? '✓ पूर्ण भरणा झाला (Fully Paid)' : 'डिलिव्हरीच्या वेळी जमा करणे बाकी (Pending on Delivery)'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-amber-400">
                      ₹{balanceAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSavePreOrder(false)}
                  className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-2 shadow-sm active:scale-98"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>ऑर्डर जतन करा (Save)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSavePreOrder(true)}
                  className="py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-orange-300 active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>जतन करा & पावती छापा (Save & Print)</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* PRE-ORDERS LIST & SCHEDULE MANAGEMENT VIEW */
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3 bg-white border-b border-slate-200 shrink-0">
            
            {/* Due Tomorrow (Urgent Alert Card) */}
            <div
              onClick={() => setSelectedFilter(selectedFilter === 'tomorrow' ? 'all' : 'tomorrow')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                stats.dueTomorrowCount > 0
                  ? 'bg-amber-50 border-amber-300 hover:border-amber-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              } ${selectedFilter === 'tomorrow' ? 'ring-2 ring-orange-500 bg-orange-100/50' : ''}`}
            >
              <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-900 mb-1">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Due Tomorrow (Alert)
                </span>
                {stats.dueTomorrowCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <div className="text-2xl font-black text-amber-900 font-mono">
                {stats.dueTomorrowCount}
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5">
                Orders scheduled for tomorrow
              </p>
            </div>

            {/* Due Today Card */}
            <div
              onClick={() => setSelectedFilter(selectedFilter === 'today' ? 'all' : 'today')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                stats.dueTodayCount > 0
                  ? 'bg-rose-50 border-rose-300 hover:border-rose-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              } ${selectedFilter === 'today' ? 'ring-2 ring-rose-500 bg-rose-100/50' : ''}`}
            >
              <div className="flex items-center justify-between text-[11px] font-extrabold text-rose-900 mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  Due Today
                </span>
              </div>
              <div className="text-2xl font-black text-rose-900 font-mono">
                {stats.dueTodayCount}
              </div>
              <p className="text-[10px] text-rose-700 mt-0.5">
                Orders for today's pickup
              </p>
            </div>

            {/* Total Active Bookings */}
            <div
              onClick={() => setSelectedFilter('upcoming')}
              className={`p-3 rounded-2xl border bg-slate-50 border-slate-200 hover:border-slate-300 transition-all cursor-pointer ${
                selectedFilter === 'upcoming' ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
              }`}
            >
              <div className="text-[11px] font-extrabold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upcoming Orders</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats.upcomingCount}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Active future reservations
              </p>
            </div>

            {/* Advance Received */}
            <div className="p-3 rounded-2xl border bg-emerald-50/60 border-emerald-200">
              <div className="text-[11px] font-extrabold text-emerald-800 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Advance Collected</span>
              </div>
              <div className="text-xl font-black text-emerald-900 font-mono">
                ₹{stats.totalAdvance.toFixed(0)}
              </div>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                Total advance in hand
              </p>
            </div>

            {/* Balance Due to Collect */}
            <div className="p-3 rounded-2xl border bg-indigo-50/60 border-indigo-200">
              <div className="text-[11px] font-extrabold text-indigo-900 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
                <span>Balance to Collect</span>
              </div>
              <div className="text-xl font-black text-indigo-950 font-mono">
                ₹{stats.totalBalance.toFixed(0)}
              </div>
              <p className="text-[10px] text-indigo-700 mt-0.5">
                Remaining to be collected
              </p>
            </div>

          </div>

          {/* FILTER & SEARCH TOOLBAR */}
          <div className="p-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            
            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
              {[
                { id: 'all', label: `All Upcoming (${upcomingPreOrders.length})` },
                { id: 'tomorrow', label: `🚨 Due Tomorrow (${stats.dueTomorrowCount})`, alert: stats.dueTomorrowCount > 0 },
                { id: 'today', label: `⏰ Due Today (${stats.dueTodayCount})`, urgent: stats.dueTodayCount > 0 },
                { id: 'upcoming', label: `📅 Future Upcoming (${stats.upcomingCount})` }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                    selectedFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : f.alert
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : f.urgent
                      ? 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search & Date Filter */}
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer, phone, order no..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                title="Filter by delivery date"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  title="Clear date filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* PRE-ORDERS CARDS LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayedOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CalendarClock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700">No Upcoming Pre-Orders</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedFilter === 'tomorrow'
                    ? 'No upcoming orders are scheduled for tomorrow.'
                    : selectedFilter === 'today'
                    ? 'No upcoming orders are scheduled for today.'
                    : selectedFilter === 'upcoming'
                    ? 'No future upcoming orders are scheduled.'
                    : 'Click "+ Take Bulk Pre-Order" to create a new booking.'}
                </p>
              </div>
            ) : (
              displayedOrders.map((order) => {
                const isTomorrow = order.alertInfo?.isTomorrow;
                const isToday = order.alertInfo?.isToday;
                const isOverdue = order.alertInfo?.isOverdue;
                const isCompleted = order.status === 'completed';
                const isCancelled = order.status === 'cancelled';

                const total = parseFloat(order.totalAmount || 0);
                const advance = parseFloat(order.advancePayment || 0);
                const balance = parseFloat(order.balanceAmount !== undefined ? order.balanceAmount : (total - advance));

                return (
                  <div
                    key={`order-card-${order.id}`}
                    className={`bg-white rounded-2xl border transition-all shadow-xs p-4 space-y-3 ${
                      isTomorrow
                        ? 'border-amber-400 ring-2 ring-amber-300/50 bg-amber-50/15'
                        : isToday
                        ? 'border-rose-400 ring-2 ring-rose-300/50 bg-rose-50/15'
                        : isCompleted
                        ? 'border-slate-200 opacity-80'
                        : isCancelled
                        ? 'border-slate-200 opacity-60 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    
                    {/* Urgency Alert Strip */}
                    {isTomorrow && !isCompleted && !isCancelled && (
                      <div className="bg-amber-500 text-white px-3 py-1 rounded-xl text-xs font-black flex items-center justify-between shadow-xs">
                        <div className="flex items-center space-x-1.5">
                          <AlertTriangle className="w-4 h-4 text-yellow-200" />
                          <span>🚨 PREPARATION ALERT: DUE TOMORROW!</span>
                        </div>
                        <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-md font-mono">
                          Scheduled for {order.deliveryDate} at {order.deliveryTime}
                        </span>
                      </div>
                    )}

                    {isToday && !isCompleted && !isCancelled && (
                      <div className="bg-rose-600 text-white px-3 py-1 rounded-xl text-xs font-black flex items-center justify-between shadow-xs">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-yellow-200" />
                          <span>⏰ URGENT ALERT: DUE TODAY!</span>
                        </div>
                        <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-md font-mono">
                          Scheduled Today at {order.deliveryTime}
                        </span>
                      </div>
                    )}

                    {/* Order Top Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl font-mono">
                          {order.orderNo}
                        </span>
                        
                        <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                          <User className="w-3.5 h-3.5 text-orange-600" />
                          <span className="font-extrabold text-slate-900">{order.customerName}</span>
                        </div>

                        <div className="flex items-center space-x-1 text-xs text-slate-500 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="hover:text-orange-600 font-bold"
                          >
                            {order.customerPhone}
                          </a>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center space-x-2">
                        {isCompleted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Completed & Delivered
                          </span>
                        )}
                        {isCancelled && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-200 text-slate-600">
                            Cancelled
                          </span>
                        )}
                        {!isCompleted && !isCancelled && (
                          <>
                            {(order.isFullPayment || balance === 0) ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                                <span>✓ १००% भरणा (Full Paid - Settled)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                                <span>बाकी देय: ₹{balance.toFixed(0)} (Pending)</span>
                              </span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                              isTomorrow
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : isToday
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {isTomorrow ? 'Due Tomorrow' : isToday ? 'Due Today' : isOverdue ? 'Overdue' : 'Confirmed'}
                            </span>
                          </>
                        )}

                        <span className="text-[11px] text-slate-400 font-mono">
                          Booked: {order.createdAt ? formatReceiptDate(order.createdAt) : ''}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Time & Items Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
                      
                      {/* Schedule column */}
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Delivery Schedule:
                        </span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {order.deliveryDate ? formatReceiptDate(order.deliveryDate) : '-'}
                        </div>
                        <div className="text-xs font-bold text-orange-700 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{order.deliveryTime || '11:00 AM'}</span>
                        </div>
                        {order.notes && (
                          <div className="mt-1 text-[11px] text-slate-600 italic">
                            "{order.notes}"
                          </div>
                        )}
                      </div>

                      {/* Items Column */}
                      <div className="md:col-span-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Ordered Items ({order.items?.length || 0}):
                        </span>
                        <div className="space-y-1 mt-1 max-h-24 overflow-y-auto pr-1">
                          {(order.items || []).map((it, idx) => (
                            <div key={`item-${idx}`} className="flex items-center justify-between text-slate-700 font-medium">
                              <span className="truncate pr-2 font-bold">
                                {it.qty}x {getPrintDishName(it, printLanguage)} {it.unit && `(${it.unit})`}
                              </span>
                              <span className="font-mono text-slate-900 font-bold shrink-0">
                                ₹{((parseFloat(it.price) || 0) * (parseFloat(it.qty) || 1)).toFixed(0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financials Column */}
                      <div className="bg-white rounded-lg p-2.5 border border-slate-200 flex flex-col justify-between">
                        <div className="space-y-1">
                          {parseFloat(order.discount || 0) > 0 && (
                            <div className="flex justify-between text-slate-500 text-[11px]">
                              <span>एकूण (Subtotal):</span>
                              <span className="font-bold text-slate-700 font-mono">
                                ₹{(order.subtotal ? parseFloat(order.subtotal) : (total + parseFloat(order.discount || 0))).toFixed(0)}
                              </span>
                            </div>
                          )}
                          {parseFloat(order.discount || 0) > 0 && (
                            <div className="flex justify-between text-rose-600 text-[11px] font-bold">
                              <span>सवलत (Discount):</span>
                              <span className="font-mono">-₹{parseFloat(order.discount || 0).toFixed(0)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-600">
                            <span>{parseFloat(order.discount || 0) > 0 ? 'निव्वळ एकूण (Net Total):' : 'एकूण रक्कम (Total):'}</span>
                            <span className="font-bold text-slate-900 font-mono">₹{total.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-700">
                            <span>अ‍ॅडव्हान्स जमा ({order.advancePaymentMode || 'Cash'}):</span>
                            <span className="font-bold font-mono">₹{advance.toFixed(0)}</span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center mt-1">
                          <span className="font-extrabold text-slate-700 text-xs">
                            शिल्लक रक्कम (Balance Due):
                          </span>
                          <span className={`text-base font-black font-mono ${
                            balance === 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            ₹{balance.toFixed(0)}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Attached Reference Images (if any) */}
                    {order.images && order.images.length > 0 && (
                      <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>जोडलेले फोटो / संदर्भ डिझाईन ({order.images.length} Attached Photos):</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {order.images.map((imgSrc, imgIdx) => (
                            <div
                              key={imgIdx}
                              onClick={() => setViewingImage(imgSrc)}
                              className="relative group w-14 h-14 rounded-lg overflow-hidden border border-amber-300 bg-white cursor-pointer hover:shadow-md hover:scale-105 transition"
                              title="फोटो मोठा करून पाहण्यासाठी क्लिक करा (Click to enlarge photo)"
                            >
                              <img
                                src={imgSrc}
                                alt={`Ref ${imgIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                        <span>काउंटर: {order.bookedByCounter || 'Master'}</span>
                        {order.settledBillInvoiceNo && (
                          <span className="text-emerald-700 font-mono font-bold">
                            • Settled Bill #{order.settledBillInvoiceNo}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Print Receipt Slip */}
                        <button
                          onClick={() => handlePrintSlip(order)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>पावती छापा (Print Slip)</span>
                        </button>

                        {/* Edit Pre-Order (only if pending) */}
                        {!isCompleted && !isCancelled && (
                          <button
                            onClick={() => handleStartEdit(order)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>बदल करा (Edit)</span>
                          </button>
                        )}

                        {/* Settle / Convert to POS Bill (when collecting remaining balance) OR Mark Delivered if fully paid */}
                        {!isCompleted && !isCancelled && (
                          (order.isFullPayment || balance === 0) ? (
                            <button
                              onClick={async () => {
                                await onUpdatePreOrder(order.id, {
                                  status: 'completed',
                                  deliveryStatus: 'delivered',
                                  deliveredAt: new Date().toISOString()
                                });
                                showToast(`Pre-Order ${order.orderNo} डिलिव्हरी पूर्ण झाली! (Delivered)`);
                              }}
                              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
                              title="Full payment already settled in Settle Tab. Click to complete delivery."
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>✓ डिलिव्हरी पूर्ण करा (Mark Delivered)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSettleModalOrder(order);
                                setSettlePaymentMode('Cash');
                              }}
                              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>शिल्लक जमा करा (Settle Bill)</span>
                            </button>
                          )
                        )}

                        {/* Cancel order */}
                        {!isCompleted && !isCancelled && (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to cancel pre-order ${order.orderNo}?`)) {
                                await onUpdatePreOrder(order.id, { status: 'cancelled' });
                                showToast(`Pre-Order ${order.orderNo} cancelled.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Cancel Pre-Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* MODAL: Settle Pre-Order & Convert to Final POS Bill */}
      {settleModalOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    ऑर्डर पूर्ण करून बिल सेटल करा (Settle Pre-Order)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ऑर्डर क्र. (Order No): {settleModalOrder.orderNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettleModalOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial summary breakdown */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>ग्राहकाचे नाव (Customer Name):</span>
                <span className="font-bold text-slate-900">{settleModalOrder.customerName}</span>
              </div>
              {parseFloat(settleModalOrder.discount || 0) > 0 && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>एकूण रक्कम (Subtotal):</span>
                    <span className="font-mono font-bold text-slate-700">
                      ₹{(parseFloat(settleModalOrder.subtotal || 0) || (parseFloat(settleModalOrder.totalAmount || 0) + parseFloat(settleModalOrder.discount || 0))).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>सवलत (Discount):</span>
                    <span className="font-mono">
                      -₹{parseFloat(settleModalOrder.discount || 0).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-slate-600">
                <span>निव्वळ एकूण रक्कम (Order Total):</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{parseFloat(settleModalOrder.totalAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>आधी मिळालेला अ‍ॅडव्हान्स (Advance Paid):</span>
                <span className="font-mono font-bold">
                  ₹{parseFloat(settleModalOrder.advancePayment || 0).toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-black text-slate-900">शिल्लक रक्कम (Balance to Collect):</span>
                <span className="font-mono font-black text-xl text-rose-600">
                  ₹{parseFloat(settleModalOrder.balanceAmount !== undefined ? settleModalOrder.balanceAmount : (settleModalOrder.totalAmount - settleModalOrder.advancePayment)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Mode for Balance */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 block mb-1.5">
                शिल्लक रक्कम कोणत्या प्रकारे घेतली? (Balance Payment Mode):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Cash', label: 'रोख (Cash)' },
                  { id: 'UPI / QR', label: 'UPI / QR कोड' },
                  { id: 'Card', label: 'कार्ड (Card)' },
                  { id: 'Bank Transfer', label: 'बँक ट्रान्सफर' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSettlePaymentMode(mode.id)}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                      settlePaymentMode === mode.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              नोंद: ऑर्डर सेटल केल्यावर उर्वरित शिल्लक रक्कम आजच्या विक्रीमध्ये नोंदवली जाईल आणि किचन इन्व्हेंटरीमधून स्टॉक वजा केला जाईल.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettleModalOrder(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                रद्द करा (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmSettleBill}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-200"
              >
                बिल सेटल करा (Confirm Settle)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Fullscreen Image Viewer */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setViewingImage(null)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 bg-slate-800 text-white border-b border-slate-700">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">संदर्भ फोटो / डिझाईन (Reference Photo)</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewingImage}
                  download="preorder-reference-image.jpg"
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition"
                  title="फोटो डाउनलोड करा (Download)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाउनलोड</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingImage(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                  title="बंद करा (Close)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/50 min-h-[300px]">
              <img
                src={viewingImage}
                alt="Pre-Order Reference"
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quantity Input Modal */}
      <QuantityInputModal
        isOpen={Boolean(selectedDishForQty)}
        dish={selectedDishForQty}
        cartItems={cartItems}
        allDishes={dishes}
        printLanguage={printLanguage}
        onClose={() => setSelectedDishForQty(null)}
        onConfirm={handleConfirmQuantityPreOrder}
      />

    </div>
  );
}
