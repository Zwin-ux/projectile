'use client';

import React, { useState, useEffect } from 'react';
import { TutorialSpotlight } from './TutorialSpotlight';

interface TutorialModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  {
    title: 'WELCOME TO PARABOLA',
    description: [
      'An interactive 3D projectile physics simulator where you can:',
      '',
      '• Master projectile motion through training scenarios',
      '• Learn physics concepts in real-time',
      '• Build and share custom stages',
      '• Compete on leaderboards',
      '',
      'Let\'s take a quick tour to get you started!',
    ],
    image: '🎯',
  },
  {
    title: 'TRAINING DASHBOARD',
    description: [
      'This is your mission control center.',
      '',
      '• Choose from 4 official training programs:',
      '  - Basketball: Arc shots into hoops',
      '  - Shooting Range: Precision targeting',
      '  - Soccer: Goal-scoring challenges',
      '  - Classic: Traditional targets',
      '',
      '• Track your session stats on the right',
      '• See your progress and best streaks',
    ],
    image: '🎮',
  },
  {
    title: 'PHYSICS CONTROLS',
    description: [
      'Control your projectile\'s trajectory with precision.',
      '',
      '• Speed Slider: Adjust launch velocity (10-50 m/s)',
      '• Angle Slider: Set launch angle (0-90°)',
      '• Gravity Presets: Try Moon, Earth, Jupiter, or Custom',
      '• Projectile Type: Choose from various projectiles',
      '',
      'Watch the trajectory preview update in real-time!',
    ],
    image: '⚙️',
  },
  {
    title: 'AIMING & SHOOTING',
    description: [
      'Fire your projectile and hit targets for points.',
      '',
      '• Adjust speed and angle to line up your shot',
      '• Click FIRE to launch the projectile',
      '• Watch the 3D trajectory in action',
      '• Use the camera to view from different angles',
      '',
      'Tip: The trajectory preview shows where you\'ll shoot!',
    ],
    image: '🚀',
  },
  {
    title: 'SCORING SYSTEM',
    description: [
      'Earn points by hitting targets accurately.',
      '',
      '• Each target has a point value (10-500)',
      '• Build streaks by hitting consecutive shots',
      '• Track your accuracy percentage',
      '• Beat your high scores',
      '',
      'Moving targets are worth more points but harder to hit!',
    ],
    image: '🎯',
  },
  {
    title: 'CUSTOM STAGE BUILDER',
    description: [
      'Create your own unique challenges!',
      '',
      '• Place targets anywhere in 3D space',
      '• Add moving targets (orbit, bounce)',
      '• Set point values and behaviors',
      '• Share stages with others via export codes',
      '',
      'Access the builder from the navigation menu.',
    ],
    image: '🛠️',
  },
  {
    title: 'YOU\'RE READY!',
    description: [
      'You\'re all set to start playing!',
      '',
      '• Start with Basketball or Classic mode',
      '• Check out the Theory page to learn physics',
      '• Build custom stages when you\'re ready',
      '• Compete on the leaderboards',
      '',
      'Click the HELP button anytime to see this tutorial again.',
      '',
      'Good luck, and have fun! 🎉',
    ],
    image: '✨',
  },
];

export function TutorialModal({ onComplete, onSkip }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <TutorialSpotlight>
      <div
        className={`
          max-w-2xl mx-auto p-8
          bg-black border-2 border-[#06b6d4] rounded-lg
          shadow-[0_0_50px_rgba(6,182,212,0.3)]
          transition-all duration-300
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{step.image}</div>
            <div>
              <h2 className="text-2xl font-bold tracking-wider text-[#06b6d4] uppercase">
                {step.title}
              </h2>
              <p className="text-xs font-mono text-gray-400 mt-1">
                STEP {currentStep + 1} OF {tutorialSteps.length}
              </p>
            </div>
          </div>

          {/* Skip button */}
          {currentStep === 0 && (
            <button
              onClick={handleSkip}
              className="text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
            >
              [ SKIP ]
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[#06b6d4] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="space-y-2 mb-8 text-gray-200 font-mono text-sm leading-relaxed">
          {step.description.map((line, index) => (
            <p key={index} className={line === '' ? 'h-2' : ''}>
              {line}
            </p>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`
              px-6 py-3 text-sm font-mono border-2 rounded
              transition-all duration-200
              ${
                currentStep === 0
                  ? 'border-gray-700 text-gray-700 cursor-not-allowed'
                  : 'border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10'
              }
            `}
          >
            ← PREVIOUS
          </button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${
                    index === currentStep
                      ? 'bg-[#06b6d4] w-6'
                      : index < currentStep
                      ? 'bg-[#06b6d4]/50'
                      : 'bg-gray-700'
                  }
                `}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="
              px-6 py-3 text-sm font-mono
              border-2 border-[#06b6d4] text-[#06b6d4]
              hover:bg-[#06b6d4]/10
              transition-all duration-200 rounded
            "
          >
            {currentStep === tutorialSteps.length - 1 ? "LET'S GO! →" : 'NEXT →'}
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="mt-4 text-center text-xs font-mono text-gray-600">
          Use arrow keys or click buttons to navigate
        </div>
      </div>
    </TutorialSpotlight>
  );
}
