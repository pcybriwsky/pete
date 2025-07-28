import React from 'react';

// Import all 3D sketches here
import Atmosphere from './Atmosphere';
import TestCube from './TestCube';
// Example: import My3DSketch from './My3DSketch';

const sketch3DMap = {
  // Add 3D sketches to this map
  // Example: My3DSketch,
  TestCube,
  Atmosphere
};

const Sketch3DWrapper = ({ sketch }) => {
  // Get the correct 3D sketch from the map
  const SelectedSketch = sketch3DMap[sketch];
  
  if (!SelectedSketch) {
    console.warn(`3D Sketch '${sketch}' not found in sketch3DMap`);
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">3D Sketch Not Found</h3>
          <p className="text-gray-500">The sketch '{sketch}' could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <SelectedSketch />
    </div>
  );
};

export default Sketch3DWrapper; 