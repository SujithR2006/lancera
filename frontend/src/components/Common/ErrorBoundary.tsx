import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div style={{
          height: '100vh', width: '100vw', 
          display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center',
          background: '#020b14', color: '#ff2d55',
          fontFamily: 'Orbitron, sans-serif', padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>⚠ SYSTEM FAILURE</h1>
          <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', color: '#3a6070', maxWidth: '600px' }}>
            A critical error occurred in the simulation engine. 
            The diagnostic report points to a component crash.
          </p>
          <pre style={{ 
            marginTop: '20px', padding: '10px', 
            background: 'rgba(255,45,85,0.05)', border: '1px solid rgba(255,45,85,0.2)',
            fontSize: '10px', color: '#ff2d55', overflow: 'auto', maxWidth: '90%'
          }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '30px', background: '#00f5d4', color: '#020b14',
              border: 'none', padding: '10px 20px', cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif', fontWeight: 'bold'
            }}
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
