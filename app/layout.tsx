import type { Metadata } from "next";
import { Lora, Caveat } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MindMirror AI — Offline Voice Journal",
  description:
    "A privacy-first, offline AI-powered voice journaling application. Speak freely, reflect deeply, grow mindfully. All AI runs on your device — zero data leakage.",
  keywords: ["journaling", "voice journal", "AI", "offline", "privacy", "mental health", "mood tracking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${caveat.variable} h-full`}
    >
      <head>
        <meta name="theme-color" content="#3C1F0A" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
