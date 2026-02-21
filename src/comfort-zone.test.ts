import { describe, expect, it } from "bun:test";
import {
  calculateComfortZone,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  thermalStatusLabel,
} from "./comfort-zone";

describe("calculateComfortZone", () => {
  describe("comfort zone detection", () => {
    it("returns PLEASANT when temp and humidity are within range", () => {
      const result = calculateComfortZone(22, 50);
      expect(result.isInComfortZone).toBe(true);
      expect(result.statusText).toBe("PLEASANT");
      expect(result.tempDeviation).toBe(0);
      expect(result.humidityDeviation).toBe(0);
      expect(result.radialDistance).toBe(0);
    });

    it("returns PLEASANT at the boundaries of the comfort zone", () => {
      expect(calculateComfortZone(20, 40).statusText).toBe("PLEASANT");
      expect(calculateComfortZone(24, 60).statusText).toBe("PLEASANT");
    });
  });

  describe("temperature deviations", () => {
    it("returns COLD when temperature is below range", () => {
      const result = calculateComfortZone(15, 50);
      expect(result.isInComfortZone).toBe(false);
      expect(result.statusText).toBe("COLD");
      expect(result.tempDeviation).toBe(5);
      expect(result.humidityDeviation).toBe(0);
    });

    it("returns HOT when temperature is above range", () => {
      const result = calculateComfortZone(28, 50);
      expect(result.isInComfortZone).toBe(false);
      expect(result.statusText).toBe("HOT");
      expect(result.tempDeviation).toBe(4);
      expect(result.humidityDeviation).toBe(0);
    });
  });

  describe("humidity deviations", () => {
    it("returns DRY when humidity is below range", () => {
      const result = calculateComfortZone(22, 30);
      expect(result.isInComfortZone).toBe(false);
      expect(result.statusText).toBe("DRY");
      expect(result.tempDeviation).toBe(0);
      expect(result.humidityDeviation).toBe(10);
    });

    it("returns HUMID when humidity is above range", () => {
      const result = calculateComfortZone(22, 70);
      expect(result.isInComfortZone).toBe(false);
      expect(result.statusText).toBe("HUMID");
      expect(result.tempDeviation).toBe(0);
      expect(result.humidityDeviation).toBe(10);
    });
  });

  describe("combined deviations", () => {
    it("returns COLD & DRY when both are out of range in that direction", () => {
      const result = calculateComfortZone(10, 20);
      expect(result.statusText).toBe("COLD & DRY");
    });

    it("returns COLD & HUMID when both are out of range in that direction", () => {
      const result = calculateComfortZone(10, 80);
      expect(result.statusText).toBe("COLD & HUMID");
    });

    it("returns HOT & DRY when both are out of range in that direction", () => {
      const result = calculateComfortZone(30, 20);
      expect(result.statusText).toBe("HOT & DRY");
    });

    it("returns HOT & HUMID when both are out of range in that direction", () => {
      const result = calculateComfortZone(30, 70);
      expect(result.statusText).toBe("HOT & HUMID");
    });
  });

  describe("indicator angle", () => {
    it("points upward (~0°) when too warm", () => {
      const result = calculateComfortZone(28, 50);
      expect(result.angle).toBeCloseTo(0, 0);
    });

    it("points right (~90°) when too humid", () => {
      const result = calculateComfortZone(22, 70);
      expect(result.angle).toBeCloseTo(90, 0);
    });

    it("points downward (~180°) when too cold", () => {
      const result = calculateComfortZone(15, 50);
      expect(result.angle).toBeCloseTo(180, 0);
    });

    it("points left (~270°) when too dry", () => {
      const result = calculateComfortZone(22, 30);
      expect(result.angle).toBeCloseTo(270, 0);
    });
  });

  describe("radial distance", () => {
    it("is 0 when inside the comfort zone", () => {
      expect(calculateComfortZone(22, 50).radialDistance).toBe(0);
    });

    it("increases proportionally with temperature deviation", () => {
      const small = calculateComfortZone(19, 50); // 1°C below
      const large = calculateComfortZone(15, 50); // 5°C below
      expect(large.radialDistance).toBeGreaterThan(small.radialDistance);
      expect(large.radialDistance).toBeCloseTo(0.5, 5); // 5/10 = 0.5
    });

    it("increases proportionally with humidity deviation", () => {
      const result = calculateComfortZone(22, 70); // 10% above max
      expect(result.radialDistance).toBeCloseTo(0.25, 5); // 10/40 = 0.25
    });

    it("combines temperature and humidity deviations as euclidean distance", () => {
      // temp: 5°C above max → 0.5 normalised; humidity: 10% above max → 0.25 normalised
      const result = calculateComfortZone(29, 70);
      const expected = Math.sqrt(0.5 * 0.5 + 0.25 * 0.25);
      expect(result.radialDistance).toBeCloseTo(expected, 5);
    });
  });

  describe("custom comfort zone options", () => {
    it("respects custom temperature range", () => {
      const result = calculateComfortZone(18, 50, { tempMin: 16, tempMax: 20 });
      expect(result.isInComfortZone).toBe(true);
      expect(result.statusText).toBe("PLEASANT");
    });

    it("respects custom humidity range", () => {
      const result = calculateComfortZone(22, 35, {
        humidityMin: 30,
        humidityMax: 50,
      });
      expect(result.isInComfortZone).toBe(true);
      expect(result.statusText).toBe("PLEASANT");
    });

    it("detects deviation outside custom ranges", () => {
      const result = calculateComfortZone(25, 50, { tempMin: 16, tempMax: 20 });
      expect(result.isInComfortZone).toBe(false);
      expect(result.statusText).toBe("HOT");
      expect(result.tempDeviation).toBe(5);
    });
  });
});

describe("celsiusToFahrenheit", () => {
  it("converts freezing point", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it("converts boiling point", () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it("converts body temperature", () => {
    expect(celsiusToFahrenheit(37)).toBeCloseTo(98.6, 1);
  });

  it("converts the crossover point where both scales are equal", () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });
});

describe("fahrenheitToCelsius", () => {
  it("converts freezing point", () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
  });

  it("converts boiling point", () => {
    expect(fahrenheitToCelsius(212)).toBe(100);
  });

  it("converts body temperature", () => {
    expect(fahrenheitToCelsius(98.6)).toBeCloseTo(37, 1);
  });

  it("converts the crossover point where both scales are equal", () => {
    expect(fahrenheitToCelsius(-40)).toBe(-40);
  });

  it("is the inverse of celsiusToFahrenheit", () => {
    expect(fahrenheitToCelsius(celsiusToFahrenheit(22))).toBeCloseTo(22, 10);
  });
});

describe("thermalStatusLabel", () => {
  it("maps PLEASANT to Comfortable", () => {
    expect(thermalStatusLabel("PLEASANT")).toBe("Comfortable");
  });

  it("maps single-direction statuses to title-case", () => {
    expect(thermalStatusLabel("COLD")).toBe("Cold");
    expect(thermalStatusLabel("HOT")).toBe("Hot");
    expect(thermalStatusLabel("DRY")).toBe("Dry");
    expect(thermalStatusLabel("HUMID")).toBe("Humid");
  });

  it("maps combined statuses preserving the ampersand in sentence case", () => {
    expect(thermalStatusLabel("COLD & DRY")).toBe("Cold & dry");
    expect(thermalStatusLabel("COLD & HUMID")).toBe("Cold & humid");
    expect(thermalStatusLabel("HOT & DRY")).toBe("Hot & dry");
    expect(thermalStatusLabel("HOT & HUMID")).toBe("Hot & humid");
  });

  it("falls back to the original text for unknown status values", () => {
    expect(thermalStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });

  it("covers every status text produced by calculateComfortZone", () => {
    const statuses = [
      calculateComfortZone(22, 50),  // PLEASANT
      calculateComfortZone(15, 50),  // COLD
      calculateComfortZone(28, 50),  // HOT
      calculateComfortZone(22, 30),  // DRY
      calculateComfortZone(22, 70),  // HUMID
      calculateComfortZone(10, 20),  // COLD & DRY
      calculateComfortZone(10, 80),  // COLD & HUMID
      calculateComfortZone(30, 20),  // HOT & DRY
      calculateComfortZone(30, 70),  // HOT & HUMID
    ];
    for (const { statusText } of statuses) {
      expect(thermalStatusLabel(statusText)).not.toBe(statusText);
    }
  });
});
