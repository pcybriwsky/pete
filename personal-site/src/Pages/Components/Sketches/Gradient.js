import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Gradient = (p) => {
  let isDevMode = true; // Start in dev mode (mouse only)
  let isMagic = false;
  
  // --- Path Variables ---
  let path = [];
  const MAX_PATH_POINTS = 300; // Adjust for longer/shorter trail
  let currentX, currentY;
  let targetX, targetY;
  const LERP_FACTOR = 0.1; // Adjust for faster/slower following
  const SIZE_SCALE_FACTOR = 0.1; // Controls how quickly circles get smaller (0-1)

  // --- Visual Style Variables (from SimpleSun) ---
  const palettes = {
    sunset: {"Melon":"ffa69e","Eggshell":"faf3dd","Celeste":"b8f2e6","Light blue":"aed9e0","Payne\'s gray":"5e6472"},
    forest: {"Forest Green":"2c5530","Sage":"7d9b76","Cream":"f7e1d7","Moss":"4a5759","Deep Green":"053225"},
    ocean: {"Deep Blue":"003b4f","Turquoise":"38a2ac","Aqua":"7cd7d7","Sky":"b4e7e7","Sand":"fff1d9"},
    desert: {"Terracotta":"cd5f34","Sand":"e6c79c","Dusty Rose":"d4a5a5","Sage":"9cae9c","Brown":"6e4c4b"},
    berry: {"Purple":"4a1942","Magenta":"893168","Pink":"c4547d","Light Pink":"e8a1b3","Cream":"ead7d7"}
  };
  let currentPalette;
  let colors = []; // Initialize as empty array
  let noiseTexture;
  let circleSize;

  // --- Helper Functions (from SimpleSun) ---
  const selectRandomPalette = () => {
    const paletteNames = Object.keys(palettes);
    const randomPaletteName = paletteNames[Math.floor(p.random(paletteNames.length))];
    currentPalette = palettes[randomPaletteName];
    // Ensure colors are hex strings, handle potential missing '#'
    colors = Object.values(currentPalette).map(c => c.startsWith('#') ? c : `#${c}`);
    console.log("Selected Palette:", randomPaletteName);
  };

  const shufflePalette = () => {
    // Fisher-Yates (aka Knuth) Shuffle
    for (let i = colors.length - 1; i > 0; i--) {
        const j = Math.floor(p.random(i + 1));
        [colors[i], colors[j]] = [colors[j], colors[i]]; // Swap elements
    }
    console.log("Shuffled Palette");
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
            const alphaValue = p.random(15, 45);

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
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    // Set color mode to RGB (0-255 range) for consistency with drawingContext
    p.colorMode(p.RGB, 255, 255, 255, 1); // Use 0-1 alpha for main canvas
    p.background(240); // Initial background before first draw

    // Initialize position at the center
    currentX = p.width / 2;
    currentY = p.height / 2;
    targetX = currentX;
    targetY = currentY;
    path.push({ x: currentX, y: currentY }); // Add starting point

    // Initialize visual style
    selectRandomPalette(); // Now `colors` is populated
    circleSize = p.width * 0.3; // Adjust size as needed

    // Initialize noise texture
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture(); // Generate initial noise

    console.log("Gradient setup complete. Click to exit dev mode & attempt connection. Press 'r' to shuffle, 's' to save.");
  };

  p.draw = () => {
    // --- Draw Background ---
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

    // --- Update Target Position ---
    if (isDevMode) {
      // --- Dev Mode: Always use mouse ---
      targetX = p.mouseX;
      targetY = p.mouseY;
    } else {
      // --- Live Mode: Use IMU if connected, else fallback to mouse ---
      if (isMagic && magic.modules.imu?.orientation) {
        let invertX = -1;
        let invertY =  1;
        let rotW = magic.modules.imu.orientation.w * invertX; 
        let rotY = magic.modules.imu.orientation.y * invertY; 

        targetX = p.map(-rotW, -0.3, 0.3, 0, p.width, true); 
        targetY = p.map(-rotY, -0.3, 0.3, 0, p.height, true); 
      } else {
        targetX = p.mouseX;
        targetY = p.mouseY;
      }
    }

    // --- Smoothly Update Current Position ---
    currentX = p.lerp(currentX, targetX, LERP_FACTOR);
    currentY = p.lerp(currentY, targetY, LERP_FACTOR);

    // --- Update Path ---
    path.push({ x: currentX, y: currentY });
    if (path.length > MAX_PATH_POINTS) {
      path.shift(); // Remove the oldest point
    }

    // --- Draw Path as Gradient Circles ---
    p.noStroke(); 
    if (path.length > 0 && colors.length > 1) { 
        for (let i = 0; i < path.length; i++) {
            let pt = path[i];
            // Calculate size scaling based on position in path
            let sizeScale = p.map(i, 0, path.length - 1, SIZE_SCALE_FACTOR, 1);
            let currentCircleSize = circleSize * sizeScale;
            
            let colorPosition = p.map(i, 0, path.length -1, 0, colors.length -1); 
            let colorIndex = Math.floor(colorPosition);
            let nextColorIndex = (colorIndex + 1) % colors.length; 
            let interpolationFactor = colorPosition - colorIndex; 
            let color1 = p.color(colors[colorIndex]);
            let color2 = p.color(colors[nextColorIndex]);
            let lerpedColor = p.lerpColor(color1, color2, interpolationFactor);
            let nextNextColorIndex = (nextColorIndex + 1) % colors.length;
            let color3 = p.color(colors[nextNextColorIndex]);
            let interpolatedColor2 = p.lerpColor(color2, color3, interpolationFactor);
            let gradient = p.drawingContext.createLinearGradient(
                pt.x, pt.y - currentCircleSize / 2, pt.x, pt.y + currentCircleSize / 2
            );
            gradient.addColorStop(0, lerpedColor); 
            gradient.addColorStop(1, interpolatedColor2); 
            p.drawingContext.fillStyle = gradient;
            p.stroke(255, 255, 255, 0.5);
            p.strokeWeight(2);
            p.ellipse(pt.x, pt.y, currentCircleSize, currentCircleSize);
        }
    }

    // --- Apply Noise Overlay ---
    if (noiseTexture) {
        p.push();
        p.blendMode(p.SCREEN); 
        p.image(noiseTexture, 0, 0);
        p.pop();
    }

    // --- End main sketch drawing logic ---
  };

  // --- Event Handlers ---

  // Handles mouse clicks for mode switching and connection
  p.mousePressed = async () => {
    if (isDevMode) {
      // --- First Click: Exit Dev Mode, Start Loop, Attempt Connection ---
      console.log("Exiting Dev Mode, attempting Magic connection...");
      isDevMode = false; // Exit dev mode
      p.loop();          // Start the draw loop

      // Now attempt connection
      if (!isMagic) { // Only attempt if not already connected
          try {
              await magic.connect({ mesh: false, auto: true });
              console.log("Magic connected. Modules:", magic.modules);
              isMagic = true;
              // Reset path when magic connects successfully
              path = [{ x: currentX, y: currentY }];
          } catch (error) {
              console.error("Failed to connect magic:", error);
              isMagic = false; // Ensure isMagic is false if connection failed
              console.log("Magic connection failed, using mouse control.");
          }
      }
    } else {
      // --- Subsequent Clicks: Log interaction (or could attempt reconnect if needed) ---
      console.log("Sketch interaction click (already in live mode).");
      // Optional: If !isMagic, could attempt connection again here?
      // if (!isMagic) { try { ... } catch { ... }}
    }
  };

  // Handles window resizing
  p.windowResized = () => {
     p.resizeCanvas(p.windowWidth, p.windowHeight);
     // Regenerate noise texture for new size
     noiseTexture = p.createGraphics(p.width, p.height);
     generateNoiseTexture();
     
     // Adjust circle size based on new width?
     circleSize = p.width * 0.3; 

     // Redraw background immediately
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
  };

  // Handles key presses
   p.keyPressed = () => {
     if (p.key === 'r' || p.key === 'R') {
       selectRandomPalette();
       shufflePalette();
     }
     if (p.key === 's' || p.key === 'S') {
       p.save('gradient-path.png'); // Use a descriptive name
       console.log("Saved canvas to gradient-path.png");
     }
   };
};

// IMPORTANT: Rename 'Gradient' to match the filename PascalCase
export default Gradient; 