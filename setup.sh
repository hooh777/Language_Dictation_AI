#!/bin/bash

# Language Dictation AI - Setup Script
echo "🚀 Setting up Language Dictation AI for cross-platform development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."

# Install Electron dependencies
echo "🖥️  Installing Electron dependencies..."
npm install electron@^27.0.0 electron-builder@^24.6.4 concurrently@^8.2.2 wait-on@^7.0.1 --save-dev

# Install Capacitor dependencies
echo "📱 Installing Capacitor dependencies..."
npm install @capacitor/core@^5.5.0 @capacitor/cli@^5.5.0 @capacitor/ios@^5.5.0 @capacitor/android@^5.5.0 --save-dev

echo "✅ Dependencies installed successfully!"

# Initialize Capacitor
echo "📱 Initializing Capacitor..."
npx cap init "Language Dictation AI" "com.languagedictation.ai" --web-dir="."

# Add platforms (optional - can be done later)
read -p "Do you want to add iOS platform? (requires Xcode) [y/N]: " add_ios
if [[ $add_ios =~ ^[Yy]$ ]]; then
    echo "📱 Adding iOS platform..."
    npx cap add ios
fi

read -p "Do you want to add Android platform? (requires Android Studio) [y/N]: " add_android
if [[ $add_android =~ ^[Yy]$ ]]; then
    echo "📱 Adding Android platform..."
    npx cap add android
fi

echo ""
echo "🎉 Setup complete! Here's what you can do next:"
echo ""
echo "📋 Development Commands:"
echo "  npm run dev                    - Start development server"
echo "  npm run electron:dev           - Run Electron app in development"
echo ""
echo "🏗️  Build Commands:"
echo "  npm run build                  - Build all platforms"
echo "  npm run build:electron         - Build Electron apps (all platforms)"
echo "  npm run build:electron:win     - Build Windows app"
echo "  npm run build:electron:mac     - Build macOS app"
echo "  npm run build:electron:linux   - Build Linux app"
echo ""
echo "📱 Mobile Commands:"
echo "  npm run cap:sync               - Sync web assets to mobile"
echo "  npm run cap:open:ios          - Open iOS project in Xcode"
echo "  npm run cap:open:android      - Open Android project in Android Studio"
echo "  npm run cap:run:ios           - Build and run on iOS device/simulator"
echo "  npm run cap:run:android       - Build and run on Android device/emulator"
echo ""
echo "🔧 Next Steps:"
echo "1. Create app icons in the 'icons' directory"
echo "2. Test the app: npm run dev"
echo "3. Test Electron: npm run electron:dev"
echo "4. Configure mobile platforms if added"
echo ""
