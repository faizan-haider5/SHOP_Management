import React, { useState } from 'react';
import { ChevronLeft, Search, ShieldCheck, Activity, Filter } from 'lucide-react';
import { AppColors } from '../../utils/colors';
import { localDb } from '../../utils/storage';
import { ActivityLogEntry } from '../../types';

interface ActivityLogScreenProps {
  onBack: () => void;
}

export const ActivityLogScreen: React.FC<ActivityLogScreenProps> = ({ onBack }) => {
  const [logs] = useState<ActivityLogEntry[]>(() => localDb.getActivityLogs());
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      l.module.toLowerCase().includes(search.toLowerCase())
  );

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
            Audit Activity Log
          </h1>
        </div>
        <span className="text-[11px] text-teal-100/80">Read-Only</span>
      </div>

      <div className="p-3 bg-white border-b border-[#E3E0D8]">
        <div className="relative">
          <Search
            size={16}
            style={{ color: AppColors.textSecondary }}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity log, user, or action..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F5F1] rounded-xl border border-[#E3E0D8] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#6B7078]">
            No activity log entries found.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-white rounded-xl border border-[#E3E0D8] space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#1B4B43] px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200">
                  {log.module} · {log.action}
                </span>
                <span className="text-[#6B7078] font-tabular">
                  {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-xs font-medium text-[#22262B]">
                {log.description}
              </div>
              <div className="text-[10px] text-[#6B7078]">
                By: <span className="font-semibold text-[#22262B]">{log.performedBy}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
