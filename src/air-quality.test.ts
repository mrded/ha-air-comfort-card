import { describe, expect, it } from "bun:test";
import { calculateAirQuality, classifyReading } from "./air-quality";

describe("classifyReading", () => {
  it("returns 'good' when value is below the good threshold", () => {
    expect(classifyReading({ value: 500, good: 800, warning: 1200 })).toBe('good');
  });

  it("returns 'good' when value equals the good threshold exactly", () => {
    expect(classifyReading({ value: 800, good: 800, warning: 1200 })).toBe('good');
  });

  it("returns 'moderate' when value is just above the good threshold", () => {
    expect(classifyReading({ value: 801, good: 800, warning: 1200 })).toBe('moderate');
  });

  it("returns 'moderate' when value equals the warning threshold exactly", () => {
    expect(classifyReading({ value: 1200, good: 800, warning: 1200 })).toBe('moderate');
  });

  it("returns 'poor' when value is just above the warning threshold", () => {
    expect(classifyReading({ value: 1201, good: 800, warning: 1200 })).toBe('poor');
  });

  it("returns 'poor' when value is well above the warning threshold", () => {
    expect(classifyReading({ value: 2000, good: 800, warning: 1200 })).toBe('poor');
  });

  describe("WHO 2021 reference thresholds", () => {
    it("PM2.5: classifies at WHO 24h limit (15 µg/m³) as good", () => {
      // WHO 2021 daily mean limit: 15 µg/m³
      expect(classifyReading({ value: 15, good: 15, warning: 35 })).toBe('good');
    });

    it("PM2.5: classifies above WHO limit as moderate", () => {
      expect(classifyReading({ value: 16, good: 15, warning: 35 })).toBe('moderate');
    });

    it("PM10: classifies at WHO 24h limit (45 µg/m³) as good", () => {
      // WHO 2021 daily mean limit: 45 µg/m³
      expect(classifyReading({ value: 45, good: 45, warning: 100 })).toBe('good');
    });

    it("NO2: classifies at WHO 24h limit (25 µg/m³) as good", () => {
      // WHO 2021 daily mean limit: 25 µg/m³
      expect(classifyReading({ value: 25, good: 25, warning: 150 })).toBe('good');
    });

    it("CO2: classifies at ASHRAE ventilation indicator (1000 ppm) as good", () => {
      // ASHRAE 62.1: 1000 ppm above outdoor is the informal threshold for poor ventilation
      expect(classifyReading({ value: 1000, good: 1000, warning: 1500 })).toBe('good');
    });

    it("CO2: classifies above ASHRAE threshold as moderate", () => {
      expect(classifyReading({ value: 1001, good: 1000, warning: 1500 })).toBe('moderate');
    });
  });
});

describe("calculateAirQuality", () => {
  it("returns null when no readings are provided", () => {
    expect(calculateAirQuality([])).toBeNull();
  });

  it("returns 'good' when the single reading is good", () => {
    const result = calculateAirQuality([{ value: 500, good: 800, warning: 1200 }]);
    expect(result?.level).toBe('good');
    expect(result?.label).toBe('Good');
  });

  it("returns 'moderate' when the single reading is moderate", () => {
    const result = calculateAirQuality([{ value: 1000, good: 800, warning: 1200 }]);
    expect(result?.level).toBe('moderate');
    expect(result?.label).toBe('Moderate');
  });

  it("returns 'poor' when the single reading is poor", () => {
    const result = calculateAirQuality([{ value: 1500, good: 800, warning: 1200 }]);
    expect(result?.level).toBe('poor');
    expect(result?.label).toBe('Poor');
  });

  describe("worst-wins rule", () => {
    it("returns 'poor' when one sensor is poor and others are good", () => {
      const result = calculateAirQuality([
        { value: 500,  good: 800,  warning: 1200 }, // good
        { value: 10,   good: 15,   warning: 35   }, // good
        { value: 2000, good: 800,  warning: 1200 }, // poor
      ]);
      expect(result?.level).toBe('poor');
    });

    it("returns 'moderate' when one sensor is moderate and others are good", () => {
      const result = calculateAirQuality([
        { value: 500,  good: 800, warning: 1200 }, // good
        { value: 1000, good: 800, warning: 1200 }, // moderate
      ]);
      expect(result?.level).toBe('moderate');
    });

    it("returns 'poor' when one sensor is poor and another is moderate", () => {
      const result = calculateAirQuality([
        { value: 1000, good: 800,  warning: 1200 }, // moderate
        { value: 1500, good: 800,  warning: 1200 }, // poor
      ]);
      expect(result?.level).toBe('poor');
    });

    it("returns 'good' when all sensors are good", () => {
      const result = calculateAirQuality([
        { value: 500, good: 800,  warning: 1200 },
        { value: 10,  good: 15,   warning: 35   },
        { value: 30,  good: 45,   warning: 100  },
      ]);
      expect(result?.level).toBe('good');
    });
  });

  describe("real-world sensor combinations", () => {
    it("all sensors at WHO/ASHRAE good limits → overall good", () => {
      const result = calculateAirQuality([
        { value: 800,  good: 800,  warning: 1200 }, // CO2  at good limit
        { value: 50,   good: 50,   warning: 150  }, // NO2  at good limit
        { value: 15,   good: 15,   warning: 35   }, // PM2.5 at WHO limit
        { value: 45,   good: 45,   warning: 100  }, // PM10 at WHO limit
        { value: 150,  good: 150,  warning: 250  }, // VOC  at good limit
      ]);
      expect(result?.level).toBe('good');
    });

    it("elevated CO2 with all other sensors good → moderate", () => {
      const result = calculateAirQuality([
        { value: 1100, good: 800,  warning: 1200 }, // CO2  elevated
        { value: 10,   good: 15,   warning: 35   }, // PM2.5 fine
        { value: 30,   good: 45,   warning: 100  }, // PM10 fine
      ]);
      expect(result?.level).toBe('moderate');
    });

    it("PM2.5 exceeding WHO limit with CO2 elevated → poor (PM2.5 drives result)", () => {
      const result = calculateAirQuality([
        { value: 1100, good: 800,  warning: 1200 }, // CO2  moderate
        { value: 80,   good: 15,   warning: 35   }, // PM2.5 poor
      ]);
      expect(result?.level).toBe('poor');
    });
  });
});
