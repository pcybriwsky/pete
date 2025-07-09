import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Gradient = (p) => {
  // --- Control Panel Variables ---
  let showControls = false;
  let controlMode = 'mouse'; // 'mouse', 'orientation', 'device_orientation', or 'joystick'
  let showStroke = true;
  let isMagic = false;
  let hasDeviceOrientation = false;
  let deviceOrientationData = { beta: 0, gamma: 0 };
  let sizeDistribution = 'end'; // 'start', 'middle', or 'end'
  let touchButton;
  let isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  // --- Path Variables ---
  let path = [];
  let MAX_PATH_POINTS = 300; // Now controlled by slider
  let currentX, currentY;
  let targetX, targetY;
  let LERP_FACTOR = 0.1; // Now controlled by slider
  let SIZE_SCALE_FACTOR = 0.1; // Now controlled by slider

  // --- Visual Style Variables ---
  const palettes = {
    sunset: { "Melon": "ffa69e", "Eggshell": "faf3dd", "Celeste": "b8f2e6", "Light blue": "aed9e0", "Payne\'s gray": "5e6472" },
    forest: { "Forest Green": "2c5530", "Sage": "7d9b76", "Cream": "f7e1d7", "Moss": "4a5759", "Deep Green": "053225" },
    ocean: { "Deep Blue": "003b4f", "Turquoise": "38a2ac", "Aqua": "7cd7d7", "Sky": "b4e7e7", "Sand": "fff1d9" },
    desert: { "Terracotta": "cd5f34", "Sand": "e6c79c", "Dusty Rose": "d4a5a5", "Sage": "9cae9c", "Brown": "6e4c4b" },
    berry: { "Purple": "4a1942", "Magenta": "893168", "Pink": "c4547d", "Light Pink": "e8a1b3", "Cream": "ead7d7" },
    // New palettes inspired by gradient artworks
    sunrise: { "Golden": "ffd700", "Coral": "ff7f50", "Deep Red": "ff1744", "Royal Blue": "1e88e5", "Sky Blue": "90caf9" },
    twilight: { "Deep Purple": "673ab7", "Magenta": "e91e63", "Coral Pink": "ff6d6d", "Light Blue": "4fc3f7", "Ice": "e1f5fe" },
    neon_sunset: { "Hot Pink": "ff1493", "Electric Orange": "ff4500", "Neon Yellow": "ffff00", "Electric Blue": "00ffff", "Deep Blue": "0000ff" },
    candy: { "Bubblegum": "ff69b4", "Cotton Candy": "ffb6c1", "Lavender": "e6e6fa", "Mint": "98ff98", "Sky": "87ceeb" },
    flame: { "Yellow": "ffeb3b", "Orange": "ff9800", "Deep Orange": "ff5722", "Red": "f44336", "Dark Red": "b71c1c" },
    arctic: { "Ice Blue": "bbdefb", "Light Blue": "64b5f6", "Royal Blue": "1976d2", "Purple": "7e57c2", "Deep Purple": "4527a0" },
    rainbow: { "Red": "f44336", "Orange": "ff9800", "Yellow": "ffeb3b", "Green": "4caf50", "Blue": "2196f3" }
  };
  let currentPalette;
  let selectedPaletteName = 'sunset'; // Track selected palette name
  let colors = []; // Initialize as empty array
  let noiseTexture;
  let circleSize = 0; // Will be set in setup

  // --- GUI Elements ---
  let lerpSlider, scaleSlider, pathSlider, circleSizeSlider;
  let paletteSelect, modeSelect, sizeDistributionSelect;
  let strokeCheckbox;
  let controlPanel;
  let rawValuesDisplay, targetValuesDisplay;

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

  const createControlPanel = () => {
    controlPanel = p.createDiv('');
    controlPanel.class('control-panel');
    controlPanel.style('position', 'absolute');
    controlPanel.style('top', '60px'); // Move down to make room for touch button
    controlPanel.style('right', '20px');
    controlPanel.style('background-color', 'rgba(255, 255, 255, 0.9)');
    controlPanel.style('padding', '20px');
    controlPanel.style('border-radius', '10px');
    controlPanel.style('display', 'none');
    controlPanel.style('font-family', 'monospace');
    if (isMobileDevice) {
      controlPanel.style('max-height', '80vh');
      controlPanel.style('overflow-y', 'auto');
      controlPanel.style('width', '80vw');
      controlPanel.style('max-width', '300px');
    }

    // Create touch button for mobile
    touchButton = p.createButton('☰');
    touchButton.class('touch-button');
    touchButton.style('position', 'absolute');
    touchButton.style('top', '10px');
    touchButton.style('right', '20px');
    touchButton.style('width', '40px');
    touchButton.style('height', '40px');
    touchButton.style('border-radius', '50%');
    touchButton.style('background-color', 'rgba(255, 255, 255, 0.9)');
    touchButton.style('border', 'none');
    touchButton.style('font-size', '24px');
    touchButton.style('cursor', 'pointer');
    touchButton.style('display', isMobileDevice ? 'block' : 'none');
    touchButton.style('z-index', '1000');
    touchButton.mousePressed(() => {
      showControls = !showControls;
      controlPanel.style('display', showControls ? 'block' : 'none');
      touchButton.html(showControls ? '×' : '☰');
    });

    // Create value displays at the top
    p.createP('Input Values:').parent(controlPanel).style('margin-top', '0');
    rawValuesDisplay = p.createDiv('Raw: x: 0, y: 0').parent(controlPanel);
    rawValuesDisplay.style('margin-bottom', '10px');
    targetValuesDisplay = p.createDiv('Target: x: 0, y: 0').parent(controlPanel);
    targetValuesDisplay.style('margin-bottom', '20px');

    // Create sliders
    p.createP('Motion Controls:').parent(controlPanel);
    lerpSlider = p.createSlider(0.01, 0.5, LERP_FACTOR, 0.01);
    lerpSlider.parent(controlPanel);
    p.createSpan('Smoothing').parent(controlPanel);

    p.createP('Visual Controls:').parent(controlPanel);
    scaleSlider = p.createSlider(0.01, 1, SIZE_SCALE_FACTOR, 0.01);
    scaleSlider.parent(controlPanel);
    p.createSpan('Size Scale').parent(controlPanel);

    pathSlider = p.createSlider(50, 1000, MAX_PATH_POINTS, 10);
    pathSlider.parent(controlPanel);
    p.createSpan('Trail Length').parent(controlPanel);

    circleSizeSlider = p.createSlider(0.1, 0.8, 0.3, 0.01);
    circleSizeSlider.parent(controlPanel);
    p.createSpan('Circle Size').parent(controlPanel);

    // Create dropdowns
    p.createP('Style Controls:').parent(controlPanel);
    paletteSelect = p.createSelect();
    paletteSelect.parent(controlPanel);
    Object.keys(palettes).forEach(name => paletteSelect.option(name));
    paletteSelect.selected(selectedPaletteName);
    paletteSelect.changed(() => {
      selectedPaletteName = paletteSelect.value();
      currentPalette = palettes[selectedPaletteName];
      colors = Object.values(currentPalette).map(c => c.startsWith('#') ? c : `#${c}`);
      shufflePalette();
    });

    modeSelect = p.createSelect();
    modeSelect.parent(controlPanel);
    modeSelect.option('mouse');
    modeSelect.option('orientation', 'magic_orientation');
    modeSelect.option('device orientation', 'device_orientation');
    modeSelect.option('joystick');
    modeSelect.selected(controlMode);
    modeSelect.changed(() => {
      controlMode = modeSelect.value();
      if (controlMode === 'magic_orientation' && !isMagic) {
        connectMagic();
      } else if (controlMode === 'device_orientation' && !hasDeviceOrientation) {
        requestDeviceOrientation();
      }
    });

    // Add size distribution control
    p.createP('Size Distribution:').parent(controlPanel);
    sizeDistributionSelect = p.createSelect();
    sizeDistributionSelect.parent(controlPanel);
    sizeDistributionSelect.option('Largest at End', 'end');
    sizeDistributionSelect.option('Largest at Start', 'start');
    sizeDistributionSelect.option('Largest in Middle', 'middle');
    sizeDistributionSelect.selected(sizeDistribution);
    sizeDistributionSelect.changed(() => {
      sizeDistribution = sizeDistributionSelect.value();
    });

    // Create checkbox
    strokeCheckbox = p.createCheckbox('Show Stroke', showStroke);
    strokeCheckbox.parent(controlPanel);
    strokeCheckbox.changed(() => {
      showStroke = strokeCheckbox.checked();
    });

    // Adjust control panel elements for mobile
    if (isMobileDevice) {
      // Make sliders wider
      [lerpSlider, scaleSlider, pathSlider, circleSizeSlider].forEach(slider => {
        slider.style('width', '100%');
        slider.style('margin', '10px 0');
      });
      
      // Add more spacing between controls
      controlPanel.child().forEach(child => {
        child.style('margin-bottom', '15px');
      });

      // Make dropdowns full width
      [paletteSelect, modeSelect, sizeDistributionSelect].forEach(select => {
        select.style('width', '100%');
        select.style('margin', '5px 0');
        select.style('padding', '5px');
      });
    }
  };

  const connectMagic = async () => {
    try {
      await magic.connect({ mesh: false, auto: true });
      console.log("Magic connected. Modules:", magic.modules);
      isMagic = true;
      path = [{ x: currentX, y: currentY }];
    } catch (error) {
      console.error("Failed to connect magic:", error);
      isMagic = false;
      console.log("Magic connection failed, using mouse control.");
      modeSelect.selected('mouse');
      controlMode = 'mouse';
    }
  };

  const requestDeviceOrientation = async () => {
    try {
      // Check if device orientation is available
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ requires permission
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleDeviceOrientation);
          hasDeviceOrientation = true;
          console.log("Device orientation permission granted");
        } else {
          console.log("Device orientation permission denied");
          modeSelect.selected('mouse');
          controlMode = 'mouse';
        }
      } else {
        // Non-iOS devices or older iOS versions
        window.addEventListener('deviceorientation', handleDeviceOrientation);
        hasDeviceOrientation = true;
        console.log("Device orientation enabled");
      }
    } catch (error) {
      console.error("Failed to request device orientation:", error);
      modeSelect.selected('mouse');
      controlMode = 'mouse';
    }
  };

  const handleDeviceOrientation = (event) => {
    deviceOrientationData.beta = event.beta;  // -180 to 180 (front/back tilt)
    deviceOrientationData.gamma = event.gamma; // -90 to 90 (left/right tilt)
  };

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.RGB, 255, 255, 255, 1);
    p.background(255, 255, 255, 0.0);

    currentX = p.width / 2;
    currentY = p.height / 2;
    targetX = currentX;
    targetY = currentY;
    path.push({ x: currentX, y: currentY });

    selectRandomPalette();
    circleSize = p.width * 0.3;

    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();

    createControlPanel();

    // If on mobile, default to device orientation if available
    if (isMobileDevice && typeof DeviceOrientationEvent !== 'undefined') {
      modeSelect.selected('device_orientation');
      controlMode = 'device_orientation';
      requestDeviceOrientation();
    }

    console.log("Gradient setup complete. Press 't' or tap menu button to toggle controls. Press 'r' to shuffle, 's' to save.");
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
    // p.rect(0, 0, p.width, p.height);
    p.pop();
    p.clear();

    // Update variables from controls if they're showing
    if (showControls) {
      LERP_FACTOR = lerpSlider.value();
      SIZE_SCALE_FACTOR = scaleSlider.value();
      MAX_PATH_POINTS = pathSlider.value();
      circleSize = p.width * circleSizeSlider.value();

      // Update value displays
      let rawX = 0, rawY = 0;
      switch (controlMode) {
        case 'mouse':
          rawX = p.mouseX;
          rawY = p.mouseY;
          break;
        case 'magic_orientation':
          if (isMagic && magic.modules.imu?.orientation) {
            rawX = magic.modules.imu.orientation.w;
            rawY = magic.modules.imu.orientation.y;
          }
          break;
        case 'device_orientation':
          if (hasDeviceOrientation) {
            rawX = deviceOrientationData.gamma;
            rawY = deviceOrientationData.beta;
          }
          break;
        case 'joystick':
          if (magic.modules.joystick) {
            const joy = magic.modules.joystick;
            rawX = joy.x;
            rawY = joy.y;
          }
          break;
      }
      
      rawValuesDisplay.html(`Raw: x: ${Math.round(rawX)}, y: ${Math.round(rawY)}`);
      targetValuesDisplay.html(`Target: x: ${Math.round(targetX)}, y: ${Math.round(targetY)}`);
    }

    // --- Update Target Position based on control mode ---
    switch (controlMode) {
      case 'mouse':
        targetX = p.mouseX;
        targetY = p.mouseY;
        break;
      case 'magic_orientation':
        if (isMagic && magic.modules.imu?.orientation) {
          let invertX = -1;
          let invertY = 1;
          let rotW = magic.modules.imu.orientation.w * invertX;
          let rotY = magic.modules.imu.orientation.y * invertY;
          targetX = p.map(-rotW, -0.3, 0.3, 0, p.width, true);
          targetY = p.map(-rotY, -0.3, 0.3, 0, p.height, true);
        }
        break;
      case 'device_orientation':
        if (hasDeviceOrientation) {
          // Map gamma (-90 to 90) to width
          targetX = p.map(deviceOrientationData.gamma, -45, 45, 0, p.width, true);
          // Map beta (-180 to 180) to height, focusing on the -90 to 90 range for better control
          targetY = p.map(deviceOrientationData.beta, -45, 45, 0, p.height, true);
        }
        break;
      case 'joystick':
        if (magic.modules.joystick) {
          const joy = magic.modules.joystick;
          targetX = p.map(joy.x, -1, 1, 0, p.width, true);
          targetY = p.map(joy.y, -1, 1, 0, p.height, true);
        }
        break;
    }

    // --- Smoothly Update Current Position ---
    currentX = p.lerp(currentX, targetX, LERP_FACTOR);
    currentY = p.lerp(currentY, targetY, LERP_FACTOR);

    // --- Update Path ---
    path.push({ x: currentX, y: currentY });
    if (path.length > MAX_PATH_POINTS) {
      path.shift();
    }

    // --- Draw Path as Gradient Circles ---
    if (path.length > 0 && colors.length > 1) {
      for (let i = 0; i < path.length; i++) {
        let pt = path[i];
        
        // Calculate size scale based on distribution setting
        let sizeScale;
        switch(sizeDistribution) {
          case 'start':
            sizeScale = p.map(i, 0, path.length - 1, 1, SIZE_SCALE_FACTOR);
            break;
          case 'middle':
            let mid = path.length / 2;
            let distFromMid = Math.abs(i - mid);
            sizeScale = p.map(distFromMid, 0, mid, 1, SIZE_SCALE_FACTOR);
            break;
          case 'end':
          default:
            sizeScale = p.map(i, 0, path.length - 1, SIZE_SCALE_FACTOR, 1);
            break;
        }
        
        let currentCircleSize = circleSize * sizeScale;

        let colorPosition = p.map(i, 0, path.length - 1, 0, colors.length - 1);
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
          pt.x, pt.y - currentCircleSize / 2,
          pt.x, pt.y + currentCircleSize / 2
        );
        gradient.addColorStop(0, lerpedColor);
        gradient.addColorStop(1, interpolatedColor2);
        p.drawingContext.fillStyle = gradient;

        let flippedGradient = p.drawingContext.createLinearGradient(
          pt.x, pt.y - currentCircleSize / 2,
          pt.x, pt.y + currentCircleSize / 2
        );
        flippedGradient.addColorStop(0, interpolatedColor2);
        flippedGradient.addColorStop(1, lerpedColor);
        p.drawingContext.strokeStyle = flippedGradient;

        if (showStroke) {
          p.stroke(255, 255, 255, 0.5);
          p.strokeWeight(2);
        } else {
          p.noStroke();
        }

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
  };

  // --- Event Handlers ---
  p.keyPressed = () => {
    if (p.key === 't' || p.key === 'T') {
      showControls = !showControls;
      controlPanel.style('display', showControls ? 'block' : 'none');
      touchButton.html(showControls ? '×' : '☰');
    }
    if (p.key === 'r' || p.key === 'R') {
      selectRandomPalette();
      shufflePalette();
    }
    if (p.key === 's' || p.key === 'S') {
      p.save('gradient-path.png');
      console.log("Saved canvas to gradient-path.png");
    }
  };

  p.mousePressed = async () => {
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
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
    circleSize = p.width * circleSizeSlider.value();

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
};

export default Gradient; 