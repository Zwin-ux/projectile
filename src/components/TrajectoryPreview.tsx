import React, { useMemo } from 'react';
import { Line, Sphere } from '@react-three/drei';
import { solveShot } from '@/lib/simulation/solver';
import { SimulationParams, Vector3 } from '@/lib/simulation/types';

export type PreviewTier = 0 | 1 | 2 | 3;

interface TrajectoryPreviewProps {
    params: SimulationParams;
    tier: PreviewTier;
}

export default function TrajectoryPreview({ params, tier }: TrajectoryPreviewProps) {
    // Calculate trajectory for preview
    // We use a slightly larger timestep for preview to save performance, or same if needed for accuracy
    const result = useMemo(() => {
        if (tier === 0) return { trajectory: [], apex: { position: { x: 0, y: 0, z: 0 } } }; // Return dummy data if disabled
        return solveShot({
            ...params,
            timeStep: 0.05, // Coarser step for preview
            maxTime: 10 // Limit preview time
        });
    }, [params, tier]);

    const points = useMemo(() => {
        return result.trajectory.map(p => [p.position.x, p.position.y, p.position.z] as [number, number, number]);
    }, [result]);

    const apex = result.apex;

    // Tier 0: No preview
    if (tier === 0) return null;

    return (
        <group>
            {/* Tier 1: Path Line */}
            <Line
                points={points}
                color="rgba(255, 255, 255, 0.3)"
                lineWidth={1}
                dashed
                dashScale={2}
                dashSize={1}
                gapSize={1}
            />

            {/* Tier 2: Apex Marker */}
            {tier >= 2 && (
                <mesh position={[apex.position.x, apex.position.y, apex.position.z]}>
                    <sphereGeometry args={[0.2, 8, 8]} />
                    <meshBasicMaterial color="#ffff00" opacity={0.6} transparent />
                </mesh>
            )}

            {/* Tier 3: Time Ticks (every 0.5s) */}
            {tier >= 3 && result.trajectory.map((p, i) => {
                // Show tick every ~0.5s. Since dt=0.05, that's every 10 frames
                if (i % 10 === 0 && i > 0) {
                    return (
                        <mesh key={i} position={[p.position.x, p.position.y, p.position.z]}>
                            <sphereGeometry args={[0.1, 8, 8]} />
                            <meshBasicMaterial color="#00ffff" opacity={0.4} transparent />
                        </mesh>
                    );
                }
                return null;
            })}
        </group>
    );
}

export const TrajectoryPreviewMemo = React.memo(TrajectoryPreview);
