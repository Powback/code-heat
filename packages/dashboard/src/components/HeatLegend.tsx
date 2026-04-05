import React from 'react';
import { HEAT_PALETTE, heatScoreToRgba } from '../lib/heat-colors';

// [legend.props.1]
export function HeatLegend() {
  // [legend.colors.1]
  const swatchMidpoints = [0.1, 0.3, 0.5, 0.7, 0.9];
  const levels = [
    { key: 'cool', label: 'Cool', range: '0–20%', midpoint: swatchMidpoints[0] },
    { key: 'warm', label: 'Warm', range: '20–40%', midpoint: swatchMidpoints[1] },
    { key: 'hot', label: 'Hot', range: '40–60%', midpoint: swatchMidpoints[2] },
    { key: 'veryHot', label: 'Very Hot', range: '60–80%', midpoint: swatchMidpoints[3] },
    { key: 'critical', label: 'Critical', range: '80–100%', midpoint: swatchMidpoints[4] },
  ] as const;

  // [legend.render.1]
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
        padding: '12px',
        background: '#252526',
        borderTop: '1px solid #404040',
      }}
    >
      {levels.map((level) => (
        <div
          key={level.key}
          className="heat-swatch"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          // [legend.a11y.1]
          aria-label={`${level.label} heat level: ${level.range}`}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              background: heatScoreToRgba(level.midpoint),
              border: '1px solid #666',
              borderRadius: '2px',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#e0e0e0', fontSize: '13px', fontWeight: 500 }}>
              {level.label}
            </span>
            <span style={{ color: '#999', fontSize: '11px' }}>
              {level.range}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
