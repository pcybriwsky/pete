const Flowfield = (p) => {
  let gridSize, cellSize, rows, cols, cellPadding, gridPadding;
  let palette;
  let noiseZ = 0;
  let paletteName;
  let cellMax;
  let palettes = {
    'Summer Storm': {
      name: 'Summer Storm',
      background: [252, 250, 245], // warm white
      colors: [
        [255, 89, 94],   // vibrant coral
        [66, 139, 202],  // electric blue
        [255, 209, 102], // golden yellow
        [106, 76, 147],  // deep purple
        [255, 146, 139]  // soft salmon
      ]
    },
    'Neon Dreams': {
      name: 'Neon Dreams',
      background: [249, 248, 243], // soft white
      colors: [
        [255, 0, 102],   // hot pink
        [0, 176, 255],   // bright azure
        [255, 191, 0],   // marigold
        [149, 0, 255],   // electric purple
        [255, 135, 123]  // coral flash
      ]
    },
    'Digital Sunset': {
      name: 'Digital Sunset',
      background: [251, 248, 241], // cream white
      colors: [
        [255, 71, 87],   // sunset red
        [78, 205, 196],  // turquoise
        [255, 168, 1],   // amber
        [46, 134, 222],  // royal blue
        [255, 123, 198]  // pink burst
      ]
    },
    'Electric Garden': {
      name: 'Electric Garden',
      background: [250, 247, 242], // parchment
      colors: [
        [255, 107, 107], // electric coral
        [72, 219, 251],  // sky blue
        [254, 202, 87],  // sunflower
        [120, 224, 143], // mint green
        [243, 104, 224]  // bright magenta
      ]
    },
    'Cosmic Burst': {
      name: 'Cosmic Burst',
      background: [248, 245, 240], // light cream
      colors: [
        [255, 56, 56],   // bright red
        [45, 152, 218],  // cerulean blue
        [255, 177, 66],  // warm yellow
        [132, 94, 194],  // amethyst
        [255, 107, 180]  // deep pink
      ]
    },
    'Lush Green': {
      name: 'Lush Green',
      background: [240, 255, 240], // light green
      colors: [
        [85, 139, 85],   // muted forest green
        [100, 179, 113], // muted medium sea green
        [144, 238, 144], // light green
        [60, 128, 60],   // muted green
        [100, 205, 100]  // muted lime green
      ]
    },
    'Sunny Yellow': {
      name: 'Sunny Yellow',
      background: [255, 255, 224], // light yellow
      colors: [
        [255, 200, 0],   // muted gold
        [255, 255, 150], // muted yellow
        [255, 255, 180], // lighter muted yellow
        [255, 165, 100], // muted orange
        [255, 220, 100]  // muted bright yellow
      ]
    },
    'Fiery Red': {
      name: 'Fiery Red',
      background: [255, 240, 240], // light red
      colors: [
        [200, 50, 50],   // muted red
        [180, 40, 60],   // muted crimson
        [255, 99, 71],   // tomato
        [255, 127, 80],  // coral
        [255, 182, 193]  // light pink
      ]
    },
    'Ocean Blue': {
      name: 'Ocean Blue',
      background: [240, 248, 255], // light blue
      colors: [
        [70, 70, 200],   // muted blue
        [100, 144, 255], // muted dodger blue
        [70, 130, 180],  // steel blue
        [135, 206, 250], // light sky blue
        [173, 216, 230]  // light blue
      ]
    }
  };
  
  let gridSizeSlider, cellSizeSlider;

  p.setup = () => {
    const parentWidth = p.canvas.parentElement.offsetWidth;
    const parentHeight = p.canvas.parentElement.offsetHeight;

    p.createCanvas(parentWidth, parentHeight);
    p.pixelDensity(2);
    gridSizeSlider = p.createSlider(p.width * 0.5, p.width * 0.9, p.width * 0.75);
    gridSizeSlider.position(p.width / 2 - 100, parentHeight + 20); // Position below the canvas
    gridSizeSlider.style('width', '200px');
    gridSizeSlider.input(() => {
      gridSize = gridSizeSlider.value(); // Update grid size dynamically
      console.log(`Grid Size set to: ${gridSize}`);
    });
    
    // Create cell size slider
    cellSizeSlider = p.createSlider(10, 50, cellSize);
    cellSizeSlider.position(p.width / 2 - 100, parentHeight + 60); // Position below the canvas
    cellSizeSlider.style('width', '200px');
    cellSizeSlider.input(() => {
      cellSize = cellSizeSlider.value(); // Update cell size dynamically
      console.log(`Cell Size set to: ${cellSize}`);
    });
    
    // p.noLoop();
    p.frameRate(0.5);
    
  };

  p.textureOverlay = (layer) => {
    layer.push();
    layer.fill(47, 72, 88);
    layer.stroke(47, 72, 88);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (j * cellSize + cellPadding > gridPadding && j * cellSize + cellPadding < gridPadding + gridSize) {
        const x = j * cellSize + cellPadding;
        const y = i * cellSize + cellPadding;
        layer.push();
          layer.stroke(47, 72, 88);
          layer.translate(x, y);
          layer.rotate(p.random(p.TWO_PI));
          layer.line(0, 0, gridSize - cellPadding, gridSize - cellPadding);
          layer.pop();
        }
      }
    }
    layer.pop();
  };

  p.draw = () => {
    gridSize = gridSizeSlider.value();
    cellSize = cellSizeSlider.value();
    cellPadding = 0.5;
    gridPadding = (p.width - gridSize) / 2;
    rows = p.height / cellSize;
    cols = p.width / cellSize;
    palette = palettes[p.random(Object.keys(palettes))];
    paletteName = palette.name;
    cellMax = p.random(3, 10);

    p.background(palette.background);
    p.textSize(24);
    p.textAlign(p.LEFT, p.TOP);
    // p.fill(palette.colors[1]);
    // p.text(paletteName.toUpperCase(), 10, 10);
    
    p.push();
    p.fill(palette.background);
    p.stroke(palette.background);
    
    const noiseScale = 0.005;
    const flowScale = 0.01;
    const lineLength = 15;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Calculate variable cell size based on noise
        const cellSizeVariation = p.map(
          p.noise(j * 0.1, i * 0.1, noiseZ), 
          0, 1, 
          cellSize * 0.5, 
          cellSize * 1.5
        );
        
        // Calculate position with variable cell sizes
        const x = j * cellSizeVariation + cellPadding;
        const y = i * cellSizeVariation + cellPadding;
        
        // Calculate dynamic buffer
        const bufferVariation = p.map(
          p.noise(x * 0.01, y * 0.01, noiseZ + 1000),
          0, 1,
          gridPadding * 0.8,
          gridPadding * 1.2
        );
        
        if (x > bufferVariation && 
            x < p.width - bufferVariation && 
            y > bufferVariation && 
            y < p.height - bufferVariation) {
          
          // Use noise to select palette for this cell
          const paletteNoise = p.noise(x * noiseScale * 0.5, y * noiseScale * 0.5, noiseZ);
          const paletteKeys = Object.keys(palettes);
          const selectedPaletteKey = paletteKeys[Math.floor(paletteNoise * paletteKeys.length)];
          const cellPalette = palettes[selectedPaletteKey];
          const flowAngle = p.noise(x * flowScale, y * flowScale, noiseZ) * p.TWO_PI;

          
          p.push();
          p.translate(x, y);
          p.strokeWeight(1);
          
          let lineCount = p.random(8, 20);
          
          const bunchX = p.map(p.noise(x * noiseScale * 2, noiseZ), 0, 1, -cellSizeVariation, cellSizeVariation);
          const bunchY = p.map(p.noise(y * noiseScale * 2, noiseZ), 0, 1, -cellSizeVariation, cellSizeVariation);
          
          for (let k = 0; k < lineCount; k++) {
            // Select color from cell's palette for each line
            const colorIndex = Math.floor(p.random(cellPalette.colors.length));
            const lineColor = p.color(...cellPalette.colors[colorIndex]);
            p.stroke(lineColor);
            
            const isBunched = p.noise(x * noiseScale, y * noiseScale, k + noiseZ) > 0.5;
            
            let offsetX, offsetY;
            if (isBunched) {
              offsetX = bunchX + p.random(-cellSizeVariation / 1.5, cellSizeVariation / 1.5);
              offsetY = bunchY + p.random(-cellSizeVariation / 1.5, cellSizeVariation / 1.5);
            } else {
              offsetX = p.map(p.noise(x * noiseScale, k, noiseZ), 0, 1, -cellSizeVariation / 1.5, cellSizeVariation / 1.5);
              offsetY = p.map(p.noise(y * noiseScale, k, noiseZ), 0, 1, -cellSizeVariation / 1.5, cellSizeVariation / 1.5);
            }
            
            // Shorter lines for denser feel
            const lengthVariation = isBunched ? 
              p.random(0.2, 0.8) :  // Shorter bunched lines
              p.random(0.3, 1.5);   // Slightly longer spread lines
            
            const angleVariation = p.map(p.noise(x * noiseScale, y * noiseScale, k + noiseZ), 
                                      0, 1, -0.3, 0.3);
            const currentAngle = flowAngle + angleVariation;
            
            const endX = p.cos(currentAngle) * lineLength * lengthVariation;
            const endY = p.sin(currentAngle) * lineLength * lengthVariation;
            
            // Create dashed effect
            const dashCount = Math.floor(p.random(2, 5));
            const dashLength = p.random(0.4, 0.8); // Longer dashes for more connection
            
            for (let d = 0; d < dashCount; d++) {
              const startT = d / dashCount;
              const endT = startT + (1/dashCount * dashLength);
              
              // Get start and end points
              const x1 = p.lerp(offsetX, offsetX + endX, startT);
              const y1 = p.lerp(offsetY, offsetY + endY, startT);
              const x2 = p.lerp(offsetX, offsetX + endX, endT);
              const y2 = p.lerp(offsetY, offsetY + endY, endT);
              
              // Calculate control points for bezier
              const segmentLength = p.dist(x1, y1, x2, y2);
              const controlDist = segmentLength * 0.3; // Adjust curve intensity
              
              // Add some controlled randomness to control points
              const perpAngle = currentAngle + p.HALF_PI;
              const wobble = p.random(-0.5, 0.5) * segmentLength * 0.2;
              
              // Control points
              const cp1x = x1 + p.cos(perpAngle) * wobble;
              const cp1y = y1 + p.sin(perpAngle) * wobble;
              const cp2x = x2 + p.cos(perpAngle) * wobble;
              const cp2y = y2 + p.sin(perpAngle) * wobble;
              
              // Draw bezier curve
              p.bezier(x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2);
            }
          }
          p.pop();
        }
        noiseZ += 0.001;
      }
    }
    p.pop();
    
    
  };

  p.windowResized = () => {
    const parentWidth = p.canvas.parentElement.offsetWidth;
    const parentHeight = p.canvas.parentElement.offsetHeight;
    p.resizeCanvas(parentWidth, parentHeight);
    
    // Reposition buttons when the window is resized
    gridSizeSlider.position(p.width / 2 - 100, parentHeight + 20);
    cellSizeSlider.position(p.width / 2 - 100, parentHeight + 60);
  };
};

export default Flowfield;
