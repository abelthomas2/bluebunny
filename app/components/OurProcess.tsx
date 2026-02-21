'use client';

import Image from 'next/image';
import { ChangeEvent, useState } from 'react';

type BlueBunnyStep = {
  step: string;
  title: string;
  description: string;
};

const blueBunnySteps: BlueBunnyStep[] = [
  {
    step: 'Step 1',
    title: 'Arrival & Safety',
    description:
      'We start every clean with a complete property walkthrough. Before touching anything, we document the space as we found it, check for hazards or damage, and note any maintenance issues. This protects you, your guests, and our team.',
  },
  {
    step: 'Step 2',
    title: 'Laundry Launch',
    description:
      "Time is everything in turnover work. We strip beds and start laundry cycles immediately so linens are washing while we clean. This parallel workflow means we never leave a property waiting on the dryer.",
  },
  {
    step: 'Step 3',
    title: 'Reset & Declutter',
    description:
      "Trash gets emptied from every room, dishes go in the washer, and furniture returns to its proper layout. We're creating a blank canvas before the detailed cleaning begins.",
  },
  {
    step: 'Step 4',
    title: 'Bathroom Clean',
    description:
      'Each bathroom gets treated room by room. We pre-treat surfaces for maximum dwell time, scrub grout and glass, polish fixtures to a shine, and restock all amenities to standard levels. Fresh bathmat, proper towel count, toilet paper positioned just right.',
  },
  {
    step: 'Step 5',
    title: 'Bedroom Refresh',
    description:
      'High dusting comes first, then surfaces get wiped down. Beds are made with hospital corners and fluffed duvets. We align pillows with tags hidden, check under beds, and leave closets staged with the right number of hangers.',
  },
  {
    step: 'Step 6',
    title: 'Kitchen Sanitize',
    description:
      'Appliances get wiped inside and out. Counters are degreased, sinks are scrubbed and polished, and every dish is hand-dried and shelved. We restock paper goods, dish soap, coffee supplies, and verify everything matches your inventory requirements.',
  },
  {
    step: 'Step 7',
    title: 'Living Spaces',
    description:
      "We dust top to bottom, disinfect remotes, vacuum and lint-roll upholstery, and return cushions to match your listing photos. Tables and chairs are wiped, decor is repositioned, and everything looks camera-ready.",
  },
  {
    step: 'Step 8',
    title: 'Floors Throughout',
    description:
      'Every room is vacuumed edge to edge, then all hard surfaces are mopped, working toward the exit. We change mop heads between bathrooms and common areas to prevent cross-contamination.',
  },
  {
    step: 'Step 9',
    title: 'Staging & Climate',
    description:
      'Pillows get positioned, throws are folded to match listing photos, and thermostats are set to guest arrival settings. Lights are adjusted based on check-in time, and outdoor spaces are swept and wiped down.',
  },
  {
    step: 'Step 10',
    title: 'Thorough Reporting',
    description:
      'Our cleaners walk the guest arrival path one final time, fixing any stray fingerprints or hairs. Then they photograph every room with timestamps, lock up, and submit a detailed turnover report within 30 minutes of departure.',
  },
];

export default function OurProcess() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSteps = blueBunnySteps.length;
  const [sliderValue, setSliderValue] = useState(50);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSteps) % totalSteps);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSteps);
  };

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(event.target.value));
  };

  return (
    <section
      id="our-process"
      className="section-shell section-anchor bg-gradient-to-b from-white via-[#F2F8FF] to-white"
    >
      <div className="section-stack max-w-6xl mx-auto">
        <header className="section-header-stack text-center">
          <p className="text-sm md:text-lg font-mono uppercase tracking-[0.3em] text-[#2978A5]">
            OUR PROCESS
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">
            From checkout to guest-ready
          </h2>
          <p className="text-m md:text-xl font-mono text-[#0C1014]/90 max-w-[23rem] sm:max-w-[24rem] md:max-w-3xl mx-auto">
            We follow the same proven system for every turnover. No shortcuts, no guesswork. Just a methodical approach that keeps your properties consistently five-star, whether you have one listing or twenty.
          </p>
        </header>

        <div className="space-y-4 md:space-y-10">
          <div className="rounded-3xl border border-[#2978A5]/30 bg-gradient-to-br from-white via-[#F0F7FF] to-white px-4 py-7 md:px-10 md:py-12 shadow-[0_30px_90px_rgba(12,16,20,0.08)]">
          <div className="text-center space-y-3">
            <p className="text-sm md:text-sm font-mono uppercase tracking-[0.35em] text-[#2978A5]">
              THE BLUE BUNNY METHOD
            </p>
            <h3 className="text-2xl md:text-4xl font-semibold text-[#0C1014]">
              Ten repeatable steps for flawless turnovers
            </h3>
            <p className="text-sm md:text-lg font-mono text-[#0C1014]/75 max-w-3xl mx-auto">
              Use the arrows to follow the process left to right — the same checklist our crews use in every single property.
            </p>
          </div>

          <div className="mt-8 md:mt-10 relative">
            <div className="overflow-hidden rounded-3xl border border-[#2978A5]/30 bg-gradient-to-r from-white to-[#F5FAFF]">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {blueBunnySteps.map((step) => (
                  <article
                    key={step.title}
                    className="w-full shrink-0 px-4 py-7 md:px-12 md:py-14 flex flex-col gap-5 md:gap-6"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-[#2978A5] text-xl md:text-2xl font-semibold text-[#FBF9F2] shadow-lg shadow-[#2978A5]/25">
                          {step.step.replace('Step ', '')}
                        </span>
                        <div className="space-y-1">
                          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.4em] text-[#2978A5]/80">
                            {step.step}
                          </p>
                          <h4 className="text-xl md:text-2xl font-semibold text-[#0C1014] leading-tight">
                            {step.title}
                          </h4>
                        </div>
                      </div>
                      <div className="hidden md:block h-px w-full bg-gradient-to-r from-[#2978A5]/20 via-transparent to-transparent" />
                    </div>
                    <p className="text-sm md:text-lg font-mono text-[#0C1014]/90 leading-relaxed">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={goToPrevious}
              aria-label="View previous step"
              className="group absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border border-[#0C1014]/15 bg-white p-1.5 md:p-3 shadow-lg transition hover:-translate-y-1/2 hover:-translate-x-1/2 hover:bg-[#2978A5] hover:text-[#FBF9F2]"
            >
              <span className="inline-block text-base md:text-xl font-semibold group-hover:translate-x-[-2px] transition-transform">
                {'<'}
              </span>
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="View next step"
              className="group absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full border border-[#0C1014]/15 bg-white p-1.5 md:p-3 shadow-lg transition hover:-translate-y-1/2 hover:translate-x-1/2 hover:bg-[#2978A5] hover:text-[#FBF9F2]"
            >
              <span className="inline-block text-base md:text-xl font-semibold group-hover:translate-x-[2px] transition-transform">
                {'>'}
              </span>
            </button>
          </div>

          <div className="mt-7 md:mt-8 flex flex-col items-center gap-3 md:gap-4">
            <p className="text-xs md:text-sm font-mono uppercase tracking-[0.35em] text-[#0C1014]/75">
              Step {currentIndex + 1} of {totalSteps}
            </p>
            <div className="hidden md:flex flex-wrap justify-center gap-2">
              {blueBunnySteps.map((step, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to ${step.step}`}
                    className={`h-2.5 w-6 md:h-3 md:w-8 rounded-full transition ${
                      isActive ? 'bg-[#2978A5]' : 'bg-[#2978A5]/30 hover:bg-[#2978A5]/60'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          </div>

          <div className="rounded-3xl border border-[#2978A5]/30 bg-gradient-to-br from-white via-[#F7FAFF] to-[#EEF3FF] px-4 py-7 md:px-10 md:py-12 space-y-7 md:space-y-8 shadow-[0_30px_90px_rgba(12,16,20,0.08)]">
            <div className="text-center space-y-3">
              <p className="text-sm md:text-sm font-mono uppercase tracking-[0.35em] text-[#2978A5]">
                PROOF IN THE DETAILS
              </p>
              <h3 className="text-2xl md:text-4xl font-semibold text-[#0C1014]">
                Living room before & after
              </h3>
              <p
                id="before-after-slider-description"
                className="text-sm md:text-lg font-mono text-[#0C1014]/75 max-w-3xl mx-auto"
              >
                Drag the slider to see a real Blue Bunny living room turnover go from checkout condition to guest-ready shine.
              </p>
            </div>

            <div className="mx-auto flex max-w-4xl flex-col gap-6">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[#2978A5]/30 bg-[#F2F8FF]">
                <Image
                  src="/notVraj-29.jpg"
                  alt="Living room after Blue Bunny deep clean"
                  fill
                  sizes="(min-width: 1280px) 768px, (min-width: 768px) 75vw, 100vw"
                  className="object-cover"
                  quality={70}
                />

                <div
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
                >
                  <Image
                    src="/notVraj-2.jpg"
                    alt="Living room before Blue Bunny deep clean"
                    fill
                    sizes="(min-width: 1280px) 768px, (min-width: 768px) 75vw, 100vw"
                    className="object-cover"
                    quality={70}
                  />
                </div>

                <div
                  className="pointer-events-none absolute inset-y-4 w-0.5 -translate-x-1/2"
                  style={{ left: `${sliderValue}%` }}
                >
                  <span className="block h-full w-full bg-white/80 shadow-sm" />
                  <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#2978A5] text-white text-lg font-semibold shadow-lg">
                    ⇆
                  </span>
                </div>

                <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                  Before
                </span>
                <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                  After
                </span>
              </div>

              <label htmlFor="before-after-slider" className="sr-only">
                Before and after comparison
              </label>
              <input
                id="before-after-slider"
                type="range"
                min={0}
                max={100}
                value={sliderValue}
                onChange={handleSliderChange}
                aria-describedby="before-after-slider-description"
                className="w-full accent-[#2978A5]"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
