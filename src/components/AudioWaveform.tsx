"use client";

import React, { useEffect, useState } from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  intensity: 'low' | 'medium' | 'high';
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isActive, intensity }) => {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setHeights(
        new Array(25).fill(0).map(() => {
          const min = intensity === 'high' ? 20 : intensity === 'medium' ? 12 : 6;
          const max = intensity === 'high' ? 70 : intensity === 'medium' ? 40 : 18;
          return Math.floor(Math.random() * (max - min) + min);
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isActive, intensity]);

  const displayHeights = isActive && heights.length === 25 ? heights : new Array(25).fill(6);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-20 w-full px-2 sm:px-4 overflow-hidden">
      {displayHeights.map((h, i) => {
        const getBarColor = () => {
          if (!isActive) return 'bg-text-disabled/20';
          if (intensity === 'high') return 'bg-danger';
          if (intensity === 'medium') return 'bg-warning';
          return 'bg-primary';
        };

        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-100 ${getBarColor()}`}
            style={{
              height: `${h}px`,
              opacity: isActive ? (i % 2 === 0 ? 0.9 : 0.6) : 0.3
            }}
          ></div>
        );
      })}
    </div>
  );
};
