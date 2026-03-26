import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/client';
import { useSurgeryStore } from '../store/useSurgeryStore';
import TopHUD from '../components/HUD/TopHUD';
import StepsTracker from '../components/LeftPanel/StepsTracker';
import HeartViewer from '../components/CenterPanel/HeartViewer';
import ARIAPanel from '../components/AIGuide/ARIAPanel';
import InstrumentsPanel from '../components/RightPanel/InstrumentsPanel';
import SessionHistory from './SessionHistory';
import CompletionModal from './CompletionModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    setUser, setToken, setSession, setModelAvailable,
    updateVitals, setAriaText, setAriaLoading,
    showHistory, setShowHistory, showCompletion, sessionId, vrMode
  } = useSurgeryStore();
  const [dbOffline, setDbOffline] = useState(false);
  const [initError, setInitError] = useState('');

  useEffect(() => {
    let socket: ReturnType<typeof io> | null = null;

    const init = async () => {
      // 1. Verify token
      try {
        const { data: userData } = await api.get('/auth/me');
        setUser(userData);
      } catch {
        navigate('/login');
        return;
      }

      // 2. Start session
      let newSessionId = '';
      try {
        const { data: session } = await api.post('/surgery/session/start');
        newSessionId = session.sessionId;
        setSession(newSessionId);
      } catch (err: any) {
        if (err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
          setDbOffline(true);
        }
        setInitError('Could not start session. Working in offline mode.');
      }

      // 3. Check model availability
      try {
        const { data: mdl } = await api.get('/models/heart');
        setModelAvailable(mdl.available);
      } catch {
        setModelAvailable(false);
      }

      // 4. Socket.io (Uses relative path to work with Vite proxy)
      socket = io({ transports: ['websocket', 'polling'] });
      socket.on('vitals_update', (vitals) => updateVitals(vitals));
      socket.on('connect_error', () => {});

      // 5. Initial ARIA guidance for step 0
      setAriaLoading(true);
      try {
        const { data: aria } = await api.post('/ai/guide', {
          stepIndex: 0,
          stepName: 'Pre-operative Assessment',
          action: 'session_start',
          sessionId: newSessionId,
        });
        setAriaText(aria.guidance || '', aria.warning || null);
      } catch {
        setAriaText('Pre-operative assessment initiated. Verify patient hemodynamics, confirm surgical site, and complete pre-op checklist.', null);
      } finally {
        setAriaLoading(false);
      }
    };

    init();
    return () => { socket?.disconnect(); };
  }, []);

  const renderUI = (isLeftEye: boolean) => (
    <div style={{
      width: vrMode ? '50vw' : '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', position: 'relative',
      minWidth: vrMode ? 500 : 1280, // Allow smaller width for VR split
      borderRight: vrMode && isLeftEye ? '2px solid black' : 'none',
    }}>
      {/* VR Lens Overlay (Decorative) */}
      {vrMode && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1000, pointerEvents: 'none',
          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.98) 100%)',
          boxShadow: 'inset 0 0 150px 80px rgba(0,0,0,1)',
        }} />
      )}

      {/* Internal Content Wrapper - Scaled in VR for better fit */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        transform: vrMode ? 'scale(0.7)' : 'none',
        transformOrigin: 'center center',
        width: vrMode ? '142.8%' : '100%', // Compensation for 0.7 scale
        height: vrMode ? '142.8%' : '100%',
        position: vrMode ? 'absolute' : 'relative',
        top: vrMode ? '50%' : 0,
        left: vrMode ? '50%' : 0,
        marginLeft: vrMode ? '-71.4%' : 0,
        marginTop: vrMode ? '-71.4%' : 0,
      }}>
        {/* HUD */}
        <TopHUD />

        {/* Main 3-column layout */}
        <div style={{
          flex: 1, display: 'flex', overflow: 'hidden',
          marginTop: dbOffline ? 28 : 0,
        }}>
          <StepsTracker />

          {/* Center: 3D + ARIA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <HeartViewer />
            </div>
            <ARIAPanel />
          </div>

          <InstrumentsPanel />
        </div>
      </div>

      {/* History button - Only show on single view to avoid clutter in VR */}
      {!vrMode && (
        <button
          onClick={() => setShowHistory(true)}
          style={{
            position: 'absolute', top: 70, right: 290, zIndex: 100,
            background: 'var(--panel)', border: '1px solid var(--border2)',
            color: 'var(--muted)', fontFamily: 'Orbitron, monospace', fontSize: 8,
            padding: '6px 10px', cursor: 'pointer', letterSpacing: 1,
          }}
        >
          ⊞ HISTORY
        </button>
      )}
    </div>
  );

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: 'black',
      display: 'flex',
    }}>
      {/* Too small overlay */}
      <div style={{
        display: 'none',
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg)', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }} id="too-small-overlay">
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, color: 'var(--red)' }}>
          ⚠ DISPLAY TOO SMALL
        </div>
      </div>

      {/* DB Offline banner */}
      {dbOffline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(255,45,85,0.12)', border: '1px solid var(--red)',
          padding: '6px 20px',
          fontFamily: 'Share Tech Mono, monospace', fontSize: 11,
          color: 'var(--red)', textAlign: 'center', letterSpacing: 1,
        }}>
          ⚠ DATABASE OFFLINE — Running in simulation mode.
        </div>
      )}

      {/* Render eyes */}
      {renderUI(true)}
      {vrMode && renderUI(false)}

      {/* Global Overlays */}
      {showHistory && <SessionHistory />}
      {showCompletion && <CompletionModal />}
    </div>
  );
}
