import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import P5Wrapper from './Components/Sketches/SketchComponent';
import Sketch3DWrapper from './Components/Sketches/Sketch3DComponent';
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
                        },
                        'heart2Heart': {
                            component: 'Heart2Heart',
                            displayName: 'Heart2heart'
                          },
                            'testCube': {
                                component: 'TestCube',
                                displayName: 'Testcube',
                                type: '3d'
                              },
                              'atmosphere': {
                                  component: 'Atmosphere',
                                  displayName: 'Atmosphere',
                                  type: '3d'
                                }
};

const SketchPage = () => {
  const { sketchName } = useParams();
  const location = useLocation();
  
  console.log('Current params:', useParams());
  console.log('Current path:', location.pathname);
  console.log('sketchName:', sketchName);
  
  const sketch = sketchMap[sketchName];

  // Handler for the native test button, attached in useEffect
  useEffect(() => {
    const btn = document.getElementById("native-motion-btn");
    if (!btn) return;
    const handler = async () => {
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        try {
          const motion = await DeviceMotionEvent.requestPermission();
          const orient = await DeviceOrientationEvent.requestPermission();
          alert(
            "DeviceMotionEvent: " +
              motion +
              "\nDeviceOrientationEvent: " +
              orient
          );
          if (motion === "granted" || orient === "granted") {
            window.addEventListener(
              "deviceorientation",
              (e) => {
                alert(
                  "Orientation event received!\n" +
                    JSON.stringify(e, null, 2)
                );
              },
              { once: true }
            );
          }
        } catch (err) {
          alert("Error requesting permission: " + err);
        }
      } else {
        alert("requestPermission not supported on this device/browser.");
      }
    };
    btn.addEventListener("click", handler);
    btn.addEventListener("touchstart", handler);
    return () => {
      btn.removeEventListener("click", handler);
      btn.removeEventListener("touchstart", handler);
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
        {sketch.type === '3d' ? (
          <Sketch3DWrapper sketch={sketch.component} />
        ) : (
          <P5Wrapper sketch={sketch.component} />
        )}
      </div>
      {/* Add the native test button using dangerouslySetInnerHTML */}
      <div
        id="native-motion-btn-container"
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{
          __html: `
            <button id="native-motion-btn"
              style="
                position:fixed;
                bottom:80px;
                left:50%;
                transform:translateX(-50%);
                z-index:99999;
                pointer-events:auto;
                padding:12px 24px;
                font-size:16px;
                border-radius:8px;
                background:#fff;
                border:1px solid #ccc;
                box-shadow:0 2px 8px rgba(0,0,0,0.08);
              ">
              Native Test Motion Permission
            </button>
          `
        }}
      />
    </div>
  );
};

export default SketchPage; 