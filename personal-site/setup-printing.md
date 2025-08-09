# 🖨️ NFC Song Swap Printer Setup

## **Setup Steps:**

### 1. **Install Print Server Dependencies**
```bash
cd personal-site
mv print-server-package.json package.json
npm install
```

### 2. **Find Your Printer Name**
```bash
# List all printers
lpstat -p

# Or on macOS, check System Preferences > Printers & Scanners
```

### 3. **Update Printer Name in Code**
Edit `src/Pages/SongSwapPage.js` and update the `printerName` in the `printDirectly` function:
```javascript
printerName: 'HP_Envy_6555e', // Replace with your actual printer name
```

### 4. **Start Print Server**
```bash
# In one terminal (print server)
npm start

# In another terminal (React app)
npm start
```

### 5. **Test Printing**
- Go to `http://localhost:3000/gallery/song-swap`
- Connect with Spotify
- Select a song and create swap
- Click "Print Card" - it should print automatically!

## **Alternative Options:**

### **Option B: Windows Printing**
If you're on Windows, replace the print command in `print-server.js`:
```javascript
const printCommand = `print "${filepath}"`;
```

### **Option C: Network Printer**
For network printers, you can use IP addresses:
```javascript
const printCommand = `lpr -H 192.168.1.100 -P "PrinterName" "${filepath}"`;
```

### **Option D: USB Printer (Node.js)**
For direct USB control, you can use libraries like:
- `node-printer` for more control
- `escpos` for thermal printers

## **Production Deployment:**

For production, you'll want to:
1. Run the print server on the same machine as the printer
2. Use environment variables for printer settings
3. Add authentication to the print API
4. Set up proper error handling and logging

## **Troubleshooting:**

- **"Printer not found"**: Check printer name with `lpstat -p`
- **"Permission denied"**: Make sure your user has print permissions
- **"CUPS not found"**: Install CUPS: `sudo apt-get install cups` (Ubuntu) or it's built into macOS 