# Hit Detection & Visual Feedback Testing Guide

## Overview
This guide helps you test the newly integrated hit detection system and visual feedback features.

## Features Implemented

### 1. Hit Detection System
- **Segment-based collision detection** - Prevents fast projectiles from tunneling through targets
- **Per-shot tracking** - Each target can only be hit once per shot
- **Game store integration** - Hits are registered and scores are tracked
- **Support for both Scene types** - Works in official scenarios and custom stages

### 2. Visual Feedback
- **Particle Effects** - Explosion of particles on hit with physics simulation
- **Hit Markers** - Floating point indicators showing score earned
- **Ring Effects** - Expanding rings at hit location
- **Screen Shake** - Camera shake on successful hits
- **Color coding** - Gold effects for high-value hits (≥100 points)

### 3. Score System
- **Real-time score display** - Updates immediately on hit
- **Session tracking** - Maintains score across multiple shots
- **Game store persistence** - Uses Zustand for state management

## Testing Checklist

### Basic Hit Detection
- [ ] Fire projectile at a target
- [ ] Verify hit is detected when projectile passes through target
- [ ] Check that score increases correctly
- [ ] Confirm target can only be hit once per shot
- [ ] Test with different projectile types (basketball, bullet, soccerball, etc.)

### Visual Feedback
- [ ] **Particle Effect**: Verify particles explode outward from hit point
- [ ] **Hit Marker**: Check floating sphere appears at hit location
- [ ] **Ring Effect**: Confirm expanding ring animation plays
- [ ] **Screen Shake**: Feel camera shake on hit
- [ ] **Color Coding**: High-value hits show gold effects

### Scenarios to Test

#### 1. Classic Scenario
- Navigate to Classic Targets scenario
- Fire at ring targets at 30m, 50m, 75m, 100m
- Each hit should award 100 points
- Verify all visual effects trigger

#### 2. Basketball Scenario
- Switch to Arc Elevation Drill
- Test hits at different distances (15m, 23.75m, 30m, 47m)
- Verify basketball projectile works correctly
- Check arc trajectory hits elevated targets

#### 3. Soccer Scenario
- Switch to Low-Angle Trajectory Drill
- Test ground-level shots
- Verify low-angle hits are detected
- Check soccerball projectile behavior

#### 4. Shooting Range
- Switch to Plate Test scenario
- Test bullet projectile (fastest speed)
- Verify hit detection works with high-speed projectiles
- Confirm no tunneling occurs

### Custom Stages
- [ ] Create or load a custom stage
- [ ] Fire at custom targets
- [ ] Verify hit detection works with custom target positions
- [ ] Check that custom target points are awarded correctly

### Edge Cases
- [ ] **Multiple targets in path**: Fire through multiple targets, verify each is hit once
- [ ] **Near misses**: Fire just outside target radius, verify no hit
- [ ] **Fast projectiles**: Use bullet type, verify no tunneling
- [ ] **Slow projectiles**: Use basketball, verify smooth detection
- [ ] **Rapid fire**: Fire multiple shots quickly, verify score updates correctly

### Performance
- [ ] Check frame rate remains smooth with effects
- [ ] Verify particle effects clean up properly
- [ ] Ensure no memory leaks after many shots
- [ ] Test with multiple simultaneous effects

## Known Configuration

### Target Specifications (Scene.tsx)
- **Default radius**: 1.0 units
- **Default points**: 100 per hit
- **Hit detection**: Segment-based sphere intersection

### Custom Stages (SceneWithCustomStages.tsx)
- Uses custom target radius and points from stage definition
- Supports dynamic target positions via position map
- Same visual feedback as official scenarios

## Debugging Tips

### If hits aren't detected:
1. Check target radius in scenario config
2. Verify projectile is passing through target sphere
3. Check console for hit detection logs (if added)
4. Ensure `onCheckHit` callback is connected

### If visual effects don't appear:
1. Verify `hitEffects` state is updating
2. Check that effect components are rendering
3. Ensure Three.js context is available
4. Check for console errors

### If score doesn't update:
1. Verify `registerHit` is being called
2. Check game store state in React DevTools
3. Ensure `useGameStore` hook is connected
4. Verify score display is reading from store

## Next Steps

### Potential Enhancements
- Add sound effects on hit
- Implement combo multipliers for consecutive hits
- Add hit streak indicators
- Create different effect styles for different target types
- Add proximity feedback (near-miss indicators)
- Implement slow-motion on hit
- Add target destruction animations

### Tutorial Flow Integration
- Connect hit detection to tutorial steps
- Add guided targeting assistance
- Implement progressive difficulty
- Add achievement system for first hits

## File Structure

```
src/
├── components/
│   ├── Scene.tsx                    # Main scene with hit detection
│   ├── SceneWithCustomStages.tsx    # Custom stage scene with hit detection
│   ├── HitEffects.tsx               # Visual feedback components
│   └── Projectile.tsx               # Projectile with onCheckHit callback
├── hooks/
│   └── useScreenShake.ts            # Screen shake effect hook
├── lib/
│   ├── hitDetection.ts              # Core hit detection logic
│   ├── gameConfig.ts                # Target specifications
│   └── scenarioConfig.ts            # Scenario definitions
└── store/
    └── gameStore.ts                 # Zustand store for game state
```

## Success Criteria

✅ Projectiles detect hits accurately
✅ Visual feedback plays on every hit
✅ Score updates in real-time
✅ No performance degradation
✅ Works across all scenarios
✅ Custom stages supported
✅ No tunneling with fast projectiles
✅ Clean effect cleanup
