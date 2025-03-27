import React from 'react';
import { Link } from 'react-router-dom';

const sketches = [
  {
    id: 'circles',
    title: 'Interactive Circles',
    description: 'Dynamic circles that respond to mouse movement',
    instructions: 'Click and drag your mouse to create floating circles'
  },
  {
    id: 'hearts',
    title: 'Heart Patterns',
    description: 'Generative art creating unique heart-based patterns',
    instructions: 'Click anywhere to save the current pattern'
  },
  {
    id: 'wave',
    title: 'Wave',
    description: 'Interactive wave patterns',
    instructions: 'Click and drag your mouse to create waves'
  },
  {
    id: 'sketchbook',
    title: 'Sketchbook',
    description: 'Digital sketchbook experiments',
    instructions: 'Click and drag your mouse to create a sketchbook'
  },
  {
    id: 'flowfield',
    title: 'Flowfield',
    description: 'Dynamic flow field visualization',
    instructions: 'Click and drag your mouse to create a flowfield'
  },
  {
    id: 'sun',
    title: 'Sun',
    description: 'A simple sun',
    instructions: 'Click and drag your mouse to create a sun'
  },
  {
    id: 'sunAndMoon',
    title: 'Sun and Moon',
    description: 'A sun and moon',
    instructions: 'Click and drag your mouse to create a sun and moon'
  }
];

const SketchGallery = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-serif italic text-primary mb-8">Generative Sketches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sketches.map((sketch) => (
          <Link 
            key={sketch.id}
            to={`/sketches/${sketch.id}`}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <h2 className="text-xl font-serif italic text-primary mb-2">{sketch.title}</h2>
              <p className="text-text text-sm">{sketch.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SketchGallery; 