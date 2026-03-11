'use client';

import { useState } from 'react';

type AddOnItem = {
  label: string;
  detail: string;
  smallDetail?: string;
};

type SituationalItem = {
  label: string;
  detail: string;
};

type Props = {
  addOnServices: AddOnItem[];
  situationalFees: SituationalItem[];
};

export default function AddOnsFees({ addOnServices, situationalFees }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-mono font-semibold text-[#2978A5] transition hover:text-[#0C1014]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {open ? 'Hide add-ons and situational fees' : 'See add-ons and situational fees'}
      </button>

      {open && (
        <div className="mt-4 grid gap-6 md:grid-cols-2 md:items-start">
          <div className="rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm">
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
              Add-On Services
            </p>
            <div className="mt-5 overflow-hidden rounded-xl border border-[#E2EEF5]">
              {addOnServices.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                    index !== addOnServices.length - 1 ? 'border-b border-[#E2EEF5]' : ''
                  } ${index % 2 === 0 ? 'bg-[#F4F9FD]' : 'bg-white'}`}
                >
                  <span className="text-sm font-mono text-[#0C1014]">{item.label}</span>
                  <span className="shrink-0 text-sm font-bold text-[#2978A5]">
                    {item.smallDetail ? (
                      <>
                        <span className="max-[380px]:hidden">{item.detail}</span>
                        <span className="hidden max-[380px]:inline">{item.smallDetail}</span>
                      </>
                    ) : (
                      item.detail
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm">
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
              Situational Fees
            </p>
            <ul className="mt-5 space-y-4">
              {situationalFees.map((item) => (
                <li key={item.label} className="text-sm font-mono leading-relaxed text-[#0C1014]">
                  <span className="font-bold text-[#0C1014]">{item.label}</span>
                  {' '}&mdash; {item.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
