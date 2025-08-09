import React from 'react';
import P5Wrapper from '../Sketches/SketchComponent';

const SongSwapSketch = ({ songs }) => {
  const sketch = (p5) => {
    let canvas;
    let depositedSong, receivedSong;
    let cardWidth, cardHeight;
    let isPrintMode = false;

    p5.setup = () => {
      // Check if we're in print mode
      isPrintMode = window.location.search.includes('print=true') || 
                   document.querySelector('.print-container');
      
      // Set canvas dimensions for business card (3.5" x 2")
      // At 300 DPI for print: 1050 x 600 pixels
      // For screen: 350 x 200 pixels
      if (isPrintMode) {
        cardWidth = 1050;
        cardHeight = 600;
      } else {
        cardWidth = 350;
        cardHeight = 200;
      }
      
      canvas = p5.createCanvas(cardWidth, cardHeight);
      canvas.parent('song-swap-sketch');
      
      // Set up songs data
      depositedSong = songs?.deposited || {
        title: "Sample Song",
        artist: "Sample Artist",
        image: null,
        album: "Sample Album"
      };
      
      receivedSong = songs?.received || {
        title: "Received Song",
        artist: "Another Artist", 
        image: null,
        album: "Another Album"
      };
    };

    p5.draw = () => {
      // Clear background
      p5.background(255);
      
      // Draw card border
      p5.stroke(0);
      p5.strokeWeight(2);
      p5.noFill();
      p5.rect(0, 0, cardWidth, cardHeight);
      
      // Calculate dimensions
      const halfWidth = cardWidth / 2;
      const halfHeight = cardHeight / 2;
      
      // Draw dividing line (domino style)
      p5.stroke(0);
      p5.strokeWeight(3);
      p5.line(halfWidth, 0, halfWidth, cardHeight);
      
      // Left side - Deposited Song
      drawSongSection(0, 0, halfWidth, cardHeight, depositedSong, "YOUR SONG", true);
      
      // Right side - Received Song  
      drawSongSection(halfWidth, 0, halfWidth, cardHeight, receivedSong, "RECEIVED", false);
      
      // Draw swap icon in center
      drawSwapIcon(halfWidth - 15, cardHeight - 30);
      
      // Draw footer text
      drawFooter();
    };

    const drawSongSection = (x, y, w, h, song, label, isLeft) => {
      const padding = isPrintMode ? 20 : 8;
      const titleSize = isPrintMode ? 16 : 8;
      const artistSize = isPrintMode ? 12 : 6;
      const labelSize = isPrintMode ? 10 : 5;
      
      // Background gradient
      const gradient = isLeft ? 
        p5.lerpColor(p5.color(102, 126, 234), p5.color(118, 75, 162), 0.5) :
        p5.lerpColor(p5.color(40, 167, 69), p5.color(32, 201, 151), 0.5);
      
      p5.fill(gradient);
      p5.noStroke();
      p5.rect(x + padding, y + padding, w - padding * 2, h - padding * 2);
      
      // Label
      p5.fill(255);
      p5.textSize(labelSize);
      p5.textAlign(p5.CENTER);
      p5.text(label, x + w/2, y + padding + labelSize);
      
      // Song title
      p5.fill(255);
      p5.textSize(titleSize);
      p5.textAlign(p5.CENTER);
      p5.textFont('Arial', titleSize);
      
      // Wrap text if too long
      const words = song.title.split(' ');
      let line = '';
      let yPos = y + padding + labelSize + 20;
      
      for (let word of words) {
        const testLine = line + word + ' ';
        const testWidth = p5.textWidth(testLine);
        
        if (testWidth > w - padding * 4) {
          p5.text(line, x + w/2, yPos);
          line = word + ' ';
          yPos += titleSize + 2;
        } else {
          line = testLine;
        }
      }
      p5.text(line, x + w/2, yPos);
      
      // Artist name
      p5.textSize(artistSize);
      p5.fill(255, 255, 255, 200);
      yPos += titleSize + 8;
      p5.text(song.artist, x + w/2, yPos);
      
      // Album name (if available)
      if (song.album) {
        yPos += artistSize + 4;
        p5.textSize(artistSize * 0.8);
        p5.fill(255, 255, 255, 150);
        p5.text(song.album, x + w/2, yPos);
      }
      
      // Draw musical note icon
      drawMusicNote(x + w/2, y + h - 40, isPrintMode ? 20 : 12);
    };

    const drawMusicNote = (x, y, size) => {
      p5.fill(255);
      p5.noStroke();
      
      // Draw note head
      p5.ellipse(x, y, size, size * 0.7);
      
      // Draw stem
      p5.rect(x + size/2, y - size, size * 0.15, size);
      
      // Draw flag
      p5.beginShape();
      p5.vertex(x + size/2 + size * 0.15, y - size);
      p5.quadraticVertex(x + size/2 + size * 0.3, y - size * 1.2, x + size/2 + size * 0.15, y - size * 1.4);
      p5.quadraticVertex(x + size/2, y - size * 1.2, x + size/2 + size * 0.15, y - size);
      p5.endShape();
    };

    const drawSwapIcon = (x, y) => {
      const size = isPrintMode ? 30 : 15;
      p5.stroke(0);
      p5.strokeWeight(2);
      p5.noFill();
      
      // Draw circular arrows
      p5.arc(x, y, size, size, -p5.PI/2, p5.PI/2);
      p5.arc(x + size, y, size, size, p5.PI/2, 3*p5.PI/2);
      
      // Draw arrow heads
      p5.line(x, y - size/2, x - 3, y - size/2 + 3);
      p5.line(x, y - size/2, x + 3, y - size/2 + 3);
      
      p5.line(x + size, y + size/2, x + size - 3, y + size/2 - 3);
      p5.line(x + size, y + size/2, x + size + 3, y + size/2 - 3);
    };

    const drawFooter = () => {
      const footerText = "Swapped at repete.art";
      const footerSize = isPrintMode ? 12 : 6;
      
      p5.fill(100);
      p5.textSize(footerSize);
      p5.textAlign(p5.CENTER);
      p5.text(footerText, cardWidth/2, cardHeight - 10);
      
      // Draw current date
      const date = new Date().toLocaleDateString();
      p5.text(date, cardWidth/2, cardHeight - 5);
    };

    // Handle window resize
    p5.windowResized = () => {
      if (!isPrintMode) {
        p5.resizeCanvas(cardWidth, cardHeight);
      }
    };
  };

  return (
    <div id="song-swap-sketch" style={{ display: 'flex', justifyContent: 'center' }}>
      <P5Wrapper sketch={sketch} />
    </div>
  );
};

export default SongSwapSketch; 