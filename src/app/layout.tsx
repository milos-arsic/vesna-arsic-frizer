import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SalonBackground } from "@/components/SalonBackground";
import { msg } from "@/lib/messages";
import "./globals.css";

const siteUrl =
  process.env.AUTH_URL?.replace(/\/$/, "") || "https://vesna.hair";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: msg.pageTitle,
  description: msg.pageDescription,
  openGraph: {
    title: msg.homeMetaTitle,
    description: msg.pageDescription,
    url: siteUrl,
    siteName: msg.navBrand,
    locale: "sr_RS",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr-Cyrl" className={`${manrope.variable} h-full antialiased`}>
      <body className="relative min-h-full font-sans text-stone-900">
        <SalonBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
