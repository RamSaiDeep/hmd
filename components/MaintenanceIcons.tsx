import React from 'react';

type MaintenanceIconProps = {
  type: string;
  className?: string;
};

export const MaintenanceIconMap: Record<string, React.ReactNode> = {
  Electrical: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <path d="M50 15 L70 45 L55 45 L75 75 L35 45 L50 45 Z" fill="currentColor" opacity="0.8"/>
      <circle cx="50" cy="50" r="50" stroke="url(#grad1)" strokeWidth="1" opacity="0.2"/>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/>
          <stop offset="100%" stopColor="#ffd700"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  Fan: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2"/>
      <g opacity="0.6">
        <path d="M50 30 Q60 40, 50 50 Q40 40, 50 30" fill="currentColor"/>
        <path d="M70 50 Q60 60, 50 50 Q60 40, 70 50" fill="currentColor"/>
        <path d="M50 70 Q40 60, 50 50 Q60 60, 50 70" fill="currentColor"/>
      </g>
    </svg>
  ),
  Light: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <circle cx="50" cy="35" r="18" fill="currentColor" opacity="0.7"/>
      <rect x="42" y="52" width="16" height="25" fill="currentColor" opacity="0.5"/>
      <line x1="40" y1="20" x2="30" y2="10" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      <line x1="60" y1="20" x2="70" y2="10" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
    </svg>
  ),
  Switch: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <rect x="30" y="40" width="40" height="20" rx="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="65" cy="50" r="8" fill="currentColor" opacity="0.7"/>
    </svg>
  ),
  Welding: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <g opacity="0.7">
        <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="3"/>
        <circle cx="50" cy="50" r="8" fill="currentColor"/>
        <path d="M45 40 L40 30 M50 40 L50 25 M55 40 L60 30" stroke="currentColor" strokeWidth="2"/>
      </g>
    </svg>
  ),
  'Metal Cutting': (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <g opacity="0.7">
        <path d="M30 60 L70 40" stroke="currentColor" strokeWidth="3"/>
        <circle cx="50" cy="50" r="6" fill="currentColor"/>
        <path d="M55 45 L65 35 M55 45 L60 35 M55 45 L65 40" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
      </g>
    </svg>
  ),
  'Wood Work': (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <g opacity="0.7">
        <rect x="25" y="35" width="50" height="30" stroke="currentColor" strokeWidth="2"/>
        <line x1="35" y1="35" x2="30" y2="25" stroke="currentColor" strokeWidth="2"/>
        <line x1="45" y1="35" x2="42" y2="22" stroke="currentColor" strokeWidth="2"/>
        <line x1="55" y1="35" x2="55" y2="22" stroke="currentColor" strokeWidth="2"/>
      </g>
    </svg>
  ),
  Other: (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <circle cx="50" cy="40" r="6" fill="currentColor"/>
      <path d="M50 50 L50 65 M40 60 L60 60" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
};

export function MaintenanceIcon({ type, className = '' }: MaintenanceIconProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {MaintenanceIconMap[type] || MaintenanceIconMap.Other}
    </div>
  );
}
