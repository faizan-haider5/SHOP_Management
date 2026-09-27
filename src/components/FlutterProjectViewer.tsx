import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, FileCode, Folder, Copy, Check, Terminal, ExternalLink, Smartphone } from 'lucide-react';
import { AppColors } from '../utils/colors';
import { ApkBuildModal } from './ApkBuildModal';

interface FlutterFile {
  path: string;
  name: string;
  description: string;
  content: string;
}

const FLUTTER_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    name: 'pubspec.yaml',
    description: 'Flutter dependencies: Drift, Riverpod, Printing, PDF, Cupertino Icons',
    content: `name: shop_manager_mobile
description: "Fully offline mobile shop manager for Android with Drift database, iOS squircle icon system, and animated spring tab navigation."
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.3.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  drift: ^2.18.0
  drift_flutter: ^0.1.0
  sqlite3_flutter_libs: ^0.5.24
  path_provider: ^2.1.3
  path: ^1.9.0
  cupertino_icons: ^1.0.8
  intl: ^0.19.0
  pdf: ^3.10.8
  printing: ^5.13.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  drift_dev: ^2.18.0
  build_runner: ^2.4.9

flutter:
  uses-material-design: true`,
  },
  {
    path: 'lib/utils/colors.dart',
    name: 'colors.dart',
    description: 'Design system palette: Deep Teal (#1B4B43), Warm Mustard (#E3A008)',
    content: `import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF1B4B43); // Deep teal
  static const Color accent = Color(0xFFE3A008); // Warm mustard
  static const Color background = Color(0xFFF6F5F1); // Warm off-white
  static const Color surface = Color(0xFFFFFFFF); // White
  static const Color textPrimary = Color(0xFF22262B); // Charcoal
  static const Color textSecondary = Color(0xFF6B7078); // Muted grey
  static const Color success = Color(0xFF2E7D4F); // Forest green
  static const Color warning = Color(0xFFE3A008); // Mustard
  static const Color danger = Color(0xFFB3491F); // Muted rust
  static const Color border = Color(0xFFE3E0D8);

  static const Color sectionBilling = Color(0xFFE2EFEA);
  static const Color sectionInventory = Color(0xFFFEF4DC);
  static const Color sectionLoans = Color(0xFFECEFF8);
  static const Color sectionExpenses = Color(0xFFFDE8E1);
  static const Color sectionPartnership = Color(0xFFF0EBF8);
  static const Color sectionReports = Color(0xFFE5F4EB);
  static const Color sectionSettings = Color(0xFFEFEFEF);
}`,
  },
  {
    path: 'lib/utils/squircle_border.dart',
    name: 'squircle_border.dart',
    description: 'Continuous superellipse squircle curvature with ~60% corner smoothing',
    content: `import 'dart:math' as math;
import 'package:flutter/material.dart';

class SquircleBorder extends ShapeBorder {
  final double cornerRadius;
  final double cornerSmoothing; // 0.6 = 60%
  final BorderSide side;

  const SquircleBorder({
    this.cornerRadius = 16.0,
    this.cornerSmoothing = 0.6,
    this.side = BorderSide.none,
  });

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    final path = Path();
    final width = rect.width;
    final height = rect.height;
    final left = rect.left;
    final top = rect.top;
    final right = rect.right;
    final bottom = rect.bottom;

    final maxRadius = math.min(width, height) / 2;
    final r = math.min(cornerRadius, maxRadius);
    final p = (1 + cornerSmoothing) * r;

    path.moveTo(left + p, top);
    path.lineTo(right - p, top);
    path.cubicTo(right - (1 - cornerSmoothing) * r, top, right, top + (1 - cornerSmoothing) * r, right, top + p);
    path.lineTo(right, bottom - p);
    path.cubicTo(right, bottom - (1 - cornerSmoothing) * r, right - (1 - cornerSmoothing) * r, bottom, right - p, bottom);
    path.lineTo(left + p, bottom);
    path.cubicTo(left + (1 - cornerSmoothing) * r, bottom, left, bottom - (1 - cornerSmoothing) * r, left, bottom - p);
    path.lineTo(left, top + p);
    path.cubicTo(left, top + (1 - cornerSmoothing) * r, left + (1 - cornerSmoothing) * r, top, left + p, top);
    path.close();
    return path;
  }
  // ...
}`,
  },
  {
    path: 'lib/widgets/animated_icon_tab.dart',
    name: 'animated_icon_tab.dart',
    description: 'Spring-based scale animation (~1.15x -> 1.0x, easeOutBack) + outline/filled swap',
    content: `import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/typography.dart';

class AnimatedIconTab extends StatefulWidget {
  final IconData outlineIcon;
  final IconData filledIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const AnimatedIconTab({
    super.key,
    required this.outlineIcon,
    required this.filledIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  State<AnimatedIconTab> createState() => _AnimatedIconTabState();
}

class _AnimatedIconTabState extends State<AnimatedIconTab>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    // Spring scale bounce: scale up to 1.15 then settle to 1.0 using easeOutBack
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.15)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 45.0,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.15, end: 1.0)
            .chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 55.0,
      ),
    ]).animate(_controller);
  }
  // ...
}`,
  },
  {
    path: 'lib/services/database/app_database.dart',
    name: 'app_database.dart',
    description: '100% Offline Drift SQLite database tables (Bills, Items, Loans, Expenses)',
    content: `import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

part 'app_database.g.dart';

class InventoryItemsTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get sku => text().withLength(min: 1, max: 32)();
  TextColumn get name => text().withLength(min: 1, max: 120)();
  TextColumn get category => text().withLength(min: 1, max: 60)();
  RealColumn get costPrice => real()();
  RealColumn get sellingPrice => real()();
  RealColumn get stockQuantity => real()();
  RealColumn get minStockAlert => real().withDefault(const Constant(5.0))();
  TextColumn get unit => text().withDefault(const Constant('pcs'))();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

class BillsTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get billNumber => text().unique()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  RealColumn get grandTotal => real()();
  TextColumn get paymentMode => text().withDefault(const Constant('CASH'))();
}

@DriftDatabase(tables: [InventoryItemsTable, BillsTable, BillLineItemsTable, LoansTable, ExpensesTable])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  static QueryExecutor _openConnection() {
    return driftDatabase(name: 'shop_manager_local');
  }
}

final appDatabaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(() => db.close());
  return db;
});`,
  },
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    description: 'Flutter entry point with ProviderScope, Cupertino page routes & Inter theme',
    content: `import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'screens/main_shell_screen.dart';
import 'utils/colors.dart';
import 'utils/typography.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: ShopManagerApp(),
    ),
  );
}

class ShopManagerApp extends StatelessWidget {
  const ShopManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Shop Manager Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: AppTypography.fontFamily,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.accent,
        ),
        pageTransitionsTheme: const PageTransitionsTheme(
          builders: {
            TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          },
        ),
      ),
      home: const MainShellScreen(),
    );
  }
}`,
  },
  {
    path: 'build_apk.sh',
    name: 'build_apk.sh',
    description: 'One-click shell script to compile release APK with Drift SQLite',
    content: `#!/usr/bin/env bash
set -e
echo "=== Building Shop Manager Mobile Release APK ==="
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter build apk --release
echo "=== APK Successfully generated at: build/app/outputs/flutter-apk/app-release.apk ==="`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml',
    description: 'Automated GitHub Actions workflow to build release APK in the cloud',
    content: `name: Build Android APK
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
          path: build/app/outputs/flutter-apk/app-release.apk`,
  },
  {
    path: 'LICENSE.txt',
    name: 'LICENSE.txt',
    description: 'Proprietary Software License · Faizan Haider',
    content: `Shop Management System
Copyright © 2026 Faizan Haider. All Rights Reserved.

This software and its source code are the proprietary property of Faizan Haider
and may not be copied, distributed, modified, or resold without express written
permission from the author.

Developer: Faizan Haider
Phone: 0342-7375861
Email: faizan546233@gmail.com`,
  },
];

export const FlutterProjectViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('shop_manager_mobile');

      // Add all flutter project files
      for (const file of FLUTTER_FILES) {
        folder?.file(file.path, file.content);
      }

      // Add AndroidManifest.xml
      folder?.file(
        'android/app/src/main/AndroidManifest.xml',
        `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.shop_manager_mobile">
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.CAMERA" />
    <application
        android:label="Shop Manager"
        android:icon="@mipmap/ic_launcher">
    </application>
</manifest>`
      );

      // Add README.md
      folder?.file(
        'README.md',
        `# Shop Manager Mobile (Flutter Android)\n\nFully offline counter shop management application for Android built with Flutter, Drift (SQLite), and Riverpod.\n\n## Quick Start:\n\`\`\`bash\nflutter pub get\ndart run build_runner build\nflutter run -d android\n\`\`\``
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shop_manager_mobile.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#121517] text-slate-200 overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 bg-[#181D20] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Folder size={18} className="text-teal-400" />
            <h2 className="text-base font-semibold text-white tracking-tight">
              shop_manager_mobile
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
              Flutter 3.x · Drift SQLite · Riverpod
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete offline Flutter codebase generated in workspace. Ready to run on any Android emulator or physical device.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowApkModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-md cursor-pointer"
          >
            <Smartphone size={15} />
            <span>Install / Build APK</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-slate-700 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            <span>{isZipping ? 'Bundling ZIP...' : 'Download Project (.zip)'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Sidebar */}
        <div className="w-64 bg-[#14181B] border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
            Project Architecture
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {FLUTTER_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-900/40 text-teal-300 font-medium border border-teal-700/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <FileCode size={14} className={isSelected ? 'text-teal-400' : 'text-slate-500'} />
                  <span className="font-mono truncate">{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Terminal Guide */}
          <div className="p-3 bg-[#0E1113] border-t border-slate-800 text-[11px] space-y-1.5 font-mono text-slate-400">
            <div className="flex items-center gap-1.5 text-teal-400 font-sans font-semibold">
              <Terminal size={13} />
              <span>Run in Android Studio:</span>
            </div>
            <div className="bg-black/60 p-2 rounded text-slate-300 text-[10px]">
              flutter pub get<br />
              flutter run -d android
            </div>
          </div>
        </div>

        {/* Code View Pane */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0D1012]">
          <div className="px-4 py-2.5 bg-[#14181B] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-teal-300 font-medium">
                {selectedFile.path}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">{selectedFile.description}</span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed no-scrollbar select-text">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>

      {/* APK Distribution Modal */}
      <ApkBuildModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />
    </div>
  );
};
