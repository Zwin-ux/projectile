"use client";

import { useState, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Sphere, Html } from "@react-three/drei";
import { ShotRecord } from "@/lib/telemetry/types";
import { Vector3 } from "@/lib/simulation/types";

interface TheoryModeProps {
    shot: ShotRecord;
    onClose: () => void;
}

export default function TheoryMode({ shot, onClose }: TheoryModeProps) {
    const [playbackTime, setPlaybackTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const maxTime = shot.flightTime;

    useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();

        const animate = (time: number) => {
            if (isPlaying) {
                const delta = (time - lastTime) / 1000;
                setPlaybackTime((prev) => {
                    const next = prev + delta * playbackSpeed;
                    if (next >= maxTime) {
                        setIsPlaying(false);
                        return maxTime;
                    }
                    return next;
                });
            }
            lastTime = time;
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying, playbackSpeed, maxTime]);

    const currentPosition = useMemo(() => {
        // Find the two points surrounding the current time
        // This assumes trajectory points are sorted by time, which they should be from the solver
        // However, the solver returns points with 'time' property? 
        // Let's check SimulationResult types. The solver returns TrajectoryPoint which has { p: Vector3, v: Vector3, t: number }

        // We need to verify the structure of shot.result.trajectory
        // Assuming it matches TrajectoryPoint[]

        const trajectory = shot.result.trajectory;
        if (!trajectory || trajectory.length === 0) return { x: 0, y: 0, z: 0 };

        // Simple linear interpolation
        // Find index where t > playbackTime
        const nextIndex = trajectory.findIndex(p => p.time > playbackTime);

        if (nextIndex === -1) {
            // End of trajectory
            const last = trajectory[trajectory.length - 1];
            return last.position;
        }

        if (nextIndex === 0) {
            return trajectory[0].position;
        }

        const prev = trajectory[nextIndex - 1];
        const next = trajectory[nextIndex];

        const factor = (playbackTime - prev.time) / (next.time - prev.time);

        return {
            x: prev.position.x + (next.position.x - prev.position.x) * factor,
            y: prev.position.y + (next.position.y - prev.position.y) * factor,
            z: prev.position.z + (next.position.z - prev.position.z) * factor
        };
    }, [shot.result.trajectory, playbackTime]);

    const currentVelocity = useMemo(() => {
        const trajectory = shot.result.trajectory;
        if (!trajectory || trajectory.length === 0) return { x: 0, y: 0, z: 0 };

        const nextIndex = trajectory.findIndex(p => p.time > playbackTime);

        if (nextIndex === -1) return trajectory[trajectory.length - 1].velocity;
        if (nextIndex === 0) return trajectory[0].velocity;

        const prev = trajectory[nextIndex - 1];
        return prev.velocity; // Step-wise velocity for now
    }, [shot.result.trajectory, playbackTime]);

    const points = useMemo(() => {
        return shot.result.trajectory.map(p => new THREE.Vector3(p.position.x, p.position.y, p.position.z));
    }, [shot.result.trajectory]);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            {/* Header */}
            <div className="h-14 border-b border-[#1e40af] bg-black flex items-center justify-between px-6">
                <h2 className="text-[#06b6d4] font-mono font-bold tracking-widest">THEORY MODE // REPLAY ANALYZER</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white font-mono text-sm"
                >
                    [ CLOSE ]
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* 3D Viewport */}
                <div className="flex-1 relative">
                    <Canvas camera={{ position: [10, 5, 20], fov: 50 }}>
                        <color attach="background" args={["#050505"]} />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />

                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                            <planeGeometry args={[300, 300]} />
                            <meshStandardMaterial color="#111" wireframe />
                        </mesh>

                        {/* Trajectory Line */}
                        <Line points={points} color="#1e40af" lineWidth={1} dashed dashScale={2} dashSize={1} gapSize={1} />

                        {/* Projectile Ghost */}
                        <Sphere args={[0.3, 16, 16]} position={[currentPosition.x, currentPosition.y, currentPosition.z]}>
                            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
                        </Sphere>

                        {/* Data Label */}
                        <Html position={[currentPosition.x, currentPosition.y + 1, currentPosition.z]}>
                            <div className="bg-black/80 border border-[#06b6d4] p-2 rounded text-[10px] font-mono text-[#06b6d4] whitespace-nowrap">
                                <div>T: {playbackTime.toFixed(2)}s</div>
                                <div>H: {currentPosition.y.toFixed(2)}m</div>
                                <div>V: {Math.sqrt(currentVelocity.x ** 2 + currentVelocity.y ** 2).toFixed(1)}m/s</div>
                            </div>
                        </Html>

                        <OrbitControls />
                    </Canvas>
                </div>

                {/* Sidebar Controls */}
                <div className="w-80 border-l border-[#1e40af] bg-black/50 p-6 flex flex-col gap-6">
                    {/* Playback Controls */}
                    <div>
                        <h3 className="text-xs font-mono text-[#1e40af] mb-4 uppercase tracking-widest">Playback</h3>

                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`flex-1 py-2 font-mono text-xs border rounded ${isPlaying ? 'border-[#06b6d4] text-[#06b6d4]' : 'border-gray-700 text-gray-400'}`}
                            >
                                {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
                            </button>
                            <button
                                onClick={() => { setIsPlaying(false); setPlaybackTime(0); }}
                                className="px-4 py-2 font-mono text-xs border border-gray-700 text-gray-400 rounded hover:text-white"
                            >
                                ↺
                            </button>
                        </div>

                        <div className="mb-4">
                            <input
                                type="range"
                                min="0"
                                max={maxTime}
                                step="0.01"
                                value={playbackTime}
                                onChange={(e) => { setIsPlaying(false); setPlaybackTime(Number(e.target.value)); }}
                                className="w-full accent-[#06b6d4]"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
                                <span>0.00s</span>
                                <span>{maxTime.toFixed(2)}s</span>
                            </div>
                        </div>

                        <div className="flex gap-1 justify-center">
                            {[0.5, 1, 2].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setPlaybackSpeed(s)}
                                    className={`px-2 py-1 text-[10px] font-mono border rounded ${playbackSpeed === s ? 'border-[#06b6d4] text-[#06b6d4]' : 'border-gray-800 text-gray-600'}`}
                                >
                                    {s}x
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Shot Data */}
                    <div>
                        <h3 className="text-xs font-mono text-[#1e40af] mb-4 uppercase tracking-widest">Shot Data</h3>
                        <div className="space-y-2 text-xs font-mono text-gray-300">
                            <div className="flex justify-between">
                                <span className="text-gray-500">ID</span>
                                <span className="text-gray-400">{shot.id.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Speed</span>
                                <span>{Math.sqrt(shot.params.initialVelocity.x ** 2 + shot.params.initialVelocity.y ** 2).toFixed(1)} m/s</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Angle</span>
                                <span>{(Math.atan2(shot.params.initialVelocity.y, shot.params.initialVelocity.x) * 180 / Math.PI).toFixed(1)}°</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Max Height</span>
                                <span className="text-[#06b6d4]">{shot.maxHeight.toFixed(2)} m</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Range</span>
                                <span className="text-[#06b6d4]">{shot.range.toFixed(2)} m</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import * as THREE from 'three';
