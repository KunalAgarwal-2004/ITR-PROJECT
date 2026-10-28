import React from 'react';

const VARIANTS = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white border border-transparent shadow-subtle',
  secondary: 'bg-white hover:bg-gray-50 text-content-primary border border-border shadow-subtle',
  outline: 'bg-transparent hover:bg-brand-50 text-brand-500 border border-brand-500',
  ghost: 'bg-transparent hover:bg-gray-100 text-content-primary border border-transparent'
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-sm',
  md: 'px-4 py-2 text-sm font-medium rounded-md',
  lg: 'px-5 py-2.5 text-base font-medium rounded-md'
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
