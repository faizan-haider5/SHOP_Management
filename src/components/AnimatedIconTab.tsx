import React from 'react';
import { motion } from 'motion/react';
import { AppColors } from '../utils/colors';

interface AnimatedIconTabProps {
  outlineIcon: React.ReactNode;
  filledIcon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onTap: () => void;
  tabKey: string;
}

/**
 * Reusable AnimatedIconTab component for bottom mobile navigation bar.
 *
 * Implements:
 * 1. Outlined icon at rest
 * 2. Filled/solid icon when active
 * 3. Spring-based scale animation on tab change (scale 1.15x then settle to 1.0x, ~250ms, easeOutBack)
 * 4. Inter typography label in sentence case
 */
export const AnimatedIconTab: React.FC<AnimatedIconTabProps> = ({
  outlineIcon,
  filledIcon,
  label,
  isSelected,
  onTap,
  tabKey,
}) => {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={label}
      className="relative flex flex-1 flex-col items-center justify-center py-2 px-1 focus:outline-none transition-colors select-none cursor-pointer group"
    >
      <motion.div
        key={`${tabKey}-${isSelected}`}
        initial={isSelected ? { scale: 1 } : { scale: 1 }}
        animate={
          isSelected
            ? {
                scale: [1.0, 1.18, 1.0],
                transition: {
                  duration: 0.26,
                  ease: [0.34, 1.56, 0.64, 1], // easeOutBack curve
                },
              }
            : { scale: 1.0 }
        }
        className="flex items-center justify-center h-6 w-6"
      >
        <div
          style={{
            color: isSelected ? AppColors.primary : AppColors.textSecondary,
          }}
          className="transition-colors duration-150"
        >
          {isSelected ? filledIcon : outlineIcon}
        </div>
      </motion.div>

      <span
        style={{
          color: isSelected ? AppColors.primary : AppColors.textSecondary,
        }}
        className={`mt-1 text-[11px] leading-tight tracking-tight transition-colors duration-150 ${
          isSelected ? 'font-semibold' : 'font-medium'
        }`}
      >
        {label}
      </span>
    </button>
  );
};
