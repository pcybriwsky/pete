const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Print endpoint
app.post('/api/print', async (req, res) => {
  try {
    const { imageData, printerName, paperSize, copies } = req.body;
    
    // Remove data URL prefix
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    
    // Create temporary file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const filename = `print_${Date.now()}.png`;
    const filepath = path.join(tempDir, filename);
    
    // Write image to file
    fs.writeFileSync(filepath, base64Data, 'base64');
    
    // Print using CUPS (macOS/Linux)
    const printCommand = `lpr -P "${printerName}" -# ${copies} "${filepath}"`;
    
    exec(printCommand, (error, stdout, stderr) => {
      // Clean up temp file
      fs.unlinkSync(filepath);
      
      if (error) {
        console.error('Print error:', error);
        res.status(500).json({ error: 'Print failed', details: error.message });
        return;
      }
      
      console.log('Print successful:', stdout);
      res.json({ success: true, message: 'Print job sent' });
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Print server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 