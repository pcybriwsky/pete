# 🍎 Apple Music Integration Setup for Web Apps

## Overview
This guide explains how to set up Apple Music integration for your Song Swap web application using MusicKit JS.

## Step 1: Apple Developer Account
1. **Go to** [developer.apple.com](https://developer.apple.com/)
2. **Sign in** with your Apple ID
3. **Enroll in the Apple Developer Program** ($99/year) - **Required for MusicKit**

## Step 2: Create a MusicKit App
1. **Go to** [Apple Developer Portal](https://developer.apple.com/account/)
2. **Navigate to** "Certificates, Identifiers & Profiles"
3. **Click** "Identifiers" in the left sidebar
4. **Click** the "+" button to create a new identifier
5. **Select** "App IDs" and click "Continue"
6. **Choose** "App" and click "Continue"
7. **Fill in the details:**
   - **Description**: "Song Swap MusicKit App"
   - **Bundle ID**: `com.yourname.songswap` (use reverse domain notation)
8. **Scroll down** and **check "MusicKit"** under Capabilities
9. **Click** "Continue" and "Register"

## Step 3: Generate Developer Token
1. **Go to** [Apple Developer Portal](https://developer.apple.com/account/)
2. **Navigate to** "Keys" in the left sidebar
3. **Click** the "+" button to create a new key
4. **Name it**: "Song Swap MusicKit Key"
5. **Check "MusicKit"** under Key Services
6. **Click** "Continue" and "Register"
7. **Download the key file** (`.p8` file) - **Save this securely!**
8. **Note the Key ID** (10-character string)
9. **Note your Team ID** (10-character string from your account)

## Step 4: Create JWT Token
According to the [official Apple documentation](https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens), you need to create a JWT token with specific claims.

Use this Node.js script to generate your developer token:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const TEAM_ID = 'HY8S2WXJ2X'; // 10-character team ID from your Apple Developer account
const KEY_ID = 'J7M4MP5TY9'; // 10-character key ID from the key you created
const PRIVATE_KEY_PATH = './AuthKey_YOUR_KEY_ID.p8'; // Path to your downloaded .p8 file

function generateToken() {
  const privateKey =
"MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg7MjDrHmdC+sF36XtxCVMOrtcXfi1otb19qxfnpmv3ySgCgYIKoZIzj0DAQehRANCAASvpBXVcFp0H4hcBKsPK1hLUekfN9V9JC0KZQJ3Ka+DJ2V6J+shsBy0DwEElPkOdqvLS46t5TK+v8NKWLl3xh8n";
  
  // JWT payload with required claims as per Apple's documentation
  const payload = {
    iss: TEAM_ID, // Issuer (your team ID)
    iat: Math.floor(Date.now() / 1000), // Issued at (current time)
    exp: Math.floor(Date.now() / 1000) + (6 * 30 * 24 * 60 * 60), // Expires in 6 months
  };
  
  // Sign the JWT with ES256 algorithm as required by Apple
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: KEY_ID // Key ID in header
    }
  });
  
  console.log('🎵 Your Apple Developer Token:');
  console.log('='.repeat(60));
  console.log(token);
  console.log('='.repeat(60));
  console.log('\n⚠️  Important:');
  console.log('- This token expires in 6 months');
  console.log('- Keep your .p8 file secure');
  console.log('- Never commit the .p8 file to version control');
  
  return token;
}

generateToken();
```

## Step 5: Add Token to Your App
1. **Install jsonwebtoken**: `npm install jsonwebtoken`
2. **Run the script** to generate your token
3. **Copy the token** and add it to your SongSwapPage.js:

```javascript
// In the initMusicKit function, uncomment and add your token:
addMetaTag('apple-music-developer-token', 'YOUR_GENERATED_TOKEN');
```

## Step 6: Test the Integration
1. **Start your app**: `npm start`
2. **Click "Connect with Apple Music"**
3. **Authorize** with your Apple ID
4. **View your recently played songs**

## Important Notes
- **Token expires** every 6 months - regenerate before expiration
- **Keep your .p8 file secure** - never commit it to git
- **Demo data** will show if token is not configured
- **Web Components** are included for future playback features

## Troubleshooting
- **"MusicKit not loaded"**: Check if the script loaded properly
- **"Authorization failed"**: Verify your developer token is correct
- **"No songs found"**: User may not have recently played songs
- **Demo data shows**: Developer token not configured or expired

## Resources
- [MusicKit JS Documentation](https://js-cdn.music.apple.com/musickit/v3/docs/index.html)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [MusicKit Web API Reference](https://developer.apple.com/documentation/musickitjs) 