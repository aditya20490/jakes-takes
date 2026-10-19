import './globals.css';
import { Bebas_Neue, Inter } from 'next/font/google';

const display = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: "Jake's Takes (Unofficial Fan Site)",
  description:
    "An unofficial fan-made website for Jake's Takes: videos, livestreams, and community.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
