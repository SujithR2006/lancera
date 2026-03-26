import React, { useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Environment, useGLTF, Float, QuadraticBezierLine, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useSurgeryStore, GraftPoint } from '../../store/useSurgeryStore';
import { TARGET_ZONES } from '../../store/targetZones';

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
function HeartGLB() {
  const { currentStep, vrMode, heartRotation, isRotating } = useSurgeryStore();
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/models/heart.glb');

  useEffect(() => {
    if (!scene || !groupRef.current) return;
    
    try {
      console.log('Heart GLB processing...');
      // Safe clone for reasonably sized models
      const model = scene.clone(); 

      // Center model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // Scale to fit
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      const radius = sphere.radius || 1;
      model.scale.setScalar(1.2 / radius);

      // Override materials & shadows
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          if (mesh.material) {
            // Support both single and array materials
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach(m => {
              if (m instanceof THREE.MeshStandardMaterial || (m as any).isMeshStandardMaterial) {
                const mat = m as THREE.MeshStandardMaterial;
                if (mat.color && typeof mat.color.getHex === 'function') {
                  if (mat.color.getHex() === 0x000000) mat.color.set('#cc2233');
                }
              }
            });
          }
        }
      });

      groupRef.current.clear();
      groupRef.current.add(model);
      console.log('Heart GLB success.');
    } catch (err) {
      console.error('Error processing Heart GLB:', err);
    }
  }, [scene]);

  // Apply a fixed rotation or auto-rotate if not grafting
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (vrMode) {
      // Apply stereoscopic synced rotation
      groupRef.current.rotation.set(heartRotation[0], heartRotation[1], heartRotation[2]);
    } else {
      // Standard autonomous rotation
      if (currentStep !== 6 && isRotating) {
        groupRef.current.rotation.y += delta * 0.3;
      }
    }
  });

  return (
    <group ref={groupRef} name="HEART_ROTATOR">
      {/* Heart model will be added here via CLEAR/ADD */}
      {/* Graft Points & Guidance now children of the heart group to stay attached */}
      <GraftPoints />
      <TargetGuidance />
    </group>
  );
}

// ─── Graft Points & Perfect Vessels ──────────────────────────────────────────
function GraftPoints() {
  const grafts = useSurgeryStore((s) => s.grafts);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  // Aorta source point: Top center of the heart
  const aortaPoint = new THREE.Vector3(0, 1.2, 0.2); 

  useFrame((state) => {
    const t = state.clock.elapsedTime * 2;
    refs.current.forEach((mesh) => {
      if (mesh) {
        const sc = 1 + Math.abs(Math.sin(t)) * 0.4;
        mesh.scale.setScalar(sc);
      }
    });
  });

  return (
    <group>
      {/* Aorta Source marker */}
      <mesh position={[aortaPoint.x, aortaPoint.y, aortaPoint.z]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff2d55" emissive="#ff2d55" emissiveIntensity={2} />
      </mesh>

      {grafts.map((graft, i) => {
        const target = new THREE.Vector3(graft.x, graft.y, graft.z);
        // Mid-point for curve: Slightly higher and between source/target
        const midPoint = aortaPoint.clone().add(target).multiplyScalar(0.5);
        midPoint.y += 0.35; // Lift the arch for a "perfect" look
        midPoint.z += 0.2;

        return (
          <group key={i}>
            {/* Suture Marker at Target */}
            <mesh
              position={[graft.x, graft.y, graft.z]}
              ref={(el) => { refs.current[i] = el; }}
            >
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial 
                color="#fcd34d" 
                emissive="#fcd34d" 
                emissiveIntensity={3} 
                transparent 
                opacity={0.9} 
              />
            </mesh>
            
            {/* Curved Vessel/Graft (Red) */}
            <QuadraticBezierLine
              start={aortaPoint}
              end={target}
              mid={midPoint}
              color="#ff1111" // Pure surgical red
              lineWidth={22}  // Thicker for vessel look
              transparent
              opacity={1}
              depthWrite={true}
            />
          </group>
        );
      })}
    </group>
  );
}

// ─── Target Guidance ─────────────────────────────────────────────────────────
function TargetGuidance() {
  const currentStep = useSurgeryStore((s) => s.currentStep);
  const selectedTool = useSurgeryStore((s) => s.selectedTool);
  const zones = TARGET_ZONES[currentStep] || [];
  
  // Only show guidance if a tool is equipped
  if (!selectedTool || zones.length === 0) return null;

  return (
    <group>
      {zones.map((zone, i) => (
        <group key={i} position={[zone.x, zone.y, zone.z]}>
          <mesh>
            <sphereGeometry args={[zone.radius, 16, 16]} />
            <meshStandardMaterial 
              color="#00f5d4" 
              transparent 
              opacity={0.3} 
              emissive="#00f5d4" 
              emissiveIntensity={2}
            />
          </mesh>
          {/* Pulsing Outer Ring */}
          <mesh scale={[1.2, 1.2, 1.2]}>
            <sphereGeometry args={[zone.radius, 16, 16]} />
            <meshBasicMaterial color="#00f5d4" transparent opacity={0.1} wireframe />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Click-to-Interact Handler ───────────────────────────────────────────────
function SceneClickHandler() {
  const { camera, scene } = useThree();
  const selectedTool = useSurgeryStore((s) => s.selectedTool);
  const currentStep = useSurgeryStore((s) => s.currentStep);
  const sessionId = useSurgeryStore((s) => s.sessionId);
  const addGraft = useSurgeryStore((s) => s.addGraft);
  const updateVitals = useSurgeryStore((s) => s.updateVitals);
  const grafts = useSurgeryStore((s) => s.grafts);
  const applyAction = useSurgeryStore((s) => s.applyAction);

  const graftingEnabled = currentStep === 6 && grafts.length < 4;

  const handleClick = useCallback((e: MouseEvent) => {
    if (!selectedTool && !graftingEnabled) return;
    
    // NDC conversion
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    if (hits.length > 0) {
      // Find the group that represents the heart's local space
      const heartGroup = scene.getObjectByName('HEART_ROTATOR');
      const point = hits[0].point.clone();
      
      let localPoint = point;
      if (heartGroup) {
        // Convert world-space click to local heart-group space
        heartGroup.updateMatrixWorld();
        localPoint = heartGroup.worldToLocal(point);
      }

      // 1. Handle Grafting (Step 6 specific)
      if (graftingEnabled && !selectedTool) {
        if (sessionId) addGraft({ x: localPoint.x, y: localPoint.y, z: localPoint.z }, sessionId);
      }

      // 2. Handle Tool Usage with Accuracy Check
      if (selectedTool) {
        // Check if hit is within any target zone
        const zones = TARGET_ZONES[currentStep] || [];
        const isSuccess = zones.length === 0 || zones.some(zone => {
          const dist = localPoint.distanceTo(new THREE.Vector3(zone.x, zone.y, zone.z));
          return dist <= zone.radius * 3.5; // Very generous hit area for user friendliness
        });

        applyAction(isSuccess);

        // Visual feedback
        const el = document.getElementById('tool-alert');
        if (el) {
          el.innerText = isSuccess ? `${selectedTool} SUCCESS` : `CRITICAL MISS`;
          el.style.color = isSuccess ? 'var(--cyan)' : 'var(--red)';
          el.style.opacity = '1';
          setTimeout(() => { el.style.opacity = '0'; }, 1000);
        }

        // Vitals reaction
        if (!isSuccess) {
          updateVitals({ hr: 110, bp: '145/95' });
          setTimeout(() => updateVitals({ hr: 72, bp: '120/80' }), 3000);
        } else {
          updateVitals({ hr: 80 });
          setTimeout(() => updateVitals({ hr: 72 }), 1500);
        }
      }
    }
  }, [selectedTool, graftingEnabled, sessionId, camera, scene, addGraft, updateVitals, applyAction, currentStep]);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [handleClick]);

  return null;
}

// ─── Surgical Tool Follower ──────────────────────────────────────────────────
function ToolFollower() {
  const selectedTool = useSurgeryStore((s) => s.selectedTool);
  const toolRef = useRef<THREE.Group>(null!);
  const { viewport, mouse, raycaster, camera } = useThree();
 
  useFrame(() => {
    if (!selectedTool || !toolRef.current) return;
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = 2.5; 
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    toolRef.current.position.copy(pos);
    toolRef.current.lookAt(0, 0, 0); 
    toolRef.current.rotateX(Math.PI / 2);
  });

  if (!selectedTool) return null;

  const metalMat = <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.15} />;
  const handleMat = <meshStandardMaterial color="#1e293b" roughness={0.8} />;
  const translucentMat = <meshStandardMaterial color="#00f5d4" transparent opacity={0.4} roughness={0} />;

  const renderToolModel = () => {
    switch (selectedTool) {
      case 'SCALPEL':
        return (
          <group>
            <mesh castShadow><boxGeometry args={[0.04, 0.5, 0.02]} />{handleMat}</mesh>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0, 0.035, 0.2, 3]} />
              {metalMat}
            </mesh>
          </group>
        );
      case 'BONE SAW':
        return (
          <group>
            <mesh castShadow><boxGeometry args={[0.1, 0.4, 0.1]} />{handleMat}</mesh>
            <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.01, 8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.1} wireframe />
            </mesh>
          </group>
        );
      case 'RETRACTOR':
        return (
          <group>
            <mesh castShadow><boxGeometry args={[0.4, 0.03, 0.05]} />{handleMat}</mesh>
            <mesh position={[-0.2, 0.1, 0]} castShadow><boxGeometry args={[0.03, 0.2, 0.05]} />{metalMat}</mesh>
            <mesh position={[0.2, 0.1, 0]} castShadow><boxGeometry args={[0.03, 0.2, 0.05]} />{metalMat}</mesh>
          </group>
        );
      case 'CANNULA':
        return (
          <group>
            <mesh castShadow><cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />{translucentMat}</mesh>
            <mesh position={[0, 0.4, 0]} castShadow><sphereGeometry args={[0.03]} />{metalMat}</mesh>
          </group>
        );
      case 'FORCEPS':
        return (
          <group>
            <mesh position={[-0.03, 0, 0]} rotation={[0, 0, 0.08]} castShadow>
              <boxGeometry args={[0.02, 0.6, 0.04]} />{metalMat}
            </mesh>
            <mesh position={[0.03, 0, 0]} rotation={[0, 0, -0.08]} castShadow>
              <boxGeometry args={[0.02, 0.6, 0.04]} />{metalMat}
            </mesh>
          </group>
        );
      case 'SUTURES/NEEDLE':
        return (
          <group>
             <mesh rotation={[Math.PI/2, 0, 0]} castShadow>
               <torusGeometry args={[0.1, 0.01, 8, 32, Math.PI]} />
               {metalMat}
             </mesh>
             <Line points={[[-0.1, 0, 0], [-0.1, -0.4, 0]]} color="#00f5d4" lineWidth={1} />
          </group>
        );
      default:
        return <mesh castShadow><sphereGeometry args={[0.05]} />{metalMat}</mesh>;
    }
  };

  return (
    <group ref={toolRef}>
      {renderToolModel()}
      <Html position={[0, 0.5, 0]} center>
        <div style={{
          fontFamily: 'Orbitron, monospace', fontSize: 8, color: 'var(--cyan)',
          background: 'rgba(2,11,20,0.8)', padding: '2px 8px', border: '1px solid var(--cyan)',
          whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: 1
        }}>
          {selectedTool}
        </div>
      </Html>
    </group>
  );
}

// ─── Safe GLB Wrapper (handles glb not existing) ─────────────────────────────
function HeartModelSafe() {
  try {
    return <HeartGLB />;
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
  const vrMode = useSurgeryStore((s) => s.vrMode);
  const isRotating = useSurgeryStore((s) => s.isRotating);
  const toggleRotation = useSurgeryStore((s) => s.toggleRotation);
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

        <OrbitControls 
          enablePan={!vrMode} 
          enableZoom={!vrMode}
          onChange={(e) => {
            if (vrMode && e?.target?.object) {
              const rot = e.target.object.rotation;
              useSurgeryStore.getState().setHeartRotation([rot.x, rot.y, rot.z]);
            }
          }}
        />

        <Suspense fallback={<Html center>LOADING...</Html>}>
          <HeartModelSafe />
        </Suspense>

        <SceneClickHandler />
        <ToolFollower />
        <Environment preset="night" />
      </Canvas>

      {/* Rotation Control Overlay */}
      <button
        onClick={toggleRotation}
        style={{
          position: 'absolute', bottom: 12, left: 12,
          background: 'rgba(0,245,212,0.1)', border: '1px solid var(--cyan)',
          color: 'var(--cyan)', fontFamily: 'Orbitron, monospace', fontSize: 10,
          padding: '6px 12px', cursor: 'pointer', zIndex: 10
        }}
      >
        {isRotating ? '⏸ PAUSE ROTATION' : '▶ RESUME ROTATION'}
      </button>

      {/* Tool interaction alert */}
      <div id="tool-alert" style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        fontFamily: 'Orbitron, monospace', fontSize: 24, color: 'var(--cyan)',
        pointerEvents: 'none', opacity: 0, transition: 'opacity 0.2s',
        textShadow: '0 0 20px var(--cyan)', zIndex: 100
      }}>
        ACTION PERFORMED
      </div>

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
