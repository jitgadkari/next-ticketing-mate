import React from 'react';
import Select, { MultiValue } from 'react-select';

export interface MultiSelectOption {
  label: string;
  value: string;
  id?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: MultiSelectOption[];
  onChange: (selected: MultiValue<MultiSelectOption>) => void;
  onInputChange?: (inputValue: string) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, onInputChange }) => {
  return (
    <div className="mb-4">
      <Select
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        onInputChange={onInputChange}
        className="basic-multi-select"
        classNamePrefix="select"
      />
    </div>
  );
};

export default MultiSelect;
