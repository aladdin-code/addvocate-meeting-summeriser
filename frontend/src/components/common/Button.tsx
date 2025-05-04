import React from "react";

type ButtonProps = {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  onClick,
  disabled = false,
  fullWidth = false,
  children,
  type = "button",
  className = "",
}) => {
  const baseClasses = "button rounded focus:outline-none transition-colors";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline:
      "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizeClasses = {
    small: "py-1 px-3 text-sm",
    medium: "py-2 px-4 text-base",
    large: "py-3 px-6 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const classNames = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
