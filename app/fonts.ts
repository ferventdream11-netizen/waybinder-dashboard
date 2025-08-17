import { Inter, Newsreader } from 'next/font/google';

export const ui = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

export const headline = Newsreader({
  subsets: ['latin'],
  variable: '--font-headline',
  style: ['normal'],
  display: 'swap',
});
