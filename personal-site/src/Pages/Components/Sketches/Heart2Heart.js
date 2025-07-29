// Heart2Heart.js — Full Body + Hand Tracking version + BodyPix toggle
import { Hands } from '@mediapipe/hands';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import * as bodyPix from '@tensorflow-models/body-pix';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

import p5 from 'p5';

const Heart2Heart = (p) => {
  let hands;
  let pose;
  let camera;
  let video;
  let handResults = [];
  let poseResults = null;

  let useTensorFlow = false; // Set to true to use BodyPix instead of MediaPipe pose
  let bodypixModel;
  let bodypixResult;
  let bodyPixCanvas;
  
  // Body segmentation for blur effects
  let bodySegmenter;
  let blurCanvas;
  let blurMode = false;
  let blurImage = null;
  let lastBlurUpdate = 0;
  let blurUpdateInterval = 50; // Update blur every 50ms for better responsiveness
  
  // Body part mask variables
  let maskImage = null;
  let lastMaskUpdate = 0;
  let maskUpdateInterval = 50; // Update mask every 50ms for better responsiveness
  let maskGraphics = null; // Separate graphics buffer for mask

  let mode = 'mask';
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

  const drawPoseLandmarks = () => {
    if (!poseResults) return;

    const poseConnections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [27, 29], [29, 31],
      [24, 26], [26, 28], [28, 30], [30, 32],
    ];

    const bodyColor = colors[0];
    const wristZ = poseResults[0]?.z || 0;
    const depthScale = p.map(wristZ, -0.5, 0.5, 2.5, 0.3, true);

    for (let i = 0; i < poseResults.length; i++) {
      const pt = poseResults[i];
      if (pt.visibility > 0.5) {
        const x = pt.x * p.width;
        const y = pt.y * p.height;
        p.fill(bodyColor);
        p.noStroke();
        p.circle(x, y, circleSize / 3 * depthScale);
      }
    }

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

  const setupBodyPix = async () => {
    try {
      bodypixModel = await bodyPix.load();
      console.log('BodyPix loaded');
    } catch (err) {
      console.error('BodyPix failed:', err);
    }
  };

  const setupBodySegmentation = async () => {
    try {
      console.log('Setting up body segmentation...');
      
      // Check if bodySegmentation is available globally
      if (typeof bodySegmentation === 'undefined') {
        console.error('Body segmentation library not loaded');
        return;
      }
      
      console.log('Body segmentation library found:', bodySegmentation);
      
      const model = bodySegmentation.SupportedModels.BodyPix;
      const segmenterConfig = {
        architecture: 'ResNet50',
        outputStride: 32,
        quantBytes: 2
      };
      
      console.log('Creating segmenter with config:', segmenterConfig);
      bodySegmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
      console.log('Body segmentation model loaded successfully:', bodySegmenter);
    } catch (err) {
      console.error('Body segmentation setup failed:', err);
    }
  };

  const getBodyPixData = async () => {
    if (!bodypixModel || !video) return;
    try {
      // Create a temporary canvas to get the correct video dimensions
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      // Set canvas size to match video display size
      if (videoMode === 'full') {
        tempCanvas.width = p.width;
        tempCanvas.height = p.height;
        tempCtx.drawImage(video.elt, 0, 0, p.width, p.height);
      } else {
        tempCanvas.width = 320;
        tempCanvas.height = 240;
        tempCtx.drawImage(video.elt, 0, 0, 320, 240);
      }
      
      bodypixResult = await bodypixModel.segmentPerson(tempCanvas, {
        flipHorizontal: false, // We're already flipping in p5
        internalResolution: 'medium',
        segmentationThreshold: 0.7
      });
    } catch (err) {
      console.error('BodyPix segmentation failed:', err);
    }
  };

  const drawBodyPixPoints = () => {
    if (!bodypixResult || !bodypixResult.data) return;
    
    // Create a more efficient body outline visualization
    const mask = bodypixResult.data;
    const bodyColor = p.color(colors[0]);
    bodyColor.setAlpha(150);
    
    p.noStroke();
    p.fill(bodyColor);
    
    // Get video dimensions for proper scaling
    const videoWidth = videoMode === 'full' ? p.width : 320;
    const videoHeight = videoMode === 'full' ? p.height : 240;
    
    // Draw body outline as connected points
    const points = [];
    const step = 4; // Sample every 4th pixel for better detail
    
    for (let y = 0; y < videoHeight; y += step) {
      for (let x = 0; x < videoWidth; x += step) {
        const i = x + y * videoWidth;
        if (mask[i] === 1) {
          // Scale coordinates to match canvas
          const scaledX = videoMode === 'full' ? x : x * (p.width / 320);
          const scaledY = videoMode === 'full' ? y : y * (p.height / 240);
          points.push({ x: scaledX, y: scaledY });
        }
      }
    }
    
    // Draw body outline
    if (points.length > 0) {
      // Draw key body points
      for (let i = 0; i < points.length; i += 2) { // Sample every 2nd point for better coverage
        const pt = points[i];
        p.circle(pt.x, pt.y, 3);
      }
      
      // Draw flowing connections in flow mode
      if (mode === 'flow' && points.length > 10) {
        for (let i = 0; i < points.length - 1; i += 4) {
          const pt1 = points[i];
          const pt2 = points[i + 1];
          if (pt1 && pt2) {
            const dist = p.dist(pt1.x, pt1.y, pt2.x, pt2.y);
            if (dist < 30) { // Only connect nearby points
              const colIndex = (i / 4) % colors.length;
              const col = p.color(colors[colIndex]);
              col.setAlpha(120);
              p.stroke(col);
              p.strokeWeight(1.5);
              p.line(pt1.x, pt1.y, pt2.x, pt2.y);
            }
          }
        }
      }
    }
  };

  const updateBlurEffect = async () => {
    if (!bodySegmenter || !video) return;
    
    try {
      const segmentationConfig = {
        multiSegmentation: false,
        segmentBodyParts: true
      };
      
      const segmentation = await bodySegmenter.segmentPeople(video.elt, segmentationConfig);
      
      if (segmentation.length > 0) {
        const foregroundThreshold = 0.5;
        const backgroundBlurAmount = 6;
        const edgeBlurAmount = 3;
        const flipHorizontal = false;
        const faceBodyPartIdsToBlur = [0, 1]; // left and right faces
        
        // Create output canvas for blur effect with proper scaling
        const targetWidth = videoMode === 'full' ? p.width : 320;
        const targetHeight = videoMode === 'full' ? p.height : 240;
        
        if (!blurCanvas || blurCanvas.width !== targetWidth || blurCanvas.height !== targetHeight) {
          blurCanvas = document.createElement('canvas');
          blurCanvas.width = targetWidth;
          blurCanvas.height = targetHeight;
        }
        
        bodySegmentation.blurBodyPart(
          blurCanvas, video.elt, segmentation, faceBodyPartIdsToBlur, foregroundThreshold,
          backgroundBlurAmount, edgeBlurAmount, flipHorizontal
        );
        
        // Create p5 image from the blurred canvas with proper scaling
        blurImage = p.createImage(targetWidth, targetHeight);
        blurImage.drawingContext.drawImage(blurCanvas, 0, 0);
      }
    } catch (err) {
      console.error('Blur effect failed:', err);
      blurImage = null;
    }
  };

  const updateBodyPartMask = async () => {
    if (!bodySegmenter || !video) {
      console.log('Body segmenter or video not ready');
      return;
    }
    
    try {
      console.log('Starting body part mask update...');
      
      const segmentationConfig = {
        multiSegmentation: false,
        segmentBodyParts: true
      };
      
      const segmentation = await bodySegmenter.segmentPeople(video.elt, segmentationConfig);
      console.log('Segmentation result:', segmentation);
      
      if (segmentation && segmentation.length > 0) {
        console.log('Segmentation detected, creating mask...');
        
        // Use rainbow colors like the reference code
        const coloredPartImage = await bodySegmentation.toColoredMask(
          segmentation,
          bodySegmentation.bodyPixMaskValueToRainbowColor,
          { r: 255, g: 255, b: 255, a: 255 }
        );
        
        const opacity = 0.7;
        const flipHorizontal = true; // Like the reference code
        const maskBlurAmount = 0;
        const inputCanvas = video.elt;
        const outputCanvas = maskGraphics.elt;
        
        // Draw the mask image on top of the original video onto the mask graphics buffer
        bodySegmentation.drawMask(outputCanvas, inputCanvas, coloredPartImage, opacity, maskBlurAmount, flipHorizontal);
        
        console.log('Body part mask created successfully');
      } else {
        console.log('No segmentation detected');
        // Clear the mask graphics
        maskGraphics.clear();
      }
      
    } catch (err) {
      console.error('Body part mask failed:', err);
      maskGraphics.clear();
    }
  };

  const updateBodyBlob = async () => {
    if (!bodySegmenter || !video) {
      console.log('Body segmenter or video not ready');
      return;
    }
    
    try {
      console.log('Starting body blob update...');
      
      const segmentationConfig = {
        multiSegmentation: false,
        segmentBodyParts: false // Don't segment body parts, just get the whole body
      };
      
      const segmentation = await bodySegmenter.segmentPeople(video.elt, segmentationConfig);
      console.log('Segmentation result:', segmentation);
      
      if (segmentation && segmentation.length > 0) {
        console.log('Segmentation detected, creating blob...');
        
        // Create a custom color mapping that fills the entire body with one color
        const blobColorMapping = (maskValue) => {
          // If it's a person (maskValue > 0), use bright red for testing
          if (maskValue > 0) {
            return { r: 255, g: 0, b: 0, a: 255 }; // Bright red
          } else {
            return { r: 0, g: 0, b: 0, a: 0 }; // Transparent background
          }
        };
        
        // Create colored mask with single color for entire body
        console.log('Creating colored mask with blob color mapping...');
        const coloredPartImage = await bodySegmentation.toColoredMask(
          segmentation,
          blobColorMapping,
          { r: 0, g: 0, b: 0, a: 0 }
        );
        console.log('Colored part image created:', coloredPartImage);
        
        const opacity = 0.8;
        const flipHorizontal = true;
        const maskBlurAmount = 0;
        const inputCanvas = video.elt;
        const outputCanvas = maskGraphics.elt;
        
        // Draw the blob mask on top of the original video
        bodySegmentation.drawMask(outputCanvas, inputCanvas, coloredPartImage, opacity, maskBlurAmount, flipHorizontal);
        
        console.log('Body blob created successfully');
      } else {
        console.log('No segmentation detected');
        // Clear the mask graphics
        maskGraphics.clear();
      }
      
    } catch (err) {
      console.error('Body blob failed:', err);
      maskGraphics.clear();
    }
  };

  const setupMediaPipe = async () => {
    try {
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

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    video = p.createCapture(p.VIDEO);
    video.size(640, 480);
    video.hide();

    // Create mask graphics buffer
    maskGraphics = p.createGraphics(p.width, p.height);

    // Always setup MediaPipe for hands, TensorFlow is just for body
    setupMediaPipe();
    if (useTensorFlow) setupBodyPix();
    // Setup body segmentation for blur effects
    setupBodySegmentation();

    // Top menu UI
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

    let modeSelect = p.createSelect();
    modeSelect.parent(banner);
    modeSelect.option('Debug', 'debug');
    modeSelect.option('Flow', 'flow');
    modeSelect.option('Blur', 'blur');
    modeSelect.option('Mask', 'mask');
    modeSelect.option('Blob', 'blob');
    modeSelect.selected(mode);
    modeSelect.changed(() => { 
      mode = modeSelect.value(); 
      blurMode = mode === 'blur';
    });
    modeSelect.style('padding', '5px 10px');
    modeSelect.style('border-radius', '20px');
    modeSelect.style('border', '1px solid #ccc');

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

    let videoToggle = p.createSelect();
    videoToggle.parent(banner);
    videoToggle.option('Top-Left Video', 'small');
    videoToggle.option('Full Screen Video', 'full');
    videoToggle.selected(videoMode);
    videoToggle.changed(() => { videoMode = videoToggle.value(); });
    videoToggle.style('padding', '5px 10px');
    videoToggle.style('border-radius', '20px');
    videoToggle.style('border', '1px solid #ccc');

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

    // TensorFlow toggle
    let tensorFlowToggle = p.createSelect();
    tensorFlowToggle.parent(banner);
    tensorFlowToggle.option('MediaPipe Body', 'mediapipe');
    tensorFlowToggle.option('TensorFlow Body', 'tensorflow');
    tensorFlowToggle.selected(useTensorFlow ? 'tensorflow' : 'mediapipe');
    tensorFlowToggle.changed(() => {
      useTensorFlow = tensorFlowToggle.value() === 'tensorflow';
      if (useTensorFlow) {
        setupBodyPix();
      }
      // MediaPipe is always running for hands
    });
    tensorFlowToggle.style('padding', '5px 10px');
    tensorFlowToggle.style('border-radius', '20px');
    tensorFlowToggle.style('border', '1px solid #ccc');

    // Add instructions
    let instructions = p.createDiv('Press "r" for palette, "m" for mode');
    instructions.parent(banner);
    instructions.style('font-size', '12px');
    instructions.style('color', '#666');
    instructions.style('padding', '5px 10px');

    // Add body part legend for mask mode
    let legend = p.createDiv('Mask: Face=1st, Arms=2nd, Torso=3rd, Legs=4th color');
    legend.parent(banner);
    legend.style('font-size', '10px');
    legend.style('color', '#888');
    legend.style('padding', '2px 10px');
    legend.style('text-align', 'center');
  };

  p.keyPressed = () => {
    if (p.key === 'r') {
      cyclePalette();
    }
    if (p.key === 'm') {
      // Cycle through modes: debug -> flow -> blur -> mask -> blob -> debug
      if (mode === 'debug') {
        mode = 'flow';
        blurMode = false;
      } else if (mode === 'flow') {
        mode = 'blur';
        blurMode = true;
      } else if (mode === 'blur') {
        mode = 'mask';
        blurMode = false;
      } else if (mode === 'mask') {
        mode = 'blob';
        blurMode = false;
      } else if (mode === 'blob') {
        mode = 'debug';
        blurMode = false;
      }
      // Reset update timers when switching modes to ensure immediate update
      lastBlurUpdate = 0;
      lastMaskUpdate = 0;
    }
  };

  p.draw = () => {
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
    } else if (mode === 'blur') {
      p.background(0);
    } else if (mode === 'mask') {
      p.background(0);
    } else if (mode === 'blob') {
      p.background(0);
    } else {
      p.background(10);
    }

    p.push();
    p.scale(-1, 1);
    p.translate(-p.width, 0);
    
    if (mode === 'blur') {
      // Update blur effect periodically
      const currentTime = p.millis();
      if (currentTime - lastBlurUpdate > blurUpdateInterval) {
        updateBlurEffect();
        lastBlurUpdate = currentTime;
      }
      
      // Draw the blurred image if available, otherwise show normal video
      if (blurImage) {
        p.image(blurImage, 0, 0, videoMode === 'full' ? p.width : 320, videoMode === 'full' ? p.height : 240);
      } else {
        if (videoMode === 'full') {
          p.image(video, 0, 0, p.width, p.height);
        } else {
          p.image(video, 0, 0, 320, 240);
        }
      }
    } else if (mode === 'mask') {
      // Update body part mask periodically
      const currentTime = p.millis();
      if (currentTime - lastMaskUpdate > maskUpdateInterval) {
        updateBodyPartMask();
        lastMaskUpdate = currentTime;
      }
      
      // Draw the mask graphics buffer (which contains video + mask overlay)
      p.image(maskGraphics, 0, 0, p.width, p.height);
    } else if (mode === 'blob') {
      // Update body blob periodically
      const currentTime = p.millis();
      if (currentTime - lastMaskUpdate > maskUpdateInterval) {
        updateBodyBlob();
        lastMaskUpdate = currentTime;
      }
      
      // Draw the blob graphics buffer (which contains video + blob overlay)
      p.image(maskGraphics, 0, 0, p.width, p.height);
    } else {
      // Normal video display
      if (videoMode === 'full') {
        p.image(video, 0, 0, p.width, p.height);
      } else {
        p.image(video, 0, 0, 320, 240);
      }
    }

    if (trackingMode === 'body' || trackingMode === 'both') {
      if (useTensorFlow) {
        if (p.frameCount % 2 === 0) getBodyPixData(); // Reduced frequency for performance
        drawBodyPixPoints();
      } else {
        drawPoseLandmarks();
      }
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

    p.pop();
    time += 0.1;
  };
};

export default Heart2Heart;