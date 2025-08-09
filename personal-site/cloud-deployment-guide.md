# 🚀 Cloud Print Server Deployment Guide

## **Step 1: Deploy to Railway**

### **1.1 Create Railway Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Create new project

### **1.2 Deploy Print Server**
```bash
# In your personal-site directory
# Create a new directory for print server
mkdir print-server-deploy
cd print-server-deploy

# Copy necessary files
cp ../print-server-production.js .
cp ../print-server-package.json package.json
cp ../railway.json .

# Initialize git and deploy
git init
git add .
git commit -m "Initial print server deployment"
git branch -M main

# Connect to Railway (follow Railway CLI instructions)
railway login
railway init
railway up
```

### **1.3 Set Environment Variables**
In Railway dashboard, add these variables:
```
DEFAULT_PRINTER=HP_Envy_6555e
ALLOWED_ORIGINS=https://repete.art,http://localhost:3000
PORT=3001
```

### **1.4 Get Your Print Server URL**
Railway will give you a URL like: `https://your-app-name.railway.app`

---

## **Step 2: Set Up Local Printer Access**

### **Option A: SSH Tunnel (Recommended)**
```bash
# On your local machine (where printer is connected)
ssh -R 631:localhost:631 your-railway-server.com
```

### **Option B: VPN Connection**
- Set up a VPN between your local network and Railway server
- Configure printer to be accessible via VPN

### **Option C: Cloud Printing Service**
- Use Google Cloud Print or similar service
- Configure printer to work with cloud printing

---

## **Step 3: Update Your React App**

### **3.1 Add Environment Variable**
Create `.env.local` in your React app:
```bash
REACT_APP_PRINT_SERVER_URL=https://your-app-name.railway.app
REACT_APP_PRINTER_NAME=HP_Envy_6555e
```

### **3.2 Deploy Updated Website**
```bash
# Your existing deployment process
npm run build
# Deploy to Vercel/Netlify
```

---

## **Step 4: Test the Setup**

### **4.1 Test Print Server**
```bash
# Test health endpoint
curl https://your-app-name.railway.app/api/health

# Should return:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "printer": "HP_Envy_6555e",
  "allowedOrigins": ["https://repete.art", "http://localhost:3000"]
}
```

### **4.2 Test from Live Website**
1. Go to `https://repete.art/gallery/song-swap`
2. Connect with Spotify
3. Select a song and create swap
4. Click "Print Card"
5. Check if print job is sent successfully

---

## **Step 5: NFC Tag Setup**

### **5.1 Program NFC Tag**
Use an NFC programming app to write:
```
https://repete.art/gallery/song-swap
```

### **5.2 Test NFC**
1. Tap NFC tag with phone
2. Should open your live website
3. Complete the song swap flow
4. Verify printing works

---

## **Troubleshooting**

### **Print Server Issues:**
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Test health endpoint

### **Printing Issues:**
- Verify printer is accessible from Railway server
- Check printer name is correct
- Test with `lpstat -p` on local machine

### **CORS Issues:**
- Verify `ALLOWED_ORIGINS` includes your domain
- Check browser console for CORS errors

---

## **Production Considerations**

### **Security:**
- Add API key authentication
- Use HTTPS for all communications
- Implement rate limiting

### **Monitoring:**
- Set up logging and monitoring
- Add error tracking (Sentry)
- Monitor print job success rates

### **Scaling:**
- Consider multiple print servers for high traffic
- Implement print job queuing
- Add printer status monitoring 