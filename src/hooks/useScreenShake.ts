import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ScreenShakeOptions {
  intensity?: number;
  duration?: number;
}

/**
 * Hook for camera shake effect on hits
 */
export function useScreenShake() {
  const { camera } = useThree();
  const shakeRef = useRef({
    isShaking: false,
    intensity: 0,
    duration: 0,
    elapsed: 0,
    originalPosition: new THREE.Vector3(),
  });

  const triggerShake = ({ intensity = 0.3, duration = 0.3 }: ScreenShakeOptions = {}) => {
    shakeRef.current = {
      isShaking: true,
      intensity,
      duration,
      elapsed: 0,
      originalPosition: camera.position.clone(),
    };
  };

  useFrame((state, delta) => {
    const shake = shakeRef.current;
    
    if (!shake.isShaking) return;

    shake.elapsed += delta;

    if (shake.elapsed >= shake.duration) {
      // Reset to original position
      camera.position.copy(shake.originalPosition);
      shake.isShaking = false;
      return;
    }

    // Calculate shake intensity with decay
    const progress = shake.elapsed / shake.duration;
    const currentIntensity = shake.intensity * (1 - progress);

    // Apply random offset
    const offsetX = (Math.random() - 0.5) * currentIntensity;
    const offsetY = (Math.random() - 0.5) * currentIntensity;
    const offsetZ = (Math.random() - 0.5) * currentIntensity;

    camera.position.set(
      shake.originalPosition.x + offsetX,
      shake.originalPosition.y + offsetY,
      shake.originalPosition.z + offsetZ
    );
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (shakeRef.current.isShaking) {
        camera.position.copy(shakeRef.current.originalPosition);
      }
    };
  }, [camera]);

  return { triggerShake };
}
