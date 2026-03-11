'use client';

import { useState } from 'react';

const BASE_FEE = 50;
const PER_BEDROOM = 19;
const PER_BATHROOM = 18;
const DEEP_CLEAN_RATE = 0.4;

const ADD_ONS = [
  { id: 'pool', label: 'Pool cleaning', tag: '$18 / turn' },
  { id: 'grill', label: 'Grill cleaning', tag: '$12 / turn' },
  {
    id: 'consumables',
    label: 'Consumables (BB-supplied)',
    mobileLabel: 'BB Consumables',
    tag: '$7 + $4 / BA',
    compactTag: '$7 + $4/BA',
  },
  { id: 'deepclean', label: 'Deep clean', tag: '+40% on base' },
] as const;

type AddOnId = (typeof ADD_ONS)[number]['id'];

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
        {label}
      </span>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C8DDE8] bg-white text-base font-bold text-[#2978A5] transition hover:border-[#2978A5] hover:bg-[#EEF6FB] disabled:cursor-not-allowed disabled:opacity-30 md:h-9 md:w-9 md:text-lg"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-7 text-center text-xl font-bold text-[#0C1014] md:w-8 md:text-2xl">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C8DDE8] bg-white text-base font-bold text-[#2978A5] transition hover:border-[#2978A5] hover:bg-[#EEF6FB] disabled:cursor-not-allowed disabled:opacity-30 md:h-9 md:w-9 md:text-lg"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PriceCalculator() {
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [selected, setSelected] = useState<Set<AddOnId>>(new Set());

  function toggle(id: AddOnId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const baseTurnover = BASE_FEE + bedrooms * PER_BEDROOM + bathrooms * PER_BATHROOM;

  const addOnTotal =
    (selected.has('pool') ? 18 : 0) +
    (selected.has('grill') ? 12 : 0) +
    (selected.has('consumables') ? 7 + 4 * bathrooms : 0) +
    (selected.has('deepclean') ? Math.round(baseTurnover * DEEP_CLEAN_RATE) : 0);

  const total = baseTurnover + addOnTotal;

  const breakdown: string[] = [
    `$${BASE_FEE} base`,
    `${bedrooms} BR × $${PER_BEDROOM}`,
    `${bathrooms} BA × $${PER_BATHROOM}`,
    ...(selected.has('pool') ? ['pool $18'] : []),
    ...(selected.has('grill') ? ['grill $12'] : []),
    ...(selected.has('consumables') ? [`consumables $${7 + 4 * bathrooms}`] : []),
    ...(selected.has('deepclean') ? [`deep clean +$${Math.round(baseTurnover * DEEP_CLEAN_RATE)}`] : []),
  ];

  return (
    <div className="mt-6 rounded-2xl border-2 border-[#5DAFD5]/50 bg-[#F0F9FF] p-6 md:p-8">
      <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
        Price Estimator
      </p>
      <p className="mt-2 text-sm font-mono leading-relaxed text-[#0C1014] md:text-sm">
        Answer a few quick questions to get your per-turn estimate.
      </p>

      <div className="mt-6 space-y-6">
        {/* Q1 */}
        <div>
          <p className="mb-3 text-sm font-bold text-[#0C1014]">How many bedrooms and bathrooms?</p>
          <div className="flex flex-wrap gap-8">
            <Stepper label="Bedrooms" value={bedrooms} min={1} max={10} onChange={setBedrooms} />
            <Stepper label="Bathrooms" value={bathrooms} min={1} max={10} onChange={setBathrooms} />
          </div>
        </div>

        {/* Q2 */}
        <div>
          <p className="mb-3 text-sm font-bold text-[#0C1014]">Any add-on services?</p>
          <div className="flex flex-wrap gap-2">
            {ADD_ONS.map((addon) => {
              const active = selected.has(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => toggle(addon.id)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-mono transition max-[340px]:gap-1.5 max-[340px]:px-3 max-[340px]:text-[13px] ${
                    active
                      ? 'border-[#2978A5] bg-[#2978A5] text-white'
                      : 'border-[#C8DDE8] bg-white text-[#0C1014] hover:border-[#2978A5]'
                  }`}
                >
                  <span className="whitespace-nowrap">
                    {'mobileLabel' in addon ? (
                      <>
                        <span className="md:hidden">{addon.mobileLabel}</span>
                        <span className="hidden md:inline">{addon.label}</span>
                      </>
                    ) : (
                      <span>{addon.label}</span>
                    )}
                  </span>
                  <span
                    className={`whitespace-nowrap text-xs font-semibold max-[340px]:text-[11px] ${active ? 'text-white/80' : 'text-[#2978A5]'}`}
                  >
                    {'compactTag' in addon ? (
                      <>
                        <span className="max-[375px]:hidden">{addon.tag}</span>
                        <span className="hidden max-[375px]:inline">{addon.compactTag}</span>
                      </>
                    ) : (
                      addon.tag
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 flex flex-col gap-2 rounded-xl border border-[#E2EEF5] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
            Estimated cost / turn
          </p>
          <p className="mt-0.5 text-xs font-mono text-[#0C1014]/75 leading-relaxed">
            {breakdown.join(' + ')}
          </p>
        </div>
        <span className="self-end text-2xl font-bold text-[#0C1014] sm:ml-auto sm:self-auto md:text-3xl">${total}</span>
      </div>
    </div>
  );
}
