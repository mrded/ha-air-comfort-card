import { AirQualityResult, AirQualityLevel } from './air-quality';
import { thermalStatusLabel } from './comfort-zone';

export interface StatusTranslations {
  status: Record<string, string>;
  airQuality: Record<string, string>;
}

/**
 * 0 = comfortable / clean
 * 1 = minor issue (single thermal deviation, or moderate air quality)
 * 2 = serious issue (combined thermal deviation, or poor air quality)
 */
export type Severity = 0 | 1 | 2;

const THERMAL_SEVERITY: Record<string, Severity> = {
  'PLEASANT':     0,
  'COLD':         1,
  'HOT':          1,
  'DRY':          1,
  'HUMID':        1,
  'COLD & DRY':   2,
  'COLD & HUMID': 2,
  'HOT & DRY':   2,
  'HOT & HUMID': 2,
};

const AQ_SEVERITY: Record<AirQualityLevel, Severity> = {
  good:     0,
  moderate: 1,
  poor:     2,
};

const AQ_LABELS: Record<AirQualityLevel, string> = {
  good:     'Clean air',
  moderate: 'Moderate air',
  poor:     'Poor air',
};

export function thermalSeverity(statusText: string): Severity {
  return THERMAL_SEVERITY[statusText] ?? 1;
}

export function airQualitySeverity(level: AirQualityLevel): Severity {
  return AQ_SEVERITY[level];
}

/**
 * Returns the single dominant status to display.
 *
 * Rules:
 * - Both comfortable/clean (severity 0) → show thermal label
 * - One side is worse → show that side's label
 * - Equal severity and both non-zero → AQ wins (thermal is already shown on the dial)
 */
export function dominantStatus(
  statusText: string,
  aqResult: AirQualityResult | null,
  t?: StatusTranslations
): { label: string; severity: Severity } {
  const thermalSev = thermalSeverity(statusText);
  const aqSev = aqResult ? airQualitySeverity(aqResult.level) : 0;
  const severity = Math.max(thermalSev, aqSev) as Severity;

  const aqWins = aqResult !== null && aqSev > 0 && aqSev >= thermalSev;
  const label = aqWins
    ? (t?.airQuality[aqResult!.level] ?? AQ_LABELS[aqResult!.level])
    : (t?.status[statusText] ?? thermalStatusLabel(statusText));

  return { label, severity };
}
