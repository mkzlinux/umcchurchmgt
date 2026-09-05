import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WesleyLink — Connected Church Management',
  description: 'Connected for ministry. Equipped for mission.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
