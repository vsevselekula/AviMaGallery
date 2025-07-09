import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Avito Gallery',
  description: 'Галерея рекламных кампаний Avito',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.className}>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
