import * as magic from "@indistinguishable-from-magic/magic-js"

const SunAndMoon = (p) => {
  let isMagic = false;
  let lightValue = 0;
  let noiseTexture;
  let currentPhase = 'New Moon';
  let transitionProgress = 0;
  let targetColors = null;
  let currentColors = null;

  // Moon phase colors
  const moonPhases = {
    'New Moon': ['#FF6B35', '#FF9F1C', '#FFD700'],
    'Waxing Crescent': ['#F8D808', '#E66D7B', '#282962'],
    'First Quarter': ['#FDA2DA', '#7C47DB', '#0A26AC'],
    'Waxing Gibbous': ['#00B7FF', '#FEF439', '#FF3030'],
    'Full Moon': ['#FC4084', '#FDBFD6', '#395D93'],
    'Waning Gibbous': ['#FFDBD2', '#DC8169', '#134787'],
    'Last Quarter': ['#30B1C9', '#FDDEE1', '#F9C6C8'],
    'Waning Crescent': ['#F7C6FA', '#96B9EF', '#AFF4CB'],
    'Sun': ['#FF6B35', '#FF9F1C', '#FFD700']
  };

  let lastWasDark = false;
  // Size multiplier will impact all other values based on canvas size
  let sizeMultiplier = 0;

  let padding = 0; // For the rect frame

  let fontSizeDescription = 0; // For the playlist description 
  let fontSizeText = 0; // For everything else

  let textPadding = 0;
  let lineHeightText = 0;
  let lineHeightDescription = 0;
  let logoSize = 0;

  let bgColor = "#FFFDF3";
  let textColor = "#0a0a0a";

  const newMoonColors = ['#7EA4FF', '#A3C8FA', '#F7AB8A']; // New Moon
  const waxingCrescentColors = ['#F8D808', '#E66D7B', '#282962']; // Waxing Crescent
  const firstQuarterColors = ['#FDA2DA', '#7C47DB', '#0A26AC']; // First Quarter
  const waxingGibbousColors = ['#00B7FF', '#FEF439', '#FF3030']; // Waxing Gibbous
  const fullMoonColors = ['#FC4084', '#FDBFD6', '#395D93']; // Full Moon
  const waningGibbousColors = ['#FFDBD2', '#DC8169', '#134787']; // Waning Gibbous
  const lastQuarterColors = ['#30B1C9', '#FDDEE1', '#F9C6C8']; // Last Quarter
  const waningCrescentColors = ['#F7C6FA', '#96B9EF', '#AFF4CB']; // Waning Crescent

  const sunColors = ['#FF6B35', '#FF9F1C', '#FFD700']; // Warm orange-red gradient for sun

  let selectedMoonColors = null;

  let selectedMoon = null;

  p.checkFont = (text) => {
    if (text.charCodeAt(0) > 12000 && text.charCodeAt(0) < 40703) {
      p.textFont(p.japanese_font);
      if (text.charCodeAt(0) > 19968 && text.charCodeAt(0) < 40703) {
        p.textFont(p.chinese_font);
      }
    } else if (text.charCodeAt(0) > 40703) {
      p.textFont(p.korean_font);
    } else if (text.charCodeAt(0) > 3583 && text.charCodeAt(0) < 3711) {
      p.textFont(p.thai_font);
    } else {
      p.textFont(p.bodoniRegular); // Default font
    }
  };



  let canvasWidth = 0;
  let canvasHeight = 0;

  p.setup = () => {
    // Randomly select a moon phase
    const moonPhaseNames = Object.keys(moonPhases);
    selectedMoon = moonPhaseNames[Math.floor(Math.random() * moonPhaseNames.length)];
    selectedMoonColors = moonPhases[selectedMoon];

    p.pixelDensity(2);
    if (p.windowWidth < 768) {
      canvasWidth = p.windowWidth * 0.9;
      canvasHeight = canvasWidth * (16 / 9);
      sizeMultiplier = canvasWidth / 512;
    }
    else {
      canvasWidth = 512;
      canvasHeight = 512 * (16 / 9);
      sizeMultiplier = 1;
    }


    padding = canvasWidth * 0.075;
    fontSizeText = canvasWidth * 0.037;
    fontSizeDescription = canvasWidth * 0.06; // Will continue to be adjusted as we test
    lineHeightText = fontSizeText * 1.5;
    lineHeightDescription = fontSizeDescription * 1.5;


    p.createCanvas(canvasWidth, canvasHeight);

    p.textAlign(p.CENTER, p.CENTER);
    p.imageMode(p.CENTER);
    p.background(bgColor); // Off-white background
    let seed = Math.floor(Math.random() * 1000);
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.noLoop(); // Prevent draw from being called repeatedly
  };

  p.draw = () => {
    // Read light sensor if magic is connected
    let lightReading = 0;
    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {
      lightReading = magic.modules.light.brightness;
    }

    // Smooth the light value
    lightValue = lightReading * 0.025 + lightValue * 0.975;
    let isDark = lightValue < 300; // Using same threshold as SimpleSun

    // Handle state changes and transitions
    if (isDark !== lastWasDark) {
      if (isDark) {
        // Transitioning to dark - pick a random moon phase that isn't "New Moon"
        const moonPhaseNames = Object.keys(moonPhases).filter(phase => phase !== 'New Moon');
        selectedMoon = moonPhaseNames[Math.floor(Math.random() * moonPhaseNames.length)];
        targetColors = moonPhases[selectedMoon];
      } else {
        // Transitioning to light - show the sun
        selectedMoon = 'New Moon';
        targetColors = moonPhases['New Moon'];
      }
      
      // Store current colors for transition
      currentColors = selectedMoonColors || targetColors;
      transitionProgress = 0;
      lastWasDark = isDark;
    }

    // Update transition
    if (transitionProgress < 1) {
      transitionProgress += 0.05;
      selectedMoonColors = currentColors.map((startColor, i) => {
        return p.lerpColor(
          p.color(startColor),
          p.color(targetColors[i]),
          p.ease(transitionProgress)
        ).toString('#rrggbb');
      });
    }

    // Clear and redraw
    p.background(bgColor);
    p.drawMoon(selectedMoon);
  };

  // Add easing function for smoother transitions
  p.ease = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  // Add mouse pressed handler from SimpleSun
  p.mousePressed = async () => {
    if (!isMagic) {
      magic.connect({ mesh: false, auto: true });
      console.log(magic.modules);
      isMagic = true;
      p.loop(); // Start animation loop
    }
  };

  p.setPhaseDescriptionAndColors = (phase) => {
    switch (phase) {
      case 'New Moon':
        selectedMoonColors = newMoonColors;
        return 'I am open to new beginnings.';
      case 'Waxing Crescent':
        selectedMoonColors = waxingCrescentColors;
        return 'I trust my path and take steps towards my dreams with confidence.';
      case 'First Quarter':
        selectedMoonColors = firstQuarterColors;
        return 'I trust myself and my decisions.';
      case 'Waxing Gibbous':
        selectedMoonColors = waxingGibbousColors;
        return 'I am constantly improving, evolving, and moving closer to my true self.';
      case 'Full Moon':
        selectedMoonColors = fullMoonColors;
        return 'I celebrate my progress and honor my journey.';
      case 'Waning Gibbous':
        selectedMoonColors = waningGibbousColors;
        return 'I let go of what no longer serves me with grace and gratitude.';
      case 'Last Quarter':
        selectedMoonColors = lastQuarterColors;
        return 'I release with love and prepare for new beginnings.';
      case 'Waning Crescent':
        selectedMoonColors = waningCrescentColors;
        return 'I surrender to the flow of life and embrace the restorative power of rest.';
      default:
        return ''; // Return an empty string or a default message if the phase is not recognized
    }
  };

  p.drawWrappedText = (text, xStart, yStart, maxWidth, lineHeight) => {
    let x = xStart;
    let y = yStart;
    let processedText = text.includes(':') ? text.split(':').slice(1).join(':').trim() : text;
    processedText = processedText.replace(/\*/g, '');
    processedText = processedText.replace(/\n/g, '');

    const words = processedText.split(' ');
    let yOffset = 0; // Vertical offset for the current line

    words.forEach((word) => {
      // Check the font for the current word
      p.checkFont(word);
      const wordWidth = p.textWidth(word + ' '); // Calculate the width of the current word

      // Check if adding this word exceeds the max width
      if ((x + wordWidth) > (maxWidth + xStart)) {
        // If it exceeds, move to the next line
        yOffset += lineHeight; // Move down for the next line
        x = xStart; // Reset x position for the new line
      }

      // Draw the current word
      p.text(word, x, y + yOffset);
      x += wordWidth; // Update x position for the next word
    });
  };

  // This is not working too well, should look at how I did Nebulae, and have those rings with some fill
  p.drawMoon = (phase) => {
    let diameter = p.width - 2 * padding;
    let centerX = p.width / 2;
    let centerY = p.height * 0.5;
    let radius = diameter / 2;

    p.push();
    p.translate(centerX, centerY);


    // Create off-screen graphics for the gradient
    let gradientGraphics = p.createGraphics(diameter * 2, diameter * 2);
    gradientGraphics.noStroke();
    gradientGraphics.fill(bgColor);

    // Generate irregular shape
    let points = 12;
    let shape = [];
    for (let i = 0; i < points; i++) {
      let angle = (i / points) * p.TWO_PI;
      let r = radius / 1.5 * (0.7 + p.random(1) * 0.4); // Less variation for a more circular shape
      let x = r * p.cos(angle);
      let y = r * p.sin(angle);
      shape.push({ x, y });
    }

    // Create linear gradient
    let underlyingGradient = gradientGraphics.drawingContext.createLinearGradient(
      0, 0, diameter, diameter
    );

    let noiseVal = p.noise(p.frameCount * 0.0001);
    underlyingGradient.addColorStop(0, p.color(selectedMoonColors[0]));
    underlyingGradient.addColorStop(0.5 + noiseVal * 0.1, p.color(selectedMoonColors[1]));
    underlyingGradient.addColorStop(1, p.color(selectedMoonColors[2]));

    // Apply gradient to graphics
    gradientGraphics.drawingContext.fillStyle = underlyingGradient;

    // Draw irregular shape with gradient
    gradientGraphics.beginShape();
    for (let i = 0; i < points; i++) {
      let { x, y } = shape[i];
      gradientGraphics.curveVertex(x + radius, y + radius);
    }
    gradientGraphics.endShape(p.CLOSE);

    // Apply blur to the gradient
    gradientGraphics.filter(p.BLUR, radius / 6);

    // Draw the blurred gradient
    p.image(gradientGraphics, radius, radius / 2);

    // Add some noise texture
    p.blendMode(p.OVERLAY);
    for (let i = 0; i < 2000; i++) {
      let angle = p.random(p.TWO_PI);
      let r = p.random(radius);
      let x = r * p.cos(angle);
      let y = r * p.sin(angle);
      let noiseVal = p.noise(x * 0.05, y * 0.05) * 255;
      p.stroke(noiseVal, 30);
      p.point(x, y);
    }
    p.blendMode(p.BLEND);
    p.pop();



    // Draw a moon outline
    p.push();
    p.translate(centerX, centerY);


    p.fill(bgColor);

    p.drawingContext.shadowBlur = 100;
    p.drawingContext.shadowColor = 'rgba(255, 255, 255, 1.0)';

    // Draw the outline
    p.noFill();
    p.stroke(255);
    p.strokeWeight(radius / 50);

    if (phase !== 'New Moon') {
      p.beginShape();
      switch (phase) {
        case 'Full Moon':
          for (let a = 0; a <= p.TWO_PI; a += 0.1) {
            let x = radius / 2 * p.cos(a);
            let y = radius / 2 * p.sin(a);
            p.vertex(x, y - radius / 2);
          }
          break;
        case 'Waning Crescent':
        case 'Waxing Crescent':
          if (phase === 'Waxing Crescent') {
            p.translate(-radius / 4, 0);
            p.rotate(p.random(p.PI / 8, p.PI / 4));
          }
          else {
            p.translate(radius / 3, 0);
            p.rotate(p.random(-p.PI / 16, -p.PI / 8));
          }
          let xOffset = radius * 0.25;
          let arcSpan = p.PI * 0.825;
          let extendAngle = p.atan2(radius, xOffset) * 0.18;
          p.scale(phase === 'Waxing Crescent' ? -1 : 1, 1);
          drawCrescent(xOffset, arcSpan, extendAngle);
          break;
        case 'Last Quarter':
        case 'First Quarter':
          if (phase === 'First Quarter') {
            p.translate(-radius / 8, 0);
          }
          else {
            p.translate(radius / 8, 0);
          }
          p.scale(phase === 'First Quarter' ? -1 : 1, 1);
          drawQuarter(true);  // Always draw as if it's First Quarter, scaling will mirror it
          break;
        case 'Waning Gibbous':
          drawGibbous(true);
          break;
        case 'Waxing Gibbous':
          p.scale(phase === 'Waxing Gibbous' ? -1 : 1, 1);
          drawGibbous(false);  // Always draw as if it's Waxing Gibbous, scaling will mirror it
          break;
      }
      p.endShape(p.CLOSE);
    }

    // Moon fill
    const rotateGradient = (angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const cx = 0;  // center x
      const cy = -radius / 2;  // center y
      const length = radius / 2 + padding;

      return [
        cx - length * cos, cy - length * sin,  // start point
        cx + length * cos, cy + length * sin   // end point
      ];
    };

    // Generate a random angle for rotation
    const generateConstrainedAngle = () => {
      // Define the range of angles (in radians) for top-down and bottom-up orientations
      const topDownRange = [-p.PI / 2 - p.PI / 6, p.PI / 2 + p.PI / 6];  // -30 to 30 degrees
      const bottomUpRange = [3 * p.PI / 2 - p.PI / 6, 3 * p.PI / 2 + p.PI / 6];  // 150 to 210 degrees

      // Randomly choose between top-down and bottom-up
      if (Math.random() < 0.5) {
        // Top-down orientation
        return p.random(topDownRange[0], topDownRange[1]);
      } else {
        // Bottom-up orientation
        return p.random(bottomUpRange[0], bottomUpRange[1]);
      }
    };

    // Use the constrained angle
    const randomAngle = generateConstrainedAngle();

    // Get rotated gradient coordinates
    const [x1, y1, x2, y2] = rotateGradient(randomAngle);

    let moonGradient = p.drawingContext.createLinearGradient(x1, y1, x2, y2);

    moonGradient.addColorStop(0, p.color(selectedMoonColors[0]));
    moonGradient.addColorStop(0.5, p.color(selectedMoonColors[1]));
    moonGradient.addColorStop(1, p.color(selectedMoonColors[2]));

    p.strokeWeight(radius / 5);
    p.stroke(bgColor);
    p.noStroke();

    // Apply the gradient fill
    p.fill(bgColor);
    p.drawingContext.fillStyle = moonGradient;


    p.push();
    p.beginShape();
    switch (phase) {
      case 'Full Moon':
        for (let a = 0; a < p.TWO_PI; a += 0.1) {
          let x = radius / 2 * p.cos(a);
          let y = radius / 2 * p.sin(a);
          p.vertex(x, y - radius / 2);
        }
        break;
      case 'New Moon':
        // p.noStroke();
        for (let a = 0; a < p.TWO_PI; a += 0.1) {
          let x = radius / 2 * p.cos(a);
          let y = radius / 2 * p.sin(a);
          p.vertex(x, y - radius / 2);
        }
        break;
      case 'Waning Crescent':
      case 'Waxing Crescent':
        let xOffset = radius * 0.25;
        let arcSpan = p.PI * 0.825;
        let extendAngle = p.atan2(radius, xOffset) * 0.18;
        drawCrescent(xOffset, arcSpan, extendAngle);
        break;
      case 'Last Quarter':
      case 'First Quarter':
        drawQuarter(true);  // Always draw as if it's First Quarter, scaling will mirror it
        break;
      case 'Waning Gibbous':
        drawGibbous(true);
        break;
      case 'Waxing Gibbous':
        drawGibbous(false);  // Always draw as if it's Waxing Gibbous, scaling will mirror it
        break;
    }
    p.endShape();

    // Draw Glow effect on border
    p.noFill();
    p.strokeWeight(radius / 10);
    p.drawingContext.shadowBlur = padding;
    p.drawingContext.shadowColor = 'rgba(255, 255, 255, 1.0)'

    p.beginShape();
    switch (phase) {
      case 'Full Moon':
        for (let a = 0; a < p.TWO_PI; a += 0.1) {
          let x = radius / 2 * p.cos(a);
          let y = radius / 2 * p.sin(a);
          p.vertex(x, y - radius / 2);
        }
        break;
      case 'Waning Crescent':
      case 'Waxing Crescent':
        let xOffset = radius * 0.25;
        let arcSpan = p.PI * 0.825;
        let extendAngle = p.atan2(radius, xOffset) * 0.18;
        p.scale(phase === 'Waning Crescent' ? -1 : 1, 1);
        drawCrescent(xOffset, arcSpan, extendAngle);
        break;
      case 'Last Quarter':
      case 'First Quarter':
        p.scale(phase === 'First Quarter' ? -1 : 1, 1);
        drawQuarter(true);  // Always draw as if it's First Quarter, scaling will mirror it
        break;
      case 'Waning Gibbous':
        drawGibbous(true);
        break;
      case 'Waxing Gibbous':
        p.scale(phase === 'Waning Gibbous' ? -1 : 1, 1);
        drawGibbous(false);  // Always draw as if it's Waxing Gibbous, scaling will mirror it
        break;
    }
    p.endShape(p.CLOSE);
    p.pop()

    // Center Glow effect 
    p.push();
    p.noStroke();
    p.fill(bgColor);
    const glowGradient = createRadialGradient(p, 0, -radius / 2, 0, radius / 2);
    p.drawingContext.fillStyle = glowGradient;
    // p.ellipse(0, -radius / 2, radius, radius);

    p.beginShape();

    switch (phase) {
      case 'New Moon':
      case 'Full Moon':
        for (let a = 0; a < p.TWO_PI; a += 0.1) {
          let x = radius / 2 * p.cos(a);
          let y = radius / 2 * p.sin(a);
          p.vertex(x, y - radius / 2);
        }
        break;
      case 'Waning Crescent':
      case 'Waxing Crescent':
        let xOffset = radius * 0.25;
        let arcSpan = p.PI * 0.825;
        let extendAngle = p.atan2(radius, xOffset) * 0.18;
        drawCrescent(xOffset, arcSpan, extendAngle);
        break;
      case 'Last Quarter':
      case 'First Quarter':
        drawQuarter(true);
        break;
      case 'Waning Gibbous':
        drawGibbous(true);
        break;
      case 'Waxing Gibbous':
        // p.scale(phase === 'Waning Gibbous' ? -1 : 1, 1);
        drawGibbous(false);
        break;
    }
    p.endShape(p.CLOSE);

    // Add a blur effect
    // p.filter(p.BLUR, radius / 20);

    p.pop();
    p.pop();




    function createRadialGradient(p, x, y, r1, r2) {
      const gradient = p.drawingContext.createRadialGradient(x, y, r1, x, y, r2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
      return gradient;
    };

    function drawCrescent(xOffset, arcSpan, extendAngle) {
      let angleOffset = p.random(p.PI / 8, p.PI / 4);
      for (let a = p.PI / 2 - extendAngle; a <= 3 * p.PI / 2 + extendAngle; a += 0.1) {
        let x = radius / 2 * p.cos(a);
        let y = radius / 2 * p.sin(a);
        p.vertex(x, y - radius / 2);
      }
      for (let a = 3 * p.PI / 2 - (p.PI - arcSpan) / 2; a >= p.PI / 2 + (p.PI - arcSpan) / 2; a -= 0.1) {
        let x = xOffset + radius / 2 * p.cos(a);
        let y = radius / 2 * p.sin(a);
        p.vertex(x, y - radius / 2);
      }

    }

    function drawQuarter(isFirstQuarter) {
      for (let a = p.PI / 2; a <= 3 * p.PI / 2; a += 0.1) {
        let x = radius / 2 * p.cos(a);
        let y = radius / 2 * p.sin(a);
        p.vertex(x, y - radius / 2);
      }
      if (isFirstQuarter) {
        p.vertex(0, -radius);
        p.vertex(0, 0);
      } else {
        p.vertex(0, 0);
        p.vertex(0, -radius);
      }
    }

    function drawGibbous(isWaxing) {
      for (let a = p.PI / 2; a < 3 * p.PI / 2; a += 0.1) {
        let x = radius / 2 * p.cos(a);

        let y = radius / 2 * p.sin(a);
        p.vertex(x, y - radius / 2);
      }
      for (let a = -p.PI / 2; a < p.PI / 2; a += 0.1) {
        let x = radius / 3 * p.cos(a);

        let y = radius / 2 * p.sin(a);
        p.vertex(x, y - radius / 2);
      }
    }
  };
}

export default SunAndMoon; 
