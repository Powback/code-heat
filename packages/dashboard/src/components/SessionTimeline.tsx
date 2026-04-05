import React, { useMemo } from 'react';
import type { HeatSnapshot } from '../types';

// [timeline.props.1]
interface SessionTimelineProps {
  snapshots: HeatSnapshot[];
  maxPoints?: number;
}

// [timeline.render.1]
export function SessionTimeline({ snapshots, maxPoints = 60 }: SessionTimelineProps) {
  // [timeline.data.1]
  const displaySnapshots = useMemo(() => {
    if (snapshots.length > maxPoints) {
      return snapshots.slice(-maxPoints);
    }
    return snapshots;
  }, [snapshots, maxPoints]);

  const points = useMemo(() => {
    const width = 780;
    const height = 120;
    const padding = 10;

    return displaySnapshots.map((snapshot, index) => {
      const maxScore = snapshot.maxScore || 0;
      const x = padding + (index / Math.max(displaySnapshots.length - 1, 1)) * (width - 2 * padding);
      const y = padding + (1 - maxScore) * height;
      return { x, y, maxScore };
    });
  }, [displaySnapshots]);

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // [timeline.labels.1]
  const lastSnapshot = displaySnapshots[displaySnapshots.length - 1];
  const firstSnapshot = displaySnapshots[0];
  const elapsedSeconds = lastSnapshot && firstSnapshot
    ? Math.floor((lastSnapshot.timestamp - firstSnapshot.timestamp) / 1000)
    : 0;
  const topFunction = lastSnapshot?.topFunctions?.[0];
  const totalSamples = lastSnapshot?.totalSamples || 0;

  return (
    <div style={{ width: '100%', background: '#1e1e1e', padding: '16px' }}>
      {/* [timeline.render.1] SVG Chart */}
      <svg
        width="100%"
        height="150"
        viewBox="0 0 800 150"
        style={{ display: 'block' }}
        // [timeline.responsive.1]
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Axes */}
        <line x1="10" y1="140" x2="790" y2="140" stroke="#404040" strokeWidth="1" />
        <line x1="10" y1="10" x2="10" y2="140" stroke="#404040" strokeWidth="1" />

        {/* Polyline */}
        {points.length > 1 && (
          <polyline
            points={polylinePoints}
            stroke="#f97316"
            strokeWidth="2"
            fill="none"
          />
        )}

        {/* Dots */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#f97316"
          />
        ))}
      </svg>

      {/* Labels */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '24px',
          marginTop: '12px',
          color: '#e0e0e0',
          fontSize: '13px',
        }}
      >
        <div>
          <span style={{ color: '#999' }}>Top function: </span>
          <span style={{ fontFamily: 'monospace' }}>{topFunction?.name || '(none)'}</span>
        </div>
        <div>
          <span style={{ color: '#999' }}>Total samples: </span>
          <span style={{ fontFamily: 'monospace' }}>{totalSamples}</span>
        </div>
        <div>
          <span style={{ color: '#999' }}>Duration: </span>
          <span style={{ fontFamily: 'monospace' }}>{elapsedSeconds}s</span>
        </div>
      </div>
    </div>
  );
}
