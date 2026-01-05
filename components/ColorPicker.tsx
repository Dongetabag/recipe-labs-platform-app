

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// --- Color Conversion Utilities ---
const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToRgb = (h: number, s: number, v: number) => {
  s /= 100; v /= 100;
  const i = Math.floor((h / 360) * 6);
  const f = (h / 360) * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r=0, g=0, b=0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

interface ColorPickerProps {
  color: string;
  onChange: (newColor: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  // Fix: De-structure RGB values before passing to rgbToHsv to fix spread argument error.
  const [hsv, setHsv] = useState(() => {
    const { r, g, b } = hexToRgb(color);
    return rgbToHsv(r, g, b);
  });
  const [inputValue, setInputValue] = useState(color);
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const hexColor = useMemo(() => {
    const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
    // Fix: Although not strictly an error in the provided code, this is the correct pattern.
    return rgbToHex(r, g, b);
  }, [hsv]);

  useEffect(() => {
    // Fix: De-structure RGB values before passing to rgbToHex to fix spread argument error.
    const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
    const newHex = rgbToHex(r, g, b);
    if (newHex.toLowerCase() !== color.toLowerCase()) {
      onChange(newHex);
      setInputValue(newHex);
    }
  }, [hsv, onChange, color]);

  useEffect(() => {
      // Fix: De-structure RGB values before passing to functions to fix spread argument errors.
      const { r: currentR, g: currentG, b: currentB } = hsvToRgb(hsv.h, hsv.s, hsv.v);
      const newHex = rgbToHex(currentR, currentG, currentB);
      if(color.toLowerCase() !== newHex.toLowerCase()) {
          const { r, g, b } = hexToRgb(color);
          setHsv(rgbToHsv(r, g, b));
          setInputValue(color);
      }
  }, [color, hsv]);

  const handleSaturationValueChange = useCallback((e: MouseEvent) => {
    if (!saturationRef.current) return;
    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setHsv(prev => ({ ...prev, s: (x / rect.width) * 100, v: 100 - (y / rect.height) * 100 }));
  }, []);

  const handleHueChange = useCallback((e: MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHsv(prev => ({ ...prev, h: (x / rect.width) * 360 }));
  }, []);
  
  const createDragHandler = (handler: (e: MouseEvent) => void) => (e: React.MouseEvent) => {
      e.preventDefault();
      handler(e as any); // Initial call
      const onMouseMove = (moveEvent: MouseEvent) => handler(moveEvent);
      const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setInputValue(newHex);
    if (/^#[0-9A-F]{6}$/i.test(newHex) || /^#[0-9A-F]{3}$/i.test(newHex)) {
      // Fix: De-structure RGB values before passing to rgbToHsv to fix spread argument error.
      const { r, g, b } = hexToRgb(newHex);
      setHsv(rgbToHsv(r, g, b));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-white/10 p-4 w-64 shadow-2xl space-y-3 rounded-xl">
      <div
        ref={saturationRef}
        onMouseDown={createDragHandler(handleSaturationValueChange)}
        className="w-full h-40 cursor-pointer relative rounded-md overflow-hidden"
        style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div
          className="w-4 h-4 rounded-full border-2 border-white absolute shadow-md transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: hexColor }}
        />
      </div>
      <div
        ref={hueRef}
        onMouseDown={createDragHandler(handleHueChange)}
        className="w-full h-4 cursor-pointer relative rounded-full"
        style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white absolute shadow-md transform -translate-x-1/2 -translate-y-[calc(50%-2px)]"
          style={{ left: `${(hsv.h / 360) * 100}%` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 flex-shrink-0 border-2 border-gray-200 dark:border-white/10 rounded-md" style={{ backgroundColor: hexColor }} />
        <input
          type="text"
          value={inputValue.toUpperCase()}
          onChange={handleInputChange}
          className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 py-1.5 px-2 text-gray-900 dark:text-white font-mono tracking-wider text-sm rounded-md transition-all duration-200 focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
        />
      </div>
    </div>
  );
};

export default ColorPicker;