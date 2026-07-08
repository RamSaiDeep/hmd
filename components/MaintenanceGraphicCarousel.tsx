'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const graphics = [
  {
    src: '/graphics/technician-electrical.png',
    alt: 'Electrician working on switches',
    title: 'Electrical Work'
  },
  {
    src: '/graphics/fan-replacement.png',
    alt: 'Technician replacing ceiling fan',
    title: 'Fan Maintenance'
  },
  {
    src: '/graphics/light-replacement.png',
    alt: 'Light fixture replacement',
    title: 'Lighting Installation'
  },
  {
    src: '/graphics/welding-work.png',
    alt: 'Welding work in progress',
    title: 'Welding & Metal Work'
  },
  {
    src: '/graphics/metal-cutting.png',
    alt: 'Metal cutting work',
    title: 'Metal Fabrication'
  },
  {
    src: '/graphics/wood-cutting.png',
    alt: 'Wood cutting and carpentry',
    title: 'Carpentry & Wood Work'
  },
  {
    src: '/graphics/mixer-analog.png',
    alt: 'Analog mixing console',
    title: 'Audio Equipment'
  },
  {
    src: '/graphics/recording-studio.png',
    alt: 'Recording studio setup',
    title: 'Studio Setup'
  }
];

export default function MaintenanceGraphicCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % graphics.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % graphics.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + graphics.length) % graphics.length);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden rounded-2xl glass">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Graphics carousel */}
      <div className="relative w-full h-full flex items-center justify-center">
        {graphics.map((graphic, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={graphic.src}
              alt={graphic.alt}
              fill
              className="object-contain p-8"
              priority={index === current}
            />
          </div>
        ))}
      </div>

      {/* Title overlay */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <h3 className="text-sm font-semibold text-neon-blue drop-shadow-lg">
          {graphics[current].title}
        </h3>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-hover flex items-center justify-center text-neon-blue hover:text-white transition-colors"
        aria-label="Previous graphic"
      >
        ←
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-hover flex items-center justify-center text-neon-blue hover:text-white transition-colors"
        aria-label="Next graphic"
      >
        →
      </button>

      {/* Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {graphics.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === current
                ? 'bg-neon-blue w-6'
                : 'bg-neon-gold opacity-50 hover:opacity-100'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
