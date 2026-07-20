"use client";

import React, { useEffect, useState } from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  intensity: 'low' | 'medium' | 'high';
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isActive, intensity }) => {
  const [heights, setHeights] = useState<number[]>(new Array(25).fill(10));

  useEffect(() => {
    if (!isActive) {
      setHeights(new Array(25).fill(6));
      return;
    }

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

  return (
    <div className="flex items-center justify-center gap-1.5 h-20 w-full px-4 overflow-hidden">
      {heights.map((h, i) => {
        const getBarColor = () => {
          if (!isActive) return 'bg-white/10';
          if (intensity === 'high') {
            return i % 2 === 0 ? 'bg-red-500' : 'bg-rose-400';
          }
          if (intensity === 'medium') {
            return i % 2 === 0 ? 'bg-amber-500' : 'bg-yellow-400';
          }
          return i % 2 === 0 ? 'bg-cyan-500' : 'bg-teal-400';
        };

        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-100 ${getBarColor()}`}
            style={{
              height: `${h}px`,
              opacity: isActive ? 0.9 : 0.3
            }}
          ></div>
        );
      })}
    </div>
  );
};
