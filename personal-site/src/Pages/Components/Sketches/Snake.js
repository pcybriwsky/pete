import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Snake = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // --- Sketch-specific variables ---
  let playerX, playerY; // Current position of the snake head
  let targetX, targetY; // Target position based on input
  const easing = 0.08; // Smoothing factor (0-1, lower is smoother)

  let trail = []; // Array to store position history {x, y}
  const TRAIL_LENGTH = 20; // Max number of trail segments

  // Colors (defined in setup)
  let headColor;
  let trailStartColor; // Color for the newest trail segment
  let trailEndColor;   // Color for the oldest trail segment

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(240); // Light gray background, change as needed
    p.noStroke(); // No outlines for shapes initially

    // Initialize positions to the center
    playerX = p.width / 2;
    playerY = p.height / 2;
    targetX = playerX;
    targetY = playerY;

    // Initialize colors
    headColor = p.color(0, 255, 0); // Bright Green
    trailStartColor = p.color(0, 0, 255, 255); // Opaque Blue
    trailEndColor = p.color(0, 0, 255, 0);     // Transparent Blue

    console.log("Snake setup complete. Click to connect magic.");
    // Don't call p.loop() here, let mousePressed handle it
    // p.noLoop(); // Start paused until first click
  };

  p.draw = () => {
    p.background(240); // Clear background each frame

    // --- Determine Target Position ---
    if (isMagic && magic.modules.imu?.orientation) {
      let rotW = magic.modules.imu.orientation.w; // Typically -1 to 1
      let rotY = magic.modules.imu.orientation.y; // Typically -1 to 1

      // Map rotation to screen coordinates. Adjust input range [-0.4, 0.4] as needed for sensitivity.
      // Using negative rotW maps right tilt to right movement, left tilt to left movement.
      targetX = p.map(-rotW, -0.4, 0.4, 0, p.width, true); // Clamp ensures target stays on screen
      // Using negative rotY maps forward tilt (away) to upward movement, backward tilt (towards) to downward movement.
      targetY = p.map(-rotY, -0.4, 0.4, 0, p.height, true); // Clamp ensures target stays on screen

      // Optional: Display rotation values for debugging
      // p.fill(0);
      // p.textSize(16);
      // p.text(`rotW: ${rotW.toFixed(2)} -> targetX: ${targetX.toFixed(0)}`, 10, p.height - 40);
      // p.text(`rotY: ${rotY.toFixed(2)} -> targetY: ${targetY.toFixed(0)}`, 10, p.height - 25);

    } else {
      // Use mouse position when magic is not connected
      targetX = p.mouseX;
      targetY = p.mouseY;
    }

    // --- Apply Easing ---
    playerX += (targetX - playerX) * easing;
    playerY += (targetY - playerY) * easing;

    // --- Update Trail ---
    // Add current position to the end of the trail
    trail.push({ x: playerX, y: playerY });

    // Remove the oldest position if the trail is too long
    if (trail.length > TRAIL_LENGTH) {
      trail.shift(); // Removes the first element
    }

    // --- Draw Trail ---
    p.noStroke();
    for (let i = 0; i < trail.length; i++) {
      // Interpolate color and size based on age (index)
      let segmentColor = p.lerpColor(trailEndColor, trailStartColor, i / (trail.length - 1));
      let segmentSize = p.map(i, 0, trail.length - 1, 4, 12); // Smaller for older segments

      p.fill(segmentColor);
      p.ellipse(trail[i].x, trail[i].y, segmentSize, segmentSize);
    }

    // --- Draw Player Head ---
    p.fill(headColor);
    p.ellipse(playerX, playerY, 15, 15); // Slightly larger head

    // --- End main sketch drawing logic ---
  };

  // Handles connecting to the magic device on click
  p.mousePressed = async () => {
    if (isDevMode) {
      isDevMode = false; // Exit dev mode on first click
      if (!isMagic) {
        try {
          await magic.connect({ mesh: false, auto: true });
          console.log("Magic connected. Modules:", magic.modules);
          isMagic = true;
        } catch (error) {
          console.error("Failed to connect magic:", error);
          isDevMode = true; // Revert to dev mode if connection fails
          return;
        }
      }
      // Start the draw loop AFTER the first click (and potential connection attempt)
      p.loop();
    } else {
      // Optional: Add logic for clicks when not in dev mode
      console.log("Sketch interaction click.");
      // If loop was stopped for some reason, clicking again could restart it
      // if (!p.isLooping()) {
      //   p.loop();
      // }
    }
  };

  // Optional: Add other p5.js event functions as needed
  // p.windowResized = () => {
  //   p.resizeCanvas(p.windowWidth, p.windowHeight);
  //   // Re-center player?
  //   playerX = p.width / 2;
  //   playerY = p.height / 2;
  //   targetX = playerX;
  //   targetY = playerY;
  //   trail = []; // Clear trail on resize?
  // };
  // p.keyPressed = () => { ... }
};

// IMPORTANT: Rename 'Snake' to match the filename PascalCase
export default Snake; 