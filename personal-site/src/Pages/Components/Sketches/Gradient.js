import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Gradient = (p) => {
  // --- Control Panel Variables ---
  let showControls = false;
  let controlMode = 'mouse'; // 'mouse', 'orientation', 'device_orientation', or 'joystick'
  let showStroke = false;
  let hollowMode = false; // When true, shows only stroke with no fill
  let currentShape = 'circle'; // 'circle', 'square', or 'diamond'
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
  let LERP_FACTOR = 0.07; // Now controlled by slider
  let SIZE_SCALE_FACTOR = 0.3; // Now controlled by slider

  // --- Equation Mode Variables ---
  let equationType = 'lissajous';
  let t = 0;
  let dt = 0.02;
  const getDefaultEquationParams = () => ({
    // Lissajous
    A: 1,
    B: 1,
    a: 3,
    b: 2,
    delta: Math.PI / 2,
    // Rose
    k: 5,
    R: 1,
    // Trochoids
    bigR: 5,
    smallr: 3,
    d: 5,
    // Spiral
    aSpiral: 0.02,
    bSpiral: 0.08,
    // Lemniscate
    ALem: 1,
    BLem: 1,
    // Squiggle
    squiggleSpeed: 1,
    squiggleAmp: 1,
    // Wave sweep
    waveSpeed: 0.8,
    waveFreq: 1.2,
    waveAmp: 0.8,
  });
  let equationParams = getDefaultEquationParams();
  let squiggleXOff = 1000 * Math.random();
  let squiggleYOff = 2000 * Math.random();
  
  // --- Equation Transition Variables ---
  let prevEquationType = 'lissajous';
  let prevEquationParams = getDefaultEquationParams();
  let equationTransitionProgress = 1; // 0..1, 1 = no transition
  let equationTransitionSpeed = 0.02; // per frame increment
  let isTransitioningEquations = false;

  // --- Ambient Mode Variables ---
  const AMBIENT_ENABLED = true;
  let isAmbient = false;
  let ambientPrevMode = null;
  let idleTimeoutMs = 8000; // enter ambient after ~8s of low motion
  let ambientEquationSwitchMs = 10000; // switch equation every 10s
  let ambientPaletteSwitchMs = 5000; // rotate palette every 5s
  let lastMotionMs = 0;
  let lastEquationSwitchAtMs = 0;
  let lastPaletteSwitchAtMs = 0;
  let ambientEquationIndex = 0;
  const ambientEquationOrder = [
    'wave_sweep',
    'lissajous',
    'rose',
    'squiggle',
    'lemniscate',
    'hypotrochoid',
    'epitrochoid',
    'arch_spiral',
  ];
  let prevTargetX = 0;
  let prevTargetY = 0;
  let prevSensorX = 0;
  let prevSensorY = 0;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let prevJoyX = 0;
  let prevJoyY = 0;
  let ambientStartedAtMs = 0;
  
  // --- Auto-transition Variables ---
  let lastAutoPaletteSwitchAtMs = 0;
  let lastAutoEquationSwitchAtMs = 0;
  let autoPaletteSwitchMs = 20000; // auto palette switch every 5s
  let autoEquationSwitchMs = 40000; // auto equation switch every 10s
  
  // --- Sensor Threshold Variables ---
  let sensorThreshold = 5; // degrees of change to trigger sensor mode
  let lastSensorBeta = 0;
  let lastSensorGamma = 0;
  let lastMagicY = 0;
  let lastMagicW = 0;
  let sensorModeTriggered = false;

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
  let colors = []; // Target palette colors (hex strings)
  let prevColors = []; // Previous palette colors for crossfade
  let paletteTransitionProgress = 1; // 0..1
  let paletteFadeSpeed = 0.02; // per frame increment
  let noiseTexture;
  let circleSize = 0; // Will be set in setup

  // --- GUI Elements ---
  let lerpSlider, scaleSlider, pathSlider, circleSizeSlider;
  let paletteSelect, modeSelect, sizeDistributionSelect, shapeSelect;
  let paletteFadeSlider;
  let equationSelect, equationDtSlider;
  let equationControlsContainer;
  const equationParamSliders = {};
  let strokeCheckbox, hollowCheckbox;
  let controlPanel;
  let rawValuesDisplay, targetValuesDisplay;
  
  // --- Mobile Menu Elements ---
  let mobileMenu;
  let mobileMenuButton;
  let showMobileMenu = false;
  let openAccordionSection = 'quick'; // 'quick', 'size', 'shape', 'motion'
  let motionErrorModal;

  // Helper to close all accordion sections except one
  const openSection = (section) => {
    openAccordionSection = section;
    if (mobileMenu && mobileMenu.accordionSections) {
      Object.entries(mobileMenu.accordionSections).forEach(([key, sec]) => {
        sec.content.style('display', key === section ? 'block' : 'none');
        sec.header.style('background-color', key === section ? '#e0e0e0' : '#f8f8f8');
      });
    }
  };

  // --- Equation helpers ---
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const getEquationPoint = (time, type, params) => {
    switch (type) {
      case 'lissajous': {
        const { A, B, a, b, delta } = params;
        return { x: A * Math.sin(a * time + delta), y: B * Math.sin(b * time) };
      }
      case 'squiggle': {
        // Perlin-noise-driven wandering path centered at origin
        const { squiggleSpeed, squiggleAmp } = params;
        const speed = 0.005 * clamp(squiggleSpeed, 0.2, 4);
        const amp = clamp(squiggleAmp, 0.1, 3);
        const nx = p.noise(squiggleXOff + time * speed);
        const ny = p.noise(squiggleYOff + time * speed);
        const x = amp * (nx * 2 - 1);
        const y = amp * (ny * 2 - 1);
        return { x, y };
      }
      case 'wave_sweep': {
        // Left-to-right sweep with sinusoidal vertical motion
        // x in [-1, 1] looping, y in [-1,1] sine
        const { waveSpeed, waveFreq, waveAmp } = params;
        const speed = clamp(waveSpeed, 0.1, 3);
        const freq = clamp(waveFreq, 0.2, 4);
        const amp = clamp(waveAmp, 0.1, 1.5);
        const x = ((time * speed) % (2 * Math.PI)) / Math.PI - 1; // map 0..2π → -1..1
        const y = amp * Math.sin(time * freq * 2 * Math.PI);
        return { x, y };
      }
      case 'rose': {
        const { k, R } = params; // r = R * cos(k theta)
        const theta = time;
        const r = R * Math.cos(k * theta);
        return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
      }
      case 'hypotrochoid': {
        const { bigR, smallr, d } = params;
        const R = bigR, r = smallr;
        return {
          x: (R - r) * Math.cos(time) + d * Math.cos(((R - r) / r) * time),
          y: (R - r) * Math.sin(time) - d * Math.sin(((R - r) / r) * time),
        };
      }
      case 'epitrochoid': {
        const { bigR, smallr, d } = params;
        const R = bigR, r = smallr;
        return {
          x: (R + r) * Math.cos(time) - d * Math.cos(((R + r) / r) * time),
          y: (R + r) * Math.sin(time) - d * Math.sin(((R + r) / r) * time),
        };
      }
      case 'lemniscate': {
        const { ALem, BLem } = params;
        return { x: ALem * Math.cos(time), y: (BLem / 2) * Math.sin(2 * time) };
      }
      case 'arch_spiral': {
        const { aSpiral, bSpiral } = params;
        const r = aSpiral + bSpiral * time;
        return { x: r * Math.cos(time), y: r * Math.sin(time) };
      }
      default:
        return { x: 0, y: 0 };
    }
  };

  // Helper to start equation transition
  const startEquationTransition = (newType, newParams) => {
    prevEquationType = equationType;
    prevEquationParams = { ...equationParams };
    equationType = newType;
    equationParams = { ...newParams };
    equationTransitionProgress = 0;
    isTransitioningEquations = true;
  };

  // Helper to get blended equation point during transition
  const getBlendedEquationPoint = (time) => {
    if (equationTransitionProgress >= 1) {
      return getEquationPoint(time, equationType, equationParams);
    }
    
    const prevPoint = getEquationPoint(time, prevEquationType, prevEquationParams);
    const currentPoint = getEquationPoint(time, equationType, equationParams);
    
    return {
      x: p.lerp(prevPoint.x, currentPoint.x, equationTransitionProgress),
      y: p.lerp(prevPoint.y, currentPoint.y, equationTransitionProgress)
    };
  };

  // Narrow ambient parameter ranges (tasteful defaults)
  const randomAmbientParamsFor = (type) => {
    const p2 = { ...equationParams };
    switch (type) {
      case 'wave_sweep':
        p2.waveSpeed = p.random(0.5, 1.2);
        p2.waveFreq = p.random(0.6, 1.6);
        p2.waveAmp = p.random(0.5, 1.0);
        break;
      case 'lissajous':
        p2.A = 1; p2.B = 1;
        p2.a = Math.round(p.random(2, 5));
        p2.b = Math.round(p.random(2, 5));
        p2.delta = p.random(0, Math.PI);
        break;
      case 'rose':
        p2.k = Math.round(p.random(3, 7));
        p2.R = p.random(0.7, 1.2);
        break;
      case 'squiggle':
        p2.squiggleSpeed = p.random(0.6, 1.4);
        p2.squiggleAmp = p.random(0.5, 1.2);
        break;
      case 'lemniscate':
        p2.ALem = p.random(0.8, 1.2);
        p2.BLem = p.random(0.8, 1.2);
        break;
      case 'hypotrochoid':
      case 'epitrochoid':
        p2.bigR = p.random(3, 8);
        p2.smallr = p.random(1, 4);
        p2.d = p.random(2, 8);
        break;
      case 'arch_spiral':
        p2.aSpiral = p.random(0.005, 0.03);
        p2.bSpiral = p.random(0.02, 0.08);
        break;
    }
    return p2;
  };

  // Helper to show/hide the motion error modal
  const showMotionErrorModal = (msg) => {
    if (!motionErrorModal) {
      motionErrorModal = p.createDiv('');
      motionErrorModal.class('modal');
      motionErrorModal.style('position', 'fixed');
      motionErrorModal.style('top', '0');
      motionErrorModal.style('left', '0');
      motionErrorModal.style('width', '100vw');
      motionErrorModal.style('height', '100vh');
      motionErrorModal.style('background', 'rgba(0,0,0,0.5)');
      motionErrorModal.style('display', 'flex');
      motionErrorModal.style('align-items', 'center');
      motionErrorModal.style('justify-content', 'center');
      motionErrorModal.style('z-index', '2000');
      let modalBox = p.createDiv('');
      modalBox.style('background', 'white');
      modalBox.style('padding', '24px');
      modalBox.style('border-radius', '12px');
      modalBox.style('max-width', '80vw');
      modalBox.style('font-family', 'monospace');
      modalBox.style('text-align', 'center');
      let msgDiv = p.createP(msg);
      msgDiv.parent(modalBox);
      let closeBtn = p.createButton('Close');
      closeBtn.parent(modalBox);
      closeBtn.style('margin-top', '16px');
      closeBtn.mousePressed(() => motionErrorModal.remove());
      closeBtn.touchStarted(() => { motionErrorModal.remove(); return false; });
      modalBox.parent(motionErrorModal);
      motionErrorModal.parent(document.body);
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
      // Add touch event handlers for mobile
      mobileMenuButton.touchStarted(() => {
        showMobileMenu = !showMobileMenu;
        mobileMenu.style('display', showMobileMenu ? 'block' : 'none');
        mobileMenuButton.html(showMobileMenu ? '×' : '☰');
        return false; // Prevent default touch behavior
      });

      // Create mobile menu panel
      mobileMenu = p.createDiv('');
      mobileMenu.class('mobile-menu');
      mobileMenu.style('position', 'absolute');
      mobileMenu.style('top', '70px');
      mobileMenu.style('left', '10px');
      mobileMenu.style('background-color', 'rgba(255, 255, 255, 0.95)');
      mobileMenu.style('padding', '0');
      mobileMenu.style('border-radius', '10px');
      mobileMenu.style('display', 'none');
      mobileMenu.style('font-family', 'monospace');
      mobileMenu.style('font-size', '14px');
      mobileMenu.style('max-width', '320px');
      mobileMenu.style('z-index', '999');
      mobileMenu.style('overflow-y', 'auto');
      mobileMenu.style('max-height', '80vh');
      mobileMenu.accordionSections = {};

      // --- Accordion Section: Quick Controls ---
      let quickHeader = p.createDiv('Quick Controls');
      quickHeader.parent(mobileMenu);
      quickHeader.style('font-weight', 'bold');
      quickHeader.style('padding', '12px');
      quickHeader.style('cursor', 'pointer');
      quickHeader.style('background-color', openAccordionSection === 'quick' ? '#e0e0e0' : '#f8f8f8');
      let quickContent = p.createDiv('');
      quickContent.parent(mobileMenu);
      quickContent.style('display', openAccordionSection === 'quick' ? 'block' : 'none');
      quickContent.style('padding', '10px');
      // Add quick controls here (randomBtn, strokeBtn, hollowBtn, motionBtn, saveBtn)
      let randomBtn = p.createButton('🎨 Random Palette');
      randomBtn.parent(quickContent);
      randomBtn.style('width', '100%');
      randomBtn.style('margin', '5px 0');
      randomBtn.style('padding', '8px');
      randomBtn.style('border-radius', '5px');
      randomBtn.style('border', '1px solid #ccc');
      randomBtn.style('background-color', '#f0f0f0');
      randomBtn.mousePressed(() => {
        selectRandomPalette();
        const newColors = Object.values(currentPalette).map(c => c.startsWith('#') ? c : `#${c}`);
        startPaletteTransition(newColors);
      });
      randomBtn.touchStarted(() => {
        selectRandomPalette();
        const newColors = Object.values(currentPalette).map(c => c.startsWith('#') ? c : `#${c}`);
        startPaletteTransition(newColors);
        return false;
      });

      // Toggle stroke button
      let strokeBtn = p.createButton(showStroke ? '✏️ Hide Stroke' : '✏️ Show Stroke');
      strokeBtn.parent(quickContent);
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
      strokeBtn.touchStarted(() => {
        showStroke = !showStroke;
        strokeBtn.html(showStroke ? '✏️ Hide Stroke' : '✏️ Show Stroke');
        return false;
      });

      // Hollow mode button
      let hollowBtn = p.createButton(hollowMode ? '🔲 Solid Mode' : '🔲 Hollow Mode');
      hollowBtn.parent(quickContent);
      hollowBtn.style('width', '100%');
      hollowBtn.style('margin', '5px 0');
      hollowBtn.style('padding', '8px');
      hollowBtn.style('border-radius', '5px');
      hollowBtn.style('border', '1px solid #ccc');
      hollowBtn.style('background-color', hollowMode ? '#007bff' : '#f0f0f0');
      hollowBtn.style('color', hollowMode ? 'white' : 'black');
      hollowBtn.mousePressed(() => {
        hollowMode = !hollowMode;
        hollowBtn.html(hollowMode ? '🔲 Solid Mode' : '🔲 Hollow Mode');
        hollowBtn.style('background-color', hollowMode ? '#007bff' : '#f0f0f0');
        hollowBtn.style('color', hollowMode ? 'white' : 'black');
      });
      hollowBtn.touchStarted(() => {
        hollowMode = !hollowMode;
        hollowBtn.html(hollowMode ? '🔲 Solid Mode' : '🔲 Hollow Mode');
        hollowBtn.style('background-color', hollowMode ? '#007bff' : '#f0f0f0');
        hollowBtn.style('color', hollowMode ? 'white' : 'black');
        return false;
      });

      // Magic Orientation button
      let magicBtn = p.createButton('🪄 Magic Orientation');
      magicBtn.parent(quickContent);
      magicBtn.style('width', '100%');
      magicBtn.style('margin', '5px 0');
      magicBtn.style('padding', '8px');
      magicBtn.style('border-radius', '5px');
      magicBtn.style('border', '1px solid #ccc');
      magicBtn.style('background-color', controlMode === 'magic_orientation' ? '#007bff' : '#f0f0f0');
      magicBtn.style('color', controlMode === 'magic_orientation' ? 'white' : 'black');
      magicBtn.mousePressed(async () => {
        controlMode = 'magic_orientation';
        sensorModeTriggered = false; // Reset sensor trigger
        await connectMagic();
        magicBtn.style('background-color', '#007bff');
        magicBtn.style('color', 'white');
      });
      magicBtn.touchStarted(async () => {
        controlMode = 'magic_orientation';
        await connectMagic();
        magicBtn.style('background-color', '#007bff');
        magicBtn.style('color', 'white');
        return false;
      });

      // Equation mode button
      let equationBtn = p.createButton('ƒx Equation Mode');
      equationBtn.parent(quickContent);
      equationBtn.style('width', '100%');
      equationBtn.style('margin', '5px 0');
      equationBtn.style('padding', '8px');
      equationBtn.style('border-radius', '5px');
      equationBtn.style('border', '1px solid #ccc');
      equationBtn.style('background-color', controlMode === 'equation' ? '#007bff' : '#f0f0f0');
      equationBtn.style('color', controlMode === 'equation' ? 'white' : 'black');
      const activateEquationMode = () => {
        controlMode = 'equation';
        sensorModeTriggered = false; // Reset sensor trigger
        t = 0;
        path = [{ x: currentX, y: currentY }];
        // Reset transition state when entering equation mode
        equationTransitionProgress = 1;
        isTransitioningEquations = false;
        equationBtn.style('background-color', '#007bff');
        equationBtn.style('color', 'white');
      };
      equationBtn.mousePressed(activateEquationMode);
      equationBtn.touchStarted(() => { activateEquationMode(); return false; });

      // Motion control permission button
      let motionBtn = p.createButton(hasDeviceOrientation ? '📱 Motion Active' : '📱 Enable Motion');
      motionBtn.parent(quickContent);
      motionBtn.style('width', '100%');
      motionBtn.style('margin', '5px 0');
      motionBtn.style('padding', '8px');
      motionBtn.style('border-radius', '5px');
      motionBtn.style('border', '1px solid #ccc');
      motionBtn.style('background-color', hasDeviceOrientation ? '#28a745' : '#f0f0f0');
      motionBtn.style('color', hasDeviceOrientation ? 'white' : 'black');
      motionBtn.mousePressed(async () => {
        if (!hasDeviceOrientation) {
          if (
            typeof DeviceMotionEvent !== 'undefined' &&
            typeof DeviceMotionEvent.requestPermission === 'function' &&
            typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function'
          ) {
            try {
              const motion = await DeviceMotionEvent.requestPermission();
              const orient = await DeviceOrientationEvent.requestPermission();
              if (motion === 'granted' || orient === 'granted') {
                window.addEventListener('deviceorientation', handleDeviceOrientation);
                hasDeviceOrientation = true;
                motionBtn.html('📱 Motion Active');
                motionBtn.style('background-color', '#28a745');
                motionBtn.style('color', 'white');
                controlMode = 'device_orientation';
                sensorModeTriggered = false; // Reset sensor trigger
              } else {
                showMotionErrorModal('Motion/orientation permission denied. Please enable it in your device settings.');
              }
            } catch (error) {
              showMotionErrorModal('Motion/orientation permission denied. Please enable it in your device settings.');
            }
          } else {
            // Fallback for non-iOS or older devices
            window.addEventListener('deviceorientation', handleDeviceOrientation);
            hasDeviceOrientation = true;
            motionBtn.html('📱 Motion Active');
            motionBtn.style('background-color', '#28a745');
            motionBtn.style('color', 'white');
            controlMode = 'device_orientation';
          }
        }
      });
      motionBtn.touchStarted(async () => {
        if (!hasDeviceOrientation) {
          if (
            typeof DeviceMotionEvent !== 'undefined' &&
            typeof DeviceMotionEvent.requestPermission === 'function' &&
            typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function'
          ) {
            try {
              const motion = await DeviceMotionEvent.requestPermission();
              const orient = await DeviceOrientationEvent.requestPermission();
              if (motion === 'granted' || orient === 'granted') {
                window.addEventListener('deviceorientation', handleDeviceOrientation);
                hasDeviceOrientation = true;
                motionBtn.html('📱 Motion Active');
                motionBtn.style('background-color', '#28a745');
                motionBtn.style('color', 'white');
                controlMode = 'device_orientation';
                sensorModeTriggered = false; // Reset sensor trigger
              } else {
                showMotionErrorModal('Motion/orientation permission denied. Please enable it in your device settings.');
              }
            } catch (error) {
              showMotionErrorModal('Motion/orientation permission denied. Please enable it in your device settings.');
            }
          } else {
            // Fallback for non-iOS or older devices
            window.addEventListener('deviceorientation', handleDeviceOrientation);
            hasDeviceOrientation = true;
            motionBtn.html('📱 Motion Active');
            motionBtn.style('background-color', '#28a745');
            motionBtn.style('color', 'white');
            controlMode = 'device_orientation';
            sensorModeTriggered = false; // Reset sensor trigger
          }
        }
        return false;
      });

      // Save button
      let saveBtn = p.createButton('💾 Save Image');
      saveBtn.parent(quickContent);
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
      saveBtn.touchStarted(() => {
        p.save('gradient-path.png');
        console.log("Saved canvas to gradient-path.png");
        return false;
      });
      // End quick controls
      quickHeader.mousePressed(() => openSection('quick'));
      quickHeader.touchStarted(() => { openSection('quick'); return false; });
      mobileMenu.accordionSections.quick = { header: quickHeader, content: quickContent };

      // --- Accordion Section: Size Distribution ---
      let sizeHeader = p.createDiv('Size Distribution');
      sizeHeader.parent(mobileMenu);
      sizeHeader.style('font-weight', 'bold');
      sizeHeader.style('padding', '12px');
      sizeHeader.style('cursor', 'pointer');
      sizeHeader.style('background-color', openAccordionSection === 'size' ? '#e0e0e0' : '#f8f8f8');
      let sizeContent = p.createDiv('');
      sizeContent.parent(mobileMenu);
      sizeContent.style('display', openAccordionSection === 'size' ? 'block' : 'none');
      sizeContent.style('padding', '10px');
      // Add size distribution buttons here (endBtn, startBtn, middleBtn)
      let endBtn = p.createButton('End');
      endBtn.parent(sizeContent);
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
      endBtn.touchStarted(() => {
        sizeDistribution = 'end';
        updateSizeButtons();
        return false;
      });

      let startBtn = p.createButton('Start');
      startBtn.parent(sizeContent);
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
      startBtn.touchStarted(() => {
        sizeDistribution = 'start';
        updateSizeButtons();
        return false;
      });

      let middleBtn = p.createButton('Middle');
      middleBtn.parent(sizeContent);
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
      middleBtn.touchStarted(() => {
        sizeDistribution = 'middle';
        updateSizeButtons();
        return false;
      });
      // End size distribution
      sizeHeader.mousePressed(() => openSection('size'));
      sizeHeader.touchStarted(() => { openSection('size'); return false; });
      mobileMenu.accordionSections.size = { header: sizeHeader, content: sizeContent };

      // --- Accordion Section: Shape ---
      let shapeHeader = p.createDiv('Shape');
      shapeHeader.parent(mobileMenu);
      shapeHeader.style('font-weight', 'bold');
      shapeHeader.style('padding', '12px');
      shapeHeader.style('cursor', 'pointer');
      shapeHeader.style('background-color', openAccordionSection === 'shape' ? '#e0e0e0' : '#f8f8f8');
      let shapeContent = p.createDiv('');
      shapeContent.parent(mobileMenu);
      shapeContent.style('display', openAccordionSection === 'shape' ? 'block' : 'none');
      shapeContent.style('padding', '10px');
      // Add shape buttons here (circleBtn, squareBtn, diamondBtn)
      let circleBtn = p.createButton('● Circle');
      circleBtn.parent(shapeContent);
      circleBtn.style('width', '30%');
      circleBtn.style('margin', '2px');
      circleBtn.style('padding', '5px');
      circleBtn.style('border-radius', '3px');
      circleBtn.style('border', '1px solid #ccc');
      circleBtn.style('background-color', currentShape === 'circle' ? '#007bff' : '#f0f0f0');
      circleBtn.style('color', currentShape === 'circle' ? 'white' : 'black');
      circleBtn.mousePressed(() => {
        currentShape = 'circle';
        updateShapeButtons();
      });
      circleBtn.touchStarted(() => {
        currentShape = 'circle';
        updateShapeButtons();
        return false;
      });

      let squareBtn = p.createButton('■ Square');
      squareBtn.parent(shapeContent);
      squareBtn.style('width', '30%');
      squareBtn.style('margin', '2px');
      squareBtn.style('padding', '5px');
      squareBtn.style('border-radius', '3px');
      squareBtn.style('border', '1px solid #ccc');
      squareBtn.style('background-color', currentShape === 'square' ? '#007bff' : '#f0f0f0');
      squareBtn.style('color', currentShape === 'square' ? 'white' : 'black');
      squareBtn.mousePressed(() => {
        currentShape = 'square';
        updateShapeButtons();
      });
      squareBtn.touchStarted(() => {
        currentShape = 'square';
        updateShapeButtons();
        return false;
      });

      let diamondBtn = p.createButton('◆ Diamond');
      diamondBtn.parent(shapeContent);
      diamondBtn.style('width', '30%');
      diamondBtn.style('margin', '2px');
      diamondBtn.style('padding', '5px');
      diamondBtn.style('border-radius', '3px');
      diamondBtn.style('border', '1px solid #ccc');
      diamondBtn.style('background-color', currentShape === 'diamond' ? '#007bff' : '#f0f0f0');
      diamondBtn.style('color', currentShape === 'diamond' ? 'white' : 'black');
      diamondBtn.mousePressed(() => {
        currentShape = 'diamond';
        updateShapeButtons();
      });
      diamondBtn.touchStarted(() => {
        currentShape = 'diamond';
        updateShapeButtons();
        return false;
      });
      // End shape
      shapeHeader.mousePressed(() => openSection('shape'));
      shapeHeader.touchStarted(() => { openSection('shape'); return false; });
      mobileMenu.accordionSections.shape = { header: shapeHeader, content: shapeContent };

      // --- Accordion Section: Motion Controls ---
      let motionHeader = p.createDiv('Motion Controls');
      motionHeader.parent(mobileMenu);
      motionHeader.style('font-weight', 'bold');
      motionHeader.style('padding', '12px');
      motionHeader.style('cursor', 'pointer');
      motionHeader.style('background-color', openAccordionSection === 'motion' ? '#e0e0e0' : '#f8f8f8');
      let motionContent = p.createDiv('');
      motionContent.parent(mobileMenu);
      motionContent.style('display', openAccordionSection === 'motion' ? 'block' : 'none');
      motionContent.style('padding', '10px');
      // Add sliders here (mobileLerpSlider, mobileScaleSlider, mobilePathSlider, mobileCircleSizeSlider)
      p.createSpan('Smoothing: ').parent(motionContent).style('font-size', '12px');
      let mobileLerpSlider = p.createSlider(0.01, 0.5, LERP_FACTOR, 0.01);
      mobileLerpSlider.parent(motionContent);
      mobileLerpSlider.style('width', '100%');
      mobileLerpSlider.style('margin', '5px 0');
      
      p.createSpan('Size Scale: ').parent(motionContent).style('font-size', '12px');
      let mobileScaleSlider = p.createSlider(0.01, 1, SIZE_SCALE_FACTOR, 0.01);
      mobileScaleSlider.parent(motionContent);
      mobileScaleSlider.style('width', '100%');
      mobileScaleSlider.style('margin', '5px 0');
      
      p.createSpan('Trail Length: ').parent(motionContent).style('font-size', '12px');
      let mobilePathSlider = p.createSlider(50, 1000, MAX_PATH_POINTS, 10);
      mobilePathSlider.parent(motionContent);
      mobilePathSlider.style('width', '100%');
      mobilePathSlider.style('margin', '5px 0');
      
      p.createSpan('Circle Size: ').parent(motionContent).style('font-size', '12px');
      let mobileCircleSizeSlider = p.createSlider(0.1, 0.8, 0.3, 0.01);
      mobileCircleSizeSlider.parent(motionContent);
      mobileCircleSizeSlider.style('width', '100%');
      mobileCircleSizeSlider.style('margin', '5px 0');
      
      // Store mobile sliders for updating in draw loop
      mobileMenu.sliders = {
        lerp: mobileLerpSlider,
        scale: mobileScaleSlider,
        path: mobilePathSlider,
        circleSize: mobileCircleSizeSlider
      };
      // End motion controls
      motionHeader.mousePressed(() => openSection('motion'));
      motionHeader.touchStarted(() => { openSection('motion'); return false; });
      mobileMenu.accordionSections.motion = { header: motionHeader, content: motionContent };

      // Instructions
      p.createP('💡 Touch and drag to draw').parent(mobileMenu).style('margin-top', '15px').style('font-size', '12px').style('color', '#666');
      // Minimal equation controls
      attachMobileEquationControls(mobileMenu);
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

  const updateShapeButtons = () => {
    if (mobileMenu && mobileMenu.shapeButtons) {
      const buttons = mobileMenu.shapeButtons;
      const shapes = ['circle', 'square', 'diamond'];
      shapes.forEach((shape, i) => {
        buttons[i].style('background-color', currentShape === shape ? '#007bff' : '#f0f0f0');
        buttons[i].style('color', currentShape === shape ? 'white' : 'black');
      });
    }
  };

  // --- Helper Functions (restored) ---
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

  // --- Palette transition helpers ---
  const startPaletteTransition = (newColors) => {
    prevColors = colors.slice();
    colors = newColors.slice();
    paletteTransitionProgress = 0;
  };

  const getBlendedColor = (index, t) => {
    if (prevColors.length === 0 || t >= 1) {
      return p.color(colors[index % colors.length]);
    }
    const from = p.color(prevColors[index % prevColors.length]);
    const to = p.color(colors[index % colors.length]);
    return p.lerpColor(from, to, t);
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
        const alphaValue = p.random(15, 90);
        noiseTexture.pixels[index] = noiseValue;     // R
        noiseTexture.pixels[index + 1] = noiseValue; // G
        noiseTexture.pixels[index + 2] = noiseValue; // B
        noiseTexture.pixels[index + 3] = alphaValue; // A
      }
    }
    noiseTexture.updatePixels();
    console.log("Generated Noise Texture");
  };

  // Restore createControlPanel for desktop controls
  const createControlPanel = () => {
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

      p.createP('Input Values:').parent(controlPanel).style('margin-top', '0');
      rawValuesDisplay = p.createDiv('Raw: x: 0, y: 0').parent(controlPanel);
      rawValuesDisplay.style('margin-bottom', '10px');
      targetValuesDisplay = p.createDiv('Target: x: 0, y: 0').parent(controlPanel);
      targetValuesDisplay.style('margin-bottom', '20px');

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

      p.createP('Style Controls:').parent(controlPanel);
      paletteSelect = p.createSelect();
      paletteSelect.parent(controlPanel);
      Object.keys(palettes).forEach(name => paletteSelect.option(name));
      paletteSelect.selected(selectedPaletteName);
      paletteSelect.changed(() => {
        selectedPaletteName = paletteSelect.value();
        currentPalette = palettes[selectedPaletteName];
        const newColors = Object.values(currentPalette).map(c => c.startsWith('#') ? c : `#${c}`);
        startPaletteTransition(newColors);
      });

      // Palette fade speed
      paletteFadeSlider = p.createSlider(0.005, 0.2, paletteFadeSpeed, 0.005);
      paletteFadeSlider.parent(controlPanel);
      p.createSpan('Palette Fade Speed').parent(controlPanel);

      modeSelect = p.createSelect();
      modeSelect.parent(controlPanel);
      modeSelect.option('mouse');
      modeSelect.option('orientation', 'magic_orientation');
      modeSelect.option('device orientation', 'device_orientation');
      modeSelect.option('joystick');
      modeSelect.option('equation');
      modeSelect.selected(controlMode);
      modeSelect.changed(() => {
        controlMode = modeSelect.value();
        sensorModeTriggered = false; // Reset sensor trigger when manually changing modes
        if (controlMode === 'magic_orientation' && !isMagic) {
          connectMagic();
        } else if (controlMode === 'device_orientation' && !hasDeviceOrientation) {
          requestDeviceOrientation();
        }
        if (controlMode === 'equation') {
          t = 0;
          path = [{ x: currentX, y: currentY }];
          // Reset transition state when entering equation mode
          equationTransitionProgress = 1;
          isTransitioningEquations = false;
          if (equationControlsContainer) equationControlsContainer.style('display', 'block');
        } else if (equationControlsContainer) {
          equationControlsContainer.style('display', 'none');
        }
      });

      // Equation Controls (hidden unless equation mode)
      p.createP('Equation Controls:').parent(controlPanel);
      equationControlsContainer = p.createDiv('');
      equationControlsContainer.parent(controlPanel);
      equationControlsContainer.style('display', controlMode === 'equation' ? 'block' : 'none');
      const inner = p.createDiv('');
      inner.parent(equationControlsContainer);
      const paramsContainer = p.createDiv('');
      paramsContainer.parent(inner);

      equationSelect = p.createSelect();
      equationSelect.parent(inner);
      equationSelect.option('Lissajous', 'lissajous');
      equationSelect.option('Squiggle', 'squiggle');
      equationSelect.option('Wave Sweep', 'wave_sweep');
      equationSelect.option('Rose', 'rose');
      equationSelect.option('Hypotrochoid', 'hypotrochoid');
      equationSelect.option('Epitrochoid', 'epitrochoid');
      equationSelect.option('Lemniscate', 'lemniscate');
      equationSelect.option('Archimedean Spiral', 'arch_spiral');
      equationSelect.selected(equationType);
      equationSelect.changed(() => {
        const newType = equationSelect.value();
        if (newType !== equationType) {
          // Start transition instead of resetting
          startEquationTransition(newType, equationParams);
          // Reset squiggle offsets for a fresh path
          if (newType === 'squiggle') {
            squiggleXOff = 1000 * Math.random();
            squiggleYOff = 2000 * Math.random();
          }
        }
        buildEquationParamSliders();
      });

      p.createSpan(' Speed ').parent(inner);
      equationDtSlider = p.createSlider(0.001, 0.2, dt, 0.001);
      equationDtSlider.parent(inner);

      const buildEquationParamSliders = () => {
        // Clear previous controls
        paramsContainer.html('');
        Object.keys(equationParamSliders).forEach(k => delete equationParamSliders[k]);

        const addSlider = (label, key, min, max, step, value) => {
          const row = p.createDiv('');
          row.parent(paramsContainer);
          p.createSpan(` ${label}: `).parent(row);
          const slider = p.createSlider(min, max, value, step);
          slider.parent(row);
          equationParamSliders[key] = slider;
        };

        switch (equationType) {
          case 'lissajous':
            addSlider('A', 'A', 0.2, 2, 0.01, equationParams.A);
            addSlider('B', 'B', 0.2, 2, 0.01, equationParams.B);
            addSlider('a', 'a', 1, 10, 1, equationParams.a);
            addSlider('b', 'b', 1, 10, 1, equationParams.b);
            addSlider('delta', 'delta', 0, Math.PI, 0.01, equationParams.delta);
            break;
          case 'squiggle':
            addSlider('Speed', 'squiggleSpeed', 0.2, 4, 0.01, equationParams.squiggleSpeed);
            addSlider('Amplitude', 'squiggleAmp', 0.1, 3, 0.01, equationParams.squiggleAmp);
            break;
          case 'wave_sweep':
            addSlider('Speed', 'waveSpeed', 0.1, 3, 0.01, equationParams.waveSpeed);
            addSlider('Frequency', 'waveFreq', 0.2, 4, 0.01, equationParams.waveFreq);
            addSlider('Amplitude', 'waveAmp', 0.1, 1.5, 0.01, equationParams.waveAmp);
            break;
          case 'rose':
            addSlider('k', 'k', 1, 12, 1, equationParams.k);
            addSlider('R', 'R', 0.2, 2, 0.01, equationParams.R);
            break;
          case 'hypotrochoid':
          case 'epitrochoid':
            addSlider('R', 'bigR', 1, 20, 0.1, equationParams.bigR);
            addSlider('r', 'smallr', 0.5, 20, 0.1, equationParams.smallr);
            addSlider('d', 'd', 0, 20, 0.1, equationParams.d);
            break;
          case 'lemniscate':
            addSlider('A', 'ALem', 0.2, 2, 0.01, equationParams.ALem);
            addSlider('B', 'BLem', 0.2, 2, 0.01, equationParams.BLem);
            break;
          case 'arch_spiral':
            addSlider('a', 'aSpiral', 0.0, 0.2, 0.001, equationParams.aSpiral);
            addSlider('b', 'bSpiral', 0.0, 0.2, 0.001, equationParams.bSpiral);
            break;
        }
      };

      buildEquationParamSliders();

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

      p.createP('Shape:').parent(controlPanel);
      shapeSelect = p.createSelect();
      shapeSelect.parent(controlPanel);
      shapeSelect.option('Circle', 'circle');
      shapeSelect.option('Square', 'square');
      shapeSelect.option('Diamond', 'diamond');
      shapeSelect.selected(currentShape);
      shapeSelect.changed(() => {
        currentShape = shapeSelect.value();
      });

      strokeCheckbox = p.createCheckbox('Show Stroke', showStroke);
      strokeCheckbox.parent(controlPanel);
      strokeCheckbox.changed(() => {
        showStroke = strokeCheckbox.checked();
      });

      hollowCheckbox = p.createCheckbox('Hollow Mode', hollowMode);
      hollowCheckbox.parent(controlPanel);
      hollowCheckbox.changed(() => {
        hollowMode = hollowCheckbox.checked();
      });
    }
  };

  const connectMagic = async () => {
    try {
      await magic.connect({ mesh: false, auto: true });
      console.log("Magic connected. Modules:", magic.modules);
      isMagic = true;
      path = [{ x: currentX, y: currentY }];
      
      // Initialize Magic orientation values for sensor detection
      if (magic.modules.imu?.orientation) {
        lastMagicY = magic.modules.imu.orientation.y;
        lastMagicW = magic.modules.imu.orientation.w;
      }
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
    
    // Check for significant sensor changes to auto-trigger sensor mode
    if (!sensorModeTriggered && hasDeviceOrientation) {
      const betaChange = Math.abs(event.beta - lastSensorBeta);
      const gammaChange = Math.abs(event.gamma - lastSensorGamma);
      
      if (betaChange > sensorThreshold || gammaChange > sensorThreshold) {
        sensorModeTriggered = true;
        controlMode = 'device_orientation';
        console.log("Sensor mode auto-activated due to device movement");
      }
    }
    
    lastSensorBeta = event.beta;
    lastSensorGamma = event.gamma;
  };

  // --- Mobile-specific: minimal equation controls ---
  const attachMobileEquationControls = (parent) => {
    if (!isSmallScreen) return;
    const eqBlock = p.createDiv('');
    eqBlock.parent(parent);
    p.createSpan('Equation: ').parent(eqBlock);
    const sel = p.createSelect();
    sel.parent(eqBlock);
    sel.option('Lissajous', 'lissajous');
    sel.option('Squiggle', 'squiggle');
    sel.option('Wave Sweep', 'wave_sweep');
    sel.option('Rose', 'rose');
    sel.option('Hypotrochoid', 'hypotrochoid');
    sel.option('Epitrochoid', 'epitrochoid');
    sel.option('Lemniscate', 'lemniscate');
    sel.option('Archimedean Spiral', 'arch_spiral');
    sel.selected(equationType);
    sel.changed(() => {
      const newType = sel.value();
      if (newType !== equationType) {
        startEquationTransition(newType, equationParams);
      }
    });
    p.createSpan(' Speed ').parent(eqBlock);
    const sp = p.createSlider(0.001, 0.2, dt, 0.001);
    sp.parent(eqBlock);
    sp.style('width', '100%');
    sp.input(() => { dt = sp.value(); });
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
    // Initialize prevColors to avoid first-frame null blend
    prevColors = colors.slice();

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
    console.log("Auto-transitions: Colors every 5s, Equations every 10s, Sensor mode auto-activates on device/Magic movement");
    lastMotionMs = performance.now();
    lastEquationSwitchAtMs = lastMotionMs;
    lastPaletteSwitchAtMs = lastMotionMs;
    lastAutoPaletteSwitchAtMs = lastMotionMs;
    lastAutoEquationSwitchAtMs = lastMotionMs;
    
    // Initialize Magic orientation values if Magic is already connected
    if (isMagic && magic.modules?.imu?.orientation) {
      lastMagicY = magic.modules.imu.orientation.y;
      lastMagicW = magic.modules.imu.orientation.w;
    }
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
    p.clear();

    // Update variables from controls if they're showing
    if (showControls && controlPanel) {
      LERP_FACTOR = lerpSlider.value();
      SIZE_SCALE_FACTOR = scaleSlider.value();
      MAX_PATH_POINTS = pathSlider.value();
      circleSize = p.width * circleSizeSlider.value();
    } else if (isSmallScreen && mobileMenu && mobileMenu.sliders) {
      // Use mobile sliders when on small screen and mobile menu exists
      LERP_FACTOR = mobileMenu.sliders.lerp.value();
      SIZE_SCALE_FACTOR = mobileMenu.sliders.scale.value();
      MAX_PATH_POINTS = mobileMenu.sliders.path.value();
      circleSize = p.width * mobileMenu.sliders.circleSize.value();
    }

    // Update value displays only if desktop control panel is showing
    if (showControls && controlPanel && rawValuesDisplay && targetValuesDisplay) {
      let rawX = 0, rawY = 0;
      switch (controlMode) {
        case 'mouse':
          rawX = p.mouseX;
          rawY = p.mouseY;
          break;
        case 'magic_orientation':
          if (isMagic && magic.modules.imu?.orientation) {
            let inv1 = -1;
            
            rawY = magic.modules.imu.orientation.w;
            rawX = magic.modules.imu.orientation.y;
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
        case 'equation':
          rawX = 0;
          rawY = 0;
          break;
      }
      
      rawValuesDisplay.html(`Raw: x: ${Math.round(rawX)}, y: ${Math.round(rawY)}`);
      targetValuesDisplay.html(`Target: x: ${Math.round(targetX)}, y: ${Math.round(targetY)}`);
    }



    // --- Update Target Position based on control mode ---
    const padding = Math.max(p.width, p.height) * 0.1; // 10% padding on all sides
    const safeWidth = p.width - (padding * 2);
    const safeHeight = p.height - (padding * 2);
    
    switch (controlMode) {
      case 'mouse':
        // Use touch position on mobile, mouse position on desktop
        if (isMobileDevice && isTouching) {
          targetX = p.constrain(touchX, padding, p.width - padding);
          targetY = p.constrain(touchY, padding, p.height - padding);
        } else {
          targetX = p.constrain(p.mouseX, padding, p.width - padding);
          targetY = p.constrain(p.mouseY, padding, p.height - padding);
        }
        break;
      case 'magic_orientation':
        if (isMagic && magic.modules.imu?.orientation) {
          let invertX = 1;
          let invertY = -1;
          let rotY = magic.modules.imu.orientation.w * invertX;
          let rotW = magic.modules.imu.orientation.y * invertY;
          targetX = p.constrain(p.map(-rotW, -0.3, 0.3, padding, p.width - padding, true), padding, p.width - padding);
          targetY = p.constrain(p.map(-rotY, -0.3, 0.3, padding, p.height - padding, true), padding, p.height - padding);
        }
        break;
      case 'device_orientation':
        if (hasDeviceOrientation) {
          // Map gamma (-90 to 90) to width
          targetX = p.constrain(p.map(deviceOrientationData.gamma, -45, 45, padding, p.width - padding, true), padding, p.width - padding);
          // Map beta (-180 to 180) to height, focusing on the -90 to 90 range for better control
          targetY = p.constrain(p.map(deviceOrientationData.beta, -45, 45, padding, p.height - padding, true), padding, p.height - padding);
        }
        break;
      case 'joystick':
        if (magic.modules.joystick) {
          const joy = magic.modules.joystick;
          targetX = p.constrain(p.map(joy.x, -1, 1, padding, p.width - padding, true), padding, p.width - padding);
          targetY = p.constrain(p.map(joy.y, -1, 1, padding, p.height - padding, true), padding, p.height - padding);
        }
        break;
      case 'equation': {
        // Update equation params from sliders (desktop only)
        if (equationParamSliders && Object.keys(equationParamSliders).length) {
          Object.entries(equationParamSliders).forEach(([key, slider]) => {
            if (slider && slider.value) {
              equationParams[key] = slider.value();
            }
          });
        }
        // Update dt if slider exists
        if (equationDtSlider && equationDtSlider.value) {
          dt = equationDtSlider.value();
        }

        // Use blended equation point during transitions
        const pt = getBlendedEquationPoint(t);
        const xNorm = clamp(pt.x, -1, 1);
        const yNorm = clamp(pt.y, -1, 1);
        targetX = p.width * (0.5 + 0.35 * xNorm); // Reduced from 0.45 to 0.4 (0.9 * 0.45 ≈ 0.4)
        targetY = p.height * (0.5 + 0.35 * yNorm);
        t += dt;
        break;
      }
    }

    // --- Ambient Mode Detection and Scheduling ---
    const nowMs = performance.now();
    
    // --- Check for Magic orientation changes to auto-trigger sensor mode ---
    if (isMagic && magic.modules.imu?.orientation) {
      const currentMagicY = magic.modules.imu.orientation.y;
      const currentMagicW = magic.modules.imu.orientation.w;
      const magicYChange = Math.abs(currentMagicY - lastMagicY);
      const magicWChange = Math.abs(currentMagicW - lastMagicW);
      
      if (magicYChange > 0.1 || magicWChange > 0.1) { // Magic values are typically 0-1 range
        // Force exit ambient mode and switch to Magic mode when movement detected
        if (isAmbient) {
          isAmbient = false;
          ambientPrevMode = 'magic_orientation';
        }
        controlMode = 'magic_orientation';
        // Update motion timer to prevent immediate ambient mode
        lastMotionMs = nowMs;
        console.log("Magic sensor mode activated due to device movement");
      }
      
      lastMagicY = currentMagicY;
      lastMagicW = currentMagicW;
    }
    
    // Measure sensor/mouse movement magnitude
    const dx = targetX - prevTargetX;
    const dy = targetY - prevTargetY;
    const sensorDx = (deviceOrientationData.gamma || 0) - prevSensorX;
    const sensorDy = (deviceOrientationData.beta || 0) - prevSensorY;
    const mouseDx = p.mouseX - prevMouseX;
    const mouseDy = p.mouseY - prevMouseY;
    
    // Add Magic orientation movement detection
    let magicDx = 0, magicDy = 0;
    if (isMagic && magic.modules.imu?.orientation) {
      magicDx = Math.abs(magic.modules.imu.orientation.y - lastMagicY);
      magicDy = Math.abs(magic.modules.imu.orientation.w - lastMagicW);
    }
    
    prevMouseX = p.mouseX;
    prevMouseY = p.mouseY;
    prevTargetX = targetX;
    prevTargetY = targetY;
    prevSensorX = deviceOrientationData.gamma || 0;
    prevSensorY = deviceOrientationData.beta || 0;
    // Aggregate movement: in ambient, ignore target/equation motion. Only count user inputs
    // (mouse, device orientation, joystick if present). Outside ambient, include target motion.
    let movementMag = 0;
    if (isAmbient) {
      movementMag = Math.hypot(sensorDx, sensorDy) * 5 + Math.hypot(mouseDx, mouseDy) + Math.hypot(magicDx, magicDy) * 10;
      // Optionally include joystick deltas
      if (magic.modules?.joystick) {
        const jx = magic.modules.joystick.x || 0;
        const jy = magic.modules.joystick.y || 0;
        const jdx = jx - prevJoyX;
        const jdy = jy - prevJoyY;
        movementMag += Math.hypot(jdx, jdy) * 200; // scale small joystick deltas
        prevJoyX = jx; prevJoyY = jy;
      }
    } else {
      movementMag = Math.hypot(dx, dy) + Math.hypot(sensorDx, sensorDy) * 5 + Math.hypot(mouseDx, mouseDy) + Math.hypot(magicDx, magicDy) * 10;
    }
    // Base threshold adapts to canvas size
    const MOVEMENT_THRESHOLD = Math.max(20, Math.min(p.width, p.height) * 0.01);
    // When in ambient, require sustained, larger motion to exit to avoid flapping
    const EXIT_MULTIPLIER = 3;
    const exitThreshold = isAmbient ? MOVEMENT_THRESHOLD * EXIT_MULTIPLIER : MOVEMENT_THRESHOLD;
    if (movementMag > exitThreshold) {
      lastMotionMs = nowMs;
      if (isAmbient) {
        // Exit ambient on motion
        // Debounce: only allow exit if ambient has run for at least 1.5s
        if (nowMs - ambientStartedAtMs > 1500) {
          isAmbient = false;
          if (ambientPrevMode) controlMode = ambientPrevMode;
        }
      }
    }

    if (AMBIENT_ENABLED && !isAmbient && nowMs - lastMotionMs > idleTimeoutMs) {
      // Enter ambient
      isAmbient = true;
      ambientPrevMode = controlMode;
      controlMode = 'equation';
      ambientEquationIndex = 0;
      equationType = ambientEquationOrder[ambientEquationIndex % ambientEquationOrder.length];
      equationParams = randomAmbientParamsFor(equationType);
      t = 0;
      path = [{ x: currentX, y: currentY }];
      lastEquationSwitchAtMs = nowMs;
      lastPaletteSwitchAtMs = nowMs;
      ambientStartedAtMs = nowMs;
    }

    // --- Auto-transitions (only when NOT in ambient mode) ---
    if (!isAmbient) {
      if (nowMs - lastAutoPaletteSwitchAtMs >= autoPaletteSwitchMs) {
        const paletteNames = Object.keys(palettes);
        const randomPaletteName = paletteNames[Math.floor(p.random(paletteNames.length))];
        const randomPalette = palettes[randomPaletteName];
        const newColors = Object.values(randomPalette).map(c => c.startsWith('#') ? c : `#${c}`);
        startPaletteTransition(newColors);
        lastAutoPaletteSwitchAtMs = nowMs;
        console.log("Auto palette transition:", randomPaletteName);
      }
      
      if (nowMs - lastAutoEquationSwitchAtMs >= autoEquationSwitchMs) {
        if (controlMode === 'equation') {
          const equationTypes = ['lissajous', 'squiggle', 'wave_sweep', 'rose', 'hypotrochoid', 'epitrochoid', 'lemniscate', 'arch_spiral'];
          const randomEquationType = equationTypes[Math.floor(p.random(equationTypes.length))];
          const newParams = randomAmbientParamsFor(randomEquationType);
          startEquationTransition(randomEquationType, newParams);
          console.log("Auto equation transition:", randomEquationType);
        }
        lastAutoEquationSwitchAtMs = nowMs;
      }
    }
    
    if (isAmbient) {
      // Rotate equation
      if (nowMs - lastEquationSwitchAtMs >= ambientEquationSwitchMs) {
        ambientEquationIndex = (ambientEquationIndex + 1) % ambientEquationOrder.length;
        const newType = ambientEquationOrder[ambientEquationIndex];
        const newParams = randomAmbientParamsFor(newType);
        startEquationTransition(newType, newParams);
        lastEquationSwitchAtMs = nowMs;
      }
      // Rotate palette
      if (nowMs - lastPaletteSwitchAtMs >= ambientPaletteSwitchMs) {
        const paletteNames = Object.keys(palettes);
        const randomPaletteName = paletteNames[Math.floor(p.random(paletteNames.length))];
        const randomPalette = palettes[randomPaletteName];
        const newColors = Object.values(randomPalette).map(c => c.startsWith('#') ? c : `#${c}`);
        startPaletteTransition(newColors);
        lastPaletteSwitchAtMs = nowMs;
      }
    }

    // Update palette fade speed from UI if available
    if (paletteFadeSlider) {
      paletteFadeSpeed = paletteFadeSlider.value();
    }
    // Advance crossfade progress
    if (paletteTransitionProgress < 1) {
      paletteTransitionProgress = Math.min(1, paletteTransitionProgress + paletteFadeSpeed);
    }
    
    // Advance equation transition progress
    if (equationTransitionProgress < 1) {
      equationTransitionProgress = Math.min(1, equationTransitionProgress + equationTransitionSpeed);
      if (equationTransitionProgress >= 1) {
        isTransitioningEquations = false;
      }
    }

    // --- Smoothly Update Current Position ---
    currentX = p.lerp(currentX, targetX, LERP_FACTOR);
    currentY = p.lerp(currentY, targetY, LERP_FACTOR);

    // --- Update Path ---
    path.push({ x: currentX, y: currentY });
    // Immediately trim to the new MAX_PATH_POINTS when decreased
    while (path.length > MAX_PATH_POINTS) {
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
        // Sample colors with crossfade support
        let color1 = getBlendedColor(colorIndex, paletteTransitionProgress);
        let color2 = getBlendedColor(nextColorIndex, paletteTransitionProgress);
        let lerpedColor = p.lerpColor(color1, color2, interpolationFactor);
        let nextNextColorIndex = (nextColorIndex + 1) % colors.length;
        let color3 = getBlendedColor(nextNextColorIndex, paletteTransitionProgress);
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

        // Handle stroke and fill based on hollow mode
        if (hollowMode) {
          // Hollow mode: no fill, large stroke with gradient
          p.noFill();
          p.strokeWeight(currentCircleSize * 0.15); // Proportional stroke weight
        } else {
          // Normal mode: fill with gradient, optional stroke
          if (showStroke) {
            p.stroke(255, 255, 255, 0.5);
            p.strokeWeight(2);
          } else {
            p.noStroke();
          }
        }

        // Draw the appropriate shape based on currentShape
        p.push();
        p.translate(pt.x, pt.y);
        
        switch (currentShape) {
          case 'square':
            p.rectMode(p.CENTER);
            p.rect(0, 0, currentCircleSize, currentCircleSize);
            break;
          case 'diamond':
            p.rotate(p.PI / 4); // Rotate 45 degrees
            p.rectMode(p.CENTER);
            p.rect(0, 0, currentCircleSize, currentCircleSize);
            break;
          case 'circle':
          default:
            p.ellipse(0, 0, currentCircleSize, currentCircleSize);
            break;
        }
        
        p.pop();
      }
    }

    // --- Apply Noise Overlay ---
    if (noiseTexture) {
      p.push();
      p.blendMode(p.SCREEN);
      // p.image(noiseTexture, 0, 0);
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
      const paletteNames = Object.keys(palettes);
      const randomPaletteName = paletteNames[Math.floor(p.random(paletteNames.length))];
      const randomPalette = palettes[randomPaletteName];
      const newColors = Object.values(randomPalette).map(c => c.startsWith('#') ? c : `#${c}`);
      startPaletteTransition(newColors);
    }
    if (p.key === 's' || p.key === 'S') {
      p.save('gradient-path.png');
      console.log("Saved canvas to gradient-path.png");
    }
    if (p.key === 'c' || p.key === 'C') {
      t = 0;
      path = [{ x: currentX, y: currentY }];
      // Reset transition state when clearing
      equationTransitionProgress = 1;
      isTransitioningEquations = false;
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
        
        // Initialize Magic orientation values for sensor detection
        if (magic.modules.imu?.orientation) {
          lastMagicY = magic.modules.imu.orientation.y;
          lastMagicW = magic.modules.imu.orientation.w;
        }
      } catch (error) {
        console.error("Failed to connect magic:", error);
        isMagic = false; // Ensure isMagic is false if connection failed
        console.log("Magic connection failed, using mouse control.");
      }
    }
    // Any gesture counts as motion, reset ambient timer
    lastMotionMs = performance.now();
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