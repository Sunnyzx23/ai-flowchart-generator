import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  required = false,
  ...props
}, ref) => {
  const inputId = React.useId();

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        className={cn(
          'block w-full rounded-lg border shadow-sm transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          'placeholder:text-gray-400',
          'px-3 py-2.5',
          className
        )}
        ref={ref}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={cn(
          'mt-2 text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
