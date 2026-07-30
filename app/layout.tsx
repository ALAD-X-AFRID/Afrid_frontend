import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { MetadataProvider } from "@/context/metadata-context";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileTabBar from "@/components/layout/mobile-tab-bar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://afrid.io";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "AFRID — The Foundation of Sovereign Intelligence",
    template: "%s | AFRID",
  },
  description:
    "AFRID is an infrastructure-grade data refinery that turns Africa's rich, multi-modal human data into production-grade AI assets. Join the movement to make Africa a data-owning participant in the global AI economy.",
  keywords: [
    "African AI",
    "data marketplace",
    "voice data",
    "language data",
    "AI training data",
    "African languages",
    "data sovereignty",
    "speech recognition",
    "NLP",
    "machine learning",
  ],
  authors: [{ name: "AFRID" }],
  creator: "AFRID",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "AFRID",
    title: "AFRID — The Foundation of Sovereign Intelligence",
    description:
      "Turn your voice, your language, your everyday actions into high-value infrastructure. Join the movement to make Africa a data-owning participant in the AI economy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AFRID — The Foundation of Sovereign Intelligence",
    description:
      "Turn your voice, your language, your everyday actions into high-value infrastructure.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(typeof window!=='undefined'){window.history.scrollRestoration='manual';window.scrollTo(0,0);}`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <div className="noise-overlay" aria-hidden="true" />
        <MotionConfig reducedMotion="user">
          <MetadataProvider>
            <ToastProvider>
              <Navbar />
              <ErrorBoundary>
                <main className="relative w-full min-h-screen overflow-x-hidden pb-16 md:pb-0">{children}</main>
              </ErrorBoundary>
              <Footer />
              <MobileTabBar />
            </ToastProvider>
          </MetadataProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
