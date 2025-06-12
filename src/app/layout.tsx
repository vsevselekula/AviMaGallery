import type { Metadata } from 'next';
// import { Inter } from 'next/font/google'; // Удален неиспользуемый импорт Inter
import './globals.css';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

// const inter = Inter({ subsets: ['latin'] }); // Удалена неиспользуемая переменная inter

export const metadata: Metadata = {
  title: 'Avito Gallery',
  description: 'Управление рекламными кампаниями Avito',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
} 