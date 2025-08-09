# 🎯 NFC Song Swap Deployment Strategies

## **Strategy 1: Live Website + Cloud Print Server (Recommended)**

### **Setup:**
1. **NFC Tag**: Points to `https://repete.art/gallery/song-swap`
2. **Website**: Deployed on Vercel/Netlify (your current setup)
3. **Print Server**: Deployed on Railway/Render/DigitalOcean

### **Architecture:**
```
NFC Tag → Live Website → Cloud Print Server → Local Printer (via VPN/SSH)
```

### **Implementation:**
1. Deploy print server to cloud platform
2. Set up VPN/SSH tunnel to your local printer
3. Configure environment variables for print server URL

### **Pros:**
- ✅ Works from anywhere
- ✅ Professional setup
- ✅ Easy to maintain
- ✅ No network configuration needed

---

## **Strategy 2: Local Network Deployment**

### **Setup:**
1. **NFC Tag**: Points to `http://192.168.1.100:3000/gallery/song-swap`
2. **Website**: Runs on local machine
3. **Print Server**: Same machine

### **Implementation:**
```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Start both servers
npm start  # React app on port 3000
node print-server-production.js  # Print server on port 3001
```

### **Network Setup:**
1. Configure router to assign static IP to your machine
2. Ensure port 3000 and 3001 are accessible on local network
3. Test from phone on same WiFi

### **Pros:**
- ✅ Print server on same machine as printer
- ✅ No internet dependency
- ✅ More secure

---

## **Strategy 3: Hybrid (Best of Both)**

### **Setup:**
1. **NFC Tag**: Points to live website
2. **Website**: Detects if user is on local network
3. **Print Server**: Uses local if available, cloud as fallback

### **Implementation:**
```javascript
// In SongSwapPage.js
const detectPrintServer = () => {
  // Try local network first
  const localPrintServer = 'http://192.168.1.100:3001';
  
  // Test if local server is available
  fetch(`${localPrintServer}/api/health`)
    .then(() => setPrintServerUrl(localPrintServer))
    .catch(() => setPrintServerUrl(process.env.REACT_APP_CLOUD_PRINT_SERVER));
};
```

---

## **Quick Start: Local Network**

### **1. Find Your IP:**
```bash
# On Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows
ipconfig | findstr "IPv4"
```

### **2. Update NFC Tag:**
Program your NFC tag with: `http://YOUR_IP:3000/gallery/song-swap`

### **3. Start Servers:**
```bash
# Terminal 1: React app
npm start

# Terminal 2: Print server
node print-server-production.js
```

### **4. Test:**
- Connect phone to same WiFi
- Tap NFC tag
- Should open your site on phone

---

## **Quick Start: Live Website**

### **1. Deploy Print Server:**
```bash
# Deploy to Railway/Render/DigitalOcean
# Set environment variables:
DEFAULT_PRINTER=HP_Envy_6555e
ALLOWED_ORIGINS=https://repete.art
```

### **2. Update Website:**
```bash
# Add environment variable to your React app
REACT_APP_PRINT_SERVER_URL=https://your-print-server.railway.app
```

### **3. NFC Tag:**
Program with: `https://repete.art/gallery/song-swap`

---

## **Which to Choose?**

### **For Events/Exhibitions:**
- **Local Network** - More reliable, no internet dependency

### **For Permanent Installation:**
- **Live Website** - Professional, works from anywhere

### **For Development/Testing:**
- **Local Network** - Faster iteration, easier debugging 