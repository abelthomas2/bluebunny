'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { track } from './analytics';

const BASE = '/samplereport';

type Phase = 'af' | 'pt' | 'flag';

interface Photo {
  file: string;
  room: string;
  phase: Phase;
  caption: string;
  time: string;
  alt: string;
}

// Full album manifest in the cleaner's sequence (build spec §4). Order here IS the
// lightbox swipe order. Alt text follows the §11 pattern.
const PHOTOS: Photo[] = [
  // Entry & Dining
  { file: 'af-entry-wide.jpg', room: 'Entry & Dining', phase: 'af', caption: 'Entry & dining — as found', time: '11:05 AM', alt: 'Entry and dining, as found, 11:05 AM — front entry and dining area before cleaning' },
  { file: 'af-dining-medium.jpg', room: 'Entry & Dining', phase: 'af', caption: 'Dining area — as found', time: '11:06 AM', alt: 'Dining area, as found, 11:06 AM — dining table and chairs before cleaning' },
  { file: 'pt-entry-wide.jpg', room: 'Entry & Dining', phase: 'pt', caption: 'Entry & dining — guest-ready', time: '1:06 PM', alt: 'Entry and dining, post-turn, 1:06 PM — entry and dining area guest-ready' },
  { file: 'pt-dining-medium.jpg', room: 'Entry & Dining', phase: 'pt', caption: 'Dining area — guest-ready', time: '1:07 PM', alt: 'Dining area, post-turn, 1:07 PM — dining table reset and wiped down' },

  // Living Area
  { file: 'af-living-wide.jpg', room: 'Living Area', phase: 'af', caption: 'Living area — as found', time: '11:06 AM', alt: 'Living area, as found, 11:06 AM — living room before cleaning' },
  { file: 'af-living-couch.jpg', room: 'Living Area', phase: 'af', caption: 'Couch — as found', time: '11:07 AM', alt: 'Living area, as found, 11:07 AM — couch and cushions before cleaning' },
  { file: 'pt-living-wide.jpg', room: 'Living Area', phase: 'pt', caption: 'Living area — guest-ready', time: '1:04 PM', alt: 'Living area, post-turn, 1:04 PM — living room guest-ready' },
  { file: 'pt-living-couch.jpg', room: 'Living Area', phase: 'pt', caption: 'Couch — guest-ready', time: '1:05 PM', alt: 'Living area, post-turn, 1:05 PM — couch styled with cushions' },

  // Kitchen
  { file: 'af-kitchen-wide.jpg', room: 'Kitchen', phase: 'af', caption: 'Kitchen — as found', time: '11:07 AM', alt: 'Kitchen, as found, 11:07 AM — kitchen before cleaning' },
  { file: 'af-kitchen-sink.jpg', room: 'Kitchen', phase: 'af', caption: 'Sink & counters — as found', time: '11:08 AM', alt: 'Kitchen sink and counters, as found, 11:08 AM — sink and counters before cleaning' },
  { file: 'af-kitchen-stove.jpg', room: 'Kitchen', phase: 'af', caption: 'Stove — as found', time: '11:08 AM', alt: 'Kitchen stove, as found, 11:08 AM — range and cooktop before cleaning' },
  { file: 'af-kitchen-trash.jpg', room: 'Kitchen', phase: 'af', caption: 'Trash — as found', time: '11:09 AM', alt: 'Kitchen trash, as found, 11:09 AM — bin before emptying' },
  { file: 'pt-kitchen-wide.jpg', room: 'Kitchen', phase: 'pt', caption: 'Kitchen — guest-ready', time: '1:05 PM', alt: 'Kitchen, post-turn, 1:05 PM — kitchen guest-ready' },
  { file: 'pt-kitchen-sink.jpg', room: 'Kitchen', phase: 'pt', caption: 'Sink & counters — guest-ready', time: '1:05 PM', alt: 'Kitchen sink and counters, post-turn, 1:05 PM — sink and counters cleaned' },
  { file: 'pt-kitchen-stove.jpg', room: 'Kitchen', phase: 'pt', caption: 'Stove — guest-ready', time: '1:06 PM', alt: 'Kitchen stove, post-turn, 1:06 PM — range and cooktop cleaned' },
  { file: 'pt-kitchen-trash.jpg', room: 'Kitchen', phase: 'pt', caption: 'Trash — emptied & relined', time: '1:06 PM', alt: 'Kitchen trash, post-turn, 1:06 PM — bin emptied and relined' },

  // Master Bedroom
  { file: 'af-bedroom-bed.jpg', room: 'Master Bedroom', phase: 'af', caption: 'Master bedroom — as found', time: '11:09 AM', alt: 'Master bedroom, as found, 11:09 AM — bed stripped before cleaning' },
  { file: 'af-bedroom-bed2.jpg', room: 'Master Bedroom', phase: 'af', caption: 'Master bedroom, second angle — as found', time: '11:10 AM', alt: 'Master bedroom, as found, 11:10 AM — second angle before cleaning' },
  { file: 'pt-bedroom-bed.jpg', room: 'Master Bedroom', phase: 'pt', caption: 'Master bedroom — guest-ready', time: '1:05 PM', alt: 'Master bedroom, post-turn, 1:05 PM — bed made with fresh white linens' },

  // Bathroom
  { file: 'af-bath-medium.jpg', room: 'Bathroom', phase: 'af', caption: 'Bathroom — as found', time: '11:11 AM', alt: 'Bathroom, as found, 11:11 AM — bathroom before cleaning' },
  { file: 'af-bath-floor.jpg', room: 'Bathroom', phase: 'af', caption: 'Bathroom floor — as found', time: '11:11 AM', alt: 'Bathroom floor, as found, 11:11 AM — floor before cleaning' },
  { file: 'af-bath-vanity.jpg', room: 'Bathroom', phase: 'af', caption: 'Vanity — as found', time: '11:12 AM', alt: 'Bathroom vanity, as found, 11:12 AM — sink and vanity before cleaning' },
  { file: 'af-bath-toilet.jpg', room: 'Bathroom', phase: 'af', caption: 'Toilet — as found', time: '11:12 AM', alt: 'Bathroom toilet, as found, 11:12 AM — toilet before cleaning' },
  { file: 'af-bath-tub.jpg', room: 'Bathroom', phase: 'af', caption: 'Tub & shower — as found', time: '11:13 AM', alt: 'Bathroom tub, as found, 11:13 AM — tub and shower before cleaning' },
  { file: 'af-bath-tub2.jpg', room: 'Bathroom', phase: 'af', caption: 'Tub & shower, second angle — as found', time: '11:13 AM', alt: 'Bathroom tub, as found, 11:13 AM — tub and shower second angle before cleaning' },
  { file: 'af-bath-towels.jpg', room: 'Bathroom', phase: 'af', caption: 'Linen closet — as found', time: '11:14 AM', alt: 'Bathroom linen closet, as found, 11:14 AM — towels before restock' },
  {
    file: 'flag-baseboard.jpg',
    room: 'Bathroom',
    phase: 'flag',
    caption:
      'Maintenance flag · Baseboard separation — Bathroom. Baseboard pulling away from wall near tub apron. Possible moisture intrusion. Pre-existing. Recommend maintenance inspection. Severity: Low.',
    time: '11:13 AM',
    alt: 'Bathroom, maintenance flag, 11:13 AM — baseboard separating from wall near tub apron',
  },
  { file: 'pt-bath-medium.jpg', room: 'Bathroom', phase: 'pt', caption: 'Bathroom — guest-ready', time: '1:06 PM', alt: 'Bathroom, post-turn, 1:06 PM — bathroom guest-ready' },
  { file: 'pt-bath-floor.jpg', room: 'Bathroom', phase: 'pt', caption: 'Bathroom floor — guest-ready', time: '1:06 PM', alt: 'Bathroom floor, post-turn, 1:06 PM — floor cleaned' },
  { file: 'pt-bath-vanity.jpg', room: 'Bathroom', phase: 'pt', caption: 'Vanity — guest-ready', time: '1:07 PM', alt: 'Bathroom vanity, post-turn, 1:07 PM — sink and vanity cleaned' },
  { file: 'pt-bath-toilet.jpg', room: 'Bathroom', phase: 'pt', caption: 'Toilet — guest-ready', time: '1:07 PM', alt: 'Bathroom toilet, post-turn, 1:07 PM — toilet cleaned' },
  { file: 'pt-bath-tub.jpg', room: 'Bathroom', phase: 'pt', caption: 'Tub & shower — guest-ready', time: '1:08 PM', alt: 'Bathroom tub, post-turn, 1:08 PM — tub and shower cleaned' },
  { file: 'pt-bath-towels.jpg', room: 'Bathroom', phase: 'pt', caption: 'Linen closet — restocked', time: '1:08 PM', alt: 'Bathroom linen closet, post-turn, 1:08 PM — fresh towels folded and restocked' },

  // Balcony
  { file: 'af-balcony.jpg', room: 'Balcony', phase: 'af', caption: 'Balcony — as found', time: '11:15 AM', alt: 'Balcony, as found, 11:15 AM — balcony before cleaning' },
  { file: 'af-balcony2.jpg', room: 'Balcony', phase: 'af', caption: 'Balcony, second angle — as found', time: '11:15 AM', alt: 'Balcony, as found, 11:15 AM — balcony second angle before cleaning' },
  { file: 'pt-balcony.jpg', room: 'Balcony', phase: 'pt', caption: 'Balcony — guest-ready', time: '1:09 PM', alt: 'Balcony, post-turn, 1:09 PM — balcony guest-ready' },
  { file: 'pt-balcony2.jpg', room: 'Balcony', phase: 'pt', caption: 'Balcony, second angle — guest-ready', time: '1:09 PM', alt: 'Balcony, post-turn, 1:09 PM — balcony second angle guest-ready' },

  // Restock & Lockup
  { file: 'pt-restock-bath-consumables.jpg', room: 'Restock & Lockup', phase: 'pt', caption: 'Bathroom consumables placed', time: '1:07 PM', alt: 'Restock and lockup, post-turn, 1:07 PM — bathroom toiletries and consumables placed' },
  { file: 'pt-restock-kitchen-consumables.jpg', room: 'Restock & Lockup', phase: 'pt', caption: 'Kitchen consumables restocked', time: '1:09 PM', alt: 'Restock and lockup, post-turn, 1:09 PM — kitchen consumables and coffee restocked' },
  { file: 'pt-restock-laundry.jpg', room: 'Restock & Lockup', phase: 'pt', caption: 'Laundry run — washer & dryer', time: '1:10 PM', alt: 'Restock and lockup, post-turn, 1:10 PM — linens started in the washer and dryer' },
  { file: 'pt-restock-thermostat.jpg', room: 'Restock & Lockup', phase: 'pt', caption: 'Thermostat set — 70°F, cooling on', time: '1:10 PM', alt: 'Restock and lockup, post-turn, 1:10 PM — thermostat set to 70°F, cooling on' },
  { file: 'pt-restock-entryway.jpg', room: 'Restock & Lockup', phase: 'pt', caption: 'Final walkthrough — locked & departed', time: '1:12 PM', alt: 'Restock and lockup, post-turn, 1:12 PM — entryway final walkthrough, unit locked and departed' },
];

const ROOM_ORDER = [
  'Entry & Dining',
  'Living Area',
  'Kitchen',
  'Master Bedroom',
  'Bathroom',
  'Balcony',
  'Restock & Lockup',
];

function Thumb({ photo, onOpen }: { photo: Photo; onOpen: (file: string) => void }) {
  const isFlag = photo.phase === 'flag';

  return (
    <button
      type="button"
      onClick={() => onOpen(photo.file)}
      aria-label={`View photo: ${photo.alt}`}
      className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#F4F9FD] ${
        isFlag ? 'ring-2 ring-[#DC2726]/60' : 'border border-[#E2EEF5]'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE}/${photo.file}`}
        alt={photo.alt}
        width={1200}
        height={900}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
      />
      {isFlag ? (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-[#DC2726] px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-white">
          Maintenance flag
        </span>
      ) : (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-[rgba(12,16,20,0.72)] px-1.5 py-0.5 text-[11px] font-mono leading-none text-white">
          {photo.time}
        </span>
      )}
    </button>
  );
}

function RoomBlock({ room, onOpen }: { room: string; onOpen: (file: string) => void }) {
  const asFound = PHOTOS.filter((p) => p.room === room && (p.phase === 'af' || p.phase === 'flag'));
  const postTurn = PHOTOS.filter((p) => p.room === room && p.phase === 'pt');

  const gridClass = 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3';

  return (
    <article className="rounded-2xl border border-[#E2EEF5] bg-white p-5 shadow-sm md:p-6">
      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#0C1014]">{room}</h3>

      {asFound.length > 0 && (
        <div className="mt-4">
          <span className="inline-block rounded-full bg-[#EEF1F4] px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-[#5E6E7B]">
            As found
          </span>
          <div className={gridClass}>
            {asFound.map((photo) => (
              <Thumb key={photo.file} photo={photo} onOpen={onOpen} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <span className="inline-block rounded-full bg-[#5DAFD5] px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-white">
          Post-turn
        </span>
        <div className={gridClass}>
          {postTurn.map((photo) => (
            <Thumb key={photo.file} photo={photo} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </article>
  );
}

export default function PhotoAlbum() {
  const [activeRoom, setActiveRoom] = useState<string>(ROOM_ORDER[0]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const albumRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  // Photos for the selected room only, in display order (as-found + flag, then
  // post-turn). The lightbox navigates within this room.
  const roomPhotos = useMemo(() => PHOTOS.filter((p) => p.room === activeRoom), [activeRoom]);

  // album_view fires once when the grid scrolls into view.
  useEffect(() => {
    const el = albumRef.current;
    if (!el) return;
    let fired = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          fired = true;
          track('album_view');
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selectRoom = useCallback((room: string) => {
    setActiveRoom(room);
    setOpenIndex(null); // close any open viewer so indices stay valid
  }, []);

  const openLightbox = useCallback(
    (file: string) => {
      const index = roomPhotos.findIndex((p) => p.file === file);
      if (index < 0) return;
      setOpenIndex(index);
      track('lightbox_open', { photo: file });
      try {
        window.history.pushState({ lightbox: true }, '');
      } catch {
        /* history unavailable — non-fatal */
      }
    },
    [roomPhotos],
  );

  const closeLightbox = useCallback(() => {
    setOpenIndex(null);
    try {
      if (window.history.state?.lightbox) window.history.back();
    } catch {
      /* history unavailable — non-fatal */
    }
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((i) => (i === null ? i : (i + delta + roomPhotos.length) % roomPhotos.length));
    },
    [roomPhotos.length],
  );

  // Browser back button closes the lightbox on mobile.
  useEffect(() => {
    const onPop = () => setOpenIndex(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Keyboard control + scroll lock while open.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openIndex, closeLightbox, step]);

  const current = openIndex === null ? null : roomPhotos[openIndex];

  return (
    <div ref={albumRef} className="mt-8 md:mt-12">
      {/* Room selector — show one room's photos at a time */}
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0"
        role="tablist"
        aria-label="Photo album rooms"
      >
        {ROOM_ORDER.map((room) => {
          const active = room === activeRoom;
          return (
            <button
              key={room}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectRoom(room)}
              className={`shrink-0 rounded-full border px-3.5 py-2 font-mono text-xs font-semibold transition md:text-sm ${
                active
                  ? 'border-[#5DAFD5] bg-[#5DAFD5] text-white shadow-sm'
                  : 'border-[#E2EEF5] bg-white text-[#0C1014] hover:border-[#5DAFD5]'
              }`}
            >
              {room}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <RoomBlock key={activeRoom} room={activeRoom} onOpen={openLightbox} />
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-[#0C1014]/95"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
          }}
        >
          {/* Top bar */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3"
            style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
          >
            <span className="font-mono text-xs text-white/70">
              {openIndex! + 1} / {roomPhotos.length}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close viewer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Image */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-2 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:flex"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/${current.file}`}
              alt={current.alt}
              className="max-h-full max-w-full rounded-lg object-contain"
            />

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-2 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:flex"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Caption */}
          <div
            className="shrink-0 px-5 py-4 text-center"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <p className="mx-auto max-w-2xl font-mono text-sm leading-relaxed text-white">
              {current.caption}
            </p>
            <p className="mt-1.5 font-mono text-xs text-white/60">
              {current.phase === 'flag' ? 'Logged ' : ''}
              {current.time}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
