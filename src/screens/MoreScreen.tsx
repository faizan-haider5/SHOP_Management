import React from 'react';
import {
  PieChart,
  Users2,
  BarChart3,
  Settings,
  ChevronRight,
  HardDrive,
  Clock,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { AppColors } from '../utils/colors';
import { SectionTile } from '../components/SectionTile';
import { SubScreenId, UserRole } from '../types';

interface MoreScreenProps {
  onOpenSubscreen: (id: SubScreenId) => void;
  userRole: UserRole;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
  onOpenSubscreen,
  userRole,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-6 bg-[#F6F5F1] select-none">
      {/* Top Header */}
      <div
        style={{ backgroundColor: AppColors.primary }}
        className="px-4 py-3 text-white shrink-0 shadow-xs"
      >
        <h1 className="text-[17px] font-semibold tracking-tight text-white">
          More Modules
        </h1>
        <div className="text-[11px] text-teal-100/80">
          Management, Reports & System Config
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Shop Operations Section */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7078] mb-1.5 px-1">
            Shop Operations & Accounting
          </div>

          <div className="space-y-1">
            <SectionTile
              title="Expenses"
              subtitle="Petrol, food, bike & counter operating costs"
              icon={<PieChart size={20} />}
              iconTintColor={AppColors.sections.expenses}
              iconColor={AppColors.danger}
              onClick={() => onOpenSubscreen('expenses')}
            />

            <SectionTile
              title="Partnership & Profit Split"
              subtitle="Configurable ratio history & net profit share"
              icon={<Users2 size={20} />}
              iconTintColor={AppColors.sections.partnership}
              iconColor="#7C3AED"
              onClick={() => onOpenSubscreen('partnership')}
            />

            <SectionTile
              title="Reports & Analytics"
              subtitle="P&L overview, sales/expense registers & CSV export"
              icon={<BarChart3 size={20} />}
              iconTintColor={AppColors.sections.reports}
              iconColor={AppColors.success}
              onClick={() => onOpenSubscreen('reports')}
            />
          </div>
        </div>

        {/* System & Audit Section */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7078] mb-1.5 px-1">
            System, Security & Audit
          </div>

          <div className="space-y-1">
            <SectionTile
              title="Settings & Hardware"
              subtitle="Backup/Restore, PIN security, biometric & thermal printer"
              icon={<Settings size={20} />}
              iconTintColor={AppColors.sections.settings}
              iconColor={AppColors.textPrimary}
              onClick={() => onOpenSubscreen('settings')}
            />

            <SectionTile
              title="Audit Activity Log"
              subtitle="Traceable history of all additions, edits & deletions"
              icon={<Clock size={20} />}
              iconTintColor="#ECEFF8"
              iconColor="#4F46E5"
              onClick={() => onOpenSubscreen('activity-log')}
            />

            <SectionTile
              title="About & License"
              subtitle="Faizan Haider · Copyright © 2026 proprietary license"
              icon={<Store size={20} />}
              iconTintColor="#E2EFEA"
              iconColor={AppColors.primary}
              onClick={() => onOpenSubscreen('about')}
            />
          </div>
        </div>

        {/* Offline Badge Footnote */}
        <div
          style={{
            backgroundColor: AppColors.surface,
            borderColor: AppColors.border,
          }}
          className="p-3.5 rounded-2xl border flex items-center gap-3 text-xs text-[#6B7078]"
        >
          <HardDrive size={18} className="text-teal-700 shrink-0" />
          <div className="leading-tight">
            <strong className="text-[#22262B]">100% Offline Architecture</strong>
            <p className="mt-0.5 text-[11px]">
              Drift on SQLite. Single source of truth. Zero remote network calls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
