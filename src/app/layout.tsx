import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SaaS App Template',
  description:
    'A comprehensive SaaS application template built with Next.js, TypeScript, and modern tools',
  keywords: ['SaaS', 'Next.js', 'TypeScript', 'Template', 'Starter'],
  authors: [{ name: 'SaaS Template Team' }],
  openGraph: {
    title: 'SaaS App Template',
    description: 'A comprehensive SaaS application template',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
