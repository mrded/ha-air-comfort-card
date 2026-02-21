export interface ComfortZoneResult {
  angle: number;
  radialDistance: number;
  isInComfortZone: boolean;
  statusText: string;
  tempDeviation: number;
  humidityDeviation: number;
}

export interface ComfortZoneOptions {
  tempMin?: number;
  tempMax?: number;
  humidityMin?: number;
  humidityMax?: number;
}

// Temperature conversion utilities
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

// Comfort zone calculation based on temperature and humidity
export function calculateComfortZone(
  temp: number,
  humidity: number,
  options?: ComfortZoneOptions
): ComfortZoneResult {
  const tempMin = options?.tempMin ?? 20;
  const tempMax = options?.tempMax ?? 24;
  const humidityMin = options?.humidityMin ?? 40;
  const humidityMax = options?.humidityMax ?? 60;

  // Normalization factors for radial distance calculation
  const TEMP_NORMALIZATION_FACTOR = 10; // 10°C deviation = 1.0 normalized
  const HUMIDITY_NORMALIZATION_FACTOR = 40; // 40% deviation = 1.0 normalized

  // Thresholds for combined status messages
  const TEMP_PREFERENCE_THRESHOLD = 0.5; // Prefer temperature in status when temp deviation is 50% larger
  const HUMIDITY_COMBINATION_THRESHOLD = 5; // Show combined status if humidity deviates by 5%+
  const TEMP_COMBINATION_THRESHOLD = 1; // Show combined status if temperature deviates by 1°C+

  // Calculate deviations from comfort zone
  let tempDeviation = 0;
  if (temp < tempMin) {
    tempDeviation = tempMin - temp;
  } else if (temp > tempMax) {
    tempDeviation = temp - tempMax;
  }

  let humidityDeviation = 0;
  if (humidity < humidityMin) {
    humidityDeviation = humidityMin - humidity;
  } else if (humidity > humidityMax) {
    humidityDeviation = humidity - humidityMax;
  }

  // Check if in comfort zone
  const isInComfortZone = tempDeviation === 0 && humidityDeviation === 0;

  // Map to angle (0-360 degrees)
  // Top (0°): Too warm
  // Right (90°): Humid
  // Bottom (180°): Cold
  // Left (270°): Dry
  let angle = 0;

  if (isInComfortZone) {
    // If fully in comfort zone, use actual values relative to ideal center to determine a neutral position
    const idealTemp = (tempMin + tempMax) / 2;
    const idealHumidity = (humidityMin + humidityMax) / 2;
    const tempOffset = temp - idealTemp;
    const humidityOffset = humidity - idealHumidity;
    // Use same direction mapping as outside-zone: warm=top(0°), humid=right(90°), cold=bottom(180°), dry=left(270°)
    angle = Math.atan2(-tempOffset, humidityOffset) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;
  } else {
    // Calculate angle based on actual deviations, not just direction
    // Use actual deviation values for angle calculation
    let tempAngleComponent = 0;
    let humidityAngleComponent = 0;

    if (temp < tempMin) {
      tempAngleComponent = temp - tempMin; // Negative for cold
    } else if (temp > tempMax) {
      tempAngleComponent = temp - tempMax; // Positive for warm
    }

    if (humidity < humidityMin) {
      humidityAngleComponent = humidity - humidityMin; // Negative for dry
    } else if (humidity > humidityMax) {
      humidityAngleComponent = humidity - humidityMax; // Positive for humid
    }

    // Calculate angle using atan2(-temp, humidity) + 90 to map:
    // - Warm (temp > 0) → 0° (top)
    // - Humid (humidity > 0) → 90° (right)
    // - Cold (temp < 0) → 180° (bottom)
    // - Dry (humidity < 0) → 270° (left)
    angle =
      Math.atan2(-tempAngleComponent, humidityAngleComponent) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;
  }

  // Calculate radial distance based on deviation magnitude
  // Normalize deviations to a 0-1 scale
  const normalizedTempDev = tempDeviation / TEMP_NORMALIZATION_FACTOR;
  const normalizedHumidityDev =
    humidityDeviation / HUMIDITY_NORMALIZATION_FACTOR;

  // Combined deviation (Euclidean distance)
  const radialDistance = Math.sqrt(
    normalizedTempDev * normalizedTempDev +
      normalizedHumidityDev * normalizedHumidityDev
  );

  // Determine status text
  let statusText = "PLEASANT";

  if (!isInComfortZone) {
    // Find the most significant deviation
    const absTempDev = Math.abs(tempDeviation);
    const absHumidityDev = Math.abs(humidityDeviation);

    if (absTempDev > absHumidityDev * TEMP_PREFERENCE_THRESHOLD) {
      // Temperature is the primary issue (with threshold to prefer temp)
      if (temp < tempMin) {
        statusText =
          absHumidityDev > HUMIDITY_COMBINATION_THRESHOLD
            ? humidity < humidityMin
              ? "COLD & DRY"
              : "COLD & HUMID"
            : "COLD";
      } else {
        statusText =
          absHumidityDev > HUMIDITY_COMBINATION_THRESHOLD
            ? humidity < humidityMin
              ? "HOT & DRY"
              : "HOT & HUMID"
            : "HOT";
      }
    } else {
      // Humidity is the primary issue
      if (humidity < humidityMin) {
        statusText =
          absTempDev > TEMP_COMBINATION_THRESHOLD
            ? temp < tempMin
              ? "COLD & DRY"
              : "HOT & DRY"
            : "DRY";
      } else {
        statusText =
          absTempDev > TEMP_COMBINATION_THRESHOLD
            ? temp < tempMin
              ? "COLD & HUMID"
              : "HOT & HUMID"
            : "HUMID";
      }
    }
  }

  return {
    angle,
    radialDistance,
    isInComfortZone,
    statusText,
    tempDeviation,
    humidityDeviation
  };
}

const THERMAL_NATURAL_LABELS: Record<string, string> = {
  'PLEASANT':     'Comfortable',
  'COLD':         'Cold',
  'HOT':          'Hot',
  'DRY':          'Dry',
  'HUMID':        'Humid',
  'COLD & DRY':   'Cold & dry',
  'COLD & HUMID': 'Cold & humid',
  'HOT & DRY':   'Hot & dry',
  'HOT & HUMID': 'Hot & humid',
};

/**
 * Converts an uppercase comfort zone status text to a natural-case label.
 * Falls back to the original text if no mapping exists.
 */
export function thermalStatusLabel(statusText: string): string {
  return THERMAL_NATURAL_LABELS[statusText] ?? statusText;
}
