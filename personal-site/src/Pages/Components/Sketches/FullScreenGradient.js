import * as magic from "@indistinguishable-from-magic/magic-js"

// Max palette size for Shader Park inputs (if we pass as fixed-size array)
const SP_MAX_PALETTE_SIZE = 6;

const FullScreenGradient = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  let sdf; // To hold the Shader Park SDF object
  let useShaderPark = false; // Flag to track if Shader Park is available
  let shaderParkLoaded = false; // Track if Shader Park has been loaded

  const palettes = {
    sunset: {"Melon":"ffa69e","Eggshell":"faf3dd","Celeste":"b8f2e6","LightBlue":"aed9e0","PaynesGray":"5e6472"},
    forest: {"ForestGreen":"2c5530","Sage":"7d9b76","Cream":"f7e1d7","Moss":"4a5759","DeepGreen":"053225"},
    ocean: {"DeepBlue":"003b4f","Turquoise":"38a2ac","Aqua":"7cd7d7","Sky":"b4e7e7","Sand":"fff1d9"},
    desert: {"Terracotta":"cd5f34","Sand":"e6c79c","DustyRose":"d4a5a5","SageGreen":"9cae9c","Brown":"6e4c4b"},
    berry: {"Purple":"4a1942","Magenta":"893168","Pink":"c4547d","LightPink":"e8a1b3","CreamPink":"ead7d7"}
  };
  let currentPalette;
  let jsHexColors = []; // Holds current palette as array of hex strings

  // These will store the data passed to Shader Park via the callback
  let currentSPColors = []; // Array of [r,g,b] arrays, normalized
  let currentSPNumColors = 0;

  // Helper to convert hex colors to normalized [r,g,b] arrays for Shader Park inputs
  const prepareSPColorInputs = (hexColorsArray) => {
    let formattedColors = [];
    for (let i = 0; i < SP_MAX_PALETTE_SIZE; i++) {
      if (i < hexColorsArray.length) {
        let c = p.color(hexColorsArray[i]); // Use p5.color to parse hex
        formattedColors.push([p.red(c) / 255.0, p.green(c) / 255.0, p.blue(c) / 255.0]);
      } else {
        formattedColors.push([0.0, 0.0, 0.0]); // Pad with black if fewer actual colors
      }
    }
    return formattedColors;
  };

  // Updates the state variables that the Shader Park callback will use
  const updateShaderParkColorData = () => {
    currentSPColors = prepareSPColorInputs(jsHexColors);
    currentSPNumColors = Math.min(jsHexColors.length, SP_MAX_PALETTE_SIZE);
  };

  const selectRandomPalette = () => {
    const paletteNames = Object.keys(palettes);
    const randomPaletteName = paletteNames[Math.floor(p.random(paletteNames.length))];
    currentPalette = palettes[randomPaletteName];
    jsHexColors = Object.values(currentPalette).map(c => c.startsWith('#') ? c : `#${c}`);
    console.log("Selected Palette:", randomPaletteName);
    updateShaderParkColorData(); // Prepare data for Shader Park
    shufflePalette(); // Shuffle after selecting
  };

  const shufflePalette = () => {
    for (let i = jsHexColors.length - 1; i > 0; i--) {
      const j = Math.floor(p.random(i + 1));
      [jsHexColors[i], jsHexColors[j]] = [jsHexColors[j], jsHexColors[i]];
    }
    console.log("Shuffled Palette");
    updateShaderParkColorData(); // Prepare data for Shader Park after shuffle
  };

  // Fallback gradient using p5.js (no Shader Park)
  const drawP5Gradient = () => {
    p.loadPixels();
    let d = p.pixelDensity();
    let w = p.width * d;
    let h = p.height * d;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let index = 4 * (y * w + x);
        
        // Normalize coordinates
        let nx = x / w;
        let ny = y / h;
        
        // Create animated gradient based on mouse and time
        let time = p.millis() / 1000.0;
        let mouseXNorm = p.constrain(p.mouseX / p.width, 0.0, 1.0);
        let mouseYNorm = p.constrain(p.mouseY / p.height, 0.0, 1.0);
        
        // Create animated t value
        let t = mouseXNorm + Math.sin(time * 0.5 + mouseYNorm * 5.0) * 0.25;
        t = (t % 1.0 + 1.0) % 1.0; // Ensure t is between 0 and 1
        
        // Get colors from current palette
        let color1 = p.color(jsHexColors[0] || '#000000');
        let color2 = p.color(jsHexColors[1] || '#ffffff');
        
        // Interpolate between colors
        let r = p.lerp(p.red(color1), p.red(color2), t);
        let g = p.lerp(p.green(color1), p.green(color2), t);
        let b = p.lerp(p.blue(color1), p.blue(color2), t);
        
        p.pixels[index] = r;
        p.pixels[index + 1] = g;
        p.pixels[index + 2] = b;
        p.pixels[index + 3] = 255;
      }
    }
    p.updatePixels();
  };

  // Try to load Shader Park dynamically
  const loadShaderPark = () => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.ShaderPark) {
        console.log("Shader Park already loaded");
        resolve(true);
        return;
      }

      // Try to load Shader Park from CDN
      console.log("Attempting to load Shader Park...");
      
      // Create script element for Shader Park Core
      const script1 = document.createElement('script');
      script1.type = 'module';
      script1.src = 'https://unpkg.com/shader-park-core@0.2.8/dist/shader-park-core.js';
      script1.onload = () => {
        console.log("Shader Park Core loaded");
        
        // Create script element for p5.js addon
        const script2 = document.createElement('script');
        script2.type = 'module';
        script2.src = 'https://unpkg.com/shader-park-core@0.2.8/dist/shader-park-p5.js';
        script2.onload = () => {
          console.log("Shader Park p5.js addon loaded");
          // Give it a moment to initialize
          setTimeout(() => {
            if (window.ShaderPark) {
              console.log("Shader Park successfully loaded and available");
              resolve(true);
            } else {
              console.log("Shader Park loaded but ShaderPark not available");
              resolve(false);
            }
          }, 100);
        };
        script2.onerror = () => {
          console.log("Failed to load Shader Park p5.js addon");
          resolve(false);
        };
        document.head.appendChild(script2);
      };
      script1.onerror = () => {
        console.log("Failed to load Shader Park Core");
        resolve(false);
      };
      document.head.appendChild(script1);
    });
  };

  p.setup = async () => {
    // p5.js creates the canvas. Shader Park will use this existing canvas.
    // Shader Park needs a WebGL context if its shaders are GLSL-based.
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.noStroke();

    selectRandomPalette(); // Initialize jsHexColors and prepare SP data
    
    // Try to load and initialize Shader Park
    try {
      shaderParkLoaded = await loadShaderPark();
      
      if (shaderParkLoaded && window.ShaderPark) {
        console.log("Initializing Shader Park...");
        
        // Create a simple sphere using Shader Park's API
        sdf = window.ShaderPark.createShaderPark(function() {
          // eslint-disable-next-line no-undef
          // Simple sphere as requested
          // sphere(0.5);
          // eslint-disable-next-line no-undef
          color(1, 0, 0); // Red color
        });
        
        useShaderPark = true;
        console.log("Shader Park initialized successfully with sphere");
      } else {
        console.log("Shader Park not available, using p5.js fallback");
        useShaderPark = false;
      }
    } catch (error) {
      console.error("Failed to initialize Shader Park:", error);
      useShaderPark = false;
    }
    
    console.log("FullScreenGradient setup complete. Press 'r' to shuffle palette.");
  };

  p.draw = () => {
    if (useShaderPark && sdf) {
      // Set uniforms for Shader Park before drawing
      sdf.setUniform('time', p.millis() / 1000.0);
      sdf.setUniform('mouseX', p.constrain(p.mouseX / p.width, 0.0, 1.0));
      sdf.setUniform('mouseY', p.constrain(p.mouseY / p.height, 0.0, 1.0));
      sdf.setUniform('numColors', currentSPNumColors);
      for (let i = 0; i < SP_MAX_PALETTE_SIZE; i++) {
        sdf.setUniform(`color${i}`, currentSPColors[i] || [0.0, 0.0, 0.0]);
      }

      sdf.draw(); // Draw the Shader Park SDF
    } else {
      // Fallback to p5.js gradient
      drawP5Gradient();
    }
  };

  p.mousePressed = async () => {
    if (isDevMode) {
      isDevMode = false;
      if (!isMagic) {
        try {
          await magic.connect({ mesh: false, auto: true });
          console.log("Magic connected. Modules:", magic.modules);
          isMagic = true;
        } catch (error) {
          console.error("Failed to connect magic:", error);
          isDevMode = true; 
        }
      }
    } else {
      console.log("Sketch interaction click.");
    }
    // p.loop() is less relevant if Shader Park drives rendering.
  };
 
  p.keyPressed = () => {
     if (p.key === 'r' || p.key === 'R') {
       selectRandomPalette(); // This updates color data for Shader Park
     }
   };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    // Shader Park usually adapts to canvas resize automatically via props.resolution
    // or if sdf.draw() is called in p.draw(), it gets new canvas dimensions.
  };
};

export default FullScreenGradient; 
