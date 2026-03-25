import type { Metadata } from "next";
import { Lora, Caveat, Bebas_Neue, Great_Vibes, Poppins, Inter } from "next/font/google";
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

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${lora.variable} ${caveat.variable} ${bebasNeue.variable} ${greatVibes.variable} ${poppins.variable} ${inter.variable} h-full`}
    >
      <head>
        <meta name="theme-color" content="#3C1F0A" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
