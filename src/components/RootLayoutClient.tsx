'use client';

import { useState, useEffect } from 'react';
import AppHeader from './AppHeader';
import { TutorialModal } from './TutorialModal';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCheckedTutorial, setHasCheckedTutorial] = useState(false);

  useEffect(() => {
    // Check if user has completed tutorial
    const completed = localStorage.getItem('parabola_tutorial_completed');
    if (!completed) {
      setShowTutorial(true);
    }
    setHasCheckedTutorial(true);
  }, []);

  const handleCompleteTutorial = () => {
    localStorage.setItem('parabola_tutorial_completed', 'true');
    setShowTutorial(false);
  };

  const handleSkipTutorial = () => {
    localStorage.setItem('parabola_tutorial_completed', 'true');
    setShowTutorial(false);
  };

  const handleOpenTutorial = () => {
    setShowTutorial(true);
  };

  return (
    <>
      <AppHeader onOpenTutorial={handleOpenTutorial} />
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>

      {/* Only show tutorial after we've checked localStorage to prevent flashing */}
      {hasCheckedTutorial && showTutorial && (
        <TutorialModal
          onComplete={handleCompleteTutorial}
          onSkip={handleSkipTutorial}
        />
      )}
    </>
  );
}
