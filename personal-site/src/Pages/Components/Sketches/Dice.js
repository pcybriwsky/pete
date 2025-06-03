import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Rename this function to match the filename PascalCase
const Dice = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // Dice properties
  const diceSize = 60;
  const dice = [
    { x: 0, y: 0, vx: 0, vy: 0, rotationX: 0, rotationY: 0, rotationZ: 0, value: 1 },
    { x: 0, y: 0, vx: 0, vy: 0, rotationX: 0, rotationY: 0, rotationZ: 0, value: 1 }
  ];
  let isRolling = false;
  const friction = 0.98;
  const gravity = 0.5;
  const bounce = 0.7;

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.background(240);
    
    // Set initial camera position
    p.camera(0, -200, 400, 0, 0, 0, 0, 1, 0);
    
    // Initial dice positions
    dice[0].x = -100;
    dice[1].x = 100;
    dice[0].y = dice[1].y = 0;
    
    console.log("Dice setup complete. Click to roll dice.");
  };

  p.draw = () => {
    p.background(240);
    
    // Lighting setup
    p.ambientLight(60);
    p.directionalLight(255, 255, 255, 0.5, 0.5, -1);
    
    // Update and draw dice
    for (let die of dice) {
      if (isRolling) {
        // Apply physics
        die.vy += gravity;
        die.x += die.vx;
        die.y += die.vy;
        
        // Update rotations based on movement
        die.rotationX += die.vx * 0.05;
        die.rotationY += die.vy * 0.05;
        die.rotationZ += (die.vx + die.vy) * 0.02;
        
        // Bounce off walls
        if (die.x < -200) {
          die.x = -200;
          die.vx *= -bounce;
        }
        if (die.x > 200) {
          die.x = 200;
          die.vx *= -bounce;
        }
        if (die.y > 200) {
          die.y = 200;
          die.vy *= -bounce;
        }
        
        // Apply friction
        die.vx *= friction;
        die.vy *= friction;
        
        // Stop rolling when dice slow down
        if (Math.abs(die.vx) < 0.1 && Math.abs(die.vy) < 0.1 && die.y >= 200) {
          isRolling = false;
          // Pick a random value for the die
          die.value = Math.floor(p.random(1, 7));
          // Snap rotation so the correct face is on top
          setDieRotationForValue(die, die.value);
          // Stop all velocities
          die.vx = 0;
          die.vy = 0;
        }
      }
      
      // Draw die
      p.push();
      p.translate(die.x, die.y, 0);
      p.rotateX(die.rotationX);
      p.rotateY(die.rotationY);
      p.rotateZ(die.rotationZ);
      
      // Draw cube
      p.push();
      p.fill(255);
      p.stroke(0);
      p.strokeWeight(2);
      
      // Draw each face
      drawCubeFace(1); // Front face
      p.rotateY(p.PI);
      drawCubeFace(6); // Back face
      p.rotateY(p.PI/2);
      drawCubeFace(3); // Right face
      p.rotateY(-p.PI);
      drawCubeFace(4); // Left face
      p.rotateX(p.PI/2);
      drawCubeFace(5); // Top face
      p.rotateX(p.PI);
      drawCubeFace(2); // Bottom face
      
      p.pop();
      p.pop();
    }
  };

  function drawCubeFace(value) {
    p.push();
    p.translate(0, 0, diceSize/2);
    p.box(diceSize, diceSize, 1);
    drawDots(value);
    p.pop();
  }

  function drawDots(value) {
    p.fill(0);
    const dotSize = 8;
    const spacing = diceSize/4;
    
    switch(value) {
      case 1:
        p.ellipse(0, 0, dotSize);
        break;
      case 2:
        p.ellipse(-spacing, -spacing, dotSize);
        p.ellipse(spacing, spacing, dotSize);
        break;
      case 3:
        p.ellipse(-spacing, -spacing, dotSize);
        p.ellipse(0, 0, dotSize);
        p.ellipse(spacing, spacing, dotSize);
        break;
      case 4:
        p.ellipse(-spacing, -spacing, dotSize);
        p.ellipse(spacing, -spacing, dotSize);
        p.ellipse(-spacing, spacing, dotSize);
        p.ellipse(spacing, spacing, dotSize);
        break;
      case 5:
        p.ellipse(-spacing, -spacing, dotSize);
        p.ellipse(spacing, -spacing, dotSize);
        p.ellipse(0, 0, dotSize);
        p.ellipse(-spacing, spacing, dotSize);
        p.ellipse(spacing, spacing, dotSize);
        break;
      case 6:
        p.ellipse(-spacing, -spacing, dotSize);
        p.ellipse(spacing, -spacing, dotSize);
        p.ellipse(-spacing, 0, dotSize);
        p.ellipse(spacing, 0, dotSize);
        p.ellipse(-spacing, spacing, dotSize);
        p.ellipse(spacing, spacing, dotSize);
        break;
    }
  }

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
          isDevMode = true;
          return;
        }
      }
    }
    
    // Roll dice
    if (!isRolling) {
      isRolling = true;
      for (let die of dice) {
        die.vx = p.random(-10, 10);
        die.vy = p.random(-15, -5);
      }
    }
    
    if (!isDevMode) {
      p.loop();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    // Reset camera on window resize
    p.camera(0, -200, 400, 0, 0, 0, 0, 1, 0);
  };
};

function setDieRotationForValue(die, value) {
  // Set rotationX and rotationY so the correct face is on top
  // 1: top face up (default)
  // 2: bottom face up (rotateX PI)
  // 3: right face up (rotateY -PI/2)
  // 4: left face up (rotateY PI/2)
  // 5: front face up (rotateX -PI/2)
  // 6: back face up (rotateX PI/2)
  switch (value) {
    case 1:
      die.rotationX = 0;
      die.rotationY = 0;
      break;
    case 2:
      die.rotationX = Math.PI;
      die.rotationY = 0;
      break;
    case 3:
      die.rotationX = 0;
      die.rotationY = -Math.PI/2;
      break;
    case 4:
      die.rotationX = 0;
      die.rotationY = Math.PI/2;
      break;
    case 5:
      die.rotationX = -Math.PI/2;
      die.rotationY = 0;
      break;
    case 6:
      die.rotationX = Math.PI/2;
      die.rotationY = 0;
      break;
  }
  die.rotationZ = 0;
}

export default Dice; 