import { useEffect, useRef } from 'react';
import { useSurgeryStore, STEP_NAMES } from '../../store/useSurgeryStore';
import { TARGET_ZONES } from '../../store/targetZones';

const STEP_INSTRUMENTS_LABELS: Record<number, string[]> = {
  0: [], 1: ['CANNULA'], 2: ['SCALPEL', 'BONE SAW', 'RETRACTOR'],
  3: ['CANNULA', 'BYPASS MACHINE', 'CLAMPS'], 4: ['SCALPEL', 'FORCEPS', 'SCISSORS'],
  5: ['CLAMPS', 'CANNULA'], 6: ['SUTURES/NEEDLE', 'FORCEPS', 'CLAMPS'],
  7: ['CLAMPS', 'BYPASS MACHINE'], 8: ['BONE SAW', 'SUTURES/NEEDLE', 'RETRACTOR'],
  9: ['ELECTROCAUTERY'],
};

export default function StepsTracker() {
  const currentStep = useSurgeryStore((s) => s.currentStep);
  const completedSteps = useSurgeryStore((s) => s.completedSteps);
  const score = useSurgeryStore((s) => s.score);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStep]);

  const progressPercent = Math.round((completedSteps.length / 10) * 100);

  return (
    <div style={{
      width: 380, height: '100%', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      background: 'var(--panel)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'var(--cyan)', letterSpacing: 2 }}>
            SURGERY PROGRESS
          </span>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 13, color: 'var(--cyan)' }}>
            {progressPercent}%
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 2, background: 'var(--border2)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progressPercent}%`,
            background: 'linear-gradient(to right, var(--cyan-dim), var(--cyan))',
            transition: 'width 0.6s ease',
            boxShadow: '0 0 8px var(--cyan)',
          }} />
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 16, fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--muted)' }}>
          <span>{completedSteps.length}/10 STEPS</span>
          <span>SCORE: {score.toFixed(0)}%</span>
        </div>
      </div>

      {/* Steps list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {/* Timeline vertical line */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 38, top: 0, bottom: 0,
            width: 2, background: 'var(--border2)',
          }} />

          {STEP_NAMES.map((name, idx) => {
            const isCompleted = completedSteps.includes(idx);
            const isActive = currentStep === idx;
            const isPending = !isCompleted && !isActive;
            const instruments = STEP_INSTRUMENTS_LABELS[idx] || [];

            return (
              <div
                key={idx}
                ref={isActive ? activeRef : undefined}
                style={{
                  display: 'flex', gap: 16, padding: '10px 20px 10px 20px',
                  minHeight: 72, position: 'relative', zIndex: 1,
                  background: isActive ? 'rgba(0,245,212,0.03)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Step node */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', paddingTop: 4, marginLeft: 2 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCompleted ? 'var(--cyan)' : isActive ? 'transparent' : 'var(--muted2)',
                      border: isCompleted ? 'none' : isActive ? '2px solid var(--cyan)' : '1px solid var(--border2)',
                      boxShadow: isActive ? '0 0 12px var(--cyan)' : 'none',
                      animation: isActive ? 'aria-pulse 2s ease-in-out infinite' : 'none',
                      transition: 'all 0.3s ease', position: 'relative', zIndex: 2,
                    }}>
                      {isCompleted ? (
                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                          <path d="M1 5L5 9L13 1" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : isActive ? (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'var(--cyan)',
                          animation: 'pulse-dot 1.5s ease-in-out infinite',
                        }} />
                      ) : (
                        <span style={{
                          fontFamily: 'Share Tech Mono, monospace', fontSize: 10,
                          color: 'var(--muted)',
                        }}>
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    {/* Pulse ring for active */}
                    {isActive && (
                      <>
                        <div style={{
                          position: 'absolute', inset: -4, borderRadius: '50%',
                          border: '1px solid rgba(0,245,212,0.3)',
                          animation: 'pulse-ring 2s ease-out infinite',
                          pointerEvents: 'none',
                        }} />
                        <div style={{
                          position: 'absolute', inset: -8, borderRadius: '50%',
                          border: '1px solid rgba(0,245,212,0.15)',
                          animation: 'pulse-ring 2s ease-out infinite 0.5s',
                          pointerEvents: 'none',
                        }} />
                      </>
                    )}
                  </div>
                </div>

                {/* Step content */}
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif', fontSize: 15, fontWeight: 600,
                    color: isActive ? 'white' : isPending ? 'var(--muted)' : 'var(--muted)',
                    marginBottom: 3, transition: 'color 0.3s ease',
                  }}>
                    {name}
                  </div>
                  <div style={{
                    fontFamily: 'Share Tech Mono, monospace', fontSize: 10,
                    color: isActive ? 'var(--cyan)' : isCompleted ? 'var(--cyan-dim)' : 'var(--muted)',
                    letterSpacing: 1, marginBottom: 6,
                  }}>
                    {isActive ? 'ACTIVE // IN PROGRESS' : isCompleted ? 'COMPLETED ✓' : 'PENDING'}
                  </div>

                  {/* Instrument pills & Action Dots */}
                  {(isActive || isCompleted) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {instruments.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {instruments.map((inst) => (
                            <span key={inst} style={{
                              fontFamily: 'Share Tech Mono, monospace', fontSize: 8,
                              color: isActive ? 'var(--cyan)' : 'var(--muted)',
                              border: `1px solid ${isActive ? 'rgba(0,245,212,0.3)' : 'var(--border2)'}`,
                              padding: '1px 6px',
                              letterSpacing: 0.5,
                            }}>
                              {inst}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {isActive && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                          {Array.from({ length: (TARGET_ZONES[idx] || []).length }).map((_, i) => (
                            <div key={i} style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: i < useSurgeryStore.getState().stepActionsCompleted ? 'var(--cyan)' : 'transparent',
                              border: '1px solid var(--cyan)',
                              boxShadow: i < useSurgeryStore.getState().stepActionsCompleted ? '0 0 8px var(--cyan)' : 'none',
                              transition: 'all 0.3s ease'
                            }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
