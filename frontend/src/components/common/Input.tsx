import React, { InputHTMLAttributes, forwardRef, useState } from "react";

type InputType = "text" | "password" | "email";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  type?: InputType;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      icon,
      className = "",
      type = "text",
      showPasswordToggle = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const actualType = type === "password" && showPassword ? "text" : type;

    const inputClasses = `
      px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
      transition-all ${
        error
          ? "border-red-500 focus:ring-red-200"
          : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
      }
      ${fullWidth ? "w-full" : ""}
      ${icon || (type === "password" && showPasswordToggle) ? "pl-10" : ""}
      ${className}
    `;

    return (
      <div className={`${fullWidth ? "w-full" : ""} mb-4`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClasses}
            type={actualType}
            {...props}
          />

          {type === "password" && showPasswordToggle && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <span className="material-icons text-sm">visibility_off</span>
              ) : (
                <span className="material-icons text-sm">visibility</span>
              )}
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
