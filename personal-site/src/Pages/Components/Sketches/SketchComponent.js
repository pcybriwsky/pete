import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import circles from './Circles';
import Landscape from './Landscape';
import Wave from './Wave';
import Sketchbook from './Sketchbook';
import Flowfield from './Flowfield';
import Sun from './SimpleSun';
import SunAndMoon from './SunAndMoon';
import Lenticular from './Lenticular';
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
  Trees
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

  return <div ref={sketchRef} className="w-full h-[full] flex items-center justify-center" />;
};

export default P5Wrapper;
