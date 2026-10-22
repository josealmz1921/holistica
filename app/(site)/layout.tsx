import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import Header from "@/src/components/Header/header";
import Footer from "@/src/components/Footer/footer";
import SiteAnalytics from "@/src/components/Analytics/siteAnalytics";
import { getSiteUrl } from "@/src/utilities/blogSeo";

import "@/app/globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const siteOrigin = getSiteUrl();
export const metadata: Metadata = {
  ...(siteOrigin ? { metadataBase: new URL(siteOrigin) } : {}),
  title: "Flor de luna",
  description: "Vive una experiencia de masaje nuru y tántrico en Pachuca diseñada para despertar los sentidos, liberar tensiones y crear momentos de auténtico bienestar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${ebGaramond.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="siteBg">
        <Header />
        {children}
        <Footer />
        <SiteAnalytics />
      </body>

    </html>
  );
}
