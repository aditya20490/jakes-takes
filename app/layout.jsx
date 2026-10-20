import './globals.css';
import './site.css';
import { Bebas_Neue, Inter } from 'next/font/google';
import AmbientBackground from '../components/AmbientBackground';
import Footer from '../components/Footer';

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
  title: "Jake's Takes",
  description: 'Videos, livestreams and a community. Fitness, mindset and purpose.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AmbientBackground />
        {children}
        <Footer />
      </body>
    </html>
  );
}
