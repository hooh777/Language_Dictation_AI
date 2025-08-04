# 🚀 Quick Start - Electron + Capacitor Setup

Get your Language Dictation AI running as native desktop and mobile apps in minutes!

## ⚡ Instant Setup (Windows)

```cmd
# 1. Open PowerShell in your project directory
cd c:\Users\user\Documents\GitHub\Language_Dictation_AI

# 2. Run the automated setup
setup.bat

# 3. Test the desktop app
npm run electron:dev
```

## ⚡ Instant Setup (macOS/Linux)

```bash
# 1. Navigate to your project directory  
cd ~/Documents/GitHub/Language_Dictation_AI

# 2. Run the automated setup
chmod +x setup.sh
./setup.sh

# 3. Test the desktop app
npm run electron:dev
```

## 🎯 What You'll Get

### 🖥️ Desktop Apps (Electron)
- **Windows**: `.exe` installer and portable app
- **macOS**: `.dmg` disk image and `.app` bundle  
- **Linux**: `.AppImage`, `.deb`, and `.rpm` packages

### 📱 Mobile Apps (Capacitor)
- **iOS**: Native app for iPhone/iPad (requires Xcode)
- **Android**: Native app for Android devices (requires Android Studio)

### ✨ Enhanced Features
- **Native menus** with keyboard shortcuts
- **File dialogs** for vocabulary import
- **Better performance** compared to web version
- **Offline capabilities** with local storage
- **App store distribution** ready

## 🧪 Testing Your Setup

### Test Desktop App
```bash
# Start development mode (web + Electron)
npm run electron:dev

# Expected: Native desktop window opens with your app
# ✅ Should show: Language Dictation AI in a native window
# ✅ Should have: Native menu bar (File, Edit, View, etc.)
```

### Test Mobile Platforms (Optional)
```bash
# Add iOS platform (requires Xcode on macOS)
npm run cap:add:ios
npm run cap:open:ios

# Add Android platform (requires Android Studio)
npm run cap:add:android  
npm run cap:open:android
```

## 🔧 First Build

### Build Desktop Apps
```bash
# Build for your current platform
npm run build:electron

# Check the 'dist' folder for your installer!
```

### Build Mobile Apps
```bash
# Sync web code to mobile platforms
npm run cap:sync

# Open in respective IDEs to build
npm run cap:open:ios     # Opens Xcode
npm run cap:open:android # Opens Android Studio
```

## 🎨 Customize Your App

### 1. Create App Icons
- Add your icons to the `icons/` folder
- Use https://favicon.io/favicon-generator/ for quick generation
- Required sizes: 16x16, 32x32, 48x48, 128x128, 256x256, 512x512

### 2. Update App Information
Edit `package.json`:
```json
{
  "name": "your-app-name",
  "description": "Your app description",
  "author": "Your Name"
}
```

Edit `capacitor.config.json`:
```json
{
  "appId": "com.yourcompany.yourapp",
  "appName": "Your App Name"
}
```

## 🚨 Troubleshooting Quick Fixes

### If setup.bat/setup.sh fails:
```bash
# Install dependencies manually
npm install electron electron-builder concurrently wait-on --save-dev
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android --save-dev
```

### If Electron won't start:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### If mobile platforms fail:
- **iOS**: Ensure Xcode is installed and updated
- **Android**: Ensure Android Studio with SDK is installed

## 📋 Development Workflow

```bash
# Daily development
npm run electron:dev     # Test desktop app
npm run cap:sync         # Update mobile platforms  
npm run cap:open:ios     # Test iOS (macOS only)
npm run cap:open:android # Test Android

# When ready to distribute
npm run build:electron   # Build desktop installers
# Build mobile apps in Xcode/Android Studio
```

## 🎉 Success Indicators

✅ **Desktop app opens** in a native window  
✅ **Native menus** appear in the menu bar  
✅ **File imports** work with native dialogs  
✅ **All features** function the same as web version  
✅ **Mobile projects** open in Xcode/Android Studio  

## 🆘 Need Help?

1. **Check the full guide**: `ELECTRON_CAPACITOR_DEPLOYMENT.md`
2. **Common issues**: See troubleshooting section in the full guide
3. **Platform requirements**: Ensure you have all prerequisites installed

---

**You're now ready to build native apps for all platforms!** 🎯

Next steps: Customize your icons, test all features, and build your first distribution packages.
