// myP5Sketch.js
const myP5Sketch = (p) => {
    p.setup = () => {
      p.createCanvas(400, 400);
      // More setup code...
    };
  
    p.draw = () => {
      p.background(220);
      p.ellipse(p.mouseX, p.mouseY, 10, 10);
    };
  
    // Add other p5 functions as needed
  };
  
  export default myP5Sketch;
  