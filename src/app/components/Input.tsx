import React from 'react';

interface InputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;  // New prop for textarea height
}

const Input: React.FC<InputProps> = ({ label, type, name, value, onChange, required, rows = 10 }) => {
  return (
    <div className="mb-4">
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
        />
      )}
    </div>
  );
};

export default Input;