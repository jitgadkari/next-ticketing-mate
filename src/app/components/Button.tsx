import { FC } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string; // Add className prop
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({ children, onClick, className, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${className} ${
        disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'
      }`}
    >
      {children}
    </button>
  );
};

export default Button;
