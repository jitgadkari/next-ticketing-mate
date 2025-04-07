import React from "react";
import Select, { MultiValue } from "react-select";

export interface MultiSelectOption {
  label: string;
  value: string;
  id?: string;
  placeholder?: string;
  match_score?: number;
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
  matchScore?: number;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  onInputChange,
  placeholder,
  isDisabled,
  labelledBy,
  className,
  matchScore,
}) => {
  return (
    <div className={`mb-4 ${className || ""}`}>
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
        formatOptionLabel={(option) => (
          <div
            className={`flex items-center ${
              option.match_score && option.match_score > 0 ? "text-green-600 font-medium" : ""
            }`}
          >
            <span>{option.label}</span>
          </div>
        )}
      />
    </div>
  );
};

export default MultiSelect;
