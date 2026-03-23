import { Suspense, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Line, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useSurgeryStore, GraftPoint } from '../../store/useSurgeryStore';

// ─── Procedural Heart Fallback ────────────────────────────────────────────────
function HeartFallback() {
  const groupRef = useRef<THREE.Group>(null!);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
      const beat = Math.sin(t.current * (Math.PI * 2 / 0.85));
      const scale = 1 + Math.max(0, beat) * 0.05;
      groupRef.current.scale.setScalar(scale);
    }
  });

  const heartMat = <meshStandardMaterial color="#cc2233" roughness={0.35} metalness={0.15} />;
  const vesselMat = <meshStandardMaterial color="#aa1122" roughness={0.4} metalness={0.2} />;

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        {heartMat}
      </mesh>
      <mesh position={[-0.35, 0.55, -0.1]} castShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        {heartMat}
      </mesh>
      <mesh position={[0.35, 0.55, -0.1]} castShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        {heartMat}
      </mesh>
      <mesh position={[0.1, 1.1, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.08, 0.1, 0.6, 16]} />
        {vesselMat}
      </mesh>
      <mesh position={[-0.15, 1.0, 0.1]} rotation={[0.3, 0, -0.3]}>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 16]} />
        {vesselMat}
      </mesh>
    </group>
  );
}

// ─── GLB Heart Model ──────────────────────────────────────────────────────────
function HeartGLB({ currentStep }: { currentStep: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/models/heart.glb');

  useEffect(() => {
    if (!scene || !groupRef.current) return;
    const clone = scene.clone();

    // Center model
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);

    // Scale to fit
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const scale = 1.2 / sphere.radius;
    clone.scale.setScalar(scale);

    // Override materials & shadows
    clone.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat || (mat.color && mat.color.getHex() === 0x000000)) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#cc2233', roughness: 0.4, metalness: 0.1
          });
        }
      }
    });

    groupRef.current.clear();
    groupRef.current.add(clone);
  }, [scene]);

  useFrame((_, delta) => {
    if (groupRef.current && currentStep !== 6) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return <group ref={groupRef} />;
}

// ─── Graft Points ─────────────────────────────────────────────────────────────
function GraftPoints({ grafts }: { grafts: GraftPoint[] }) {
  const t = useRef(0);
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    t.current += delta * 2;
    refs.current.forEach((mesh) => {
      if (mesh) {
        const sc = 1 + Math.abs(Math.sin(t.current)) * 0.6;
        mesh.scale.setScalar(sc);
      }
    });
  });

  const linePoints = grafts.map((g) => new THREE.Vector3(g.x, g.y, g.z));

  return (
    <group>
      {grafts.map((graft, i) => (
        <mesh
          key={i}
          position={[graft.x, graft.y, graft.z]}
          ref={(el) => { refs.current[i] = el; }}
        >
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={2} />
        </mesh>
      ))}
      {linePoints.length > 1 && (
        <Line points={linePoints} color="#00f5d4" lineWidth={2} transparent opacity={0.7} />
      )}
    </group>
  );
}

// ─── Click-to-Graft Handler ───────────────────────────────────────────────────
function GraftClickHandler({ enabled, onGraft }: { enabled: boolean; onGraft: (pt: THREE.Vector3) => void }) {
  const { camera, scene } = useThree();

  const handleClick = useCallback((e: MouseEvent) => {
    if (!enabled) return;
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(scene.children, true);
    if (hits.length > 0) onGraft(hits[0].point);
  }, [enabled, camera, scene, onGraft]);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [handleClick]);

  return null;
}

// ─── Safe GLB Wrapper (handles glb not existing) ─────────────────────────────
function HeartModelSafe({ currentStep }: { currentStep: number }) {
  try {
    return <HeartGLB currentStep={currentStep} />;
  } catch {
    return <HeartFallback />;
  }
}

// ─── Main HeartViewer ─────────────────────────────────────────────────────────
export default function HeartViewer() {
  const currentStep = useSurgeryStore((s) => s.currentStep);
  const grafts = useSurgeryStore((s) => s.grafts);
  const sessionId = useSurgeryStore((s) => s.sessionId);
  const modelAvailable = useSurgeryStore((s) => s.modelAvailable);
  const addGraft = useSurgeryStore((s) => s.addGraft);
  const graftingEnabled = currentStep === 6 && grafts.length < 4;

  const handleGraft = useCallback((point: THREE.Vector3) => {
    if (!sessionId || !graftingEnabled) return;
    addGraft({ x: point.x, y: point.y, z: point.z }, sessionId);
  }, [sessionId, graftingEnabled, addGraft]);

  const GRAFT_LABELS = ['LAD', 'RCA', 'LCx', 'Diagonal'];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45, near: 0.01, far: 1000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows
        style={{ width: '100%', height: '100%', display: 'block' }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(window.devicePixelRatio);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <color attach="background" args={['#020b14']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1.5} color="#00f5d4" castShadow />
        <directionalLight position={[-2, -1, -2]} intensity={0.8} color="#ffffff" />
        <pointLight position={[0, -2, 1]} intensity={0.5} color="#ff2d55" />
        <pointLight position={[0, 2, -1]} intensity={0.3} color="#00b4d8" />

        <OrbitControls enablePan enableZoom enableRotate minDistance={1} maxDistance={8} />

        <Suspense fallback={
          <Html center>
            <div style={{ color: '#00f5d4', fontFamily: 'Share Tech Mono, monospace', fontSize: 12 }}>
              LOADING CARDIAC MODEL...
            </div>
          </Html>
        }>
          {modelAvailable
            ? <HeartModelSafe currentStep={currentStep} />
            : <HeartFallback />
          }
        </Suspense>

        <GraftPoints grafts={grafts} />
        <GraftClickHandler enabled={graftingEnabled} onGraft={handleGraft} />
        <Environment preset="night" />
      </Canvas>

      {/* Fallback notice */}
      {!modelAvailable && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
          color: '#ff2d55', border: '1px solid rgba(255,45,85,0.3)',
          padding: '3px 10px', background: 'rgba(255,45,85,0.06)',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          HEART.GLB NOT FOUND — USING PROCEDURAL MODEL
        </div>
      )}

      {/* Graft placement overlay */}
      {graftingEnabled && (
        <div style={{
          position: 'absolute', bottom: 236, left: '50%', transform: 'translateX(-50%)',
          border: '1px solid #00f5d4', padding: '6px 16px',
          background: 'rgba(0,245,212,0.08)',
          fontFamily: 'Orbitron, monospace', fontSize: 9,
          color: '#00f5d4', letterSpacing: 2,
          animation: 'blink 1.2s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 5, whiteSpace: 'nowrap',
        }}>
          CLICK HEART TO PLACE GRAFT POINT {grafts.length + 1}/4 — {GRAFT_LABELS[grafts.length]}
        </div>
      )}

      {/* Graft labels */}
      {grafts.length > 0 && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', flexDirection: 'column', gap: 4, pointerEvents: 'none',
        }}>
          {grafts.map((_, i) => (
            <div key={i} style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
              color: '#00f5d4', border: '1px solid rgba(0,245,212,0.3)',
              padding: '2px 8px', background: 'rgba(0,245,212,0.06)',
            }}>
              ✓ {GRAFT_LABELS[i]} PLACED
            </div>
          ))}
        </div>
      )}

      {/* Controls hint */}
      <div style={{
        position: 'absolute', bottom: 236, right: 16,
        fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
        color: '#3a6070', pointerEvents: 'none',
      }}>
        SCROLL TO ZOOM · DRAG TO ROTATE
      </div>
    </div>
  );
}
