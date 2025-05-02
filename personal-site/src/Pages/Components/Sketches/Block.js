import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Block = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // --- Sketch-specific variables and setup ---
  const gridCols = 11; // Define the number of columns
  let gridRows;      // Rows will be calculated based on canvas height and cell size
  let grid = [];
  let cellWidth, cellHeight; // Cell dimensions (will be made equal)
  
  // Represents the player/moving square's position
  let playerRow = 0; 
  let playerCol = 0;

  // Movement control
  const MOVE_THRESHOLD = 0.1; // Adjust sensitivity as needed
  let canMoveHorizontal = true;
  let canMoveVertical = true;

  // Colors
  let PLAYER_COLOR; 
  let TRAIL_COLOR;
  let DEFAULT_COLOR;
  let BORDER_COLOR;

  // GridSquare Class Definition
  class GridSquare {
    constructor(p, row, col, x, y, w, h) {
      this.p = p; // Store p5 instance
      this.row = row;
      this.col = col;
      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;
      this.color = p.color(255); // Default white
      this.borderColor = p.color(0); // Default black
      this.borderWeight = 1;
    }

    draw() {
      this.p.push(); // Isolate drawing styles
      this.p.fill(this.color);
      this.p.stroke(this.borderColor);
      this.p.strokeWeight(this.borderWeight);
      // Draw rectangle from top-left corner
      this.p.rect(this.x, this.y, this.width, this.height); 
      this.p.pop(); // Restore previous drawing styles
    }

    setColor(newColor) {
      this.color = newColor;
    }
  }

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(240); // Light gray background, change as needed
    
    // Define colors using p5 instance after it's available
    PLAYER_COLOR = p.color(0, 255, 0);   // Bright Green
    TRAIL_COLOR = p.color(0, 0, 255);    // Blue
    DEFAULT_COLOR = p.color(255);        // White
    BORDER_COLOR = p.color(0);           // Black
    
    // Calculate square cell dimensions based on width and number of columns
    cellWidth = p.width / gridCols;
    cellHeight = cellWidth; // Make cells square
    
    // Calculate the number of rows needed to fill the height
    gridRows = Math.ceil(p.height / cellHeight);
    
    // Initialize Grid
    grid = []; // Clear grid before setup
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        let x = c * cellWidth;
        let y = r * cellHeight;
        grid.push(new GridSquare(p, r, c, x, y, cellWidth, cellHeight));
      }
    }

    // Set initial player position to the center
    playerRow = Math.floor(gridRows / 2);
    playerCol = Math.floor(gridCols / 2);

    // Color the initial center square
    const initialPlayerIndex = playerRow * gridCols + playerCol;
    if (grid[initialPlayerIndex]) {
       grid[initialPlayerIndex].setColor(PLAYER_COLOR); // Start with player color
    }
    
    console.log("Block setup complete. Grid initialized. Click to connect magic.");
    // p.noLoop(); // Uncomment if the sketch should not loop automatically
  };

  // --- Keep centerX/Y for potential future use, but they aren't used for grid drawing ---
  
  // --- End kept variables ---

  p.draw = () => {
    // --- Main sketch drawing logic ---
    // p.background(240, 50); // Grid covers the background

    // --- Update square colors based on state (BEFORE drawing) ---
    const playerIndex = playerRow * gridCols + playerCol; // Calculate player index

    if (isMagic && magic.modules.imu?.orientation) {
      // --- IMU Logic --- 
      // NOTE: Trail Effect: We DON'T reset all squares here.
      // The previous player square keeps its color.

      // Color player square differently when magic is active (e.g., blue)
      // Color setting moved after potential position update.
 
      // Read IMU data (for display/future use)
      let rotW = magic.modules.imu.orientation.w; 
      let rotX = magic.modules.imu.orientation.x; 
      let rotY = magic.modules.imu.orientation.y; 
      let rotZ = magic.modules.imu.orientation.z; 
      
      // --- Movement Logic based on IMU ---
      let moved = false;
      // Horizontal (rotW -> Columns: Left/Right)
      if (rotW < -MOVE_THRESHOLD && canMoveHorizontal) {
         const prevPlayerIndex = playerRow * gridCols + playerCol;
         if(grid[prevPlayerIndex]) grid[prevPlayerIndex].setColor(TRAIL_COLOR);
         playerCol = Math.max(0, playerCol - 1); // Move Left
         canMoveHorizontal = false;
         moved = true;
      } else if (rotW > MOVE_THRESHOLD && canMoveHorizontal) {
         const prevPlayerIndex = playerRow * gridCols + playerCol;
         if(grid[prevPlayerIndex]) grid[prevPlayerIndex].setColor(TRAIL_COLOR);
         playerCol = Math.min(gridCols - 1, playerCol + 1); // Move Right
         canMoveHorizontal = false;
         moved = true;
      } else if (Math.abs(rotW) < MOVE_THRESHOLD * 0.8) {
         canMoveHorizontal = true; // Reset flag when near center
      }

      // Vertical (rotY -> Rows: Up/Down)
      if (rotY < -MOVE_THRESHOLD && canMoveVertical) {
         const prevPlayerIndex = playerRow * gridCols + playerCol;
         if(grid[prevPlayerIndex]) grid[prevPlayerIndex].setColor(TRAIL_COLOR);
         playerRow = Math.max(0, playerRow - 1); // Move Up
         canMoveVertical = false;
         moved = true;
      } else if (rotY > MOVE_THRESHOLD && canMoveVertical) {
         const prevPlayerIndex = playerRow * gridCols + playerCol;
         if(grid[prevPlayerIndex]) grid[prevPlayerIndex].setColor(TRAIL_COLOR);
         playerRow = Math.min(gridRows - 1, playerRow + 1); // Move Down
         canMoveVertical = false;
         moved = true;
      } else if (Math.abs(rotY) < MOVE_THRESHOLD * 0.8) {
         canMoveVertical = true; // Reset flag when near center
      }

      // If a move happened, update color of the NEW player square
      const newPlayerIndex = playerRow * gridCols + playerCol;
      if (moved && grid[newPlayerIndex]) { 
          grid[newPlayerIndex].setColor(PLAYER_COLOR); // Player color
      }

    } else {
      // --- Mouse Logic --- 
      // 1. Reset non-player squares to white
      // for (const square of grid) {
      //   if (!(square.row === playerRow && square.col === playerCol)) {
      //     square.setColor(p.color(255)); // White
      //   }
      // }

      // 2. Color the player square red
      if (grid[playerIndex]) { 
         grid[playerIndex].setColor(p.color(255, 0, 0)); // Red player
      }
 
      // 3. Handle hover effect
      let hoveredSquareFound = false;
      for (const square of grid) {
        // Check if mouse is inside the square's bounds
        if (!hoveredSquareFound && // Optimization: only highlight one
            p.mouseX > square.x && p.mouseX < square.x + square.width &&
            p.mouseY > square.y && p.mouseY < square.y + square.height) {
          
          // If it's not the player square, change color on hover
          if (!(square.row === playerRow && square.col === playerCol)) {
            //  square.setColor(p.color(200)); // Light grey for hover
          }
          hoveredSquareFound = true; // Mark as found
        }
      }
    } // End of if/else isMagic

    // --- Draw all grid squares (with updated colors) ---
    for (const square of grid) {
      square.draw();
    }

    // --- Display Debug Text (AFTER drawing grid) ---
    if (isMagic && magic.modules.imu?.orientation) {
      // Display IMU values
      let rotW = magic.modules.imu.orientation.w;
      let rotX = magic.modules.imu.orientation.x;
      let rotY = magic.modules.imu.orientation.y;
      let rotZ = magic.modules.imu.orientation.z;
      p.push();
      p.fill(0); // Black text
      p.noStroke();
      p.textSize(16); // Smaller text size
      p.text(`rotW: ${Math.floor(rotW * 100) / 100}`, 10, p.height - 70);
      p.text(`rotX: ${Math.floor(rotX * 100) / 100}`, 10, p.height - 55);
      p.text(`rotY: ${Math.floor(rotY * 100) / 100}`, 10, p.height - 40);
      p.text(`rotZ: ${Math.floor(rotZ * 100) / 100}`, 10, p.height - 25);
      p.text(`Player: [${playerRow}, ${playerCol}]`, 10, p.height - 10);
      p.pop();
    } else {
      // Display Mouse and Player Position
      p.push();
      p.fill(0); // Black text
      p.noStroke();
      p.textSize(16); // Smaller text size
      p.text("MouseX: " + p.mouseX.toFixed(0), 10, p.height - 40);
      p.text("MouseY: " + p.mouseY.toFixed(0), 10, p.height - 25);
      p.text(`Player: [${playerRow}, ${playerCol}]`, 10, p.height - 10);
      // NOTE: The loop that colored the player square here was removed 
      // as the logic is now handled before drawing the grid.
      p.pop();
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

// IMPORTANT: Rename 'Block' to match the filename PascalCase
export default Block; 