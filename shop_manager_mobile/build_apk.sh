#!/usr/bin/env bash
set -e

echo "============================================="
echo " Building Shop Manager Mobile APK for Android"
echo "============================================="

# 1. Fetch dependencies
echo "[1/4] Fetching flutter dependencies..."
flutter pub get

# 2. Run Drift code generator
echo "[2/4] Generating Drift SQLite tables..."
dart run build_runner build --delete-conflicting-outputs

# 3. Build release APK
echo "[3/4] Compiling release APK..."
flutter build apk --release

# 4. Success summary
echo "[4/4] Build Completed Successfully!"
echo "APK location: build/app/outputs/flutter-apk/app-release.apk"
echo "You can now transfer app-release.apk to your Android phone and install it."
