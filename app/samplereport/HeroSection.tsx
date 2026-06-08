'use client';

import VideoPlayerLocal from '@/app/components/VideoPlayerLocal';

const POSTER_URL = '/thumbnail.jpg';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0C1014] pt-[5.8rem] lg:flex lg:min-h-dvh lg:flex-col lg:pt-[7rem]">
      {/* Blurred poster — ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:    `url(${POSTER_URL})`,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          filter:    'blur(20px) saturate(3) brightness(0.4)',
          transform: 'scale(1.05)',
        }}
      />

      <div className="relative px-5 pt-5 pb-12 lg:flex lg:flex-1 lg:items-center lg:justify-center lg:py-8">
        <div className="relative w-full max-w-6xl">
          <VideoPlayerLocal />
        </div>
      </div>
    </section>
  );
}
