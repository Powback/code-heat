import type { LineHeat } from '../types';

// [colors.rgba.1]
export function heatScoreToRgba(score: number): string {
  const clampedScore = Math.max(0, Math.min(1, score));

  if (clampedScore < 0.2) {
    return 'rgba(34, 197, 94, 0.15)'; // green
  } else if (clampedScore < 0.4) {
    return 'rgba(134, 197, 34, 0.20)'; // yellow-green
  } else if (clampedScore < 0.6) {
    return 'rgba(249, 115, 22, 0.25)'; // orange
  } else if (clampedScore < 0.8) {
    return 'rgba(239, 68, 68, 0.30)'; // red
  } else {
    return 'rgba(220, 38, 38, 0.45)'; // crimson
  }
}

// [colors.class.1]
export function heatScoreToCssClass(score: number): string {
  if (score < 0.2) return 'heat-cool';
  if (score < 0.4) return 'heat-warm';
  if (score < 0.6) return 'heat-hot';
  if (score < 0.8) return 'heat-very-hot';
  return 'heat-critical';
}

// [colors.tooltip.1]
export function formatHeatTooltip(heat: LineHeat): string {
  return `Line ${heat.lineNumber}: ${heat.hits} hits, avg ${heat.averageTime.toFixed(2)}ms, max ${heat.maxTime.toFixed(2)}ms`;
}

// [colors.cssblock.1]
export function getHeatCssBlock(): string {
  return `
    .heat-cool {
      background-color: rgba(34, 197, 94, 0.15);
      transition: background-color 0.3s ease;
    }
    .heat-warm {
      background-color: rgba(134, 197, 34, 0.20);
      transition: background-color 0.3s ease;
    }
    .heat-hot {
      background-color: rgba(249, 115, 22, 0.25);
      transition: background-color 0.3s ease;
    }
    .heat-very-hot {
      background-color: rgba(239, 68, 68, 0.30);
      transition: background-color 0.3s ease;
    }
    .heat-critical {
      background-color: rgba(220, 38, 38, 0.45);
      transition: background-color 0.3s ease;
    }
    .heat-glyph {
      width: 4px !important;
      margin-left: 3px;
    }
  `;
}

// [colors.palette.1]
export const HEAT_PALETTE = {
  cool: { hex: '#22c55e', label: '0–20%' },
  warm: { hex: '#86c522', label: '20–40%' },
  hot: { hex: '#f97316', label: '40–60%' },
  veryHot: { hex: '#ef4444', label: '60–80%' },
  critical: { hex: '#dc2626', label: '80–100%' },
} as const;
