import * as magic from "@indistinguishable-from-magic/magic-js"

const SunAndMoon = (p) => {
  let isMagic = false;
  let lightValue = 0;
  let noiseTexture;
  let currentPhase = 'Sun';
  let transitionProgress = 0;
  let targetColors = null;
  let currentColors = null;

  // Moon phase colors
  const moonPhases = {
    'Sun': ['#FF6B35', '#FF9F1C', '#FFD700', '#FF6B35'], // Warm circular gradient
    'Waxing Crescent': ['#F8D808', '#E66D7B', '#282962', '#F8D808'], // Yellow to pink to deep blue
    'First Quarter': ['#FDA2DA', '#7C47DB', '#0A26AC', '#FDA2DA'], // Pink to purple to deep blue
    'Waxing Gibbous': ['#00B7FF', '#FEF439', '#FF3030', '#00B7FF'], // Cyan to yellow to red
    'Full Moon': ['#FC4084', '#FDBFD6', '#395D93', '#FC4084'], // Pink to light pink to blue
    'Waning Gibbous': ['#FFDBD2', '#DC8169', '#134787', '#FFDBD2'], // Peach to coral to deep blue
    'Last Quarter': ['#30B1C9', '#FDDEE1', '#F9C6C8', '#30B1C9'], // Turquoise to pink
    'Waning Crescent': ['#F7C6FA', '#96B9EF', '#AFF4CB', '#F7C6FA'], // Light purple to blue to mint
    'Sun': ['#FF6B35', '#FF9F1C', '#FFD700', '#FF6B35'] // Circular warm gradient
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

  let bgColor = "#151c2a"; // Deep navy blue similar to the Asana image
  let textColor = "#fffdf3";

  const newMoonColors = ['#7EA4FF', '#A3C8FA', '#F7AB8A']; // Sun
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

  let isDevMode = true; // Add dev mode flag
  let time = 0; // For oscillation

  let lightGraphic;
  let darkGraphic;

  let canvasWidth = 0;
  let canvasHeight = 0;

  p.setup = () => {
    // Randomly select a moon phase
    const moonPhaseNames = Object.keys(moonPhases);
    selectedMoon = moonPhaseNames[Math.floor(Math.random() * moonPhaseNames.length)];
    selectedMoonColors = moonPhases[selectedMoon];

    p.pixelDensity(1);

    canvasWidth = p.windowWidth * 1.0;
    canvasHeight = p.windowHeight * 1.0;
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
    
    darkGraphic = p.createGraphics(p.width, p.height);
    darkGraphic.background(bgColor);
    darkGraphic.translate(p.width * 0.5, p.height * 0.5);
    darkGraphic.scale(sunScale);
    p.drawMoon('Empty');
  };

  let sunScale = 2;
  let currentMoonPhase = 'Sun';
  let lastPeakReached = false;
  

  p.draw = () => {
    p.background(bgColor);
    
    // Create steady oscillation with easing
    let t = (Math.sin(p.frameCount * 0.01) + 1) / 2; // Convert to 0-1 range
    
    // Apply easing function (smooth start and end)
    let eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    // Map to 0-100 range
    let graphicOpacity = eased * 255;

    if (eased > 0.99 && !lastPeakReached) {
      // We've reached a peak, change the moon phase
      const moonPhaseNames = Object.keys(moonPhases).filter(name => name !== currentMoonPhase);
      currentMoonPhase = moonPhaseNames[Math.floor(Math.random() * moonPhaseNames.length)];
      selectedMoonColors = moonPhases[currentMoonPhase];
      selectedMoonColors.sort(() => Math.random() - 0.5);
      lastPeakReached = true;
    } else if (eased < 0.9) {
      // Reset the peak detection once we drop below threshold
      lastPeakReached = false;
    }
    
    // Draw Light Graphic
    p.push();
    selectedMoon = 'Sun';

    // selectedMoonColors = moonPhases['Sun'];
    p.translate(p.width * 0.5, p.height * 0.5);
    p.scale(sunScale);
    p.drawMoon('Sun');
    p.pop();

    p.push();
    p.tint(255, graphicOpacity);
    p.image(darkGraphic, p.width * 0.5, p.height * 0.5);
    p.pop();
  };

  // Add easing function for smoother transitions
  p.ease = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  // Modify mousePressed to toggle between dev mode and real sensor
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
    p.loop(); // Start animation loop in either case
  };

  p.drawMoon = (phase) => {
    let diameter = p.width - 2 * padding;
    let radius = diameter / 2;

    p.translate(0, radius / 2)
    if (phase !== 'Empty') {
      p.push();
      p.translate(0, -radius);
      let backgroundGradient = p.drawingContext.createLinearGradient(0, p.height, p.width, 0);
      backgroundGradient.addColorStop(0, p.color(selectedMoonColors[0]));
      backgroundGradient.addColorStop(0.3, p.color(selectedMoonColors[1]));
      backgroundGradient.addColorStop(0.6, p.color(selectedMoonColors[2]));
      backgroundGradient.addColorStop(1.0, p.color(selectedMoonColors[3]));

      p.drawingContext.fillStyle = backgroundGradient;
      p.noStroke();
      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
      p.pop();

      // Draw a moon outline
      p.push();
      p.fill(bgColor);
      p.drawingContext.shadowBlur = 100;
      p.drawingContext.shadowColor = 'rgba(255, 255, 255, 1.0)';

      p.noFill();
      p.stroke(0);
      p.strokeWeight(radius / 50)

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
        // Use frameCount for continuous smooth movement
        let noiseVal = p.noise(p.frameCount * 0.001); // Slower movement with 0.005

        // Map noise value (0-1) to angle range (-PI to PI)
        let angle = p.map(noiseVal, 0, 1, -p.PI, p.PI);

        // Add a slight wobble with a second noise dimension
        let wobble = p.noise(p.frameCount * 0.001, 100) * 0.2; // 0.2 controls wobble amount

        return angle + wobble;
      };

      // Use the constrained angle
      const randomAngle = generateConstrainedAngle();

      // Get rotated gradient coordinates
      const [x1, y1, x2, y2] = rotateGradient(randomAngle);

      let moonGradient = p.drawingContext.createLinearGradient(x1, y1, x2, y2);
      moonGradient.addColorStop(0, p.color(selectedMoonColors[0]));
      moonGradient.addColorStop(0.33, p.color(selectedMoonColors[1]));
      moonGradient.addColorStop(0.66, p.color(selectedMoonColors[2]));
      moonGradient.addColorStop(1.0, p.color(selectedMoonColors[3]));


      p.strokeWeight(radius / 5);
      p.stroke(bgColor);
      p.noStroke();

      // Apply the gradient fill
      p.fill(bgColor);
      p.drawingContext.fillStyle = moonGradient;

      p.strokeWeight(radius / 20);
      p.drawingContext.shadowBlur = padding/2;
      p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.25)'
      p.ellipse(0, -radius / 2, radius, radius);


      p.push();
      p.beginShape();

      switch (phase) {
        case 'Sun':
          for (let a = 0; a < p.TWO_PI; a += 0.1) {
            let x = radius / 2 * p.cos(a);
            let y = radius / 2 * p.sin(a);
            p.vertex(x, y - radius / 2);
          }
          break;
      }
      p.endShape();

      
      p.pop()
      
      p.pop();
    }
    else {
      darkGraphic.push();
      darkGraphic.translate(0, radius / 2);
      darkGraphic.noFill();
      darkGraphic.background(bgColor);
      darkGraphic.stroke(textColor);
      darkGraphic.strokeWeight(1);
      darkGraphic.ellipse(0, -radius / 2, radius, radius);
      darkGraphic.stroke(textColor + "22");
      // darkGraphic.drawingContext.setLineDash([radius / 25, radius / 25]);
      darkGraphic.rectMode(p.CENTER);
      darkGraphic.rect(0, -radius / 2, radius, radius);
    }
  };
}

export default SunAndMoon; 
