import React from "react";

interface TextAreaInputProps {
  id?: string;
  name: string;
  value: string | number;
  placeholder?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
  required?: boolean;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  id,
  name,
  value,
  placeholder,
  error,
  onChange,
  rows = 4,
  className = "",
  required = false,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {placeholder}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${
          error ? "border-red-300" : "border-gray-300"
        }`}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default TextAreaInput;
