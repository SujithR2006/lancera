import { useSurgeryStore } from '../../store/useSurgeryStore';

const INSTRUMENTS = [
  {
    name: 'SCALPEL', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M8 40L36 8" strokeLinecap="round" strokeWidth="2"/>
        <path d="M36 8L40 12C38 16 34 18 30 16L8 40" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M38 10L42 14" strokeLinecap="round" strokeWidth="1.5"/>
        <circle cx="40" cy="12" r="2" fill="currentColor" fillOpacity="0.3"/>
      </svg>
    )
  },
  {
    name: 'RETRACTOR', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M10 38C10 38 14 28 24 24C34 20 38 10 38 10" strokeLinecap="round" strokeWidth="2"/>
        <path d="M38 10L42 6" strokeLinecap="round" strokeWidth="2"/>
        <path d="M34 10L38 6" strokeLinecap="round" strokeWidth="2"/>
        <path d="M8 38L6 42" strokeLinecap="round" strokeWidth="2"/>
        <path d="M12 36L10 40" strokeLinecap="round" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    name: 'BONE SAW', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="18" width="32" height="12" rx="2" strokeWidth="1.5"/>
        <path d="M36 18V30" strokeWidth="1.5"/>
        <path d="M36 22L44 20V28L36 26" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M8 18V16M12 18V14M16 18V16M20 18V14M24 18V16M28 18V14M32 18V16" strokeLinecap="round" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    name: 'CANNULA', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M6 24H38" strokeLinecap="round" strokeWidth="3"/>
        <path d="M6 21H38" strokeLinecap="round" strokeWidth="1"/>
        <path d="M38 21L44 24L38 27" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <rect x="4" y="21" width="6" height="6" rx="1" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    name: 'CLAMPS', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M10 10L24 24M10 38L24 24" strokeLinecap="round" strokeWidth="2"/>
        <path d="M24 24L42 20" strokeLinecap="round" strokeWidth="2"/>
        <path d="M40 18L44 20L40 22" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <circle cx="24" cy="24" r="3" strokeWidth="1.5"/>
        <path d="M8 8L12 10M8 40L12 38" strokeLinecap="round" strokeWidth="2"/>
      </svg>
    )
  },
  {
    name: 'SUTURES/NEEDLE', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M8 40C12 36 18 25 24 22C30 19 36 14 40 8" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M40 8C42 6 44 8 42 10C40 12 36 16 32 18" strokeLinecap="round" strokeWidth="2"/>
        <path d="M24 22Q20 32 16 38" strokeLinecap="round" strokeWidth="1" strokeDasharray="2 2"/>
        <path d="M28 24Q24 34 20 40" strokeLinecap="round" strokeWidth="1" strokeDasharray="2 2"/>
      </svg>
    )
  },
  {
    name: 'ELECTROCAUTERY', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="20" width="28" height="8" rx="2" strokeWidth="1.5"/>
        <path d="M34 24H38L32 14L36 24H40" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M40 20L44 24L40 28" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M10 20V16M14 20V14M18 20V16" strokeLinecap="round" strokeWidth="1"/>
      </svg>
    )
  },
  {
    name: 'BYPASS MACHINE', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="24" height="28" rx="2" strokeWidth="1.5"/>
        <circle cx="18" cy="24" r="7" strokeWidth="1.5"/>
        <circle cx="18" cy="24" r="3" strokeWidth="1"/>
        <path d="M30 16H42" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M30 24H42" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M30 32H38" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M40 14V18" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M42 22V26" strokeLinecap="round" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    name: 'FORCEPS', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M18 8L24 34L22 40" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M30 8L24 34" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M18 8Q10 6 10 12" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M30 8Q38 6 38 12" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M10 12Q15 16 24 34" strokeLinecap="round" strokeWidth="1"/>
        <path d="M38 12Q33 16 24 34" strokeLinecap="round" strokeWidth="1"/>
        <ellipse cx="23" cy="40" rx="2" ry="3" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    name: 'SCISSORS', icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M8 8L28 28" strokeLinecap="round" strokeWidth="2"/>
        <path d="M28 8L8 28" strokeLinecap="round" strokeWidth="2"/>
        <circle cx="34" cy="34" r="6" strokeWidth="1.5"/>
        <circle cx="14" cy="34" r="6" strokeWidth="1.5"/>
        <path d="M28 28L34 34" strokeWidth="1.5"/>
        <path d="M28 28L14 34" strokeWidth="1.5"/>
      </svg>
    )
  },
];

export default function InstrumentsPanel() {
  const activeInstruments = useSurgeryStore((s) => s.activeInstruments);

  return (
    <div style={{
      width: 280, height: '100%', display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid var(--border)',
      background: 'var(--panel)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'var(--cyan)', letterSpacing: 2 }}>
          INSTRUMENTS
        </span>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>
          CABG SET
        </span>
      </div>

      {/* Active instruments label */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, marginBottom: 4 }}>
          ACTIVE THIS STEP
        </div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--cyan)' }}>
          {activeInstruments.length > 0 ? activeInstruments.join(' · ') : 'NONE'}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 1, padding: 1, alignContent: 'start',
      }}>
        {INSTRUMENTS.map((inst) => {
          const isActive = activeInstruments.includes(inst.name);
          return (
            <div key={inst.name} style={{
              width: '100%', height: 100,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              border: `1px solid ${isActive ? 'var(--cyan)' : 'var(--border2)'}`,
              background: isActive ? 'var(--cyan-glow)' : 'var(--panel2)',
              boxShadow: isActive ? '0 0 12px rgba(0,245,212,0.2)' : 'none',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}>
              <div style={{
                color: isActive ? 'var(--cyan)' : 'var(--muted)',
                stroke: isActive ? 'var(--cyan)' : 'var(--muted)',
                transition: 'color 0.3s ease',
                display: 'flex',
              }}>
                {inst.icon}
              </div>
              <div style={{
                fontFamily: 'Orbitron, monospace', fontSize: 8,
                color: isActive ? 'var(--cyan)' : 'var(--muted)',
                letterSpacing: 1.5, textAlign: 'center',
                transition: 'color 0.3s ease',
              }}>
                {inst.name}
              </div>
              {isActive && (
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--cyan)',
                  animation: 'pulse-dot 1.5s ease-in-out infinite',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
