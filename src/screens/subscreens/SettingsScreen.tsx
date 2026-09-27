import React, { useState } from 'react';
import {
  ChevronLeft,
  Download,
  Upload,
  AlertCircle,
  Shield,
  Fingerprint,
  UserCheck,
  UserX,
  Plus,
  LogOut,
  Info,
  Clock,
  Printer,
  Database,
  Store,
  Bluetooth,
  RefreshCw,
  FileText,
  ChevronRight,
  Lock,
  Smartphone,
} from 'lucide-react';
import { AppColors } from '../../utils/colors';
import { Squircle } from '../../components/Squircle';
import { ApkBuildModal } from '../../components/ApkBuildModal';
import { localDb } from '../../utils/storage';
import { SubScreenId, UserAccount, UserRole } from '../../types';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onOpenSubscreen: (id: SubScreenId) => void;
  currentUser: UserAccount;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onLogout,
  onOpenSubscreen,
  currentUser,
}) => {
  const [storeName, setStoreName] = useState(() => localDb.getStoreName());
  const [storeNameSaved, setStoreNameSaved] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(() =>
    localDb.getBiometricEnabled()
  );
  const [users, setUsers] = useState<UserAccount[]>(() => localDb.getUsers());
  const [lastBackup, setLastBackup] = useState<string | null>(() =>
    localDb.getLastBackupDate()
  );
  const [showApkModal, setShowApkModal] = useState(false);

  // New Partner Modal
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerPin, setPartnerPin] = useState('');

  const isAdmin = currentUser.role === 'admin';

  const handleSaveStoreName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const success = localDb.setStoreName(storeName, currentUser.role, currentUser.name);
    if (success) {
      setStoreNameSaved(true);
      setTimeout(() => setStoreNameSaved(false), 2500);
    }
  };

  // Check 7+ days backup reminder (Patch 8)
  const isBackupOverdue = () => {
    if (!lastBackup) return true;
    const diffDays =
      (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  };

  const handleBiometricToggle = () => {
    const nextVal = !biometricEnabled;
    setBiometricEnabled(nextVal);
    localDb.setBiometricEnabled(nextVal);
    localDb.logActivity(
      'UPDATE',
      'AUTH',
      `Toggled Biometric authentication: ${nextVal ? 'ENABLED' : 'DISABLED'}`,
      currentUser.name
    );
  };

  const handleBackupNow = () => {
    const jsonStr = localDb.exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shop_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const nowIso = new Date().toISOString();
    localDb.setLastBackupDate(nowIso);
    setLastBackup(nowIso);
    localDb.logActivity('BACKUP', 'SYSTEM', 'Full offline database backup exported', currentUser.name);
    alert('Database backup file exported successfully! Save this file safely.');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !confirm(
        'WARNING: Restoring a backup will OVERWRITE all current store data (bills, inventory, loans). Proceed?'
      )
    ) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = localDb.restoreFullDatabase(content);
      if (success) {
        alert('Database restored successfully! Reloading application...');
        window.location.reload();
      } else {
        alert('Failed to restore database: Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleTogglePartner = (userId: string) => {
    if (!isAdmin) return;
    const updated = users.map((u) => {
      if (u.id === userId && u.role === 'partner') {
        const nextActive = !u.isActive;
        localDb.logActivity(
          'UPDATE',
          'AUTH',
          `${nextActive ? 'Activated' : 'Deactivated'} partner ${u.name}`,
          currentUser.name
        );
        return { ...u, isActive: nextActive };
      }
      return u;
    });
    setUsers(updated);
    localDb.saveUsers(updated);
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !partnerName.trim() || partnerPin.length !== 4) return;

    const newPartner: UserAccount = {
      id: `partner-${Date.now()}`,
      name: partnerName.trim(),
      pin: partnerPin,
      role: 'partner',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newPartner];
    setUsers(updated);
    localDb.saveUsers(updated);
    localDb.logActivity('CREATE', 'AUTH', `Added new partner account ${newPartner.name}`, currentUser.name);
    setShowAddPartnerModal(false);
    setPartnerName('');
    setPartnerPin('');
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
            Settings & System
          </h1>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-red-500/30 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          <span>Lock App</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Store Profile Card - Store Name Chosen by Admin Only */}
        <div className="bg-white p-4 rounded-3xl border border-[#E3E0D8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#22262B] flex items-center gap-1.5">
              <Store size={16} className="text-teal-700" />
              <span>Store Profile</span>
            </span>
            {isAdmin ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Admin Configurable
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1">
                <Lock size={10} />
                <span>Admin Only</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveStoreName} className="space-y-2.5">
            <div>
              <label className="text-[11px] font-semibold text-[#6B7078] block mb-1">
                Store Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Store Name..."
                  className={`flex-1 px-3 py-2 text-xs border rounded-xl font-semibold transition-colors ${
                    isAdmin
                      ? 'border-[#E3E0D8] bg-[#F6F5F1] text-[#22262B] focus:outline-none focus:border-teal-700'
                      : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                  }`}
                />
                {isAdmin && (
                  <button
                    type="submit"
                    style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                    className="px-3 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-transform cursor-pointer"
                  >
                    {storeNameSaved ? 'Saved!' : 'Save'}
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[#6B7078] mt-1">
                {isAdmin
                  ? 'Store name chosen by Admin only. Appears across Dashboard, 80mm receipts, and WhatsApp bills.'
                  : 'Store name is chosen and modified by the Admin only (Read-only for Partners).'}
              </p>
            </div>

            {/* Currency Banner */}
            <div className="p-2.5 rounded-xl bg-[#E2EFEA] border border-teal-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-[#1B4B43]">Official Store Currency</div>
                <div className="text-[10px] text-teal-800">Pakistani Rupee (PKR - Rs)</div>
              </div>
              <span className="text-xs font-bold font-tabular px-2.5 py-1 bg-white text-[#1B4B43] rounded-lg shadow-2xs border border-teal-300">
                Rs. (PKR)
              </span>
            </div>
          </form>
        </div>

        {/* Android APK & Mobile Installation Card */}
        <div className="bg-white p-4 rounded-3xl border border-[#E3E0D8] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#22262B] flex items-center gap-1.5">
              <Smartphone size={16} className="text-teal-700" />
              <span>Android APK & Phone Installation</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              100% Offline
            </span>
          </div>

          <p className="text-[11px] text-[#6B7078] leading-relaxed">
            Install this offline counter POS directly onto your Android phone via WebAPK (no tools needed), or generate the binary <code className="font-mono text-slate-800 font-bold">app-release.apk</code> via 1-click GitHub Actions cloud build.
          </p>

          <button
            type="button"
            onClick={() => setShowApkModal(true)}
            style={{ backgroundColor: AppColors.primary }}
            className="w-full py-2.5 px-4 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-transform flex items-center justify-center gap-2 cursor-pointer hover:bg-teal-900"
          >
            <Smartphone size={15} className="text-amber-300" />
            <span>Install on Phone / Build APK</span>
          </button>
        </div>

        {/* Soft Reminder Banner if no backup in 7+ days (Patch 8) */}
        {isBackupOverdue() && isAdmin && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-800 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold text-amber-900">
                Backup Reminder: Over 7 days since last backup
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Because this app is 100% offline with no cloud copy, export a local backup now to protect your store data.
              </div>
            </div>
          </div>
        )}

        {/* Prominent Backup & Restore Card (Patch 8 - Admin Only) */}
        {isAdmin && (
          <div className="bg-white p-4 rounded-3xl border border-[#E3E0D8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#22262B] flex items-center gap-1.5">
                <Database size={16} className="text-teal-700" />
                <span>Offline Database Backup & Restore</span>
              </span>
              <span className="text-[10px] text-[#6B7078] font-tabular">
                Last: {lastBackup ? new Date(lastBackup).toLocaleDateString() : 'Never'}
              </span>
            </div>

            {/* Prominent Backup Now Button (Patch 8) */}
            <button
              type="button"
              onClick={handleBackupNow}
              style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
              className="w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-md active:scale-98 transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              <span>Backup Database Now (.json export)</span>
            </button>

            {/* Restore Button */}
            <div className="pt-1">
              <label className="w-full py-2.5 px-4 border border-[#E3E0D8] bg-[#F6F5F1] hover:bg-slate-100 rounded-2xl font-semibold text-xs text-[#22262B] flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload size={14} />
                <span>Restore Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Security & Authentication (Patch 1) */}
        <div className="bg-white p-4 rounded-3xl border border-[#E3E0D8] shadow-2xs space-y-3">
          <div className="text-xs font-bold text-[#22262B] flex items-center gap-1.5">
            <Shield size={16} className="text-teal-700" />
            <span>Security & Roles</span>
          </div>

          {/* Current User Role Notice */}
          <div className="p-2.5 rounded-xl bg-[#F6F5F1] border border-[#E3E0D8] flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-[#22262B]">{currentUser.name}</div>
              <div className="text-[10px] text-[#6B7078]">Current Active Account</div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-300">
              {currentUser.role}
            </span>
          </div>

          {/* Biometric Toggle (Patch 1) */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Fingerprint size={18} className="text-[#1B4B43]" />
              <div>
                <div className="text-xs font-semibold text-[#22262B]">
                  Biometric Unlock
                </div>
                <div className="text-[10px] text-[#6B7078]">
                  Fingerprint / Face ID overlay on PIN
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBiometricToggle}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                biometricEnabled ? 'bg-[#1B4B43] justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
            </button>
          </div>

          {/* Manage Partner Accounts (Admin Only) */}
          {isAdmin && (
            <div className="pt-2 border-t border-[#E3E0D8] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#6B7078]">
                <span>Partner Accounts (View-Only)</span>
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(true)}
                  className="text-teal-800 text-[11px] font-bold hover:underline"
                >
                  + Add Partner
                </button>
              </div>

              {users
                .filter((u) => u.role === 'partner')
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl border border-[#E3E0D8] bg-[#F6F5F1] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#22262B]">{p.name}</div>
                      <div className="text-[10px] text-[#6B7078]">
                        PIN: {p.pin} · {p.isActive ? 'Active' : 'Deactivated'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePartner(p.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer ${
                        p.isActive
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Links to Activity Log & About Screens (Patches 8 & 9) */}
        <div className="bg-white rounded-3xl border border-[#E3E0D8] shadow-2xs overflow-hidden divide-y divide-[#E3E0D8]">
          <button
            type="button"
            onClick={() => onOpenSubscreen('activity-log')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Squircle size={36} backgroundColor="#ECEFF8">
                <Clock size={18} className="text-indigo-600" />
              </Squircle>
              <div>
                <div className="text-xs font-bold text-[#22262B]">
                  Audit Activity Log
                </div>
                <div className="text-[10px] text-[#6B7078]">
                  Track all adds, edits, deletes, and timestamps
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => onOpenSubscreen('about')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Squircle size={36} backgroundColor="#E2EFEA">
                <Store size={18} style={{ color: AppColors.primary }} />
              </Squircle>
              <div>
                <div className="text-xs font-bold text-[#22262B]">
                  About & License
                </div>
                <div className="text-[10px] text-[#6B7078]">
                  Developer: Faizan Haider · Copyright © 2026
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        </div>

        {/* App Version Info */}
        <div className="text-center text-[10px] text-[#6B7078] py-2">
          Shop Manager Mobile v1.0.0 · 100% Offline Local SQLite Drift Engine
        </div>
      </div>

      {/* Add Partner Modal */}
      {showAddPartnerModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-[#22262B] mb-2">
              Add Partner Account
            </h3>
            <p className="text-[11px] text-[#6B7078] mb-3">
              Partners have read-only access to Dashboard, Reports, and Partnership.
            </p>

            <form onSubmit={handleAddPartner} className="space-y-3">
              <input
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Partner Full Name *"
                className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl"
              />
              <input
                type="password"
                maxLength={4}
                required
                value={partnerPin}
                onChange={(e) => setPartnerPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit PIN *"
                className="w-full px-3 py-2 text-xs border border-[#E3E0D8] rounded-xl font-tabular text-center tracking-widest text-base font-bold"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="flex-1 py-2 text-xs border border-[#E3E0D8] rounded-xl text-[#6B7078]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl"
                >
                  Create Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APK Distribution Modal */}
      <ApkBuildModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />
    </div>
  );
};
