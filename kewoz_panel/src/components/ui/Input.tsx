import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      helperText,
      error,
      leftElement,
      rightElement,
      containerClassName,
      id: propId,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const inputId = propId || `input-${id}`;
    const hasError = Boolean(error);

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftElement}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              'flex h-10 w-full rounded-md border bg-secondary px-3 py-2 text-sm text-text-muted ring-offset-white transition-colors',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-gray-400 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftElement ? 'pl-10' : 'pl-3',
              rightElement ? 'pr-10' : 'pr-3',
              hasError
                ? 'border-red-500 focus-visible:ring-red-200'
                : 'border-gray-300 ',
              className
            )}
            ref={ref}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightElement}
            </div>
          )}
        </div>
        {helperText && !hasError && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
        {hasError && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
