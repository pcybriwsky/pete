import * as magic from "@indistinguishable-from-magic/magic-js"

const Lenticular = (p) => {
  // Removed isMagic, isDevMode, t
  // Removed colorsA, colorsB, gradientA, gradientB
  let isDevMode = true;

  // Keep original colors for reference if needed, add Easter colors
  const colors = ['red', 'green', 'blue'];
  const easterColors = ['#FFB6C1', '#FFFacd', '#ADD8E6']; // Pastel Pink, Yellow, Blue

  // Square parameters (keep for original functions)
  let maxSquareSize;
  let squareStep = 10;

  // Egg parameters
  let maxEllipseHeight;
  let maxEllipseWidth;
  const eggAspectRatio = 0.8; // Width as a fraction of height
  let ellipseStep = 10; // How much smaller each concentric ellipse gets

  let baseGraphic = null;
  let overlayGraphic = null;
  let isMousePressed = false; // Note: This variable is declared but not used. Consider removing if unnecessary.
  let isMagic = false;

  // Basic setup
  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(50); // Dark gray background
    // Set modes needed for both squares and ellipses initially
    p.rectMode(p.CENTER);
    p.ellipseMode(p.CENTER);
    p.noStroke(); // No outlines initially

    let minDim = Math.min(p.width, p.height);
    // Initialize sizes for both shapes
    maxSquareSize = minDim * 0.8;
    maxEllipseHeight = minDim * 0.8;
    maxEllipseWidth = maxEllipseHeight * eggAspectRatio;

    baseGraphic = p.createGraphics(p.width, p.height);
    overlayGraphic = p.createGraphics(p.width, p.height);

    // Call the new egg drawing function for the base
    p.drawLinedCircleGraphic();
    // Initialize the overlay graphic
    p.drawLinedCircleOverlay();
  };

  // Original square drawing function - keep unmodified
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

  // Original square overlay function - keep unmodified
  p.drawOverlayGraphic = () => {
    overlayGraphic.clear();
    overlayGraphic.rectMode(p.CENTER);
    overlayGraphic.noFill();
    overlayGraphic.strokeWeight(squareStep);
    // Set stroke for overlay squares (e.g., black)
    overlayGraphic.stroke(0);
    let currentSize = maxSquareSize;
    let colorIndex = 0; // Not used if stroke is fixed
    let rotation = 0;

    if(isMagic && magic.modules.imu !== undefined) {
      rotation = magic.modules.imu.orientation.x;
      // console.log(rotation); // Keep console logs for debugging if needed
      rotation = p.map(rotation, -1, 1, -p.PI, p.PI); // Map to a smaller range?
    }
    else {
      // Add mouse interaction fallback if needed
      // rotation = p.map(p.mouseX, 0, p.width, -p.PI, p.PI);
      rotation = 0;
    }
    // console.log(rotation);
    while (currentSize > 0) {
      let rotationFactor = p.map(currentSize, 0, maxSquareSize, 0.2, 0);
      let newRotation = rotation * rotationFactor;
      overlayGraphic.push();
      // Translate to 0,0 because the graphic itself is drawn at mouseX, mouseY
      overlayGraphic.translate(0, 0);
      overlayGraphic.rotate(newRotation);
      overlayGraphic.rect(0, 0, currentSize, currentSize);
      overlayGraphic.pop();
      currentSize -= squareStep*3; // Larger step for overlay
      // colorIndex++; // Not needed if stroke is fixed
    }
  };

  // *** MODIFIED: Draws the base egg shape with Easter colors ***
  p.drawLinedCircleGraphic = () => {
    baseGraphic.background(255); // White background for the base
    baseGraphic.ellipseMode(p.CENTER);
    baseGraphic.noFill();
    baseGraphic.strokeWeight(ellipseStep); // Use ellipse step for stroke weight

    let currentHeight = maxEllipseHeight;
    let currentWidth = maxEllipseWidth;
    let colorIndex = 0;

    while (currentHeight > 0) {
        // Use Easter colors
        baseGraphic.stroke(easterColors[colorIndex % easterColors.length]);
        // Draw ellipse centered in the base graphic
        baseGraphic.ellipse(baseGraphic.width / 2, baseGraphic.height / 2, currentWidth, currentHeight);

        // Decrease size, maintaining aspect ratio
        currentHeight -= ellipseStep;
        currentWidth = currentHeight * eggAspectRatio; // Recalculate width based on new height
        colorIndex++;
    }
  };

  // *** MODIFIED: Draws the overlay egg shape ***
  p.drawLinedCircleOverlay = () => {
    overlayGraphic.clear(); // Clear previous frame
    overlayGraphic.ellipseMode(p.CENTER);
    overlayGraphic.noFill();
    overlayGraphic.strokeWeight(ellipseStep * 0.5); // Match base stroke weight
    overlayGraphic.stroke(0); // Black lines for the overlay effect

    let currentHeight = maxEllipseHeight;
    let currentWidth = maxEllipseWidth;
    let rotation = 0;

    // Get rotation from magic device or fallback (e.g., mouse)
    if(isMagic && magic.modules.imu !== undefined) {
      rotation = magic.modules.imu.orientation.x;
      rotation = p.map(rotation, -1, 1, -p.PI, p.PI); // Map to a reasonable rotation range
    } else {
      rotation = 0; // Default to no rotation if no magic and no mouse fallback
    }

    while (currentHeight > 0) {
      // Map rotation influence based on ellipse size (larger ellipses rotate less)
      let rotationFactor = p.map(currentHeight, 0, maxEllipseHeight, 0.2, 0); // Smaller factor for less rotation
      let newRotation = rotation * rotationFactor;

      overlayGraphic.push();
      // Translate/rotate within the overlay graphic's coordinate system
      // Origin (0,0) is fine because the image is placed at mouseX, mouseY later
      overlayGraphic.translate(overlayGraphic.width / 2, overlayGraphic.height / 2);
      overlayGraphic.rotate(newRotation);
      overlayGraphic.ellipse(0, 0, currentWidth, currentHeight);
      overlayGraphic.pop();

      // Decrease size with a larger step for the overlay effect
      currentHeight -= ellipseStep * 3; // Use a larger step for lenticular effect
      currentWidth = currentHeight * eggAspectRatio; // Maintain aspect ratio
    }
  };

  p.mousePressed = async () => {
    // Toggle dev mode and connect magic on first click
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

  // Basic draw loop - updated to use egg overlay
  p.draw = () => {
    p.background(50); // Clear background each frame

    p.push(); // Isolate base graphic transformations
    p.image(baseGraphic, 0, 0);
    p.pop(); 


    // --- Draw Overlay Graphic at Mouse ---
    p.push(); // Isolate overlay transformations
    // Translate the origin to the mouse position
    p.translate(p.mouseX, p.mouseY);

    // Update the overlay graphic based on interaction *before* drawing it
    console.log(magic.modules);
    if(isMagic && magic.modules.imu !== undefined) {
      console.log("magic");
      p.drawLinedCircleOverlay(); // Update overlay content based on IMU
    } else {
       p.drawLinedCircleOverlay();
    }
    p.imageMode(p.CENTER);
    p.image(overlayGraphic, p.mouseX, p.mouseY);
    p.pop(); // Restore overlay transformations

    // Reset image mode if other things are drawn later
    p.imageMode(p.CORNER);
  };

}

export default Lenticular; 
