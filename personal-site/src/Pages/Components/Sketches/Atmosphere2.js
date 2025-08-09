import * as magic from "@indistinguishable-from-magic/magic-js"

const Atmosphere = (p) => {
  let isMagic = false;
  let lightValue = 0;
  let noiseTexture;
  let currentPhase = 'Sun';
  let transitionProgress = 0;
  let targetColors = null;
  let currentColors = null;

  let gradientPositions = [0.0, 0.33, 0.66, 1.0];
  // Temperature-based color palettes - maximally stretched across spectrums
  const atmospherePalettes = {
    'Hot': ['#000000', '#8B0000', '#FF0000', '#FF69B4'], // Black to deep crimson to pure red to hot pink (high temperature)
    'Warm': ['#FF4500', '#FF8C00', '#FFD700', '#FFFF00'], // Deep orange to bright yellow (mid-high temperature)
    'Neutral': ['#FFFF00', '#00FF00', '#32CD32', '#006400'], // Bright yellow to lime green to forest green to dark green (neutral temperature)
    'Cool': ['#000080', '#191970', '#4169E1', '#87CEEB'], // Deep navy to midnight blue to royal blue to sky blue (mid-low temperature)
    'Cold': ['#FFFFFF', '#F0F8FF', '#B0E0E6', '#000080']  // Pure white to ice blue to powder blue to deep navy (low temperature)
  };

  let allDark = true;
  let darkBg = '#000000';

  let lastWasDark = false;
  let sizeMultiplier = 0;

  let padding = 0;
  let fontSizeDescription = 0;
  let fontSizeText = 0;
  let textPadding = 0;
  let lineHeightText = 0;
  let lineHeightDescription = 0;
  let logoSize = 0;

  let bgColor = "#2F5DA9";
  let textColor = "#fffdf3";

  let selectedAtmosphereColors = null;
  let selectedAtmosphere = null;
  let minWidthHeight = 0;

  let isDevMode = true;
  let time = 0;
  
  // Shader variables
  let gradientShader;
  let animationTime = 0;

  let lightGraphic;
  let darkGraphic;

  let canvasWidth = 0;
  let canvasHeight = 0;

  // Debug variables
  let debugMode = true;
  let showPaletteName = false;
  
  // Control mode variables
  let controlMode = 'none'; // 'none', 'size', 'palette', 'light', 'gradient'
  let controlBanner = {
    visible: false,
    text: '',
    timer: 0
  };
  
  // Light control variable
  let lightControl = 0.5; // 0-1 range for manual light control
  
  // Mesh gradient control variables - 2D anchor points
  let gradientAnchors = [
    { x: 0.0, y: 0.0, color: 0 },    // Top-left anchor
    { x: 1.0, y: 0.0, color: 1 },    // Top-right anchor
    { x: 0.0, y: 1.0, color: 2 },    // Bottom-left anchor
    { x: 1.0, y: 1.0, color: 3 }     // Bottom-right anchor
  ];
  let selectedAnchor = 0; // Which anchor is being controlled
  
  // Debug control variables
  let debugControls = {
    light: 0.5,
    humidity: 0.5,
    pressure: 0.5,
    aqi: 0.5,
    temperature: 0.5,
    co2: 0.5,
    animationSpeed: 0.05,
    gradientRadius: 0.5
  };

  p.setup = () => {
    // Create the gradient shader
    const vertShader = `
      attribute vec3 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;
      
      void main() {
        vTexCoord = aTexCoord;
        vec4 positionVec4 = vec4(aPosition, 1.0);
        positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
        gl_Position = positionVec4;
      }
    `;
    
    const fragShader = `
      precision mediump float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color0;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform float u_light;
      uniform float u_pressure;
      
      varying vec2 vTexCoord;
      
      vec3 bilinearInterpolate(vec2 uv, vec3 c00, vec3 c10, vec3 c01, vec3 c11) {
        vec3 top = mix(c00, c10, uv.x);
        vec3 bottom = mix(c01, c11, uv.x);
        return mix(top, bottom, uv.y);
      }
      
      void main() {
        vec2 uv = vTexCoord;
        
        // Animated anchor positions with light control - concentrated within sphere
        float t = u_time * 0.5;
        float radius = 0.25 * u_light; // Reduced radius to keep action within 0.5 sphere
        float centerX = 0.5;
        float centerY = 0.5;
        
        // Irregular chaotic motion using noise and fractals - concentrated within sphere
        vec2 anchor0 = vec2(
          centerX + radius * (sin(t * 2.3) * cos(t * 1.7) + 0.3 * sin(t * 7.1) * cos(t * 3.2)),
          centerY + radius * (cos(t * 1.9) * sin(t * 2.1) + 0.3 * cos(t * 5.8) * sin(t * 4.3))
        );
        vec2 anchor1 = vec2(
          centerX + radius * (sin((t + 1.57) * 2.7) * cos((t + 1.57) * 1.3) + 0.4 * sin((t + 1.57) * 6.2) * cos((t + 1.57) * 2.8)),
          centerY + radius * (cos((t + 1.57) * 2.1) * sin((t + 1.57) * 1.8) + 0.4 * cos((t + 1.57) * 4.9) * sin((t + 1.57) * 3.7))
        );
        vec2 anchor2 = vec2(
          centerX + radius * (sin((t + 3.14) * 1.8) * cos((t + 3.14) * 2.4) + 0.5 * sin((t + 3.14) * 8.3) * cos((t + 3.14) * 1.9)),
          centerY + radius * (cos((t + 3.14) * 2.6) * sin((t + 3.14) * 1.4) + 0.5 * cos((t + 3.14) * 7.1) * sin((t + 3.14) * 2.2))
        );
        vec2 anchor3 = vec2(
          centerX + radius * (sin((t + 4.71) * 2.1) * cos((t + 4.71) * 1.6) + 0.6 * sin((t + 4.71) * 9.2) * cos((t + 4.71) * 2.5)),
          centerY + radius * (cos((t + 4.71) * 1.7) * sin((t + 4.71) * 2.9) + 0.6 * cos((t + 4.71) * 6.8) * sin((t + 4.71) * 1.8))
        );
        
        // Clamp anchor positions to keep them in bounds
        anchor0 = clamp(anchor0, 0.0, 1.0);
        anchor1 = clamp(anchor1, 0.0, 1.0);
        anchor2 = clamp(anchor2, 0.0, 1.0);
        anchor3 = clamp(anchor3, 0.0, 1.0);
        
        // Elliptical mask with proper centering
        vec2 centeredUV = uv - 0.5;
        
        // Create elliptical distortion based on aspect ratio - responsive to orientation
        float aspectRatio = u_resolution.x / u_resolution.y;
        vec2 ellipticalUV = centeredUV;
        
        // Handle both horizontal and vertical orientations
        if (aspectRatio > 1.0) {
          // Horizontal orientation (width > height)
          ellipticalUV.x *= aspectRatio;
        } else {
          // Vertical orientation (height > width)
          ellipticalUV.y /= aspectRatio;
        }
        
        float dist = length(ellipticalUV);
        
        // Ring-like edge structure with pressure control
        float edgeSoftness = mix(0.01, 0.15, u_pressure); // Pressure controls softness range
        
        // Create multiple ring layers
        float ring1 = smoothstep(0.5, 0.48, dist); // Outer ring
        float ring2 = smoothstep(0.48, 0.46, dist); // Middle ring
        float ring3 = smoothstep(0.46, 0.44, dist); // Inner ring
        
        // Combine rings with pressure-based blending
        float ringStructure = mix(ring1, ring2 * ring3, u_pressure);
        float ellipseMask = smoothstep(0.5, 0.5 - edgeSoftness, dist) * ringStructure;
        
        // Center the gradient properly - responsive to orientation
        vec2 gradientUV = uv;
        
        // Adjust gradient scaling for vertical orientation
        if (aspectRatio < 1.0) {
          // Vertical orientation - scale gradient to fit properly
          gradientUV = (uv - 0.5) * vec2(1.0, aspectRatio) + 0.5;
        }
        
        // Irregular chaotic color mixing with multiple frequencies
        vec3 movingColor0 = mix(u_color0, u_color1, 0.5 + 0.5 * (sin(t * u_light * 2.3) + 0.3 * sin(t * u_light * 7.1) + 0.2 * sin(t * u_light * 13.7)));
        vec3 movingColor1 = mix(u_color1, u_color2, 0.5 + 0.5 * (sin((t + 1.57) * u_light * 2.7) + 0.4 * sin((t + 1.57) * u_light * 6.2) + 0.3 * sin((t + 1.57) * u_light * 11.8)));
        vec3 movingColor2 = mix(u_color2, u_color3, 0.5 + 0.5 * (sin((t + 3.14) * u_light * 1.8) + 0.5 * sin((t + 3.14) * u_light * 8.3) + 0.4 * sin((t + 3.14) * u_light * 15.2)));
        vec3 movingColor3 = mix(u_color3, u_color0, 0.5 + 0.5 * (sin((t + 4.71) * u_light * 2.1) + 0.6 * sin((t + 4.71) * u_light * 9.2) + 0.5 * sin((t + 4.71) * u_light * 17.3)));
        
        // Use the moving colors for the gradient with centered UVs
        vec3 color = bilinearInterpolate(gradientUV, movingColor0, movingColor1, movingColor2, movingColor3);
        
        // Add light-based brightness adjustment
        color *= (0.5 + 0.5 * u_light);
        
        // Create iridescent ring effect
        float ringIntensity = smoothstep(0.5, 0.45, dist) * (1.0 - smoothstep(0.45, 0.4, dist));
        vec3 iridescentColor = vec3(0.8, 0.9, 1.0) * ringIntensity; // Light blue/cyan iridescent
        
        // Blend iridescent effect with main color
        color = mix(color, iridescentColor, ringIntensity * 0.3);
        
        // Apply elliptical mask with ring structure
        color *= ellipseMask;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    
    gradientShader = p.createShader(vertShader, fragShader);
    
    // Randomly select an atmosphere palette
    const atmosphereNames = Object.keys(atmospherePalettes);
    selectedAtmosphere = atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)];
    selectedAtmosphereColors = atmospherePalettes[selectedAtmosphere];
    
    // Create multiple color sets for complex effects
    atmosphereColors1 = atmospherePalettes[atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)]];
    atmosphereColors2 = atmospherePalettes[atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)]];
    atmosphereColors3 = atmospherePalettes[atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)]];

    p.pixelDensity(1);

    canvasWidth = p.windowWidth;
    canvasHeight = p.windowHeight;
    
    // Ensure the canvas fills the entire container
    p.resizeCanvas(canvasWidth, canvasHeight);
    
    // Set canvas style to remove any default margins/padding
    const canvas = p.canvas;
    if (canvas) {
      canvas.style.margin = '0';
      canvas.style.padding = '0';
      canvas.style.display = 'block';
    }
    minWidthHeight = Math.min(canvasWidth, canvasHeight);
    padding = minWidthHeight * 0.075;
    fontSizeText = minWidthHeight * 0.037;
    fontSizeDescription = minWidthHeight * 0.06;
    lineHeightText = fontSizeText * 1.5;
    lineHeightDescription = fontSizeDescription * 1.5;

    p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);

    p.textAlign(p.CENTER, p.CENTER);
    p.imageMode(p.CENTER);
    p.background(bgColor);
    let seed = Math.floor(Math.random() * 1000);
    p.randomSeed(seed);
    p.noiseSeed(seed);

    darkGraphic = p.createGraphics(p.width, p.height);
    darkGraphic.background(bgColor);
    darkGraphic.translate(p.width * 0.5, p.height * 0.5);
    darkGraphic.scale(atmosphereScale);
    p.drawAtmosphere('Empty');
  };

  let atmosphereScale = 2;
  let currentAtmospherePhase = 'Sun';
  let lastPeakReached = false;
  let atmosphereColors1;
  let atmosphereColors2;
  let atmosphereColors3;

  p.draw = () => {
    // p.background(bgColor); // Temporarily disable background to see gradient

    // Update animation time using debug controls
    animationTime += (debugControls.animationSpeed?.value || 0.05) * 0.05;

    let t = 0;
    if (isDevMode) {
      if (controlMode === 'light') {
        t = lightControl; // Use manual light control
      } else {
        // t = (Math.sin(p.frameCount * 0.01) + 1) / 2; // Auto animation
        t = 4095
      }
    } else if (isMagic && magic.modules.light) {
      let currentReading = 1 - (magic.modules.light.brightness / 4095);
      lightValue = (lightValue * 0.9) + (currentReading * 0.1);
      t = lightValue;
    }

    let eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    let graphicOpacity = eased * 255;

    if (eased > 0.99 && !lastPeakReached) {
      const atmosphereNames = Object.keys(atmospherePalettes).filter(name => name !== currentAtmospherePhase);
      currentAtmospherePhase = atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)];
      selectedAtmosphereColors = atmospherePalettes[currentAtmospherePhase];
      selectedAtmosphereColors.sort(() => Math.random() - 0.5);

      atmosphereColors1 = atmospherePalettes[atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)]];
      atmosphereColors2 = atmospherePalettes[atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)]];
      atmosphereColors3 = atmospherePalettes[atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)]];

      lastPeakReached = true;
    } else if (eased < 0.9) {
      lastPeakReached = false;
    }

    // Handle control mode key inputs
    if (controlMode === 'size') {
      if (p.keyIsDown(p.LEFT_ARROW)) {
        atmosphereScale = Math.max(0.5, atmosphereScale - 0.05);
        controlBanner.text = `Controlling Size: ${atmosphereScale.toFixed(2)}`;
      }
      if (p.keyIsDown(p.RIGHT_ARROW)) {
        atmosphereScale = Math.min(5.0, atmosphereScale + 0.05);
        controlBanner.text = `Controlling Size: ${atmosphereScale.toFixed(2)}`;
      }
    }
    
    if (controlMode === 'palette') {
      if (p.keyIsDown(p.LEFT_ARROW)) {
        const paletteNames = Object.keys(atmospherePalettes);
        const currentIndex = paletteNames.indexOf(selectedAtmosphere);
        const newIndex = (currentIndex - 1 + paletteNames.length) % paletteNames.length;
        selectedAtmosphere = paletteNames[newIndex];
        selectedAtmosphereColors = atmospherePalettes[selectedAtmosphere];
        controlBanner.text = `Controlling Palette: ${selectedAtmosphere}`;
      }
      if (p.keyIsDown(p.RIGHT_ARROW)) {
        const paletteNames = Object.keys(atmospherePalettes);
        const currentIndex = paletteNames.indexOf(selectedAtmosphere);
        const newIndex = (currentIndex + 1) % paletteNames.length;
        selectedAtmosphere = paletteNames[newIndex];
        selectedAtmosphereColors = atmospherePalettes[selectedAtmosphere];
        controlBanner.text = `Controlling Palette: ${selectedAtmosphere}`;
      }
    }
    
    if (controlMode === 'light') {
      if (p.keyIsDown(p.LEFT_ARROW)) {
        lightControl = Math.max(0, lightControl - 0.01);
        controlBanner.text = `Controlling Light: ${lightControl.toFixed(3)}`;
      }
      if (p.keyIsDown(p.RIGHT_ARROW)) {
        lightControl = Math.min(1, lightControl + 0.01);
        controlBanner.text = `Controlling Light: ${lightControl.toFixed(3)}`;
      }
    }
    
    if (controlMode === 'gradient') {
      if (p.keyIsDown(p.LEFT_ARROW)) {
        // Adjust first position point
        gradientPositions[0] = Math.max(0, gradientPositions[0] - 0.01);
        controlBanner.text = `Gradient Pos 1: ${gradientPositions[0].toFixed(3)}`;
      }
      if (p.keyIsDown(p.RIGHT_ARROW)) {
        // Adjust first position point
        gradientPositions[0] = Math.min(1, gradientPositions[0] + 0.01);
        controlBanner.text = `Gradient Pos 1: ${gradientPositions[0].toFixed(3)}`;
      }
      if (p.keyIsDown(p.UP_ARROW)) {
        // Adjust second position point
        gradientPositions[1] = Math.max(0, gradientPositions[1] - 0.01);
        controlBanner.text = `Gradient Pos 2: ${gradientPositions[1].toFixed(3)}`;
      }
      if (p.keyIsDown(p.DOWN_ARROW)) {
        // Adjust second position point
        gradientPositions[1] = Math.min(1, gradientPositions[1] + 0.01);
        controlBanner.text = `Gradient Pos 2: ${gradientPositions[1].toFixed(3)}`;
      }
    }

    // Draw Light Graphic
    p.push();
    p.translate(p.width * 0.5, p.height * 0.5);
    p.scale(atmosphereScale);
    p.drawAtmosphere('Sun');
    p.pop();

    p.push();
    p.tint(255, graphicOpacity);
    p.image(darkGraphic, p.width * 0.5, p.height * 0.5);
    p.pop();

    // Draw debug UI if enabled
    if (debugMode) {
      p.drawDebugUI();
    }
    
    // Draw control banner
    p.drawControlBanner();
  };

  p.ease = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  // Helper function to convert hex to RGB
  p.hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  // Helper function to interpolate between two colors
  p.interpolateColors = (color1, color2, factor) => {
    const rgb1 = p.hexToRgb(color1);
    const rgb2 = p.hexToRgb(color2);
    
    return {
      r: Math.floor(rgb1.r + (rgb2.r - rgb1.r) * factor),
      g: Math.floor(rgb1.g + (rgb2.g - rgb1.g) * factor),
      b: Math.floor(rgb1.b + (rgb2.b - rgb1.b) * factor)
    };
  };

  // Function to get temperature-based palette
  p.getTemperaturePalette = (temperature) => {
    // Map temperature to 0-1 range (assuming temperature is already normalized)
    const temp = Math.max(0, Math.min(1, temperature));
    
    // Define temperature ranges for each palette
    const paletteRanges = [
      { name: 'Cold', min: 0, max: 0.2 },
      { name: 'Cool', min: 0.2, max: 0.4 },
      { name: 'Neutral', min: 0.4, max: 0.6 },
      { name: 'Warm', min: 0.6, max: 0.8 },
      { name: 'Hot', min: 0.8, max: 1.0 }
    ];
    
    // Find which palette range we're in
    let currentPalette = 'Cool';
    let nextPalette = 'Cool';
    let blendFactor = 0;
    
    for (let i = 0; i < paletteRanges.length; i++) {
      const range = paletteRanges[i];
      if (temp >= range.min && temp <= range.max) {
        currentPalette = range.name;
        nextPalette = paletteRanges[Math.min(i + 1, paletteRanges.length - 1)].name;
        
        // Calculate blend factor within this range
        const rangeSize = range.max - range.min;
        const positionInRange = (temp - range.min) / rangeSize;
        blendFactor = positionInRange;
        break;
      }
    }
    
    // Interpolate between current and next palette
    const currentColors = atmospherePalettes[currentPalette];
    const nextColors = atmospherePalettes[nextPalette];
    
    const interpolatedColors = currentColors.map((color, index) => {
      const nextColor = nextColors[index] || color;
      return p.interpolateColors(color, nextColor, blendFactor);
    });
    
    return interpolatedColors;
  };

  // 2D Mesh gradient function - bilinear interpolation
  p.getMeshColor2D = (normalizedX, normalizedY, colorPoints, anchors) => {
    // Find the four surrounding anchor points
    let topLeft = anchors[0];
    let topRight = anchors[1];
    let bottomLeft = anchors[2];
    let bottomRight = anchors[3];
    
    // Get colors for each corner
    let c00 = p.hexToRgb(colorPoints[topLeft.color]);
    let c10 = p.hexToRgb(colorPoints[topRight.color]);
    let c01 = p.hexToRgb(colorPoints[bottomLeft.color]);
    let c11 = p.hexToRgb(colorPoints[bottomRight.color]);
    
    // Bilinear interpolation
    let fx = normalizedX;
    let fy = normalizedY;
    
    // Interpolate horizontally first, then vertically
    let topColor = {
      r: Math.floor(c00.r * (1 - fx) + c10.r * fx),
      g: Math.floor(c00.g * (1 - fx) + c10.g * fx),
      b: Math.floor(c00.b * (1 - fx) + c10.b * fx)
    };
    
    let bottomColor = {
      r: Math.floor(c01.r * (1 - fx) + c11.r * fx),
      g: Math.floor(c01.g * (1 - fx) + c11.g * fx),
      b: Math.floor(c01.b * (1 - fx) + c11.b * fx)
    };
    
    // Interpolate vertically
    let finalColor = {
      r: Math.floor(topColor.r * (1 - fy) + bottomColor.r * fy),
      g: Math.floor(topColor.g * (1 - fy) + bottomColor.g * fy),
      b: Math.floor(topColor.b * (1 - fy) + bottomColor.b * fy)
    };
    
    return finalColor;
  };

  // Original 1D mesh gradient function (keeping for compatibility)
  p.getMeshColor = (normalizedX, colorPoints, positionPoints) => {
    // Interpolate between color points
    for (let i = 0; i < colorPoints.length - 1; i++) {
      if (normalizedX >= positionPoints[i] && normalizedX <= positionPoints[i + 1]) {
        let blendFactor = p.map(normalizedX, positionPoints[i], positionPoints[i + 1], 0, 1);
        return p.interpolateColors(colorPoints[i], colorPoints[i + 1], blendFactor);
      }
    }
    // Default to the last color if out of range
    return p.hexToRgb(colorPoints[colorPoints.length - 1]);
  };

  p.mousePressed = async () => {
    // Magic connection logic
    // if (isDevMode) {
    //   isDevMode = false;
    //   if (!isMagic) {
    //     magic.connect({ mesh: false, auto: true });
    //     console.log(magic.modules);
    //     isMagic = true;
    //   }
    // } else {
    //   isDevMode = true;
    // }
    p.loop();
  };

  p.windowResized = () => {
    canvasWidth = p.windowWidth;
    canvasHeight = p.windowHeight;
    p.resizeCanvas(canvasWidth, canvasHeight);
    
    // Maintain canvas styles after resize
    const canvas = p.canvas;
    if (canvas) {
      canvas.style.margin = '0';
      canvas.style.padding = '0';
      canvas.style.display = 'block';
    }
  };

  p.drawAtmosphere = (phase) => {
    let diameter = minWidthHeight - 2 * padding;
    let radius = diameter / 2;

    p.translate(0, radius / 2);
    if (phase !== 'Empty') {
      // Background gradient
      p.push();
      p.translate(0, -radius);
      // let backgroundGradient = p.drawingContext.createLinearGradient(0, p.height, p.width, 0);
      // backgroundGradient.addColorStop(0, p.color(selectedAtmosphereColors[0] || '#FFFFFF'));
      // backgroundGradient.addColorStop(0.3, p.color(selectedAtmosphereColors[1]));
      // backgroundGradient.addColorStop(0.6, p.color(selectedAtmosphereColors[2]));
      // backgroundGradient.addColorStop(1.0, p.color(selectedAtmosphereColors[3]));

      // p.drawingContext.fillStyle = backgroundGradient;
      p.noStroke();
      // p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
      p.pop();

      // Draw atmospheric sphere with enhanced effects
      p.push();
      
      if (allDark) {
        p.noStroke();
        
        // Use shader for efficient gradient rendering
        p.shader(gradientShader);
        
        // Get temperature-based palette
        const temperature = debugControls.temperature?.value || 0.5;
        const temperatureColors = p.getTemperaturePalette(temperature);
        
        // Convert RGB objects to arrays for shader
        const color0 = [temperatureColors[0].r / 255, temperatureColors[0].g / 255, temperatureColors[0].b / 255];
        const color1 = [temperatureColors[1].r / 255, temperatureColors[1].g / 255, temperatureColors[1].b / 255];
        const color2 = [temperatureColors[2].r / 255, temperatureColors[2].g / 255, temperatureColors[2].b / 255];
        const color3 = [temperatureColors[3].r / 255, temperatureColors[3].g / 255, temperatureColors[3].b / 255];
        
        // Set shader uniforms
        gradientShader.setUniform('u_resolution', [p.width, p.height]);
        gradientShader.setUniform('u_time', animationTime);
        gradientShader.setUniform('u_color0', color0);
        gradientShader.setUniform('u_color1', color1);
        gradientShader.setUniform('u_color2', color2);
        gradientShader.setUniform('u_color3', color3);
        
        // Add light control uniform
        gradientShader.setUniform('u_light', debugControls.light?.value || 0.5);
        
        // Add pressure control uniform
        gradientShader.setUniform('u_pressure', debugControls.pressure?.value || 0.5);
        
        if (debugMode) {
          console.log('Animation time:', animationTime);
        }
        
        // Draw full-screen quad (regular canvas coordinates)
        p.rect(0, 0, p.width, p.height);
        
        // Reset shader to default
        p.resetShader();
        
        if (debugMode) {
          console.log('Drawing shader gradient');
          console.log('Colors:', selectedAtmosphereColors);
        }
      } else {
        p.noFill();
        p.drawingContext.shadowBlur = padding / 2;
        p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.25)';
        p.ellipse(0, -radius / 2, radius, radius);
      }

      p.pop();
    } else {
      // Dark mode
      darkGraphic.push();
      darkGraphic.translate(0, radius / 2);
      darkGraphic.noFill();
      if (allDark) {
        darkGraphic.background(darkBg);
      } else {
        darkGraphic.background(bgColor);
      }
      darkGraphic.stroke(textColor);
      darkGraphic.strokeWeight(1);
      darkGraphic.ellipse(0, -radius / 2, radius, radius);

      if (!allDark) {
        darkGraphic.stroke(textColor + "08");
        let blueprintColumns = 50;
        let squareSize = p.width / blueprintColumns;
        let blueprintRows = Math.round(p.height / squareSize) + 1;

        darkGraphic.push();
        darkGraphic.translate(-p.width / 2, -p.height / 2);
        for (let i = 0; i < blueprintRows; i++) {
          darkGraphic.line(0, i * squareSize, p.width, i * squareSize);
        }

        for (let i = 0; i < blueprintColumns; i++) {
          darkGraphic.line(-squareSize / 2 + i * squareSize, 0, -squareSize / 2 + i * squareSize, p.height);
        }
        darkGraphic.pop();

        darkGraphic.stroke(textColor + "22");
        darkGraphic.rectMode(p.CENTER);
        darkGraphic.rect(0, -radius / 2, radius, radius);
      }
      darkGraphic.pop();
    }
  };

  p.drawDebugUI = () => {
    // Draw simple debug info panel
    p.push();
    p.fill(0, 0, 0, 200);
    p.stroke(255, 255, 255, 100);
    p.strokeWeight(1);
    p.rect(10, 10, 320, 280, 8);
    
    // Draw title
    p.fill(255);
    p.textSize(16);
    p.textAlign(p.LEFT, p.TOP);
    p.text('Atmosphere Debug Info', 20, 20);
    
    // Draw info with control instructions
    p.textSize(12);
    p.text(`Palette: ${selectedAtmosphere} (Press P + Arrows)`, 20, 50);
    p.text(`Phase: ${currentAtmospherePhase}`, 20, 70);
    p.text(`Atmosphere Scale: ${atmosphereScale.toFixed(2)} (Press Q + Arrows)`, 20, 90);
    p.text(`Light Control: ${lightControl.toFixed(3)} (Press L + Arrows)`, 20, 110);
    p.text(`Light Value: ${lightValue.toFixed(3)}`, 20, 130);
    p.text(`Gradient Positions: [${gradientPositions.map(p => p.toFixed(2)).join(', ')}] (Press G + Arrows)`, 20, 150);
    p.text(`Frame: ${p.frameCount}`, 20, 170);
    
    // Draw current colors
    p.text('Current Colors:', 20, 170);
    if (selectedAtmosphereColors) {
      const colorWidth = 20;
      const colorHeight = 15;
      const colorSpacing = 5;
      const colorStartX = 20;
      const colorStartY = 185;
      
      for (let i = 0; i < Math.min(selectedAtmosphereColors.length, 4); i++) {
        p.fill(selectedAtmosphereColors[i]);
        p.stroke(255);
        p.strokeWeight(1);
        p.rect(colorStartX + i * (colorWidth + colorSpacing), colorStartY, colorWidth, colorHeight, 2);
      }
    }
    
    // Draw control instructions
    p.fill(200);
    p.textSize(11);
    p.text('Controls:', 20, 220);
    p.text('• Q + Arrows: Adjust Size (0.5-5.0)', 20, 240);
    p.text('• P + Arrows: Change Palette', 20, 255);
    p.text('• L + Arrows: Control Light (0-1)', 20, 270);
    p.text('• G + Arrows: Control Gradient Positions', 20, 285);
    p.text('• D: Exit Control / Toggle Debug', 20, 300);
    p.text('• S: Save Screenshot', 20, 315);
    
    p.pop();
  };

  p.drawControlBanner = () => {
    if (controlBanner.visible) {
      // Update timer
      controlBanner.timer--;
      if (controlBanner.timer <= 0) {
        controlBanner.visible = false;
        controlMode = 'none';
        return;
      }
      
      // Draw banner
      p.push();
      p.fill(0, 0, 0, 220);
      p.stroke(255, 255, 255, 100);
      p.strokeWeight(2);
      p.rect(p.width/2 - 200, 50, 400, 60, 8);
      
      // Draw text
      p.fill(255);
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(controlBanner.text, p.width/2, 80);
      
      // Draw instructions
      p.textSize(14);
      p.text('Use Arrow Keys to adjust • Press D to exit', p.width/2, 100);
      
      p.pop();
    }
  };

  p.showControlBanner = (text, duration = 120) => {
    controlBanner.text = text;
    controlBanner.timer = duration;
    controlBanner.visible = true;
  };

  p.keyPressed = () => {
    if (p.key === 's') {
      p.save('atmosphere.png');
    }
    if (p.key === 'd') {
      if (controlMode !== 'none') {
        // Exit control mode
        controlMode = 'none';
        controlBanner.visible = false;
      } else {
        // Toggle debug mode
        debugMode = !debugMode;
      }
    }
    if (p.key === 'q') {
      // Enter size control mode
      controlMode = 'size';
      p.showControlBanner(`Controlling Size: ${atmosphereScale.toFixed(2)}`);
    }
    if (p.key === 'p') {
      // Enter palette control mode
      controlMode = 'palette';
      p.showControlBanner(`Controlling Palette: ${selectedAtmosphere}`);
    }
    if (p.key === 'l') {
      // Enter light control mode
      controlMode = 'light';
      p.showControlBanner(`Controlling Light: ${lightControl.toFixed(3)}`);
    }
    if (p.key === 'g') {
      // Enter gradient control mode
      controlMode = 'gradient';
      p.showControlBanner(`Gradient Pos 1: ${gradientPositions[0].toFixed(3)}`);
    }
  };

  // Debug update method to receive control changes from React
  p.debugUpdate = (newControls) => {
    debugControls = newControls;
    
    // Update animation speed
    if (newControls.animationSpeed?.value !== undefined) {
      // This will be used in the draw loop
    }
    
    // Update gradient radius
    if (newControls.gradientRadius?.value !== undefined) {
      // This will be used in the shader
    }
    
    // Update other parameters as needed
    if (newControls.light?.value !== undefined) {
      lightControl = newControls.light.value;
    }
  };

}

export default Atmosphere; 