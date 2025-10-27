import Link from 'next/link';
import Scene from '@/components/Scene';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-100">
            Physics Lab: Multi-Sport Simulator 🏀🔫⚽🎯
          </h1>
          <p className="text-sm md:text-base text-neutral-400 mt-2">
            Basketball | Shooting Range | Soccer | Classic Targets - Choose your game mode and master the physics!
          </p>
          <nav className="mt-4">
            <Link
              href="/theory"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View Theory & Equations →
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Scene />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-neutral-500 text-center">
            Built with Next.js, React, Three.js, and react-three-fiber for scientific demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
