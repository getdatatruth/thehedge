'use client';

import { Heart } from 'lucide-react';
import { useFavouritesStore } from '@/stores/favourites';
import { useCallback, useState } from 'react';

interface FavouriteButtonProps {
  activityId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FavouriteButton({ activityId, size = 'md', className = '' }: FavouriteButtonProps) {
  const { toggleFavourite, isFavourite } = useFavouritesStore();
  const favourited = isFavourite(activityId);
  const [animating, setAnimating] = useState(false);

  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setAnimating(true);
      toggleFavourite(activityId);
      setTimeout(() => setAnimating(false), 300);
    },
    [activityId, toggleFavourite]
  );

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center rounded-full
        transition-all duration-200 ease-out
        ${
          favourited
            ? 'bg-terracotta/10 hover:bg-terracotta/20'
            : 'bg-parchment/80 hover:bg-linen border border-stone/40 hover:border-stone'
        }
        ${animating ? 'scale-125' : 'scale-100'}
        ${className}
      `}
      aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
    >
      <Heart
        className={`
          ${iconSizes[size]}
          transition-all duration-200
          ${
            favourited
              ? 'text-terracotta fill-terracotta'
              : 'text-clay/40 hover:text-clay/60'
          }
          ${animating ? 'scale-110' : 'scale-100'}
        `}
      />
    </button>
  );
}
