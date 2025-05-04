import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Providers } from './providers';
import { cookies } from 'next/headers';
import { I18nProvider } from './i18n/I18nProvider';
import { getTranslation } from './i18n/server';
import { cookieName } from './i18n/settings';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Loan Browser',
  description: 'Interactive loan calculation and visualization tool',
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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <I18nProvider lang={'en'}>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="container mx-auto py-6 px-4 flex-grow">{children}</main>
              <Footer />
            </div>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
