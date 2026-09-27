import React from 'react';

interface SquircleProps {
  children?: React.ReactNode;
  size?: number | string;
  className?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Superellipse Squircle component implementing continuous corner curvature (~60% smoothing)
 * Used consistently for app icons, category icons, and action buttons.
 */
export const Squircle: React.FC<SquircleProps> = ({
  children,
  size = 48,
  className = '',
  backgroundColor = 'transparent',
  borderColor = 'transparent',
  borderWidth = 0,
  onClick,
  style = {},
}) => {
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : { width: size, height: size };

  return (
    <div
      onClick={onClick}
      style={{
        ...sizeStyle,
        backgroundColor,
        borderColor: borderWidth > 0 ? borderColor : undefined,
        borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
        borderStyle: borderWidth > 0 ? 'solid' : undefined,
        borderRadius: '26%',
        ...style,
      }}
      className={`relative inline-flex items-center justify-center overflow-hidden transition-transform active:scale-95 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
