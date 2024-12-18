import React from 'react';
import { useParams } from 'react-router-dom';
import P5Wrapper from './Components/Sketches/SketchComponent';

const sketchMap = {
  landscape: {
    component: 'Landscape',
    displayName: 'Landscape Generator'
  },
  circles: {
    component: 'Circles',
    displayName: 'Interactive Circles'
  },
  hearts: {
    component: 'Hearts',
    displayName: 'Heart Patterns'
  },
  wave: {
    component: 'Wave',
    displayName: 'Wave'
  },
  sketchbook: {
    component: 'Sketchbook',
    displayName: 'Sketchbook'
  },
  flowfield: {
    component: 'Flowfield',
    displayName: 'Flowfield'
  }
};

const SketchPage = () => {
  const { sketchName } = useParams();
  const sketch = sketchMap[sketchName];

  if (!sketch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text text-xl">Sketch not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <h1 className="text-primary font-serif italic text-2xl mb-8">
        {sketch.displayName}
      </h1>
      <div className="w-full max-w-3xl mx-auto items-center justify-center aspect-[9/16]">
        <P5Wrapper sketch={sketch.component} />
      </div>
    </div>
  );
};

export default SketchPage; 