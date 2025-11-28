"use client";

import { Suspense } from "react";
import SceneWrapper from "@/components/SceneWrapper";
import Link from "next/link";

function PlayContent() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="border-b border-[#1e40af] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-sm">
            <Link href="/" className="text-gray-200 hover:underline hover:decoration-[#06b6d4] underline-offset-4">
              Back to Dashboard
            </Link>
            <Link href="/theory" className="text-gray-200 hover:underline hover:decoration-[#06b6d4] underline-offset-4">
              Theory
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        <SceneWrapper />
      </main>

      <footer className="border-t border-[#1e40af] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-[11px] text-gray-500 text-center font-mono">
            Next.js • React Three Fiber • TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <PlayContent />
    </Suspense>
  );
}
