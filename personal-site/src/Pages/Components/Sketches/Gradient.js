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
  let isSmallScreen = window.innerWidth < 768; // Separate check for small screens
  
  // --- Touch Variables ---
  let touchX = 0, touchY = 0;
  let isTouching = false;
  
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
  
  // --- Mobile Menu Elements ---
  let mobileMenu;
  let mobileMenuButton;
  let showMobileMenu = false;

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
    // Only create desktop control panel on larger screens
    if (!isSmallScreen) {
      controlPanel = p.createDiv('');
      controlPanel.class('control-panel');
      controlPanel.style('position', 'absolute');
      controlPanel.style('top', '60px');
      controlPanel.style('right', '20px');
      controlPanel.style('background-color', 'rgba(255, 255, 255, 0.9)');
      controlPanel.style('padding', '20px');
      controlPanel.style('border-radius', '10px');
      controlPanel.style('display', 'none');
      controlPanel.style('font-family', 'monospace');

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
    }
  };

  const createMobileMenu = () => {
    // Only create mobile menu on small screens
    if (isSmallScreen) {
      // Create mobile menu button
      mobileMenuButton = p.createButton('☰');
      mobileMenuButton.class('mobile-menu-button');
      mobileMenuButton.style('position', 'absolute');
      mobileMenuButton.style('top', '10px');
      mobileMenuButton.style('left', '10px');
      mobileMenuButton.style('width', '50px');
      mobileMenuButton.style('height', '50px');
      mobileMenuButton.style('border-radius', '50%');
      mobileMenuButton.style('background-color', 'rgba(255, 255, 255, 0.9)');
      mobileMenuButton.style('border', 'none');
      mobileMenuButton.style('font-size', '24px');
      mobileMenuButton.style('cursor', 'pointer');
      mobileMenuButton.style('z-index', '1000');
      mobileMenuButton.mousePressed(() => {
        showMobileMenu = !showMobileMenu;
        mobileMenu.style('display', showMobileMenu ? 'block' : 'none');
        mobileMenuButton.html(showMobileMenu ? '×' : '☰');
      });

      // Create mobile menu panel
      mobileMenu = p.createDiv('');
      mobileMenu.class('mobile-menu');
      mobileMenu.style('position', 'absolute');
      mobileMenu.style('top', '70px');
      mobileMenu.style('left', '10px');
      mobileMenu.style('background-color', 'rgba(255, 255, 255, 0.95)');
      mobileMenu.style('padding', '15px');
      mobileMenu.style('border-radius', '10px');
      mobileMenu.style('display', 'none');
      mobileMenu.style('font-family', 'monospace');
      mobileMenu.style('font-size', '14px');
      mobileMenu.style('max-width', '280px');
      mobileMenu.style('z-index', '999');

      // Create mobile controls
      p.createP('Quick Controls').parent(mobileMenu).style('margin-top', '0').style('font-weight', 'bold');
      
      // Random palette button
      let randomBtn = p.createButton('🎨 Random Palette');
      randomBtn.parent(mobileMenu);
      randomBtn.style('width', '100%');
      randomBtn.style('margin', '5px 0');
      randomBtn.style('padding', '8px');
      randomBtn.style('border-radius', '5px');
      randomBtn.style('border', '1px solid #ccc');
      randomBtn.style('background-color', '#f0f0f0');
      randomBtn.mousePressed(() => {
        selectRandomPalette();
        shufflePalette();
      });

      // Toggle stroke button
      let strokeBtn = p.createButton(showStroke ? '✏️ Hide Stroke' : '✏️ Show Stroke');
      strokeBtn.parent(mobileMenu);
      strokeBtn.style('width', '100%');
      strokeBtn.style('margin', '5px 0');
      strokeBtn.style('padding', '8px');
      strokeBtn.style('border-radius', '5px');
      strokeBtn.style('border', '1px solid #ccc');
      strokeBtn.style('background-color', '#f0f0f0');
      strokeBtn.mousePressed(() => {
        showStroke = !showStroke;
        strokeBtn.html(showStroke ? '✏️ Hide Stroke' : '✏️ Show Stroke');
      });

      // Save button
      let saveBtn = p.createButton('💾 Save Image');
      saveBtn.parent(mobileMenu);
      saveBtn.style('width', '100%');
      saveBtn.style('margin', '5px 0');
      saveBtn.style('padding', '8px');
      saveBtn.style('border-radius', '5px');
      saveBtn.style('border', '1px solid #ccc');
      saveBtn.style('background-color', '#f0f0f0');
      saveBtn.mousePressed(() => {
        p.save('gradient-path.png');
        console.log("Saved canvas to gradient-path.png");
      });

      // Size distribution buttons
      p.createP('Size Distribution:').parent(mobileMenu).style('margin-top', '15px').style('margin-bottom', '5px');
      
      let endBtn = p.createButton('End');
      endBtn.parent(mobileMenu);
      endBtn.style('width', '30%');
      endBtn.style('margin', '2px');
      endBtn.style('padding', '5px');
      endBtn.style('border-radius', '3px');
      endBtn.style('border', '1px solid #ccc');
      endBtn.style('background-color', sizeDistribution === 'end' ? '#007bff' : '#f0f0f0');
      endBtn.style('color', sizeDistribution === 'end' ? 'white' : 'black');
      endBtn.mousePressed(() => {
        sizeDistribution = 'end';
        updateSizeButtons();
      });

      let startBtn = p.createButton('Start');
      startBtn.parent(mobileMenu);
      startBtn.style('width', '30%');
      startBtn.style('margin', '2px');
      startBtn.style('padding', '5px');
      startBtn.style('border-radius', '3px');
      startBtn.style('border', '1px solid #ccc');
      startBtn.style('background-color', sizeDistribution === 'start' ? '#007bff' : '#f0f0f0');
      startBtn.style('color', sizeDistribution === 'start' ? 'white' : 'black');
      startBtn.mousePressed(() => {
        sizeDistribution = 'start';
        updateSizeButtons();
      });

      let middleBtn = p.createButton('Middle');
      middleBtn.parent(mobileMenu);
      middleBtn.style('width', '30%');
      middleBtn.style('margin', '2px');
      middleBtn.style('padding', '5px');
      middleBtn.style('border-radius', '3px');
      middleBtn.style('border', '1px solid #ccc');
      middleBtn.style('background-color', sizeDistribution === 'middle' ? '#007bff' : '#f0f0f0');
      middleBtn.style('color', sizeDistribution === 'middle' ? 'white' : 'black');
      middleBtn.mousePressed(() => {
        sizeDistribution = 'middle';
        updateSizeButtons();
      });

      // Store buttons for updating
      mobileMenu.sizeButtons = [endBtn, startBtn, middleBtn];

      // Instructions
      p.createP('💡 Touch and drag to draw').parent(mobileMenu).style('margin-top', '15px').style('font-size', '12px').style('color', '#666');
    }
  };

  const updateSizeButtons = () => {
    if (mobileMenu && mobileMenu.sizeButtons) {
      const buttons = mobileMenu.sizeButtons;
      const distributions = ['end', 'start', 'middle'];
      distributions.forEach((dist, i) => {
        buttons[i].style('background-color', sizeDistribution === dist ? '#007bff' : '#f0f0f0');
        buttons[i].style('color', sizeDistribution === dist ? 'white' : 'black');
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
      if (modeSelect) modeSelect.selected('mouse');
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
          if (modeSelect) modeSelect.selected('mouse');
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
      if (modeSelect) modeSelect.selected('mouse');
      controlMode = 'mouse';
    }
  };

  const handleDeviceOrientation = (event) => {
    deviceOrientationData.beta = event.beta;  // -180 to 180 (front/back tilt)
    deviceOrientationData.gamma = event.gamma; // -90 to 90 (left/right tilt)
  };

  p.setup = () => {
    // Set pixel density to 1 for better mobile performance
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
    createMobileMenu();

    // On mobile, default to mouse/touch control instead of device orientation
    // This prevents permission issues from blocking the sketch
    if (isMobileDevice) {
      if (modeSelect) modeSelect.selected('mouse');
      controlMode = 'mouse';
      console.log("Mobile device detected - using touch/mouse control");
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
    if (showControls && controlPanel) {
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
        // Use touch position on mobile, mouse position on desktop
        if (isMobileDevice && isTouching) {
          targetX = touchX;
          targetY = touchY;
        } else {
          targetX = p.mouseX;
          targetY = p.mouseY;
        }
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

  // --- Touch Event Handlers for Mobile ---
  p.touchStarted = (e) => {
    e.preventDefault();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      touchX = touch.clientX;
      touchY = touch.clientY;
      isTouching = true;
    }
    return false;
  };

  p.touchMoved = (e) => {
    e.preventDefault();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      touchX = touch.clientX;
      touchY = touch.clientY;
    }
    return false;
  };

  p.touchEnded = (e) => {
    e.preventDefault();
    isTouching = false;
    return false;
  };

  // --- Event Handlers ---
  p.keyPressed = () => {
    if (p.key === 't' || p.key === 'T') {
      if (isSmallScreen && mobileMenu) {
        showMobileMenu = !showMobileMenu;
        mobileMenu.style('display', showMobileMenu ? 'block' : 'none');
        mobileMenuButton.html(showMobileMenu ? '×' : '☰');
      } else if (controlPanel) {
        showControls = !showControls;
        controlPanel.style('display', showControls ? 'block' : 'none');
      }
    }
    if (p.key === 'r' || p.key === 'R') {
      selectRandomPalette();
      shufflePalette();
    }
    if (p.key === 's' || p.key === 'S') {
      p.save('gradient-path.png');
      console.log("Saved canvas to gradient-path.png");
    }
    if (p.key === 'c' || p.key === 'C') {
      path = [{ x: currentX, y: currentY }];
      console.log("Cleared trail");
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
    if (circleSizeSlider) {
      circleSize = p.width * circleSizeSlider.value();
    }

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