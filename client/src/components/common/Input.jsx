import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-content-primary">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3.5 py-2 text-sm text-content-primary bg-surface-white border rounded-md transition-colors placeholder:text-content-subtle focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-content-muted">{helperText}</span>}
    </div>
  );
};

export default Input;
