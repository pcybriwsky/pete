import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Hearts = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // --- Sketch-specific variables and setup ---
  let hearts = [];
  let maxHearts = 50;
  let heartSize = 150;
  let floatSpeed = 8;
  let rotationSpeed = 0.02;
  let lifeSpan = 100; // in frames
  let frameSpacing = 3;
  let angleRange = Math.PI / 8;
  let showControls = false;
  let useBackgroundColor = true;
  let backgroundColor = '#FFFFFF';

  
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
  let angleSlider, speedSlider, sizeSlider, lifeSlider, spacingSlider, maxHeartsSlider;
  let noiseTexture;
  let noise = false;
  
  // Extended palette structure
  const palettes = {
    sunset: {"background": "#faf3dd", "Melon":"ffa69e","Eggshell":"faf3dd","Celeste":"b8f2e6","Light blue":"aed9e0","Payne's gray":"5e6472"},
    forest: {"background": "#f7e1d7", "Forest Green":"2c5530","Sage":"7d9b76","Cream":"f7e1d7","Moss":"4a5759","Deep Green":"053225"},
    ocean: {"background": "#003b4f", "Deep Blue":"003b4f","Turquoise":"38a2ac","Aqua":"7cd7d7","Sky":"b4e7e7","Sand":"fff1d9"},
    desert: {"background": "#e6c79c", "Terracotta":"cd5f34","Sand":"e6c79c","Dusty Rose":"d4a5a5","Sage":"9cae9c","Brown":"6e4c4b"},
    berry: {"background": "#ead7d7", "Purple":"4a1942","Magenta":"893168","Pink":"c4547d","Light Pink":"e8a1b3","Cream":"ead7d7"},
    nordic: {"background": "#2e3440", "Frost":"e5e9f0","Polar":"eceff4","Arctic":"d8dee9","Glacier":"4c566a","Night":"2e3440"},
    autumn: {"background": "#7b241c", "Rust":"d35400","Amber":"f39c12","Gold":"f1c40f","Crimson":"c0392b","Burgundy":"7b241c"},
    spring: {"background": "#e6e6fa", "Blossom":"ffb6c1","Mint":"98ff98","Lavender":"e6e6fa","Peach":"ffdab9","Sage":"9cae9c"},
    sunset2: {"background": "#191970", "Coral":"ff7f50","Peach":"ffdab9","Lavender":"e6e6fa","Sky":"87ceeb","Night":"191970"},
    neon: {"background": "#202020", "Pink":"ff69b4","Cyan":"00ffff","Yellow":"ffff00","Purple":"9370db","Green":"32cd32"},
    pastel: {"background": "#f0f8ff", "Mint":"98ff98","Lavender":"e6e6fa","Peach":"ffdab9","Sky":"87ceeb","Rose":"ffb6c1"},
    jewel: {"background": "#0F0F0F", "Ruby":"e0115f","Sapphire":"0f52ba","Emerald":"50c878","Amethyst":"9966cc","Topaz":"ffc87c"},
    retro: {"background": "#333333", "Teal":"008080","Coral":"ff7f50","Mustard":"ffdb58","Mint":"98ff98","Lavender":"e6e6fa"},
    vintage: {"background": "#fffdd0", "Sepia":"704214","Cream":"fffdd0","Sage":"9cae9c","Dusty Rose":"d4a5a5","Brown":"6e4c4b"},
    modern: {"background": "#000000", "Slate":"708090","Silver":"c0c0c0","Gray":"808080","Charcoal":"36454f","Black":"000000"},
    cyberpunk: {"background": "#0a0a0a", "Hot Pink":"ff007f","Electric Blue":"00eaff","Neon Yellow":"fff700","Deep Purple":"2d0036","Black":"0a0a0a"},
    noir: {"background": "#232323", "Jet":"343434","Charcoal":"232323","Ash":"bdbdbd","Ivory":"f6f6f6","Blood Red":"c3073f"},
    midnight: {"background": "#0a0a40", "Midnight Blue":"191970","Deep Navy":"0a0a40","Steel":"7b8fa1","Moonlight":"e5e5e5","Violet":"8f00ff"},
    vaporwave: {"background": "#323232", "Vapor Pink":"ff71ce","Vapor Blue":"01cdfe","Vapor Purple":"b967ff","Vapor Yellow":"fffaa8","Vapor Black":"323232"},
    synthwave: {"background": "#1a1a2e", "Synth Pink":"ff3caa","Synth Blue":"29ffe3","Synth Orange":"ffb300","Synth Purple":"7c3cff","Synth Black":"1a1a2e"}
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
    
    const paletteData = palettes[paletteName];
    backgroundColor = paletteData.background;
    const colorData = {...paletteData};
    delete colorData.background;
    colors = Object.values(colorData).map(c => c.startsWith('#') ? c : `#${c}`);

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

  const drawControls = () => {
    p.push();
    p.fill(255, 255, 255, 0.9);
    p.noStroke();
    p.rect(0, 40, 300, 190);
    p.fill(0);
    p.textSize(12);
    p.textAlign(p.LEFT, p.CENTER);

    p.text(`Angle Range: ${angleRange.toFixed(2)}`, 160, 60);
    p.text(`Speed: ${floatSpeed.toFixed(1)}`, 160, 90);
    p.text(`Size: ${heartSize}`, 160, 120);
    p.text(`Lifespan: ${lifeSpan}`, 160, 150);
    p.text(`Spacing: ${frameSpacing}`, 160, 180);
    p.text(`Max Hearts: ${maxHearts}`, 160, 210);
    p.pop();
  };

  const generateNoiseTexture = () => {
    noiseTexture.loadPixels();
    for (let y = 0; y < noiseTexture.height; y++) {
        for (let x = 0; x < noiseTexture.width; x++) {
            let index = (x + y * noiseTexture.width) * 4;
            const noiseValue = p.random(180, 255);
            const alphaValue = p.random(25, 55);

            noiseTexture.pixels[index] = noiseValue;
            noiseTexture.pixels[index + 1] = noiseValue;
            noiseTexture.pixels[index + 2] = noiseValue;
            noiseTexture.pixels[index + 3] = alphaValue;
        }
    }
    noiseTexture.updatePixels();
    console.log("Generated Noise Texture");
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

  // Heart drawing function
  const drawHeart = (x, y, size, rotation, life) => {
    p.push();
    p.translate(x, y);
    p.rotate(rotation);
    // p.scale(size);
    // p.noFill();
    p.strokeWeight(2);
    p.beginShape();

    let specificSize = 0
    if(life < lifeSpan/2) {
      specificSize = p.map(life, 0, lifeSpan/2, 0, size, true);
    } else {
      specificSize = p.map(life, lifeSpan/2, lifeSpan, size, 0, true);
    }
    for (let t = 0; t < p.TWO_PI; t += 0.05) {
      let heartX = specificSize * 16 * Math.pow(Math.sin(t), 3) / 16;
      let heartY = specificSize * -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
      p.vertex(heartX, heartY);
    }
    p.endShape(p.CLOSE);
    p.pop();
  };

  // Create a new heart
  const createHeart = (x, y) => {
    if (hearts.length >= maxHearts) {
      hearts.shift(); // Remove oldest heart if at max
    }
    
    const colorIndex = Math.floor(p.random(colors.length));
    const size = p.random(heartSize * 0.5, heartSize);
    const rotation = p.random(-p.PI/4, p.PI/4);
    const speed = p.random(floatSpeed * 0.9, floatSpeed * 1.1);
    const rotSpeed = p.random(-rotationSpeed, rotationSpeed);
    const angle = p.random(-p.PI / 2 - angleRange, -p.PI / 2 + angleRange);
    const direction = p.createVector(p.cos(angle), p.sin(angle));
    
    hearts.push({
      x,
      y,
      size,
      rotation,
      speed,
      rotSpeed,
      direction,
      color: colors[colorIndex],
      life: 0
    });
  };

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.RGB, 255, 255, 255, 1);

    p.clear();

    p.strokeWeight(2);
    p.frameRate(15);
    p.textFont('Arial');
    
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();

    // Create sliders
    angleSlider = p.createSlider(0, 1, angleRange, 0.01);
    speedSlider = p.createSlider(5, 25, floatSpeed, 0.5);
    sizeSlider = p.createSlider(50, 250, heartSize, 1);
    lifeSlider = p.createSlider(20, 200, lifeSpan, 1);
    spacingSlider = p.createSlider(1, 5, frameSpacing, 1);
    maxHeartsSlider = p.createSlider(10, 100, maxHearts, 1);

    const sliderX = 20;
    const sliderY = 50;
    const sliderYStep = 30;
    angleSlider.position(sliderX, sliderY);
    speedSlider.position(sliderX, sliderY + sliderYStep);
    sizeSlider.position(sliderX, sliderY + sliderYStep * 2);
    lifeSlider.position(sliderX, sliderY + sliderYStep * 3);
    spacingSlider.position(sliderX, sliderY + sliderYStep * 4);
    maxHeartsSlider.position(sliderX, sliderY + sliderYStep * 5);

    angleSlider.show();
    speedSlider.show();
    sizeSlider.show();
    lifeSlider.show();
    spacingSlider.show();
    maxHeartsSlider.show();
    
    // Initialize with a random palette
    selectRandomPalette();
    
    console.log("Hearts setup complete. Click to connect magic.");
    console.log("Controls:");
    console.log("  R: Random palette");
    console.log("  Up/Down: Cycle palettes");
    console.log("  N: Toggle noise overlay");
    console.log("  Q: Toggle background color");
    console.log("  P: Toggle palette name display");
    console.log("  Shift+P: Export print");
  };

  p.draw = () => {
    angleRange = angleSlider.value();
    floatSpeed = speedSlider.value();
    heartSize = sizeSlider.value();
    lifeSpan = lifeSlider.value();
    frameSpacing = spacingSlider.value();
    maxHearts = maxHeartsSlider.value();
    if (useBackgroundColor) {
      p.background(backgroundColor);
    } else {
      p.clear();
    }
    
    // Create new heart at mouse position
    // if (p.mouseIsPressed) {
    // }

    // Update and draw hearts
    for (let i = hearts.length - 1; i >= 0; i--) {
      const heart = hearts[i];
      
      // Update position and rotation
      heart.x += heart.direction.x * heart.speed;
      heart.y += heart.direction.y * heart.speed;
      heart.rotation += heart.rotSpeed;
      
      // Draw heart
      p.noFill();
      p.stroke(heart.color);
      p.strokeWeight(1);
      p.fill(heart.color + "AA");
      heart.life+=1;
      drawHeart(heart.x, heart.y, heart.size, heart.rotation, heart.life);
      
      // Remove hearts that are off screen
      if (heart.y < -heart.size * 2 || heart.y > p.height + heart.size * 2 || heart.x < -heart.size * 2 || heart.x > p.width + heart.size * 2) {
        hearts.splice(i, 1);
      }

      if(heart.life > lifeSpan) {
        hearts.splice(i, 1);
      }
    }
    if (p.frameCount % frameSpacing == 0) {
      createHeart(p.mouseX, p.mouseY);
    }

     
    // Show palette name if enabled
    if (showPaletteName) {
      drawBanner();
    }
    if (noise) {
      p.image(noiseTexture, 0, 0);
    }
    if (showControls) {
      drawControls();
    }
  };

  // Handles connecting to the magic device on click
  p.mousePressed = async () => {
    if (isDevMode && false) {
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
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
  };

  p.keyPressed = () => {
    if (p.key === 'q' || p.key === 'Q') {
      useBackgroundColor = !useBackgroundColor;
    }
    if (p.key === 'c' || p.key === 'C') {
      showControls = !showControls;
    }
    if (showControls) {
      angleSlider.show();
      speedSlider.show();
      sizeSlider.show();
      lifeSlider.show();
      spacingSlider.show();
      maxHeartsSlider.show();
    } else {
      angleSlider.hide();
      speedSlider.hide();
      sizeSlider.hide();
      lifeSlider.hide();
      spacingSlider.hide();
      maxHeartsSlider.hide();
    }
    if (p.key === 's' || p.key === 'S') {
      p.saveCanvas('hearts-capture', 'png');
    }
    if (p.key === 'r' || p.key === 'R') {
      selectRandomPalette();
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
    if (p.key === 'p' || p.key === 'P') {
      if (p.keyIsDown(p.SHIFT)) {
        exportPrint();
      } else {
        showPaletteName = !showPaletteName;
      }
    }
  };
};

// IMPORTANT: Rename 'Hearts' to match the filename PascalCase
export default Hearts; 