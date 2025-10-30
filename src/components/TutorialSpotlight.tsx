'use client';

import React from 'react';

interface TutorialSpotlightProps {
  targetId?: string;
  children: React.ReactNode;
}

export function TutorialSpotlight({ targetId, children }: TutorialSpotlightProps) {
  return (
    <>
      {/* Dark overlay covering the entire screen */}
      <div
        className="fixed inset-0 bg-black/80 z-[9998] pointer-events-none"
        style={{
          transition: 'opacity 0.3s ease-in-out',
        }}
      />

      {/* Spotlight effect on target element if provided */}
      {targetId && (
        <div
          id={`spotlight-${targetId}`}
          className="fixed z-[9999] pointer-events-none"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
            border: '2px solid #06b6d4',
            borderRadius: '8px',
            transition: 'all 0.4s ease-in-out',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}

      {/* Tutorial content */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 20px rgba(6, 182, 212, 0.5);
          }
          50% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 40px rgba(6, 182, 212, 0.8);
          }
        }
      `}</style>
    </>
  );
}
