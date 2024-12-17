import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import circles from './Circles';
import Hearts from './Hearts';
import Landscape from './Landscape';
import Wave from './Wave';

const sketchMap = {
  circles,
  Hearts,
  Wave
};

const P5Wrapper = ({ sketch }) => {
  const sketchRef = useRef();

  useEffect(() => {
    // Get the correct sketch from the map
    const selectedSketch = sketchMap[sketch];
    if (!selectedSketch) return;

    // Create a new p5 instance and attach it to the ref's current element
    const p5Instance = new p5(selectedSketch, sketchRef.current);

    // Cleanup function to remove the p5 instance on component unmount
    return () => {
      p5Instance.remove();
    };
  }, [sketch]);

  return <div ref={sketchRef} className="w-full h-[400px] flex items-center justify-center" />;
};

export default P5Wrapper;
