import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${
        hover ? 'hover:shadow-md hover:border-gray-300 transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}