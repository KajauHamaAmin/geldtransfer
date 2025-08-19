import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Navigation } from "@/components/navigation";

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "Geldtransfer-Verwaltung",
  description: "Vollständiges Verwaltungssystem für Geldtransfer-Transaktionen (Western Union, Ria, MoneyGram)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className={inter.className}>
        <Navigation />
        
        <main className="pt-20 pb-8 min-h-screen">
          {children}
        </main>

        <footer className="py-6 text-center text-gray-500 text-xs border-t border-gray-200">
          <div className="container-modern">
            &copy; {new Date().getFullYear()} Geldtransfer-Verwaltung. Alle Rechte vorbehalten.
          </div>
        </footer>
      </body>
    </html>
  );
}