import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import P5Wrapper from './Components/Sketches/SketchComponent';

const sketchMap = {
  circles: {
    component: 'circles',
    displayName: 'Floating Circles'
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
  },
  sun: {
    component: 'Sun',
    displayName: 'Sun'
  },
  sunAndMoon: {
    component: 'SunAndMoon',
    displayName: 'Sun and Moon'
  },
  lenticular: {
    component: 'Lenticular',
    displayName: 'Lenticular'
  },
  blobRotation: {
    component: 'BlobRotation',
    displayName: 'Blob Rotation'
  },
  bullseye: {
    component: 'Bullseye',
    displayName: 'Bullseye'
  },
  'block': {
      component: 'Block',
      displayName: 'Block'
    },
    'snake': {
        component: 'Snake',
        displayName: 'Snake'
      },
      'gradient': {
          component: 'Gradient',
          displayName: 'Gradient'
        },
        'lightball': {
            component: 'Lightball',
            displayName: 'Lightball'
          },
          'dice': {
              component: 'Dice',
              displayName: 'Dice'
            },
            'fullScreenGradient': {
                component: 'FullScreenGradient',
                displayName: 'Fullscreengradient'
              },
              'blocks': {
                  component: 'Blocks',
                  displayName: 'Blocks'
                },
                'hearts': {
                    component: 'Hearts',
                    displayName: 'Hearts'
                  },
                  'thermalTest': {
                      component: 'ThermalTest',
                      displayName: 'Thermal Test'
                    },
                    'colorBlend': {
                        component: 'ColorBlend',
                        displayName: 'Colorblend'
                      },
                      'growthrings': {
                          component: 'Trees',
                          displayName: 'Growth Rings'
                        }
};

const SketchPage = () => {
  const { sketchName } = useParams();
  const location = useLocation();
  
  console.log('Current params:', useParams());
  console.log('Current path:', location.pathname);
  console.log('sketchName:', sketchName);
  
  const sketch = sketchMap[sketchName];

  if (!sketch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text text-xl">
          Sketch "{sketchName}" not found. Available sketches: {Object.keys(sketchMap).join(', ')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col items-center justify-center">
      {/* <h1 className="text-primary font-serif italic text-2xl mb-8">
        {sketch.displayName}
      </h1> */}
      <div className="w-full max-w-3xl mx-auto items-center justify-center aspect-[9/16]">
        <P5Wrapper sketch={sketch.component} />
      </div>
    </div>
  );
};

export default SketchPage; 