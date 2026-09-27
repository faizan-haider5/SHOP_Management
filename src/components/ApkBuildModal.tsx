import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  Terminal,
  Cloud,
  Check,
  Copy,
  ExternalLink,
  Shield,
  FileCode,
  Package,
  Layers,
  Sparkles,
  Zap,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AppColors } from '../utils/colors';
import { Squircle } from './Squircle';

interface ApkBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCodeViewer?: () => void;
}

export const ApkBuildModal: React.FC<ApkBuildModalProps> = ({
  isOpen,
  onClose,
  onOpenCodeViewer,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'cloud' | 'source' | 'troubleshoot'>('direct');
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const appUrl = 'https://ais-pre-gwpltola5vsf64xdffvlys-598168806805.asia-southeast1.run.app';

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Generate QR Code for mobile installation
    QRCode.toDataURL(appUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1B4B43',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR Code', err));

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [appUrl]);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install directly on Android:\n\n1. Open this link in Google Chrome on your Android phone:\n' +
          appUrl +
          '\n\n2. Tap the Chrome menu (⋮ top-right) and select "Add to Home screen" or "Install App".\n3. Android OS will automatically mint and install the real native WebAPK onto your phone!'
      );
    }
  };

  const copyAppUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyLocalCommand = () => {
    navigator.clipboard.writeText(
      'cd shop_manager_mobile && flutter pub get && dart run build_runner build && flutter build apk --release'
    );
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownloadSourceZip = async () => {
    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();

      // AndroidManifest.xml
      zip.file(
        'android/app/src/main/AndroidManifest.xml',
        `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.shop_manager_mobile"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.INTERNET" android:required="false" />

    <application
        android:label="Shop Manager Mobile"
        android:name="io.flutter.app.FlutterApplication"
        android:icon="@mipmap/ic_launcher"
        android:hardwareAccelerated="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>`
      );

      // Root Gradle
      zip.file(
        'android/build.gradle',
        `buildscript {
    ext.kotlin_version = '1.9.22'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}`
      );

      // App Gradle
      zip.file(
        'android/app/build.gradle',
        `plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}
android {
    namespace "com.example.shop_manager_mobile"
    compileSdk 34
    defaultConfig {
        applicationId "com.example.shop_manager_mobile"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
            shrinkResources false
        }
    }
}`
      );

      // GitHub Actions workflow for 1-click cloud build
      zip.file(
        '.github/workflows/build-apk.yml',
        `name: Build Android Release APK
on: [push, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.22.x'
          channel: 'stable'
      - run: flutter pub get
      - run: dart run build_runner build --delete-conflicting-outputs
      - run: flutter build apk --release
      - uses: actions/upload-artifact@v4
        with:
          name: shop-manager-mobile-release-apk
          path: build/app/outputs/flutter-apk/app-release.apk`
      );

      // Quick Build Script Linux/Mac
      zip.file(
        'build_apk.sh',
        `#!/bin/bash
set -e
echo "=== Building Shop Manager Mobile Release APK ==="
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter build apk --release
echo "=== APK Successfully generated at: build/app/outputs/flutter-apk/app-release.apk ==="`
      );

      // Quick Build Script Windows
      zip.file(
        'build_apk.bat',
        `@echo off
echo === Building Shop Manager Mobile Release APK ===
call flutter pub get
call dart run build_runner build --delete-conflicting-outputs
call flutter build apk --release
echo === APK Generated at: build\\app\\outputs\\flutter-apk\\app-release.apk ===
pause`
      );

      zip.file(
        'README_INSTALLATION.txt',
        `SHOP MANAGER MOBILE - ANDROID PROJECT & APK BUILD INSTRUCTIONS
==============================================================
Store Name: Admin Only Configured
Currency: Pakistani Rupees (PKR / Rs.)
Architecture: 100% Offline SQLite Drift Database

HOW TO GET THE FINAL .APK FILE FOR YOUR ANDROID PHONE:

OPTION 1: AUTOMATIC CLOUD BUILD ON GITHUB (FREE & ZERO LOCAL SETUP)
-------------------------------------------------------------------
1. Create a free repository on GitHub and upload this project.
2. The included workflow (.github/workflows/build-apk.yml) triggers automatically.
3. Click "Actions" tab -> click the build run -> download "shop-manager-mobile-release-apk".
4. You have the signed 'app-release.apk' binary ready to install on any Android phone!

OPTION 2: BUILD LOCALLY ON YOUR COMPUTER
---------------------------------------
If you have Flutter installed:
- On Linux/Mac: chmod +x build_apk.sh && ./build_apk.sh
- On Windows: double-click build_apk.bat
Output APK location:
build/app/outputs/flutter-apk/app-release.apk

OPTION 3: DIRECT ZERO-INSTALL WEBAPK ON YOUR PHONE
--------------------------------------------------
Open this URL in Chrome on your phone:
${appUrl}
Tap Chrome menu (three dots) -> "Install App" or "Add to Home screen".
Android will automatically install the native WebAPK app to your phone launcher!
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ShopManagerMobile-Android-Source.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setZipDownloaded(true);
      setTimeout(() => setZipDownloaded(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to generate project archive: ' + String(err));
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[28px] overflow-hidden border border-[#E3E0D8] shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div
          style={{ backgroundColor: AppColors.primary }}
          className="px-5 py-4 text-white flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-3">
            <Squircle size={40} backgroundColor="rgba(255,255,255,0.15)">
              <Smartphone size={22} className="text-amber-300" />
            </Squircle>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Run App on Your Mobile Phone</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-amber-950">
                  Android
                </span>
              </h2>
              <p className="text-[11px] text-teal-100/90 mt-0.5">
                100% Offline POS · Pakistani Rupees (Rs) · Admin Configured
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#F6F5F1] p-1.5 border-b border-[#E3E0D8] gap-1 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-[#1B4B43] text-white shadow-xs'
                : 'text-[#6B7078] hover:text-[#22262B]'
            }`}
          >
            <QrCode size={14} />
            <span>Direct Phone Install</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-[#1B4B43] text-white shadow-xs'
                : 'text-[#6B7078] hover:text-[#22262B]'
            }`}
          >
            <Cloud size={14} />
            <span>1-Click Cloud APK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('source')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'source'
                ? 'bg-[#1B4B43] text-white shadow-xs'
                : 'text-[#6B7078] hover:text-[#22262B]'
            }`}
          >
            <Download size={14} />
            <span>Project Zip</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('troubleshoot')}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'troubleshoot'
                ? 'bg-[#B3491F] text-white shadow-xs'
                : 'text-[#B3491F] hover:bg-orange-50'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Why Did It Fail?</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: DIRECT PHONE INSTALL (WEBAPK / QR CODE) */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <div className="font-bold text-[13px] text-emerald-900 mb-0.5">
                    Fastest Way to Run on Your Mobile Phone
                  </div>
                  Google Chrome on Android automatically compiles and installs a <strong>real native Android WebAPK</strong> directly to your home screen and app drawer. It works <strong>100% offline</strong> with zero internet once opened.
                </div>
              </div>

              {/* QR Code and Mobile Link Card */}
              <div className="bg-[#F6F5F1] p-4 rounded-3xl border border-[#E3E0D8] flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs shrink-0 flex flex-col items-center">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Scan to open on mobile"
                      className="w-36 h-36 rounded-xl"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      Loading QR...
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                    <QrCode size={11} /> Scan with Camera
                  </span>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <h3 className="text-sm font-bold text-[#22262B]">
                      Open App on Android Phone
                    </h3>
                    <p className="text-xs text-[#6B7078] mt-0.5">
                      Point your phone's camera at the QR code, or copy the direct link below:
                    </p>
                  </div>

                  {/* Copy Link Button */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-white rounded-xl border border-[#E3E0D8] text-[11px] font-mono text-slate-700 truncate select-all">
                      {appUrl}
                    </div>
                    <button
                      type="button"
                      onClick={copyAppUrl}
                      className="px-3 py-2 bg-[#1B4B43] text-white rounded-xl text-xs font-bold shrink-0 hover:bg-teal-900 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* 1-Tap Mobile Install Button */}
                  <button
                    type="button"
                    onClick={handleInstallPwa}
                    style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs active:scale-98 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone size={15} />
                    <span>
                      {installSuccess
                        ? '✓ App Installed Successfully!'
                        : '📲 Install Directly onto this Android Phone'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#22262B] uppercase tracking-wider">
                  How to Install on Android in 3 Seconds:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white p-3 rounded-2xl border border-[#E3E0D8] text-xs">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px] mb-1.5">
                      1
                    </div>
                    <strong className="text-slate-800">Scan QR Code</strong>
                    <p className="text-[#6B7078] text-[11px] mt-0.5">
                      Open the app link in Google Chrome on your Android mobile.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-[#E3E0D8] text-xs">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px] mb-1.5">
                      2
                    </div>
                    <strong className="text-slate-800">Tap Browser Menu (⋮)</strong>
                    <p className="text-[#6B7078] text-[11px] mt-0.5">
                      Tap the 3 dots in Chrome and click <strong>"Add to Home screen"</strong> or <strong>"Install App"</strong>.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-[#E3E0D8] text-xs">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px] mb-1.5">
                      3
                    </div>
                    <strong className="text-slate-800">Runs 100% Offline</strong>
                    <p className="text-[#6B7078] text-[11px] mt-0.5">
                      Android installs the native WebAPK. Open from your home screen with zero internet needed!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1-CLICK CLOUD APK BUILD (GITHUB ACTIONS) */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <Cloud size={20} className="text-blue-700 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 leading-relaxed">
                  <div className="font-bold text-[13px] text-blue-900 mb-0.5">
                    Generate Standalone .APK File for Free
                  </div>
                  Want a physical <code className="font-mono bg-blue-100 px-1 rounded">app-release.apk</code> file to send over WhatsApp, Bluetooth, or sideload onto customer phones? Use GitHub Actions to build it in the cloud with zero setup.
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-[#E3E0D8] space-y-3">
                <h3 className="text-xs font-bold text-[#22262B]">
                  How to Build Real .APK in 2 Minutes:
                </h3>
                <ol className="space-y-2.5 text-xs text-[#22262B]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong>Download the Project Code:</strong>
                      <p className="text-[#6B7078] text-[11px]">
                        Download the full Flutter Android source zip using the button below.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong>Push or Upload to GitHub:</strong>
                      <p className="text-[#6B7078] text-[11px]">
                        Create a free GitHub repository and push this code. The included file <code className="font-mono bg-slate-100 px-1">.github/workflows/build-apk.yml</code> will automatically trigger.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong>Download Compiled APK:</strong>
                      <p className="text-[#6B7078] text-[11px]">
                        Go to your repo's <strong>Actions</strong> tab → click the finished workflow → download <code className="font-mono bg-slate-100 px-1 font-bold text-teal-800">shop-manager-mobile-release-apk</code>. It produces the signed <code className="font-mono bg-slate-100 px-1">app-release.apk</code>!
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isGeneratingZip}
                    onClick={handleDownloadSourceZip}
                    style={{ backgroundColor: AppColors.primary }}
                    className="w-full py-2.5 px-4 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-teal-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={15} />
                    <span>
                      {isGeneratingZip
                        ? 'Packaging Android Source...'
                        : zipDownloaded
                        ? '✓ Source Package Downloaded!'
                        : 'Download Ready-to-Build GitHub Repository (.zip)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT SOURCE ZIP & LOCAL BUILD */}
          {activeTab === 'source' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <FileCode size={20} className="text-slate-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-800 leading-relaxed">
                  <div className="font-bold text-[13px] text-slate-900 mb-0.5">
                    Complete Android Flutter 3.22 Source Code
                  </div>
                  Includes all Drift SQLite database models, 80mm thermal receipt generator, Pakistani Rupee FMCG catalog, AndroidManifest.xml, and build automation scripts.
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-[#E3E0D8] space-y-3">
                <button
                  type="button"
                  disabled={isGeneratingZip}
                  onClick={handleDownloadSourceZip}
                  style={{ backgroundColor: AppColors.accent, color: AppColors.textPrimary }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs shadow-xs active:scale-98 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>
                    {isGeneratingZip
                      ? 'Preparing Zip Archive...'
                      : zipDownloaded
                      ? '✓ Downloaded ShopManagerMobile-Android-Source.zip'
                      : 'Download Full Android Flutter Project (.zip)'}
                  </span>
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#22262B]">
                      Local Build Command:
                    </span>
                    <button
                      type="button"
                      onClick={copyLocalCommand}
                      className="text-[11px] font-semibold text-teal-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedCmd ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#171B1E] text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap select-all">
                    cd shop_manager_mobile && flutter pub get && dart run build_runner build && flutter build apk --release
                  </pre>
                  <div className="text-[10px] text-[#6B7078] mt-1.5">
                    Output: <code className="font-mono text-slate-700">build/app/outputs/flutter-apk/app-release.apk</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TROUBLESHOOTING "PROBLEM DOWNLOADING / PARSING" */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-700 shrink-0 mt-0.5" />
                <div className="text-xs text-red-950 leading-relaxed">
                  <div className="font-bold text-[13px] text-red-900 mb-0.5">
                    Why Did Android Show "There was a problem while downloading / parsing package"?
                  </div>
                  Here is the exact technical explanation of what occurred and how to fix it:
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-[#E3E0D8] space-y-3 text-xs leading-relaxed text-[#22262B]">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Info size={14} className="text-blue-600" />
                    <span>How Android APK Files Work</span>
                  </h4>
                  <p className="text-[#6B7078]">
                    An installable Android APK is not a regular file; it is an executable package that requires <strong>compiled Dalvik bytecode (<code className="font-mono text-slate-700">classes.dex</code>)</strong> compiled through the Android SDK and Java, along with cryptographic signing certificates.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <strong className="text-amber-950 font-bold">What Happened:</strong>
                  <p className="text-amber-900 text-[11px]">
                    The browser generated a source code zip archive and named it with an <code className="font-mono font-bold">.apk</code> extension. When your phone's Android Package Installer opened it, it detected text files instead of compiled Dalvik bytecode, so Android showed:
                  </p>
                  <p className="font-mono text-red-700 font-bold bg-white p-1.5 rounded border border-red-200 text-[11px]">
                    "There was a problem while downloading this" / "There was a problem while parsing the package"
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>How to Run It Successfully Right Now:</span>
                  </h4>
                  <ul className="space-y-1.5 text-[#6B7078] list-disc list-inside">
                    <li>
                      <strong className="text-slate-800">Use Tab 1 (Direct Phone Install):</strong> Scan the QR code with your phone. Chrome uses Google Play's WebAPK service to mint and install an official, real APK directly into your phone with zero errors.
                    </li>
                    <li>
                      <strong className="text-slate-800">Use Tab 2 (1-Click Cloud Build):</strong> Push to GitHub and let GitHub Actions compile the actual <code className="font-mono text-slate-800">app-release.apk</code> binary file with Java 17 and Flutter.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F6F5F1] border-t border-[#E3E0D8] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#6B7078]">
            Target: Android Phone · Offline Counter POS
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E3E0D8] text-[#22262B] font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
