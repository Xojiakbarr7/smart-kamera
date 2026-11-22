import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrderProvider } from "@/components/providers/OrderProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SecureCam — Smart kuzatuv kameralari, NVR, xavfsizlik tizimlari",
    template: "%s | SecureCam",
  },
  description: "O'zbekistonda smart IP kameralar, WiFi, 4G, AHD kameralar va videoregistratorlar (NVR). Rasmiy kafolat, bepul yetkazib berish, professional o'rnatuv.",
  keywords: ["IP kamera", "WiFi kamera", "4G kamera", "AHD kamera", "NVR", "kuzatuv kamerasi", "xavfsizlik tizimi", "o'rnatuv", "Toshkent"],
  authors: [{ name: "SecureCam" }],
  creator: "SecureCam",
  publisher: "SecureCam",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://securecam.uz",
    siteName: "SecureCam",
    title: "SecureCam — Smart kuzatuv kameralari",
    description: "Sifatli kuzatuv kameralari, professional o'rnatuv, rasmiy kafolat",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureCam — Smart kuzatuv kameralari",
    description: "Sifatli kuzatuv kameralari, professional o'rnatuv, rasmiy kafolat",
    images: ["/og-image.jpg"],
  },
  verification: {
    yandex: "your-yandex-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${inter.variable} ${display.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-white dark:bg-dark-950 text-dark-900 dark:text-dark-100 antialiased min-h-screen flex flex-col">
        <OrderProvider>
          <Header />
          <main className="flex-1 pt-32 md:pt-28">{children}</main>
          <Footer />
        </OrderProvider>
      </body>
    </html>
  );
}