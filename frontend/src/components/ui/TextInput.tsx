import { LucideIcon } from "lucide-react";
import React from "react";

interface TextInputProps {
  id?: string; // optional now
  name: string;
  type?: string;
  value: string | number;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  className?: string;
  required?: boolean; // optional now
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  type = "text",
  value,
  placeholder,
  icon: Icon,
  error,
  onChange,
  autoComplete,
  className = "",
  required = false, // default false
}) => {
  const inputId = id || name; // fallback to name

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {placeholder}
      </label>
      <div className="mt-1 relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${
            error ? "border-red-300" : "border-gray-300"
          }`}
          required={required}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default TextInput;
