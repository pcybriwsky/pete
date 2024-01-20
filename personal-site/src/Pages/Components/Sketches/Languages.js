import * as React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { InkLine } from "../Functions/InkLine";



function myP5Sketch(p) {
  let loaded = false;
  let inkLine;
  let colors = [];
  let lines = [];
  let totalLines = 16;
  let lineInterval = 0;
  let layers = 0;
  let offset = [];
  let mic;
  let audioContext, audioBuffer;
  let clickableAreas = [];
  let watercolorLayer = null;
  let frames = 0;
  let drawHeart = true;
  let redrawVisual = false;
  let redrawVisualIndex = 0;
  let redrawVisualFrames = 0;
  let redrawVisualArea = null;

  let bgColor = [246, 244, 243]
  let levels = [];
  let points = 140;
  let weight = 140;

  let currentLine = null;
  let showBuffer = true;
  let inc = 40;
  let allHeartPoints = [];
  let allLinePoints = []

  let palettes = [
    [
      [47, 72, 88],
      [214, 40, 57],
    ],
    [
      [55, 63, 81],
      [0, 141, 213],
    ],
    [
      [229, 99, 153],
      [50, 14, 59],
    ],
    [
      [252, 186, 4],
      [165, 1, 4],
    ],
    [
      [165, 1, 4],
      [100, 141, 229],
    ],
    [
      [80, 114, 85],
      [72, 139, 73],
    ],
  ];

  let sourceSerif = null;

  let audioBuffers = [];

  let audioFiles = []

  let languages = [
    { "Language": "Irish", "Translation": "Ta grá agam duit" },
    { "Language": "Tagalog", "Translation": "I love you" },
    { "Language": "Farsi", "Translation": "I love you" },
    { "Language": "English", "Translation": "I love you" },
    { "Language": "Spanish", "Translation": "te quiero" },
    { "Language": "Portuguese", "Translation": "Eu te amo" },
    { "Language": "Cantonese", "Translation": "我愛你" },
    { "Language": "French", "Translation": "Je t’aime" },
    { "Language": "Mandarin", "Translation": "我爱你" },
    { "Language": "Punjabi", "Translation": "ਮੈਂ ਤੁਹਾਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ" },
    { "Language": "Vietnamese", "Translation": "Em thương anh" },
    { "Language": "Greek", "Translation": "Σ' αγαπώ" },
    { "Language": "Telugu", "Translation": "నేను నిన్ను ప్రేమిస్తున్నాను" },
    { "Language": "Hebrew", "Translation": "אני אוהבת אותך" },
    { "Language": "German", "Translation": "Ich liebe dich" },
    { "Language": "Korean", "Translation": "사랑해" },
    { "Language": "Japanese", "Translation": "だいすきだよ" },
    { "Language": "Ukrainian", "Translation": "Я тебе кохаю" },
    { "Language": "Malay", "Translation": "Saya cinta padamu" },
    { "Language": "Arabic", "Translation": "أحبك" },
    { "Language": "Hindi", "Translation": "أحبك" },
    { "Language": "Swedish", "Translation": "Jag älskar dig" },
    { "Language": "Dutch", "Translation": "Ik hou van jou" },

    // {"Language": "Italian", "Translation": "Ti amo"},
    //     {"Language": "Swahili", "Translation": "Nakupenda"},

  ]


  p.preload = async () => {
    if (loaded) {
      for (let i = 0; i < languages.length; i++) {
        audioContext = new AudioContext();
        fetch("/Recordings/" + languages[i].Language + ".mp3")
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => p.audioContext.decodeAudioData(arrayBuffer))
          .then((buffer) => {
            audioBuffer = buffer;
            audioBuffers.push(audioBuffer)
          })
          .catch((e) => console.error(e));
        // let sound = p.loadSound("../../../Assets/Recordings/" + languages[i].Language + ".mp3");
        // audioFiles.push(sound);
      }
    }
  }

  p.setup = async () => {
    if (loaded) {
      p.shuffleArray(languages);
      p.shuffleArray(palettes);
      p.frameRate(60);
      p.pixelDensity(1);
      p.createCanvas(p.windowWidth, p.windowHeight);
      totalLines = languages.length;

      for (let i = 0; i <= totalLines; i++) {
        let ink = new InkLine(palettes[i % palettes.length], null);
        ink.setSplatter(0.98 - 1 / 100, 0.4 + 1 / 100, 1);
        ink.setEndBubble(0.0);
        ink.setAnalogueness(0.2, 1);
        ink.setStops(0);
        lines.push(ink);
      }
      p.background(bgColor[0], bgColor[1], bgColor[2]);
      currentLine = lines[0];
      p.textFont('Noto Sans');
    }

    p.shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
      return array;
    }
  }



  p.draw = () => {
    if (loaded) {
      if (showBuffer && audioBuffers.length > 1) {
        let scale = 5; // Adjust scale to fit the heart shape in your canvas
        let rows = 3
        let cols = 8

        let gridWidth = p.width / cols; // Divide the canvas width into 5 columns
        let gridHeight = p.height / rows; // Divide the canvas height into 2 rows
        p.angleMode(p.RADIANS)

        for (let gridY = 0; gridY < rows; gridY++) {
          for (let gridX = 0; gridX < cols; gridX++) {

            let bufferLength = audioBuffers[(gridX + gridY) % audioBuffers.length].length;
            let data = audioBuffers[((gridX + gridY) % audioBuffers.length)].getChannelData(0);

            let offsetX = gridWidth * gridX + gridWidth / 2;
            let offsetY = gridHeight * gridY + gridHeight / 2;

            let areaX = gridWidth * gridX
            let areaY = gridHeight * gridY
            clickableAreas.push({ x: areaX, y: areaY, width: gridWidth, height: gridHeight, index: gridX + (8 * gridY) });

            let linePoints = [];
            let heartLinePoints = []; // Array for this heart's points
            for (let i = 0; i < bufferLength; i += inc) {
              let finalX, finalY;

              let amplitude = p.map(data[i], -1, 1, -200, 200);

              finalX = offsetX - gridWidth / 2 + p.map(i, 0, bufferLength, 10, gridWidth - 10)
              finalY = offsetY + gridHeight / 32 + amplitude
              if (i % inc == 0) {
                linePoints.push({ x: finalX, y: finalY });
              }

              let scalar = 5;

              let t = p.map(i, 0, bufferLength, 0, p.TWO_PI); //

              // Map buffer index to angle
              let heartPoint = p.heartShape(t);
              // Calculate the displaced point
              let normalX = heartPoint.position.x
              let normalY = heartPoint.position.y

              finalX = normalX * scalar + offsetX;
              finalY = normalY * scalar + offsetY;
              heartLinePoints.push({ x: finalX, y: finalY });
            }

            allHeartPoints.push(heartLinePoints);
            allLinePoints.push(linePoints);

            // Add this heart's points to the main array

            // Draw text box under each heart
            p.fill(lines[(gridX + (cols * gridY)) % (languages.length)].colors[0]);
            p.stroke(0)
            p.strokeWeight(1)
            p.textSize(18);
            p.textAlign(p.CENTER, p.BOTTOM);
            p.text(languages[(gridX + (cols * gridY)) % (languages.length)].Translation, offsetX, offsetY + 75);
            p.textSize(12);
            p.textAlign(p.CENTER, p.TOP);
            p.text(languages[(gridX + (cols * gridY)) % (languages.length)].Language, offsetX, offsetY + 75);
          }
        }
        showBuffer = false;
      }

      // Draw each heart using its respective points
      for (let i = 0; i < allHeartPoints.length; i++) {
        currentLine = lines[i];
        currentLine.setPoints(allHeartPoints[i])
        currentLine.setAnalogueness(0.1, 20);
        currentLine.animateLine(null, null, null, null, frames * inc, (frames + 1) * inc)
        currentLine.setPoints(allLinePoints[i])
        currentLine.setAnalogueness(0.1, 1);
        currentLine.animateLine(null, null, null, null, frames * inc, (frames + 1) * inc)
      }
      frames++
      if (redrawVisual) {
        p.redrawVisualForArea(redrawVisualArea, redrawVisualIndex);
      }
    }
  }

  p.heartShape = (t) => {
    let x = 16 * p.pow(p.sin(t), 3);
    let y = -(13 * p.cos(t) - 5 * p.cos(2 * t) - 2 * p.cos(3 * t) - p.cos(4 * t));
    return { position: p.createVector(x, y) };
  }


  p.mouseClicked = () => {
    if (!loaded) {
      loaded = true;
      p.preload();
      p.setup();
      p.draw();
    }
    for (let area of clickableAreas) {
      if (p.mouseX > area.x && p.mouseX < area.x + area.width &&
        p.mouseY > area.y && p.mouseY < area.y + area.height) {
        // Play the corresponding audio file
        p.fill(bgColor[0], bgColor[1], bgColor[2])
        p.noStroke()
        p.rect(area.x, area.y, area.width, area.height);
        audioFiles[area.index].play();
        redrawVisual = true;
        redrawVisualIndex = area.index;
        redrawVisualArea = area;
        redrawVisualFrames = 0;

        break; // Stop checking further if one match is found
      }
    }
  };

  p.redrawVisualForArea = (area, index) => {
    currentLine = lines[index];
    currentLine.setPoints(allHeartPoints[index])
    currentLine.setPoints(allHeartPoints[index])
    currentLine.animateLine(null, null, null, null, redrawVisualFrames * inc, (redrawVisualFrames + 1) * inc)
    currentLine.setPoints(allLinePoints[index])
    currentLine.animateLine(null, null, null, null, redrawVisualFrames * inc, (redrawVisualFrames + 1) * inc)
    redrawVisualFrames++;

    if ((redrawVisualFrames * inc) >= allLinePoints[index].length) {
      redrawVisual = false;
    }
  };

};

export function Sketch() {
  return <ReactP5Wrapper sketch={myP5Sketch} />;
}
