'use client';

import { useState, useEffect } from "react";
import { ShotRecord } from "@/lib/telemetry/types";

interface TutorialAssistantProps {
    shotHistory: ShotRecord[];
    currentScenarioId: string;
}

export default function TutorialAssistant({ shotHistory, currentScenarioId }: TutorialAssistantProps) {
    const [message, setMessage] = useState<string>("SYSTEM READY. WAITING FOR INPUT.");
    const [mood, setMood] = useState<'neutral' | 'happy' | 'thinking'>('neutral');

    useEffect(() => {
        if (shotHistory.length === 0) {
            if (currentScenarioId === 'basketball') {
                setMessage("Welcome to Arc Training. Aim high!");
            } else if (currentScenarioId === 'soccer') {
                setMessage("Ground targets active. Keep trajectories low.");
            } else {
                setMessage("Target range active. Calculate your parabolic curve.");
            }
            return;
        }

        const lastShot = shotHistory[shotHistory.length - 1];

        if (lastShot.hit) {
            setMood('happy');
            const compliments = ["EXCELLENT CALCULATION.", "TARGET NEUTRALIZED.", "PERFECT TRAJECTORY.", "OPTIMAL SOLUTION FOUND."];
            setMessage(compliments[Math.floor(Math.random() * compliments.length)]);
        } else {
            setMood('thinking');
            // Analyze miss
            // This is a simplified analysis. Ideally we'd know the target position relative to impact.
            // Since we don't have target pos here easily without prop drilling, we'll keep it generic or use the 'feedback' logic if available.

            // However, we can infer from the last result if we had target data.
            // For now, let's just give general physics tips based on the shot parameters.

            if (lastShot.impactAngle > 45 && currentScenarioId !== 'basketball') {
                setMessage("Impact angle too steep. Lower your launch angle for better range efficiency.");
            } else if (lastShot.impactAngle < 15 && currentScenarioId === 'basketball') {
                setMessage("Angle too shallow for basket entry. Increase elevation.");
            } else if (lastShot.range < 10) {
                setMessage("Short range detected. Increase velocity.");
            } else {
                setMessage("Miss detected. Recalibrate and fire again.");
            }
        }

        const timer = setTimeout(() => {
            setMood('neutral');
        }, 3000);
        return () => clearTimeout(timer);
    }, [shotHistory, currentScenarioId]);

    return (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm pointer-events-none">
            <div className={`p-4 border bg-black/80 backdrop-blur-sm transition-all duration-300 ${mood === 'happy' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' :
                    mood === 'thinking' ? 'border-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                        'border-[#06b6d4]'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${mood === 'happy' ? 'bg-green-500' :
                            mood === 'thinking' ? 'bg-[#f59e0b]' :
                                'bg-[#06b6d4]'
                        }`} />
                    <span className="text-xs font-mono font-bold tracking-widest text-gray-400">AI_ASSISTANT</span>
                </div>
                <p className="text-xs md:text-sm font-mono text-white leading-relaxed">
                    {`> ${message}`}
                </p>
            </div>
        </div>
    );
}
