import { InkLine } from "../Functions/InkLine";
import { Poly } from "../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../Functions/filesharing";
let drawing = null;
// Generate a palette of 5 colors in Hex that are visually distinct with a simple modern aesthetic

const palette = ['#F7F7F7', '#FFC0CB', '#FF69B4', '#FF1493', '#C71585'];
let x1 = 100;
let y1 = 100;
let x2 = 300;
let y2 = 300;
let i = 0;
let inc = 10;
let min = 2000;
let max = 3000;
let layer = 5;
let running = false;
let canvas = null;




const myP5Sketch = (p) => {
  p.setup = () => {
    canvas = p.createCanvas(300, 300);
    p.background(220);
    x1 = 0
    y1 = p.random(0, 100)
    x2 = p.width
    y2 = y1

    if (window.innerWidth < 768) {
      min = 1000;
      max = 2000;
    }
    else{
      min = 5000;
      max = 6000;
    }

    drawing = new InkLine(palette, null);
    drawing.setSplatter(0.98, 0.4, 1);
    drawing.setEndBubble(0.01);
    drawing.setAnalogueness(0.2, 4);
    drawing.setWeight(min, max)
    drawing.setDrawFunction(0);
    drawing.drawLine(x1, y1, x2, y2, max, p);
    p.clear();
  };

  let watercolor = null;
  let watercolorVector = [];
  let poly = null;
  p.draw = () => {
    // if (!running) {
    //   if (window.scrollY >= 0) {
    //     running = true;
    //   }
    //   return
    // }

    p.angleMode(p.DEGREES);
    if (poly == null) {
      let step = Math.round(drawing.points / 30)

      for (let k = 0; k < drawing.pointsArray.length; k += step) {
        watercolorVector.push(p.createVector(drawing.pointsArray[k].x, drawing.pointsArray[k].y));
      }
      poly = new Poly(watercolorVector, null, p);

    }
    drawing.animateLine(x1, y1, x2, y1, i, i + inc, p);
    i += inc;

    if (i >= max) {
      p.angleMode(p.RADIANS);
      // poly.colorIn(palette[3], palette[4], layer, p);
      layer += 10;
      if (layer > 25) {
        p.noLoop();
      }
    }
  };

  p.mousePressed = async () => {
    if(p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height){
      return
    }
    if (navigator.share) {
      var canvas = document.getElementsByClassName('p5Canvas')[0];
      var img = canvas.toDataURL("image/png");
      const file = await dataURLtoFile(img, 'my-persona.png');
      shareFile(file, 'my-output.png', null);
    }
    else {
      p.saveCanvas('my-output', 'png');
    }
  };

  p.windowResized = () => {
    if (window.innerWidth < 768) {
      min = 1000;
      max = 2000;
      p.resizeCanvas(300, 300);
    }
    else{
      min = 5000;
      max = 6000;
      p.resizeCanvas(600, 600);
    }
    p.background(220);
  };
};

export default myP5Sketch;