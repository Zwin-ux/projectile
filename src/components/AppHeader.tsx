"use client";

import Link from "next/link";
import Image from "next/image";

interface AppHeaderProps {
  onOpenTutorial?: () => void;
}

export default function AppHeader({ onOpenTutorial }: AppHeaderProps = {}) {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#1e40af]">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex items-center justify-between h-12">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/parabola-logo.png"
              alt="Parabola"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <div className="leading-tight">
              <div className="text-white text-sm font-semibold tracking-widest">PARABOLA</div>
              <div className="text-[10px] text-gray-300 font-mono uppercase tracking-wider">3D PROJECTILE TRAINER</div>
            </div>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-5">
            <HeaderLink href="/">Home</HeaderLink>
            <HeaderLink href="/play">Play</HeaderLink>
            <HeaderLink href="/build">Build</HeaderLink>
            <HeaderLink href="/stages">Stages</HeaderLink>
            <HeaderLink href="/leaderboard">Leaderboard</HeaderLink>
            <HeaderLink href="/theory">Theory</HeaderLink>
            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                className="text-[#06b6d4] text-sm font-mono border border-[#06b6d4] px-2 py-1 rounded hover:bg-[#06b6d4]/10 transition-colors"
                title="Open Tutorial"
              >
                [ ? HELP ]
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-200 text-sm hover:underline hover:decoration-[#06b6d4] hover:decoration-2 underline-offset-4"
    >
      {children}
    </Link>
  );
}

