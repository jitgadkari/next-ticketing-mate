import React from 'react';
import Select, { MultiValue } from 'react-select';

export interface MultiSelectOption {
  label: string;
  value: string;
  id?: string;
  placeholder?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: MultiSelectOption[];
  onChange: (selected: MultiValue<MultiSelectOption>) => void;
  onInputChange?: (inputValue: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  labelledBy?: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  onInputChange,
  placeholder,
  isDisabled,
  labelledBy,
  className 
}) => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      <Select
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        onInputChange={onInputChange}
        placeholder={placeholder}
        isDisabled={isDisabled}
        aria-labelledby={labelledBy}
        className="basic-multi-select"
        classNamePrefix="select"
      />
    </div>
  );
};

export default MultiSelect;
