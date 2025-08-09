import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Twist = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // --- Sketch-specific variables and setup ---
  // Add any variables your sketch needs here
  let timeSeconds = 0;
  let noiseTexture;
  let shouldShowNoiseOverlay = true;
  let centerX = 0;
  let centerY = 0;
  let sketchRadius = 0;
  let numRadialLines = 140;
  let baseNoiseFrequency = 0.65; // frequency across angle space
  let timeNoiseSpeed = 0.15; // noise time evolution
  let maxAngleNoiseRadians = 0.65; // maximum angular deviation due to noise
  let maxLengthJitter = 0.18; // fraction of radius to vary length by noise
  let imuIntensitySmoothed = 0; // smoothed [0,1] intensity derived from IMU/mouse
  let imuSmoothingFactor = 0.12; // 0..1, higher = faster response
  let backgroundStyle = 'soft_offwhite_gradient';
  
  // Print mode variables
  let isPrintMode = false;
  let printWidth = 1275;  // 4.25" at 300 DPI
  let printHeight = 1650; // 5.5" at 300 DPI
  let originalWidth, originalHeight;

  // Palette variables
  let currentPaletteName = '';
  let showPaletteName = false;
  let paletteIndex = 0;
  let colors = [];
  let currentPalette;
  
  // Extended palette structure
  const palettes = {
    sunset: {"Melon":"ffa69e","Eggshell":"faf3dd","Celeste":"b8f2e6","Light blue":"aed9e0","Payne's gray":"5e6472"},
    forest: {"Forest Green":"2c5530","Sage":"7d9b76","Cream":"f7e1d7","Moss":"4a5759","Deep Green":"053225"},
    ocean: {"Deep Blue":"003b4f","Turquoise":"38a2ac","Aqua":"7cd7d7","Sky":"b4e7e7","Sand":"fff1d9"},
    desert: {"Terracotta":"cd5f34","Sand":"e6c79c","Dusty Rose":"d4a5a5","Sage":"9cae9c","Brown":"6e4c4b"},
    berry: {"Purple":"4a1942","Magenta":"893168","Pink":"c4547d","Light Pink":"e8a1b3","Cream":"ead7d7"},
    nordic: {"Frost":"e5e9f0","Polar":"eceff4","Arctic":"d8dee9","Glacier":"4c566a","Night":"2e3440"},
    autumn: {"Rust":"d35400","Amber":"f39c12","Gold":"f1c40f","Crimson":"c0392b","Burgundy":"7b241c"},
    spring: {"Blossom":"ffb6c1","Mint":"98ff98","Lavender":"e6e6fa","Peach":"ffdab9","Sage":"9cae9c"},
    sunset2: {"Coral":"ff7f50","Peach":"ffdab9","Lavender":"e6e6fa","Sky":"87ceeb","Night":"191970"},
    neon: {"Pink":"ff69b4","Cyan":"00ffff","Yellow":"ffff00","Purple":"9370db","Green":"32cd32"},
    pastel: {"Mint":"98ff98","Lavender":"e6e6fa","Peach":"ffdab9","Sky":"87ceeb","Rose":"ffb6c1"},
    jewel: {"Ruby":"e0115f","Sapphire":"0f52ba","Emerald":"50c878","Amethyst":"9966cc","Topaz":"ffc87c"},
    retro: {"Teal":"008080","Coral":"ff7f50","Mustard":"ffdb58","Mint":"98ff98","Lavender":"e6e6fa"},
    vintage: {"Sepia":"704214","Cream":"fffdd0","Sage":"9cae9c","Dusty Rose":"d4a5a5","Brown":"6e4c4b"},
    modern: {"Slate":"708090","Silver":"c0c0c0","Gray":"808080","Charcoal":"36454f","Black":"000000"},
    cyberpunk: {"Hot Pink":"ff007f","Electric Blue":"00eaff","Neon Yellow":"fff700","Deep Purple":"2d0036","Black":"0a0a0a"},
    noir: {"Jet":"343434","Charcoal":"232323","Ash":"bdbdbd","Ivory":"f6f6f6","Blood Red":"c3073f"},
    midnight: {"Midnight Blue":"191970","Deep Navy":"0a0a40","Steel":"7b8fa1","Moonlight":"e5e5e5","Violet":"8f00ff"},
    vaporwave: {"Vapor Pink":"ff71ce","Vapor Blue":"01cdfe","Vapor Purple":"b967ff","Vapor Yellow":"fffaa8","Vapor Black":"323232"},
    synthwave: {"Synth Pink":"ff3caa","Synth Blue":"29ffe3","Synth Orange":"ffb300","Synth Purple":"7c3cff","Synth Black":"1a1a2e"}
  };

  // Helper function to select palette by index
  const selectPaletteByIndex = (index) => {
    const paletteNames = Object.keys(palettes);
    // Ensure index stays within bounds
    if (index < 0) index = paletteNames.length - 1;
    if (index >= paletteNames.length) index = 0;
    
    const paletteName = paletteNames[index];
    currentPalette = palettes[paletteName];
    currentPaletteName = paletteName;
    colors = Object.values(currentPalette).map(c => c.startsWith('#') ? c : `#${c}`);
    paletteIndex = index;
  };

  // Helper function to select and shuffle palette
  const selectRandomPalette = () => {
    const paletteNames = Object.keys(palettes);
    const randomIndex = Math.floor(p.random(paletteNames.length));
    selectPaletteByIndex(randomIndex);
  };

  // Create a soft background gradient (ported from Gradient.js)
  const drawBackgroundGradient = () => {
    if (backgroundStyle === 'soft_offwhite_gradient') {
      p.push();
      const lightOffWhite = p.color(255, 252, 247);
      const slightlyDarkerOffWhite = p.color(248, 245, 240);
      let backgroundGradient = p.drawingContext.createLinearGradient(0, 0, 0, p.height);
      backgroundGradient.addColorStop(0, lightOffWhite);
      backgroundGradient.addColorStop(1, slightlyDarkerOffWhite);
      p.drawingContext.fillStyle = backgroundGradient;
      p.noStroke();
      p.rect(0, 0, p.width, p.height);
      p.pop();
    } else {
      p.clear();
    }
  };

  // Noise texture generation (ported from Gradient.js)
  const generateNoiseTexture = () => {
    if (!noiseTexture) return;
    noiseTexture.loadPixels();
    for (let y = 0; y < noiseTexture.height; y++) {
      for (let x = 0; x < noiseTexture.width; x++) {
        const index = (x + y * noiseTexture.width) * 4;
        const noiseValue = p.random(180, 255);
        const alphaValue = p.random(15, 90);
        noiseTexture.pixels[index] = noiseValue;
        noiseTexture.pixels[index + 1] = noiseValue;
        noiseTexture.pixels[index + 2] = noiseValue;
        noiseTexture.pixels[index + 3] = alphaValue;
      }
    }
    noiseTexture.updatePixels();
  };

  // Map IMU orientation to a 0..1 intensity for noise scaling
  const computeImuIntensity = () => {
    let rawIntensity = 0;
    if (isMagic && magic.modules.imu?.orientation) {
      // Use quaternion components similar to Gradient.js usage (y, w)
      const o = magic.modules.imu.orientation;
      // Sum of absolute tilt components, empirically mapped
      const tiltSum = Math.abs(o.y ?? 0) + Math.abs(o.w ?? 0) + Math.abs(o.x ?? 0) * 0.5;
      rawIntensity = p.constrain(p.map(tiltSum, 0.0, 1.2, 0.02, 1.0), 0, 1);
    } else {
      // Fallback: mouseX across the screen
      rawIntensity = p.constrain(p.map(p.mouseX, 0, p.width, 0.05, 0.9), 0, 1);
    }
    // Smooth intensity to reduce jitter
    imuIntensitySmoothed = p.lerp(imuIntensitySmoothed, rawIntensity, imuSmoothingFactor);
    return imuIntensitySmoothed;
  };

  // Helper to get a smoothly interpolated color across the palette for t in [0,1]
  const getPaletteColorAt = (t01) => {
    if (!colors || colors.length === 0) return p.color('#000000');
    if (colors.length === 1) return p.color(colors[0]);
    const scaled = p.constrain(t01, 0, 1) * (colors.length - 1);
    const idx = Math.floor(scaled);
    const nextIdx = Math.min(colors.length - 1, idx + 1);
    const localT = scaled - idx;
    const c1 = p.color(colors[idx]);
    const c2 = p.color(colors[nextIdx]);
    return p.lerpColor(c1, c2, localT);
  };

  const drawBanner = () => {
    p.push();
    p.fill(255, 255, 255, 0.9);
    p.noStroke();
    p.rect(0, 0, p.width, 40);
    p.fill(0);
    p.textSize(16);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(`Palette: ${currentPaletteName}`, 20, 20);
    p.pop();
  };

  const exportPrint = () => {
    // Store original canvas size
    originalWidth = p.width;
    originalHeight = p.height;
    
    // Generate filename with palette and date
    const date = new Date().toISOString().split('T')[0];
    const filename = `sketch-${currentPaletteName}-${date}`;
    
    // Resize canvas for print
    p.resizeCanvas(printWidth, printHeight);
    p.pixelDensity(1);
    
    // Redraw the sketch
    p.draw();
    
    // Save the file
    p.saveCanvas(filename, 'png');
    
    // Restore original canvas size
    p.resizeCanvas(originalWidth, originalHeight);
    p.pixelDensity(window.devicePixelRatio);
    
    console.log(`Print exported as: ${filename}.png`);
  };

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.RGB, 255, 255, 255, 1);
    p.background(255);
    p.strokeWeight(2);
    p.frameRate(30);
    p.textFont('Arial');
    centerX = p.width / 2;
    centerY = p.height / 2;
    sketchRadius = Math.min(p.width, p.height) * 0.47;
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
    
    // Initialize with a random palette
    selectRandomPalette();
    
    console.log("Twist setup complete. Click to connect magic.");
    console.log("Controls:");
    console.log("  R: Random palette");
    console.log("  Up/Down: Cycle palettes");
    console.log("  P: Export print");
    console.log("  P: Toggle palette name display");
    console.log("  N: Toggle noise overlay");
  };

  p.draw = () => {
    // Background
    drawBackgroundGradient();

    // Compute current intensity from IMU to scale noise influence
    const intensity01 = computeImuIntensity();
    const angleNoiseMax = maxAngleNoiseRadians * intensity01; // radians
    const lengthJitterMax = maxLengthJitter * intensity01; // fraction of radius

    // Draw straight lines that twist (angle perturbed by noise)
    p.push();
    p.translate(centerX, centerY);
    p.strokeWeight(1.4);
    p.noFill();

    for (let i = 0; i < numRadialLines; i++) {
      const t = i / (numRadialLines - 1);
      const baseAngle = t * p.TWO_PI;
      // Noise across angle and time
      const n = p.noise(baseAngle * baseNoiseFrequency, timeSeconds * timeNoiseSpeed);
      const angleOffset = (n - 0.5) * 2 * angleNoiseMax;
      const angle = baseAngle + angleOffset;
      // Length jitter
      const nLen = p.noise(100 + baseAngle * (baseNoiseFrequency * 0.75), 10 + timeSeconds * (timeNoiseSpeed * 0.85));
      const lengthFactor = 1.0 - (nLen * 2 - 1) * lengthJitterMax; // around 1.0
      const lineLength = sketchRadius * p.constrain(lengthFactor, 0.72, 1.1);

      // Color along the palette gradient
      const strokeColor = getPaletteColorAt(t);
      p.stroke(strokeColor);

      const x2 = Math.cos(angle) * lineLength;
      const y2 = Math.sin(angle) * lineLength;
      // Draw straight radial line from center
      p.line(0, 0, x2, y2);
    }
    p.pop();

    // Optional palette banner
    if (showPaletteName) drawBanner();

    // Overlay subtle paper noise texture
    if (shouldShowNoiseOverlay && noiseTexture) {
      p.push();
      p.blendMode(p.SCREEN);
      p.image(noiseTexture, 0, 0);
      p.pop();
    }

    timeSeconds += p.deltaTime / 1000;
  };

  // Handles connecting to the magic device on click
  p.mousePressed = async () => {
    if (isDevMode) {
      isDevMode = false;
      if (!isMagic) {
        try {
          await magic.connect({ mesh: false, auto: true });
          console.log("Magic connected. Modules:", magic.modules);
          isMagic = true;
        } catch (error) {
          console.error("Failed to connect magic:", error);
          isDevMode = true;
          return;
        }
      }
      if (!isDevMode) {
        p.loop();
      }
    } else {
      console.log("Sketch interaction click.");
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    centerX = p.width / 2;
    centerY = p.height / 2;
    sketchRadius = Math.min(p.width, p.height) * 0.47;
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
  };

  p.keyPressed = () => {
    if (p.key === 'r' || p.key === 'R') {
      selectRandomPalette();
    }
    if (p.keyCode === p.UP_ARROW) {
      selectPaletteByIndex(paletteIndex + 1);
    }
    if (p.keyCode === p.DOWN_ARROW) {
      selectPaletteByIndex(paletteIndex - 1);
    }
    if (p.key === 'p' || p.key === 'P') {
      if (p.keyIsDown(p.SHIFT)) {
        exportPrint();
      } else {
        showPaletteName = !showPaletteName;
      }
    }
    if (p.key === 'n' || p.key === 'N') {
      shouldShowNoiseOverlay = !shouldShowNoiseOverlay;
    }
  };
};

// IMPORTANT: Rename 'Twist' to match the filename PascalCase
export default Twist; 