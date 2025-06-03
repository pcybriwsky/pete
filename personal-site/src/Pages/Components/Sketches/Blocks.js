import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Blocks = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // Sketch-specific variables
  let padding;
  let inc;
  let noiseTexture;
  let currentPaletteName = '';
  let showPaletteName = false;
  let paletteIndex = 0;
  let mode = 'random'; // 'random', 'mouse', or 'device'
  let maxHeight = 1000; // Maximum height for blocks
  let mouseInfluenceRadius = 1000; // How far the mouse influence extends
  let border = false;
  let noise = false;
  let outlineMode = false;
  let whiteFill = false;
  // Extended palette structure
  const palettes = {
    sunset: {"Melon":"ffa69e","Eggshell":"faf3dd","Celeste":"b8f2e6","Light blue":"aed9e0","Payne's gray":"5e6472"},
    forest: {"Forest Green":"2c5530","Sage":"7d9b76","Cream":"f7e1d7","Moss":"4a5759","Deep Green":"053225"},
    ocean: {"Deep Blue":"003b4f","Turquoise":"38a2ac","Aqua":"7cd7d7","Sky":"b4e7e7","Sand":"fff1d9"},
    desert: {"Terracotta":"cd5f34","Sand":"e6c79c","Dusty Rose":"d4a5a5","Sage":"9cae9c","Brown":"6e4c4b"},
    berry: {"Purple":"4a1942","Magenta":"893168","Pink":"c4547d","Light Pink":"e8a1b3","Cream":"ead7d7"},
    // New palettes
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
  let currentPalette;
  let colors = [];

  let isCapturingGif = false;
  let originalWidth, originalHeight;

  let targetX = 0;
  let targetY = 0;
  let randomPalettePerBlock = false;
  let topPalette = null; // Add this variable to store the top face palette

  let isPrintMode = false;
  let printWidth = 1275;  // 4.25" at 300 DPI
  let printHeight = 1650; // 5.5" at 300 DPI

  // Mobile UI variables
  let showMobileMenu = false;
  let mobileMenuX = 20;
  let mobileMenuY = 20;
  let isDragging = false;
  let lastTouchX = 0;
  let lastTouchY = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouchMode = false;

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
  
  const drawBorder = () => {
    p.push();
    p.noFill();
    p.stroke(p.color(colors[0]));
    p.strokeWeight(p.width/10);
    if(randomPalettePerBlock) {
      p.stroke(p.color(topPalette[0]));
    }
    if(outlineMode) {
      p.stroke('white');
    }
    p.rect(0, 0, p.width, p.height);
    p.pop();
  };

  const generateNoiseTexture = () => {
    noiseTexture.loadPixels();
    // Iterate through each pixel (x, y)
    for (let y = 0; y < noiseTexture.height; y++) {
        for (let x = 0; x < noiseTexture.width; x++) {
            // Calculate index for the pixel array (R, G, B, A)
            let index = (x + y * noiseTexture.width) * 4;
            // Generate a random gray value
            const noiseValue = p.random(180, 255);
            // Generate a random alpha value (0-255 for texture buffer)
            const alphaValue = p.random(25, 55);

            noiseTexture.pixels[index] = noiseValue;     // R
            noiseTexture.pixels[index + 1] = noiseValue; // G
            noiseTexture.pixels[index + 2] = noiseValue; // B
            noiseTexture.pixels[index + 3] = alphaValue; // A
        }
    }
    noiseTexture.updatePixels();
    console.log("Generated Noise Texture");
};

  p.setup = () => {
    let fr = 15;
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.RGB, 255, 255, 255, 1);
    p.clear();
    p.strokeWeight(2);
    p.frameRate(fr);
    p.textFont('Arial');

    // Check if we're on mobile
    isTouchMode = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();    
    selectRandomPalette();
    
    console.log("Blocks setup complete. Click to connect magic. Press 'r' to change palette, 'm' to toggle mode.");
    blockMaxSize = 200 * scale;
    // p.noLoop(); // Uncomment if the sketch should not loop automatically
  };

  let uniform = false;
  let blockMaxSize = 600;
  let heightMultiplier = 1;
  p.draw = () => {
    p.clear();
    
    padding = p.max(p.width * 1.25, p.height * 1.25);
    inc = blockMaxSize * scale;
    
    let newInc = inc
    for (let x = -padding; x < p.width + padding; x += inc) {
      if(uniform) {
        p.push();
        p.randomSeed(x);
        newInc = p.random(inc * 1, inc * 3);
        p.pop();
      }
      for (let y = -padding; y < p.height + padding; y += newInc) {
        let multiplier = 1000;
        let frameMultiplier = 0.0005;
        let nX, nY;
        
        if (mode === 'random') {
          nX = multiplier * p.noise(x, y, p.frameCount*frameMultiplier);
          nY = multiplier * p.noise(y + x, x, p.frameCount*frameMultiplier + 100);
        } else {
          nX = 0;
          nY = 0;
        }
        
        let newX = x + nX;
        let newY = y + nY;
        drawIsoMetricBlock(newX, newY, newInc, frameMultiplier);
      }
    }

    if (isMagic && magic.modules.imu?.orientation) {
      let rotationX = magic.modules.imu.orientation.x;
    }
    if (isMagic && magic.modules.joystick) {
      let joystick = magic.modules.joystick;
      let x = joystick.raw.x;
      let y = joystick.raw.y;
    }

    if(border) {
      console.log("Drawing border");
      drawBorder();
    }
    if(noise) {
      p.image(noiseTexture, 0, 0);
    }
    if (showPaletteName) {
      drawBanner();
    }

    if (isTouchMode) {
      drawTouchArea();
    }
    if (showMobileMenu) {
      drawMobileMenu();
    }
  };

  const calculateHeight = (x, y, frameMultiplier, inc) => {
    if (mode === 'random') {
      return p.noise(x * 0.0001, y * frameMultiplier * 10, p.frameCount * frameMultiplier * 10) * maxHeight * heightMultiplier;
    } else {
      // --- Device or Mouse Mode: Use IMU if connected, else fallback to mouse ---
      let ease = 0.000030 * scale
      if (mode === 'device') {
        if (isMagic && magic.modules.imu?.orientation) {
          let invertX = 1;
          let invertY = 1;
          let rotW = magic.modules.imu.orientation.w * invertX;
          let rotY = magic.modules.imu.orientation.y * invertY;
          targetX = targetX * (1 - ease) + p.map(-rotW, -0.3, 0.3, 0, p.width, true) * ease;
          targetY = targetY * (1 - ease) + p.map(-rotY, -0.3, 0.3, 0, p.height, true) * ease;
        } else {
          targetX = targetX * (1 - ease) + p.mouseX * ease;
          targetY = targetY * (1 - ease) + p.mouseY * ease;
        }
      } else {
        // Mouse mode
        targetX = targetX * (1 - ease) + p.mouseX * ease;
        targetY = targetY * (1 - ease) + p.mouseY * ease;
      }
      // Convert target position to isometric grid space
      let centerX = p.width / 2;
      let centerY = p.height / 2;
      let mx = targetX;
      let my = targetY;
      let gridX = ((mx - centerX) / 0.5 + (my - centerY) / 0.25) / 2;
      let gridY = ((my - centerY) / 0.25 - (mx - centerX) / 0.5) / 2;
      let dx = x - gridX;
      let dy = y - gridY;
      let distance = p.sqrt(dx * dx + dy * dy);
      let proximity = p.map(distance, 0, mouseInfluenceRadius * scale, 1, 0, true);
      return proximity * maxHeight * heightMultiplier * scale;
    }
  };

  const drawIsoMetricBlock = (x, y, blockSize, frameMultiplier) => {
    let h = calculateHeight(x, y, frameMultiplier, inc * heightMultiplier);
    let currentColors = colors; // Store current colors for sides
    
    if (randomPalettePerBlock) {
      p.push();
      p.randomSeed(x + y);
      selectRandomPalette();
      currentColors = colors; // Store the random palette colors for sides
      p.pop();
    }

    let isoX = (x - y) * 0.5;
    let isoY = (x + y) * 0.25;

    p.push();
    p.translate(p.width / 2, p.height / 2);
    
    // Bottom face points (unchanged)
    let bottom = p.createVector(isoX, isoY);
    let rightBottom = p.createVector(isoX + blockSize * 0.5, isoY - blockSize * 0.25);
    let leftBottom = p.createVector(isoX - blockSize * 0.5, isoY - blockSize * 0.25);

    // Top face points (adjusted for height)
    let top = p.createVector(isoX, isoY - h - (mode === 'random' ? blockSize * 0.5 : 0));
    let rightTop = p.createVector(isoX + blockSize * 0.5, isoY - blockSize * 0.25 - h - (mode === 'random' ? blockSize * 0.5 : 0));
    let leftTop = p.createVector(isoX - blockSize * 0.5, isoY - blockSize * 0.25 - h - (mode === 'random' ? blockSize * 0.5 : 0));
    let bottomTop = p.createVector(isoX, isoY - blockSize * 0.5 - h - (mode === 'random' ? blockSize * 0.5 : 0));

    // Use top palette colors for top face and stroke
    if(outlineMode) {
      let strokeWeight = p.map(blockSize, 100, blockMaxSize*scale, 1, 5, true);
      p.strokeWeight(strokeWeight);
      p.strokeJoin(p.ROUND);
      p.strokeCap(p.SQUARE);
    }
    p.stroke(p.color(colors[4])); // Use the darkest color for outline
    p.fill(p.color(colors[0])); // Use first color for top face
    if(randomPalettePerBlock) {
      p.fill(p.color(topPalette[0]));
      p.stroke(p.color(topPalette[4]));
    }
    if(outlineMode) {
      p.stroke(p.color(colors[0]));
      p.noFill();
      if(whiteFill) {
        p.fill(255);
      }
    }

    
    p.quad(top.x, top.y,
           rightTop.x, rightTop.y,
           bottomTop.x, bottomTop.y,
           leftTop.x, leftTop.y);

    // Left face - use second color from current palette
    p.fill(p.color(currentColors[1]));
    if(outlineMode) {
      p.stroke(p.color(currentColors[1]));
      p.noFill();
      p.fill(255);
    }
    p.quad(leftTop.x, leftTop.y,
           leftBottom.x, leftBottom.y,
           bottom.x, bottom.y,
           top.x, top.y);

    // Right face - use third color from current palette
    p.fill(p.color(currentColors[2]));
    if(outlineMode) {
      p.stroke(p.color(currentColors[2]));
      p.noFill();
      if(whiteFill) {
        p.fill(255);
      }
    }
    p.quad(rightTop.x, rightTop.y,
           rightBottom.x, rightBottom.y,
           bottom.x, bottom.y,
           top.x, top.y);
    p.pop();
  };

  // Handles connecting to the magic device on key press 'd'
  async function connectMagicDevice() {
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
      console.log("Sketch interaction key.");
    }
  }

  // Remove device connect from mousePressed
  p.mousePressed = () => {
    // Optional: Add logic for clicks when not in dev mode (e.g., interacting with the sketch)
    console.log("Sketch interaction click.");
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
  };

  // Add key press handler for palette changes
  let scale = 1;
  p.keyPressed = () => {
    if (p.key === 'h' || p.key === 'H') {
      heightMultiplier = p.random(0.2, 1);
    }
    if (p.key === 'd' || p.key === 'D') {
      connectMagicDevice();
    }
    if (p.key === 's' || p.key === 'S') {
      p.saveCanvas('blocks-capture', 'png');
    }
    if (p.key === 'g' || p.key === 'G') {
      if (typeof p.saveGif === 'function' && !isCapturingGif) {
        isCapturingGif = true;
        originalWidth = p.width;
        originalHeight = p.height;
        scale = 0.5; // 50% size
        p.resizeCanvas(originalWidth * scale, originalHeight * scale);
        p.saveGif('blocks-animation', 8, () => {
          // Restore canvas size after GIF is saved
          p.resizeCanvas(originalWidth, originalHeight);
          isCapturingGif = false;
        });
      }
    }
    if (p.key === 'b' || p.key === 'B') {
      blockMaxSize = p.random(100, 600);
    }
    if (p.key === 'r' || p.key === 'R') {
      selectRandomPalette();
    }
    if (p.key === 'c' || p.key === 'C') {
      randomPalettePerBlock = !randomPalettePerBlock;
      if (randomPalettePerBlock) {
        topPalette = {...currentPalette};
        colors = Object.values(topPalette).map(c => c.startsWith('#') ? c : `#${c}`);
        topPalette = colors;
      }
    }
    if (p.key === 'a' || p.key === 'A') {
      mouseInfluenceRadius = p.random(500, 1000);
    }
    if (p.key === 'p' || p.key === 'P') {

      // Shift + P for print export
      exportPrint();
      // } else {
      //   // Regular P for palette name toggle
      //   showPaletteName = !showPaletteName;
      // }
    }
    if (p.key === 'm' || p.key === 'M') {
      // Cycle through modes: random -> mouse -> device -> random ...
      if (mode === 'random') {
        mode = 'mouse';
      } else if (mode === 'mouse') {
        mode = 'device';
      } else {
        mode = 'random';
      }
      console.log(`Mode changed to: ${mode}`);
    }
    if (p.keyCode === p.UP_ARROW) {
      selectPaletteByIndex(paletteIndex + 1);
    }
    if (p.keyCode === p.DOWN_ARROW) {
      selectPaletteByIndex(paletteIndex - 1);
    }
    if (p.key === 'n' || p.key === 'N') {
      noise = !noise;
    }
    if (p.key === 'k' || p.key === 'K' || p.key === 'j' || p.key === 'J') {
      border = !border;
    }
    if (p.key === 'u' || p.key === 'U') {
      uniform = !uniform;
      console.log('Uniform mode:', uniform);
    }
    if (p.key === 'o' || p.key === 'O') {
      outlineMode = !outlineMode;
    }
    if (p.key === 'w' || p.key === 'W') {
      whiteFill = !whiteFill;
    }
  };

  const exportPrint = () => {
    // Store original canvas size
    originalWidth = p.width;
    originalHeight = p.height;
    
    // Generate filename with palette and date
    const date = new Date().toISOString().split('T')[0];
    const filename = `blocks-${currentPaletteName}-${date}`;
    
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

  // Add touch event handlers
  p.touchStarted = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      
      // Check if touch is in menu area
      if (touch.clientX < 100 && touch.clientY < 100) {
        showMobileMenu = !showMobileMenu;
        return false;
      }
      
      // Check if touch is in menu items
      if (showMobileMenu) {
        const menuItems = [
          { text: 'Toggle Outline', key: 'O', action: () => outlineMode = !outlineMode },
          { text: 'Toggle White Fill', key: 'W', action: () => whiteFill = !whiteFill },
          { text: 'Toggle Noise', key: 'N', action: () => noise = !noise },
          { text: 'Toggle Border', key: 'K', action: () => border = !border },
          { text: 'Toggle Uniform', key: 'U', action: () => uniform = !uniform },
          // { text: 'Export Print', key: 'P', action: () => exportPrint() },
          { text: 'Random Palette', key: 'R', action: () => selectRandomPalette() }
        ];
        
        let y = mobileMenuY + 40;
        for (let item of menuItems) {
          if (touch.clientY >= y && touch.clientY <= y + 30 &&
              touch.clientX >= mobileMenuX && touch.clientX <= mobileMenuX + 200) {
            item.action();
            return false;
          }
          y += 30;
        }
      }
      
      isDragging = true;
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      return false;
    }
    return false;
  };

  p.touchMoved = (e) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouchX;
      const dy = touch.clientY - lastTouchY;
      
      // Update mouse position for the sketch
      p.mouseX = touch.clientX;
      p.mouseY = touch.clientY;
      
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      return false;
    }
    return false;
  };

  p.touchEnded = () => {
    isDragging = false;
    return false;
  };

  // Add mobile menu drawing
  const drawMobileMenu = () => {
    if (!isTouchMode || !showMobileMenu) return;
    
    p.push();
    p.fill(255, 255, 255, 0.9);
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(mobileMenuX, mobileMenuY, 200, 300, 10);
    
    // Menu title
    p.fill(0);
    p.noStroke();
    p.textSize(16);
    p.textAlign(p.LEFT, p.TOP);
    p.text('Controls', mobileMenuX + 10, mobileMenuY + 10);
    
    // Menu items
    const menuItems = [
      { text: 'Toggle Outline', key: 'O', action: () => outlineMode = !outlineMode },
      { text: 'Toggle White Fill', key: 'W', action: () => whiteFill = !whiteFill },
      { text: 'Toggle Noise', key: 'N', action: () => noise = !noise },
      { text: 'Toggle Border', key: 'K', action: () => border = !border },
      { text: 'Toggle Uniform', key: 'U', action: () => uniform = !uniform },
      // { text: 'Export Print', key: 'P', action: () => exportPrint() },
      { text: 'Random Palette', key: 'R', action: () => selectRandomPalette() }
    ];
    
    let y = mobileMenuY + 40;
    menuItems.forEach(item => {
      p.fill(0);
      p.textSize(14);
      p.text(`${item.text} (${item.key})`, mobileMenuX + 10, y);
      y += 30;
    });
    
    p.pop();
  };

  // Add touch area indicator
  const drawTouchArea = () => {
    if (!isTouchMode) return;
    
    p.push();
    p.noFill();
    p.stroke(255, 255, 255, 0.3);
    p.strokeWeight(2);
    p.rect(0, 0, 100, 100);
    p.fill(255, 255, 255, 0.3);
    p.noStroke();
    p.ellipse(50, 50, 20, 20);
    p.pop();
  };

  // Optional: Add other p5.js event functions as needed
  // p.keyPressed = () => { ... }
};

// IMPORTANT: Rename 'Blocks' to match the filename PascalCase
export default Blocks; 