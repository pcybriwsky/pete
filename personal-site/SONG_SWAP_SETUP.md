# NFC Song Swap Printer Setup Guide

## Overview
The NFC Song Swap Printer is an interactive web app that allows users to swap songs via NFC tags and receive printed cards. Users tap an NFC tag, authenticate with music services, and get a physical card showing their song and a received song from another user.

## Features
- 🎵 Spotify & Apple Music integration (demo mode available)
- 🔄 Real-time song pairing with other users
- 🖨️ Automatic card printing
- 📱 Mobile-first responsive design
- 🎨 Beautiful p5.js card design
- 🔥 Firebase backend for data persistence

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to **Project Settings** > **General**
4. Scroll down to "Your apps" section
5. Click **"Add app"** and select **Web**
6. Copy the config object and replace values in `src/firebase-config.js`

### 2. Enable Firebase Services

#### Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable **Google** provider
3. Add your domain to authorized domains

#### Firestore Database
1. Go to **Firestore Database**
2. Click **"Create database"**
3. Start in **test mode** (for development)
4. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /songs/{document} {
      allow read, write: if true; // For demo - add proper auth rules for production
    }
  }
}
```

### 3. NFC Tag Setup

1. Get NFC tags (NTAG213/215/216 recommended)
2. Write the URL to your deployed app: `https://yourdomain.com/gallery/song-swap`
3. Test the NFC tag with your phone

### 4. Printer Setup

#### HP Envy 6555e Configuration
1. Use business card stock (e.g., Avery 5371)
2. Set paper size to 3.5" x 2"
3. Disable margins in print settings
4. Set print quality to "Best"

#### Alternative Paper Options
- Pre-cut business card stock
- Custom cardstock (manually fed)
- Index cards (3x5 or 4x6)

### 5. Music API Integration (Optional)

#### Spotify API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `https://yourdomain.com/gallery/song-swap`
4. Update the authentication flow in the code

#### Apple Music API
1. Set up MusicKit JS
2. Configure user tokens
3. Update the authentication flow

## Usage

### For Users
1. Tap NFC tag with phone
2. Sign in with Spotify/Apple Music (or use demo mode)
3. View generated song swap card
4. Print card automatically
5. Keep the physical card as a memento

### For Administrators
1. Monitor Firebase console for song data
2. Check print logs
3. Manage user authentication
4. Update song database

## File Structure

```
src/
├── Pages/
│   ├── SongSwapPage.js          # Main page component
│   └── SongSwapPage.css         # Styling
├── Pages/Components/SongSwap/
│   └── SongSwapSketch.js        # p5.js card design
├── firebase-config.js           # Firebase configuration
└── App.js                       # Route configuration
```

## Customization

### Card Design
- Modify `SongSwapSketch.js` to change card layout
- Adjust colors, fonts, and dimensions
- Add QR codes or album art

### Print Settings
- Update canvas dimensions in sketch
- Modify print CSS in `SongSwapPage.css`
- Adjust paper size and margins

### Authentication
- Add more music service providers
- Implement custom authentication flows
- Add user profiles and preferences

## Troubleshooting

### Common Issues

1. **Firebase not connecting**
   - Check configuration in `firebase-config.js`
   - Verify project settings and API keys

2. **Print not working**
   - Check browser print settings
   - Verify printer is connected and configured
   - Test with different browsers

3. **NFC not working**
   - Ensure NFC is enabled on device
   - Check tag is properly programmed
   - Test with different NFC apps

4. **Authentication errors**
   - Verify OAuth redirect URIs
   - Check Firebase authentication settings
   - Test with demo mode first

### Development Tips

1. Use demo mode for testing without music APIs
2. Test print functionality with browser print preview
3. Monitor Firebase console for data flow
4. Use browser dev tools to debug authentication

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables for Firebase
3. Deploy automatically on push

### Firebase Hosting
1. Install Firebase CLI
2. Run `firebase init hosting`
3. Deploy with `firebase deploy`

### Environment Variables
Set these in your hosting platform:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_SPOTIFY_CLIENT_ID` (if using Spotify API)

## Future Enhancements

- [ ] Real Spotify/Apple Music API integration
- [ ] QR codes linking to songs
- [ ] Social sharing features
- [ ] User profiles and history
- [ ] Multiple card designs
- [ ] Analytics dashboard
- [ ] Mobile app version

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Test with demo mode first
4. Check browser console for errors

---

**Note**: This is a demo implementation. For production use, implement proper security rules, error handling, and music API authentication. 