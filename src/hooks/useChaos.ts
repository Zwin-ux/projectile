import { useState, useCallback } from 'react';
import { Vector3 } from '@/lib/simulation/types';

interface ChaosParams {
    wind: Vector3;
    gravityScale: number;
    description: string;
}

export function useChaos() {
    const [chaosParams, setChaosParams] = useState<ChaosParams>({
        wind: { x: 0, y: 0, z: 0 },
        gravityScale: 1.0,
        description: "Calm"
    });

    const generateChaos = useCallback(() => {
        // Random wind between -5 and 5 on X and Z
        const windX = (Math.random() - 0.5) * 10;
        const windZ = (Math.random() - 0.5) * 10;

        // Gravity scale between 0.8 and 1.2
        const gravityScale = 0.8 + Math.random() * 0.4;

        let desc = "";
        if (Math.abs(windX) > 3) desc += "High Wind! ";
        if (gravityScale > 1.1) desc += "Heavy Gravity! ";
        else if (gravityScale < 0.9) desc += "Low Gravity! ";

        if (desc === "") desc = "Mild Conditions";

        setChaosParams({
            wind: { x: windX, y: 0, z: windZ },
            gravityScale,
            description: desc
        });
    }, []);

    const resetChaos = useCallback(() => {
        setChaosParams({
            wind: { x: 0, y: 0, z: 0 },
            gravityScale: 1.0,
            description: "Calm"
        });
    }, []);

    return {
        chaosParams,
        generateChaos,
        resetChaos
    };
}
