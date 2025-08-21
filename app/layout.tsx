import './globals.css';
import RegisterSW from './components/RegisterSW';

export const metadata = {
  title: 'Waybinder Guest Guide',
  description: 'Offline-ready guest guide with PDF and QR stickers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        data-theme="dark"
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          color: 'var(--fg)',
        }}
      >
        {/* Sticky, glassy top bar */}
        <header className="wb-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <strong style={{ fontWeight: 700 }}>Waybinder</strong>
            <span style={{ opacity: 0.6, fontSize: 12 }}>Guest Guide</span>
          </div>
          <div style={{ marginLeft: 'auto' }} />
        </header>

        {/* Page content container */}
        <main style={{ maxWidth: 1100, margin: '24px auto', padding: '0 20px' }}>
          {children}
        </main>

        {/* Registers /public/sw.js once on mount */}
        <RegisterSW />
      </body>
    </html>
  );
}
