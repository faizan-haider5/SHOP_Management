import React, { useState } from 'react';
import { Fingerprint, Delete, Shield, User, Lock, Sparkles, Check } from 'lucide-react';
import { AppColors } from '../utils/colors';
import { Squircle } from './Squircle';
import { UserAccount } from '../types';
import { localDb } from '../utils/storage';

interface PinPadAuthProps {
  onAuthenticated: (user: UserAccount) => void;
}

export const PinPadAuth: React.FC<PinPadAuthProps> = ({ onAuthenticated }) => {
  const users = localDb.getUsers().filter((u) => u.isActive);
  const isFirstRun = users.length === 0;

  // First-run setup state
  const [setupName, setSetupName] = useState('Sadaf Ali');
  const [setupStoreName, setSetupStoreName] = useState('Al-Madina General Store');
  const [setupPin, setSetupPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');
  const [setupError, setSetupError] = useState('');

  // Standard Login state
  const [selectedUser, setSelectedUser] = useState<UserAccount>(
    users[0] || {
      id: 'admin-1',
      name: 'Sadaf Ali',
      pin: '1234',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    }
  );
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const biometricEnabled = localDb.getBiometricEnabled();

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);
    setPinError('');

    if (nextPin.length === 4) {
      if (nextPin === selectedUser.pin) {
        localDb.logActivity('UPDATE', 'AUTH', `User ${selectedUser.name} logged in via PIN`, selectedUser.name);
        onAuthenticated(selectedUser);
      } else {
        setPinError('Incorrect PIN. Please try again.');
        setTimeout(() => setEnteredPin(''), 500);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError('');
  };

  const handleBiometricUnlock = () => {
    setBiometricSuccess(true);
    setTimeout(() => {
      localDb.logActivity('UPDATE', 'AUTH', `User ${selectedUser.name} logged in via Biometric`, selectedUser.name);
      onAuthenticated(selectedUser);
    }, 600);
  };

  const handleFirstRunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupName.trim()) {
      setSetupError('Please enter administrator name');
      return;
    }
    if (setupPin.length !== 4) {
      setSetupError('PIN must be exactly 4 digits');
      return;
    }
    if (setupPin !== setupConfirmPin) {
      setSetupError('PINs do not match');
      return;
    }

    const firstAdmin: UserAccount = {
      id: `user-admin-${Date.now()}`,
      name: setupName.trim(),
      pin: setupPin,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    localDb.saveUsers([firstAdmin]);
    localDb.setStoreName(setupStoreName.trim() || 'Al-Madina General Store', 'admin', firstAdmin.name);
    localDb.logActivity('CREATE', 'AUTH', `Initial Admin ${firstAdmin.name} created`, firstAdmin.name);
    onAuthenticated(firstAdmin);
  };

  // If first run, render the First-Run Setup Screen
  if (isFirstRun) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-[#F6F5F1] select-none">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E3E0D8] shadow-lg">
          <div className="flex justify-center mb-3">
            <Squircle size={56} backgroundColor={AppColors.sections.billing}>
              <Shield size={28} style={{ color: AppColors.primary }} />
            </Squircle>
          </div>

          <h2 className="text-xl font-bold text-center text-[#22262B]">
            First-Run Setup
          </h2>
          <p className="text-xs text-center text-[#6B7078] mt-1 mb-5">
            Create your primary shop Administrator account. All data stays offline.
          </p>

          <form onSubmit={handleFirstRunSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#22262B] block mb-1">
                Store Name (Chosen by Admin only)
              </label>
              <input
                type="text"
                required
                value={setupStoreName}
                onChange={(e) => setSetupStoreName(e.target.value)}
                placeholder="e.g. Al-Madina General Store"
                className="w-full px-3 py-2.5 text-sm border border-[#E3E0D8] rounded-xl font-medium focus:outline-none focus:border-teal-700"
              />
              <span className="text-[10px] text-[#6B7078] mt-0.5 block">
                The store name can only be chosen and updated by the Admin.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#22262B] block mb-1">
                Admin Full Name
              </label>
              <input
                type="text"
                required
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                placeholder="e.g. Sadaf Ali"
                className="w-full px-3 py-2.5 text-sm border border-[#E3E0D8] rounded-xl font-medium focus:outline-none focus:border-teal-700"
              />
              <span className="text-[10px] text-[#6B7078] mt-0.5 block">
                Pre-filled with default Admin name (editable).
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#22262B] block mb-1">
                4-Digit Security PIN
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={setupPin}
                onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4 digits"
                className="w-full px-3 py-2.5 text-sm border border-[#E3E0D8] rounded-xl font-tabular text-center tracking-widest text-lg font-bold focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#22262B] block mb-1">
                Confirm PIN
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={setupConfirmPin}
                onChange={(e) => setSetupConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm 4 digits"
                className="w-full px-3 py-2.5 text-sm border border-[#E3E0D8] rounded-xl font-tabular text-center tracking-widest text-lg font-bold focus:outline-none focus:border-teal-700"
              />
            </div>

            {setupError && (
              <div className="text-xs text-red-600 font-medium text-center">
                {setupError}
              </div>
            )}

            <button
              type="submit"
              style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
              className="w-full py-3 rounded-xl font-bold text-sm shadow-md active:scale-98 transition-transform cursor-pointer mt-2"
            >
              Initialize Admin & Open Store
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between items-center py-6 px-4 bg-[#F6F5F1] select-none">
      {/* Top Header & User Selector */}
      <div className="flex flex-col items-center text-center mt-2 w-full max-w-xs">
        <Squircle size={52} backgroundColor={AppColors.primary} className="shadow-md mb-2">
          <Lock size={22} className="text-white" />
        </Squircle>

        <h1 className="text-lg font-bold text-[#22262B]">
          Shop Manager Lock
        </h1>
        <p className="text-xs text-[#6B7078] mt-0.5">
          Enter 4-digit PIN to access counter POS
        </p>

        {/* User Account Switcher */}
        <div className="mt-3 flex items-center justify-center gap-1.5 p-1 bg-white border border-[#E3E0D8] rounded-2xl w-full">
          {users.map((u) => {
            const isSelected = selectedUser.id === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUser(u);
                  setEnteredPin('');
                  setPinError('');
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1B4B43] text-white shadow-xs'
                    : 'text-[#6B7078] hover:text-[#22262B]'
                }`}
              >
                <User size={12} />
                <span className="truncate">{u.name}</span>
                <span className={`text-[9px] uppercase px-1 py-0.2 rounded font-bold ${
                  u.role === 'admin'
                    ? isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-700'
                    : isSelected ? 'bg-purple-300 text-slate-900' : 'bg-slate-100 text-slate-700'
                }`}>
                  {u.role}
                </span>
              </button>
            );
          })}
        </div>

        {/* PIN Dots Indicator */}
        <div className="flex items-center gap-3 my-4">
          {[0, 1, 2, 3].map((idx) => {
            const filled = enteredPin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  filled
                    ? 'bg-[#1B4B43] scale-110 shadow-xs'
                    : 'border-2 border-[#E3E0D8] bg-white'
                }`}
              />
            );
          })}
        </div>

        {pinError ? (
          <div className="text-xs font-medium text-red-600 animate-shake">
            {pinError}
          </div>
        ) : (
          <div className="text-[11px] text-[#6B7078]">
            {selectedUser.role === 'admin'
              ? 'Default Admin PIN: 1234'
              : 'Default Partner PIN: 0000'}
          </div>
        )}
      </div>

      {/* Numeric Keypad with Thumb-Friendly Squircle Keys */}
      <div className="w-full max-w-[280px] grid grid-cols-3 gap-3 my-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            className="h-14 bg-white border border-[#E3E0D8] rounded-[22px] flex items-center justify-center text-xl font-bold font-tabular text-[#22262B] shadow-xs active:scale-95 hover:bg-slate-50 transition-all cursor-pointer select-none"
          >
            {digit}
          </button>
        ))}

        {/* Biometric Unlock or Blank */}
        <button
          type="button"
          onClick={handleBiometricUnlock}
          className="h-14 bg-white border border-[#E3E0D8] rounded-[22px] flex flex-col items-center justify-center text-[#1B4B43] shadow-xs active:scale-95 hover:bg-teal-50 transition-all cursor-pointer"
        >
          {biometricSuccess ? (
            <Check size={22} className="text-emerald-600" />
          ) : (
            <Fingerprint size={22} />
          )}
          <span className="text-[9px] font-semibold text-[#6B7078] mt-0.5">
            Biometric
          </span>
        </button>

        {/* Digit 0 */}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-14 bg-white border border-[#E3E0D8] rounded-[22px] flex items-center justify-center text-xl font-bold font-tabular text-[#22262B] shadow-xs active:scale-95 hover:bg-slate-50 transition-all cursor-pointer select-none"
        >
          0
        </button>

        {/* Backspace Delete */}
        <button
          type="button"
          onClick={handleDelete}
          className="h-14 bg-white border border-[#E3E0D8] rounded-[22px] flex items-center justify-center text-[#6B7078] shadow-xs active:scale-95 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <Delete size={20} />
        </button>
      </div>

      <div className="text-[11px] text-[#6B7078] text-center">
        Role: <span className="font-semibold uppercase text-[#22262B]">{selectedUser.role}</span>
        {selectedUser.role === 'partner' && ' (Read-only on reports & partnership)'}
      </div>
    </div>
  );
};
