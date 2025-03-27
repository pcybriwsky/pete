import * as magic from "@indistinguishable-from-magic/magic-js"

const Sun = (p) => {
  const palettes = {
    sunset: {"Melon":"ffa69e","Eggshell":"faf3dd","Celeste":"b8f2e6","Light blue":"aed9e0","Payne's gray":"5e6472"},
    forest: {"Forest Green":"2c5530","Sage":"7d9b76","Cream":"f7e1d7","Moss":"4a5759","Deep Green":"053225"},
    ocean: {"Deep Blue":"003b4f","Turquoise":"38a2ac","Aqua":"7cd7d7","Sky":"b4e7e7","Sand":"fff1d9"},
    desert: {"Terracotta":"cd5ф34","Sand":"e6c79c","Dusty Rose":"d4a5a5","Sage":"9cae9c","Brown":"6e4c4b"},
    berry: {"Purple":"4a1942","Magenta":"893168","Pink":"c4547d","Light Pink":"e8a1b3","Cream":"ead7d7"}
  };
  let currentPalette;
  let colors;
  let isMagic = false;

  let time = 0;

  let circleSize;
  let isLinear; // Will determine if path is straight or curved
  let pathPoints; // Will store control points for the path
  let noiseTexture;
  let setAlpha = false;

  let minCircleSize;
  let maxCircleSize;
  let lastWasDark = false;

  const selectRandomPalette = () => {
    const paletteNames = Object.keys(palettes);
    const randomPalette = paletteNames[Math.floor(Math.random() * paletteNames.length)];
    currentPalette = palettes[randomPalette];
    colors = Object.values(currentPalette);
  };

  p.setup = () => {
    // Use window dimensions instead of parent container
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    
    p.createCanvas(canvasWidth, canvasHeight);
    p.colorMode(p.HSB, 360, 100, 100, 1);
    selectRandomPalette();
    isLinear = Math.random() < 0.5;
    setAlpha = Math.random() < 0.5;
    pathPoints = generatePathPoints();
    minCircleSize = p.width * 0.1;
    maxCircleSize = p.width * 0.4;
    circleSize = minCircleSize;
    
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
    
    p.noLoop();
    p.draw();
  };

  p.shufflePalette = () => {
    colors = colors.sort(() => Math.random() - 0.5);
  }

  // Generate random control points for the path
  const generatePathPoints = () => {
    const points = {
      start: { x: p.random(0.1*p.width, 0.9*p.width), y: p.random(0.1*p.height, 0.9*p.height) },
      end: { x: p.random(0.1*p.width, 0.9*p.width), y: p.random(0.1*p.height, 0.9*p.height) },
      control1: { x: p.random(p.width * 0.4, p.width * 0.6), y: p.random(p.height * 0.1, p.height * 0.9) },
      control2: { x: p.random(p.width * 0.4, p.width * 0.6), y: p.random(p.height * 0.1, p.height * 0.9) }
    };
    return points;
  };

  // Get point position along the path
  const getPathPosition = (t) => {
    if (isLinear) {
      return {
        x: p.lerp(pathPoints.start.x, pathPoints.end.x, t),
        y: p.lerp(pathPoints.start.y, pathPoints.end.y, t)
      };
    } else {
      return {
        x: p.bezierPoint(pathPoints.start.x, pathPoints.control1.x, pathPoints.control2.x, pathPoints.end.x, t),
        y: p.bezierPoint(pathPoints.start.y, pathPoints.control1.y, pathPoints.control2.y, pathPoints.end.y, t)
      };
    }
  };

  const generateNoiseTexture = () => {
    noiseTexture.loadPixels();
    let increment = p.random(5, 8);

    p.push();
    p.colorMode(p.RGB, 255, 255, 255, 1);
    for (let i = 0; i < noiseTexture.pixels.length; i += increment) {
      const noiseValue = p.random() > 0.5 ? p.random(200, 255) : p.random(180, 220);
      noiseTexture.pixels[i] = noiseValue;
      noiseTexture.pixels[i + 1] = noiseValue;
      noiseTexture.pixels[i + 2] = noiseValue;
      noiseTexture.pixels[i + 3] = p.random(15, 35);
    }
    noiseTexture.updatePixels();
    p.pop();
  };

  let lightValue = 0;
  p.draw = () => {
    let lightReading = 0;
    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) {
      lightReading = magic.modules.light.brightness;
    }

    lightValue = lightReading * 0.025 + lightValue * 0.975;
    let lightThreshold = 300;

    // Update circle size based on light
    circleSize = p.map(lightValue, 0, 4095, minCircleSize, maxCircleSize);
    
    p.push();
    p.colorMode(p.RGB, 255, 255, 255, 1);
    const lightOffWhite = p.color(255, 252, 247);
    const slightlyDarkerOffWhite = p.color(248, 245, 240);
    let backgroundGradient = p.drawingContext.createLinearGradient(0, 0, 0, p.height);
    backgroundGradient.addColorStop(0, lightOffWhite);
    backgroundGradient.addColorStop(1, slightlyDarkerOffWhite);
    p.drawingContext.fillStyle = backgroundGradient;
    p.noStroke();
    p.rect(0, 0, p.width, p.height);
    p.pop();

    if (lightValue < lightThreshold) {
      // Check if we just transitioned to dark
      if (!lastWasDark) {
        selectRandomPalette();
        p.shufflePalette();
        isLinear = Math.random() < 0.5;
        pathPoints = generatePathPoints();
      }
      lastWasDark = true;
      
      // p.background(0);
      // 
      p.fill(p.color("#0a0a0a"));
      const centerX = p.width / 2;
      const centerY = p.height / 2;
      p.ellipse(centerX, centerY, circleSize, circleSize);
      return;
    }

    lastWasDark = false;

    p.fill(255);

    // Normal state with transition
    // Create subtle off-white gradient background
    
    p.strokeWeight(1);
    

    let numCircles = 200;
    const centerX = p.width / 2;
    const centerY = p.height / 2;

    for (let i = 0; i < numCircles; i++) {
      // Map the position based on light value
      // When light is low (50), circles stay near center
      // When light is high (4095), circles spread to full path
      let t = i / (numCircles - 1);
      let maxT = p.map(lightValue, 50, 4095, 0, 1);
      t = t * maxT; // Constrain the path position based on light
      
      let position = getPathPosition(t);
      // Interpolate between center position and path position
      let centerWeight = p.map(lightValue, lightThreshold, 4095, 1, 0);
      let centerX = p.lerp(position.x, p.width/2, centerWeight);
      let centerY = p.lerp(position.y, p.height/2, centerWeight);

      // Calculate the position in the color sequence (0 to colors.length)
      let colorPosition = p.map(i, 0, numCircles, 0, colors.length);
      let colorIndex = Math.floor(colorPosition);
      let nextColorIndex = (colorIndex + 1) % colors.length;
      let interpolationFactor = colorPosition - colorIndex;

      // Create smooth color transitions
      let color1 = p.lerpColor(
        p.color("#" + colors[colorIndex]), 
        p.color("#" + colors[nextColorIndex]), 
        interpolationFactor
      );
      let color2 = p.lerpColor(
        p.color("#" + colors[(colorIndex + 1) % colors.length]), 
        p.color("#" + colors[(nextColorIndex + 1) % colors.length]), 
        interpolationFactor
      );

      color1 = p.lerpColor(p.color("#0a0a0a"), color1, lightValue*2 / 4095 - lightThreshold*2/4095);
      color2 = p.lerpColor(p.color("#0a0a0a"), color2, lightValue*2 / 4095 - lightThreshold*2/4095);

      let ellipseCenter = {x: centerX, y: centerY};

      // let opacity = p.map(i, 0, numCircles, 0, 1);
      // color1.setAlpha(setAlpha ? opacity : 1);
      // color2.setAlpha(setAlpha ? opacity : 1); 
      let gradient = p.drawingContext.createLinearGradient(
        ellipseCenter.x, 
        ellipseCenter.y - circleSize/2, 
        ellipseCenter.x, 
        ellipseCenter.y + circleSize/2
      );
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      p.drawingContext.fillStyle = gradient;

      let reverseGradient = p.drawingContext.createLinearGradient(
        ellipseCenter.x, 
        ellipseCenter.y - circleSize/2, 
        ellipseCenter.x, 
        ellipseCenter.y + circleSize/2
      );
      color1.setAlpha(1);
      color2.setAlpha(1);
      reverseGradient.addColorStop(0, color2);
      reverseGradient.addColorStop(1, color1);
      p.drawingContext.strokeStyle = reverseGradient;
    
      p.ellipse(ellipseCenter.x, ellipseCenter.y, circleSize, circleSize);
    }

    // Apply noise overlay
    p.push();
    p.blendMode(p.SCREEN);
    p.image(noiseTexture, 0, 0);
    p.pop();
  };

  p.windowResized = () => {
    // Use window dimensions directly
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    
    p.resizeCanvas(canvasWidth, canvasHeight);
    
    noiseTexture = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
    
    minCircleSize = p.width * 0.1;
    maxCircleSize = p.width * 0.4;
    circleSize = p.map(lightValue, 0, 4095, minCircleSize, maxCircleSize);
  };

  p.mousePressed = async () => {
    if (!isMagic) {
      magic.connect({ mesh: false, auto: true });
      console.log(magic.modules);
      isMagic = true;
      p.loop(); // Start animation loop
    }
  };

  p.keyPressed = () => {
    if (p.key === 'r') {
      selectRandomPalette();
      p.shufflePalette();
      isLinear = Math.random() < 0.5;
      pathPoints = generatePathPoints();
      circleSize = p.random(p.width);
      p.draw();
    }
    if (p.key === 's') {
      p.save('sketch.png');
    }
  };
};

export default Sun; 