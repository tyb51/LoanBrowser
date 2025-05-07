import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { cookies } from 'next/headers';
import { I18nProvider } from './i18n/I18nProvider';
import { getTranslation } from './i18n/server';
import { cookieName } from './i18n/settings';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LoanLogic - Smart Loan Visualization',
  description: 'Interactive loan calculation and visualization tools to help you make better financial decisions',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies();
  const langCookie = cookieStore.get(cookieName);
  const lang = langCookie?.value || 'en';
  
  // Wait for server translation to initialize
  await getTranslation('translation');

  return (
    <html lang={lang}>
      <body className={inter.className}>
        <Providers>
          <I18nProvider lang={lang}>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow pt-20">
                {children}
              </main>
              <Footer />
            </div>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}