import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Dayalwasi Properties',
  description: 'Property Management — Dayalbagh, Agra',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans bg-beige-200 text-brown-900 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#3C2415',
              color: '#FAF7F2',
              borderRadius: '12px',
              fontFamily: 'var(--font-inter), sans-serif',
            },
            success: {
              iconTheme: { primary: '#C9A84C', secondary: '#FAF7F2' },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
