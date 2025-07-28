import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useTexture, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import * as magic from "@indistinguishable-from-magic/magic-js";

// IMPORTANT: Rename this function to match the filename PascalCase
const Atmosphere = () => {
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
    onPaletteChange,
    rotationSpeed, setRotationSpeed,
    sphereScale, setSphereScale,
    bloomIntensity, setBloomIntensity,
    bloomLuminanceThreshold, setBloomLuminanceThreshold,
    bloomLuminanceSmoothing, setBloomLuminanceSmoothing,
    bloomKernelSize, setBloomKernelSize,
    bloomMipmapBlur, setBloomMipmapBlur,
    sphereColor, setSphereColor,
    fresnelPower, setFresnelPower,
    fresnelStrength, setFresnelStrength,
    particleCount, setParticleCount,
    particleSpeed, setParticleSpeed,
    ringCount, setRingCount,
    ringRotationSpeed, setRingRotationSpeed,
    isVisible, setIsVisible
  }) {
    // Debug: Track when component re-renders
    useEffect(() => {
      console.log('DebugSliders re-rendered, isVisible:', isVisible);
    });

    // Helper function to prevent event propagation
    const handleEvent = (e, callback) => {
      e.stopPropagation();
      if (callback) callback(e);
    };

    if (!isVisible) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Debug menu opening');
            setIsVisible(true);
          }}
          style={{ pointerEvents: 'auto' }}
          className="absolute bottom-4 right-4 z-[9999] bg-black/50 text-white px-3 py-1 rounded text-sm border border-white/20"
        >
          Debug Mode
        </button>
      );
    }

    return (
      <div 
        className="absolute bottom-4 right-4 z-[9999] bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-white text-sm min-w-[250px] max-h-[80vh] overflow-y-auto"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold">Atmosphere Debug</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Debug menu closing manually');
              setIsVisible(false);
            }}
            className="text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Test Button */}
          <div className="pt-2 border-t border-white/20">
            <h4 className="font-bold text-sm mb-2">🧪 Test</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Test button clicked - menu should stay open');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
            >
              Test Button (Check Console)
            </button>
          </div>

          {/* Palette Controls */}
          <div className="pt-2 border-t border-white/20">
            <h4 className="font-bold text-sm mb-2">🎨 Palette</h4>
            <div className="space-y-2">
              <div>
                <label className="block mb-1 text-xs">Show Palette Name</label>
                <input
                  type="checkbox"
                  checked={showPaletteName}
                  onChange={(e) => {
                    e.stopPropagation();
                    setShowPaletteName(e.target.checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mr-2"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs">Current: {currentPaletteName}</label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPaletteChange();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                >
                  Change Palette
                </button>
              </div>
            </div>
          </div>

          {/* Sphere Controls */}
          <div className="pt-2 border-t border-white/20">
            <h4 className="font-bold text-sm mb-2">🌍 Sphere</h4>
            <div className="space-y-2">
              <div>
                <label className="block mb-1 text-xs">Rotation Speed: {(rotationSpeed || 0).toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={rotationSpeed || 0}
                  onChange={(e) => handleEvent(e, () => setRotationSpeed(parseFloat(e.target.value)))}
                  onMouseDown={(e) => handleEvent(e)}
                  onMouseUp={(e) => handleEvent(e)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs">Scale: {(sphereScale || 1).toFixed(2)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={sphereScale || 1}
                  onChange={(e) => setSphereScale(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs">Sphere Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sphereColor || '#ffa69e'}
                    onChange={(e) => setSphereColor(e.target.value)}
                    className="w-8 h-8 rounded border border-white/20 cursor-pointer"
                  />
                  <span className="text-xs text-white/70">{sphereColor || '#ffa69e'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fresnel Controls */}
          <div className="pt-2 border-t border-white/20">
            <h4 className="font-bold text-sm mb-2">✨ Fresnel Effect</h4>
            <div className="space-y-2">
              <div>
                <label className="block mb-1 text-xs">Fresnel Power: {(fresnelPower || 2).toFixed(2)}</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={fresnelPower || 2}
                  onChange={(e) => setFresnelPower(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs">Fresnel Strength: {(fresnelStrength || 3).toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={fresnelStrength || 3}
                  onChange={(e) => setFresnelStrength(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Bloom Controls */}
          <div className="pt-2 border-t border-white/20">
            <h4 className="font-bold text-sm mb-2">🌟 Bloom</h4>
            <div className="space-y-2">
              <div>
                <label className="block mb-1 text-xs">Bloom Intensity: {(bloomIntensity || 1).toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={bloomIntensity || 1}
                  onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs">Luminance Threshold: {(bloomLuminanceThreshold || 0.1).toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={bloomLuminanceThreshold || 0.1}
                  onChange={(e) => setBloomLuminanceThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs">Luminance Smoothing: {(bloomLuminanceSmoothing || 0.9).toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={bloomLuminanceSmoothing || 0.9}
                  onChange={(e) => setBloomLuminanceSmoothing(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs">Kernel Size: {(() => {
                  switch (bloomKernelSize) {
                    case KernelSize.SMALL: return 'SMALL';
                    case KernelSize.MEDIUM: return 'MEDIUM';
                    case KernelSize.LARGE: return 'LARGE';
                    case KernelSize.HUGE: return 'HUGE';
                    case KernelSize.VERY_HUGE: return 'VERY_HUGE';
                    default: return bloomKernelSize;
                  }
                })()}</label>
                <input
                  type="range"
                  min={KernelSize.SMALL}
                  max={KernelSize.VERY_HUGE}
                  step={1}
                  value={bloomKernelSize}
                  onChange={e => setBloomKernelSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>Small</span>
                  <span>Medium</span>
                  <span>Large</span>
                  <span>Huge</span>
                  <span>Very Huge</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bloomMipmapBlur || true}
                  onChange={e => setBloomMipmapBlur(e.target.checked)}
                  id="mipmapBlurToggle"
                />
                <label htmlFor="mipmapBlurToggle" className="text-xs">Mipmap Blur</label>
              </div>
            </div>
          </div>

          {/* Particle Controls */}
          <div className="pt-2 border-t border-white/20">
            <h4 className="font-bold text-sm mb-2">✨ Particles</h4>
            <div className="space-y-2">
              <div>
                <label className="block mb-1 text-xs">Particle Count: {particleCount || 5}</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={particleCount || 5}
                  onChange={(e) => setParticleCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs">Particle Speed: {(particleSpeed || 1).toFixed(2)}</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={particleSpeed || 1}
                  onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Ring Controls */}
          <div className="pt-2 border-t border-white/20">
            <h4 className="font-bold text-sm mb-2">💫 Rings</h4>
            <div className="space-y-2">
              <div>
                <label className="block mb-1 text-xs">Ring Count: {ringCount || 3}</label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={ringCount || 3}
                  onChange={(e) => setRingCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs">Ring Rotation Speed: {(ringRotationSpeed || 0.3).toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={ringRotationSpeed || 0.3}
                  onChange={(e) => setRingRotationSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main 3D scene component
  function Scene({ 
    currentColors, 
    onCanvasClick, 
    rotationSpeed = 0.5,
    sphereScale = 1.0,
    sphereColor,
    fresnelPower = 2.0,
    fresnelStrength = 3.0,
    particleCount = 5,
    particleSpeed = 1.0,
    ringCount = 3,
    ringRotationSpeed = 0.3
  }) {
    const meshRef = useRef();
    const groupRef = useRef();
    const ringsRef = useRef();

    // Create fresnel material for the sphere
    const fresnelMaterial = useMemo(() => new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(sphereColor || currentColors[0] || '#ffa69e') },
        fresnelPower: { value: fresnelPower },
        fresnelStrength: { value: fresnelStrength },
      },
      vertexShader: `
        precision mediump float;
        precision mediump int;
        
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vec4 viewPosition = viewMatrix * worldPosition;
          vViewDirection = normalize(-viewPosition.xyz);
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        precision mediump float;
        precision mediump int;
        
        uniform vec3 color;
        uniform float fresnelPower;
        uniform float fresnelStrength;
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vViewDirection)), fresnelPower);
          float rim = clamp(fresnel * fresnelStrength, 0.0, 1.0);
          vec3 finalColor = mix(color, vec3(1.0), rim * 0.5);
          float alpha = mix(0.3, 1.0, rim);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: true,
    }), [sphereColor, currentColors, fresnelPower, fresnelStrength]);

    // Animate the atmospheric elements
    useFrame((state, delta) => {
      // Rotate the main sphere
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * rotationSpeed;
        meshRef.current.rotation.x += delta * rotationSpeed * 0.5;
      }

      // Rotate the particle group
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * particleSpeed * 0.2;
        groupRef.current.rotation.x += delta * particleSpeed * 0.1;
      }

      // Rotate the rings
      if (ringsRef.current) {
        ringsRef.current.rotation.y += delta * ringRotationSpeed;
        ringsRef.current.rotation.z += delta * ringRotationSpeed * 0.3;
      }
    });

    return (
      <>
        {/* Main rotating sphere with fresnel effect */}
        <mesh ref={meshRef} onClick={onCanvasClick} scale={sphereScale}>
          <sphereGeometry args={[3, 64, 64]} />
          <primitive object={fresnelMaterial} />
        </mesh>

        {/* Floating atmospheric particles */}
        <group ref={groupRef}>
          {currentColors.slice(1, Math.min(particleCount + 1, currentColors.length)).map((color, index) => (
            <mesh 
              key={index}
              position={[
                Math.sin(Date.now() * 0.001 * particleSpeed + index * 0.5) * 4,
                Math.cos(Date.now() * 0.002 * particleSpeed + index * 0.3) * 3,
                Math.sin(Date.now() * 0.003 * particleSpeed + index * 0.7) * 4
              ]}
            >
              <sphereGeometry args={[0.2 + Math.sin(Date.now() * 0.01 * particleSpeed + index) * 0.1, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                metalness={0.1}
                roughness={0.3}
                transparent={true}
                opacity={0.7}
              />
            </mesh>
          ))}
        </group>

        {/* Atmospheric rings */}
        <group ref={ringsRef}>
          {currentColors.slice(0, Math.min(ringCount, currentColors.length)).map((color, index) => (
            <mesh 
              key={`ring-${index}`}
              rotation={[Math.PI / 2, 0, index * Math.PI / 3]}
            >
              <ringGeometry args={[2 + index * 0.5, 2.2 + index * 0.5, 32]} />
              <meshStandardMaterial 
                color={color} 
                metalness={0.2}
                roughness={0.5}
                transparent={true}
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color={currentColors[0] || '#ffa69e'} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color={currentColors[1] || '#faf3dd'} />

        {/* Environment */}
        <Environment preset="sunset" />
      </>
    );
  }

  // State for the main component
  const [showPaletteName, setShowPaletteName] = useState(false);
  const [currentPaletteName, setCurrentPaletteName] = useState('sunset');
  const [currentColors, setCurrentColors] = useState([]);

  // Debug control states
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [sphereScale, setSphereScale] = useState(1.0);
  const [bloomIntensity, setBloomIntensity] = useState(1.0);
  const [bloomLuminanceThreshold, setBloomLuminanceThreshold] = useState(0.1);
  const [bloomLuminanceSmoothing, setBloomLuminanceSmoothing] = useState(0.9);
  const [bloomKernelSize, setBloomKernelSize] = useState(KernelSize.MEDIUM);
  const [bloomMipmapBlur, setBloomMipmapBlur] = useState(true);
  const [sphereColor, setSphereColor] = useState('#ffa69e');
  const [fresnelPower, setFresnelPower] = useState(2.0);
  const [fresnelStrength, setFresnelStrength] = useState(3.0);
  const [particleCount, setParticleCount] = useState(5);
  const [particleSpeed, setParticleSpeed] = useState(1.0);
  const [ringCount, setRingCount] = useState(3);
  const [ringRotationSpeed, setRingRotationSpeed] = useState(0.3);
  const [debugMenuVisible, setDebugMenuVisible] = useState(false);

  // Initialize with a random palette
  useEffect(() => {
    const { paletteName, paletteColors } = selectRandomPalette();
    setCurrentPaletteName(paletteName);
    setCurrentColors(paletteColors);
    setSphereColor(paletteColors[0] || '#ffa69e');
  }, []);

  const handlePaletteChange = () => {
    const { paletteName, paletteColors } = selectRandomPalette();
    setCurrentPaletteName(paletteName);
    setCurrentColors(paletteColors);
    setSphereColor(paletteColors[0] || '#ffa69e');
  };

  // Handle magic connection on click
  const handleCanvasClick = async () => {
    if (isDevMode) {
      isDevMode = false;
      if (!isMagic) {
        try {
          await magic.connect({ mesh: false, auto: true });
          console.log("Magic connected. Modules:", magic.modules);
          isMagic = true;
        } catch (error) {
          console.error("Failed to connect magic:", error);
          isDevMode = true;
          return;
        }
      }
    } else {
      console.log("3D Sketch interaction click.");
    }
  };

  return (
    <>
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
          <Scene 
            currentColors={currentColors} 
            onCanvasClick={handleCanvasClick}
            rotationSpeed={rotationSpeed}
            sphereScale={sphereScale}
            sphereColor={sphereColor}
            fresnelPower={fresnelPower}
            fresnelStrength={fresnelStrength}
            particleCount={particleCount}
            particleSpeed={particleSpeed}
            ringCount={ringCount}
            ringRotationSpeed={ringRotationSpeed}
          />
          <EffectComposer>
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={bloomLuminanceThreshold}
              luminanceSmoothing={bloomLuminanceSmoothing}
              kernelSize={bloomKernelSize}
              mipmapBlur={bloomMipmapBlur}
            />
          </EffectComposer>
        </Canvas>

        {/* Palette name overlay - Outside Canvas */}
        {showPaletteName && (
          <div className="absolute top-4 left-4 bg-white/90 text-black px-3 py-1 rounded text-sm z-10">
            Palette: {currentPaletteName}
          </div>
        )}
      </div>

      {/* Debug UI - Completely outside Canvas container */}
      <DebugSliders
        showPaletteName={showPaletteName}
        setShowPaletteName={setShowPaletteName}
        currentPaletteName={currentPaletteName}
        onPaletteChange={handlePaletteChange}
        rotationSpeed={rotationSpeed}
        setRotationSpeed={setRotationSpeed}
        sphereScale={sphereScale}
        setSphereScale={setSphereScale}
        bloomIntensity={bloomIntensity}
        setBloomIntensity={setBloomIntensity}
        bloomLuminanceThreshold={bloomLuminanceThreshold}
        setBloomLuminanceThreshold={setBloomLuminanceThreshold}
        bloomLuminanceSmoothing={bloomLuminanceSmoothing}
        setBloomLuminanceSmoothing={setBloomLuminanceSmoothing}
        bloomKernelSize={bloomKernelSize}
        setBloomKernelSize={setBloomKernelSize}
        bloomMipmapBlur={bloomMipmapBlur}
        setBloomMipmapBlur={setBloomMipmapBlur}
        sphereColor={sphereColor}
        setSphereColor={setSphereColor}
        fresnelPower={fresnelPower}
        setFresnelPower={setFresnelPower}
        fresnelStrength={fresnelStrength}
        setFresnelStrength={setFresnelStrength}
        particleCount={particleCount}
        setParticleCount={setParticleCount}
        particleSpeed={particleSpeed}
        setParticleSpeed={setParticleSpeed}
        ringCount={ringCount}
        setRingCount={setRingCount}
        ringRotationSpeed={ringRotationSpeed}
        setRingRotationSpeed={setRingRotationSpeed}
        isVisible={debugMenuVisible}
        setIsVisible={setDebugMenuVisible}
      />
    </>
  );
};

// IMPORTANT: Rename 'Atmosphere' to match the filename PascalCase
export default Atmosphere; 