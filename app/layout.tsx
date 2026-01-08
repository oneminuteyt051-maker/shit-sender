import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ОБНОВЛЕННЫЕ МЕТАДАННЫЕ
export const metadata: Metadata = {
  title: "Poop Protocol | Solana Blinks",
  description: "The premier crypto-prank service on Solana. Send poop, get immunity, enjoy the vibes.",
  openGraph: {
    title: "Poop Protocol",
    description: "Send your friends a crypto-poop via Solana Blinks.",
    images: ["/poop-cover.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Poop Protocol",
    description: "Send your friends a crypto-poop via Solana Blinks.",
    images: ["/poop-cover.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}