import * as magic from "@indistinguishable-from-magic/magic-js"

// IMPORTANT: Ensure ShaderPark is loaded/imported before this script runs.
// Shader Park function - Phase 1: Simple time/mouse driven color
function shaderParkGradient(props, inputs) {
  // props contains: time, mouse (normalized 0-1), resolution, etc.
  // inputs contains: any custom data we pass via sp.setInputs()

  let r = props.mouse.x; 
  let g = props.mouse.y;
  let b = 0.5 + 0.5 * Math.sin(props.time * 0.5); // Slower time effect

  props.color(r, g, b); // Sets the output color for the current pixel
}

// Max palette size for Shader Park inputs (if we pass as fixed-size array)
const SP_MAX_PALETTE_SIZE = 6;

// This function IS the Shader Park code, written in Shader Park's JS-like GLSL replacement.
// It will be passed to createShaderPark().
// It uses Shader Park global functions like input(), color(), vec3(), sin(), mod(), mix().
// For uniforms set via sdf.setUniform(), they are typically accessed via p.getUniform() in p5.js instance mode for this addon.
function shaderParkSdfCode(p) { // Pass p to access p.getUniform if needed by the addon style
    // Access uniforms set by sdf.setUniform()
    // The p5.shader-park.js addon might make these available globally too (time, mouseX etc.)
    // or require p.getUniform(). Let's try with p.getUniform() for robustness.
    let time = p.getUniform('time') || 0.0;
    let mouseX = p.getUniform('mouseX') || 0.5;
    let mouseY = p.getUniform('mouseY') || 0.5;
    let numColors = p.getUniform('numColors') || 0;
    
    let color0 = p.getUniform('color0') || [0.0, 0.0, 0.0];
    let color1 = p.getUniform('color1') || [0.0, 0.0, 0.0];
    // Retrieve other colors if needed for more complex gradients later
    // let color2 = p.getUniform('color2') || [0.0, 0.0, 0.0];
    // ... up to color5

    // Shader Park Math/API calls (these are global within Shader Park execution context)
    let t = mouseX + Math.sin(time * 0.5 + mouseY * 5.0) * 0.25;
    t = Math.mod(t, 1.0); 

    let finalColorVec = p.vec3(0.1, 0.1, 0.2); // Default dark blue

    if (numColors == 1) {
      finalColorVec = p.vec3(color0[0], color0[1], color0[2]);
    } else if (numColors >= 2) {
      finalColorVec = p.mix(p.vec3(color0[0], color0[1], color0[2]), p.vec3(color1[0], color1[1], color1[2]), t);
    } 

    p.color(finalColorVec); // Set the output color for the current fragment
}

const FullScreenGradient = (p) => {
  let isDevMode = true; 
  let isMagic = false;
  let sdf; // To hold the Shader Park SDF object

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

  p.setup = () => {
    // p5.js creates the canvas. Shader Park will use this existing canvas.
    // Shader Park needs a WebGL context if its shaders are GLSL-based.
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.noStroke();

    selectRandomPalette(); // Initialize jsHexColors and prepare SP data
    // sdf = createShaderPark(function() {
    //   sphere(0.5);
    //   displace(0.5, 0.2, 0.2);
    //   color(1, 0, 0);
    //   sphere(0.25);
    // });


    
    console.log("FullScreenGradient setup complete (Shader Park). Press 'r' to shuffle palette.");
  };

  p.draw = () => {
    if (sdf) {
      // Set uniforms for Shader Park before drawing
      sdf.setUniform('time', p.millis() / 1000.0);
      sdf.setUniform('mouseX', p.constrain(p.mouseX / p.width, 0.0, 1.0));
      sdf.setUniform('mouseY', p.constrain(p.mouseY / p.height, 0.0, 1.0));
      sdf.setUniform('numColors', currentSPNumColors);
      for (let i = 0; i < SP_MAX_PALETTE_SIZE; i++) {
        sdf.setUniform(`color${i}`, currentSPColors[i] || [0.0, 0.0, 0.0]);
      }

      sdf.draw(); // Draw the Shader Park SDF
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
