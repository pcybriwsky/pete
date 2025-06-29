const ColorBlend = (p) => {
  // --- Shared State & Networking ---
  const SHARED_STATE_KEY = "colorBlendSharedState_v2";
  const STALE_THRESHOLD_MS = 2000; // Reduced to 2 seconds for faster cleanup
  let participantId;
  
  // --- Blob Parameters ---
  let kMax;
  let step;
  let n = 25;
  let radius = 60;
  let inter = 1.5;
  let maxNoise = 1000;
  let noiseProg = (x) => p.pow(x, 1.5);

  // --- Color Definitions ---
  const availableColors = ["#ff0000", "#00ff00", "#0000ff"]; // Red, Green, Blue

  // --- Helper Functions ---

  const getSharedState = () => {
    try {
      const rawState = localStorage.getItem(SHARED_STATE_KEY);
      return rawState ? JSON.parse(rawState) : { participants: {} };
    } catch (e) {
      console.error("Could not parse shared state:", e);
      return { participants: {} };
    }
  };

  const setSharedState = (state) => {
    localStorage.setItem(SHARED_STATE_KEY, JSON.stringify(state));
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [255, 255, 255]; // Default to white if parse fails
  };

  const joinSharedState = () => {
    const state = getSharedState();
    const usedColors = new Set(Object.values(state.participants).map(p => p.colorHex));
    let assignedColor = availableColors.find(c => !usedColors.has(c));

    // If all primary colors are in use, default to a fallback color.
    if (!assignedColor) {
      assignedColor = "#cccccc"; // Light gray
      console.warn("All primary colors are in use. Defaulting to light gray.");
    }

    const now = Date.now();
    const globalX = window.screenX + p.width / 2;
    const globalY = window.screenY + p.height / 2;

    state.participants[participantId] = {
      id: participantId,
      colorHex: assignedColor,
      colorRGB: hexToRgb(assignedColor),
      window: { x: window.screenX, y: window.screenY, width: p.width, height: p.height },
      target: { x: globalX, y: globalY }, // The blob's target global position
      // Eased positions for each color channel
      channels: {
        r: { x: globalX, y: globalY },
        g: { x: globalX, y: globalY },
        b: { x: globalX, y: globalY },
      },
      lastUpdated: now,
    };
    setSharedState(state);
    console.log(`Joined with ID ${participantId} and color ${assignedColor}`);
  };

  const leaveSharedState = () => {
    const state = getSharedState();
    delete state.participants[participantId];
    setSharedState(state);
    console.log(`Participant ${participantId} left.`);
  };

  const updateAndCleanState = () => {
    const state = getSharedState();
    const now = Date.now();

    // 1. Prune stale participants
    for (const id in state.participants) {
      // A participant is stale if it's not this tab and it hasn't updated recently.
      if (id !== participantId && now - state.participants[id].lastUpdated > STALE_THRESHOLD_MS) {
        delete state.participants[id];
        console.log(`Pruned stale participant ${id}`);
      }
    }

    // 2. Check if this tab is in the state. If not, rejoin.
    let me = state.participants[participantId];
    if (!me) {
      joinSharedState();
      // After joining, get the new state and return it for the next frame.
      return getSharedState();
    }

    // 3. Update this tab's state (heartbeat and position)
    me.lastUpdated = now;
    me.window = { x: window.screenX, y: window.screenY, width: p.width, height: p.height };
    me.target = {
      x: window.screenX + p.width / 2,
      y: window.screenY + p.height / 2,
    };
    
    // 4. Apply easing for each color channel
    me.channels.r.x += (me.target.x - me.channels.r.x) * 0.05;
    me.channels.r.y += (me.target.y - me.channels.r.y) * 0.05;
    me.channels.g.x += (me.target.x - me.channels.g.x) * 0.1;
    me.channels.g.y += (me.target.y - me.channels.g.y) * 0.1;
    me.channels.b.x += (me.target.x - me.channels.b.x) * 0.15;
    me.channels.b.y += (me.target.y - me.channels.b.y) * 0.15;

    // 5. Write the updated state back to localStorage
    setSharedState(state);

    return state;
  }
  
  // --- P5.js Event Handlers ---

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.angleMode(p.DEGREES);
    
    // Initialize blob parameters
    kMax = p.random(0.6, 1.0);
    step = 0.01;

    // Use crypto.randomUUID() for a truly unique ID to prevent collisions.
    // This is the key fix for the state corruption issue.
    participantId = crypto.randomUUID();

    // Set up listeners for joining/leaving
    window.addEventListener('beforeunload', leaveSharedState);
    
    joinSharedState();
    
    console.log("ColorBlend setup complete. Each window has a colored circle.");
  };

  p.draw = () => {
    p.blendMode(p.BLEND);
    p.background(0);
    p.blendMode(p.ADD);

    const state = updateAndCleanState();

    // Don't draw if the state is not ready (e.g., we just joined)
    if (!state || !state.participants) {
      return;
    }

    // --- Draw All Participants ---
    const t = p.frameCount / 150; // Time variable for noise evolution

    for (const id in state.participants) {
      const participant = state.participants[id];
      const [r, g, b] = participant.colorRGB;

      // Convert global channel positions to local for drawing
      const localRx = participant.channels.r.x - window.screenX;
      const localRy = participant.channels.r.y - window.screenY;
      const localGx = participant.channels.g.x - window.screenX;
      const localGy = participant.channels.g.y - window.screenY;
      const localBx = participant.channels.b.x - window.screenX;
      const localBy = participant.channels.b.y - window.screenY;

      for (let i = n; i > 0; i--) {
        const alpha = p.pow(1 - noiseProg(i / n), 3);
        const size = radius - i * inter;
        const k = kMax * p.sqrt(i / n);
        const baseNoisiness = maxNoise * noiseProg(i / n);
        p.noStroke();
        // p.strokeWeight(size / 20);

        // Draw three overlapping blobs with RGB colors based on the participant's assigned color
        p.fill(r, 0, 0, alpha * 255);
        blob(size, localRx, localRy, k, t - i * step, baseNoisiness);

        p.fill(0, g, 0, alpha * 255);
        blob(size, localGx, localGy, k, t - i * step + 0.2, baseNoisiness);

        p.fill(0, 0, b, alpha * 255);
        blob(size, localBx, localBy, k, t - i * step + 0.4, baseNoisiness);
      }
    }
  };

  // No longer need mouse interaction to start things
  p.mousePressed = () => {
    console.log("Sketch clicked.");
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    // The draw loop will handle updating the position in the shared state.
  };

  p.keyPressed = () => {
    // 'r' to cycle to the next available primary color
    if (p.key === 'r' || p.key === 'R') {
       const state = getSharedState();
       const me = state.participants[participantId];
       if (me) {
         // Find my current color index
         const myColorIndex = availableColors.indexOf(me.colorHex);
         
         // Find a new color by checking the next ones in the array
         for (let i = 1; i <= availableColors.length; i++) {
           const nextIndex = (myColorIndex + i) % availableColors.length;
           const newColor = availableColors[nextIndex];

           // Check if this new color is used by OTHERS
           const usedByOthers = Object.values(state.participants).some(p => p.id !== participantId && p.colorHex === newColor);

           if (!usedByOthers) {
             me.colorHex = newColor;
             me.colorRGB = hexToRgb(newColor);
             setSharedState(state);
             console.log(`Switched to new color: ${newColor}`);
             return; // Exit after finding a new color
           }
         }
         console.log("No other primary colors available to switch to.");
      }
    }
  };

  // --- Blob drawing function (from BlobRotation) ---
  function blob(size, xCenter, yCenter, k, t, noisiness) {
    p.beginShape();
    let angleStep = 360 / 8; // Drawing segments (lower for smoother curves)
    for (let theta = 0; theta <= 360 + 2 * angleStep; theta += angleStep) {
      // Calculate noise offset based on angle
      let r1 = p.cos(theta) + 1;
      let r2 = p.sin(theta) + 1;
      // Modified noise calculation incorporating angle into time/third dimension
      let noiseVal = p.noise(k * r1, k * r2, t + p.sin(theta) * 0.1);
      let r = size + noiseVal * noisiness;
      // Convert polar coordinates (r, theta) to Cartesian (x, y)
      let x = xCenter + r * p.cos(theta);
      let y = yCenter + r * p.sin(theta);
      p.curveVertex(x, y); // Define vertex for the curve
    }
    p.endShape(); // Close the shape
  }
};

// IMPORTANT: Rename 'ColorBlend' to match the filename PascalCase
export default ColorBlend; 