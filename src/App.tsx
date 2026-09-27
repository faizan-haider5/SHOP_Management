import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid,
  FileText,
  Package,
  HandCoins,
  MoreHorizontal,
  Smartphone,
  Maximize2,
  Code2,
  Lock,
  RotateCcw,
  User,
  Shield,
  Store,
} from 'lucide-react';
import { AppColors } from './utils/colors';
import { TabId, SubScreenId, UserAccount } from './types';
import { AnimatedIconTab } from './components/AnimatedIconTab';
import { AndroidEmulatorFrame } from './components/AndroidEmulatorFrame';
import { FlutterProjectViewer } from './components/FlutterProjectViewer';
import { PinPadAuth } from './components/PinPadAuth';
import { DashboardScreen } from './screens/DashboardScreen';
import { BillingScreen } from './screens/BillingScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { LoansScreen } from './screens/LoansScreen';
import { MoreScreen } from './screens/MoreScreen';
import { ExpensesScreen } from './screens/subscreens/ExpensesScreen';
import { PartnershipScreen } from './screens/subscreens/PartnershipScreen';
import { ReportsScreen } from './screens/subscreens/ReportsScreen';
import { SettingsScreen } from './screens/subscreens/SettingsScreen';
import { ActivityLogScreen } from './screens/subscreens/ActivityLogScreen';
import { AboutScreen } from './screens/subscreens/AboutScreen';
import { ApkBuildModal } from './components/ApkBuildModal';
import { localDb } from './utils/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
    localDb.getCurrentUser()
  );
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [activeSubscreen, setActiveSubscreen] = useState<SubScreenId>(null);
  const [viewMode, setViewMode] = useState<'frame' | 'mobile-full' | 'code'>('frame');
  const [showApkModal, setShowApkModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setActiveSubscreen(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localDb.setCurrentUser(null);
    setActiveSubscreen(null);
  };

  const handleAuthenticated = (user: UserAccount) => {
    setCurrentUser(user);
    localDb.setCurrentUser(user);
  };

  const handleResetApp = () => {
    localDb.resetAll();
    setRefreshKey((k) => k + 1);
    setCurrentUser(localDb.getCurrentUser());
    setActiveTab('dashboard');
    setActiveSubscreen(null);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#101315] text-[#22262B] overflow-hidden select-none font-sans">
      {/* Top AI Studio Developer Control Bar */}
      <header className="h-12 bg-[#171B1E] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-tight">
            Shop Manager Mobile
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 font-medium">
            <Store size={11} />
            <span>{localDb.getStoreName()}</span>
          </span>
          {currentUser && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-medium">
              <User size={11} />
              <span>{currentUser.name}</span>
              <span className="text-[9px] uppercase font-bold text-amber-300">
                ({currentUser.role})
              </span>
            </span>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0F1214] p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('frame')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'frame'
                ? 'bg-[#1B4B43] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone size={13} />
            <span className="hidden sm:inline">Android Emulator</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('mobile-full')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'mobile-full'
                ? 'bg-[#1B4B43] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline">Full Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'code'
                ? 'bg-amber-500 text-[#121517] font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 size={13} />
            <span className="hidden sm:inline">Flutter Code & Export</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowApkModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-transform cursor-pointer"
            title="Install app on mobile phone or build Android APK file"
          >
            <Smartphone size={13} className="text-slate-950" />
            <span>Install / Get APK</span>
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              title="Lock Screen / Switch User"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Lock size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={handleResetApp}
            title="Reset store to clean demo state"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {viewMode === 'code' ? (
        <FlutterProjectViewer />
      ) : (
        <AndroidEmulatorFrame
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onResetApp={handleResetApp}
          onOpenCode={() => setViewMode('code')}
        >
          {/* Mobile Screen Container */}
          <div
            key={refreshKey}
            className="flex-1 flex flex-col overflow-hidden bg-[#F6F5F1] relative"
          >
            {/* If NOT logged in, show PIN Pad Auth */}
            {!currentUser ? (
              <PinPadAuth onAuthenticated={handleAuthenticated} />
            ) : (
              <>
                {/* Screen Router */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                  {/* Main Tabs */}
                  {activeTab === 'dashboard' && (
                    <DashboardScreen
                      onNavigateTab={handleTabChange}
                      onOpenNewBill={() => handleTabChange('billing')}
                      userRole={currentUser.role}
                      currentUserName={currentUser.name}
                    />
                  )}
                  {activeTab === 'billing' && (
                    <BillingScreen
                      userRole={currentUser.role}
                      currentUserName={currentUser.name}
                    />
                  )}
                  {activeTab === 'inventory' && (
                    <InventoryScreen userRole={currentUser.role} />
                  )}
                  {activeTab === 'loans' && (
                    <LoansScreen
                      userRole={currentUser.role}
                      currentUserName={currentUser.name}
                    />
                  )}
                  {activeTab === 'more' && (
                    <MoreScreen
                      onOpenSubscreen={(id) => setActiveSubscreen(id)}
                      userRole={currentUser.role}
                    />
                  )}

                  {/* iOS-Style Slide/Fade Subscreen Overlay (CupertinoPageRoute animation) */}
                  <AnimatePresence>
                    {activeSubscreen && (
                      <motion.div
                        initial={{ x: '100%', opacity: 0.95 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.95 }}
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 34,
                        }}
                        className="absolute inset-0 z-40 bg-[#F6F5F1] flex flex-col shadow-2xl"
                      >
                        {activeSubscreen === 'expenses' && (
                          <ExpensesScreen
                            onBack={() => setActiveSubscreen(null)}
                            userRole={currentUser.role}
                            currentUserName={currentUser.name}
                          />
                        )}
                        {activeSubscreen === 'partnership' && (
                          <PartnershipScreen
                            onBack={() => setActiveSubscreen(null)}
                            userRole={currentUser.role}
                          />
                        )}
                        {activeSubscreen === 'reports' && (
                          <ReportsScreen onBack={() => setActiveSubscreen(null)} />
                        )}
                        {activeSubscreen === 'settings' && (
                          <SettingsScreen
                            onBack={() => setActiveSubscreen(null)}
                            onLogout={handleLogout}
                            onOpenSubscreen={(id) => setActiveSubscreen(id)}
                            currentUser={currentUser}
                          />
                        )}
                        {activeSubscreen === 'activity-log' && (
                          <ActivityLogScreen onBack={() => setActiveSubscreen(null)} />
                        )}
                        {activeSubscreen === 'about' && (
                          <AboutScreen onBack={() => setActiveSubscreen(null)} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Tab Bar with Reusable AnimatedIconTab */}
                <nav
                  style={{
                    backgroundColor: AppColors.surface,
                    borderColor: AppColors.border,
                  }}
                  className="h-[60px] border-t flex items-center justify-around px-1 shrink-0 z-30 shadow-xs"
                >
                  {/* Tab 1: Dashboard */}
                  <AnimatedIconTab
                    tabKey="dashboard"
                    label="Dashboard"
                    isSelected={activeTab === 'dashboard'}
                    onTap={() => handleTabChange('dashboard')}
                    outlineIcon={
                      <LayoutGrid
                        size={22}
                        strokeWidth={1.8}
                        className="transition-transform"
                      />
                    }
                    filledIcon={
                      <LayoutGrid
                        size={22}
                        strokeWidth={2.4}
                        fill="currentColor"
                        className="transition-transform"
                      />
                    }
                  />

                  {/* Tab 2: Billing */}
                  <AnimatedIconTab
                    tabKey="billing"
                    label="Billing"
                    isSelected={activeTab === 'billing'}
                    onTap={() => handleTabChange('billing')}
                    outlineIcon={
                      <FileText
                        size={22}
                        strokeWidth={1.8}
                        className="transition-transform"
                      />
                    }
                    filledIcon={
                      <FileText
                        size={22}
                        strokeWidth={2.4}
                        fill="currentColor"
                        className="transition-transform"
                      />
                    }
                  />

                  {/* Tab 3: Inventory */}
                  <AnimatedIconTab
                    tabKey="inventory"
                    label="Inventory"
                    isSelected={activeTab === 'inventory'}
                    onTap={() => handleTabChange('inventory')}
                    outlineIcon={
                      <Package
                        size={22}
                        strokeWidth={1.8}
                        className="transition-transform"
                      />
                    }
                    filledIcon={
                      <Package
                        size={22}
                        strokeWidth={2.4}
                        fill="currentColor"
                        className="transition-transform"
                      />
                    }
                  />

                  {/* Tab 4: Loans */}
                  <AnimatedIconTab
                    tabKey="loans"
                    label="Loans"
                    isSelected={activeTab === 'loans'}
                    onTap={() => handleTabChange('loans')}
                    outlineIcon={
                      <HandCoins
                        size={22}
                        strokeWidth={1.8}
                        className="transition-transform"
                      />
                    }
                    filledIcon={
                      <HandCoins
                        size={22}
                        strokeWidth={2.4}
                        fill="currentColor"
                        className="transition-transform"
                      />
                    }
                  />

                  {/* Tab 5: More */}
                  <AnimatedIconTab
                    tabKey="more"
                    label="More"
                    isSelected={activeTab === 'more'}
                    onTap={() => handleTabChange('more')}
                    outlineIcon={
                      <MoreHorizontal
                        size={22}
                        strokeWidth={1.8}
                        className="transition-transform"
                      />
                    }
                    filledIcon={
                      <MoreHorizontal
                        size={22}
                        strokeWidth={2.4}
                        fill="currentColor"
                        className="transition-transform"
                      />
                    }
                  />
                </nav>
              </>
            )}
          </div>
        </AndroidEmulatorFrame>
      )}

      {/* APK Distribution & Installation Center Modal */}
      <ApkBuildModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        onOpenCodeViewer={() => setViewMode('code')}
      />
    </div>
  );
}
