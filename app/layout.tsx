import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Foodscope – Lebensmittel besser verstehen",
    template: "%s | Foodscope",
  },
  description:
    "Nährwerte, Zutaten und Herkunft von Lebensmitteln in einem klaren Überblick.",
  applicationName: "Foodscope",
  openGraph: {
    title: "Foodscope – Lebensmittel besser verstehen",
    description:
      "Produkte über Barcode oder Suche finden und die verfügbaren Daten von Open Food Facts vergleichen.",
    type: "website",
  },
};

const themeScript =
  "(function(){try{var t=localStorage.getItem('foodscope:theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>
          <div className="app-shell">
            <Navbar />
            <main className="app-main">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
