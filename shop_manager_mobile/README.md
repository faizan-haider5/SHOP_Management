# Shop Manager Mobile (Flutter Android)

Fully offline counter shop management application for Android built with Flutter, Drift (SQLite), and Riverpod.

## Architecture

- **Database**: 100% offline Drift SQLite database (`lib/services/database/app_database.dart`), single source of truth, zero remote network calls.
- **State Management**: Riverpod (`ProviderScope`) consistently applied across all features.
- **Printing & PDF**: Local 80mm thermal receipt generator (`InvoicePdfService`) and ESC/POS Bluetooth thermal printing (`EscPosPrinterService`).
- **Currency & Localisation**: Pakistani Rupees (PKR / Rs.) formatted with tabular/monospaced figures across all counter lists, bill receipts, WhatsApp shares, and PDF outputs.
- **Admin Store Governance**: The store name is chosen and modified by the Administrator only; partners have read-only access. Stored securely in the local Drift SQLite database.
- **Design System**:
  - Color Tokens: Deep teal `#1B4B43`, Warm mustard `#E3A008`, Background `#F6F5F1`, Surface `#FFFFFF`, Text Charcoal `#22262B`, Borders `#E3E0D8`.
  - Typography: Inter with tabular figures (`tnum`) for all currency (Rs.) and quantity amounts.
  - Squircles: Superellipse continuous curvature (60% corner smoothing) via `SquircleBorder`.
  - AnimatedIconTab: Spring scale bounce (`1.15x -> 1.0x` easeOutBack, 250ms) switching outline <-> solid icons.

## Running on an Android Emulator or Device

```bash
cd shop_manager_mobile

# 1. Fetch dependencies
flutter pub get

# 2. Run Drift code generator for SQLite tables
dart run build_runner build --delete-conflicting-outputs

# 3. Launch on Android Emulator or connected USB phone
flutter run -d android
```
