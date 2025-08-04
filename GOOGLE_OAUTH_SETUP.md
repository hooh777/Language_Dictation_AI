# Google OAuth Setup Guide for Language Dictation AI

This guide will help you set up Google OAuth authentication to access your private Google Sheets securely.

## 🎯 Overview

With Google OAuth integration, you can:
- Keep your Google Sheets private (no need to make them public)
- Access sheets from your personal Google account
- Allow multiple users to login with their own accounts
- Maintain full control over who can access your data

## 📋 Prerequisites

- A Google account
- Access to Google Cloud Console
- Your Google Sheets containing vocabulary data

## 🔧 Step-by-Step Setup

### 1. Access Google Cloud Console
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Sign in with your Google account

### 2. Create or Select a Project
- Click on the project dropdown at the top
- Either select an existing project or click "New Project"
- If creating new: enter a project name (e.g., "Language Dictation AI")
- Click "Create"

### 3. Enable Required APIs
- Go to **"APIs & Services"** → **"Library"**
- Search for and enable these APIs:
  - **Google Sheets API**
  - **Google Drive API**
- Click "Enable" for each API

### 4. Configure OAuth Consent Screen
- Go to **"APIs & Services"** → **"OAuth consent screen"**
- Choose **"External"** (unless you're part of a Google Workspace organization)
- Fill out the required fields:
  - **App name**: "Language Dictation AI"
  - **User support email**: Your email
  - **Developer contact information**: Your email
- Click **"Save and Continue"**
- On Scopes page, click **"Save and Continue"** (we'll use default scopes)
- On Test users page, you can add your email or leave empty for now
- Click **"Save and Continue"**

### 5. Create OAuth Credentials
- Go to **"APIs & Services"** → **"Credentials"**
- Click **"Create Credentials"** → **"OAuth client ID"**
- Select **"Web application"** as the application type
- Set the name: "Language Dictation AI Web Client"

### 6. Configure Authorized Origins
Add these Authorized JavaScript origins:
```
http://localhost:8000
http://127.0.0.1:8000
```

If you plan to deploy online, also add:
```
https://yourdomain.com
```

### 7. Get Your Client ID
- After creating, you'll see your **Client ID**
- It looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- Copy this Client ID

### 8. Configure the App
1. Open your Language Dictation AI app
2. Go to the **Setup tab**
3. In the **API Configuration** section:
   - Paste your Client ID in the **"Google OAuth Client ID"** field
   - Save your Grok-1.5 Vision API key as well

### 9. Test Authentication
1. Click **"Sign in with Google"** button
2. You'll be redirected to Google's login page
3. Grant permissions to access your Google Sheets
4. You should see "Signed in as [Your Name]"

### 10. Import Your Google Sheets
1. Make sure you're signed in to Google
2. Click **"Import from Google Sheets"**
3. Paste your Google Sheets URL
4. Click **"Import"**

## 📊 Google Sheets Format

Your Google Sheet should have these columns:
| Word | POS | Meaning | Sentence Example |
|------|-----|---------|------------------|
| Tease | v. | 取笑 / 戲弄 | My older brother used to tease me a lot when we were kids. |
| Mean | adj. | 刻薄的 / 吝嗇的 | It was a mean thing to say to her. |

## 🔒 Privacy & Security

- **Your data stays private**: Only you can access your sheets
- **Local storage**: Client ID is stored locally in your browser
- **No server access**: We never see or store your Google credentials
- **Secure authentication**: Uses Google's OAuth 2.0 standard
- **Revokable access**: You can revoke access anytime in your Google Account settings

## 🚀 Testing with Your Sample Data

Your sheet URL: `https://docs.google.com/spreadsheets/d/1MPMePihCmxXvV2yRZf4o-LUVepdzxQpNDzUtqewIj5k/edit?gid=0#gid=0`

Once authentication is set up:
1. Sign in to Google in the app
2. Use your sheet URL to import the vocabulary
3. The app will access your private sheet securely

## ❗ Troubleshooting

### "Origin not allowed" Error
- Add your domain to Authorized JavaScript origins in Google Cloud Console
- Make sure to include both `http://localhost:8000` and `http://127.0.0.1:8000`

### "Access denied" Error
- Check that Google Sheets API and Google Drive API are enabled
- Verify you have view access to the Google Sheet
- Try signing out and signing in again

### "Client ID not found" Error
- Double-check your Client ID is correctly copied
- Make sure you created a "Web application" OAuth client

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify all APIs are enabled in Google Cloud Console
3. Ensure your Google Sheet contains the correct format
4. Try accessing the sheet directly in Google Sheets to confirm permissions

## 🎉 Success!

Once set up, you can:
- Import vocabulary from any of your private Google Sheets
- Share specific sheets with other users by email
- Keep your study materials organized and private
- Access everything securely through the app

The authentication setup is a one-time process. After that, importing from Google Sheets is just a few clicks away!
