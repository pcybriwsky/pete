import { InkLine } from "../Functions/InkLine";
import { Poly } from "../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../Functions/filesharing";
import * as magic from "@indistinguishable-from-magic/nexus-js"

// To access, call magic.connect() and then magic.disconnect() to open and close the device connection

let ellipseSizeStart = 40;
let sizeInc = ellipseSizeStart / 5;
let thickness = 5;

let gap;
let y_start;

let palettes = [
  ["#0A0A0A", "#00F0FF", "#FF00AB", "#0DFF00", "#9400ff"],
];

let paletteNum,
  color1,
  color2,
  color3,
  colorBG,
  density,
  ringSize,
  showFill,
  shift,
  shiftInc,
  buffer,
  leeway,
  inframe,
  height,
  width;

let multiply = 1;
let weatherData = null;

const openWeatherAPIKey = '5d07d30b0246f6207ec7888efecc0602';

const getWeatherData = async (lat, lng) => {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherAPIKey}&units=imperial`);
  const data = await response.json();
  return data;
}


const myP5Sketch = (p) => {
  p.preload = async () => {
    // weatherData = await getWeatherData(40.7128, -74.0060);
  }

  p.setup = async () => {
    p.pixelDensity(2);
    if (window.innerWidth < 768) {
      p.createCanvas(960 / 2, 640 / 2);
      multiply = 0.5;
      ellipseSizeStart = 20;
      sizeInc = ellipseSizeStart / 4;

    }
    else {
      p.createCanvas(960 * 0.8, 640 * 0.8);
      multiply = 0.8;
      ellipseSizeStart = 40 * 0.8;
      sizeInc = ellipseSizeStart / 4;
    }

    p.setColors();
    p.angleMode(p.DEGREES);
    p.strokeCap(p.SQUARE);
    p.frameRate(60);
    height = p.height;
    width = p.width;
    buffer = width / 8;
    y_start = (10 * height) / 10 - buffer;
    inframe = buffer / 2;
    gap = p.random(12, 40);
    let weight = 86400*inc / 100; // Calculation to have this go a day
    drawing = new InkLine(palettes[0], weight);
    // drawing.setSplatter(0.98, 0.4, 1);
    // drawing.setEndBubble(0.01);

    // Can add more functions here
    // Do I want to add many more colors to optimize for variety? Or consistency? Maybe shapes for the day of the week are the way to go.
    // Can also create a pretty seamless glow effect in the background as well
    drawing.setAnalogueness(0.2, 20);
    drawing.setWeight(weight, 2 * weight)
    drawing.setDrawFunction(1)
    p.background(palettes[0][0])
  }

  let inc = 10;
  let buff = 10;
  let drawing = null;
  let xoff = 0;
  let yoff = 0;

  p.draw = () => {
    if (isMagic && magic.modules.light != null && magic.modules.light != undefined) { // store in a system variable?
      let light = magic.modules.light.raw.brightness; // Range is 0-4095
      let humidity = magic.modules.environment.raw.humidity; // Range is 0-90
      let pressure = magic.modules.environment.raw.pressure; // Range is 300 hPa to 1100 hPa
      let iaq = magic.modules.environment.raw.iaq; // Range is 0-500
      let temperature = magic.modules.environment.raw.temperature; // Range is -40 to 85 degrees C
      let co2 = magic.modules.environment.raw.co2; // Ask Lance 


      // p.fill(0);
      // p.text("Brightness: " + magic.modules.light.brightness, 100, 100);
      // p.text("Humidity: " + magic.modules.environment.raw.humidity, 100, 150);
      // p.text("Pressure: " + magic.modules.environment.raw.pressure, 100, 200);
      // p.text("IAQ: " + magic.modules.environment.raw.iaq, 100, 250);
      // p.text("Temperature: " + magic.modules.environment.raw.temperature + " °C", 100, 300);
      // p.text("CO2: " + magic.modules.environment.raw.co2, 100, 350);

      // Want particles in a rectangular shape

      // As the shapes expand, the particles should expand as well
      // Humidity should affect the size of the particles
      // Pressure should affect the speed of the particles
      // IAQ should affect the noise overlay of the particles 
      // Temperature should affect the color of the particles
      // CO2 should affect the XX of the particles
      // The end result is each day should have a unique

       // Maybe i can map this to a spark at the front of the line
      // let blurCoefficient = p.map(humidity, 0, 90, 0, 50); // Range is 0-90
      // let speed = p.map(pressure, 300, 1100, 0, 10); // Range is 300 hPa to 1100 hPa
      // let noise = p.map(iaq, 0, 500, 0, 1); // Range is 0-500
      // let particleColor = p.map(temperature, -40, 85, 0, 255); // Range is -40 to 85 degrees C
      // let particleSize = p.map(co2, 0, 1000, 0, 10); // Ask Lance

      
      let thickness = p.map(light, 0, 405, 2, 25);
      drawing.setAnalogueness(0.2, thickness);

      // need a seperate color determinant function based on temp
      // Do we want to use light as the glow? More light, more glow around the edges? Light and shadow if really dark?
      // Background can be by day? Or could be in 3D space? Or not at all?
      // Pressure can determine...
      // IAQ can determine a smooth gradient over the top, would be the same as the background color.
      // Humidity determines bleed toward the center and toward the edges
      // Temperature determines the color of the particles on a spectrum
      // I believe this could be better with a dark background and darker colors

      drawing.animateLine(width / 2, height / 2, width, height, (p.frameCount - 1) * inc, p.frameCount * inc, p);
    }
    




  }

  p.setColors = () => {
    paletteNum = Math.floor(p.random(palettes.length));
    color1 = palettes[paletteNum][0];
    color2 = palettes[paletteNum][1];
    color3 = palettes[paletteNum][2];
    colorBG = palettes[paletteNum][3];
    gap = Math.round(p.random(30, 50));
  }



  let isMagic = false
  p.mousePressed = async () => {
    if (!isMagic) {
      magic.connect();
      console.log(magic.modules);
      isMagic = true;
    }
    else {
      magic.disconnect();
      isMagic = false;
    }
    // need to add a disconnect button as well

  };

  p.windowResized = () => {
    if (window.innerWidth < 768) {
      p.resizeCanvas(960 / 2, 640 / 2);
      ellipseSizeStart = 20;
      sizeInc = ellipseSizeStart / 4;
      multiply = 0.5;
    }
    else {
      p.resizeCanvas(960 * 0.8, 640 * 0.8);
      ellipseSizeStart = 40 * 0.8;
      sizeInc = ellipseSizeStart / 4;
      multiply = 0.8;
    }
    height = p.height;
    width = p.width;
    buffer = width / 8;
    y_start = (10 * height) / 10 - buffer;
    inframe = buffer / 2;
    gap = p.random(12, 40);
    p.loop();

  };
};

export default myP5Sketch;
