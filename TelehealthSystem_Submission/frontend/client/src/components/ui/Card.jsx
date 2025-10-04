// src/pages/components/ui/card.jsx
import React from 'react';
import classNames from 'classnames';

export const Card = ({ className = '', children, ...props }) => {
  return (
    <div
      className={classNames(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ className = '', children, ...props }) => {
  return (
    <div
      className={classNames('p-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};