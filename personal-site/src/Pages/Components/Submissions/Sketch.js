import { InkLine } from "../Functions/InkLine";
import { Poly } from "../Functions/Watercolor";
import { dataURLtoFile, shareFile } from "../Functions/filesharing";
let ellipseSizeStart = 40;
let sizeInc = ellipseSizeStart / 5;
let thickness = 5;

let gap;
let y_start;

let palettes = [
  ["#fffff2", "#41d3bd", "#EE6352", "#223843"],
  // ["#0EF3C5", "#015268", "#025385", "#172347"],
  ["#CD8A8C", "#C56AB4", "#838C80", "#EFEAE7"],
  ["#ff715b", "#258EA6", "#44AF69", "#e9f1f7"],
  // ["#CCFF66", "#FF6666", "#FFFBFC", "#58355E"],
  ["#79addc", "#ff8552", "#79addc", "#F7F3E3"],
];

const APIKey = "rFxTCFNMja141Q3pv19P1d9EV"
const APISecret = "MI94JE6U4PJ6nITJLO5UEYZfbtFwquZtyDu4Mveu75S9YkjIhd"
const bearerToken = "AAAAAAAAAAAAAAAAAAAAAKKSrwEAAAAA46MIN4uhtbjzS%2FcJ0%2FcvfjkjMPU%3DF2ANC6haCcFeEDK6pt2uqyvAHhTxVn00Yw2e8DqVl6TEUa8NmC"
const url = 'https://api.twitter.com/2/tweets/search/recent?query=from:twitterdev';

fetch(url, {
  method: 'GET',
  mode: 'cors',
  headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Access-Control-Allow-Origin': '*',
      'Accept': 'application/json, text/plain, */*',
      "content-type": "application/x-www-form-urlencoded",
    }
})
.then(response => {
  response.json();
  console.log(response);
})
.then(data => {
  console.log(data);
})
.catch(error => {
  console.error('Error:', error);
});

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
    weatherData = await getWeatherData(40.7128, -74.0060);
  }

  p.setup = async () => {

    p.pixelDensity(2);
    if (window.innerWidth < 768) {
      p.createCanvas(640 / 2, 960 / 2);
      multiply = 0.5;
      ellipseSizeStart = 20;
      sizeInc = ellipseSizeStart / 4;

    }
    else {
      p.createCanvas(640 * 0.8, 960 * 0.8);
      multiply = 0.8;
      ellipseSizeStart = 40 * 0.8;
      sizeInc = ellipseSizeStart / 4;
    }

    p.setColors();
    p.angleMode(p.DEGREES);
    p.strokeCap(p.SQUARE);
    p.frameRate(5);
    height = p.height;
    width = p.width;
    buffer = width / 8;
    y_start = (10 * height) / 10 - buffer;
    inframe = buffer / 2;
    gap = p.random(12, 40);
  }

  p.draw = () => {
    let daytime = 0;
    p.strokeCap(p.SQUARE);
    if (weatherData == null) {
      return
    }
    if (Date.now() > weatherData.sys.sunrise * 1000 && Date.now() < weatherData.sys.sunset * 1000) {
      daytime = 1;
    }
    else {
      daytime = 0;
    }

    if (!daytime) {
      let flipColor = colorBG;
      colorBG = color1;
      color1 = flipColor;
    }
    p.background(colorBG);
    p.stroke(color1);
    p.strokeWeight(3);
    p.noFill();
    p.drawSky();
    if (daytime) {
      p.drawSun();
    } else {
      p.drawMoon();
    }

    p.drawTrees();
    p.setColors();
    p.noLoop();
  }

  p.setColors = () => {
    paletteNum = Math.floor(p.random(palettes.length));
    color1 = palettes[paletteNum][0];
    color2 = palettes[paletteNum][1];
    color3 = palettes[paletteNum][2];
    colorBG = palettes[paletteNum][3];
    gap = Math.round(p.random(30, 50));
  }

  p.drawTrees = () => {
    p.angleMode(p.DEGREES);
    let noiseCoefficient = 0;
    let rotateBranches = 0;
    let treeHeight = 0;
    if (p.random(1) > 0.5) {
      rotateBranches = 1;
    }
    p.beginShape();
    for (let i = buffer + inframe; i < width - buffer - inframe; i += gap / 100) {
      let towerHeight = p.random(10, 100);
      let towerSections = Math.round(p.random(1, 5));

      // Trees
      p.noStroke();
      p.fill(color1);
      p.stroke(color1);
      treeHeight = p.random(80, 300) * multiply;
      // vertex(i, y_start + noiseCoefficient * noise(i));
      if (Math.round(i % gap) == 0) {
        p.line(i, y_start + noiseCoefficient * p.noise(i), i, y_start - treeHeight);
        for (let b = 0; b < treeHeight; b += 0.5) {
          let size = (p.random(5, 15) + b / 5) * multiply;
          let gapCoefficient = p.map(gap, 5, 100, 0.2, 5);
          size = size * gapCoefficient;
          let angle = p.map(
            size,
            (5 + b / 5) * gapCoefficient,
            (15 + b / 5) * gapCoefficient,
            70,
            30
          );
          if (rotateBranches) {
            if (
              -treeHeight + b * 1 < -size &&
              -treeHeight + b * 1 > -treeHeight - 5
            ) {
              p.push();
              p.noFill();
              p.strokeWeight(1);

              p.translate(
                i,
                y_start - treeHeight + (b + 1) * 1 + noiseCoefficient * p.noise(i)
              );
              p.rotate(180);
              p.arc(
                0,
                0,
                size / p.random(1, 2),
                size / p.random(1, 2),
                -90,
                angle - 90 - p.random(-10, 10)
              );
              p.arc(
                0,
                -0,
                size / p.random(1, 2),
                size / p.random(1, 2),
                -angle - 90 + p.random(-10, 10),
                -90
              );
              // arc(0, 0, 25, 25, 0, 30);
              //         line(0, 0, 0, 5);

              //         rotate(-60);
              //         line(0, 0, 0, 5);
              p.pop();
            }
          } else {
            if (
              -treeHeight + b * 1 < -10 &&
              -treeHeight + b * 1 > -treeHeight + 4
            ) {
              p.push();
              p.noFill();
              p.strokeWeight(1);
              p.translate(
                i,
                y_start - treeHeight + (b + 1) * 1 + noiseCoefficient * p.noise(i)
              );

              p.arc(
                0,
                0,
                size / p.random(1, 2),
                size / p.random(1, 2),
                -90,
                angle - 90 - p.random(-10, 10)
              );
              p.arc(
                0,
                -0,
                size / p.random(1, 2),
                size / p.random(1, 2),
                -angle - 90 + p.random(-10, 10),
                -90
              );
              // arc(0, 0, 25, 25, 0, 30);
              //         line(0, 0, 0, 5);

              //         rotate(-60);
              //         line(0, 0, 0, 5);
              p.pop();
            }
          }
        }
      }
    }
    p.noFill();
    p.stroke(color1);
    p.endShape();
  }

  let lineVector = [];
  let edge = true;
  p.drawSky = () => {
    let u = buffer;
    let s = p.random(1.5, 3);
    let t = s / 2;
    let skyCoefficient = 0.5
    if(weatherData.clouds.all != undefined && weatherData.clouds.all > 0) {
      skyCoefficient = p.map(weatherData.clouds.all, 0, 100, 0.2, 0.1, true);
    }
    let wind = p.random(10, 30); // Connect to some variable
    if(weatherData.wind.speed != undefined && weatherData.wind.speed > 0) {
      wind = p.map(weatherData.wind.speed, 0, 40, 10, 60, true);
    }
    else{
      wind = 25;
    }
    let v = null;
    let n = null;

    for (let x = u; x <= width - u; x += s) {
      for (let y = u; y <= y_start; y += s) {
        v = 0.01;
        n = p.noise(x * v, y * v);
        let nNextX = p.noise((x + 1) * v, y * v);
        let nNextY = p.noise(x * v, (y + 1) * v);
        let nNextXY = p.noise((x + s) * v, (y + s) * v);
        if (n > skyCoefficient) {
          // strokeWeight(n * random(0.1, 2));
          // stroke(255)
          p.push();
          p.translate(x, y);
          p.angleMode(p.RADIANS);
          p.rotate(n * 6);
          p.stroke(color1);
          // p(0, 0);
          // p(t / 3, 0);
          p.strokeWeight(n * p.random(1, 2));
          p.stroke(color2);
          p.point((t * wind) / 3, 0);
          p.stroke(color1);
          p.strokeWeight(n * p.random(1, 2));
          p.point(t * wind, 0);
          p.pop();
          edge = true;
        } else if (edge == true) {
          lineVector.push({ x: x, y: y, noise: n, edge: true });
          edge = false;
        } else if (nNextX > skyCoefficient) {
          lineVector.push({ x: x + s, y: y, noise: nNextX, edge: true });
          // edge = false;
        } else if (nNextY > skyCoefficient) {
          lineVector.push({ x: x, y: y + s, noise: nNextY, edge: true });
          // edge = false;
        } else if (nNextXY > skyCoefficient) {
          lineVector.push({ x: x + s, y: y + s, noise: nNextXY, edge: true });
          // edge = false;
        } else {
          edge = false;
          lineVector.push({ x: x, y: y, noise: n, edge: false });
        }
      }
    }
  }


  p.drawSun = () => {
    p.angleMode(p.DEGREES);
    let noon = weatherData.sys.sunrise * 1000 + (weatherData.sys.sunset * 1000 - weatherData.sys.sunrise * 1000) / 2;
    let sunCenterX = null;
    let sunCenterY = null;
    if (Date.now() > noon) {
      sunCenterX = p.map(Date.now(), noon, weatherData.sys.sunset * 1000, width/2, width - buffer);
      sunCenterY = p.map(sunCenterX, width/2, width - buffer, height / 10, height / 4);
    }
    else {
      sunCenterX = p.map(Date.now(), weatherData.sys.sunrise * 1000, noon, buffer, width/2);
      sunCenterY = p.map(sunCenterX, buffer, width/2, height / 10, height / 4);
    }
    ellipseSizeStart = p.map(sunCenterY, 0, p.height / 4, 10, 80);
    p.noStroke();
    p.fill(colorBG);
    p.ellipse(
      sunCenterX,
      sunCenterY,
      ellipseSizeStart + sizeInc * 16,
      ellipseSizeStart + sizeInc * 16
    );

    p.fill(color1);
    p.ellipse(
      sunCenterX,
      sunCenterY,
      ellipseSizeStart + 2 * sizeInc,
      ellipseSizeStart + 2 * sizeInc
    );
    p.stroke(color1);
    p.noFill();
    for (let i = 0; i < 4; i++) {
      if (i >= 2) {
        p.stroke(colorBG);
        p.strokeWeight(thickness * 2);
      } else {
        p.strokeWeight(thickness);
        p.noFill();
      }

      p.beginShape();
      for (let d = 0; d < 360; d += 2) {
        let x_start = sunCenterX + (ellipseSizeStart + sizeInc * i) * p.cos(d);
        let y_start = sunCenterY + (ellipseSizeStart + sizeInc * i) * p.sin(d);

        p.vertex(x_start, y_start);
        if (p.random(1) < 0.25) {
          p.strokeWeight(thickness);
          p.endShape();
          p.beginShape();
        } else if (p.random(1) > 0.85) {
          p.strokeWeight(thickness);
          p.endShape();
        }
        let lineMulti = p.random(1.0, 3);
        p.strokeWeight(thickness / 4);
        if (i == 1) {
          if (p.random(1) > 0.45) {
            let xShift = p.random(1, 5);
            let yShift = p.random(1, 5);
            p.line(
              x_start + (5 + xShift) * p.cos(d),
              y_start + (5 + yShift) * p.sin(d),
              x_start + (10 + xShift) * lineMulti * p.cos(d),
              y_start + (10 + yShift) * lineMulti * p.sin(d)
            );
          }
        }
      }

      p.strokeWeight(thickness);
      p.endShape();
    }
  }

  p.drawMoon = () => {
    p.angleMode(p.DEGREES);
    let moonCenterX = null;
    let moonCenterY = null;
    if (Date.now() > weatherData.sys.sunrise * 1000) {
      
      moonCenterX = p.map(Date.now(), weatherData.sys.sunset * 1000, weatherData.sys.sunrise * 1000 + 86400*1000, buffer, width - buffer); // between tonight and tomorrow
      moonCenterY = p.map(moonCenterX, buffer, width/2, height / 10, height / 4);
    }
    else {
      moonCenterX = p.map(Date.now(), weatherData.sys.sunset * 1000 - (86400 * 1000), weatherData.sys.sunrise * 1000 , buffer, width - buffer);
      moonCenterY = p.map(moonCenterX, width/2, width - buffer, height / 10, height / 4);
    }
    
    
    ellipseSizeStart = p.map(moonCenterY, 0, p.height / 4, 10, 80);
    let moonOffset = ellipseSizeStart / p.random(2, 5);
    p.noStroke();
    p.fill(colorBG);
    p.ellipse(
      moonCenterX,
      moonCenterY,
      ellipseSizeStart + 16 * sizeInc,
      ellipseSizeStart + 16 * sizeInc
    );
    p.fill(color1);
    p.ellipse(
      moonCenterX,
      moonCenterY,
      ellipseSizeStart + 3 * sizeInc,
      ellipseSizeStart + 3 * sizeInc
    );

    p.noStroke();

    p.stroke(colorBG);
    p.noFill();
    for (let i = 0; i < 4; i++) {
      if (i >= 2) {
        p.stroke(color1);
        p.strokeWeight(thickness / 4);
      } else {
        p.strokeWeight(thickness / 4);
        p.noFill();
      }

      if (i > 1) {
        let drawLine = 1;
        p.beginShape();
        for (let d = 0; d < 360; d += 2) {
          let x_start = moonCenterX + (ellipseSizeStart + sizeInc * i) * p.cos(d);
          let y_start = moonCenterY + (ellipseSizeStart + sizeInc * i) * p.sin(d);

          if (drawLine) {
            p.stroke(color1);
          } else {
            p.noStroke();
          }
          p.vertex(x_start, y_start);

          if (p.random(1) < 0.05) {
            p.strokeWeight(thickness / 4);
            p.endShape();
            p.strokeWeight(thickness / 4);
            if (p.random(1) < 0.2) {
              p.fill(color1);
            } else {
              p.fill(colorBG);
            }
            p.ellipse(x_start, y_start, sizeInc / 2, sizeInc / 2);
            p.noFill();
            p.beginShape();
            drawLine = 0;
          } else if (p.random(1) > 0.5) {
            p.strokeWeight(thickness / 4);
            p.endShape();
            drawLine = 0;
          }

          if (p.random(1) > 0.95) {
            drawLine = 1;
          }
          let lineMulti = p.random(1.0, 3);
          p.strokeWeight(thickness / 4);
          if (i == 0) {
            if (p.random(1) > 0.45) {
              let xShift = p.random(1, 2);
              let yShift = p.random(1, 2);
              p.line(
                x_start + (1 + xShift) * p.cos(d),
                y_start + (1 + yShift) * p.sin(d),
                x_start + (2 + xShift) * lineMulti * p.cos(d),
                y_start + (2 + yShift) * lineMulti * p.sin(d)
              );
            }
          }
        }

        p.strokeWeight(thickness / 4);
        p.endShape();
      }
    }
    p.noStroke();
    p.fill(colorBG);
    p.ellipse(
      moonCenterX + moonOffset,
      moonCenterY - moonOffset / 2,
      ellipseSizeStart + 2 * sizeInc,
      ellipseSizeStart + 2 * sizeInc
    );
  }

  p.mousePressed = async () => {
    if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
      return
    }
    if (navigator.share) {
      var canvas = document.getElementsByClassName('p5Canvas')[0];
      var img = canvas.toDataURL("image/png");
      const file = await dataURLtoFile(img, 'my-output.png');
      shareFile(file, 'my-output.png', null);
    }
    else {
      p.saveCanvas('my-output', 'png');
    }
  };

  p.windowResized = () => {
    if (window.innerWidth < 768) {
      p.resizeCanvas(640 / 2, 960 / 2);
      ellipseSizeStart = 20;
      sizeInc = ellipseSizeStart / 4;
      multiply = 0.5;
    }
    else {
      p.resizeCanvas(640 * 0.8, 960 * 0.8);
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
