import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const SketchTemplate = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // --- Sketch-specific variables and setup ---
  // Add any variables your sketch needs here

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(240); // Light gray background, change as needed
    // Add any initial setup for your sketch here
    // e.g., p.rectMode(p.CENTER); p.noStroke();
    
    console.log("SketchTemplate setup complete. Click to connect magic.");
    // p.noLoop(); // Uncomment if the sketch should not loop automatically
  };

  p.draw = () => {
    // --- Main sketch drawing logic ---
    // p.background(240); // Optionally clear background each frame
    
    // Add your drawing code here
    // Example: p.ellipse(p.width / 2, p.height / 2, 50, 50);

    // Example of using magic data if connected
    if (isMagic && magic.modules.imu?.orientation) {
      let rotationX = magic.modules.imu.orientation.x;
      // Use rotationX or other magic data in your sketch
      // console.log("Magic IMU X:", rotationX); 
    } else {
       // Logic for when magic is not connected (e.g., use mouse)
       // let rotationX = p.map(p.mouseX, 0, p.width, -1, 1);
    }

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

// IMPORTANT: Rename 'SketchTemplate' to match the filename PascalCase
export default SketchTemplate; 