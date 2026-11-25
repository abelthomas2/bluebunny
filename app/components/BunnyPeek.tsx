import Image from 'next/image';
import s from './BunnyPeek.module.css';

// The peeking bunny, by the brand rule ("Logo and bunny head" on the design board): the head rises from behind a hard
// edge with the top 78.2% of it showing, so the ears, forehead and both eyes are in view and the cut sits just above the
// nose. The eyes end 76.9% of the way down the head and the nose starts at 78.4%. Rounded down to whole pixels, so the
// nose never shows. Phones use a 140 px head (109 px showing) on every screen. Place it flush against the edge it peeks over.
const PEEK = 0.782;
const HEAD_RATIO = 2942.6 / 3596.6; // width / height of blue-bunny-head.svg

type Props = {
  /** Height of the whole head, in px. 140 on phones. */
  size?: number;
  /** Where it sits along the edge: centred, or at the end (right) of it. */
  align?: 'center' | 'end';
  className?: string;
};

export default function BunnyPeek({ size = 140, align = 'center', className }: Props) {
  const showing = Math.floor(size * PEEK);
  const width = Math.round(size * HEAD_RATIO * 10) / 10;
  return (
    <div
      className={`${s.peek} ${align === 'end' ? s.end : ''} ${className ?? ''}`}
      style={{ height: showing }}
      aria-hidden="true"
    >
      <Image
        src="/blue-bunny-head.svg"
        alt=""
        width={Math.round(width)}
        height={size}
        unoptimized
        style={{ width, height: size }}
      />
    </div>
  );
}
