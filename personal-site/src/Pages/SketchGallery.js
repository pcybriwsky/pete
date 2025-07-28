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
  },
  {
    id: 'lenticular',
    title: 'Lenticular',
    description: 'A lenticular',
    instructions: 'Click and drag your mouse to create a lenticular'
  },
  {
      id: 'blobRotation',
      title: 'Blobrotation',
      description: 'A new creative sketch description.',
      instructions: 'Instructions for the new sketch.'
    },
    {
        id: 'bullseye',
        title: 'Bullseye',
        description: 'A new creative sketch description.',
        instructions: 'Instructions for the new sketch.'
      },
      {
          id: 'block',
          title: 'Block',
          description: 'A new creative sketch description.',
          instructions: 'Instructions for the new sketch.'
        },
        {
            id: 'snake',
            title: 'Snake',
            description: 'A new creative sketch description.',
            instructions: 'Instructions for the new sketch.'
          },
          {
              id: 'gradient',
              title: 'Gradient',
              description: 'A new creative sketch description.',
              instructions: 'Instructions for the new sketch.'
            },
            {
                id: 'lightball',
                title: 'Lightball',
                description: 'A new creative sketch description.',
                instructions: 'Instructions for the new sketch.'
              },
              {
                  id: 'dice',
                  title: 'Dice',
                  description: 'A new creative sketch description.',
                  instructions: 'Instructions for the new sketch.'
                },
                {
                    id: 'fullScreenGradient',
                    title: 'Fullscreengradient',
                    description: 'A new creative sketch description.',
                    instructions: 'Instructions for the new sketch.'
                  },
                  {
                      id: 'blocks',
                      title: 'Blocks',
                      description: 'A new creative sketch description.',
                      instructions: 'Instructions for the new sketch.'
                    },
                    {
                        id: 'hearts',
                        title: 'Hearts',
                        description: 'A new creative sketch description.',
                        instructions: 'Instructions for the new sketch.'
                      },
                      {
                          id: 'thermalTest',
                          title: 'Thermal Test',
                          description: 'A new creative sketch description.',
                          instructions: 'Instructions for the new sketch.'
                        },
                        {
                            id: 'colorBlend',
                            title: 'Colorblend',
                            description: 'A new creative sketch description.',
                            instructions: 'Instructions for the new sketch.'
                          },
                          {
                            id: 'growthrings',
                            title: 'Growth Rings',
                            description: 'A visualization of Substack data as generative growth rings.',
                            instructions: 'Use "R" to change palettes. Use "P" to toggle the palette name. Use "S" to save.'
                          },
                          {
                              id: 'heart2Heart',
                              title: 'Heart2heart',
                              description: 'A new creative sketch description.',
                              instructions: 'Instructions for the new sketch.'
                            },
                              {
                                  id: 'testCube',
                                  title: 'Testcube',
                                  description: 'A new creative 3D sketch description.',
                                  instructions: 'Instructions for the new 3D sketch.',
                                  type: '3d'
                                },
                                {
                                    id: 'atmosphere',
                                    title: 'Atmosphere',
                                    description: 'An atmospheric 3D environment with floating particles and rings.',
                                    instructions: 'Click to interact. Use debug mode to change palettes.',
                                    type: '3d'
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-serif italic text-primary">{sketch.title}</h2>
                {sketch.type === '3d' && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    3D
                  </span>
                )}
              </div>
              <p className="text-text text-sm">{sketch.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SketchGallery; 