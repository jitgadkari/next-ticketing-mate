import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, type = "button", className, children }) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`p-2 bg-blue-500 text-white rounded hover:bg-blue-700 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
