import * as magic from "@indistinguishable-from-magic/magic-js"

const Lenticular = (p) => {
  // Removed isMagic, isDevMode, t
  // Removed colorsA, colorsB, gradientA, gradientB
  let isDevMode = true;

  const colors = ['red', 'green', 'blue'];
  const easterColors = ['#FFB6C1', '#FFFacd', '#ADD8E6'];
  let maxSquareSize;
  let squareStep = 10; // How much smaller each concentric square gets

  let baseGraphic = null;
  let overlayGraphic = null;
  let isMousePressed = false;
  let isMagic = false;

  // Basic setup
  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(50); // Dark gray background
    p.rectMode(p.CENTER); // Draw rectangles from their center
    p.noStroke(); // No outlines for the squares initially

    let minDim = Math.min(p.width, p.height);
    maxSquareSize = minDim * 0.8;
    baseGraphic = p.createGraphics(p.width, p.height);
    overlayGraphic = p.createGraphics(p.width, p.height);
    // p.drawBaseGraphic();
    p.drawLinedCircleGraphic();
    p.drawOverlayGraphic();
  };

  p.drawBaseGraphic = () => {
    baseGraphic.background(255);
    baseGraphic.rectMode(p.CENTER);
    baseGraphic.noFill();
    baseGraphic.strokeWeight(squareStep);
    let currentSize = maxSquareSize;
    let colorIndex = 0;
    while (currentSize > 0) {
        baseGraphic.stroke(colors[colorIndex % (colors.length)]);
        baseGraphic.rect(baseGraphic.width / 2, baseGraphic.height / 2, currentSize, currentSize);        
        currentSize -= squareStep;
        colorIndex++;
    }
  };

  p.drawOverlayGraphic = () => {
    overlayGraphic.clear();
    overlayGraphic.rectMode(p.CENTER);
    overlayGraphic.noFill();
    overlayGraphic.strokeWeight(squareStep);
    let currentSize = maxSquareSize;
    let colorIndex = 0;
    let rotation = 0;

    if(isMagic && magic.modules.imu !== undefined) {
      rotation = magic.modules.imu.orientation.x;
      console.log(rotation);
      rotation = p.map(rotation, -1, 1, -p.TWO_PI, p.TWO_PI);
    }
    else {
      rotation = 0
    }
    console.log(rotation);
    while (currentSize > 0) {
      let rotationFactor = p.map(currentSize, 0, maxSquareSize, 0.2, 0);
      let newRotation = rotation * rotationFactor;
      overlayGraphic.push();
      overlayGraphic.translate(p.mouseX, p.mouseY);
      overlayGraphic.rotate(newRotation);
      overlayGraphic.rect(0, 0, currentSize, currentSize);
      overlayGraphic.pop();
      currentSize -= squareStep*3;
      colorIndex++;
    }
  };  

  p.drawLinedCircleGraphic = () => {
    baseGraphic.background(255);
    baseGraphic.rectMode(p.CENTER);
    baseGraphic.noFill();
    baseGraphic.strokeWeight(squareStep/4);
    baseGraphic.ellipseMode(p.CENTER);
    let ellpiseHeightMax = 100;
    let ellpiseHeightMin = 10;
    let ellpiseHeightStep = 10;
    let ellipseWidthMax = 80;

    for(let i = 0; i < 360; i += 10) {
      let ellipseHeight = p.map(i, 0, 360, ellpiseHeightMin, ellpiseHeightMax);
      baseGraphic.ellipse(0, 0, ellipseHeight, ellipseHeight);
    }
    
  }

  p.drawLinedCircleOverlay = () => {
    p.push();
    p.translate(p.mouseX, p.mouseY);
    p.ellipse(0, 0, overlayGraphic.width, overlayGraphic.height);
    p.pop();
  }

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

 

  // Basic draw loop
  p.draw = () => {
    p.background(50); // Clear background each frame    
    p.push();
    p.image(baseGraphic, 0, 0);
    p.translate(p.mouseX, p.mouseY);

    if(isMagic && magic.modules.imu !== undefined) {
      p.drawOverlayGraphic();
    }
    p.imageMode(p.CENTER);
    p.image(overlayGraphic, 0, 0);
    p.pop();
  
  };
  


}

export default Lenticular; 
