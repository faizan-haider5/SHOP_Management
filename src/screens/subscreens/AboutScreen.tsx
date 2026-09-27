import React from 'react';
import { ChevronLeft, Store, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';
import { AppColors } from '../../utils/colors';
import { Squircle } from '../../components/Squircle';
import { localDb } from '../../utils/storage';

interface AboutScreenProps {
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
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
            About & License
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col items-center justify-between">
        {/* Clean About Card (Patch 9) */}
        <div className="w-full max-w-sm bg-white p-6 rounded-3xl border border-[#E3E0D8] shadow-md flex flex-col items-center text-center">
          {/* App icon at top using Patch 0 squircle shape */}
          <Squircle
            size={72}
            backgroundColor={AppColors.primary}
            className="shadow-lg mb-3"
          >
            <Store size={36} className="text-white" />
          </Squircle>

          <h2 className="text-lg font-bold text-[#22262B]">
            {localDb.getStoreName()}
          </h2>
          <div className="text-xs text-[#1B4B43] font-semibold mt-0.5">
            Shop Management System · Offline Android POS
          </div>
          <div className="text-[11px] text-[#6B7078] mt-0.5">
            Currency: Pakistani Rupee (PKR - Rs) · Store configured by Admin
          </div>

          <div className="w-full border-t border-[#E3E0D8] my-4" />

          {/* Proprietary Notice */}
          <div className="text-xs text-[#22262B] leading-relaxed text-left bg-[#F6F5F1] p-3.5 rounded-2xl border border-[#E3E0D8] font-mono text-[11px]">
            <p className="font-bold text-[#1B4B43] mb-1">
              Copyright © 2026 Faizan Haider. All Rights Reserved.
            </p>
            <p className="text-slate-600">
              This software and its source code are the proprietary property of Faizan Haider and may not be copied, distributed, modified, or resold without express written permission from the author.
            </p>
          </div>

          {/* Tappable Contact Links */}
          <div className="w-full space-y-2.5 mt-5">
            <div className="text-xs font-bold text-[#6B7078] uppercase text-left px-1">
              Author Contact
            </div>

            <a
              href="tel:03427375861"
              className="flex items-center justify-between p-3 rounded-2xl border border-[#E3E0D8] bg-[#F6F5F1] hover:bg-slate-100 transition-colors text-xs font-semibold text-[#22262B]"
            >
              <div className="flex items-center gap-2.5">
                <Squircle size={32} backgroundColor="#E2EFEA">
                  <Phone size={16} style={{ color: AppColors.primary }} />
                </Squircle>
                <span>Phone: 0342-7375861</span>
              </div>
              <span className="text-[11px] text-teal-800 font-bold">Call Now</span>
            </a>

            <a
              href="mailto:faizan546233@gmail.com"
              className="flex items-center justify-between p-3 rounded-2xl border border-[#E3E0D8] bg-[#F6F5F1] hover:bg-slate-100 transition-colors text-xs font-semibold text-[#22262B]"
            >
              <div className="flex items-center gap-2.5">
                <Squircle size={32} backgroundColor="#FEF4DC">
                  <Mail size={16} className="text-[#B45309]" />
                </Squircle>
                <span className="truncate max-w-[190px]">faizan546233@gmail.com</span>
              </div>
              <span className="text-[11px] text-amber-800 font-bold">Email</span>
            </a>
          </div>
        </div>

        <div className="text-[11px] text-[#6B7078] text-center mt-6">
          Designed for high-speed counter POS operations with 100% offline data integrity.
        </div>
      </div>
    </div>
  );
};
