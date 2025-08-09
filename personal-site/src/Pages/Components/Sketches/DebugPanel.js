import React, { useState, useEffect } from 'react';

const DebugPanel = ({ 
  isVisible = false, 
  onToggle, 
  controls = {}, 
  onControlChange,
  title = "Debug Panel"
}) => {
  const [localControls, setLocalControls] = useState(controls);

  useEffect(() => {
    setLocalControls(controls);
  }, [controls]);

  const handleSliderChange = (key, value) => {
    const newControls = { 
      ...localControls, 
      [key]: { 
        ...localControls[key], 
        value: value 
      } 
    };
    setLocalControls(newControls);
    if (onControlChange) {
      onControlChange(newControls);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg border border-white/20 max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold">{title}</h3>
        <button 
          onClick={onToggle}
          className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
        >
          Hide
        </button>
      </div>
      
      <div className="space-y-3">
        {Object.entries(localControls).map(([key, control]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{control.label || key}</span>
              <span>{control.value?.toFixed(control.precision || 2)}</span>
            </div>
            <input
              type="range"
              min={control.min || 0}
              max={control.max || 1}
              step={control.step || 0.01}
              value={control.value || 0}
              onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugPanel; 