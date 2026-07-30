'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { HeroSlide } from '../lib/heroSlides';

type Props = {
  slides: HeroSlide[];
  intervalMs?: number;
  className?: string;
  overlayClassName?: string;
  /** Si true, les images sont en priority (hero LCP) */
  priority?: boolean;
  showDots?: boolean;
  /** Hint Next/Image pour le responsive (ex. 100vw, 42vw) */
  sizes?: string;
};

export default function HeroCarousel({
  slides,
  intervalMs = 5000,
  className = '',
  overlayClassName = 'absolute inset-0 bg-[#00377D]/60 md:bg-[#00377D]/40',
  priority = false,
  showDots = true,
  sizes = '(max-width: 1024px) 100vw, 50vw',
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, paused]);

  if (count === 0) return null;

  return (
    <div
      className={`relative h-full w-full min-h-[8rem] overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={`${slide.src}-${i}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={priority && i === 0}
            loading={priority && i === 0 ? 'eager' : undefined}
            sizes="100vw"
            className={`object-cover transition-transform duration-[8000ms] ease-out ${
              i === index ? 'scale-105' : 'scale-100'
            }`}
          />
        </div>
      ))}
      <div className={`${overlayClassName} z-[2] pointer-events-none`} />

      {showDots && count > 1 && (
        <div className="absolute bottom-4 left-1/2 z-[3] flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-[#FFD100]' : 'bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
