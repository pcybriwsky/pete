const Lightball = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // Physics variables
  let ball = {
    x: 0,
    y: 0,
    radius: 20,
    velocityX: 5,
    velocityY: 5
  };

  // Pentagon vertices
  let pentagon = [];
  let pentagonRadius = 300;
  let pentagonCenter = { x: 0, y: 0 };

  // Audio setup
  let audioContext = null;
  let oscillator = null;
  let notes = [261.63, 329.63, 392.00, 493.88, 587.33]; // C4, E4, G4, B4, D5

  const playNote = (frequency) => {
    if (!audioContext) return;
    
    // Create oscillator
    oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    // Start and stop
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(240);
    
    // Calculate pentagon vertices
    pentagonCenter = { x: p.width / 2, y: p.height / 2 };
    for (let i = 0; i < 5; i++) {
      let angle = p.TWO_PI * i / 5 - p.PI / 2;
      pentagon.push({
        x: pentagonCenter.x + pentagonRadius * p.cos(angle),
        y: pentagonCenter.y + pentagonRadius * p.sin(angle)
      });
    }

    // Set initial ball position
    ball.x = pentagonCenter.x;
    ball.y = pentagonCenter.y;
    
    console.log("Lightball setup complete. Click to start.");
  };

  p.draw = () => {
    p.background(240);
    
    // Draw pentagon
    p.stroke(0);
    p.noFill();
    p.beginShape();
    for (let vertex of pentagon) {
      p.vertex(vertex.x, vertex.y);
    }
    p.endShape(p.CLOSE);

    // Update ball position
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Check collisions with pentagon sides
    for (let i = 0; i < 5; i++) {
      let nextI = (i + 1) % 5;
      let side = {
        x1: pentagon[i].x,
        y1: pentagon[i].y,
        x2: pentagon[nextI].x,
        y2: pentagon[nextI].y
      };
      
      // Simple collision detection
      if (p.dist(ball.x, ball.y, side.x1, side.y1) + p.dist(ball.x, ball.y, side.x2, side.y2) <= 
          p.dist(side.x1, side.y1, side.x2, side.y2) + ball.radius) {
        
        // Play sound
        if (audioContext) {
          playNote(notes[i]);
        }
        
        // Bounce (simplified)
        ball.velocityX *= -1.1; // Speed up slightly
        ball.velocityY *= -1.1;
      }
    }

    // Draw ball
    p.fill(255, 200, 0);
    p.noStroke();
    p.ellipse(ball.x, ball.y, ball.radius * 2);
  };

  // Initialize audio on first click
  p.mousePressed = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    p.loop();
  };

  // Cleanup
  p.remove = () => {
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  };

  // Optional: Add other p5.js event functions as needed
  // p.windowResized = () => { ... }
  // p.keyPressed = () => { ... }
};

// IMPORTANT: Rename 'Lightball' to match the filename PascalCase
export default Lightball; 