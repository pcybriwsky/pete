const { initializeApp } = require('firebase/app');
const { getFirestore, collection, onSnapshot, query, orderBy, limit, updateDoc, doc } = require('firebase/firestore');
const { exec } = require('child_process');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');


// Debug mode - set to true to just log jobs instead of printing
const DEBUG_MODE = false;

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDkadMxyW5CaCEcxnXGvsdVOuQCzsUdQ5k",
  authDomain: "song-swap-4ccc5.firebaseapp.com",
  projectId: "song-swap-4ccc5",
  storageBucket: "song-swap-4ccc5.firebasestorage.app",
  messagingSenderId: "235923715185",
  appId: "1:235923715185:web:043ce2a3378dceca7c97d0",
  measurementId: "G-SSBB857VVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Track processed print jobs
const processedJobs = new Set();

// Enhanced ESC/POS control characters
const ESC = '\x1B';
const GS = '\x1D';
const INIT = `${ESC}@`; // Initialize printer (ESC @)

// Text size controls
const NORMAL_SIZE = `${ESC}!${String.fromCharCode(0)}`; // Normal size
const DOUBLE_HEIGHT = `${ESC}!${String.fromCharCode(16)}`; // Double height
const DOUBLE_WIDTH = `${ESC}!${String.fromCharCode(32)}`; // Double width
const DOUBLE_SIZE = `${ESC}!${String.fromCharCode(48)}`; // Double height + width
const SMALL_SIZE = `${ESC}!${String.fromCharCode(1)}`; // Small size

// Alignment controls
const ALIGN_LEFT = `${ESC}a${String.fromCharCode(0)}`;
const ALIGN_CENTER = `${ESC}a${String.fromCharCode(1)}`;
const ALIGN_RIGHT = `${ESC}a${String.fromCharCode(2)}`;

// Text style controls
const BOLD_ON = `${ESC}E${String.fromCharCode(1)}`;
const BOLD_OFF = `${ESC}E${String.fromCharCode(0)}`;
const FONT_A = `${ESC}M${String.fromCharCode(0)}`; // Default font
const FONT_B = `${ESC}M${String.fromCharCode(1)}`; // Smaller font

// Line spacing controls
const SET_LINE_SPACING = `${ESC}3`;
const LINE_SPACING_10 = `${SET_LINE_SPACING}${String.fromCharCode(10)}`; // Tighter spacing
const LINE_SPACING_24 = `${SET_LINE_SPACING}${String.fromCharCode(24)}`; // Normal spacing
const RESET_LINE_SPACING = `${ESC}2`; // Reset to default

// Paper cutting - try different cut commands
const PARTIAL_CUT = `${GS}V${String.fromCharCode(65)}`; // Partial cut (no n)
const FULL_CUT = `${GS}V${String.fromCharCode(66)}`; // Full cut (no n)
// Epson TM-T20III often requires n parameter with GS V 65/66 n (n=0 recommended)
const PARTIAL_CUT_N0 = `${GS}V${String.fromCharCode(65)}\x00`; // GS V 65 0
const FULL_CUT_N0 = `${GS}V${String.fromCharCode(66)}\x00`;    // GS V 66 0
const FULL_CUT_N3 = `${GS}V${String.fromCharCode(66)}\x03`;    // GS V 66 3 (full cut with small extra feed)
const CUT_ALTERNATIVE = `${ESC}i`; // Alternative cut command
const CUT_ESC_M = `${ESC}m`; // Alternative partial cut (ESC m)
const CUT_SIMPLE = `${GS}V`; // Simple cut without parameter
const CUT_ADVANCED = `${GS}V${String.fromCharCode(0)}`; // Advanced cut with 0 parameter

// QR Code commands
const QR_SIZE = `${GS}k${String.fromCharCode(2)}${String.fromCharCode(2)}`; // QR size
const QR_ERROR_CORRECTION = `${GS}k${String.fromCharCode(3)}${String.fromCharCode(2)}`; // QR error correction
const QR_STORE = `${GS}k${String.fromCharCode(80)}${String.fromCharCode(112)}${String.fromCharCode(1)}`; // QR store data
const QR_PRINT = `${GS}k${String.fromCharCode(3)}${String.fromCharCode(0)}`; // QR print

// Add logging at the top of the file
console.log('🔥 Print script loaded - PID:', process.pid, 'Time:', new Date().toISOString());

// ===== Global knobs and content pools =====
const IG_HANDLE = '@_re_pete';
const IG_URL = 'https://instagram.com/_re_pete';
const BUILD_VERSION = 'v1.0';
const ENABLE_ASCII = true;
const ENABLE_IG_QR = false;
const RARE_ASCII_ODDS = 1 / 30;
const ENABLE_LOGO = true; // Toggle: print logo PNG at top of receipt
const LOGO_MAX_WIDTH = 512; // Dots; bumped up for bigger logo; TM-T20III 80mm supports up to 576
const LOGO_PATH = path.join(__dirname, 'src', 'Assets', 'Images', 'BangersOnlyBank.png');

const QUIPS = {
  headerDeposit: [
    'BANGER DEPOSIT',
  ],
  headerWithdraw: [ 
    'CERTIFIED BANGER',
  ],
  qr: [
    'SCAN ME (consent to bop)',
    'May cause head nodding',
    'Open responsibly'
  ],
  policyDeposit: [
    'ALL BANGER DEPOSITS',
    'NO REFUNDS. ONLY RERUNS.',
    'TERMS: VIBES ONLY'
  ],
  policyWithdraw: [
    'ALL WITHDRAWALS ARE FINAL',
    'HANDLE VIBES WITH CARE',
    'NO RETURNS AFTER CHORUS'
  ],
  footer: [
    'Certified heat by thermal paper',
    'Free coupon: 1 head nod',
    'Support your local DJ (it’s probably you)',
    `If lost, return this vibe to ${IG_HANDLE}`
  ]
};

// Helpers for ESC/POS text layout (3-inch ~ 32 chars width)
const LINE_WIDTH = 48; // Use wider width for full 80mm paper alignment
const HEADER_WIDTH = Math.floor(LINE_WIDTH / 2); // when using double-width for header
const toUpper = (s = '') => String(s).toUpperCase();
const pad = (s = '', n) => String(s).padEnd(n, ' ');
const twoCol = (left, right, total = LINE_WIDTH) => {
  const l = String(left);
  const r = String(right);
  const space = Math.max(1, total - l.length - r.length);
  return l + ' '.repeat(space) + r;
};
const wrapText = (text = '', width = LINE_WIDTH) => {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + (line ? ' ' : '') + w).length <= width) {
      line += (line ? ' ' : '') + w;
    } else {
      if (line) lines.push(line);
      // very long word fallback
      if (w.length > width) {
        for (let i = 0; i < w.length; i += width) {
          lines.push(w.slice(i, i + width));
        }
        line = '';
      } else {
        line = w;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
};
const msToMMSS = (ms) => {
  if (ms == null) return '';
  const totalSec = Math.round(Number(ms) / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
};

// Feed helper: ESC d n  -> print and feed n lines
const FEED = (n = 3) => `${ESC}d${String.fromCharCode(Math.max(0, Math.min(255, n)))}`;

// ===== Helper utilities =====
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function chance(p = 0.1) { return Math.random() < p; }
// function asciiSmall(v = 'v1.0') { return `== SONG SWAP ==\n==== ${v} ====\n\n`; }
function shortUrl(u) { return u && u.length > 36 ? u.slice(0, 33) + '...' : (u || ''); }
function pickFooter() { return pick(QUIPS.footer); }
function pickQrCaption() { return pick(QUIPS.qr); }
function pickPolicy(jobType) { return jobType === 'withdrawal' ? pick(QUIPS.policyWithdraw) : pick(QUIPS.policyDeposit); }

// ===== Image to ESC/POS raster helpers =====
function bytesToBinaryString(byteArray) {
  let result = '';
  for (let i = 0; i < byteArray.length; i += 1) {
    result += String.fromCharCode(byteArray[i]);
  }
  return result;
}

// Build GS v 0 raster bit image command from raw 1bpp data
function buildRasterImageCommand(bitmapBytesPerRow, height, rasterData, mode = 0) {
  const xL = bitmapBytesPerRow & 0xff;
  const xH = (bitmapBytesPerRow >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;
  const header = [0x1d, 0x76, 0x30, mode, xL, xH, yL, yH];
  const payload = new Uint8Array(header.length + rasterData.length);
  payload.set(header, 0);
  payload.set(rasterData, header.length);
  return bytesToBinaryString(payload);
}

// Load PNG, scale, threshold → raster ESC/POS string
async function buildLogoRasterString(imagePath, maxWidth = LOGO_MAX_WIDTH) {
  try {
    if (!fs.existsSync(imagePath)) return '';
    const image = await Jimp.read(imagePath);
    const targetWidth = Math.min(maxWidth, image.bitmap.width);
    image.resize(targetWidth, Jimp.AUTO).grayscale().contrast(0.3);
    const { width, height, data } = image.bitmap; // RGBA
    const bytesPerRow = Math.ceil(width / 8);
    const raster = new Uint8Array(bytesPerRow * height);
    const threshold = 0.5; // 0..1
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = (y * width + x) * 4;
        const r = data[idx] / 255;
        const g = data[idx + 1] / 255;
        const b = data[idx + 2] / 255;
        const a = data[idx + 3] / 255;
        // simple luminance; ignore alpha for paper
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const isBlack = (1 - lum) > threshold && a > 0.1;
        const byteIndex = y * bytesPerRow + (x >> 3);
        const bit = 7 - (x & 7);
        if (isBlack) {
          raster[byteIndex] |= (1 << bit);
        }
      }
    }
    return buildRasterImageCommand(bytesPerRow, height, raster, 0);
  } catch (e) {
    console.warn('⚠️ Logo rendering failed:', e.message);
    return '';
  }
}

// Convert Spotify URI to https URL for QR scanning
function spotifyUriToUrl(uri = '') {
  if (!uri) return '';
  if (uri.startsWith('spotify:track:')) {
    const id = uri.split(':')[2];
    return `https://open.spotify.com/track/${id}`;
  }
  if (uri.startsWith('spotify:album:')) {
    const id = uri.split(':')[2];
    return `https://open.spotify.com/album/${id}`;
  }
  if (uri.startsWith('spotify:artist:')) {
    const id = uri.split(':')[2];
    return `https://open.spotify.com/artist/${id}`;
  }
  // Fallback to original if already a URL or unsupported
  return uri;
}

// Build Epson ESC/POS QR code string (Model 2, configurable size & EC)
function buildEpsonQR(data, moduleSize = 5, ecLevel = '1') {
  // data as binary string
  const payload = Buffer.from(String(data), 'utf8').toString('binary');
  const pL = String.fromCharCode((payload.length + 3) & 0xff);
  const pH = String.fromCharCode(((payload.length + 3) >> 8) & 0xff);
  // Model: GS ( k 4 0 49 65 50 0  (Model 2)
  const model = `${GS}(k\x04\x00\x31\x41\x32\x00`;
  // Size:  GS ( k 3 0 49 67 n
  const size = `${GS}(k\x03\x00\x31\x43${String.fromCharCode(moduleSize)}`;
  // EC:    GS ( k 3 0 49 69 n  (n='0'..'3')
  const ec = `${GS}(k\x03\x00\x31\x45${ecLevel}`;
  // Store: GS ( k pL pH 49 80 48 data
  const store = `${GS}(k${pL}${pH}\x31\x50\x30${payload}`;
  // Print: GS ( k 3 0 49 81 48
  const print = `${GS}(k\x03\x00\x31\x51\x30`;
  return model + size + ec + store + print;
}

// Generate HTML receipt preview
function generateReceiptHTML() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Receipt Preview</title>
    <style>
        body {
            font-family: monospace;
            background: #f0f0f0;
            margin: 20px;
            display: flex;
            justify-content: center;
        }
        .receipt {
            background: white;
            width: 384px;
            min-height: 600px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            text-align: center;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
        }
        .subtitle {
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0;
        }
        .date {
            font-size: 14px;
            margin: 20px 0;
        }
        .separator {
            font-size: 12px;
            margin: 15px 0;
            color: #666;
        }
        .section-header {
            font-size: 16px;
            font-weight: bold;
            margin: 15px 0;
        }
        .location {
            font-size: 12px;
            text-align: left;
            margin: 10px 0;
        }
        .message {
            font-size: 12px;
            margin: 20px 0;
        }
        .thank-you {
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="title">🎵 SONG SWAP 🎵</div>
        <div class="subtitle">v 1.0 Gallery Test</div>
        <div class="date">August 10, 2025</div>
        
        <div class="separator">================================</div>
        <div class="section-header">GALLERY INFORMATION</div>
        <div class="separator">================================</div>
        
        <div class="location">Location: 45 E 20th St</div>
        <div class="location">New York, NY 10011</div>
        <div class="location">Verci, 12th Floor</div>
        
        <div class="message">See you there :D</div>
        
        <div class="separator">================================</div>
        <div class="thank-you">THANK YOU!</div>
        <div class="separator">================================</div>
    </div>
</body>
</html>`;
  
  return html;
}

// Test print function
async function testPrint() {
  console.log('🧪 TESTING THERMAL PRINTER...');

  const lines = [];

  lines.push(
    ESC + '2', // Initialize printer
    ALIGN_CENTER,
    DOUBLE_SIZE + BOLD_ON,
    '\n\n\nv 1.0 Gallery Test\n\n\n',
    
    NORMAL_SIZE + BOLD_OFF,
    'August 10, 2025\n\n',
    '='.repeat(32) + '\n',
    'GALLERY INFORMATION\n',
    '='.repeat(32) + '\n\n',
    ALIGN_LEFT,
    'Location: 45 E 20th St\n',
    'New York, NY 10011\n',
    'Verci, 12th Floor\n\n',
    'See you there :D\n\n',
    ALIGN_CENTER,
    '='.repeat(32) + '\n',
    'THANK YOU!\n\n\n\n\n',
    '='.repeat(32) + '\n\n\n',
    CUT_SIMPLE  // Try simple cut command
  );

  const receiptBuffer = Buffer.from(lines.join(''), 'binary');

  try {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filename = `test_receipt_${Date.now()}.txt`;
    const filepath = path.join(tempDir, filename);
    
    // Add hex debugging to see the actual bytes being sent
    console.log('🔍 Receipt buffer (hex):', receiptBuffer.toString('hex'));
    fs.writeFileSync(filepath, receiptBuffer);

    console.log('📄 Test receipt created at:', filepath);

    // Try available printer names
    const possiblePrinters = [
      "EPSON_TM_T20III",
      "Epson_TM_T20III",
      "TM-T20III",
      "TM-T20",
      "Epson"
    ];

    let printCommand = '';
    let printerFound = false;

    for (const printerName of possiblePrinters) {
      try {
        const { execSync } = require('child_process');
        execSync(`lpstat -p "${printerName}"`, { stdio: 'pipe' });

        // ✅ Use lp -d -o raw for ESC/POS commands to work
        printCommand = `lp -d "${printerName}" -o raw "${filepath}"`;
        printerFound = true;
        console.log(`✅ Found printer: ${printerName}`);
        break;
      } catch (error) {
        console.log(`❌ Printer ${printerName} not found`);
      }
    }

    if (!printerFound) {
      // ✅ Use lp -o raw for fallback too
      printCommand = `lp -o raw "${filepath}"`;
      console.log('🖨️ Using default printer');
    }

    console.log('🖨️ Executing print command:', printCommand);
    exec(printCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Print error:', error);
        console.error('❌ stderr:', stderr);
        return;
      }

      console.log('✅ Test print sent!');
      console.log('📄 stdout:', stdout);

      setTimeout(() => {
        try {
          fs.unlinkSync(filepath);
          console.log('🧹 Temp file cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ Cleanup error:', cleanupError.message);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('❌ Test print failed:', error);
  }
}

// Function to create p5.js card and print
async function createAndPrintCard(printJob) {
  try {
    // Handle different data structures
    let depositedSong, receivedSong;
    
    if (printJob.depositedSong && printJob.receivedSong) {
      // New format
      depositedSong = printJob.depositedSong;
      receivedSong = printJob.receivedSong;
    } else if (printJob.deposited && printJob.received) {
      // Alternative format
      depositedSong = printJob.deposited;
      receivedSong = printJob.received;
    } else if (printJob.type === 'withdrawal' && printJob.receivedSong) {
      receivedSong = printJob.receivedSong;
    } else {
      // Fallback - just log whatever we got
      console.log('🎵 JOB RECEIVED! (Unknown format)');
      console.log('Print job data:', printJob);
      console.log('---');
      return;
    }

    // If withdrawal-only job, render the withdrawal slip
    if (printJob.type === 'withdrawal' && receivedSong) {
      const depNum = receivedSong.depositNumber != null
        ? String(receivedSong.depositNumber).padStart(3, '0')
        : '—';
      const sender = receivedSong.submittedByName || 'UNKNOWN USER';
      const title = receivedSong.title || '';
      const artist = receivedSong.artist || '';
      const duration = msToMMSS(receivedSong.duration);
      const genre = receivedSong.genre || '';
      const note = receivedSong.recommendation || '';

      const lines = [];
      lines.push(
        INIT,
        ESC + '2',
        ALIGN_LEFT,
        FONT_A,
        NORMAL_SIZE,
        FEED(2)
      );

      // Optional ASCII banner before header
      if (ENABLE_ASCII && chance(RARE_ASCII_ODDS)) {
        lines.push(ALIGN_CENTER, asciiSmall(BUILD_VERSION), ALIGN_LEFT);
      }

      // Optional logo at top
      if (ENABLE_LOGO) {
        try {
          const logoStr = await buildLogoRasterString(LOGO_PATH);
          if (logoStr) {
            lines.push(ALIGN_CENTER, logoStr, ALIGN_LEFT, '\n');
          }
        } catch (e) {
          console.warn('⚠️ Failed to add logo (withdrawal):', e.message);
        }
      }

      // Header
      const headerTextW = pick(QUIPS.headerWithdraw);
      lines.push(
        DOUBLE_WIDTH,
        toUpper(twoCol(headerTextW, depNum, HEADER_WIDTH)) + '\n',
        NORMAL_SIZE,
        '\n'
      );

      // Body
      lines.push(
        BOLD_ON + toUpper('RECOMMENDED BY:') + BOLD_OFF + '\n',
        toUpper(wrapText(sender).join('\n')) + '\n' + '\n',
        BOLD_ON + toUpper(twoCol('SONG', 'DURATION', LINE_WIDTH)) + BOLD_OFF + '\n',
        toUpper(twoCol(title, duration, LINE_WIDTH)) + '\n',
        toUpper('BY ' + artist) + '\n' + '\n',
        BOLD_ON + toUpper('GENRE:') + BOLD_OFF + ' ' + toUpper(genre) + '\n' + '\n',
        BOLD_ON + toUpper('NOTE FROM SENDER') + BOLD_OFF + '\n'
      );
      wrapText(toUpper(note)).forEach(l => lines.push(l + '\n'));

      // QR caption + short URL, then QR
      const songUrlW = spotifyUriToUrl(receivedSong.uri || '');
      lines.push(ALIGN_CENTER, buildEpsonQR(songUrlW), ALIGN_LEFT, '\n');

      // IG follow block
      // if (ENABLE_IG_QR) {
      //   lines.push(ALIGN_CENTER, toUpper(`FOLLOW ${IG_HANDLE}`) + '\n');
      //   lines.push(ALIGN_CENTER, buildEpsonQR(IG_URL, 4), ALIGN_LEFT, '\n');
      // }

      // Policy + footer + version/date
      const policyW = pickPolicy('withdrawal');
      lines.push(ALIGN_CENTER, toUpper(policyW) + '\n');
      lines.push(ALIGN_CENTER, pickFooter() + '\n');
      lines.push(ALIGN_CENTER, `${BUILD_VERSION} • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}` + '\n');

      // Thank you and cut
      lines.push('\n', ALIGN_CENTER, toUpper('THANK YOU') + '\n', toUpper('COME AGAIN') + '\n');
      lines.push(ALIGN_CENTER, toUpper(`COURTESY OF ${IG_HANDLE}`) + '\n');
      lines.push(ALIGN_CENTER, toUpper('DM FOR MORE BANGERS') + '\n');
      lines.push(FEED(2), INIT, FULL_CUT_N3);

      const receiptBuffer = Buffer.from(lines.join(''), 'binary');
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      const filename = `withdrawal_${Date.now()}.txt`;
      const filepath = path.join(tempDir, filename);
      fs.writeFileSync(filepath, receiptBuffer);

      const possiblePrinters = ['EPSON_TM_T20III','Epson_TM_T20III','TM-T20III','TM-T20','Epson'];
      let printCommand = '';
      let printerFound = false;
      for (const printerName of possiblePrinters) {
        try {
          const { execSync } = require('child_process');
          execSync(`lpstat -p "${printerName}"`, { stdio: 'pipe' });
          printCommand = `lp -d "${printerName}" -o raw "${filepath}"`;
          printerFound = true;
          break;
        } catch (e) {}
      }
      if (!printerFound) printCommand = `lp -o raw "${filepath}"`;
      console.log('🖨️ Executing print command:', printCommand);
      exec(printCommand, (error) => {
        if (error) return console.error('❌ Print error:', error);
        setTimeout(() => { try { fs.unlinkSync(filepath); } catch {} }, 5000);
      });
      return;
    }

    // Build a DEPOSIT SLIP only (per mock)
    const depNum = depositedSong.depositNumber != null
      ? String(depositedSong.depositNumber).padStart(3, '0')
      : '—';
    const depositor = depositedSong.submittedByName || depositedSong.spotifyUsername || 'GUEST USER';
    const title = depositedSong.title || '';
    const artist = depositedSong.artist || '';
    const duration = msToMMSS(depositedSong.duration);
    const genre = depositedSong.genre || '';
    const note = depositedSong.recommendation || '';

    const lines = [];
    lines.push(
      INIT, // hard init
      ESC + '2', // set line spacing default
      ALIGN_LEFT,
      FONT_A, // ensure wider, standard font
      NORMAL_SIZE,
      // Top feed to match bottom
      FEED(2)
    );

    // Optional ASCII banner before header
    if (ENABLE_ASCII && chance(RARE_ASCII_ODDS)) {
      lines.push(ALIGN_CENTER, asciiSmall(BUILD_VERSION), ALIGN_LEFT);
    }

    // Optional logo at top
    if (ENABLE_LOGO) {
      try {
        const logoStr = await buildLogoRasterString(LOGO_PATH);
        if (logoStr) {
          lines.push(ALIGN_CENTER, logoStr, ALIGN_LEFT, '\n');
        }
      } catch (e) {
        console.warn('⚠️ Failed to add logo (deposit):', e.message);
      }
    }

    // Header row in double width so it visually spans 80mm better
    const headerTextD = pick(QUIPS.headerDeposit);
    lines.push(
      DOUBLE_WIDTH,
      toUpper(twoCol(headerTextD, depNum, HEADER_WIDTH)) + '\n',
      NORMAL_SIZE,
      '\n'
    );

    // Deposited by
    lines.push(
      BOLD_ON + toUpper('DEPOSITED BY:') + BOLD_OFF + '\n',
      toUpper(wrapText(depositor).join('\n')) + '\n' + '\n',
      // Song and duration header
      BOLD_ON + toUpper(twoCol('SONG', 'DURATION', LINE_WIDTH)) + BOLD_OFF + '\n',
      // Title & duration
      toUpper(twoCol(title, duration, LINE_WIDTH)) + '\n',
      toUpper('BY ' + artist) + '\n' + '\n',
      // Genre
      BOLD_ON + toUpper('GENRE:') + BOLD_OFF + ' ' + toUpper(genre) + '\n' + '\n',
      // Note
      BOLD_ON + toUpper('DEPOSIT NOTE') + BOLD_OFF + '\n'
    );
    wrapText(toUpper(note)).forEach(l => lines.push(l + '\n'));

    // QR caption + short URL, then QR
    const songUrlD = spotifyUriToUrl(depositedSong.uri || '');
    lines.push(ALIGN_CENTER, toUpper(pickQrCaption()) + '\n');
    lines.push(ALIGN_CENTER, buildEpsonQR(songUrlD), ALIGN_LEFT, '\n');

    // IG follow block
    if (ENABLE_IG_QR) {
      lines.push(ALIGN_CENTER, toUpper(`FOLLOW ${IG_HANDLE}`) + '\n');
      lines.push(ALIGN_CENTER, buildEpsonQR(IG_URL, 4), ALIGN_LEFT, '\n');
    }

    // Policy + footer + version/date
    const policyD = pickPolicy('deposit');
    lines.push(ALIGN_CENTER, toUpper(policyD) + '\n');
    lines.push(ALIGN_CENTER, pickFooter() + '\n');
    lines.push(ALIGN_CENTER, `${BUILD_VERSION} • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}` + '\n');

    // Thank you and cut
    lines.push('\n', ALIGN_CENTER, toUpper('THANK YOU') + '\n', toUpper('COME AGAIN') + '\n');
    lines.push(ALIGN_CENTER, toUpper(`COURTESY OF ${IG_HANDLE}`) + '\n');
    lines.push(ALIGN_CENTER, toUpper('DM FOR MORE BANGERS') + '\n');
    // Ensure space before cut, re-init to clear modes, then single Epson cut with built-in feed
    lines.push(FEED(2), INIT, FULL_CUT_N3);

    // Convert to Buffer
    const receiptBuffer = Buffer.from(lines.join(''), 'binary');

    // Save temp file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const filename = `deposit_${Date.now()}.txt`;
    const filepath = path.join(tempDir, filename);
    console.log('🔍 Deposit buffer (hex):', receiptBuffer.toString('hex'));
    fs.writeFileSync(filepath, receiptBuffer);

    console.log('📄 Deposit slip created at:', filepath);

    // Print using lp -o raw so ESC/POS commands work
    const possiblePrinters = [
      'EPSON_TM_T20III', 'Epson_TM_T20III', 'TM-T20III', 'TM-T20', 'Epson'
    ];

    let printCommand = '';
    let printerFound = false;

    for (const printerName of possiblePrinters) {
      try {
        const { execSync } = require('child_process');
        execSync(`lpstat -p "${printerName}"`, { stdio: 'pipe' });
        printCommand = `lp -d "${printerName}" -o raw "${filepath}"`;
        printerFound = true;
        console.log(`✅ Found printer: ${printerName}`);
        break;
      } catch (e) {
        console.log(`❌ Printer ${printerName} not found`);
      }
    }

    if (!printerFound) {
      printCommand = `lp -o raw "${filepath}"`;
      console.log('🖨️ Using default printer');
    }

    console.log('🖨️ Executing print command:', printCommand);
    exec(printCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Print error:', error);
        console.error('❌ stderr:', stderr);
        return;
      }
      console.log('✅ Deposit slip sent!');
      console.log('📄 stdout:', stdout);
      setTimeout(() => {
        try {
          fs.unlinkSync(filepath);
          console.log('🧹 Temp file cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ Cleanup error:', cleanupError.message);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('Error creating print card:', error);
  }
}

// Main function to handle the script flow
async function main() {
  // Only start the monitor if NOT in test mode
  console.log('🖨️ Starting Song Swap Print Monitor...');
  console.log('📡 Listening for print jobs in Firebase...');
  console.log(`🔧 Debug mode: ${DEBUG_MODE ? 'ON' : 'OFF'}`);

  const printJobsRef = collection(db, 'printJobs');
  const q = query(printJobsRef, orderBy('timestamp', 'desc'), limit(10));

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const printJob = change.doc.data();
        const jobId = change.doc.id;
        
        // Avoid processing the same job multiple times
        if (!processedJobs.has(jobId) && printJob.status === 'pending') {
          processedJobs.add(jobId);
          
          console.log('🎵 New print job detected:', printJob?.depositedSong?.title || printJob?.receivedSong?.title);
          
          // Update status to processing
          await updateDoc(doc(db, 'printJobs', jobId), {
            status: 'processing'
          });
          
          // Create and print the card
          await createAndPrintCard(printJob);
          
          // Update status to completed
          await updateDoc(doc(db, 'printJobs', jobId), {
            status: 'completed',
            completedAt: new Date()
          });
        }
      }
    });
  }, (error) => {
    console.error('Firebase listener error:', error);
  });

  console.log('✅ Print monitor is running. Press Ctrl+C to stop.');
}

// Check command line arguments and run appropriate mode
const args = process.argv.slice(2);
console.log('🔍 Command line arguments:', args);

if (args.includes('--image') || args.includes('-i')) {
  console.log('🖼️ HTML PREVIEW MODE: Generating receipt preview...');
  
  try {
    const html = generateReceiptHTML();
    const htmlFile = path.join(__dirname, 'temp', 'receipt_preview.html');
    
    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, 'temp'))) {
      fs.mkdirSync(path.join(__dirname, 'temp'));
    }
    
    fs.writeFileSync(htmlFile, html);
    console.log('🖼️ Receipt preview saved to:', htmlFile);
    console.log('📏 Preview size: 384px width (3-inch thermal paper width)');
    console.log('💡 Open the HTML file in your browser to see how the receipt will look when printed!');
    console.log('🌐 Or run: open temp/receipt_preview.html');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate HTML preview:', error);
    process.exit(1);
  }
} else if (args.includes('--test') || args.includes('-t')) {
  console.log('🧪 TEST MODE: Running test print only...');
  testPrint().then(() => {
    console.log('✅ Test print completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Test print failed:', error);
    process.exit(1);
  });
} else {
  console.log('🖨️ MONITOR MODE: Starting print monitor...');
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}