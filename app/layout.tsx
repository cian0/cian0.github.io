import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Retro Cyberpunk App",
  description: "A retro cyberpunk-themed Next.js application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} retro-body`}>
        <div className="retro-layout">
          <nav className="retro-nav">
            <Link href="/" className="retro-nav-item">🏠 Home</Link>
            <Link href="/chat" className="retro-nav-item">💬 Chat</Link>
            <Link href="/games" className="retro-nav-item">🎮 Games</Link>
          </nav>
          <main className="retro-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}