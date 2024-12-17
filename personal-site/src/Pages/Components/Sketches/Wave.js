const Wave = (p) => {
  let noiseOffset = 0;
  let currentTheme = 0;
  let waveGraphic;
  let layerCount = 24;
  
  const themes = [
    {
      name: "Neon Sunrise",
      backgroundColor: "#F8F5F0",
      colors: [
        "#FF1493",
        "#00FF00",
        "#FF4500",
        "#00FFFF",
        "#FF69B4",
        "#32CD32",
        "#FF8C00"
      ]
    },
    {
      name: "Cyber Night",
      backgroundColor: "#0a0a0a",
      colors: [
        "#FF00FF",
        "#39FF14",
        "#FF2D00",
        "#00F7FF",
        "#9D00FF",
        "#14FFB8",
        "#FF007F"
      ]
    },
    {
      name: "Spring Dawn",
      backgroundColor: "#F8F5F0",
      colors: [
        "#E6A4BC",
        "#A4BCE6",
        "#BCE6A4",
        "#E6BCA4",
        "#C4A4E6",
        "#A4E6D9",
        "#E6A4D9"
      ]
    },
    {
      name: "Desert Sand",
      backgroundColor: "#F8F5F0",
      colors: [
        "#D4B483",
        "#C1666B",
        "#48A9A6",
        "#4281A4",
        "#E4937A",
        "#7A9E7E",
        "#B67162"
      ]
    },
    {
      name: "Midnight Garden",
      backgroundColor: "#0a0a0a",
      colors: [
        "#957DAD",
        "#7A9E9F",
        "#B4A6AB",
        "#8A7090",
        "#A894C2",
        "#6B8E8F",
        "#C2A5B4"
      ]
    },
    {
      name: "Deep Ocean",
      backgroundColor: "#0a0a0a",
      colors: [
        "#264653",
        "#287271",
        "#2A9D8F",
        "#1A535C",
        "#2D6E7E",
        "#2A856E",
        "#1F6E8C"
      ]
    },
    {
      name: "Lavender Fields",
      backgroundColor: "#2E1760",
      colors: [
        "#9B72CF",
        "#8464B0",
        "#A584D9",
        "#7B5CA5",
        "#B89FE2",
        "#6A4C94",
        "#CAB3F5"
      ]
    },
    {
      name: "Forest Depths",
      backgroundColor: "#1E352F",
      colors: [
        "#4A7C59",
        "#3C6548",
        "#588B68",
        "#2F5241",
        "#6B9C7A",
        "#274134",
        "#7DAF8C"
      ]
    }
  ];
  
  const createWavePoints = (layer) => {
    let points = [];
    const resolution = 10;
    
    const layerHeight = p.map(
      Math.pow(layer / layerCount, 1.5),
      0, 
      1, 
      p.height * 0.2,
      p.height * 0.8
    );
    
    for (let x = -50; x <= p.width + 50; x += resolution) {
      let y = layerHeight;
      
      let mainShape = p.noise(
        x * 0.002, 
        layer * 0.3 + noiseOffset * 0.3
      ) * p.height * 0.4;
      
      let detailScale = p.map(layer, 0, layerCount, 0.02, 0.01);
      let detail = p.noise(
        x * detailScale, 
        layer * 0.5 + noiseOffset
      ) * p.height * 0.05;
      
      y -= mainShape + detail;
      
      points.push({ x, y });
    }
    
    return points;
  };

  p.setup = () => {
    const parentWidth = p.canvas.parentElement.offsetWidth;
    const parentHeight = p.canvas.parentElement.offsetHeight;
    
    p.createCanvas(parentWidth, parentHeight);
    waveGraphic = p.createGraphics(parentWidth, parentHeight);
    p.colorMode(p.HSB, 360, 100, 100, 1);
  };

  const drawWaveGradient = (points, color1, color2) => {
    waveGraphic.noStroke();

    let topOfWave = p.height;

    for (let i = 0; i < points.length; i++) {
      if (points[i].y < topOfWave) {
        topOfWave = points[i].y;
      }
    }
    
    const gradient = waveGraphic.drawingContext.createLinearGradient(
      0, topOfWave,
      0, p.height
    );
    
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.85, color2);
    gradient.addColorStop(1, color2);
    
    waveGraphic.drawingContext.fillStyle = gradient;
    
    waveGraphic.beginShape();
    waveGraphic.vertex(-50, p.height + 50);
    
    points.forEach(point => {
      waveGraphic.curveVertex(point.x, point.y);
    });
    
    waveGraphic.vertex(p.width + 50, p.height + 50);
    waveGraphic.endShape(p.CLOSE);
  };

  p.draw = () => {
    currentTheme = Math.floor((p.millis() / 5000) % themes.length);
    p.background(themes[currentTheme].backgroundColor);
    
    waveGraphic.clear();
    
    for (let layer = 0; layer < layerCount; layer++) {
      let points = createWavePoints(layer);
      
      let waveColor = themes[currentTheme].colors[layer % themes[currentTheme].colors.length];
      let backgroundColor = themes[currentTheme].backgroundColor;
      
      let waveColorWithAlpha = p.color(waveColor);
      p.drawingContext.globalAlpha = 0.6;
      
      drawWaveGradient(
        points,
        waveColorWithAlpha,
        backgroundColor
      );
    }
    
    p.image(waveGraphic, 0, 0);
    
    noiseOffset += 0.01;
  };

  p.windowResized = () => {
    const parentWidth = p.canvas.parentElement.offsetWidth;
    const parentHeight = p.canvas.parentElement.offsetHeight;
    p.resizeCanvas(parentWidth, parentHeight);
    waveGraphic = p.createGraphics(parentWidth, parentHeight);
  };
};

export default Wave; 