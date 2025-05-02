import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Bullseye = (p) => {
  let isDevMode = true;
  let isMagic = false;

  let rings = 100;
  let ringSize = 10;
  let ringSpacing = 10;
  let radius = rings * ringSize;
  let lenticularOverlay;
  let coloredOverlay;

  let hideText = false;
  let centered = true;

  p.drawBlackCircle = (centerX, centerY) => {
    lenticularOverlay.clear();
    lenticularOverlay.push();
    lenticularOverlay.noFill();
    lenticularOverlay.stroke(0);
    lenticularOverlay.strokeWeight(ringSize / 2);
    lenticularOverlay.ellipseMode(p.CENTER);

    for (let i = 0; i < rings * 2; i++) {
      let centerXOffset = p.map(i, rings * 2, 0, 0, centerX, false);
      let centerYOffset = p.map(i, rings * 2, 0, 0, centerY, false);
      if (!centered) {
        centerXOffset = 0;
        centerYOffset = 0;
      }
      let x = p.width / 2 + centerXOffset;
      let y = p.height / 2 + centerYOffset;
      if (i % 3 === 0) {
        lenticularOverlay.ellipse(x, y, i * ringSize / 2, i * ringSize / 2);
      }
    }
    lenticularOverlay.pop();
  }

  p.drawColorCircle = () => {
    coloredOverlay.push();
    let colors = [
      [255, 255, 0],
      [0, 255, 255],
      [255, 0, 255],
    ];
    p.noFill();

    coloredOverlay.noFill();

    for (let i = 0; i < rings * 2; i++) {
      coloredOverlay.push();
      coloredOverlay.stroke(colors[i % colors.length]);
      coloredOverlay.strokeWeight(ringSize / 2);
      coloredOverlay.ellipseMode(p.CENTER);
      coloredOverlay.ellipse(p.width / 2, p.height / 2, i * ringSize / 2, i * ringSize / 2);
      coloredOverlay.pop();
    }
  }

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(240); // Light gray background, change as needed
    lenticularOverlay = p.createGraphics(p.width, p.height);
    lenticularOverlay.clear();
    p.drawBlackCircle();

    coloredOverlay = p.createGraphics(p.width, p.height);
    coloredOverlay.clear();
    p.drawColorCircle();
  };

  p.draw = () => {// Example: p.ellipse(p.width / 2, p.height / 2, 50, 50);
    p.clear();

    p.image(coloredOverlay, 0, 0);

    let centerX = p.width / 2;
    let centerY = p.height / 2;
    if (isMagic && magic.modules.imu?.orientation) {
      let rotW = magic.modules.imu.orientation.w; // -1 to 1
      let rotX = magic.modules.imu.orientation.x; // -1 to 1
      let rotY = magic.modules.imu.orientation.y; // -1 to 1
      let rotZ = magic.modules.imu.orientation.z; // -1 to 1

      if (!hideText) {
        p.noStroke();
        p.fill(0);
        p.textSize(20);

        p.text("rotW: " + rotW, 10, 30);
        p.text("rotX: " + rotX, 10, 50);
        p.text("rotY: " + rotY, 10, 70);
        p.text("rotZ: " + rotZ, 10, 90);
      }

      let inversion = -1;
      let xVal = p.map(inversion * rotW, 0.25, -0.25, p.width / 2 - radius, p.width / 2 + radius, false); // Map Y rotation to X position
      let yVal = p.map(inversion * rotY, 0.25, -0.25, p.height / 2 - radius, p.height / 2 + radius, false); // Map Z rotation to Y position

      let easing = 0.1;

      centerX = centerX * (1 - easing) + xVal * easing;
      centerY = centerY * (1 - easing) + yVal * easing;
      p.drawBlackCircle(centerX - p.width / 2, centerY - p.height / 2);
    } else {
      centerX = p.mouseX;
      centerY = p.mouseY;
    }

    let midX = p.width / 2;
    let midY = p.height / 2;
    if (!centered) {
      midX = centerX;
      midY = centerY;
    }
    p.push();
    p.imageMode(p.CENTER);

    p.image(lenticularOverlay, midX, midY);
    p.pop();

    // --- End main sketch drawing logic ---
  };

  // Handles connecting to the magic device on click
  p.mousePressed = async () => {
    if (isDevMode) {
      isDevMode = false;
      if (!isMagic) {
        try {
          await magic.connect({ mesh: false, auto: true });
          console.log("Magic connected. Modules:", magic.modules);
          isMagic = true;
        } catch (error) {
          console.error("Failed to connect magic:", error);
          // Keep isDevMode true or handle connection failure
          isDevMode = true; // Revert to dev mode if connection fails
          return; // Prevent loop start if connection failed
        }
      }
    } else {
      // Optional: Add logic for clicks when not in dev mode (e.g., interacting with the sketch)
      console.log("Sketch interaction click.");
    }

    // Start the p5.js draw loop only after the first click 
    // (and potentially successful magic connection)
    if (!isDevMode) {
      p.loop();
    }
  };

  // Optional: Add other p5.js event functions as needed
  // p.windowResized = () => { ... }
  // p.keyPressed = () => { ... }
};

// IMPORTANT: Rename 'Bullseye' to match the filename PascalCase
export default Bullseye; 