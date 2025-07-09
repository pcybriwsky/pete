import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import P5Wrapper from './Components/Sketches/SketchComponent';
import { useEffect } from 'react';

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

  useEffect(() => {
    const handler = async () => {
      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function'
      ) {
        try {
          const motion = await DeviceMotionEvent.requestPermission();
          const orient = await DeviceOrientationEvent.requestPermission();
          alert(
            'DeviceMotionEvent: ' +
              motion +
              '\nDeviceOrientationEvent: ' +
              orient
          );
          if (motion === 'granted' || orient === 'granted') {
            window.addEventListener(
              'deviceorientation',
              (e) => {
                alert(
                  'Orientation event received!\n' +
                    JSON.stringify(e, null, 2)
                );
              },
              { once: true }
            );
          }
        } catch (err) {
          alert('Error requesting permission: ' + err);
        }
      } else {
        alert('requestPermission not supported on this device/browser.');
      }
    };
    const btn = document.getElementById('test-motion-btn');
    if (btn) btn.addEventListener('click', handler);
    return () => {
      if (btn) btn.removeEventListener('click', handler);
    };
  }, []);

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
      {/* Add the test button */}
      <button
        id="test-motion-btn"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          padding: "12px 24px",
          fontSize: "16px",
          borderRadius: "8px",
          background: "#fff",
          border: "1px solid #ccc",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        Test Motion Permission
      </button>
    </div>
  );
};

export default SketchPage; 