export type AirQualityLevel = 'good' | 'moderate' | 'poor';

export interface AirQualityResult {
  level: AirQualityLevel;
  label: string;
}

export interface SensorReading {
  value: number;
  good: number;
  warning: number;
}

const LEVEL_RANK: Record<AirQualityLevel, number> = { good: 0, moderate: 1, poor: 2 };

const LEVEL_LABELS: Record<AirQualityLevel, string> = {
  good: 'Good',
  moderate: 'Moderate',
  poor: 'Poor',
};

/**
 * Classifies a single sensor reading against its thresholds.
 *
 * Threshold interpretation (WHO 2021 / ASHRAE defaults):
 *   value ≤ good     → 'good'     (e.g. PM2.5 ≤ 15 µg/m³, CO₂ ≤ 800 ppm)
 *   value ≤ warning  → 'moderate' (elevated, attention needed)
 *   value > warning  → 'poor'     (action required)
 */
export function classifyReading(reading: SensorReading): AirQualityLevel {
  if (reading.value <= reading.good) return 'good';
  if (reading.value <= reading.warning) return 'moderate';
  return 'poor';
}

/**
 * Derives overall air quality from a set of sensor readings.
 * Returns null when no readings are provided (no sensors configured).
 * The worst individual level drives the result.
 */
export function calculateAirQuality(readings: SensorReading[]): AirQualityResult | null {
  if (readings.length === 0) return null;

  let worst: AirQualityLevel = 'good';
  for (const reading of readings) {
    const level = classifyReading(reading);
    if (LEVEL_RANK[level] > LEVEL_RANK[worst]) {
      worst = level;
    }
  }

  return { level: worst, label: LEVEL_LABELS[worst] };
}

const AQ_PHRASES: Record<AirQualityLevel, string> = {
  good:     'clean air',
  moderate: 'moderate air',
  poor:     'poor air',
};

/**
 * Returns a natural-language phrase for an air quality level,
 * suitable for use as the trailing part of a combined status sentence.
 * e.g. "clean air", "moderate air", "poor air"
 */
export function airQualityPhrase(level: AirQualityLevel): string {
  return AQ_PHRASES[level];
}
