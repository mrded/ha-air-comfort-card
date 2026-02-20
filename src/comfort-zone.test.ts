import { describe, expect, it } from "bun:test";
import { calculateComfortZone } from "./comfort-zone";

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

    it("returns WARM when temperature is above range", () => {
      const result = calculateComfortZone(28, 50);
      expect(result.isInComfortZone).toBe(false);
      expect(result.statusText).toBe("WARM");
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

    it("returns WARM & DRY when both are out of range in that direction", () => {
      const result = calculateComfortZone(30, 20);
      expect(result.statusText).toBe("WARM & DRY");
    });

    it("returns WARM & HUMID when both are out of range in that direction", () => {
      const result = calculateComfortZone(30, 70);
      expect(result.statusText).toBe("WARM & HUMID");
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
      expect(result.statusText).toBe("WARM");
      expect(result.tempDeviation).toBe(5);
    });
  });
});
