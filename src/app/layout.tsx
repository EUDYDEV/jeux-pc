import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Manrope } from "next/font/google";
import "./globals.css";
import { SelectionProvider } from "@/context/SelectionContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SITE } from "@/lib/config";

const display = Chakra_Petch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const body = Manrope({ variable: "--font-body", subsets: ["latin"] });

const description =
  "Catalogue de jeux PC, vérification de compatibilité et réservation d'installation à Abidjan. À domicile ou à distance.";

export const metadata: Metadata = {
  title: { default: `${SITE.name} — Installation de jeux PC à Abidjan`, template: `%s | ${SITE.name}` },
  description,
  keywords: ["installation jeux PC", "Abidjan", "jeux PC Côte d'Ivoire", "installation à distance", "GTA", "FC 25"],
  openGraph: {
    title: `${SITE.name} — Vos jeux préférés, installés sur votre PC`,
    description,
    locale: "fr_CI",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#07070d", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.name,
  description,
  areaServed: "Abidjan",
  telephone: `+${SITE.whatsappIntl}`,
  address: { "@type": "PostalAddress", addressLocality: "Abidjan", addressCountry: "CI" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SelectionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsApp />
        </SelectionProvider>
      </body>
    </html>
  );
}
