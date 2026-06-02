import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import Header from "@/src/components/Header/header";
import Footer from "@/src/components/Footer/footer";

import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Templo sahkti",
  description: "Vive una experiencia de masaje nuru y tántrico en Pachuca diseñada para despertar los sentidos, liberar tensiones y crear momentos de auténtico bienestar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${manrope.variable} h-full antialiased`}
    >

      <body>
        <Header />
        {children}
        <Footer />
      </body>

    </html>
  );
}