import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Loan Browser',
  description: 'Interactive loan calculation and visualization tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-blue-600 p-4 text-white">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Loan Browser</h1>
          </div>
        </header>
        <main className="container mx-auto py-6 px-4">{children}</main>
        <footer className="bg-gray-100 p-4 text-center text-gray-600">
          <div className="container mx-auto">
            <p>© {new Date().getFullYear()} Loan Browser - For educational purposes only</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
