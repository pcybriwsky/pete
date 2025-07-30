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

  let useTensorFlow = true; // Set to true to use BodyPix instead of MediaPipe pose
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

  let mode = 'blob';
  let videoMode = 'small'; // 'small' or 'full'
  let trackingMode = 'body'; // 'hands', 'body', 'both'
  let thickness = 4;
  let time = 0;
  let circleSize = 30;
  
  // Blob effect controls
  let blobLayers = 50;
  let blobMaxNoise = 100;
  let blobTimeSpeed = 0.2;
  let blobTint = null; // No tint by default (null = RGB mixing)
  let blobSmoothing = 3; // Smoothing iterations
  let blobBaseSize = 0.8; // Base size multiplier
  let blobRedSize = 1.0; // Red ring size multiplier
  let blobGreenSize = 1.0; // Green ring size multiplier
  let blobBlueSize = 1.0; // Blue ring size multiplier
  let blobStability = 0.3; // Outline stability factor (0.1 = very stable, 1.0 = responsive)

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

  // Create a stable, glowing outline using TensorFlow segmentation mask
  let lastSegmentationUpdate = 0;
  let segmentationOutline = null;
  let smoothedOutline = null; // Store the smoothed outline
  let outlineSmoothingFactor = 0.3; // Easing factor for outline smoothing
  
  const updateSegmentationOutline = async () => {
    console.log('Starting updateSegmentationOutline...');
    if (!bodySegmenter || !video) {
      console.log('Missing bodySegmenter or video');
      return;
    }

    try {
      // Get segmentation data
      const segmentationConfig = {
        multiSegmentation: false,
        segmentBodyParts: false // Just get the whole body mask
      };
      
      console.log('Getting segmentation...');
      let segmentation;
      try {
        segmentation = await bodySegmenter.segmentPeople(video.elt, segmentationConfig);
        console.log('Segmentation result:', segmentation);
      } catch (segErr) {
        console.error('Segmentation call failed:', segErr);
        throw segErr;
      }
      
      if (segmentation.length === 0) {
        console.log('No segmentation found');
        segmentationOutline = null;
        return;
      }
      
      console.log('Found', segmentation.length, 'people');
      
      // Process all people and combine their outlines
      let allOutlines = [];
      
      for (let personIndex = 0; personIndex < segmentation.length; personIndex++) {
        const person = segmentation[personIndex];
        console.log('Processing person', personIndex, ':', person);
        const mask = person.mask;
        console.log('Mask object:', mask);
        console.log('Mask keys:', Object.keys(mask));
        
        if (!mask) {
          console.log('No mask object for person', personIndex);
          continue;
        }
        
        // Check different possible mask data structures
        console.log('Mask.data:', mask.data);
        console.log('Mask.width:', mask.width);
        console.log('Mask.height:', mask.height);
        
        // The mask data is in mask.mask (ImageData object)
        if (mask.mask) {
          console.log('Found mask.mask property (ImageData)');
          const imageData = mask.mask;
          console.log('ImageData:', imageData);
          console.log('ImageData width:', imageData.width);
          console.log('ImageData height:', imageData.height);
          console.log('ImageData data length:', imageData.data.length);
          
          // Use the ImageData properties
          mask.data = imageData.data;
          mask.width = imageData.width;
          mask.height = imageData.height;
        } else {
          console.log('No mask.mask property found for person', personIndex);
          continue;
        }

        console.log('Segmentation mask:', mask.width, 'x', mask.height);
        console.log('Mask data length:', mask.data.length);
        console.log('First few mask values:', mask.data.slice(0, 10));

        // Get mask dimensions
        const maskWidth = mask.width;
        const maskHeight = mask.height;
        const maskData = mask.data;
        
        // Scale mask to canvas size
        const scaleX = p.width / maskWidth;
        const scaleY = p.height / maskHeight;
        
        console.log('Creating binary grid for person', personIndex);
        // Create binary grid from mask data (ImageData has RGBA values)
        const binaryGrid = [];
        let whitePixels = 0;
        for (let y = 0; y < maskHeight; y++) {
          binaryGrid[y] = [];
          for (let x = 0; x < maskWidth; x++) {
            const index = (y * maskWidth + x) * 4; // RGBA = 4 bytes per pixel
            const alpha = maskData[index + 3]; // Alpha channel (transparency)
            const isWhite = alpha > 100; // Lower threshold for tighter contour
            binaryGrid[y][x] = isWhite ? 1 : 0;
            if (isWhite) whitePixels++;
          }
        }
        console.log('Binary grid created with', whitePixels, 'white pixels out of', maskWidth * maskHeight, 'total pixels');
        
        console.log('Applying morphological closing...');
        // Apply morphological closing (dilation + erosion) to close gaps
        const closedGrid = morphologicalClosing(binaryGrid, 2); // Smaller kernel for tighter contour
        
        console.log('Extracting outer contour...');
        // Extract outer contour
        const contour = extractOuterContour(closedGrid);
        
        console.log('Contour extracted with', contour.length, 'points');
        console.log('First few contour points:', contour.slice(0, 5));
        
        if (contour.length < 3) {
          console.log('Contour too short for person', personIndex, 'skipping');
          continue;
        }
        
        console.log('Simplifying contour...');
        // Use very gentle simplification for tighter contour
        const simplifiedContour = simplifyContour(contour, 0.3); // Very low tolerance for tight contour
        console.log('Simplified contour has', simplifiedContour.length, 'points');
        
        // Apply smoothing to the contour
        const smoothedContour = smoothContour(simplifiedContour, blobSmoothing); // Use slider value
        console.log('Smoothed contour has', smoothedContour.length, 'points');
        
        console.log('Scaling contour...');
        // Scale contour to canvas coordinates
        const scaledContour = smoothedContour.map(pt => ({
          x: pt.x * scaleX,
          y: pt.y * scaleY
        }));
        
        allOutlines.push(scaledContour);
      }
      
      if (allOutlines.length === 0) {
        console.log('No valid outlines found');
        segmentationOutline = null;
        return;
      }
      
      // Combine all outlines into one (for now - could be enhanced to handle separate blobs)
      const combinedOutline = allOutlines.flat();
      
      // Apply temporal smoothing to reduce jitter
      if (smoothedOutline && smoothedOutline.length === combinedOutline.length) {
        // Smooth between old and new outline
        const newSmoothedOutline = [];
        for (let i = 0; i < combinedOutline.length; i++) {
          const oldPt = smoothedOutline[i];
          const newPt = combinedOutline[i];
          const smoothedPt = {
            x: oldPt.x + (newPt.x - oldPt.x) * outlineSmoothingFactor,
            y: oldPt.y + (newPt.y - oldPt.y) * outlineSmoothingFactor
          };
          newSmoothedOutline.push(smoothedPt);
        }
        smoothedOutline = newSmoothedOutline;
      } else {
        // First time or different number of points, use new outline directly
        smoothedOutline = combinedOutline;
      }
      
      segmentationOutline = smoothedOutline; // Use the smoothed version
      console.log('Smoothed outline created with', smoothedOutline.length, 'points from', allOutlines.length, 'people');
      
    } catch (err) {
      console.error('Segmentation outline failed:', err);
      
      // Fallback: create a simple rectangle outline for testing
      console.log('Creating fallback rectangle outline...');
      const centerX = p.width / 2;
      const centerY = p.height / 2;
      const width = 200;
      const height = 300;
      
      segmentationOutline = [
        { x: centerX - width/2, y: centerY - height/2 },
        { x: centerX + width/2, y: centerY - height/2 },
        { x: centerX + width/2, y: centerY + height/2 },
        { x: centerX - width/2, y: centerY + height/2 }
      ];
      console.log('Fallback outline created with', segmentationOutline.length, 'points');
    }
  };

  const drawSegmentationOutlineGlow = () => {
    console.log('Drawing segmentation outline, points:', segmentationOutline ? segmentationOutline.length : 0);
    if (!segmentationOutline || segmentationOutline.length < 3) {
      console.log('No valid outline to draw');
      return;
    }
    p.background(0, 0, 0);

    p.push();
    
    // Set up blend mode for RGB glow effect
    p.blendMode(p.ADD);
    p.noStroke();
    
    // Calculate center of the contour for noise offsets
    let centerX = 0, centerY = 0;
    for (let pt of segmentationOutline) {
      centerX += pt.x;
      centerY += pt.y;
    }
    centerX /= segmentationOutline.length;
    centerY /= segmentationOutline.length;
    
    // Create multiple layers with different colors and noise offsets
    const layers = blobLayers; // Use slider value
    const baseSize = blobBaseSize; // Use slider value
    const sizeStep = (1.0 - baseSize) / layers; // Size increment per layer
    const maxNoise = blobMaxNoise; // Use slider value
    const t = time * blobTimeSpeed; // Use slider value
    
    for (let i = layers; i > 0; i--) {
      const alpha = Math.pow(1 - (i / layers), 2) * 0.8; // Fade out outer layers
      const size = baseSize + i * sizeStep;
      const noiseOffset = i * 0.1; // Different noise offset per layer
      
      if (blobTint) {
        // Use tint color for all layers with slight variations
        const tintR = blobTint[0];
        const tintG = blobTint[1];
        const tintB = blobTint[2];
        
        // Layer 1 - base tint
        p.fill(tintR, tintG, tintB, alpha * 255);
        drawNoisyBlob(segmentationOutline, centerX, centerY, size, t + noiseOffset, maxNoise);
        
        // Layer 2 - slight variation
        p.fill(tintR * 0.8, tintG * 0.8, tintB * 0.8, alpha * 255);
        drawNoisyBlob(segmentationOutline, centerX, centerY, size, t + noiseOffset + 0.2, maxNoise);
        
        // Layer 3 - more variation
        p.fill(tintR * 0.6, tintG * 0.6, tintB * 0.6, alpha * 255);
        drawNoisyBlob(segmentationOutline, centerX, centerY, size, t + noiseOffset + 0.4, maxNoise);
      } else {
        // Original RGB mixing effect with individual size multipliers
        // Red layer
        p.fill(255, 0, 0, alpha * 255);
        drawNoisyBlob(segmentationOutline, centerX, centerY, size * blobRedSize, t + noiseOffset, maxNoise);
        
        // Green layer
        p.fill(0, 255, 0, alpha * 255);
        drawNoisyBlob(segmentationOutline, centerX, centerY, size * blobGreenSize, t + noiseOffset + 0.2, maxNoise);
        
        // Blue layer
        p.fill(0, 0, 255, alpha * 255);
        drawNoisyBlob(segmentationOutline, centerX, centerY, size * blobBlueSize, t + noiseOffset + 0.4, maxNoise);
      }
    }
    
    p.pop();
    console.log('RGB blob effect drawn successfully');
  };

  // Draw a noisy blob based on the body contour
  const drawNoisyBlob = (contour, centerX, centerY, size, t, maxNoise) => {
    p.beginShape();
    
    for (let i = 0; i < contour.length; i++) {
      const pt = contour[i];
      
      // Calculate noise based on point position and time
      const noiseX = p.noise(pt.x * 0.01, pt.y * 0.01, t) * maxNoise;
      const noiseY = p.noise(pt.x * 0.01 + 100, pt.y * 0.01 + 100, t) * maxNoise;
      
      // Apply size scaling and noise displacement
      const scaledX = centerX + (pt.x - centerX) * size + noiseX;
      const scaledY = centerY + (pt.y - centerY) * size + noiseY;
      
      p.curveVertex(scaledX, scaledY);
    }
    
    // Close the shape by repeating first few points
    for (let i = 0; i < 3; i++) {
      const pt = contour[i];
      const noiseX = p.noise(pt.x * 0.01, pt.y * 0.01, t) * maxNoise;
      const noiseY = p.noise(pt.x * 0.01 + 100, pt.y * 0.01 + 100, t) * maxNoise;
      const scaledX = centerX + (pt.x - centerX) * size + noiseX;
      const scaledY = centerY + (pt.y - centerY) * size + noiseY;
      p.curveVertex(scaledX, scaledY);
    }
    
    p.endShape();
  };

  // Morphological closing: dilation followed by erosion
  const morphologicalClosing = (grid, kernelSize) => {
    const height = grid.length;
    const width = grid[0].length;
    const halfKernel = Math.floor(kernelSize / 2);
    
    // Dilation
    const dilated = [];
    for (let y = 0; y < height; y++) {
      dilated[y] = [];
      for (let x = 0; x < width; x++) {
        let maxVal = 0;
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const ny = y + ky;
            const nx = x + kx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              maxVal = Math.max(maxVal, grid[ny][nx]);
            }
          }
        }
        dilated[y][x] = maxVal;
      }
    }
    
    // Erosion
    const eroded = [];
    for (let y = 0; y < height; y++) {
      eroded[y] = [];
      for (let x = 0; x < width; x++) {
        let minVal = 1;
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const ny = y + ky;
            const nx = x + kx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              minVal = Math.min(minVal, dilated[ny][nx]);
            }
          }
        }
        eroded[y][x] = minVal;
      }
    }
    
    return eroded;
  };

  // Extract outer contour using boundary tracing
  const extractOuterContour = (grid) => {
    const height = grid.length;
    const width = grid[0].length;
    const contour = [];
    
    console.log('ExtractOuterContour: grid size', width, 'x', height);
    
    // Find starting point (first white pixel from top-left)
    let startX = -1, startY = -1;
    for (let y = 0; y < height && startY === -1; y++) {
      for (let x = 0; x < width && startX === -1; x++) {
        if (grid[y][x] === 1) {
          startX = x;
          startY = y;
        }
      }
    }
    
    console.log('Starting point found at:', startX, startY);
    
    if (startX === -1) {
      console.log('No starting point found - no white pixels in grid');
      return contour;
    }
    
    // Moore-Neighbor tracing algorithm
    const directions = [
      [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]
    ];
    
    let currentX = startX;
    let currentY = startY;
    let direction = 0; // Start looking right
    
    do {
      contour.push({ x: currentX, y: currentY });
      
      // Look for next boundary pixel
      let found = false;
      for (let i = 0; i < 8 && !found; i++) {
        const nextDir = (direction + i) % 8;
        const dx = directions[nextDir][0];
        const dy = directions[nextDir][1];
        const nextX = currentX + dx;
        const nextY = currentY + dy;
        
        if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height) {
          if (grid[nextY][nextX] === 1) {
            currentX = nextX;
            currentY = nextY;
            direction = (nextDir + 6) % 8; // Turn left
            found = true;
          }
        }
      }
      
      if (!found) break;
      
    } while (!(currentX === startX && currentY === startY) && contour.length < width * height);
    
    return contour;
  };

  // Simplify contour using distance-based simplification
  const simplifyContour = (contour, tolerance) => {
    console.log('Simplifying contour with', contour.length, 'points, tolerance:', tolerance);
    if (contour.length <= 2) return contour;
    
    const simplified = [contour[0]];
    let removedCount = 0;
    
    for (let i = 1; i < contour.length - 1; i++) {
      const prev = contour[i - 1];
      const curr = contour[i];
      const next = contour[i + 1];
      
      // Calculate distance from current point to line segment
      const dist = pointToLineDistance(curr, prev, next);
      
      if (dist > tolerance) {
        simplified.push(curr);
      } else {
        removedCount++;
      }
    }
    
    simplified.push(contour[contour.length - 1]);
    console.log('Simplification removed', removedCount, 'points, kept', simplified.length, 'points');
    return simplified;
  };

  // Calculate distance from point to line segment
  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }
    
    const param = dot / lenSq;
    
    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Smooth contour using multiple algorithms
  const smoothContour = (contour, iterations = 3) => {
    if (contour.length < 3) return contour;
    
    let smoothed = [...contour];
    
    for (let iter = 0; iter < iterations; iter++) {
      const newContour = [];
      
      for (let i = 0; i < smoothed.length; i++) {
        const prev = smoothed[(i - 1 + smoothed.length) % smoothed.length];
        const curr = smoothed[i];
        const next = smoothed[(i + 1) % smoothed.length];
        
        // Apply Gaussian smoothing (weighted average)
        const weight = 0.25; // Smoothing strength
        const newX = curr.x * (1 - 2 * weight) + prev.x * weight + next.x * weight;
        const newY = curr.y * (1 - 2 * weight) + prev.y * weight + next.y * weight;
        
        newContour.push({ x: newX, y: newY });
      }
      
      smoothed = newContour;
    }
    
    return smoothed;
  };

  // Alternative: Chaikin smoothing (more aggressive)
  const chaikinSmooth = (contour, iterations = 2) => {
    if (contour.length < 3) return contour;
    
    let smoothed = [...contour];
    
    for (let iter = 0; iter < iterations; iter++) {
      const newContour = [];
      
      for (let i = 0; i < smoothed.length; i++) {
        const curr = smoothed[i];
        const next = smoothed[(i + 1) % smoothed.length];
        
        // Chaikin's corner cutting algorithm
        const q = { x: 0.75 * curr.x + 0.25 * next.x, y: 0.75 * curr.y + 0.25 * next.y };
        const r = { x: 0.25 * curr.x + 0.75 * next.x, y: 0.25 * curr.y + 0.75 * next.y };
        
        newContour.push(q, r);
      }
      
      smoothed = newContour;
    }
    
    return smoothed;
  };

  // Alternative: B-spline smoothing (very smooth)
  const bsplineSmooth = (contour, degree = 3) => {
    if (contour.length < degree + 1) return contour;
    
    const smoothed = [];
    const n = contour.length;
    
    for (let i = 0; i < n; i++) {
      let x = 0, y = 0, weight = 0;
      
      for (let j = 0; j <= degree; j++) {
        const idx = (i + j) % n;
        const w = 1; // Uniform weights
        x += contour[idx].x * w;
        y += contour[idx].y * w;
        weight += w;
      }
      
      smoothed.push({ x: x / weight, y: y / weight });
    }
    
    return smoothed;
  };

  // Legacy pose-based outline (keeping for fallback)
  const drawPoseOutlineGlow = () => {
    if (!poseResults) return;

    // Simple body outline focusing on main silhouette
    // Just trace the outer edge of the body
    const outlineIndices = [
      // Head: nose to left ear to back of head to right ear
      0, 2, 4, 6, 8, 10, 9, 7, 5, 3, 1, 0,
      // Down to shoulders
      0, 11, 12,
      // Right side: shoulder to hip
      12, 24,
      // Left side: hip to shoulder  
      24, 23, 11,
      // Back to head
      11, 0
    ];

    const outline = outlineIndices
      .map(i => poseResults[i])
      .filter(pt => pt && pt.visibility > 0.5)
      .map(pt => ({ x: pt.x * p.width, y: pt.y * p.height }));

    if (outline.length < 3) return;

    p.push();
    p.noFill();
    p.stroke(0, 255, 255);
    p.strokeWeight(4);
    p.drawingContext.shadowBlur = 25;
    p.drawingContext.shadowColor = 'rgba(0,255,255,0.8)';

    // Draw the outline
    p.beginShape();
    for (let pt of outline) {
      p.vertex(pt.x, pt.y);
    }
    p.endShape(p.CLOSE);

    p.pop();
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
    const step = 2; // Sample every 4th pixel for better detail
    
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
    modeSelect.option('Aura', 'blob');
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

    // Create blob effect controls panel
    const blobPanel = p.createDiv('');
    blobPanel.position(0, 70);
    blobPanel.style('width', '100%');
    blobPanel.style('height', '120px');
    blobPanel.style('background-color', 'rgba(0, 0, 0, 0.8)');
    blobPanel.style('display', 'flex');
    blobPanel.style('align-items', 'center');
    blobPanel.style('justify-content', 'space-around');
    blobPanel.style('font-family', 'Roboto, sans-serif');
    blobPanel.style('font-size', '14px');
    blobPanel.style('color', 'white');

    // Layers slider
    let layersLabel = p.createDiv('Layers: ' + blobLayers);
    layersLabel.parent(blobPanel);
    layersLabel.style('text-align', 'center');
    
    let layersSlider = p.createSlider(10, 100, blobLayers, 1);
    layersSlider.parent(blobPanel);
    layersSlider.style('width', '100px');
    layersSlider.input(() => {
      blobLayers = layersSlider.value();
      layersLabel.html('Layers: ' + blobLayers);
    });

    // Max Noise slider
    let noiseLabel = p.createDiv('Noise: ' + blobMaxNoise);
    noiseLabel.parent(blobPanel);
    noiseLabel.style('text-align', 'center');
    
    let noiseSlider = p.createSlider(10, 200, blobMaxNoise, 1);
    noiseSlider.parent(blobPanel);
    noiseSlider.style('width', '100px');
    noiseSlider.input(() => {
      blobMaxNoise = noiseSlider.value();
      noiseLabel.html('Noise: ' + blobMaxNoise);
    });

    // Time Speed slider
    let speedLabel = p.createDiv('Speed: ' + blobTimeSpeed.toFixed(1));
    speedLabel.parent(blobPanel);
    speedLabel.style('text-align', 'center');
    
    let speedSlider = p.createSlider(0.1, 5.0, blobTimeSpeed, 0.1);
    speedSlider.parent(blobPanel);
    speedSlider.style('width', '100px');
    speedSlider.input(() => {
      blobTimeSpeed = speedSlider.value();
      speedLabel.html('Speed: ' + blobTimeSpeed.toFixed(1));
    });

    // Color tint selector
    let tintLabel = p.createDiv('Tint');
    tintLabel.parent(blobPanel);
    tintLabel.style('text-align', 'center');
    
    let tintSelect = p.createSelect();
    tintSelect.parent(blobPanel);
    tintSelect.option('No Tint', 'none');
    tintSelect.option('Red', 'red');
    tintSelect.option('Green', 'green');
    tintSelect.option('Blue', 'blue');
    tintSelect.option('Cyan', 'cyan');
    tintSelect.option('Magenta', 'magenta');
    tintSelect.option('Yellow', 'yellow');
    tintSelect.option('White', 'white');
    tintSelect.selected('none');
    tintSelect.changed(() => {
      const tint = tintSelect.value();
      switch(tint) {
        case 'none': blobTint = null; break;
        case 'red': blobTint = [255, 0, 0]; break;
        case 'green': blobTint = [0, 255, 0]; break;
        case 'blue': blobTint = [0, 0, 255]; break;
        case 'cyan': blobTint = [0, 255, 255]; break;
        case 'magenta': blobTint = [255, 0, 255]; break;
        case 'yellow': blobTint = [255, 255, 0]; break;
        case 'white': blobTint = [255, 255, 255]; break;
      }
    });
    tintSelect.style('padding', '5px 10px');
    tintSelect.style('border-radius', '20px');
    tintSelect.style('border', '1px solid #ccc');

    // Smoothing slider
    let smoothingLabel = p.createDiv('Smooth: ' + blobSmoothing);
    smoothingLabel.parent(blobPanel);
    smoothingLabel.style('text-align', 'center');
    
    let smoothingSlider = p.createSlider(0, 8, blobSmoothing, 1);
    smoothingSlider.parent(blobPanel);
    smoothingSlider.style('width', '100px');
    smoothingSlider.input(() => {
      blobSmoothing = smoothingSlider.value();
      smoothingLabel.html('Smooth: ' + blobSmoothing);
    });

    // Base Size slider
    let baseSizeLabel = p.createDiv('Base: ' + blobBaseSize.toFixed(1));
    baseSizeLabel.parent(blobPanel);
    baseSizeLabel.style('text-align', 'center');
    
    let baseSizeSlider = p.createSlider(0.3, 0.95, blobBaseSize, 0.05);
    baseSizeSlider.parent(blobPanel);
    baseSizeSlider.style('width', '100px');
    baseSizeSlider.input(() => {
      blobBaseSize = baseSizeSlider.value();
      baseSizeLabel.html('Base: ' + blobBaseSize.toFixed(1));
    });

    // Color ring size sliders
    let redSizeLabel = p.createDiv('Red: ' + blobRedSize.toFixed(2));
    redSizeLabel.parent(blobPanel);
    redSizeLabel.style('text-align', 'center');
    
    let redSizeSlider = p.createSlider(0.9, 1.1, blobRedSize, 0.001);
    redSizeSlider.parent(blobPanel);
    redSizeSlider.style('width', '100px');
    redSizeSlider.input(() => {
      blobRedSize = redSizeSlider.value();
      redSizeLabel.html('Red: ' + blobRedSize.toFixed(2));
    });

    let greenSizeLabel = p.createDiv('Green: ' + blobGreenSize.toFixed(2));
    greenSizeLabel.parent(blobPanel);
    greenSizeLabel.style('text-align', 'center');
    
    let greenSizeSlider = p.createSlider(0.9, 1.1, blobGreenSize, 0.001);
    greenSizeSlider.parent(blobPanel);
    greenSizeSlider.style('width', '100px');
    greenSizeSlider.input(() => {
      blobGreenSize = greenSizeSlider.value();
      greenSizeLabel.html('Green: ' + blobGreenSize.toFixed(2));
    });

    let blueSizeLabel = p.createDiv('Blue: ' + blobBlueSize.toFixed(2));
    blueSizeLabel.parent(blobPanel);
    blueSizeLabel.style('text-align', 'center');
    
    let blueSizeSlider = p.createSlider(0.9, 1.1, blobBlueSize, 0.001);
    blueSizeSlider.parent(blobPanel);
    blueSizeSlider.style('width', '100px');
          blueSizeSlider.input(() => {
        blobBlueSize = blueSizeSlider.value();
        blueSizeLabel.html('Blue: ' + blobBlueSize.toFixed(2));
      });

    // Stability slider
    let stabilityLabel = p.createDiv('Stability: ' + blobStability.toFixed(1));
    stabilityLabel.parent(blobPanel);
    stabilityLabel.style('text-align', 'center');
    
    let stabilitySlider = p.createSlider(0.1, 1.0, blobStability, 0.1);
    stabilitySlider.parent(blobPanel);
    stabilitySlider.style('width', '100px');
    stabilitySlider.input(() => {
      blobStability = stabilitySlider.value();
      outlineSmoothingFactor = blobStability; // Update the smoothing factor
      stabilityLabel.html('Stability: ' + blobStability.toFixed(1));
    });
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

    // Update segmentation outline periodically
    console.log('Draw loop - mode:', mode, 'useTensorFlow:', useTensorFlow, 'trackingMode:', trackingMode);
    if (mode === 'blob' && useTensorFlow && trackingMode !== 'hands') {
      const currentTime = p.millis();
      if (currentTime - lastSegmentationUpdate > 200) { // Update every 200ms for more stability
        console.log('Updating segmentation outline...');
        updateSegmentationOutline();
        lastSegmentationUpdate = currentTime;
      }
    }

    // Draw pose outline glow effect
    if (mode === 'blob' && trackingMode !== 'hands') {
      if (useTensorFlow) {
        // Use TensorFlow segmentation for more accurate outline
        drawSegmentationOutlineGlow();
      } else {
        // Fallback to pose-based outline
        drawPoseOutlineGlow();
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