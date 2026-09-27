import React, { useState } from 'react';
import {
  ChevronLeft,
  FileSpreadsheet,
  Download,
  Share2,
  Calendar,
  Layers,
  Clock,
  Printer,
} from 'lucide-react';
import { AppColors, formatCurrency } from '../../utils/colors';
import { Squircle } from '../../components/Squircle';
import { localDb } from '../../utils/storage';

interface ReportsScreenProps {
  onBack: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onBack }) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');

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
    return true;
  };

  const periodBills = bills.filter((b) => filterByPeriod(b.createdAt));
  const periodExpenses = expenses.filter((e) => filterByPeriod(e.expenseDate));

  const totalSales = periodBills.reduce((s, b) => s + b.grandTotal, 0);
  const totalExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = Math.max(0, totalSales - totalExpenses);

  const exportCSV = (type: 'sales' | 'expenses') => {
    let csv = '';
    if (type === 'sales') {
      csv = 'BillNumber,Date,Customer,GrandTotal,PaymentType\n';
      periodBills.forEach((b) => {
        csv += `"${b.billNumber}","${b.createdAt}","${b.customerName || 'Cash'}",${b.grandTotal},"${b.paymentType}"\n`;
      });
    } else {
      csv = 'Category,Date,Amount,Notes\n';
      periodExpenses.forEach((e) => {
        csv += `"${e.category}","${e.expenseDate}",${e.amount},"${e.notes || ''}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${type}_${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F6F5F1] select-none">
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
            Reports & Analytics
          </h1>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="p-2 text-white hover:bg-white/10 rounded-lg cursor-pointer"
          title="Print Report"
        >
          <Printer size={16} />
        </button>
      </div>

      {/* Period Segmented Control */}
      <div className="p-3 bg-white border-b border-[#E3E0D8] flex items-center justify-between gap-1">
        {(['today', 'week', 'month', 'all'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
              period === p
                ? 'bg-[#1B4B43] text-white shadow-xs'
                : 'text-[#6B7078] hover:bg-slate-100'
            }`}
          >
            {p === 'today' ? 'Today' : p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'All Time'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* P&L Snapshot Card */}
        <div className="bg-white p-4 rounded-3xl border border-[#E3E0D8] shadow-2xs space-y-3">
          <div className="text-xs font-bold text-[#6B7078] uppercase">
            Profit & Loss Summary ({period})
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#F6F5F1] border border-[#E3E0D8]">
              <span className="text-[10px] font-semibold text-[#6B7078]">Total Sales</span>
              <div className="text-[15px] font-bold font-tabular text-[#1B4B43] mt-0.5">
                {formatCurrency(totalSales)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F6F5F1] border border-[#E3E0D8]">
              <span className="text-[10px] font-semibold text-[#6B7078]">Expenses</span>
              <div className="text-[15px] font-bold font-tabular text-[#B3491F] mt-0.5">
                -{formatCurrency(totalExpenses)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#E5F4EB] border border-emerald-200">
              <span className="text-[10px] font-semibold text-[#2E7D4F]">Net Profit</span>
              <div className="text-[15px] font-bold font-tabular text-[#2E7D4F] mt-0.5">
                {formatCurrency(netProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Downloadable Reports Strip */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#6B7078] uppercase px-1">
            Export Report Files (PDF / CSV)
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E3E0D8] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <Squircle size={40} backgroundColor={AppColors.sections.reports}>
                <FileSpreadsheet size={18} style={{ color: AppColors.success }} />
              </Squircle>
              <div>
                <div className="text-[14px] font-semibold text-[#22262B]">
                  Sales Register ({periodBills.length} records)
                </div>
                <div className="text-[11px] text-[#6B7078]">
                  Excel CSV breakdown of customer bills & totals
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => exportCSV('sales')}
              style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E3E0D8] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <Squircle size={40} backgroundColor={AppColors.sections.reports}>
                <Layers size={18} style={{ color: AppColors.success }} />
              </Squircle>
              <div>
                <div className="text-[14px] font-semibold text-[#22262B]">
                  Expenses Register ({periodExpenses.length} records)
                </div>
                <div className="text-[11px] text-[#6B7078]">
                  Operating expense report with fuel & maintenance
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => exportCSV('expenses')}
              style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
