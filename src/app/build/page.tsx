import { Suspense } from 'react';
import StageBuilder from '@/components/StageBuilder';

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-[#06b6d4] font-mono">Loading...</div>
    </div>}>
      <StageBuilder />
    </Suspense>
  );
}
