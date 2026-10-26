import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import "@/app/globals.css";

const heading = EB_Garamond({ subsets: ["latin"], variable: "--font-heading" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });
export const metadata: Metadata = { title: "Vista previa privada | Flor de luna", robots: { index: false, follow: false } };
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
    return <html lang="es" className={`${heading.variable} ${body.variable}`}><body className="siteBg">{children}</body></html>;
}
