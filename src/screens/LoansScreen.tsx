import React, { useState } from 'react';
import {
  HandCoins,
  Phone,
  Store,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  X,
  History,
} from 'lucide-react';
import { AppColors, formatCurrency } from '../utils/colors';
import { Squircle } from '../components/Squircle';
import { localDb } from '../utils/storage';
import { Customer, LoanPayment, UserRole } from '../types';

interface LoansScreenProps {
  userRole: UserRole;
  currentUserName: string;
}

export const LoansScreen: React.FC<LoansScreenProps> = ({
  userRole,
  currentUserName,
}) => {
  const [customers, setCustomers] = useState<Customer[]>(() =>
    localDb.getCustomers()
  );
  const [payments, setPayments] = useState<LoanPayment[]>(() =>
    localDb.getPayments()
  );
  const [viewType, setViewType] = useState<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE');

  // Selected customer for history drilldown
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // New customer form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newShop, setNewShop] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');

  const isAdmin = userRole === 'admin';

  // Calculate summary totals
  const totalReceivable = customers
    .filter((c) => c.balanceDue > 0)
    .reduce((s, c) => s + c.balanceDue, 0);

  const totalPayable = customers
    .filter((c) => c.balanceDue < 0)
    .reduce((s, c) => s + Math.abs(c.balanceDue), 0);

  // Filter customers by selected tab
  const displayedCustomers = customers.filter((c) => {
    if (viewType === 'RECEIVABLE') return c.balanceDue >= 0;
    return c.balanceDue < 0;
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !activeCustomer) return;

    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) return;

    const newPayment: LoanPayment = {
      id: `pay-${Date.now()}`,
      customerId: activeCustomer.id,
      amount: amt,
      paymentDate: new Date().toISOString(),
      notes: paymentNotes.trim() || undefined,
      recordedBy: currentUserName,
    };

    // Update customer balance
    const updatedCustomers = customers.map((c) => {
      if (c.id === activeCustomer.id) {
        const nextBalance = Number((c.balanceDue - amt).toFixed(2));
        return { ...c, balanceDue: nextBalance };
      }
      return c;
    });

    const updatedPayments = [newPayment, ...payments];
    setCustomers(updatedCustomers);
    setPayments(updatedPayments);
    localDb.saveCustomers(updatedCustomers);
    localDb.savePayments(updatedPayments);

    localDb.logActivity(
      'PAYMENT',
      'LOANS',
      `Recorded payment of ${formatCurrency(amt)} for ${activeCustomer.name}`,
      currentUserName
    );

    setActiveCustomer(updatedCustomers.find((c) => c.id === activeCustomer.id) || null);
    setShowPaymentModal(false);
    setPaymentAmount('');
    setPaymentNotes('');
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !newName.trim()) return;

    const initBal = parseFloat(initialBalance) || 0;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || undefined,
      shopName: newShop.trim() || undefined,
      balanceDue: viewType === 'RECEIVABLE' ? initBal : -initBal,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCust, ...customers];
    setCustomers(updated);
    localDb.saveCustomers(updated);
    localDb.logActivity('CREATE', 'LOANS', `Created customer loan ledger for ${newCust.name}`, currentUserName);
    setShowNewCustomerModal(false);
    setNewName('');
    setNewPhone('');
    setNewShop('');
    setInitialBalance('0');
  };

  const allBills = localDb.getBills();
  const customerBills = activeCustomer
    ? allBills.filter((b) => b.customerId === activeCustomer.id || b.customerName === activeCustomer.name)
    : [];
  const customerPayments = activeCustomer
    ? payments.filter((p) => p.customerId === activeCustomer.id)
    : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F6F5F1] select-none relative">
      {/* Top Header */}
      <div
        style={{ backgroundColor: AppColors.primary }}
        className="px-4 py-3 text-white flex items-center justify-between shrink-0 shadow-xs"
      >
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-white">
            Customer Loans Ledger
          </h1>
          <div className="text-[11px] text-teal-100/80">
            Khata & Credit Accounts · 100% Offline
          </div>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setShowNewCustomerModal(true)}
            style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>New Account</span>
          </button>
        ) : (
          <span className="text-[10px] bg-white/10 text-white/80 px-2 py-1 rounded-md font-medium">
            Partner (Read-Only)
          </span>
        )}
      </div>

      {/* Summary Totals Banner (Receivable & Payable) */}
      <div className="p-3 bg-white border-b border-[#E3E0D8] grid grid-cols-2 gap-3 shrink-0">
        <div className="p-3 rounded-2xl bg-[#F6F5F1] border border-[#E3E0D8]">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#B3491F]">
            <ArrowDownLeft size={14} />
            <span>Total Receivable</span>
          </div>
          <div className="text-[20px] font-bold font-tabular text-[#B3491F] mt-1">
            {formatCurrency(totalReceivable)}
          </div>
          <div className="text-[10px] text-[#6B7078] mt-0.5">
            Owed to the shop (Customers)
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F6F5F1] border border-[#E3E0D8]">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2E7D4F]">
            <ArrowUpRight size={14} />
            <span>Total Payable</span>
          </div>
          <div className="text-[20px] font-bold font-tabular text-[#2E7D4F] mt-1">
            {formatCurrency(totalPayable)}
          </div>
          <div className="text-[10px] text-[#6B7078] mt-0.5">
            Owed by the shop (Deposits)
          </div>
        </div>
      </div>

      {/* Segmented Control (iOS-style pill toggle) */}
      <div className="p-2 bg-white border-b border-[#E3E0D8] flex justify-center shrink-0">
        <div className="flex items-center bg-[#F6F5F1] p-1 rounded-xl border border-[#E3E0D8] w-full max-w-xs">
          <button
            type="button"
            onClick={() => setViewType('RECEIVABLE')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewType === 'RECEIVABLE'
                ? 'bg-[#1B4B43] text-white shadow-xs'
                : 'text-[#6B7078]'
            }`}
          >
            Receivable (Khata)
          </button>
          <button
            type="button"
            onClick={() => setViewType('PAYABLE')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewType === 'PAYABLE'
                ? 'bg-[#1B4B43] text-white shadow-xs'
                : 'text-[#6B7078]'
            }`}
          >
            Payable (Advance)
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
        {displayedCustomers.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#6B7078]">
            No {viewType.toLowerCase()} records found.
          </div>
        ) : (
          displayedCustomers.map((cust) => {
            const isOverdue = cust.balanceDue > 150; // Mock threshold for overdue badge
            return (
              <div
                key={cust.id}
                onClick={() => setActiveCustomer(cust)}
                style={{
                  backgroundColor: AppColors.surface,
                  borderColor: AppColors.border,
                }}
                className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-2xs cursor-pointer hover:border-teal-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-[#22262B] truncate">
                      {cust.name}
                    </span>
                    {cust.shopName && (
                      <span className="text-[11px] text-[#6B7078] font-medium truncate">
                        · {cust.shopName}
                      </span>
                    )}
                  </div>

                  {cust.phone && (
                    <div className="flex items-center gap-1 text-[11px] text-[#6B7078] mt-0.5 font-tabular">
                      <Phone size={11} />
                      <span>{cust.phone}</span>
                    </div>
                  )}

                  {/* Overdue chip in rust color (Patch 6) */}
                  {isOverdue && viewType === 'RECEIVABLE' && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FDE8E1] text-[#B3491F] text-[10px] font-bold">
                      <AlertTriangle size={11} />
                      <span>Overdue &gt; 15 days</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div
                      style={{
                        color:
                          cust.balanceDue > 0
                            ? AppColors.danger
                            : cust.balanceDue < 0
                            ? AppColors.success
                            : AppColors.textPrimary,
                      }}
                      className="text-[17px] font-bold font-tabular"
                    >
                      {formatCurrency(Math.abs(cust.balanceDue))}
                    </div>
                    <div className="text-[10px] text-[#6B7078]">
                      {cust.balanceDue >= 0 ? 'Balance Due' : 'Advance Credit'}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Full History Slide-Over Sheet */}
      {activeCustomer && (
        <div className="absolute inset-0 bg-black/60 z-40 flex flex-col justify-end">
          <div className="bg-white w-full h-[88vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Sheet Header */}
            <div className="bg-[#1B4B43] px-4 py-3 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {activeCustomer.name}
                </h3>
                <div className="text-[11px] text-teal-100/80">
                  {activeCustomer.shopName || 'Retail Customer'} · {activeCustomer.phone || 'No phone'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomer(null)}
                className="text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Balance & Action */}
            <div className="p-4 bg-[#F6F5F1] border-b border-[#E3E0D8] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-[#6B7078] uppercase">
                  Current Running Balance
                </div>
                <div
                  style={{
                    color: activeCustomer.balanceDue > 0 ? AppColors.danger : AppColors.success,
                  }}
                  className="text-[26px] font-bold font-tabular leading-none mt-1"
                >
                  {formatCurrency(Math.abs(activeCustomer.balanceDue))}
                </div>
              </div>

              {isAdmin && activeCustomer.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                >
                  Record Payment
                </button>
              )}
            </div>

            {/* History Tabs (Bills on Credit vs Payment Logs) */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
              {/* Payment Log */}
              <div>
                <div className="text-xs font-bold text-[#6B7078] uppercase mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  <span>Payment History ({customerPayments.length})</span>
                </div>
                {customerPayments.length === 0 ? (
                  <div className="text-xs text-[#6B7078] p-3 rounded-xl bg-white border border-[#E3E0D8]">
                    No payments recorded yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {customerPayments.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white rounded-xl border border-[#E3E0D8] flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#22262B]">
                            Payment Received
                          </div>
                          <div className="text-[10px] text-[#6B7078]">
                            {new Date(p.paymentDate).toLocaleDateString()} · By {p.recordedBy}
                          </div>
                          {p.notes && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5">
                              "{p.notes}"
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold font-tabular text-[#2E7D4F]">
                          +{formatCurrency(p.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bills on Credit */}
              <div>
                <div className="text-xs font-bold text-[#6B7078] uppercase mb-1.5 flex items-center gap-1.5">
                  <History size={14} className="text-teal-700" />
                  <span>Credit / Loan Invoices ({customerBills.length})</span>
                </div>
                {customerBills.length === 0 ? (
                  <div className="text-xs text-[#6B7078] p-3 rounded-xl bg-white border border-[#E3E0D8]">
                    No credit bills found for this customer.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {customerBills.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 bg-white rounded-xl border border-[#E3E0D8] flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#1B4B43]">
                            {b.billNumber}
                          </div>
                          <div className="text-[10px] text-[#6B7078]">
                            {new Date(b.createdAt).toLocaleDateString()} · {b.items.length} items
                          </div>
                        </div>
                        <span className="text-sm font-bold font-tabular text-[#B3491F]">
                          {formatCurrency(b.grandTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && activeCustomer && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-[#22262B] mb-1">
              Record Customer Payment
            </h3>
            <p className="text-[11px] text-[#6B7078] mb-3">
              {activeCustomer.name} (Current Due: {formatCurrency(activeCustomer.balanceDue)})
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                  Amount Received (Rs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-base font-bold font-tabular text-[#2E7D4F] border border-[#E3E0D8] rounded-xl"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(activeCustomer.balanceDue.toString())}
                  className="px-2 py-1 bg-[#F6F5F1] text-[10px] font-bold rounded-lg border border-[#E3E0D8]"
                >
                  Pay Full ({formatCurrency(activeCustomer.balanceDue)})
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Cash, bank transfer, check..."
                  className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 text-xs border border-[#E3E0D8] rounded-xl text-[#6B7078]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Customer Account Modal */}
      {showNewCustomerModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-[#22262B] mb-2">
              New Customer Account
            </h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Customer Name *"
                className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
              />
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Phone (0300-XXXXXXX)"
                className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-tabular"
              />
              <input
                type="text"
                value={newShop}
                onChange={(e) => setNewShop(e.target.value)}
                placeholder="Shop Name (optional)"
                className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
              />
              <div>
                <label className="text-[10px] text-[#6B7078] block mb-1">
                  Starting Balance (Rs)
                </label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-tabular"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="flex-1 py-2 text-xs border border-[#E3E0D8] rounded-xl text-[#6B7078]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
