import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
