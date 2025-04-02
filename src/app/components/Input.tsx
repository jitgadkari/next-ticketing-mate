import React from 'react';
import { Placeholder } from 'react-select/animated';

interface InputProps {
  label: string;
  type: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;  // New prop for textarea height
  placeholder?: string;
  disabled?: boolean;
  className?: string;  // Add className prop
}

const Input: React.FC<InputProps> = ({ 
  label, 
  type, 
  name, 
  value, 
  onChange, 
  required, 
  rows = 10,
  placeholder, 
  disabled,
  className 
}) => {
  return (
    <div className="mb-3">
      <label className="block text-gray-700 mb-2">{label}</label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
        />
      )}
    </div>
  );
};

export default Input;