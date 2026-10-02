import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleColorBarClick = () => {
    setIsOpen(!isOpen);
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium  mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-3">
        <div
          className="w-full h-10 rounded-lg border-2 border-gray-300 cursor-pointer relative overflow-hidden"
          onClick={handleColorBarClick}
          style={{ backgroundColor: value }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-medium drop-shadow-md">
              {value}
            </span>
          </div>
        </div>
        <input
          ref={colorInputRef}
          type="color"
          value={value}
          onChange={handleColorChange}
          className="opacity-0 absolute pointer-events-none"
        />
      </div>
    </div>
  );
};
