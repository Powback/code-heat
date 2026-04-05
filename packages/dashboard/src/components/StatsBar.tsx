import React, { useEffect, useState } from 'react';
import type { ProfilingSession, HeatSnapshot } from '../types';

// [stats.props.1]
interface StatsBarProps {
  session: ProfilingSession | undefined;
  snapshot: HeatSnapshot | undefined;
  isConnected: boolean;
}

// [stats.render.1]
export function StatsBar({ session, snapshot, isConnected }: StatsBarProps) {
  // [stats.timer.1]
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.startTime) {
        setElapsed(Math.floor((Date.now() - session.startTime) / 1000));
      } else if (snapshot?.timestamp) {
        setElapsed(Math.floor((Date.now() - snapshot.timestamp) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, snapshot]);

  // [stats.errors.1]
  const topFunction = snapshot?.topFunctions?.[0];
  const target = session?.target || '—';
  const totalSamples = snapshot?.totalSamples || 0;
  const topFunctionName = topFunction?.name || '(none)';
  const topFunctionHeat = topFunction?.heat || 0;

  // [stats.style.1]
  return (
    <header
      style={{
        height: '60px',
        background: '#252526',
        borderBottom: '1px solid #404040',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0 16px',
        gap: '24px',
        color: '#e0e0e0',
      }}
    >
      {/* Connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#22c55e' : '#ef4444',
            // [stats.style.1]
            animation: !isConnected ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
          }}
        />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Session target */}
      <div>
        <span style={{ color: '#999', marginRight: '8px' }}>Target:</span>
        <span>{target}</span>
      </div>

      {/* Total samples */}
      <div>
        <span style={{ color: '#999', marginRight: '8px' }}>Samples:</span>
        <span style={{ fontFamily: 'monospace' }}>{totalSamples}</span>
      </div>

      {/* Top hot function */}
      <div style={{ flex: 1 }}>
        <span style={{ color: '#999', marginRight: '8px' }}>Top:</span>
        <span style={{ fontFamily: 'monospace' }}>
          {topFunctionName} — {topFunctionHeat.toFixed(1)}%
        </span>
      </div>

      {/* Elapsed time */}
      <div>
        <span style={{ color: '#999', marginRight: '8px' }}>Elapsed:</span>
        <span style={{ fontFamily: 'monospace' }}>{elapsed}s</span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </header>
  );
}
