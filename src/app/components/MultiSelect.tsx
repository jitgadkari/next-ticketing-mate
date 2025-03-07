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
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange }) => {
  return (
    <div className="mb-4">
      <Select
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        className="basic-multi-select"
        classNamePrefix="select"
      />
    </div>
  );
};

export default MultiSelect;
