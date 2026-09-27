import React, { useState } from 'react';
import { ChevronLeft, Plus, History, Percent, Users2, Shield, Calendar } from 'lucide-react';
import { AppColors, formatCurrency } from '../../utils/colors';
import { Squircle } from '../../components/Squircle';
import { localDb } from '../../utils/storage';
import { PartnershipRatioRecord, UserRole } from '../../types';

interface PartnershipScreenProps {
  onBack: () => void;
  userRole: UserRole;
}

export const PartnershipScreen: React.FC<PartnershipScreenProps> = ({
  onBack,
  userRole,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [ratioHistory, setRatioHistory] = useState<PartnershipRatioRecord[]>(() =>
    localDb.getRatioHistory()
  );
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  // New ratio form
  const [p1Ratio, setP1Ratio] = useState('60');
  const [p2Ratio, setP2Ratio] = useState('40');
  const [p1Name, setP1Name] = useState('Sadaf Ali');
  const [p2Name, setP2Name] = useState('Bilal Ahmed');

  // Manual override for single calculation
  const [overrideActive, setOverrideActive] = useState(false);
  const [tempP1Ratio, setTempP1Ratio] = useState(60);
  const [tempP2Ratio, setTempP2Ratio] = useState(40);

  const isAdmin = userRole === 'admin';

  // Latest active ratio
  const activeRatio = overrideActive
    ? { partner1Ratio: tempP1Ratio, partner2Ratio: tempP2Ratio, partner1Name: p1Name, partner2Name: p2Name }
    : ratioHistory[0] || { partner1Ratio: 60, partner2Ratio: 40, partner1Name: 'Sadaf Ali', partner2Name: 'Bilal Ahmed' };

  // Calculate revenue & expenses for period
  const bills = localDb.getBills();
  const expenses = localDb.getExpenses();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfDay - now.getDay() * 86400000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filterByPeriod = (dateStr: string) => {
    const t = new Date(dateStr).getTime();
    if (period === 'today') return t >= startOfDay;
    if (period === 'week') return t >= startOfWeek;
    if (period === 'month') return t >= startOfMonth;
    return true; // custom
  };

  const periodBills = bills.filter((b) => filterByPeriod(b.createdAt));
  const periodExpenses = expenses.filter((e) => filterByPeriod(e.expenseDate));

  const totalRevenue = periodBills.reduce((s, b) => s + b.grandTotal, 0);
  const totalExpense = periodExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = Math.max(0, totalRevenue - totalExpense);

  const p1Profit = Number(((netProfit * activeRatio.partner1Ratio) / 100).toFixed(2));
  const p2Profit = Number(((netProfit * activeRatio.partner2Ratio) / 100).toFixed(2));

  const handleSaveRatio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const r1 = parseFloat(p1Ratio) || 50;
    const r2 = parseFloat(p2Ratio) || 50;
    if (r1 + r2 !== 100) {
      alert('Ratios must add up to exactly 100%');
      return;
    }

    const newRecord: PartnershipRatioRecord = {
      id: `ratio-${Date.now()}`,
      partner1Ratio: r1,
      partner2Ratio: r2,
      partner1Name: p1Name.trim(),
      partner2Name: p2Name.trim(),
      effectiveDate: new Date().toISOString(),
    };

    const updated = [newRecord, ...ratioHistory];
    setRatioHistory(updated);
    localDb.saveRatioHistory(updated);
    localDb.logActivity(
      'UPDATE',
      'SYSTEM',
      `Updated partnership ratio to ${r1}/${r2} effective ${new Date().toLocaleDateString()}`,
      'Admin'
    );
    setShowConfigModal(false);
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
            Partnership & Profit Split
          </h1>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
            className="px-2.5 py-1 rounded-lg text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
          >
            Configure Ratio
          </button>
        ) : (
          <span className="text-[10px] bg-white/10 text-white/80 px-2 py-1 rounded-md font-medium">
            Read-Only
          </span>
        )}
      </div>

      {/* Period Segmented Control */}
      <div className="p-3 bg-white border-b border-[#E3E0D8] flex items-center justify-between gap-2">
        <div className="flex items-center bg-[#F6F5F1] p-1 rounded-xl border border-[#E3E0D8] flex-1">
          {(['today', 'week', 'month', 'custom'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                period === p
                  ? 'bg-white text-[#1B4B43] shadow-xs'
                  : 'text-[#6B7078]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowOverrideModal(true)}
          className={`px-2 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
            overrideActive
              ? 'bg-amber-100 border-amber-400 text-amber-900'
              : 'bg-white border-[#E3E0D8] text-[#6B7078]'
          }`}
          title="Single calculation override"
        >
          {overrideActive ? 'Override ON' : 'Override'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Net Profit Summary Card with Tabular figures */}
        <div className="bg-white p-4 rounded-2xl border border-[#E3E0D8] shadow-2xs">
          <div className="text-[11px] font-medium text-[#6B7078] uppercase">
            Net Distributable Profit ({period})
          </div>
          <div
            style={{ color: AppColors.primary }}
            className="text-[28px] font-bold font-tabular tracking-tight leading-none mt-1"
          >
            {formatCurrency(netProfit)}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#E3E0D8] text-xs">
            <div>
              <span className="text-[#6B7078]">Gross Sales Revenue:</span>
              <div className="font-bold font-tabular text-[#22262B]">
                {formatCurrency(totalRevenue)}
              </div>
            </div>
            <div>
              <span className="text-[#6B7078]">Total Expenses:</span>
              <div className="font-bold font-tabular text-[#B3491F]">
                -{formatCurrency(totalExpense)}
              </div>
            </div>
          </div>
        </div>

        {/* Partner Share Cards */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-[#6B7078] uppercase px-1">
            Current Profit Distribution ({activeRatio.partner1Ratio}% / {activeRatio.partner2Ratio}%)
          </div>

          {/* Partner 1 */}
          <div className="bg-white p-4 rounded-2xl border border-[#E3E0D8] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <Squircle size={44} backgroundColor={AppColors.sections.partnership}>
                <Users2 size={20} className="text-purple-700" />
              </Squircle>
              <div>
                <div className="text-[15px] font-bold text-[#22262B]">
                  {activeRatio.partner1Name}
                </div>
                <div className="text-xs text-[#6B7078]">
                  Partner A · {activeRatio.partner1Ratio}% Share
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                style={{ color: AppColors.primary }}
                className="text-[18px] font-bold font-tabular"
              >
                {formatCurrency(p1Profit)}
              </div>
              <div className="text-[10px] text-[#2E7D4F] font-semibold">
                Earned Share
              </div>
            </div>
          </div>

          {/* Partner 2 */}
          <div className="bg-white p-4 rounded-2xl border border-[#E3E0D8] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <Squircle size={44} backgroundColor={AppColors.sections.partnership}>
                <Users2 size={20} className="text-purple-700" />
              </Squircle>
              <div>
                <div className="text-[15px] font-bold text-[#22262B]">
                  {activeRatio.partner2Name}
                </div>
                <div className="text-xs text-[#6B7078]">
                  Partner B · {activeRatio.partner2Ratio}% Share
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                style={{ color: AppColors.primary }}
                className="text-[18px] font-bold font-tabular"
              >
                {formatCurrency(p2Profit)}
              </div>
              <div className="text-[10px] text-[#2E7D4F] font-semibold">
                Earned Share
              </div>
            </div>
          </div>
        </div>

        {/* Ratio History Table with Effective Dates (Patch 4) */}
        <div className="bg-white p-4 rounded-2xl border border-[#E3E0D8] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#22262B] flex items-center gap-1.5">
              <History size={14} className="text-teal-700" />
              <span>Ratio History (Effective Dates)</span>
            </span>
          </div>

          <div className="space-y-1.5">
            {ratioHistory.map((rec) => (
              <div
                key={rec.id}
                className="p-2.5 rounded-xl bg-[#F6F5F1] border border-[#E3E0D8] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-[#22262B]">
                    {rec.partner1Ratio}% ({rec.partner1Name}) / {rec.partner2Ratio}% ({rec.partner2Name})
                  </div>
                  <div className="text-[10px] text-[#6B7078]">
                    Effective from: {new Date(rec.effectiveDate).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Logged
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Configure Ratio Modal (Admin Only) */}
      {showConfigModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-[#22262B] mb-2">
              Configure Profit-Split Ratio
            </h3>
            <p className="text-[11px] text-[#6B7078] mb-3">
              Stored with effective date so past accounting periods retain exact historical ratios.
            </p>

            <form onSubmit={handleSaveRatio} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                  Partner 1 Name & Ratio %
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={p1Name}
                    onChange={(e) => setP1Name(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
                  />
                  <input
                    type="number"
                    required
                    value={p1Ratio}
                    onChange={(e) => {
                      const v = e.target.value;
                      setP1Ratio(v);
                      setP2Ratio((100 - (parseFloat(v) || 0)).toString());
                    }}
                    className="w-16 px-2 py-2 text-xs border border-[#E3E0D8] rounded-xl font-bold font-tabular text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                  Partner 2 Name & Ratio %
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={p2Name}
                    onChange={(e) => setP2Name(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
                  />
                  <input
                    type="number"
                    required
                    value={p2Ratio}
                    onChange={(e) => {
                      const v = e.target.value;
                      setP2Ratio(v);
                      setP1Ratio((100 - (parseFloat(v) || 0)).toString());
                    }}
                    className="w-16 px-2 py-2 text-xs border border-[#E3E0D8] rounded-xl font-bold font-tabular text-center"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 py-2 text-xs border border-[#E3E0D8] rounded-xl text-[#6B7078]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl"
                >
                  Save Ratio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Override Ratio Modal */}
      {showOverrideModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-[#22262B] mb-1">
              Manual Ratio Override
            </h3>
            <p className="text-[11px] text-[#6B7078] mb-3">
              Applies to this calculation only without overwriting the stored default.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span>Partner 1: {tempP1Ratio}%</span>
                <span>Partner 2: {tempP2Ratio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempP1Ratio}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setTempP1Ratio(val);
                  setTempP2Ratio(100 - val);
                }}
                className="w-full"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOverrideActive(false);
                    setShowOverrideModal(false);
                  }}
                  className="flex-1 py-2 text-xs border border-[#E3E0D8] rounded-xl text-[#6B7078]"
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOverrideActive(true);
                    setShowOverrideModal(false);
                  }}
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl"
                >
                  Apply Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
