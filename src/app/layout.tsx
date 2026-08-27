import type { Metadata } from "next";
import { Archivo, Public_Sans } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { site } from "@/lib/site";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-archivo",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  // "./" resolves against each route's own path, so every page gets a self-referencing
  // canonical and og:url while inheriting type, locale, and siteName. Titles and
  // descriptions flow into og:* and twitter:* from each page's own metadata.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    url: "./",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "./",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${publicSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
