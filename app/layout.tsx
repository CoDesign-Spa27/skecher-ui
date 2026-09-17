import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Inspiration,
  Instrument_Serif,
  Raleway,
  Urbanist,
} from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";

import { ThemeProvider } from "@/components/provider/theme-provider";
import { TracwellAnalytics } from "@/components/tracwell-analytics";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createMetadata, createSoftwareSourceCodeJsonLd, createWebsiteJsonLd } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inspiration = Inspiration({
  variable: "--font-inspiration",
  subsets: ["latin"],
  weight: "400",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});
export const metadata: Metadata = createMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [createWebsiteJsonLd(), createSoftwareSourceCodeJsonLd()];

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${raleway.variable} ${inspiration.variable} ${instrumentSerif.variable} ${urbanist.variable} antialiased bg-background`}
      >
        <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
            <TracwellAnalytics />
          </ThemeProvider>
        </TooltipProvider>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </body>
    </html>
  );
}
