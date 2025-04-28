import * as magic from "@indistinguishable-from-magic/magic-js"

// Adapted from code by Roni Kaufman
const BlobRotation = (p) => {
  let isDevMode = true; 
  let isMagic = false;

  // --- Blob Parameters ---
  let kMax;       // Maximum noise factor
  let step;       // Noise step per blob layer
  let n = 80;     // number of blobs
  let radius = 80; // base diameter of the circle
  let inter = 1;   // difference between the sizes of two blobs
  let maxNoise = 1000; // Maximum noise effect amplitude

  // Easing function for noise (stronger on outer layers)
  let noiseProg = (x) => p.pow(x, 1.5); 

  // --- Blob Position (initialized in setup) ---
  let centerX;
  let centerY;

  // --- Setup ---
  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.DEGREES); // Use degrees for angles
    p.noFill(); // Default to no fill initially
    p.noStroke(); // Default to no stroke initially

    // Initialize blob parameters
    kMax = p.random(0.6, 1.0);
    step = 0.01;

    console.log("BlobRotation setup complete. Click to connect magic.");
    // Start looping immediately for animation
    // p.loop(); // Loop is started in mousePressed after potential magic connect
    p.background(0); // Initial background

    // Initialize blob center position
    centerX = p.width / 2;
    centerY = p.height / 2;
    centerX1 = centerX;
    centerY1 = centerY;
    centerX2 = centerX;
    centerY2 = centerY;
    centerX3 = centerX;
    centerY3 = centerY;
  };

  let centerX1;
  let centerY1;
  let centerX2;
  let centerY2;
  let centerX3;
  let centerY3;

  let hideText = false;

  // --- Draw loop ---
  p.draw = () => {
    // Set blend mode for additive color effect
    p.blendMode(p.BLEND); 
    p.background(0); // Clear background each frame
    p.blendMode(p.ADD); // Switch to additive blending

    let t = p.frameCount / 150; // Time variable for noise evolution

    // Determine target position (same for all channels)
    let targetCenterX = p.width / 2; // Default to center
    let targetCenterY = p.height / 2;
    
    if (isMagic && magic.modules.imu?.orientation) {
      let rotW = magic.modules.imu.orientation.w; // -1 to 1
      let rotX = magic.modules.imu.orientation.x; // -1 to 1
      let rotY = magic.modules.imu.orientation.y; // -1 to 1
      let rotZ = magic.modules.imu.orientation.z; // -1 to 1
      
      if (!hideText) {
        p.noStroke();
        p.fill(255);
        p.textSize(20);
        p.text("rotW: " + rotW, 10, 10);
        p.text("rotX: " + rotX, 10, 30);
        p.text("rotY: " + rotY, 10, 50);
        p.text("rotZ: " + rotZ, 10, 70);
      }

      targetCenterX = p.map(rotW, -0.25, 0.25, 0, p.height, false); // Map Y rotation to X position
      targetCenterY = p.map(rotY, -0.25, 0.25, 0, p.width, false); // Map Z rotation to Y position
      
    } else { 
      // Fallback to mouse
      targetCenterX = p.mouseX;
      targetCenterY = p.mouseY;
    }
  
    // Apply easing/smoothing to the actual position
    let easingFactor = 0.05; // Controls how quickly the blob follows (0.01 = slow, 0.1 = fast)
    centerX += (targetCenterX - centerX) * easingFactor;
    centerY += (targetCenterY - centerY) * easingFactor;

    let easingFactor1 = 0.05; // Controls how quickly the blob follows (0.01 = slow, 0.1 = fast)
    centerX1 += (targetCenterX - centerX1) * easingFactor1;
    centerY1 += (targetCenterY - centerY1) * easingFactor1;

    let easingFactor2 = 0.1; // Controls how quickly the blob follows (0.01 = slow, 0.1 = fast)
    centerX2 += (targetCenterX - centerX2) * easingFactor2;
    centerY2 += (targetCenterY - centerY2) * easingFactor2;

    let easingFactor3 = 0.15; // Controls how quickly the blob follows (0.01 = slow, 0.1 = fast)
    centerX3 += (targetCenterX - centerX3) * easingFactor3;
    centerY3 += (targetCenterY - centerY3) * easingFactor3;



    if (centerX > p.width) {
      centerX = p.width;
    }
    if (centerX < 0) {
      centerX = 0;
    }
    if (centerY > p.height) {
      centerY = p.height;
    }
    if (centerY < 0) {
      centerY = 0;
    }

    if (centerX1 > p.width) {
      centerX1 = p.width;
    }
    if (centerX1 < 0) {
      centerX1 = 0;
    }
    if (centerY1 > p.height) {
      centerY1 = p.height;
    }
    if (centerY1 < 0) {
      centerY1 = 0;
    }

    if (centerX2 > p.width) {
      centerX2 = p.width;
    }
    if (centerX2 < 0) {
      centerX2 = 0;
    }
    if (centerY2 > p.height) {
      centerY2 = p.height;
    }
    if (centerY2 < 0) {
      centerY2 = 0;
    }

    if (centerX3 > p.width) {
      centerX3 = p.width;
    }
    if (centerX3 < 0) {
      centerX3 = 0;
    }
    if (centerY3 > p.height) {
      centerY3 = p.height;
    }
    if (centerY3 < 0) {
      centerY3 = 0;
    }

    for (let i = n; i > 0; i--) {
      let alpha = p.pow(1 - noiseProg(i / n), 3); // Transparency decreases for inner blobs
      let size = radius - i * inter;            // Size increases for outer blobs
      let k = kMax * p.sqrt(i / n);             // Noise factor depends on layer
      let baseNoisiness = maxNoise * noiseProg(i / n); // Base noise amplitude for this layer
      p.noFill();
      p.strokeWeight(size/10);
      // Draw three overlapping blobs with RGB colors
      p.stroke(255, 0, 0, alpha * 255); // Red
      blob(size, centerX1, centerY1, k, t - i * step, baseNoisiness);

      p.stroke(0, 255, 0, alpha * 255); // Green
      blob(size, centerX2, centerY2, k, t - i * step + 0.2, baseNoisiness); // Offset time slightly

      p.stroke(0, 0, 255, alpha * 255); // Blue
      blob(size, centerX3, centerY3, k, t - i * step + 0.4, baseNoisiness); // Offset time slightly more
    }
  };

  // --- Blob drawing function (nested) ---
  function blob(size, xCenter, yCenter, k, t, noisiness) {
    p.beginShape();
    let angleStep = 360 / 8; // Drawing segments (lower for smoother curves)
    for (let theta = 0; theta <= 360 + 2 * angleStep; theta += angleStep) {
      // Calculate noise offset based on angle
      let r1 = p.cos(theta) + 1; 
      let r2 = p.sin(theta) + 1;
      // Modified noise calculation incorporating angle into time/third dimension
      let noiseVal = p.noise(k * r1, k * r2, t + p.sin(theta) * 0.1); 
      let r = size + noiseVal * noisiness;
      // Convert polar coordinates (r, theta) to Cartesian (x, y)
      let x = xCenter + r * p.cos(theta);
      let y = yCenter + r * p.sin(theta);
      p.curveVertex(x, y); // Define vertex for the curve
    }
    p.endShape(); // Close the shape
  }


  // --- Magic Connection Logic ---
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
          isDevMode = true; // Revert to dev mode if connection fails
          return; // Prevent loop start if connection failed
        }
      }
    } else {
      console.log("Sketch interaction click.");
      // Add any interaction logic needed for the blob itself here
    }

    // Start the p5.js draw loop only after the first click 
    if (!isDevMode && !p.isLooping()) { 
       p.loop(); 
    }
  };

  // Optional: Handle window resize
  // p.windowResized = () => { 
  //   p.resizeCanvas(p.windowWidth, p.windowHeight);
  //   p.background(0); // Redraw background on resize
  // }
};

export default BlobRotation; 