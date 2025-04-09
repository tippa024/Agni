import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AGNI",
  description: "No-Distraction Personal Digital System",
  icons: {
    icon: [
      { url: '/next.svg', sizes: 'any' }
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Add the React DevTools script here */}
        {process.env.NODE_ENV === 'development' && (
          <script src="http://localhost:8097"></script>
        )}
      </head>
      <body>
        <main>
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
