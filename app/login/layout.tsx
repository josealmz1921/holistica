import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";

import "@/app/globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Login - Flor de luna",
  description: "",
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
      <body className="siteBg">
        {children}
      </body>
    </html>
  );
}