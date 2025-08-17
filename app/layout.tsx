import './globals.css';
import type { Metadata } from 'next';
import Header from './components/Header';
import { ui, headline } from './fonts'; // fonts.ts coming next

export const metadata: Metadata = {
  title: 'Waybinder',
  description: 'Designer-grade guest guides in minutes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Set theme before paint to avoid flicker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('wb-theme');
                if (t === 'light') document.documentElement.setAttribute('data-theme','light');
                else document.documentElement.removeAttribute('data-theme');
              } catch (e) {}
            `,
          }}
        />
      </head>
      {/* Apply font CSS variables from next/font */}
      <body className={`${ui.variable} ${headline.variable}`}>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
