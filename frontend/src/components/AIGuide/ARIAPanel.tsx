import { useEffect, useRef, useState } from 'react';
import { useSurgeryStore, STEP_NAMES } from '../../store/useSurgeryStore';

export default function ARIAPanel() {
  const currentStep = useSurgeryStore((s) => s.currentStep);
  const ariaText = useSurgeryStore((s) => s.ariaText);
  const ariaWarning = useSurgeryStore((s) => s.ariaWarning);
  const isLoadingAria = useSurgeryStore((s) => s.isLoadingAria);
  const sessionId = useSurgeryStore((s) => s.sessionId);
  const nextStep = useSurgeryStore((s) => s.nextStep);
  const prevStep = useSurgeryStore((s) => s.prevStep);
  const [displayText, setDisplayText] = useState('');
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charRef = useRef(0);

  // Typewriter effect
  useEffect(() => {
    if (!ariaText || isLoadingAria) {
      setDisplayText('');
      return;
    }
    charRef.current = 0;
    setDisplayText('');
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    typewriterRef.current = setInterval(() => {
      charRef.current++;
      setDisplayText(ariaText.slice(0, charRef.current));
      if (charRef.current >= ariaText.length) {
        clearInterval(typewriterRef.current!);
      }
    }, 18);
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, [ariaText, isLoadingAria]);

  const handleNext = () => {
    if (sessionId) nextStep(sessionId);
  };

  return (
    <div style={{
      height: 220, flexShrink: 0,
      border: '1px solid var(--cyan)',
      background: 'rgba(0,245,212,0.04)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top highlight line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(to right, transparent, var(--cyan), transparent)',
        opacity: 0.6,
      }} />

      {/* Header */}
      <div style={{
        padding: '10px 16px 8px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid rgba(0,245,212,0.15)', flexShrink: 0,
      }}>
        {/* Pulsing avatar */}
        <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '2px solid var(--cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,245,212,0.1)',
            animation: 'aria-pulse 2s ease-in-out infinite',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="var(--cyan)" strokeWidth="1.5"/>
              <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '1px solid rgba(0,245,212,0.2)',
            animation: 'pulse-ring 3s ease-out infinite',
          }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'var(--cyan)', letterSpacing: 2 }}>
            ARIA // STEP {(currentStep + 1).toString().padStart(2, '0')}: {STEP_NAMES[currentStep]?.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>
            ASSISTED REALITY INTELLIGENCE FOR ANATOMY
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '10px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoadingAria ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--cyan)', letterSpacing: 2 }}>
              ARIA PROCESSING...
            </div>
            <div style={{
              height: 2, width: '100%', background: 'var(--border2)',
              position: 'relative', overflow: 'hidden', borderRadius: 1,
            }}>
              <div style={{
                position: 'absolute', top: 0, height: '100%', width: '30%',
                background: 'linear-gradient(to right, transparent, var(--cyan), transparent)',
                animation: 'scan-bar 1.5s linear infinite',
              }} />
            </div>
            {[0.8, 0.6, 0.4].map((op, i) => (
              <div key={i} style={{
                height: 8, background: 'var(--border2)', borderRadius: 1,
                opacity: op, width: `${(3 - i) * 30}%`,
                animation: 'blink 1.2s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : (
          <>
            <p style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: 12,
              color: 'var(--text)', lineHeight: 1.7, margin: 0,
            }}>
              {displayText}
              {displayText.length < ariaText.length && (
                <span style={{
                  display: 'inline-block', width: 8, height: 12,
                  background: 'var(--cyan)',
                  marginLeft: 2, verticalAlign: 'middle',
                  animation: 'blink 0.7s ease-in-out infinite',
                }} />
              )}
            </p>

            {ariaWarning && (
              <div style={{
                background: 'rgba(255,45,85,0.08)', border: '1px solid var(--red)',
                padding: '6px 10px', display: 'flex', gap: 6, alignItems: 'flex-start',
              }}>
                <span style={{ color: 'var(--red)', flexShrink: 0, fontSize: 12 }}>⚠</span>
                <span style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: 11,
                  color: 'var(--red)', lineHeight: 1.5,
                }}>
                  WARNING: {ariaWarning}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer buttons */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 16px',
        borderTop: '1px solid rgba(0,245,212,0.15)', flexShrink: 0,
      }}>
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="btn-outline-cyan"
          style={{ padding: '8px 20px', flex: 1, opacity: currentStep === 0 ? 0.3 : 1 }}
        >
          ◄ PREVIOUS
        </button>
        <button
          onClick={handleNext}
          className="btn-cyan"
          style={{ padding: '8px 20px', flex: 2 }}
        >
          {currentStep >= 9 ? 'COMPLETE ✓' : 'NEXT STEP ►'}
        </button>
      </div>
    </div>
  );
}
