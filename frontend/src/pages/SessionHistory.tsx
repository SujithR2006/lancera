import { useEffect, useState } from 'react';
import api from '../api/client';
import { useSurgeryStore } from '../store/useSurgeryStore';

interface Session {
  _id: string;
  startTime: string;
  endTime?: string;
  score: number;
  completedSteps: number[];
  status: string;
}

export default function SessionHistory() {
  const setShowHistory = useSurgeryStore((s) => s.setShowHistory);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/surgery/sessions/history')
      .then(({ data }) => setSessions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'IN PROGRESS';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => setShowHistory(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
        background: 'var(--panel)', borderLeft: '1px solid var(--border2)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        animation: 'slide-in-right 0.3s ease',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          padding: '20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, color: 'var(--cyan)', letterSpacing: 2 }}>
            SESSION HISTORY
          </span>
          <button onClick={() => setShowHistory(false)} style={{
            background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)',
            cursor: 'pointer', padding: '4px 8px', fontFamily: 'Share Tech Mono, monospace', fontSize: 12,
          }}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {loading ? (
            <div style={{ color: 'var(--muted)', fontFamily: 'Share Tech Mono, monospace', fontSize: 11, padding: 16 }}>
              LOADING...
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontFamily: 'Share Tech Mono, monospace', fontSize: 11, padding: 16 }}>
              No sessions found.
            </div>
          ) : (
            sessions.map((s) => (
              <div key={s._id} style={{
                padding: '14px 16px', marginBottom: 8,
                border: '1px solid var(--border2)', background: 'var(--panel2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--muted)' }}>
                    {formatDate(s.startTime)}
                  </span>
                  <span style={{
                    fontFamily: 'Share Tech Mono, monospace', fontSize: 10,
                    color: s.status === 'completed' ? 'var(--cyan)' : 'var(--warning)',
                    border: `1px solid ${s.status === 'completed' ? 'rgba(0,245,212,0.3)' : 'rgba(255,170,0,0.3)'}`,
                    padding: '1px 6px',
                  }}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 20, fontWeight: 700, color: 'var(--cyan)' }}>
                      {s.score.toFixed(0)}%
                    </div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--muted)' }}>SCORE</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, color: 'var(--text)' }}>
                      {s.completedSteps.length}/10
                    </div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--muted)' }}>STEPS</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 12, color: 'var(--text)' }}>
                      {formatDuration(s.startTime, s.endTime)}
                    </div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--muted)' }}>DURATION</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
