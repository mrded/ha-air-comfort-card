import { describe, expect, it } from 'bun:test';
import { getTranslations } from './translations';

describe('getTranslations', () => {
  it('returns English for "en"', () => {
    expect(getTranslations('en').card.title).toBe('Air Comfort');
  });

  it('returns German for "de"', () => {
    expect(getTranslations('de').card.title).toBe('Luftkomfort');
  });

  it('normalises language tags — "de-DE" falls back to German', () => {
    expect(getTranslations('de-DE').card.title).toBe('Luftkomfort');
  });

  it('normalises case — "DE" resolves to German', () => {
    expect(getTranslations('DE').card.title).toBe('Luftkomfort');
  });

  it('falls back to English for unsupported languages', () => {
    expect(getTranslations('fr').card.title).toBe('Air Comfort');
  });

  it('falls back to English when lang is undefined', () => {
    expect(getTranslations(undefined).card.title).toBe('Air Comfort');
  });

  it('English status keys cover all comfort zone outputs', () => {
    const statusKeys = ['PLEASANT', 'COLD', 'HOT', 'DRY', 'HUMID', 'COLD & DRY', 'COLD & HUMID', 'HOT & DRY', 'HOT & HUMID'];
    const t = getTranslations('en');
    for (const key of statusKeys) {
      expect(t.status[key]).toBeTruthy();
    }
  });

  it('German status keys cover all comfort zone outputs', () => {
    const statusKeys = ['PLEASANT', 'COLD', 'HOT', 'DRY', 'HUMID', 'COLD & DRY', 'COLD & HUMID', 'HOT & DRY', 'HOT & HUMID'];
    const t = getTranslations('de');
    for (const key of statusKeys) {
      expect(t.status[key]).toBeTruthy();
    }
  });

  it('English air quality keys cover all levels', () => {
    const t = getTranslations('en');
    expect(t.airQuality['good']).toBeTruthy();
    expect(t.airQuality['moderate']).toBeTruthy();
    expect(t.airQuality['poor']).toBeTruthy();
  });

  it('German air quality keys cover all levels', () => {
    const t = getTranslations('de');
    expect(t.airQuality['good']).toBeTruthy();
    expect(t.airQuality['moderate']).toBeTruthy();
    expect(t.airQuality['poor']).toBeTruthy();
  });
});
