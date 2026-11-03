import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import {StoreProvider} from '@/lib/store';
import {Shell} from '@/components/shell';
import {Suspense} from 'react';

export const metadata: Metadata = {
  title: "MMSU CommuteHub | Campus commute, simplified",
  description: "Plan your MMSU campus trip with clearly labeled illustrative route information.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><StoreProvider><Suspense fallback={<main className="content">Loading CommuteHub…</main>}><Shell>{children}</Shell></Suspense></StoreProvider></body>
    </html>
  );
}
