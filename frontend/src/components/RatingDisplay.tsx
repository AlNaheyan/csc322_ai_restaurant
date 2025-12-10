import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  totalRatings?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingDisplay({
  rating,
  totalRatings = 0,
  showCount = true,
  size = 'md'
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const displayRating = parseFloat(rating.toFixed(2));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(displayRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className={`${textSizeClasses[size]} font-medium text-gray-700`}>
        {displayRating.toFixed(1)}
      </span>
      {showCount && totalRatings > 0 && (
        <span className={`${textSizeClasses[size]} text-gray-500`}>
          ({totalRatings})
        </span>
      )}
    </div>
  );
}
