import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurgeryStore } from '../store/useSurgeryStore';

export default function CompletionModal() {
  const navigate = useNavigate();
  const { score, completedSteps, grafts, setShowCompletion, logout, sessionId } = useSurgeryStore();
  const [displayScore, setDisplayScore] = useState(0);
  const [elapsed, setElapsed] = useState('00:00:00');
  const startRef = useRef(Date.now() - (sessionId ? 0 : 0));
  const animRef = useRef<number>();

  // Animate score counter
  useEffect(() => {
    const start = Date.now();
    const duration = 2000;
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [score]);

  const handleNewSession = () => {
    logout();
    navigate('/dashboard');
    window.location.reload();
  };

  const performanceLabel = score >= 90 ? 'EXCELLENT' : score >= 70 ? 'PROFICIENT' : score >= 50 ? 'DEVELOPING' : 'NEEDS REVIEW';
  const performanceColor = score >= 90 ? 'var(--cyan)' : score >= 70 ? '#00e5b5' : score >= 50 ? 'var(--warning)' : 'var(--red)';

  const stats = [
    { label: 'STEPS COMPLETED', value: `${completedSteps.length}/10` },
    { label: 'BYPASS GRAFTS PLACED', value: `${grafts.length}/4` },
    { label: 'PROCEDURE STATUS', value: 'COMPLETE' },
    { label: 'PERFORMANCE TIER', value: performanceLabel },
  ];

  const getSurgeonFeedback = () => {
    if (score >= 90) return "Exceptional technique. Your precision during the grafting phase was textbook. You demonstrated the steady hand required for elite cardiac surgery. Keep this level of focus.";
    if (score >= 70) return "Solid performance. You've mastered the fundamentals of the CABG procedure. There were minor inconsistencies in your graft placement, but nothing that would compromise patient outcome. Refine your stabilizers.";
    if (score >= 50) return "Adequate, but you're cutting it close. Your speed is fine, but your accuracy needs more time in the wet lab. In a real OR, these margins for error don't exist. Re-run the simulation focusing on instrument control.";
    return "Critical failure in surgical technique. Your accuracy was below acceptable standards, posing a direct risk to the patient. You must master the basic sternotomy and cannulation before attempting the grafts again. Return to basic training.";
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(2,11,20,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 560, padding: '48px',
        background: 'var(--panel)', border: '1px solid var(--border2)',
        boxShadow: '0 0 80px rgba(0,245,212,0.1)',
        position: 'relative', animation: 'float-up 0.5s ease',
      }}>
        {/* Corner accents */}
        {[['top:0,left:0', 'Top', 'Left'], ['top:0,right:0', 'Top', 'Right'], ['bottom:0,left:0', 'Bottom', 'Left'], ['bottom:0,right:0', 'Bottom', 'Right']].map((_, i) => {
          const pos = [
            { top: 0, left: 0, borderTop: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' },
            { top: 0, right: 0, borderTop: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)' },
            { bottom: 0, left: 0, borderBottom: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' },
            { bottom: 0, right: 0, borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)' },
          ][i];
          return <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...pos as any }} />;
        })}

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: 11,
            color: 'var(--muted)', letterSpacing: 4, marginBottom: 8,
          }}>
            SURGERY COMPLETE
          </div>

          {/* Score display */}
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: 72, fontWeight: 900,
            color: performanceColor, lineHeight: 1,
            textShadow: `0 0 40px ${performanceColor}50`,
            animation: 'counter-up 0.5s ease',
          }}>
            {displayScore}
            <span style={{ fontSize: 32 }}>%</span>
          </div>
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: 14,
            color: performanceColor, letterSpacing: 4, marginTop: 8,
          }}>
            {performanceLabel}
          </div>
        </div>

        {/* Score bar */}
        <div style={{ height: 4, background: 'var(--border2)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: `linear-gradient(to right, var(--cyan-dim), ${performanceColor})`,
            width: `${displayScore}%`, transition: 'width 0.1s ease',
            boxShadow: `0 0 8px ${performanceColor}`,
          }} />
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              padding: '14px 16px',
              background: 'var(--panel2)', border: '1px solid var(--border2)',
            }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 2, marginBottom: 6 }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, fontWeight: 700, color: 'var(--cyan)' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Surgeon Feedback Section */}
        <div style={{
          marginBottom: 36, padding: '20px',
          background: 'rgba(0,245,212,0.03)', border: '1px solid rgba(0,245,212,0.1)',
          position: 'relative',
        }}>
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--cyan)',
            letterSpacing: 2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <div style={{ width: 6, height: 6, background: 'var(--cyan)', borderRadius: '50%' }} />
            SURGEON CONSULTATION // REF: CHIEF_OF_SURGERY
          </div>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: 13,
            color: '#ccd6f6', lineHeight: 1.6, fontStyle: 'italic',
            letterSpacing: 0.5,
          }}>
            "{getSurgeonFeedback()}"
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setShowCompletion(false)}
            className="btn-outline-cyan"
            style={{ flex: 1, padding: '12px 0' }}
          >
            REVIEW SESSION
          </button>
          <button
            onClick={handleNewSession}
            className="btn-cyan"
            style={{ flex: 1, padding: '12px 0' }}
          >
            NEW SESSION ↺
          </button>
        </div>
      </div>
    </div>
  );
}
