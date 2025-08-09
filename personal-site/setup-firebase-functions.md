# 🚀 Firebase Functions + Local Print Setup

## **Step 1: Install Firebase CLI**

```bash
# Install Firebase CLI globally (you may need sudo on Mac/Linux)
npm install -g firebase-tools

# Or use npx (no global install needed)
npx firebase-tools --version
```

## **Step 2: Login to Firebase**

```bash
firebase login
```

## **Step 3: Initialize Firebase Functions**

```bash
# In your personal-site directory
firebase init functions

# Select your project when prompted
# Choose JavaScript
# Say YES to ESLint
# Say YES to installing dependencies
```

## **Step 4: Install Dependencies**

```bash
cd firebase-functions
npm install
```

## **Step 5: Deploy Firebase Functions**

```bash
# Deploy the functions
firebase deploy --only functions
```

## **Step 6: Update Local Print Script**

1. **Copy your Firebase config** from `src/firebase-config.js` to `local-print-script.js`
2. **Install dependencies** for the local script:
   ```bash
   npm install firebase
   ```

## **Step 7: Update Website**

The `handleCreateSwap` function in `src/Pages/SongSwapPage.js` needs to call the Firebase Function:

```javascript
// Add this line after getting the received song:
const printSongSwap = httpsCallable(functions, 'printSongSwap');
await printSongSwap({
  depositedSong: selectedDeposit,
  receivedSong: receivedSong
});
```

## **Step 8: Run Local Print Script**

```bash
# In your personal-site directory
node local-print-script.js
```

## **Step 9: Test the Flow**

1. **Deploy your website** to Vercel/Netlify
2. **Go to** `https://repete.art/gallery/song-swap`
3. **Connect with Spotify**
4. **Select a song and create swap**
5. **Check your computer** - the print script should detect the new job and print

## **Troubleshooting**

### **Firebase Functions Issues:**
- Check Firebase Console > Functions for deployment status
- Check logs: `firebase functions:log`

### **Local Print Script Issues:**
- Verify Firebase config is correct
- Check if `printJobs` collection is being created
- Test with `console.log` statements

### **Printing Issues:**
- Verify printer is connected and working
- Check if browser opens the HTML file
- Test manual print from browser

## **File Structure**

```
personal-site/
├── firebase-functions/
│   ├── index.js          # Firebase Function
│   └── package.json      # Function dependencies
├── src/
│   └── Pages/
│       └── SongSwapPage.js  # Updated with Firebase Function call
├── local-print-script.js    # Local print monitor
└── firebase.json            # Firebase config
```

## **Environment Variables**

Make sure your Firebase project has the necessary permissions for:
- Firestore read/write
- Functions invoke
- Authentication (if needed) 