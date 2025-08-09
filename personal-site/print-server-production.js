const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Environment variables
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://repete.art'];
const DEFAULT_PRINTER = process.env.DEFAULT_PRINTER || 'HP_Envy_6555e';
const PRINT_MODE = process.env.PRINT_MODE || 'local'; // 'local', 'email', 'webhook'

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    printer: DEFAULT_PRINTER,
    printMode: PRINT_MODE,
    allowedOrigins: ALLOWED_ORIGINS
  });
});

// List available printers
app.get('/api/printers', (req, res) => {
  if (PRINT_MODE !== 'local') {
    return res.json({ printers: [], mode: PRINT_MODE });
  }
  
  exec('lpstat -p', (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: 'Failed to get printers', details: error.message });
      return;
    }
    
    const printers = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace('printer ', '').split(' ')[0]);
    
    res.json({ printers, mode: PRINT_MODE });
  });
});

// Print endpoint
app.post('/api/print', async (req, res) => {
  try {
    const { imageData, printerName, paperSize, copies } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
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
    
    // Handle different print modes
    if (PRINT_MODE === 'local') {
      await handleLocalPrint(filepath, printerName, copies, res);
    } else if (PRINT_MODE === 'email') {
      await handleEmailPrint(filepath, res);
    } else if (PRINT_MODE === 'webhook') {
      await handleWebhookPrint(filepath, res);
    } else {
      res.status(400).json({ error: 'Invalid print mode' });
    }
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Local printing (direct to printer)
async function handleLocalPrint(filepath, printerName, copies, res) {
  const printer = printerName || DEFAULT_PRINTER;
  const numCopies = copies || 1;
  
  const printCommand = `lpr -P "${printer}" -# ${numCopies} "${filepath}"`;
  
  console.log(`Printing to ${printer} with command: ${printCommand}`);
  
  exec(printCommand, (error, stdout, stderr) => {
    // Clean up temp file
    try {
      fs.unlinkSync(filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError.message);
    }
    
    if (error) {
      console.error('Print error:', error);
      res.status(500).json({ 
        error: 'Print failed', 
        details: error.message,
        printer: printer
      });
      return;
    }
    
    console.log('Print successful:', stdout);
    res.json({ 
      success: true, 
      message: 'Print job sent',
      printer: printer,
      copies: numCopies
    });
  });
}

// Email printing (send to email for manual printing)
async function handleEmailPrint(filepath, res) {
  // For now, just return success and log the file location
  // In production, you'd integrate with an email service like SendGrid
  console.log('Email print mode: File saved at', filepath);
  
  res.json({ 
    success: true, 
    message: 'Print job queued for email delivery',
    mode: 'email',
    fileLocation: filepath
  });
}

// Webhook printing (send to external service)
async function handleWebhookPrint(filepath, res) {
  const webhookUrl = process.env.WEBHOOK_URL;
  
  if (!webhookUrl) {
    res.status(500).json({ error: 'Webhook URL not configured' });
    return;
  }
  
  try {
    // Read file and send to webhook
    const fileBuffer = fs.readFileSync(filepath);
    const base64File = fileBuffer.toString('base64');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: base64File,
        timestamp: new Date().toISOString(),
        printer: DEFAULT_PRINTER
      })
    });
    
    // Clean up temp file
    try {
      fs.unlinkSync(filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError.message);
    }
    
    if (response.ok) {
      res.json({ 
        success: true, 
        message: 'Print job sent to webhook',
        mode: 'webhook'
      });
    } else {
      res.status(500).json({ error: 'Webhook failed', status: response.status });
    }
  } catch (error) {
    res.status(500).json({ error: 'Webhook error', details: error.message });
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Print server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🖨️ Default printer: ${DEFAULT_PRINTER}`);
  console.log(`🔄 Print mode: ${PRINT_MODE}`);
  console.log(`🌐 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
}); 