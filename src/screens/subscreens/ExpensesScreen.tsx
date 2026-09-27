import React, { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  Fuel,
  Utensils,
  Bike,
  Layers,
  Trash2,
  Calendar,
  X,
} from 'lucide-react';
import { AppColors, formatCurrency } from '../../utils/colors';
import { Squircle } from '../../components/Squircle';
import { localDb } from '../../utils/storage';
import { Expense, UserRole } from '../../types';

interface ExpensesScreenProps {
  onBack: () => void;
  userRole: UserRole;
  currentUserName: string;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  onBack,
  userRole,
  currentUserName,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    localDb.getExpenses()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [category, setCategory] = useState('Petrol');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('10.00');
  const [notes, setNotes] = useState('');

  const isAdmin = userRole === 'admin';

  // Category Theme helper
  const getCategoryMeta = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'petrol':
        return {
          icon: <Fuel size={18} />,
          bg: '#FEF4DC',
          color: '#B45309',
        };
      case 'food':
        return {
          icon: <Utensils size={18} />,
          bg: '#FDE8E1',
          color: '#B3491F',
        };
      case 'bike/maintenance':
      case 'bike':
      case 'maintenance':
        return {
          icon: <Bike size={18} />,
          bg: '#ECEFF8',
          color: '#3B82F6',
        };
      default:
        return {
          icon: <Layers size={18} />,
          bg: '#F0EBF8',
          color: '#7C3AED',
        };
    }
  };

  // Filter calculations
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfDay - now.getDay() * 86400000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const totalToday = expenses
    .filter((e) => new Date(e.expenseDate).getTime() >= startOfDay)
    .reduce((s, e) => s + e.amount, 0);

  const totalWeek = expenses
    .filter((e) => new Date(e.expenseDate).getTime() >= startOfWeek)
    .reduce((s, e) => s + e.amount, 0);

  const totalMonth = expenses
    .filter((e) => new Date(e.expenseDate).getTime() >= startOfMonth)
    .reduce((s, e) => s + e.amount, 0);

  const filteredExpenses = expenses.filter(
    (e) => selectedCategory === 'All' || e.category === selectedCategory
  );

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const finalCat = category === 'Custom' ? customCategory.trim() || 'General' : category;
    const newExp: Expense = {
      id: Date.now(),
      category: finalCat,
      amount: parseFloat(amount) || 0,
      notes: notes.trim() || undefined,
      expenseDate: new Date().toISOString(),
      recordedBy: currentUserName,
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    localDb.saveExpenses(updated);
    localDb.logActivity('CREATE', 'EXPENSES', `Recorded expense ${finalCat}: Rs ${newExp.amount}`, currentUserName);
    setShowAddModal(false);
    setNotes('');
  };

  const handleDeleteExpense = (id: number) => {
    if (!isAdmin) return;
    if (confirm('Delete this expense record?')) {
      const updated = expenses.filter((e) => e.id !== id);
      setExpenses(updated);
      localDb.saveExpenses(updated);
      localDb.logActivity('DELETE', 'EXPENSES', `Deleted expense #${id}`, currentUserName);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F6F5F1] select-none">
      {/* Top Header */}
      <div
        style={{ backgroundColor: AppColors.primary }}
        className="px-3 py-3 text-white flex items-center justify-between shrink-0 shadow-xs"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[17px] font-semibold tracking-tight text-white">
            Expense Tracking
          </h1>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Add Expense</span>
          </button>
        ) : (
          <span className="text-[10px] bg-white/10 text-white/80 px-2 py-1 rounded-md font-medium">
            Partner (Read-Only)
          </span>
        )}
      </div>

      {/* Totals Strip in Large Tabular Figures (Patch 5) */}
      <div className="p-3 bg-white border-b border-[#E3E0D8] grid grid-cols-3 gap-2 shrink-0">
        <div className="p-2.5 rounded-xl bg-[#F6F5F1] border border-[#E3E0D8] text-center">
          <div className="text-[10px] font-semibold uppercase text-[#6B7078]">
            Today
          </div>
          <div className="text-[16px] font-bold font-tabular text-[#B3491F] mt-0.5">
            {formatCurrency(totalToday)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F6F5F1] border border-[#E3E0D8] text-center">
          <div className="text-[10px] font-semibold uppercase text-[#6B7078]">
            This Week
          </div>
          <div className="text-[16px] font-bold font-tabular text-[#B3491F] mt-0.5">
            {formatCurrency(totalWeek)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F6F5F1] border border-[#E3E0D8] text-center">
          <div className="text-[10px] font-semibold uppercase text-[#6B7078]">
            This Month
          </div>
          <div className="text-[16px] font-bold font-tabular text-[#B3491F] mt-0.5">
            {formatCurrency(totalMonth)}
          </div>
        </div>
      </div>

      {/* Filter by Category bar */}
      <div className="p-2 bg-white border-b border-[#E3E0D8] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        {['All', 'Petrol', 'Food', 'Bike/Maintenance'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === cat
                ? 'bg-[#1B4B43] text-white shadow-2xs'
                : 'bg-[#F6F5F1] text-[#6B7078] hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#6B7078]">
            No expenses found for this category.
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const meta = getCategoryMeta(exp.category);
            return (
              <div
                key={exp.id}
                style={{
                  backgroundColor: AppColors.surface,
                  borderColor: AppColors.border,
                }}
                className="p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Squircle
                    size={42}
                    backgroundColor={meta.bg}
                    className="shrink-0"
                  >
                    <div style={{ color: meta.color }}>{meta.icon}</div>
                  </Squircle>

                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-[#22262B] truncate">
                      {exp.category}
                    </div>
                    <div className="text-[11px] text-[#6B7078] truncate mt-0.5">
                      {exp.notes || 'Counter expense'} · {new Date(exp.expenseDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    style={{ color: AppColors.danger }}
                    className="text-[16px] font-bold font-tabular"
                  >
                    -{formatCurrency(exp.amount)}
                  </span>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#22262B]">
                Record Shop Expense
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl bg-white"
                >
                  <option value="Petrol">Petrol / Fuel</option>
                  <option value="Food">Food / Refreshment</option>
                  <option value="Bike/Maintenance">Bike / Counter Maintenance</option>
                  <option value="Custom">+ Custom Category</option>
                </select>
              </div>

              {category === 'Custom' && (
                <div>
                  <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Shop Electricity"
                    className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                  Amount (Rs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-bold font-tabular text-[#B3491F] text-base"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                  Optional Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 2 litres petrol for supply delivery"
                  className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E3E0D8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs border border-[#E3E0D8] rounded-xl text-[#6B7078]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
