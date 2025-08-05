import { Toaster } from 'react-hot-toast';
import './globals.css';
import { ReduxProvider } from './ReduxProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TRIVO',
  description: 'Multinational company',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" reverseOrder={false} />
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
