import React from 'react';

interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${checked 
            ? 'bg-primary' 
            : 'bg-gray-200'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : ''
          }
        `}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={`ml-3 text-sm font-medium text-text-muted ${
            disabled ? 'opacity-50' : 'cursor-pointer'
          }`}
          onClick={!disabled ? handleToggle : undefined}
        >
          {label}
        </label>
      )}
    </div>
  );
};
