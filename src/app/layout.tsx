import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExchangeRateBadge from '@/components/ExchangeRateBadge';
import { ExchangeRateProvider } from '@/context/ExchangeRateContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { getExchangeRate } from '@/lib/exchange-rate';
import { MessageCircle } from 'lucide-react';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Daian - Tu Tienda Online',
  description: 'Tienda online de moda femenina en Venezuela. Descubre nuestra colección de ropa y accesorios.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch exchange rate on server
  const exchangeData = await getExchangeRate();

  return (
    <html lang="es" className={`${plusJakarta.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <FavoritesProvider>
          <ExchangeRateProvider
            rate={exchangeData.promedio}
            fechaActualizacion={exchangeData.fechaActualizacion}
          >
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
              <Header />
              <main className="flex-1 pt-20">
                {children}
              </main>
              <Footer />

              {/* Exchange Rate Badge */}
              <ExchangeRateBadge />

              {/* Floating WhatsApp Button */}
              <a
                href="https://wa.me/584164974877"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-110 hover:bg-[#20bd5a]"
              >
                <MessageCircle className="h-7 w-7" />
              </a>
            </div>
          </ExchangeRateProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
