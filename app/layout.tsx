import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Agentic Chess',
  description: 'Play live and daily chess, solve puzzles, analyze performance.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="container">
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/live">Live</Link>
            <Link href="/daily">Daily</Link>
            <Link href="/puzzles">Puzzles</Link>
            <Link href="/analysis">Analysis</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="container muted">? {new Date().getFullYear()} Agentic Chess</footer>
      </body>
    </html>
  );
}
