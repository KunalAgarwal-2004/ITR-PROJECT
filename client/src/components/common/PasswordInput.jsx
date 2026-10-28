import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = ({
  label,
  id,
  placeholder = '••••••••',
  value,
  onChange,
  error,
  helperText,
  required = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-content-primary">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-3.5 pr-10 py-2 text-sm text-content-primary bg-surface-white border rounded-md transition-colors placeholder:text-content-subtle focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-content-subtle hover:text-content-primary focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-content-muted">{helperText}</span>}
    </div>
  );
};

export default PasswordInput;
