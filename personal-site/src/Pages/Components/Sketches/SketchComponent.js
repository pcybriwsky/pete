import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import DebugPanel from './DebugPanel';
import circles from './Circles';
import Landscape from './Landscape';
import Wave from './Wave';
import Sketchbook from './Sketchbook';
import Flowfield from './Flowfield';
import Sun from './SimpleSun';
import SunAndMoon from './SunAndMoon';
import Lenticular from './Lenticular';
import Atmosphere2 from './Atmosphere2';
import Heart2Heart from './Heart2Heart';
import Trees from './Trees';
import ColorBlend from './ColorBlend';
import ThermalTest from './ThermalTest';
import Hearts from './Hearts';
import Blocks from './Blocks';
import FullScreenGradient from './FullScreenGradient';
import Dice from './Dice';
import Lightball from './Lightball';
import Gradient from './Gradient';
import Snake from './Snake';
import Block from './Block';
import Bullseye from './Bullseye';
import BlobRotation from './BlobRotation';
import Atmosphere from './Atmosphere';

const sketchMap = {
  Blocks,
  circles,
  Wave,
  Sketchbook,
  Flowfield,
  Sun,
  SunAndMoon,
  Lenticular,
  BlobRotation,
  Bullseye,
  Block,
  Snake,
  Gradient,
  Lightball,
  Dice,
  FullScreenGradient,
  Blocks,
  Hearts,
  ThermalTest,
  ColorBlend,
  Trees,
  Heart2Heart,
  Atmosphere,
  Atmosphere2
};

const P5Wrapper = ({ sketch }) => {
  const sketchRef = useRef();
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [debugControls, setDebugControls] = useState({});
  const [p5Instance, setP5Instance] = useState(null);

  useEffect(() => {
    // Get the correct sketch from the map
    const selectedSketch = sketchMap[sketch];
    if (!selectedSketch) return;

    // Create a new p5 instance and attach it to the ref's current element
    const instance = new p5(selectedSketch, sketchRef.current);
    setP5Instance(instance);

    // Cleanup function to remove the p5 instance on component unmount
    return () => {
      instance.remove();
      setP5Instance(null);
    };
  }, [sketch]);

  // Handle debug control changes
  const handleDebugControlChange = (newControls) => {
    setDebugControls(newControls);
    // Pass control changes to p5 instance if it has a debugUpdate method
    if (p5Instance && p5Instance.debugUpdate) {
      p5Instance.debugUpdate(newControls);
    }
  };

  // Toggle debug panel
  const toggleDebug = () => {
    setIsDebugVisible(!isDebugVisible);
  };

  // Set up debug controls for specific sketches
  useEffect(() => {
    if (sketch === 'Atmosphere2') {
      setDebugControls({
        light: { label: 'Light', value: 0.5, min: 0, max: 1, step: 0.01, precision: 2 },
        humidity: { label: 'Humidity', value: 0.5, min: 0, max: 1, step: 0.01, precision: 2 },
        pressure: { label: 'Pressure', value: 0.5, min: 0, max: 1, step: 0.01, precision: 2 },
        aqi: { label: 'AQI', value: 0.5, min: 0, max: 1, step: 0.01, precision: 2 },
        temperature: { label: 'Temperature', value: 0.5, min: 0, max: 1, step: 0.01, precision: 2 },
        co2: { label: 'CO2', value: 0.5, min: 0, max: 1, step: 0.01, precision: 2 },
        animationSpeed: { label: 'Animation Speed', value: 0.05, min: 0, max: 0.2, step: 0.001, precision: 3 },
        gradientRadius: { label: 'Gradient Radius', value: 0.5, min: 0.1, max: 1, step: 0.01, precision: 2 }
      });
    }
  }, [sketch]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div ref={sketchRef} className="absolute inset-0 w-full h-full" style={{ margin: 0, padding: 0 }} />
      
      {/* Debug toggle button */}
      <button
        onClick={toggleDebug}
        className="fixed top-4 right-4 z-40 bg-black/60 text-white px-3 py-2 rounded-lg border border-white/20 hover:bg-black/80 transition-colors"
      >
        Debug
      </button>
      
      {/* Debug Panel */}
      <DebugPanel
        isVisible={isDebugVisible}
        onToggle={toggleDebug}
        controls={debugControls}
        onControlChange={handleDebugControlChange}
        title={`${sketch} Debug`}
      />
    </div>
  );
};

export default P5Wrapper;
