@echo off
echo =============================================
echo  Building Shop Manager Mobile APK for Android
echo =============================================

echo [1/4] Fetching flutter dependencies...
call flutter pub get

echo [2/4] Generating Drift SQLite tables...
call dart run build_runner build --delete-conflicting-outputs

echo [3/4] Compiling release APK...
call flutter build apk --release

echo [4/4] Build Completed Successfully!
echo APK location: build\app\outputs\flutter-apk\app-release.apk
echo You can now transfer app-release.apk to your Android phone and install it.
pause
