import { InkLine } from '../Functions/InkLine';
import { Poly } from '../Functions/Watercolor';

const Sketchbook = (p) => {
  let lines = [];
  let lineInterval = 0;
  const totalLines = 8;
  let currentMode = 'random'; // or 'random'
  
  // Color palettes
  const palettes = [
    [[47, 72, 88], [214, 40, 57]],
    [[55, 63, 81], [0, 141, 213]],
    [[229, 99, 153], [50, 14, 59]],
    [[252, 186, 4], [165, 1, 4]],
    [[165, 1, 4], [100, 141, 229]],
    [[80, 114, 85], [72, 139, 73]]
  ];

  const customShuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
      randomIndex = Math.floor(p.random(currentIndex));
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  const drawRandomShapes = () => {
    // Move existing random shapes drawing logic here
    const positions = [];
    const margin = 100;
    for (let i = 0; i < totalLines; i++) {
      positions.push({
        x: p.random(margin, p.width - margin),
        y: p.random(margin, p.height - margin)
      });
    }
    
    positions.sort((a, b) => a.x - b.x);
    const inc = 100;
    
    for (let i = 0; i < totalLines; i++) {
      let currentInkLine = lines[i];
      let pos = positions[i];
      
      currentInkLine.setPointsFunction(pos.x, pos.y, pos.x + inc, pos.y, p);
      
      let v = [];
      let step = Math.round(currentInkLine.points.length / 20);
      for (let l = 0; l < currentInkLine.points.length; l += step) {
        p.angleMode(p.RADIANS);
        v.push(p.createVector(currentInkLine.points[l].x, currentInkLine.points[l].y));
      }
      
      let poly = new Poly(v, null, p);
      poly.colorIn(currentInkLine.colors[1], currentInkLine.colors[0], 0, p);
      
      p.angleMode(p.DEGREES);
      currentInkLine.drawLine(pos.x, pos.y, pos.x + inc, pos.y, p.frameCount * 100000, p);
    }
  };

  const drawLSystemTree = () => {
    const sequence = generateLSystem(
      lSystemRules.axiom, 
      lSystemRules.rules, 
      lSystemRules.iterations
    );
    
    let currentX = p.width / 2;
    let currentY = p.height - 100;
    let length = lSystemRules.initialLength;
    let angle = 0;
    const stack = [];
    
    // Create a new InkLine for the tree
    let treeLine = new InkLine(palettes[0], null);
    treeLine.setSplatter(0.95, 0.5, 0);
    treeLine.setEndBubble(0.2);
    treeLine.setAnalogueness(0.3, 0);
    treeLine.setDrawFunction(0); // Use line type
    
    // Process L-system sequence
    for (let char of sequence) {
      switch(char) {
        case 'F':
          // Calculate end point
          const nextX = currentX + length * p.cos(p.radians(angle));
          const nextY = currentY - length * p.sin(p.radians(angle));
          
          // Draw branch
          treeLine.setPointsFunction(currentX, currentY, nextX, nextY, p);
          treeLine.drawLine(currentX, currentY, nextX, nextY, p.frameCount * 100000, p);
          
          // Update position
          currentX = nextX;
          currentY = nextY;
          break;
        case '+':
          angle += lSystemRules.angle;
          break;
        case '-':
          angle -= lSystemRules.angle;
          break;
        case '[':
          stack.push({x: currentX, y: currentY, angle: angle, length: length});
          length *= lSystemRules.reductionFactor;
          break;
        case ']':
          const saved = stack.pop();
          currentX = saved.x;
          currentY = saved.y;
          angle = saved.angle;
          length = saved.length;
          break;
      }
    }
  };

  p.setup = () => {
    const parentWidth = p.canvas.parentElement.offsetWidth;
    const parentHeight = p.canvas.parentElement.offsetHeight;
    p.createCanvas(parentWidth, parentHeight);
    p.pixelDensity(4);
    
    customShuffle(palettes);
    
    // Initialize lines for random shapes
    for (let i = 0; i < totalLines; i++) {
      let ink = new InkLine(palettes[i % palettes.length], null);
      ink.setSplatter(0.98 - i/100, 0.4 + i/100, i);
      ink.setEndBubble(0.4);
      ink.setAnalogueness(0.2, i % 8);
      ink.setStops(2);
      ink.setDrawFunction(Math.floor(p.random(3)));
      lines.push(ink);
    }
  };

  p.draw = () => {
    p.background(246, 244, 243);
    
    if (currentMode === 'random') {
      drawRandomShapes();
    } else {
      drawLSystemTree();
    }
    
    p.noLoop();
  };

  // Keep existing windowResized and customShuffle functions
};

export default Sketchbook; 