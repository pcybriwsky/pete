// Heart2Heart.js — Full Body + Hand Tracking version
import { Hands } from '@mediapipe/hands';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import p5 from 'p5';

const Heart2Heart = (p) => {
  let hands;
  let pose;
  let camera;
  let video;
  let handResults = [];
  let poseResults = null;

  let mode = 'debug';
  let videoMode = 'small'; // 'small' or 'full'
  let trackingMode = 'hands'; // 'hands', 'body', 'both'
  let thickness = 4;
  let time = 0;
  let circleSize = 30;

  // --- Visual Style Variables ---
  const palettes = {
    sunset: ['#ffa69e', '#faf3dd', '#b8f2e6', '#aed9e0', '#5e6472'],
    forest: ['#2c5530', '#7d9b76', '#f7e1d7', '#4a5759', '#053225'],
    ocean: ['#003b4f', '#38a2ac', '#7cd7d7', '#b4e7e7', '#fff1d9'],
    desert: ['#cd5f34', '#e6c79c', '#d4a5a5', '#9cae9c', '#6e4c4b'],
    berry: ['#4a1942', '#893168', '#c4547d', '#e8a1b3', '#ead7d7'],
    sunrise: ['#ffd700', '#ff7f50', '#ff1744', '#1e88e5', '#90caf9'],
    twilight: ['#673ab7', '#e91e63', '#ff6d6d', '#4fc3f7', '#e1f5fe'],
    neon_sunset: ['#ff1493', '#ff4500', '#ffff00', '#00ffff', '#0000ff'],
    candy: ['#ff69b4', '#ffb6c1', '#e6e6fa', '#98ff98', '#87ceeb'],
    flame: ['#ffeb3b', '#ff9800', '#ff5722', '#f44336', '#b71c1c'],
    arctic: ['#bbdefb', '#64b5f6', '#1976d2', '#7e57c2', '#4527a0'],
    rainbow: ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3']
  };
  let paletteKeys = Object.keys(palettes);
  let currentPaletteIndex = 0;
  let colors = palettes[paletteKeys[currentPaletteIndex]];

  const cyclePalette = () => {
    currentPaletteIndex = (currentPaletteIndex + 1) % paletteKeys.length;
    colors = palettes[paletteKeys[currentPaletteIndex]];
  };

  const setupMediaPipe = async () => {
    try {
      // Setup Hands
      hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 4,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results) => {
        handResults = results.multiHandLandmarks || [];
        console.log('Hand landmarks:', handResults);
      });

      // Setup Pose
      pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results) => {
        poseResults = results.poseLandmarks;
        console.log('Pose landmarks:', poseResults);
      });

      // Setup Camera
      camera = new Camera(video.elt, {
        onFrame: async () => {
          if (trackingMode === 'hands' || trackingMode === 'both') {
            await hands.send({ image: video.elt });
          }
          if (trackingMode === 'body' || trackingMode === 'both') {
            await pose.send({ image: video.elt });
          }
        },
        width: 640,
        height: 480,
      });

      await camera.start();
      console.log('MediaPipe camera started');
    } catch (err) {
      console.error('MediaPipe setup failed:', err);
    }
  };

  const drawPoseLandmarks = () => {
    if (!poseResults) return;

    // Define pose connections (key body parts)
    const poseConnections = [
      [11, 12], // shoulders
      [11, 13], [13, 15], // left arm
      [12, 14], [14, 16], // right arm
      [11, 23], [12, 24], // torso
      [23, 24], // hips
      [23, 25], [25, 27], [27, 29], [29, 31], // left leg
      [24, 26], [26, 28], [28, 30], [30, 32], // right leg
    ];

    const bodyColor = colors[0];
    const wristZ = poseResults[0]?.z || 0;
    const depthScale = p.map(wristZ, -0.5, 0.5, 2.5, 0.3, true);

    // Draw pose landmarks
    for (let i = 0; i < poseResults.length; i++) {
      const pt = poseResults[i];
      if (pt.visibility > 0.5) {
        const x = pt.x * p.width;
        const y = pt.y * p.height;
        p.fill(bodyColor);
        p.noStroke();
        p.circle(x, y, circleSize/3 * depthScale);
      }
    }

    // Draw connections
    if (mode === 'debug') {
      p.stroke(bodyColor);
      p.strokeWeight(3);
      for (let connection of poseConnections) {
        const pt1 = poseResults[connection[0]];
        const pt2 = poseResults[connection[1]];
        if (pt1 && pt2 && pt1.visibility > 0.5 && pt2.visibility > 0.5) {
          const x1 = pt1.x * p.width;
          const y1 = pt1.y * p.height;
          const x2 = pt2.x * p.width;
          const y2 = pt2.y * p.height;
          p.line(x1, y1, x2, y2);
        }
      }
    }

    // Flow mode: draw flowing connections between body parts
    if (mode === 'flow') {
      for (let connection of poseConnections) {
        const pt1 = poseResults[connection[0]];
        const pt2 = poseResults[connection[1]];
        if (pt1 && pt2 && pt1.visibility > 0.5 && pt2.visibility > 0.5) {
          const x1 = pt1.x * p.width;
          const y1 = pt1.y * p.height;
          const x2 = pt2.x * p.width;
          const y2 = pt2.y * p.height;
          const dist = p.dist(x1, y1, x2, y2);
          const avgZ = (pt1.z + pt2.z) / 2;
          const depthScale = p.map(avgZ, -0.5, 0.5, 2.5, 0.3, true);
          const baseSize = 20 * depthScale;

          const segments = 15;
          const angle = p.atan2(y2 - y1, x2 - x1);
          const length = dist;
          p.push();
          p.translate(x1, y1);
          p.rotate(angle);
          for (let k = 0; k <= segments; k++) {
            const frac = k / segments;
            const segX = frac * length;
            const offset = p.sin(frac * p.TWO_PI + time) * baseSize * 0.2;
            const segY = offset;
            const colIndex = Math.floor(frac * (colors.length - 1));
            const col1 = p.color(colors[colIndex]);
            const col2 = p.color(colors[(colIndex + 1) % colors.length]);
            const col = p.lerpColor(col1, col2, frac * (colors.length - 1) - colIndex);
            p.fill(col);
            p.noStroke();
            const size = baseSize * (0.3 + 0.7 * p.sin(frac * p.PI * 3 + time));
            p.ellipse(segX, segY, size, size);
          }
          p.pop();
        }
      }
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    video = p.createCapture(p.VIDEO);
    video.size(640, 480);
    video.hide();
    setupMediaPipe();

    // Top banner menu
    const banner = p.createDiv('');
    banner.position(0, 0);
    banner.style('width', '100%');
    banner.style('height', '60px');
    banner.style('background-color', 'rgba(255, 255, 255, 0.9)');
    banner.style('display', 'flex');
    banner.style('align-items', 'center');
    banner.style('justify-content', 'space-around');
    banner.style('font-family', 'Roboto, sans-serif');
    banner.style('font-size', '16px');

    // Mode select
    let modeSelect = p.createSelect();
    modeSelect.parent(banner);
    modeSelect.option('Debug', 'debug');
    modeSelect.option('Flow', 'flow');
    modeSelect.selected(mode);
    modeSelect.changed(() => { mode = modeSelect.value(); });
    modeSelect.style('padding', '5px 10px');
    modeSelect.style('border-radius', '20px');
    modeSelect.style('border', '1px solid #ccc');

    // Tracking mode select
    let trackingSelect = p.createSelect();
    trackingSelect.parent(banner);
    trackingSelect.option('Hands Only', 'hands');
    trackingSelect.option('Body Only', 'body');
    trackingSelect.option('Both', 'both');
    trackingSelect.selected(trackingMode);
    trackingSelect.changed(() => { trackingMode = trackingSelect.value(); });
    trackingSelect.style('padding', '5px 10px');
    trackingSelect.style('border-radius', '20px');
    trackingSelect.style('border', '1px solid #ccc');

    // Video toggle
    let videoToggle = p.createSelect();
    videoToggle.parent(banner);
    videoToggle.option('Top-Left Video', 'small');
    videoToggle.option('Full Screen Video', 'full');
    videoToggle.selected(videoMode);
    videoToggle.changed(() => { videoMode = videoToggle.value(); });
    videoToggle.style('padding', '5px 10px');
    videoToggle.style('border-radius', '20px');
    videoToggle.style('border', '1px solid #ccc');

    // Palette select
    let paletteSelect = p.createSelect();
    paletteSelect.parent(banner);
    paletteKeys.forEach(key => paletteSelect.option(key));
    paletteSelect.selected(paletteKeys[currentPaletteIndex]);
    paletteSelect.changed(() => {
      currentPaletteIndex = paletteKeys.indexOf(paletteSelect.value());
      colors = palettes[paletteKeys[currentPaletteIndex]];
    });
    paletteSelect.style('padding', '5px 10px');
    paletteSelect.style('border-radius', '20px');
    paletteSelect.style('border', '1px solid #ccc');
  };

  p.draw = () => {
    // Background first
    if (mode === 'flow') {
      p.push();
      const lightOffWhite = p.color(255, 252, 247);
      const slightlyDarkerOffWhite = p.color(248, 245, 240);
      let backgroundGradient = p.drawingContext.createLinearGradient(0, 0, 0, p.height);
      backgroundGradient.addColorStop(0, lightOffWhite);
      backgroundGradient.addColorStop(1, slightlyDarkerOffWhite);
      p.drawingContext.fillStyle = backgroundGradient;
      p.noStroke();
      p.rect(0, 0, p.width, p.height);
      p.pop();
    } else {
      p.background(10);
    }

    // Apply mirror transformation
    p.push();
    p.scale(-1, 1);
    p.translate(-p.width, 0);

    // Video display (mirrored)
    if (videoMode === 'full') {
      p.image(video, 0, 0, p.width, p.height);
    } else {
      p.image(video, 0, 0, 320, 240);
    }

    // Draw pose landmarks if tracking body
    if (trackingMode === 'body' || trackingMode === 'both') {
      drawPoseLandmarks();
    }

    // Draw hand landmarks/outlines
    if (trackingMode === 'hands' || trackingMode === 'both') {
      for (let h = 0; h < handResults.length; h++) {
        const hand = handResults[h];
        let handColor = colors[h % colors.length];
        const wristZ = hand[9].z;
        const depthScale = p.map(wristZ, -0.5, 0.5, 2.5, 0.3, true);

        if (mode === 'debug') {
          for (let i = 0; i < hand.length; i++) {
            const pt = hand[i];
            const x = pt.x * p.width;
            const y = pt.y * p.height;
            p.fill(handColor);
            p.noStroke();
            p.circle(x, y, circleSize/2 * depthScale);
          }
        } else {
          // Flow mode: draw filled landmarks with depth scaling
          for (let i = 0; i < hand.length; i++) {
            const pt = hand[i];
            const x = pt.x * p.width;
            const y = pt.y * p.height;
            p.fill(handColor);
            p.noStroke();
            p.circle(x, y, circleSize/2 * depthScale);
          }
          // Draw wrist circle with depth scaling
          const wristX = hand[9].x * p.width;
          const wristY = hand[9].y * p.height;
          p.fill(handColor);
          p.noStroke();
          p.ellipse(wristX, wristY, circleSize * depthScale, circleSize * depthScale);
        }
      }
    }

    // Draw connections between hands
    if ((trackingMode === 'hands' || trackingMode === 'both') && handResults.length > 1) {
      if (mode === 'flow') {
        // Flow connections between hands
        for (let i = 0; i < handResults.length; i++) {
          const pt1 = handResults[i][9];
          for (let j = i + 1; j < handResults.length; j++) {
            const pt2 = handResults[j][9];
            if (pt1 && pt2) {
              const x1 = pt1.x * p.width;
              const y1 = pt1.y * p.height;
              const x2 = pt2.x * p.width;
              const y2 = pt2.y * p.height;
              const dist = p.dist(x1, y1, x2, y2);
              const maxDist = p.dist(0, 0, p.width, p.height);
              const normDist = dist / maxDist;
              const avgZ = (pt1.z + pt2.z) / 2;
              const depthScale = p.map(avgZ, -0.5, 0.5, 2.5, 0.3, true);
              const baseSize = p.map(normDist, 0, 1, 40, 5) * depthScale;

              const segments = 30;
              const angle = p.atan2(y2 - y1, x2 - x1);
              const length = dist;
              p.push();
              p.translate(x1, y1);
              p.rotate(angle);
              for (let k = 0; k <= segments; k++) {
                const frac = k / segments;
                const segX = frac * length;
                const offset = p.sin(frac * p.TWO_PI + time) * baseSize * 0.3;
                const segY = offset;
                const colIndex = Math.floor(frac * (colors.length - 1));
                const col1 = p.color(colors[colIndex]);
                const col2 = p.color(colors[(colIndex + 1) % colors.length]);
                const col = p.lerpColor(col1, col2, frac * (colors.length - 1) - colIndex);
                p.fill(col);
                p.noStroke();
                const size = baseSize * (0.5 + 0.5 * p.sin(frac * p.PI * 4 + time));
                p.ellipse(segX, segY, size, size);
              }
              p.pop();
            }
          }
        }
      } else {
        // Debug connections between hands
        for (let i = 0; i < handResults.length; i++) {
          const pt1 = handResults[i][9];
          for (let j = i + 1; j < handResults.length; j++) {
            const pt2 = handResults[j][9];
            if (pt1 && pt2) {
              const x1 = pt1.x * p.width;
              const y1 = pt1.y * p.height;
              const x2 = pt2.x * p.width;
              const y2 = pt2.y * p.height;
              p.stroke(255, 150);
              p.strokeWeight(2);
              p.line(x1, y1, x2, y2);
            }
          }
        }
      }
    }

    time += 0.1;
    
    // End mirror transformation
    p.pop();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.keyPressed = () => {
    if (p.key === 'r') {
      cyclePalette();
    }
  };
};

export default Heart2Heart;