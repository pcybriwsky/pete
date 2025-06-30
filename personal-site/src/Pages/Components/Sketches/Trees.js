import * as magic from "@indistinguishable-from-magic/magic-js"
import growthRingsData from '../../../Assets/Data/growth_rings_sorted.csv';

// IMPORTANT: Rename this function to match the filename PascalCase
const Trees = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  
  // --- Sketch-specific variables and setup ---
  let table;
  let minWordCount, maxWordCount, minSentiment, maxSentiment;
  let rings = [];
  let hoveredRing = null;
  
  // Print mode variables
  let isPrintMode = false;
  let printWidth = 1275;  // 4.25" at 300 DPI
  let printHeight = 1650; // 5.5" at 300 DPI
  let originalWidth, originalHeight;

  // Palette variables
  let currentPaletteName = '';
  let showPaletteName = false;
  let paletteIndex = 0;
  let colors = [];
  let currentPalette;
  let noiseTexture;
  let noiseSeed = 52;
  
  // Extended palette structure
  const palettes = {
    ink: { background: "#f4f1ea", foreground: "#1a1a1a", red: "#a0522d", blue: "#228b22" }
  };

  p.preload = () => {
    table = p.loadTable(growthRingsData, 'csv', 'header');
  };

  // Helper function to select palette by index
  const selectPaletteByIndex = (index) => {
    const paletteNames = Object.keys(palettes);
    // Ensure index stays within bounds
    if (index < 0) index = paletteNames.length - 1;
    if (index >= paletteNames.length) index = 0;
    
    const paletteName = paletteNames[index];
    currentPalette = palettes[paletteName];
    currentPaletteName = paletteName;
    colors = Object.values(currentPalette).map(c => c.startsWith('#') ? c : `#${c}`);
    paletteIndex = index;
    if (p.redraw) p.redraw();
  };

  // Helper function to select and shuffle palette
  const selectRandomPalette = () => {
    selectPaletteByIndex(0);
  };

  const drawBanner = () => {
    p.push();
    p.fill(255, 255, 255, 0.9);
    p.noStroke();
    p.rect(0, 0, p.width, 40);
    p.fill(0);
    p.textSize(16);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(`Palette: ${currentPaletteName}`, 20, 20);
    p.pop();
  };

  const generateNoiseTexture = () => {
    noiseTexture.loadPixels();
    for (let y = 0; y < noiseTexture.height; y++) {
        for (let x = 0; x < noiseTexture.width; x++) {
            let index = (x + y * noiseTexture.width) * 4;
            const noiseValue = p.random(180, 255);
            const alphaValue = p.random(60, 80);

            noiseTexture.pixels[index] = noiseValue;
            noiseTexture.pixels[index + 1] = noiseValue;
            noiseTexture.pixels[index + 2] = noiseValue;
            noiseTexture.pixels[index + 3] = alphaValue;
        }
    }
    noiseTexture.updatePixels();
    console.log("Generated Noise Texture");
  };

  const exportPrint = () => {
    // Store original canvas size
    originalWidth = p.width;
    originalHeight = p.height;
    
    // Generate filename with palette and date
    const date = new Date().toISOString().split('T')[0];
    const filename = `sketch-${currentPaletteName}-${date}`;
    
    // Resize canvas for print
    p.resizeCanvas(printWidth, printHeight);
    p.pixelDensity(1);
    
    // Redraw the sketch
    p.draw();
    
    // Save the file
    p.saveCanvas(filename, 'png');
    
    // Restore original canvas size
    p.resizeCanvas(originalWidth, originalHeight);
    p.pixelDensity(window.devicePixelRatio);
    
    console.log(`Print exported as: ${filename}.png`);
  };

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.RGB, 255, 255, 255, 1);
    p.strokeWeight(2);
    p.textFont('Arial');
    p.noiseSeed(noiseSeed);
    noiseTexture = p.createImage(p.width, p.height);
    generateNoiseTexture();
    
    // Initialize with the ink palette
    selectPaletteByIndex(0);

    if (table) {
      const wordCounts = table.getColumn('word_count').map(Number);
      const sentiments = table.getColumn('sentiment').map(Number);
      minWordCount = p.min(wordCounts);
      maxWordCount = p.max(wordCounts);
      minSentiment = p.min(sentiments);
      maxSentiment = p.max(sentiments);
      
      const maxRadius = p.min(p.width, p.height) / 2 * 0.8;
      rings = []; // Clear the array before populating
      for (const row of table.getRows()) {
        const week = row.getNum('week');
        const word_count = row.getNum('word_count');
        const sentiment = row.getNum('sentiment');
        
        const isLastRing = week === table.getRowCount();
        let baseRadius = p.map(week, 1, table.getRowCount(), 15, maxRadius);
        let thickness = p.map(word_count, minWordCount, maxWordCount, 0.2, 2.5);
        let noiseFactor = p.map(sentiment, minSentiment, maxSentiment, 0.15, 0.03); 

        if (isLastRing) {
          baseRadius += 15;
          thickness *= 10;
          noiseFactor *= 1.8;
        }

        rings.push({ week, word_count, sentiment, baseRadius, thickness, noiseFactor, isLastRing });
      }
    }
    //p.noLoop();
  };

  p.draw = () => {
    const bgColor = p.color(palettes.ink.background);
    const fgColor = p.color(palettes.ink.foreground);
    p.background(bgColor);
    
    // --- Hover detection ---
    p.push();
    p.fill(255, 0, 0);
    p.ellipse(p.mouseX, p.mouseY, 10, 10);
    p.pop();

    const mouseVector = p.createVector(p.mouseX - p.width/2, p.mouseY - p.height/2);
    const mouseDist = mouseVector.mag();
    hoveredRing = null;
    for (let i = rings.length - 1; i >= 0; i--) {
      const ring = rings[i];
      if (mouseDist > ring.baseRadius - ring.thickness / 2 && mouseDist < ring.baseRadius + ring.thickness / 2) {
        console.log("Hovered ring:", ring);
        hoveredRing = ring;
        break;
      }
    }

    p.push();
    p.translate(p.width / 2, p.height / 2);
    
    const maxRadius = p.min(p.width, p.height) / 2 * 0.8;
    
    p.noFill();

    // Draw all the growth rings
    for (const row of table.getRows()) {
      const week = row.getNum('week');
      const word_count = row.getNum('word_count');
      const sentiment = row.getNum('sentiment');
      
      let isLastRing = week === table.getRowCount();
      let baseRadius = p.map(week, 0, table.getRowCount(), 5, maxRadius);
      let thickness = p.map(word_count, minWordCount, maxWordCount, 0.25, 2);
      let noiseFactor = 0.08; 

      if (isLastRing) {
        baseRadius += 10;
        thickness *= 25;
        noiseFactor *= 2.5;
      }
      
      // Draw a single, noisy ring multiple times for a textured look
      for(let i = 0; i < 1; i++) {
        p.beginShape();
        const noiseScale = p.map(sentiment, minSentiment, maxSentiment, maxRadius/32, 1);
        const randomness = 0;

        fgColor.setAlpha(150);
        let sentimentScale = p.map(sentiment, minSentiment, maxSentiment, 0, 1);
        let strokeColor = p.lerpColor(p.color(palettes.ink.red), p.color(palettes.ink.blue), sentimentScale);
        p.stroke(strokeColor);
        p.strokeWeight(thickness);

        for (let angle = 0; angle < p.TWO_PI; angle += p.PI / 360) {
            let xoff = p.map(p.cos(angle), -1, 1, 0, noiseScale) + randomness;
            let yoff = p.map(p.sin(angle), -1, 1, 0, noiseScale) + randomness;
            let n = p.noise(xoff, yoff, week/4);
            let r = baseRadius + (n * baseRadius * noiseFactor) - (baseRadius * noiseFactor / 2);
            const x = r * p.cos(angle);
            const y = r * p.sin(angle);
            p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
      }
    }
    p.pop();
    
    // Show palette name if enabled
    if (showPaletteName) {
      drawBanner();
    }
    p.push();
    let textSize1 = 24;
    let textSize2 = 16;
    let lineSpacing = textSize1 + textSize2;
    let textStartX = p.width/40;
    let textStartY = textStartX;

    
    p.textFont('Monaco');
    p.textSize(24);
    p.textAlign(p.LEFT, p.TOP);
    p.text("A Year in Writing", textStartX, textStartY);
    p.textSize(16);
    p.text("Week (1-52) → Ring Position", textStartX, textStartY + lineSpacing);
    p.text("Word Count → Ring Thickness", textStartX, textStartY + lineSpacing * 2);
    p.text("Sentiment → Ring Color", textStartX, textStartY + lineSpacing * 3);

    // Draw sentiment gradient bar
    const gradY = textStartY + lineSpacing * 4 + 10;
    const gradX = textStartX;
    const gradW = 220;
    const gradH = 16;
    for (let i = 0; i < gradW; i++) {
      let t = i / (gradW - 1);
      let c = p.lerpColor(p.color(palettes.ink.red), p.color(palettes.ink.blue), t);
      p.stroke(c);
      p.line(gradX + i, gradY, gradX + i, gradY + gradH);
    }
    // Midpoint marker
    p.stroke(p.color('#222'));
    p.strokeWeight(2);
    p.line(gradX + gradW / 2, gradY - 2, gradX + gradW / 2, gradY + gradH + 2);
    p.noStroke();
    p.fill(p.color(palettes.ink.red));
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text("Negative", gradX, gradY + gradH + 4);
    p.fill(p.color(palettes.ink.blue));
    p.textAlign(p.RIGHT, p.TOP);
    p.text("Positive", gradX + gradW, gradY + gradH + 4);

    p.image(noiseTexture, 0, 0, p.width, p.height);
    p.pop();
    
    p.resetMatrix();
    if(hoveredRing) {
      p.push();
      const padding = 10;
      const boxWidth = 160;
      const boxHeight = 70;
      let x = p.mouseX + padding * 2;
      let y = p.mouseY;

      if (x + boxWidth > p.width) x -= boxWidth + padding * 4;
      if (y + boxHeight > p.height) y -= boxHeight;

      p.fill(0, 0, 0, 100);
      p.noStroke();
      p.rect(x, y, boxWidth, boxHeight, 5);
      p.fill(palettes.ink.background);
      p.textSize(14);
      p.textFont('monospace');
      p.text(`Week: ${hoveredRing.week}`, x + padding, y + padding * 2);
      p.text(`Words: ${hoveredRing.word_count}`, x + padding, y + padding * 3.5);
      p.text(`Sentiment: ${hoveredRing.sentiment.toFixed(2)}`, x + padding, y + padding * 5);
      p.pop();
    }
  };

  p.mouseMoved = () => {
    // p.redraw();
  }

  // Handles connecting to the magic device on click
  p.mousePressed = async () => {
    if (false) {
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
      if (!isDevMode) {
        p.loop();
      }
    } else {
      console.log("Sketch interaction click.");
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.setup();
    p.redraw();
  };

  p.keyPressed = () => {
    if (p.key === 'r' || p.key === 'R') {
      p.noiseSeed(noiseSeed);
      p.redraw();
    }
    if (p.key === 'p' || p.key === 'P') {
      showPaletteName = !showPaletteName;
      p.redraw();
    }
    if (p.key === 's' || p.key === 'S') {
      exportPrint();
    }
  };
};

// IMPORTANT: Rename 'Trees' to match the filename PascalCase
export default Trees; 