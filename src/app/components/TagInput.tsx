import React, { ChangeEvent, KeyboardEvent } from 'react';

interface TagInputProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const TagInput: React.FC<TagInputProps> = ({ label, name, value, placeholder, onChange, onKeyDown }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="mt-1 block w-full"
      />
    </div>
  );
};

export default TagInput;
