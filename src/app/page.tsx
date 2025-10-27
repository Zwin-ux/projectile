import Link from 'next/link';
import Image from 'next/image';
import Scene from '@/components/Scene';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={32} 
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-100 tracking-tight leading-tight">
                  3D Projectile Simulator
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Visualize physics in motion
                </p>
              </div>
            </div>
            <nav>
              <Link
                href="/theory"
                className="text-xs sm:text-sm text-accent hover:text-accent-400 transition-colors font-medium"
              >
                Theory →
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Scene />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-xs text-gray-500 text-center">
            Next.js · React Three Fiber · TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}
