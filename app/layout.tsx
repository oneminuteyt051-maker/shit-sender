import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Используем Inter вместо Geist
import "./globals.css";
import AppWalletProvider from "./providers";

// Инициализируем Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Poop Protocol | Solana Blinks",
  description: "The premier crypto-prank service on Solana.",
  other: {
    "solana:action": "https://shit-sender.vercel.app/api/actions/poop"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
