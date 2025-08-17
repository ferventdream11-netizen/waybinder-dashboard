'use client';

import Image from 'next/image';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="wb-header">
      {/* Logo file goes in /public/brand/waybinder-logo.png */}
      <Image
        src="/brand/waybinder-logo.png"
        alt="Waybinder"
        width={112}
        height={28}
        className="wb-logo"
        priority
      />
      <div className="wb-title">Waybinder</div>
      <div style={{ marginLeft: 'auto' }}>
        <ThemeToggle />
      </div>
    </header>
  );
}
