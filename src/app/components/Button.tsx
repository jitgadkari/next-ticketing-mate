import { FC } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string; // Add className prop
  disabled?: boolean;
  type?: "button" | "submit" | "reset"; // Add type prop
}

const Button: FC<ButtonProps> = ({ children, onClick, className, disabled, type = "button" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`px-4 py-2 rounded ${className} ${
        disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-700'
      }`}
    >
      {children}
    </button>
  );
};

export default Button;
