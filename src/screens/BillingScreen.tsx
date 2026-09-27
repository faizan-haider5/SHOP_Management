import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Camera,
  Plus,
  Minus,
  Trash2,
  Printer,
  Share2,
  Check,
  ChevronUp,
  ChevronDown,
  History,
  UserPlus,
  User,
  ShoppingBag,
  Percent,
  Receipt,
  Phone,
  Store,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { AppColors, formatCurrency } from '../utils/colors';
import { Squircle } from '../components/Squircle';
import { localDb } from '../utils/storage';
import { Bill, BillItem, Customer, InventoryItem, UserRole } from '../types';
import confetti from 'canvas-confetti';

interface BillingScreenProps {
  userRole: UserRole;
  currentUserName: string;
}

export const BillingScreen: React.FC<BillingScreenProps> = ({
  userRole,
  currentUserName,
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    localDb.getInventory().filter((i) => !i.isDeleted && i.stockQuantity > 0)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    localDb.getCustomers()
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Bill state
  const [cartItems, setCartItems] = useState<BillItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cash');
  const [paymentType, setPaymentType] = useState<'PAID' | 'LOAN'>('PAID');
  const [isSheetExpanded, setIsSheetExpanded] = useState<boolean>(true);

  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);
  const [savedBill, setSavedBill] = useState<Bill | null>(null);

  // New customer inline form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustShop, setNewCustShop] = useState('');

  // Bill history search
  const [historySearch, setHistorySearch] = useState('');

  const isAdmin = userRole === 'admin';

  // Cart calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const grandTotal = Number((subtotal - discountAmount).toFixed(2));
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Adding product to cart
  const handleAddToCart = (product: InventoryItem) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.itemId === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        const nextQty = copy[idx].quantity + 1;
        copy[idx] = {
          ...copy[idx],
          quantity: nextQty,
          lineTotal: Number((nextQty * copy[idx].unitPrice).toFixed(2)),
        };
        return copy;
      }
      return [
        ...prev,
        {
          itemId: product.id,
          itemName: product.name,
          sku: product.sku,
          quantity: 1,
          unitPrice: product.sellingPrice,
          costPrice: product.costPrice,
          lineTotal: product.sellingPrice,
        },
      ];
    });
  };

  const handleUpdateQuantity = (itemId: number, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.itemId === itemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              lineTotal: Number((nextQty * item.unitPrice).toFixed(2)),
            };
          }
          return item;
        })
        .filter(Boolean) as BillItem[];
    });
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCartItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  // Add new customer inline
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim() || undefined,
      shopName: newCustShop.trim() || undefined,
      balanceDue: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCust, ...customers];
    setCustomers(updated);
    localDb.saveCustomers(updated);
    setSelectedCustomerId(newCust.id);
    localDb.logActivity('CREATE', 'BILLING', `Added customer ${newCust.name}`, currentUserName);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustShop('');
  };

  // Confirm and Save Bill
  const handleConfirmBill = () => {
    if (cartItems.length === 0) return;

    const bills = localDb.getBills();
    const nextBillNum = `BILL-${1000 + bills.length + 1}`;

    const newBill: Bill = {
      id: Date.now(),
      billNumber: nextBillNum,
      createdAt: new Date().toISOString(),
      customerId: selectedCustomerId !== 'cash' ? selectedCustomerId : undefined,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Cash',
      customerPhone: selectedCustomer?.phone,
      customerShopName: selectedCustomer?.shopName,
      subtotal,
      discount: discountAmount,
      grandTotal,
      paymentType,
      status: 'COMPLETED',
      items: cartItems,
      createdByName: currentUserName,
    };

    // 1. Decrement inventory stock
    const allInventory = localDb.getInventory();
    const updatedInventory = allInventory.map((invItem) => {
      const soldItem = cartItems.find((ci) => ci.itemId === invItem.id);
      if (soldItem) {
        return {
          ...invItem,
          stockQuantity: Math.max(0, invItem.stockQuantity - soldItem.quantity),
          updatedAt: new Date().toISOString(),
        };
      }
      return invItem;
    });
    localDb.saveInventory(updatedInventory);
    setInventory(updatedInventory.filter((i) => !i.isDeleted && i.stockQuantity > 0));

    // 2. If On Loan, increase customer's balanceDue
    if (paymentType === 'LOAN' && selectedCustomer) {
      const allCustomers = localDb.getCustomers();
      const updatedCustomers = allCustomers.map((c) => {
        if (c.id === selectedCustomer.id) {
          return {
            ...c,
            balanceDue: Number((c.balanceDue + grandTotal).toFixed(2)),
          };
        }
        return c;
      });
      localDb.saveCustomers(updatedCustomers);
      setCustomers(updatedCustomers);
    }

    // 3. Save Bill permanently
    const updatedBills = [newBill, ...bills];
    localDb.saveBills(updatedBills);

    // 4. Log activity
    localDb.logActivity(
      'CREATE',
      'BILLING',
      `Issued ${newBill.billNumber} for ${formatCurrency(grandTotal)} (${paymentType})`,
      currentUserName
    );

    setSavedBill(newBill);
    setShowSavedAnimation(true);

    // 400ms squircle checkmark animation before showing receipt
    setTimeout(() => {
      setShowSavedAnimation(false);
      setShowReceiptModal(true);
      setCartItems([]);
      setSelectedCustomerId('cash');
      setPaymentType('PAID');
      setDiscountPercent(0);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }, 450);
  };

  const handleShareWhatsApp = (bill: Bill) => {
    const storeTitle = localDb.getStoreName().toUpperCase();
    const lines = [
      `*${bill.billNumber} - ${storeTitle}*`,
      `Date: ${new Date(bill.createdAt).toLocaleDateString()} ${new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `Customer: ${bill.customerName}`,
      `----------------------------`,
      ...bill.items.map((i) => `${i.itemName} (${i.quantity}x) = Rs ${Math.round(i.lineTotal)}`),
      `----------------------------`,
      bill.discount > 0 ? `Discount: -Rs ${Math.round(bill.discount)}` : null,
      `*Grand Total: Rs ${Math.round(bill.grandTotal)}*`,
      `Payment: ${bill.paymentType === 'LOAN' ? 'ON LOAN (UDHAAR)' : 'PAID CASH'}`,
      `Thank you for shopping at ${storeTitle}!`,
    ].filter(Boolean).join('\n');

    const encoded = encodeURIComponent(lines);
    const url = bill.customerPhone
      ? `https://wa.me/${bill.customerPhone.replace(/\D/g, '')}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank');
  };

  const filteredProducts = inventory.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allBills = localDb.getBills();
  const filteredBills = allBills.filter(
    (b) =>
      b.billNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(historySearch.toLowerCase()) ||
      b.items.some((it) => it.itemName.toLowerCase().includes(historySearch.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F6F5F1] select-none relative">
      {/* Top Header */}
      <div
        style={{ backgroundColor: AppColors.primary }}
        className="px-4 py-3 text-white flex items-center justify-between shrink-0 shadow-xs z-10"
      >
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-white">
            Counter POS Billing
          </h1>
          <div className="text-[11px] text-teal-100/80">
            Fast touch cashier · 100% Offline
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
        >
          <History size={14} />
          <span>Bill History</span>
        </button>
      </div>

      {/* Search Bar & Camera Barcode Scan */}
      <div className="p-3 bg-white border-b border-[#E3E0D8] flex items-center gap-2 shrink-0">
        <div className="relative flex-1">
          <Search
            size={16}
            style={{ color: AppColors.textSecondary }}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items or tap camera to scan barcode..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F5F1] rounded-xl border border-[#E3E0D8] text-[#22262B] placeholder:text-slate-400 focus:outline-none focus:border-teal-700"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (inventory.length > 0) {
              const random = inventory[Math.floor(Math.random() * inventory.length)];
              handleAddToCart(random);
            }
          }}
          title="Scan barcode via phone camera"
          style={{ backgroundColor: AppColors.primary, color: '#FFFFFF' }}
          className="p-2.5 rounded-xl shadow-xs active:scale-95 transition-transform cursor-pointer"
        >
          <Camera size={16} />
        </button>
      </div>

      {/* Main Catalog View (scrollable) */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 pb-36 space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7078] px-1">
          Available Products ({filteredProducts.length})
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-[#6B7078]">
            <Receipt size={32} className="mx-auto text-slate-300 mb-2" />
            <div className="text-xs font-medium text-[#22262B]">No products in stock</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredProducts.map((product) => {
              const inCart = cartItems.find((ci) => ci.itemId === product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between ${
                    inCart
                      ? 'bg-teal-50/50 border-teal-600 shadow-xs'
                      : 'bg-white border-[#E3E0D8] hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-[13px] font-medium text-[#22262B] leading-tight truncate">
                      {product.name}
                    </div>
                    <div className="text-[11px] text-[#6B7078] mt-0.5 font-tabular">
                      {product.sku} · {product.stockQuantity} in stock
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      style={{ color: AppColors.primary }}
                      className="text-[15px] font-bold font-tabular"
                    >
                      {formatCurrency(product.sellingPrice)}
                    </div>
                    {inCart && (
                      <span className="text-[10px] bg-[#1B4B43] text-white px-1.5 py-0.5 rounded-full font-bold">
                        {inCart.quantity}x
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Persistent Expandable Bottom Sheet (Cart Sheet) */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-white border-t border-[#E3E0D8] shadow-2xl transition-all duration-300 z-30 flex flex-col ${
          isSheetExpanded ? 'max-h-[72%] rounded-t-3xl' : 'h-16'
        }`}
      >
        {/* Drag / Expand Bar */}
        <div
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          className="w-full py-2 flex flex-col items-center cursor-pointer border-b border-[#E3E0D8]/60 bg-slate-50/50 rounded-t-3xl"
        >
          <div className="w-12 h-1 bg-slate-300 rounded-full mb-1" />
          <div className="w-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} style={{ color: AppColors.primary }} />
              <span className="text-xs font-semibold text-[#22262B]">
                Current Bill ({totalItemCount} items)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                style={{ color: AppColors.primary }}
                className="text-[16px] font-bold font-tabular"
              >
                {formatCurrency(grandTotal)}
              </span>
              {isSheetExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>
          </div>
        </div>

        {/* Expanded Sheet Content */}
        {isSheetExpanded && (
          <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-2.5">
            {/* Customer & Payment Type Row */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#F6F5F1] border border-[#E3E0D8] text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <User size={14} style={{ color: AppColors.textSecondary }} />
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#22262B] focus:outline-none truncate w-full"
                >
                  <option value="cash">Walk-in Cash Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.shopName ? `(${c.shopName})` : ''} - Bal: Rs {Math.round(c.balanceDue)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(true)}
                  className="p-1 text-teal-800 hover:bg-white rounded-md shrink-0 cursor-pointer"
                  title="Add new customer inline"
                >
                  <UserPlus size={14} />
                </button>
              </div>

              {/* Payment Type Toggle */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#E3E0D8]">
                <button
                  type="button"
                  onClick={() => setPaymentType('PAID')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    paymentType === 'PAID'
                      ? 'bg-[#1B4B43] text-white'
                      : 'text-[#6B7078]'
                  }`}
                >
                  Paid Now
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('LOAN')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    paymentType === 'LOAN'
                      ? 'bg-[#E3A008] text-[#22262B]'
                      : 'text-[#6B7078]'
                  }`}
                >
                  On Loan
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 max-h-44">
              {cartItems.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#6B7078]">
                  Cart is empty. Tap items in catalog above.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-2 rounded-lg border border-[#E3E0D8] bg-white flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium text-[#22262B] truncate">
                        {item.itemName}
                      </div>
                      <div className="text-[10px] text-[#6B7078] font-tabular">
                        {formatCurrency(item.unitPrice)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.itemId, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-tabular">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.itemId, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-14 text-right text-[12px] font-bold font-tabular text-[#22262B]">
                      {formatCurrency(item.lineTotal)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.itemId)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Calculation & Confirm Button */}
            <div className="pt-2 border-t border-[#E3E0D8] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6B7078]">
                <div className="flex items-center gap-2">
                  <span>Discount</span>
                  {[0, 5, 10].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        discountPercent === pct
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                {discountAmount > 0 && (
                  <span className="font-tabular text-[#B3491F]">
                    -{formatCurrency(discountAmount)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-[#6B7078]">
                    Grand Total
                  </div>
                  <div
                    style={{ color: AppColors.primary }}
                    className="text-[22px] font-bold font-tabular leading-none"
                  >
                    {formatCurrency(grandTotal)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmBill}
                  disabled={cartItems.length === 0}
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="py-3 px-6 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Check size={16} />
                  <span>Save & Print Bill</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 400ms Satisfying Checkmark Animation inside Squircle (Patch 3) */}
      <AnimatePresence>
        {showSavedAnimation && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Squircle size={96} backgroundColor="#FFFFFF" className="shadow-2xl flex flex-col items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#1B4B43"
                    strokeWidth="3.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.path
                    d="M14 24L21 31L34 17"
                    stroke="#2E7D4F"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                  />
                </svg>
                <span className="text-[11px] font-bold text-[#1B4B43] mt-1">
                  Bill Saved
                </span>
              </Squircle>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Thermal Receipt & WhatsApp Share Modal */}
      {showReceiptModal && savedBill && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1B4B43] px-4 py-3 text-white flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Printer size={14} />
                <span>80mm Thermal Receipt</span>
              </span>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Receipt Preview */}
            <div className="p-4 font-mono text-[11px] text-[#22262B] bg-[#FAFAF8] border-b border-dashed border-slate-300 space-y-2">
              <div className="text-center">
                <div className="font-bold text-[13px] tracking-wide text-[#1B4B43]">
                  {localDb.getStoreName().toUpperCase()}
                </div>
                <div className="text-[10px] text-slate-500">Offline Counter POS Receipt</div>
                <div className="text-[10px] text-slate-500">
                  {savedBill.billNumber} · {new Date(savedBill.createdAt).toLocaleDateString()}
                </div>
                {savedBill.customerName && (
                  <div className="text-[10px] font-semibold text-slate-700 mt-0.5">
                    Customer: {savedBill.customerName}
                  </div>
                )}
              </div>

              <div className="border-t border-b border-dashed border-slate-400 py-1 space-y-1">
                {savedBill.items.map((it) => (
                  <div key={it.itemId} className="flex justify-between text-[10px]">
                    <span className="truncate max-w-[140px]">
                      {it.itemName} ({it.quantity}x)
                    </span>
                    <span className="font-tabular">Rs {Math.round(it.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 pt-1 text-[11px]">
                {savedBill.discount > 0 && (
                  <div className="flex justify-between text-amber-800">
                    <span>Discount:</span>
                    <span className="font-tabular">-Rs {Math.round(savedBill.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[13px] pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span className="font-tabular text-[#1B4B43]">
                    {formatCurrency(savedBill.grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Payment:</span>
                  <span className="font-bold">{savedBill.paymentType}</span>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-400 pt-2">
                *** THANK YOU FOR SHOPPING ***
              </div>
            </div>

            {/* Actions: Print & Share on WhatsApp */}
            <div className="p-3 bg-white space-y-2">
              <button
                type="button"
                onClick={() => handleShareWhatsApp(savedBill)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 size={14} />
                <span>Share on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowReceiptModal(false);
                }}
                style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Thermal Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill History Modal */}
      {showHistoryModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-[#1B4B43] px-4 py-3 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <History size={16} />
                <span>Bill History</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-[#E3E0D8]">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search bill number, customer or item..."
                className="w-full px-3 py-1.5 text-xs bg-[#F6F5F1] rounded-xl border border-[#E3E0D8] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
              {filteredBills.map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-white rounded-xl border border-[#E3E0D8] flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div>
                    <div className="text-xs font-bold text-[#1B4B43]">{b.billNumber}</div>
                    <div className="text-[11px] text-[#22262B] font-medium">{b.customerName}</div>
                    <div className="text-[10px] text-[#6B7078]">
                      {new Date(b.createdAt).toLocaleDateString()} · {b.items.length} items
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-tabular text-[#22262B]">
                      {formatCurrency(b.grandTotal)}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSavedBill(b);
                        setShowHistoryModal(false);
                        setShowReceiptModal(true);
                      }}
                      className="text-[10px] font-semibold text-teal-700 underline mt-0.5 cursor-pointer"
                    >
                      Reprint / Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Inline Modal */}
      {showAddCustomerModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-[#22262B] mb-2">
              Add Customer
            </h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="Customer Name *"
                className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
              />
              <input
                type="tel"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="Phone (0300-XXXXXXX)"
                className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-tabular"
              />
              <input
                type="text"
                value={newCustShop}
                onChange={(e) => setNewCustShop(e.target.value)}
                placeholder="Shop Name (optional)"
                className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2 text-xs border border-[#E3E0D8] rounded-xl text-[#6B7078]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
