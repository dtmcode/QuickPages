'use client';

import * as React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className = '' }: ProgressProps) {
  const getColor = () => {
    if (value >= 90) return 'bg-red-600';
    if (value >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${getColor()} transition-all duration-300`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}