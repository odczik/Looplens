import type { Metadata } from "next";
import { Quicksand, Roboto, Roboto_Mono, Rubik } from "next/font/google";
import "./globals.css";

import Navbar from '@/app/_components/navbar';

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const rubikSans = Rubik({
  variable: "--font-rubik-sans",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const quickSandSans = Quicksand({
  variable: "--font-quicksand-sans",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Looplens',
  description: 'Explore algorithms with Looplens, a platform for visualizing and understanding algorithms through interactive examples.',
  creator: 'odczik',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'Looplens',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoSans.variable} ${robotoMono.variable} ${rubikSans.variable} ${quickSandSans.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}