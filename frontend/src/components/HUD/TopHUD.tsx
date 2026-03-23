import { useEffect, useRef, useState } from 'react';
import { useSurgeryStore } from '../../store/useSurgeryStore';

export default function TopHUD() {
  const vitals = useSurgeryStore((s) => s.vitals);
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
      {/* LEFT: Recording indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 260 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          border: '1px solid var(--red)', padding: '4px 10px',
          animation: 'blink 0.8s ease-in-out infinite',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
          <span style={{
            fontFamily: 'Orbitron, monospace', fontSize: 9,
            color: 'var(--red)', letterSpacing: 2, whiteSpace: 'nowrap',
          }}>
            RECORDING // LIVE SURGERY SIMULATION
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
