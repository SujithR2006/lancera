import { TargetZone } from './useSurgeryStore';

export const TARGET_ZONES: Record<number, TargetZone[]> = {
  // Step 2: Sternotomy (Precision Incision line)
  2: [
    { x: 0, y: 0.8, z: 0.5, radius: 0.2 },
    { x: 0, y: 0.4, z: 0.55, radius: 0.2 },
    { x: 0, y: 0, z: 0.6, radius: 0.2 },
    { x: 0, y: -0.4, z: 0.55, radius: 0.2 },
    { x: 0, y: -0.8, z: 0.5, radius: 0.2 },
  ],
  // Step 3: CPB Setup (Precise Cannulation sites)
  3: [
    { x: -0.4, y: 1.2, z: 0.2, radius: 0.15 }, // Aorta Site A
    { x: -0.6, y: 1.0, z: 0.1, radius: 0.15 }, // Aorta Site B
    { x: 0.6, y: 0, z: 0.4, radius: 0.2 },     // Right Atrium
  ],
  // Step 4: Harvesting Graft
  4: [
    { x: -1.2, y: 0.8, z: 0, radius: 0.25 },
    { x: -1.2, y: 0.4, z: 0, radius: 0.25 },
    { x: -1.2, y: 0, z: 0, radius: 0.25 },
  ],
  // Step 5: Aortic Clamping
  5: [
    { x: -0.4, y: 1.2, z: 0.2, radius: 0.15 },
  ],
  // Step 6: Performing Bypass Grafts (Sequential Sutures)
  6: [
    { x: -0.2, y: 0.4, z: 0.8, radius: 0.15 },
    { x: 0, y: 0.4, z: 0.82, radius: 0.15 },
    { x: 0.2, y: 0.4, z: 0.8, radius: 0.15 },
    { x: 0.3, y: -0.2, z: 0.7, radius: 0.15 },
    { x: 0.5, y: -0.2, z: 0.65, radius: 0.15 },
  ],
  // Step 8: Sternal Closure
  8: [
    { x: 0, y: 1, z: 0.5, radius: 0.15 },
    { x: 0, y: 0.5, z: 0.55, radius: 0.15 },
    { x: 0, y: 0, z: 0.6, radius: 0.15 },
    { x: 0, y: -0.5, z: 0.55, radius: 0.15 },
    { x: 0, y: -1, z: 0.5, radius: 0.15 },
  ],
};
