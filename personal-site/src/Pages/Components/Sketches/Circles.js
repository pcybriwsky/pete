const circles = (p) => {
  let circles = [];

  p.setup = () => {
    // Calculate size to maintain 9:16 ratio within parent container
    const parentWidth = p.canvas.parentElement.offsetWidth;
    const parentHeight = p.canvas.parentElement.offsetHeight;
    
    // Calculate maximum dimensions that maintain 9:16 ratio
    let canvasWidth, canvasHeight;
    if (parentWidth / parentHeight > 9/16) {
      // Parent is wider than 9:16 - fit to height
      canvasHeight = parentHeight;
      canvasWidth = parentHeight * (9/16);
    } else {
      // Parent is taller than 9:16 - fit to width
      canvasWidth = parentWidth;
      canvasHeight = parentWidth * (16/9);
    }
    
    p.createCanvas(canvasWidth, canvasHeight);
    p.colorMode(p.HSB, 360, 100, 100, 1);
  };

  p.draw = () => {
    p.background(230, 10, 90);
    
    // Add new circle at mouse position
    if (p.mouseIsPressed && p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      circles.push({
        x: p.mouseX,
        y: p.mouseY,
        size: p.random(20, 50),
        hue: p.random(360),
        speed: p.random(1, 3)
      });
    }
    
    // Update and draw circles
    for (let i = circles.length - 1; i >= 0; i--) {
      let circle = circles[i];
      
      // Draw circle
      p.noStroke();
      p.fill(circle.hue, 70, 90, 0.7);
      p.ellipse(circle.x, circle.y, circle.size);
      
      // Update position
      circle.y -= circle.speed;
      circle.size *= 0.99;
      
      // Remove small circles
      if (circle.size < 1) {
        circles.splice(i, 1);
      }
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default circles; 