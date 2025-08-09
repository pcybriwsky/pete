import * as magic from "@indistinguishable-from-magic/magic-js"

const Atmosphere = (p) => {
  let isMagic = false;
  let lightValue = 0;
  let noiseTexture;
  let currentPhase = 'Sun';
  let transitionProgress = 0;
  let targetColors = null;
  let currentColors = null;

  // Atmosphere-specific color palettes
  const atmospherePalettes = {
    'Sunset': ['#FF6B35', '#FF9F1C', '#FFD700', '#FF6B35'], // Warm sunset gradient
    'Ocean': ['#003B4F', '#38A2AC', '#7CD7D7', '#003B4F'], // Deep ocean blues
    'Forest': ['#2C5530', '#7D9B76', '#F7E1D7', '#2C5530'], // Forest greens
    'Desert': ['#CD5F34', '#E6C79C', '#D4A5A5', '#CD5F34'], // Desert earth tones
    'Berry': ['#4A1942', '#893168', '#C4547D', '#4A1942'], // Rich berry colors
    'Nordic': ['#E5E9F0', '#ECEEF4', '#D8DEE9', '#E5E9F0'], // Cool nordic tones
    'Autumn': ['#D35400', '#F39C12', '#F1C40F', '#D35400'], // Autumn warm colors
    'Spring': ['#FFB6C1', '#98FF98', '#E6E6FA', '#FFB6C1'], // Spring pastels
    'Neon': ['#FF69B4', '#00FFFF', '#FFFF00', '#FF69B4'], // Bright neon colors
    'Jewel': ['#E0115F', '#0F52BA', '#50C878', '#E0115F'], // Rich jewel tones
    'Cyberpunk': ['#FF007F', '#00EAFF', '#FFF700', '#FF007F'], // Cyberpunk neon
    'Vaporwave': ['#FF71CE', '#01CDFE', '#B967FF', '#FF71CE'], // Vaporwave aesthetic
    'Synthwave': ['#FF3CAA', '#29FFE3', '#FFB300', '#FF3CAA'] // Synthwave colors
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

  let isDevMode = true;
  let time = 0;

  let lightGraphic;
  let darkGraphic;

  let canvasWidth = 0;
  let canvasHeight = 0;

  // Debug variables
  let debugMode = false;
  let showPaletteName = false;
  let rotationSpeed = 0.5;
  let bloomIntensity = 1.0;
  let particleCount = 5;
  let particleSpeed = 1.0;
  let ringCount = 3;
  let ringRotationSpeed = 0.3;

  p.setup = () => {
    // Randomly select an atmosphere palette
    const atmosphereNames = Object.keys(atmospherePalettes);
    selectedAtmosphere = atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)];
    selectedAtmosphereColors = atmospherePalettes[selectedAtmosphere];
    
    // Create multiple color sets for complex effects
    atmosphereColors1 = atmospherePalettes[atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)]];
    atmosphereColors2 = atmospherePalettes[atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)]];
    atmosphereColors3 = atmospherePalettes[atmosphereNames[Math.floor(Math.random() * atmosphereNames.length)]];

    p.pixelDensity(1);

    canvasWidth = p.windowWidth * 1.0;
    canvasHeight = p.windowHeight * 1.0;
    padding = canvasWidth * 0.075;
    fontSizeText = canvasWidth * 0.037;
    fontSizeDescription = canvasWidth * 0.06;
    lineHeightText = fontSizeText * 1.5;
    lineHeightDescription = fontSizeDescription * 1.5;

    p.createCanvas(canvasWidth, canvasHeight);

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
    p.background(bgColor);

    let t = 0;
    if (isDevMode) {
      t = (Math.sin(p.frameCount * 0.01) + 1) / 2;
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

    // Draw Light Graphic
    p.push();
    selectedAtmosphere = 'Sun';
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
  };

  p.ease = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  p.mousePressed = async () => {
    if (isDevMode) {
      isDevMode = false;
      if (!isMagic) {
        magic.connect({ mesh: false, auto: true });
        console.log(magic.modules);
        isMagic = true;
      }
    } else {
      isDevMode = true;
    }
    p.loop();
  };

  p.drawAtmosphere = (phase) => {
    let diameter = p.width - 2 * padding;
    let radius = diameter / 2;

    p.translate(0, radius / 2);
    if (phase !== 'Empty') {
      // Background gradient
      p.push();
      p.translate(0, -radius);
      let backgroundGradient = p.drawingContext.createLinearGradient(0, p.height, p.width, 0);
      backgroundGradient.addColorStop(0, p.color(selectedAtmosphereColors[0] || '#FFFFFF'));
      backgroundGradient.addColorStop(0.3, p.color(selectedAtmosphereColors[1] || selectedAtmosphereColors[0] || '#FFFFFF'));
      backgroundGradient.addColorStop(0.6, p.color(selectedAtmosphereColors[2] || selectedAtmosphereColors[1] || '#FFFFFF'));
      backgroundGradient.addColorStop(1.0, p.color(selectedAtmosphereColors[3] || selectedAtmosphereColors[0] || '#FFFFFF'));

      p.drawingContext.fillStyle = backgroundGradient;
      p.noStroke();
      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
      p.pop();

      // Draw atmospheric sphere with enhanced effects
      p.push();
      
      // Create rotating gradient
      const rotateGradient = (angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const cx = 0;
        const cy = -radius / 2;
        const length = radius / 2 + padding;

        return [
          cx - length * cos, cy - length * sin,
          cx + length * cos, cy + length * sin
        ];
      };

      const generateConstrainedAngle = () => {
        let noiseVal = p.noise(p.frameCount * 0.001);
        let angle = p.map(noiseVal, 0, 1, -p.PI, p.PI);
        let wobble = p.noise(p.frameCount * 0.001, 100) * 0.2;
        return angle + wobble;
      };

      const randomAngle = generateConstrainedAngle();
      const [x1, y1, x2, y2] = rotateGradient(randomAngle);

      let atmosphereGradient = p.drawingContext.createLinearGradient(x1, y1, x2, y2);
      atmosphereGradient.addColorStop(0, p.color(selectedAtmosphereColors[0] || '#FFFFFF'));
      atmosphereGradient.addColorStop(0.33, p.color(selectedAtmosphereColors[1] || selectedAtmosphereColors[0] || '#FFFFFF'));
      atmosphereGradient.addColorStop(0.66, p.color(selectedAtmosphereColors[2] || selectedAtmosphereColors[1] || '#FFFFFF'));
      atmosphereGradient.addColorStop(1.0, p.color(selectedAtmosphereColors[3] || selectedAtmosphereColors[0] || '#FFFFFF'));

      if (allDark) {
        p.fill(bgColor);
        p.drawingContext.fillStyle = atmosphereGradient;

        // Multiple shadow layers for atmospheric effect
        p.drawingContext.shadowBlur = radius / 5;
        p.drawingContext.shadowColor = p.color(selectedAtmosphereColors[1] + "88");
        p.drawingContext.shadowOffsetX = radius / 20;
        p.drawingContext.shadowOffsetY = radius / 20;
        p.ellipse(0, -radius / 2, radius, radius);

        p.drawingContext.shadowBlur = radius / 5;
        p.drawingContext.shadowColor = p.color(selectedAtmosphereColors[1] + "88");
        p.drawingContext.shadowOffsetX = -radius / 20;
        p.drawingContext.shadowOffsetY = -radius / 20;
        p.ellipse(0, -radius / 2, radius, radius);

        p.drawingContext.shadowBlur = radius / 5;
        p.drawingContext.shadowColor = p.color(selectedAtmosphereColors[2] + "88");
        p.drawingContext.shadowOffsetX = radius / 20;
        p.drawingContext.shadowOffsetY = -radius / 20;
        p.ellipse(0, -radius / 2, radius, radius);

        p.drawingContext.shadowBlur = radius / 5;
        p.drawingContext.shadowColor = p.color(selectedAtmosphereColors[3] + "88");
        p.drawingContext.shadowOffsetX = -radius / 20;
        p.drawingContext.shadowOffsetY = radius / 20;
        p.ellipse(0, -radius / 2, radius, radius);
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
    p.push();
    p.fill(0, 0, 0, 200);
    p.noStroke();
    p.rect(10, 10, 300, 400);
    
    p.fill(255);
    p.textSize(16);
    p.textAlign(p.LEFT, p.TOP);
    p.text('Atmosphere Debug', 20, 20);
    
    p.textSize(12);
    p.text(`Palette: ${selectedAtmosphere}`, 20, 50);
    p.text(`Rotation Speed: ${rotationSpeed.toFixed(2)}`, 20, 70);
    p.text(`Scale: ${atmosphereScale.toFixed(2)}`, 20, 90);
    p.text(`Bloom: ${bloomIntensity.toFixed(2)}`, 20, 110);
    p.text(`Particles: ${particleCount}`, 20, 120);
    p.text(`Rings: ${ringCount}`, 20, 140);
    
    p.pop();
  };

  p.keyPressed = () => {
    if (p.key === 's') {
      p.save('atmosphere.png');
    }
    if (p.key === 'd') {
      debugMode = !debugMode;
    }
    if (p.key === 'p') {
      showPaletteName = !showPaletteName;
    }
  }
}

export default Atmosphere; 