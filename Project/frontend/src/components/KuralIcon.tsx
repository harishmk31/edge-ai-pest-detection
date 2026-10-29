import React from 'react';

interface KuralIconProps {
  className?: string;
  size?: number;
}

export const KuralIcon: React.FC<KuralIconProps> = ({ className = 'w-5 h-5', size }) => {
  const sizeProps = size ? { width: size, height: size } : {};

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...sizeProps}
      aria-hidden="true"
    >
      {/* Speech Bubble outline */}
      <path
        d="M21 11.5C21 16.1944 16.9706 20 12 20C10.4284 20 8.94827 19.6174 7.66986 18.9412L3 20L4.23746 16.2876C3.4566 14.8876 3 13.2562 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central Sprout Stem */}
      <path
        d="M12 16V10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left Leaf */}
      <path
        d="M12 12.5C9.8 12.5 8.5 10.5 9 8.5C11 8.5 12 10 12 12.5Z"
        fill="currentColor"
        fillOpacity="0.85"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Right Leaf */}
      <path
        d="M12 10.5C14.2 10.5 15.5 8.5 15 6.5C13 6.5 12 8 12 10.5Z"
        fill="currentColor"
        fillOpacity="0.9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
};
