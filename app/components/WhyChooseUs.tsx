import Image from 'next/image';

const highlightItems = [
  {
    title: 'Detailed Turnover Reports',
    description: "Within 30 minutes, you'll receive damage checks, inventory counts, before-and-after photos, and any action items for your team.",
    image: '/3p.jpg',
    quality: 70,
  },
  {
    title: 'Hands-Off Turnovers',
    description: "Calendar sync, smart checklists, and supply tracking ensure every turnover happens seamlessly — without you lifting a finger.",
    image: '/4p.jpg',
    quality: 58,
  },
  {
    title: 'Speedy Service',
    description: "Your vacation rental will always be reset and ready by check-in — even on tight same-day turns.",
    image: '/keurig.jpg',
    quality: 70,
  },
];

const highlightCardSkins = [
  'bg-white/85 shadow-[0_25px_70px_rgba(12,16,20,0.08)]',
  'bg-white/85 shadow-[0_25px_70px_rgba(12,16,20,0.08)]',
  'bg-white/85 shadow-[0_25px_70px_rgba(12,16,20,0.08)]',
];

const screeningSteps = [
  {
    step: 'Step 1',
    title: 'Online Application',
    blurb: 'Cleaners submit applications covering hospitality background and STR experience.',
  },
  {
    step: 'Step 2',
    title: 'Phone Screen',
    blurb: 'We conduct a structured call tailored to STR work.',
  },
  {
    step: 'Step 3',
    title: 'Video Interview',
    blurb: 'Candidates walk us through real cleaning scenarios while we evaluate professionalism and attention to detail.',
  },
  {
    step: 'Step 4',
    title: 'Orientation',
    blurb: 'New cleaners work alongside experienced leads to learn our protocols and quality standards on real turnovers.',
  },
  {
    step: 'Step 5',
    title: 'Background Check',
    blurb: 'Full background screenings plus recurring audits ensure only trustworthy pros work with your properties.',
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="section-shell section-anchor bg-gradient-to-b from-white via-[#F4FBFF] to-white"
    >
      <div className="section-stack max-w-6xl mx-auto">
        <header className="section-header-stack text-center">
          <p className="text-sm md:text-lg font-mono uppercase tracking-[0.3em] text-[#2978A5]">
            WHY CHOOSE US
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">
            Turnovers on autopilot
          </h2>
          <p className="text-m md:text-xl font-mono text-[#0C1014]/90 max-w-[23rem] sm:max-w-[24rem] md:max-w-3xl mx-auto">
            From calendar syncing to instant reporting, we handle every detail so you can scale your portfolio without micromanaging cleaners.
          </p>
        </header>

        <div className="space-y-4 md:space-y-10">
          <div className="grid gap-4 md:gap-6 md:grid-cols-3 -mt-6 md:mt-0">
            {highlightItems.map((item, index) => (
              <article
                key={item.title}
                className={`flex h-full flex-col overflow-hidden rounded-3xl border border-[#5DAFD5]/40 backdrop-blur-sm transition ${highlightCardSkins[index % highlightCardSkins.length]}`}
              >
                <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0C1014]">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base font-mono text-[#0C1014]/90 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="relative w-full aspect-[7/5] md:aspect-auto md:h-56">
                  <Image
                    src={item.image ?? '/banner.png'}
                    alt={`${item.title} visual`}
                    fill
                    sizes="(min-width: 1280px) 380px, (min-width: 768px) 32vw, 100vw"
                    className="object-cover"
                    quality={item.quality}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-3xl border border-[#5DAFD5]/50 bg-gradient-to-b from-white/95 via-[#ECF6FF]/95 to-white/90 px-5 py-8 md:px-12 md:py-14 shadow-[0_30px_80px_rgba(12,16,20,0.08)]">
          <div className="text-center space-y-3 md:space-y-4">
            <h3 className="text-2xl md:text-4xl font-semibold text-[#0C1014]">
              Our 5-step cleaner screening process
            </h3>
            <p className="text-sm md:text-lg font-mono text-[#0C1014]/90 max-w-3xl mx-auto">
              Every cleaner clears five checkpoints before we trust them with your properties. It&rsquo;s how we maintain consistency — even when you&rsquo;re not there.
            </p>
          </div>

          <div className="mt-12 hidden md:flex items-start gap-6">
            {screeningSteps.map((step, index) => (
              <div key={step.title} className="relative flex-1">
                {index < screeningSteps.length - 1 && (
                  <span className="pointer-events-none absolute left-[calc(50%+3rem)] top-12 hidden h-px w-[calc(100%-6rem)] border-t border-dashed border-[#2978A5]/35 md:block" />
                )}
                <div className="flex flex-col items-center text-center gap-4 px-4">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#2978A5] text-xl font-semibold text-[#FBF9F2]">
                    {step.step.replace('Step ', '')}
                  </span>
                  <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#2978A5]">
                    {step.step}
                  </p>
                  <h4 className="text-xl md:text-l font-semibold text-[#0C1014] md:leading-tight md:whitespace-nowrap">
                    {step.title}
                  </h4>
                  <p className="text-base md:text-base font-mono text-[#0C1014]/90 leading-relaxed md:text-pretty">
                    {step.blurb}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <ol className="mt-8 grid gap-5 md:hidden">
            {screeningSteps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={
                      step.step === 'Step 5'
                        ? 'inline-flex h-8 min-w-[3.3rem] items-center justify-center rounded-full bg-[#2978A5] px-5 text-base font-semibold text-[#FBF9F2]'
                        : 'inline-flex h-10 px-5 items-center justify-center rounded-full bg-[#2978A5] text-base font-semibold text-[#FBF9F2]'
                    }
                  >
                    {step.step.replace('Step ', '')}
                  </span>
                  {index < screeningSteps.length - 1 && (
                    <span className="mt-2 h-full w-px border-l border-dashed border-[#2978A5]/40" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#2978A5]">
                    {step.step}
                  </p>
                  <h4 className="text-base md:text-lg font-semibold text-[#0C1014]">
                    {step.title}
                  </h4>
                  <p className="text-sm md:text-base font-mono text-[#0C1014]/90 leading-relaxed md:text-pretty">
                    {step.blurb}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 mx-auto max-w-lg rounded-2xl border-2 border-[#5DAFD5] bg-white px-5 py-4 md:px-6 md:py-5 text-center shadow-[0_18px_50px_rgba(41,120,165,0.12)]">
            <p className="text-sm font-mono uppercase tracking-[0.35em] text-[#2978A5]">
              TOP TALENT ONLY
            </p>
            <h4 className="mt-2 text-xl md:text-2xl font-semibold text-[#0C1014]">
              Only 2% of applicants make it through all five steps.
            </h4>
            <p className="mt-3 text-sm md:text-base font-mono text-[#0C1014]/90">
              Those are the cleaners we trust with your turnovers, your guests, and your brand.
            </p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
