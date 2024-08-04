import React from 'react';
import Link from 'next/link';

const Layout = ({ children }) => {
  return (
    <div className="retro-container">
      <nav className="retro-nav">
        <Link href="/" className="retro-nav-item">🏠 Home</Link>
        <a href="mailto:your-email@example.com?subject=Inquiry from Website&body=Hi, I would like to discuss..." className="retro-nav-item">📧 Email Me</a>
        <Link href="/games" className="retro-nav-item">🎮 Games</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
