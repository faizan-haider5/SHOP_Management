import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AppColors } from '../utils/colors';
import { Squircle } from './Squircle';

interface SectionTileProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconTintColor: string;
  iconColor?: string;
  trailingText?: string;
  onClick?: () => void;
}

export const SectionTile: React.FC<SectionTileProps> = ({
  title,
  subtitle,
  icon,
  iconTintColor,
  iconColor = AppColors.primary,
  trailingText,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: AppColors.surface,
        borderColor: AppColors.border,
      }}
      className="w-full flex items-center justify-between p-3.5 my-1.5 rounded-xl border text-left transition-all active:scale-[0.99] hover:bg-slate-50/50 cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <Squircle
          size={42}
          backgroundColor={iconTintColor}
          className="shrink-0"
        >
          <div style={{ color: iconColor }}>{icon}</div>
        </Squircle>

        <div className="min-w-0">
          <div
            style={{ color: AppColors.textPrimary }}
            className="text-[14px] font-medium leading-snug truncate"
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{ color: AppColors.textSecondary }}
              className="text-[12px] font-normal leading-tight truncate mt-0.5"
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {trailingText && (
          <span
            style={{ color: AppColors.textSecondary }}
            className="text-xs font-tabular"
          >
            {trailingText}
          </span>
        )}
        <ChevronRight size={18} style={{ color: AppColors.textSecondary }} />
      </div>
    </button>
  );
};
