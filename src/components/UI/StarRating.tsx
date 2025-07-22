import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  readonly = true,
  onRatingChange 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }, (_, index) => (
        <button
          key={index}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange?.(index + 1)}
          className={`${readonly ? '' : 'cursor-pointer hover:scale-110 transition-transform'}`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              index < rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}