import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const SketchTemplate = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // --- Sketch-specific variables and setup ---
  // Add any variables your sketch needs here
  
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
    p.clear();
    p.strokeWeight(2);
    p.frameRate(15);
    p.textFont('Arial');
    
    // Initialize with a random palette
    selectRandomPalette();
    
    console.log("SketchTemplate setup complete. Click to connect magic.");
    console.log("Controls:");
    console.log("  R: Random palette");
    console.log("  Up/Down: Cycle palettes");
    console.log("  P: Export print");
    console.log("  P: Toggle palette name display");
  };

  p.draw = () => {
    // --- Main sketch drawing logic ---
    p.clear();
    
    // Add your drawing code here
    // Example: p.ellipse(p.width / 2, p.height / 2, 50, 50);

    // Example of using magic data if connected
    if (isMagic && magic.modules.imu?.orientation) {
      let rotationX = magic.modules.imu.orientation.x;
      // Use rotationX or other magic data in your sketch
    } else {
       // Logic for when magic is not connected (e.g., use mouse)
       // let rotationX = p.map(p.mouseX, 0, p.width, -1, 1);
    }

    // Show palette name if enabled
    if (showPaletteName) {
      drawBanner();
    }
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
  };
};

// IMPORTANT: Rename 'SketchTemplate' to match the filename PascalCase
export default SketchTemplate; 