import { Geist_Mono } from 'next/font/google';

// Geist Mono, the design's mono, for the redesigned header and hero: eyebrows, the trust ribbon
// and the support line. It is applied on the home page only (app/page.tsx), so other pages keep
// the site's existing Menlo / DejaVu mono and never download it.
export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
