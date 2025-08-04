@echo off
REM Language Dictation AI - Windows Setup Script
echo 🚀 Setting up Language Dictation AI for cross-platform development...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ npm found
npm --version

REM Install dependencies
echo 📦 Installing dependencies...

REM Install Electron dependencies
echo 🖥️  Installing Electron dependencies...
npm install electron@^27.0.0 electron-builder@^24.6.4 concurrently@^8.2.2 wait-on@^7.0.1 --save-dev

REM Install Capacitor dependencies
echo 📱 Installing Capacitor dependencies...
npm install @capacitor/core@^5.5.0 @capacitor/cli@^5.5.0 @capacitor/ios@^5.5.0 @capacitor/android@^5.5.0 --save-dev

echo ✅ Dependencies installed successfully!

REM Initialize Capacitor
echo 📱 Initializing Capacitor...
npx cap init "Language Dictation AI" "com.languagedictation.ai" --web-dir="."

echo.
echo 🎉 Setup complete! Here's what you can do next:
echo.
echo 📋 Development Commands:
echo   npm run dev                    - Start development server
echo   npm run electron:dev           - Run Electron app in development
echo.
echo 🏗️  Build Commands:
echo   npm run build                  - Build all platforms
echo   npm run build:electron         - Build Electron apps (all platforms)
echo   npm run build:electron:win     - Build Windows app
echo   npm run build:electron:mac     - Build macOS app (requires macOS)
echo   npm run build:electron:linux   - Build Linux app
echo.
echo 📱 Mobile Commands:
echo   npm run cap:add:ios            - Add iOS platform (requires Xcode)
echo   npm run cap:add:android        - Add Android platform (requires Android Studio)
echo   npm run cap:sync               - Sync web assets to mobile
echo   npm run cap:open:ios          - Open iOS project in Xcode
echo   npm run cap:open:android      - Open Android project in Android Studio
echo.
echo 🔧 Next Steps:
echo 1. Create app icons in the 'icons' directory
echo 2. Test the app: npm run dev
echo 3. Test Electron: npm run electron:dev
echo 4. Add mobile platforms: npm run cap:add:ios or npm run cap:add:android
echo.
pause
