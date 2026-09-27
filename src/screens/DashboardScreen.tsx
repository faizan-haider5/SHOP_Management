import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Banknote,
  Package,
  HandCoins,
  ArrowUpRight,
  Flame,
  FileText,
  Plus,
  WifiOff,
  ShoppingBag,
  Store,
  Lock,
  Edit2,
  Check,
} from 'lucide-react';
import { AppColors, formatCurrency } from '../utils/colors';
import { Squircle } from '../components/Squircle';
import { localDb } from '../utils/storage';
import { TabId, UserRole } from '../types';

interface DashboardScreenProps {
  onNavigateTab: (tab: TabId) => void;
  onOpenNewBill: () => void;
  userRole: UserRole;
  currentUserName: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateTab,
  onOpenNewBill,
  userRole,
  currentUserName,
}) => {
  const [storeName, setStoreName] = useState(() => localDb.getStoreName());
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [tempStoreName, setTempStoreName] = useState(storeName);
  const [storeNameSaved, setStoreNameSaved] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [rankBy, setRankBy] = useState<'quantity' | 'revenue'>('quantity');

  const bills = localDb.getBills();
  const expenses = localDb.getExpenses();
  const customers = localDb.getCustomers();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfDay - now.getDay() * 86400000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const getFilteredBills = () => {
    return bills.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      if (filterPeriod === 'today') return t >= startOfDay;
      if (filterPeriod === 'week') return t >= startOfWeek;
      return t >= startOfMonth;
    });
  };

  const getFilteredExpenses = () => {
    return expenses.filter((e) => {
      const t = new Date(e.expenseDate).getTime();
      if (filterPeriod === 'today') return t >= startOfDay;
      if (filterPeriod === 'week') return t >= startOfWeek;
      return t >= startOfMonth;
    });
  };

  const currentBills = getFilteredBills();
  const currentExpenses = getFilteredExpenses();

  const totalSales = currentBills.reduce((s, b) => s + b.grandTotal, 0);
  const totalExpense = currentExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = Math.max(0, totalSales - totalExpense);

  const totalOutstandingLoans = customers
    .filter((c) => c.balanceDue > 0)
    .reduce((s, c) => s + c.balanceDue, 0);

  // Compute product sales
  const productMap: Record<
    string,
    { name: string; quantity: number; revenue: number; sku: string }
  > = {};

  currentBills.forEach((bill) => {
    bill.items.forEach((item) => {
      if (!productMap[item.itemName]) {
        productMap[item.itemName] = {
          name: item.itemName,
          quantity: 0,
          revenue: 0,
          sku: item.sku,
        };
      }
      productMap[item.itemName].quantity += item.quantity;
      productMap[item.itemName].revenue += item.lineTotal;
    });
  });

  const productList = Object.values(productMap).sort((a, b) => {
    return rankBy === 'quantity' ? b.quantity - a.quantity : b.revenue - a.revenue;
  });

  const topProduct = productList[0] || { name: 'Shahi Sipari', quantity: 24, revenue: 132.0 };

  // Count-up animation state
  const [animatedSales, setAnimatedSales] = useState(0);
  const [animatedProfit, setAnimatedProfit] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 25;
    const salesStep = totalSales / totalFrames;
    const profitStep = netProfit / totalFrames;

    const timer = setInterval(() => {
      frame++;
      setAnimatedSales((prev) => Math.min(totalSales, Number((frame * salesStep).toFixed(2))));
      setAnimatedProfit((prev) => Math.min(netProfit, Number((frame * profitStep).toFixed(2))));
      if (frame >= totalFrames) clearInterval(timer);
    }, 15);

    return () => clearInterval(timer);
  }, [filterPeriod, totalSales, netProfit]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-6 bg-[#F6F5F1] select-none">
      {/* Top Mobile App Header */}
      <div
        style={{ backgroundColor: AppColors.primary }}
        className="px-4 pt-3 pb-4 text-white shrink-0 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (userRole === 'admin') {
                    setTempStoreName(storeName);
                    setShowEditStoreModal(true);
                  } else {
                    alert('Store name can only be chosen and edited by an Admin.');
                  }
                }}
                className="group flex items-center gap-1.5 text-[11px] font-semibold text-teal-100 tracking-wide uppercase px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title={userRole === 'admin' ? 'Click to change store name (Admin only)' : 'Store name chosen by Admin only'}
              >
                <Store size={12} className="text-amber-300" />
                <span>{storeName}</span>
                {userRole === 'admin' ? (
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1 rounded flex items-center gap-0.5">
                    <Edit2 size={9} /> Edit
                  </span>
                ) : (
                  <span className="text-[9px] text-teal-200/80 flex items-center gap-0.5">
                    <Lock size={9} /> Admin Only
                  </span>
                )}
              </button>
              <span className="text-[10px] text-teal-200/60">·</span>
              <span className="text-[11px] text-teal-100/80 font-medium">
                {currentUserName} ({userRole})
              </span>
            </div>
            <h1 className="text-[19px] font-semibold text-white tracking-tight mt-1">
              Dashboard Overview
            </h1>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-xs rounded-full border border-white/20 text-[11px] font-medium text-emerald-100">
            <WifiOff size={12} className="text-amber-300" />
            <span>100% Offline</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Period Selector (Patch 7) */}
        <div className="flex items-center justify-between bg-white p-1 rounded-2xl border border-[#E3E0D8]">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPeriod(p)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filterPeriod === p
                  ? 'bg-[#1B4B43] text-white shadow-xs'
                  : 'text-[#6B7078] hover:text-[#22262B]'
              }`}
            >
              {p === 'today' ? "Today's Stats" : p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {/* Four Large Summary Tiles in Squircle Cards (Patch 7) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Tile 1: Sales */}
          <div className="bg-white p-3.5 rounded-3xl border border-[#E3E0D8] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7078]">
                {filterPeriod === 'today' ? "Today's Sales" : 'Total Sales'}
              </span>
              <Squircle size={32} backgroundColor={AppColors.sections.billing}>
                <TrendingUp size={16} style={{ color: AppColors.primary }} />
              </Squircle>
            </div>
            <div
              style={{ color: AppColors.primary }}
              className="text-[22px] font-bold font-tabular tracking-tight mt-2"
            >
              {formatCurrency(animatedSales)}
            </div>
            <div className="text-[10px] text-[#6B7078] mt-0.5">
              {currentBills.length} bills completed
            </div>
          </div>

          {/* Tile 2: Profit */}
          <div className="bg-white p-3.5 rounded-3xl border border-[#E3E0D8] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7078]">
                {filterPeriod === 'today' ? "Today's Profit" : 'Net Profit'}
              </span>
              <Squircle size={32} backgroundColor="#E5F4EB">
                <Banknote size={16} className="text-[#2E7D4F]" />
              </Squircle>
            </div>
            <div
              style={{ color: AppColors.success }}
              className="text-[22px] font-bold font-tabular tracking-tight mt-2"
            >
              {formatCurrency(animatedProfit)}
            </div>
            <div className="text-[10px] text-[#2E7D4F] font-semibold mt-0.5">
              Revenue minus expenses
            </div>
          </div>

          {/* Tile 3: Most-Selling Product */}
          <div className="bg-white p-3.5 rounded-3xl border border-[#E3E0D8] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7078]">
                Top Selling Item
              </span>
              <Squircle size={32} backgroundColor={AppColors.sections.inventory}>
                <Flame size={16} className="text-[#B45309]" />
              </Squircle>
            </div>
            <div className="text-[14px] font-bold text-[#22262B] truncate mt-2 leading-tight">
              {topProduct.name}
            </div>
            <div className="text-[10px] text-[#B45309] font-bold font-tabular mt-0.5">
              {topProduct.quantity} sold ({formatCurrency(topProduct.revenue)})
            </div>
          </div>

          {/* Tile 4: Total Outstanding Loans */}
          <div className="bg-white p-3.5 rounded-3xl border border-[#E3E0D8] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7078]">
                Total Loans Due
              </span>
              <Squircle size={32} backgroundColor={AppColors.sections.loans}>
                <HandCoins size={16} className="text-indigo-600" />
              </Squircle>
            </div>
            <div
              style={{ color: AppColors.danger }}
              className="text-[22px] font-bold font-tabular tracking-tight mt-2"
            >
              {formatCurrency(totalOutstandingLoans)}
            </div>
            <div className="text-[10px] text-[#B3491F] font-semibold mt-0.5">
              Customer receivables
            </div>
          </div>
        </div>

        {/* Primary Action Button (New Bill) */}
        {userRole === 'admin' && (
          <button
            type="button"
            onClick={onOpenNewBill}
            style={{
              backgroundColor: AppColors.accent,
              color: AppColors.textPrimary,
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm shadow-xs transition-transform active:scale-[0.99] cursor-pointer"
          >
            <Squircle size={26} backgroundColor="#FFFFFF40">
              <Plus size={16} className="text-[#22262B]" />
            </Squircle>
            <span>Open Cashier POS (New Bill)</span>
          </button>
        )}

        {/* Most-Selling Products List (Patch 7) */}
        <div className="bg-white p-4 rounded-3xl border border-[#E3E0D8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#22262B]">
                Most-Selling Products
              </h2>
              <div className="text-[11px] text-[#6B7078]">
                Ranked for {filterPeriod}
              </div>
            </div>

            {/* Rank Toggle */}
            <div className="flex items-center bg-[#F6F5F1] p-0.5 rounded-xl border border-[#E3E0D8] text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setRankBy('quantity')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  rankBy === 'quantity'
                    ? 'bg-[#1B4B43] text-white'
                    : 'text-[#6B7078]'
                }`}
              >
                By Qty
              </button>
              <button
                type="button"
                onClick={() => setRankBy('revenue')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  rankBy === 'revenue'
                    ? 'bg-[#1B4B43] text-white'
                    : 'text-[#6B7078]'
                }`}
              >
                By Rev
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {productList.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#6B7078]">
                No completed bills in this period.
              </div>
            ) : (
              productList.slice(0, 5).map((prod, idx) => {
                const maxQty = productList[0].quantity || 1;
                const percentage = Math.round((prod.quantity / maxQty) * 100);

                return (
                  <div key={prod.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 text-[11px] font-bold text-[#6B7078] font-tabular">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-[#22262B] truncate">
                          {prod.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold font-tabular text-[#1B4B43]">
                          {rankBy === 'quantity'
                            ? `${prod.quantity} pcs`
                            : formatCurrency(prod.revenue)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full bg-teal-700 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Admin-Only Store Name Editor Modal */}
      {showEditStoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-4 border border-[#E3E0D8] shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Squircle size={32} backgroundColor={AppColors.sections.settings}>
                  <Store size={18} style={{ color: AppColors.primary }} />
                </Squircle>
                <div>
                  <h3 className="text-xs font-bold text-[#22262B]">
                    Store Name Configuration
                  </h3>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Admin Exclusive
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditStoreModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-[#6B7078] leading-relaxed">
              The store name is chosen and configured by the <strong className="text-slate-800">Admin only</strong>.
              It appears across 80mm thermal receipts, customer WhatsApp invoices, and ledger reports.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userRole !== 'admin') {
                  alert('Only an Admin can choose the store name.');
                  return;
                }
                const success = localDb.setStoreName(tempStoreName, userRole, currentUserName);
                if (success) {
                  setStoreName(tempStoreName.trim());
                  setStoreNameSaved(true);
                  setTimeout(() => {
                    setStoreNameSaved(false);
                    setShowEditStoreModal(false);
                  }, 800);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-semibold text-[#22262B] block mb-1">
                  Enter Official Store Name
                </label>
                <input
                  type="text"
                  required
                  value={tempStoreName}
                  onChange={(e) => setTempStoreName(e.target.value)}
                  placeholder="e.g. Al-Madina General Store"
                  className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-semibold bg-[#F6F5F1] text-[#22262B] focus:outline-none focus:border-teal-700"
                />
              </div>

              {storeNameSaved && (
                <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Store name updated successfully!</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditStoreModal(false)}
                  className="flex-1 py-2 text-xs font-semibold border border-[#E3E0D8] text-[#6B7078] rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-transform flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Store size={13} />
                  <span>Save Name</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
