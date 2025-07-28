import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useTexture, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import * as magic from "@indistinguishable-from-magic/magic-js";

// IMPORTANT: Rename this function to match the filename PascalCase
const TestCube = () => {
  let isDevMode = true; 
  let isMagic = false;
  
  // --- Sketch-specific variables and setup ---
  // Add any variables your sketch needs here
  
  // Print mode variables
  let isPrintMode = false;
  let printWidth = 1275;  // 4.25" at 300 DPI
  let printHeight = 1650; // 5.5" at 300 DPI
  let originalWidth, originalHeight;

  // Palette variables
  let paletteIndex = 0;
  let colors = [];
  let currentPalette;
  
  // Extended palette structure
  const palettes = {
    sunset: {"Melon":"ffa69e","Eggshell":"faf3dd","Celeste":"b8f2e6","Light blue":"aed9e0","Payne's gray":"5e6472"},
    forest: {"Forest Green":"2c5530","Sage":"7d9b76","Cream":"f7e1d7","Moss":"4a5759","Deep Green":"053225"},
    ocean: {"Deep Blue":"003b4f","Turquoise":"38a2ac","Aqua":"7cd7d7","Sky":"b4e7e7","Sand":"fff1d9"},
    desert: {"Terracotta":"cd5f34","Sand":"e6c79c","Dusty Rose":"d4a5a5","Sage":"9cae9c","Brown":"6e4c4b"},
    berry: {"Purple":"4a1942","Magenta":"893168","Pink":"c4547d","Light Pink":"e8a1b3","Cream":"ead7d7"},
    nordic: {"Frost":"e5e9f0","Polar":"eceff4","Arctic":"d8dee9","Glacier":"4c566a","Night":"2e3440"},
    autumn: {"Rust":"d35400","Amber":"f39c12","Gold":"f1c40f","Crimson":"c0392b","Burgundy":"7b241c"},
    spring: {"Blossom":"ffb6c1","Mint":"98ff98","Lavender":"e6e6fa","Peach":"ffdab9","Sage":"9cae9c"},
    sunset2: {"Coral":"ff7f50","Peach":"ffdab9","Lavender":"e6e6fa","Sky":"87ceeb","Night":"191970"},
    neon: {"Pink":"ff69b4","Cyan":"00ffff","Yellow":"ffff00","Purple":"9370db","Green":"32cd32"},
    pastel: {"Mint":"98ff98","Lavender":"e6e6fa","Peach":"ffdab9","Sky":"87ceeb","Rose":"ffb6c1"},
    jewel: {"Ruby":"e0115f","Sapphire":"0f52ba","Emerald":"50c878","Amethyst":"9966cc","Topaz":"ffc87c"},
    retro: {"Teal":"008080","Coral":"ff7f50","Mustard":"ffdb58","Mint":"98ff98","Lavender":"e6e6fa"},
    vintage: {"Sepia":"704214","Cream":"fffdd0","Sage":"9cae9c","Dusty Rose":"d4a5a5","Brown":"6e4c4b"},
    modern: {"Slate":"708090","Silver":"c0c0c0","Gray":"808080","Charcoal":"36454f","Black":"000000"},
    cyberpunk: {"Hot Pink":"ff007f","Electric Blue":"00eaff","Neon Yellow":"fff700","Deep Purple":"2d0036","Black":"0a0a0a"},
    noir: {"Jet":"343434","Charcoal":"232323","Ash":"bdbdbd","Ivory":"f6f6f6","Blood Red":"c3073f"},
    midnight: {"Midnight Blue":"191970","Deep Navy":"0a0a40","Steel":"7b8fa1","Moonlight":"e5e5e5","Violet":"8f00ff"},
    vaporwave: {"Vapor Pink":"ff71ce","Vapor Blue":"01cdfe","Vapor Purple":"b967ff","Vapor Yellow":"fffaa8","Vapor Black":"323232"},
    synthwave: {"Synth Pink":"ff3caa","Synth Blue":"29ffe3","Synth Orange":"ffb300","Synth Purple":"7c3cff","Synth Black":"1a1a2e"}
  };

  // Helper function to select palette by index
  const selectPaletteByIndex = (index) => {
    const paletteNames = Object.keys(palettes);
    // Ensure index stays within bounds
    if (index < 0) index = paletteNames.length - 1;
    if (index >= paletteNames.length) index = 0;
    
    const paletteName = paletteNames[index];
    const palette = palettes[paletteName];
    const paletteColors = Object.values(palette).map(c => c.startsWith('#') ? c : `#${c}`);
    return { paletteName, paletteColors, paletteIndex: index };
  };

  // Helper function to select and shuffle palette
  const selectRandomPalette = () => {
    const paletteNames = Object.keys(palettes);
    const randomIndex = Math.floor(Math.random() * paletteNames.length);
    return selectPaletteByIndex(randomIndex);
  };

  // Debug sliders component
  function DebugSliders({ 
    showPaletteName, setShowPaletteName,
    currentPaletteName,
    onPaletteChange
  }) {
    const [isVisible, setIsVisible] = useState(false);

    if (!isVisible) {
      return (
        <button
          onClick={() => setIsVisible(true)}
          className="absolute bottom-4 right-4 z-50 bg-black/50 text-white px-3 py-1 rounded text-sm border border-white/20"
        >
          Debug Mode
        </button>
      );
    }

    return (
      <div className="absolute bottom-4 right-4 z-50 bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-white text-sm min-w-[200px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold">3D Sketch Debug</span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block mb-1">Current Palette: {currentPaletteName}</label>
            <button
              onClick={onPaletteChange}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              🎨 Random Palette
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPaletteName}
              onChange={(e) => setShowPaletteName(e.target.checked)}
              id="showPaletteToggle"
            />
            <label htmlFor="showPaletteToggle" className="text-xs">Show Palette Name</label>
          </div>
        </div>
      </div>
    );
  }

  // Main 3D scene component
  function Scene({ currentColors, onCanvasClick }) {
    const meshRef = useRef();

    // Animate the mesh
    useFrame((state, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.3;
      }
    });

    return (
      <>
        {/* Main 3D object - Rotating Cube */}
        <mesh ref={meshRef} onClick={onCanvasClick}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color={currentColors[0] || '#ffa69e'} 
            metalness={0.1}
            roughness={0.2}
          />
        </mesh>

        {/* Additional floating cubes */}
        {currentColors.slice(1, 4).map((color, index) => (
          <mesh 
            key={index}
            position={[
              Math.sin(Date.now() * 0.001 + index) * 4,
              Math.cos(Date.now() * 0.001 + index) * 2,
              Math.sin(Date.now() * 0.002 + index) * 3
            ]}
          >
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial 
              color={color} 
              metalness={0.3}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Environment */}
        <Environment preset="city" />

        {/* Sparkles effect */}
        <Sparkles 
          count={50}
          scale={10}
          size={2}
          speed={0.3}
          color={currentColors[0] || '#ffa69e'}
        />
      </>
    );
  }

  // State for the main component
  const [showPaletteName, setShowPaletteName] = useState(false);
  const [currentPaletteName, setCurrentPaletteName] = useState('sunset');
  const [currentColors, setCurrentColors] = useState([]);

  // Initialize with a random palette
  useEffect(() => {
    const { paletteName, paletteColors } = selectRandomPalette();
    setCurrentPaletteName(paletteName);
    setCurrentColors(paletteColors);
  }, []);

  const handlePaletteChange = () => {
    const { paletteName, paletteColors } = selectRandomPalette();
    setCurrentPaletteName(paletteName);
    setCurrentColors(paletteColors);
  };

  // Handle magic connection on click
  const handleCanvasClick = async () => {
    // if (isDevMode) {
    //   isDevMode = false;
    //   if (!isMagic) {
    //     try {
    //       await magic.connect({ mesh: false, auto: true });
    //       console.log("Magic connected. Modules:", magic.modules);
    //       isMagic = true;
    //     } catch (error) {
    //       console.error("Failed to connect magic:", error);
    //       isDevMode = true;
    //       return;
    //     }
    //   }
    // } else {
    //   console.log("3D Sketch interaction click.");
    // }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ width: '100vw', height: '100vh', display: 'block' }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: 'default'
        }}
      >
        <Scene currentColors={currentColors} onCanvasClick={handleCanvasClick} />
        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            kernelSize={KernelSize.MEDIUM}
          />
        </EffectComposer>
      </Canvas>

      {/* Debug UI - Outside Canvas */}
      <DebugSliders
        showPaletteName={showPaletteName}
        setShowPaletteName={setShowPaletteName}
        currentPaletteName={currentPaletteName}
        onPaletteChange={handlePaletteChange}
      />

      {/* Palette name overlay - Outside Canvas */}
      {showPaletteName && (
        <div className="absolute top-4 left-4 bg-white/90 text-black px-3 py-1 rounded text-sm z-10">
          Palette: {currentPaletteName}
        </div>
      )}
    </div>
  );
};

// IMPORTANT: Rename 'TestCube' to match the filename PascalCase
export default TestCube; 