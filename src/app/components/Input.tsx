import React from 'react';
import { Placeholder } from 'react-select/animated';

interface InputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;  // New prop for textarea height
  placeholder?:string
}

const Input: React.FC<InputProps> = ({ label, type, name, value, onChange, required, rows = 10,placeholder }) => {
  return (
    <div className="mb-3">
      <label className="block text-gray-700 mb-2">{label}</label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded mt-1"
          required={required}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded mt-1"
          required={required}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default Input;