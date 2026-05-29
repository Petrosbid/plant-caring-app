import React from 'react';
import { GooeyLoader } from './GooeyLoader';

interface LoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 12,
  color = '#16a34a', // Brand 600
  className,
}) => {
  return <GooeyLoader size={size} color={color} className={className} />;
};
