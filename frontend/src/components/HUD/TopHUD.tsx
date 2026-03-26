import { useEffect, useRef, useState } from 'react';
import { useSurgeryStore } from '../../store/useSurgeryStore';

export default function TopHUD() {
  const vitals = useSurgeryStore((s) => s.vitals);
  const health = useSurgeryStore((s) => s.health);
  const sessionId = useSurgeryStore((s) => s.sessionId);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const vitalItems = [
    { label: 'HEART RATE', value: `${vitals.hr}`, unit: 'BPM' },
    { label: 'BLOOD PRESSURE', value: vitals.bp, unit: 'MMHG' },
    { label: 'SPO2', value: `${vitals.spo2}`, unit: '%' },
    { label: 'TEMP', value: vitals.temp, unit: '°C' },
  ];

  return (
    <div style={{
      height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--panel)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      position: 'relative', zIndex: 10,
      flexShrink: 0,
    }}>
      {/* LEFT: Recording indicator + Stability */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--red)', padding: '2px 8px',
            animation: 'blink 0.8s ease-in-out infinite',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
            <span style={{
              fontFamily: 'Orbitron, monospace', fontSize: 8,
              color: 'var(--red)', letterSpacing: 1.5, whiteSpace: 'nowrap',
            }}>
              RECORDING // SIM
            </span>
          </div>
          {sessionId && (
            <span style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
              color: 'var(--muted)', letterSpacing: 1,
            }}>
              SID: {sessionId.slice(-8).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Stability Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 220 }}>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1 }}>SURGICAL STABILITY</span>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: health < 30 ? 'var(--red)' : 'var(--cyan)' }}>{health}%</span>
          </div>
          <div style={{ width: 220, height: 4, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border2)', position: 'relative' }}>
            <div style={{ 
              width: `${health}%`, height: '100%', 
              background: health < 30 ? 'var(--red)' : 'var(--cyan)',
              boxShadow: `0 0 10px ${health < 30 ? 'var(--red)' : 'var(--cyan)'}`,
              transition: 'width 0.5s ease-out, background 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* CENTER: Vitals */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {vitalItems.map((v, i) => (
          <div key={i} style={{
            background: 'rgba(0,245,212,0.04)', border: '1px solid var(--border2)',
            padding: '4px 16px', textAlign: 'center', minWidth: 90,
          }}>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: 9,
              color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 2,
            }}>
              {v.label}
            </div>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: 22, fontWeight: 700,
              color: 'var(--cyan)', lineHeight: 1,
            }}>
              {v.value}
            </div>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: 8,
              color: 'var(--muted)', marginTop: 1,
            }}>
              {v.unit}
            </div>
          </div>
        ))}
      </div>

      {/* VR TOGGLE */}
      <button 
        onClick={() => useSurgeryStore.getState().toggleVRMode()}
        style={{
          background: useSurgeryStore.getState().vrMode ? 'var(--cyan)' : 'transparent',
          border: '1px solid var(--cyan)',
          padding: '6px 12px',
          color: useSurgeryStore.getState().vrMode ? 'var(--bg)' : 'var(--cyan)',
          fontFamily: 'Orbitron, monospace', fontSize: 9, fontWeight: 700,
          cursor: 'pointer', letterSpacing: 2,
          transition: 'all 0.3s ease',
          boxShadow: useSurgeryStore.getState().vrMode ? '0 0 15px var(--cyan)' : 'none',
        }}
      >
        {useSurgeryStore.getState().vrMode ? 'VR MODE ON' : 'VR MODE OFF'}
      </button>

      {/* RIGHT: Lead surgeon + timer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 260, justifyContent: 'flex-end' }}>
        <div>
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: 8,
            color: 'var(--muted)', letterSpacing: 2,
          }}>
            LEAD SURGEON
          </div>
          <div style={{
            border: '1px solid var(--cyan)', padding: '2px 8px',
            fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700,
            color: 'var(--cyan)', letterSpacing: 2, marginTop: 2,
          }}>
            DR. ALEX MERCER
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: 8,
            color: 'var(--muted)', letterSpacing: 2,
          }}>
            T+ ELAPSED
          </div>
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: 18, fontWeight: 700,
            color: 'var(--cyan)', letterSpacing: 2,
          }}>
            {formatTime(elapsed)}
          </div>
        </div>
      </div>
    </div>
  );
}
