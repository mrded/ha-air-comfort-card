import { describe, expect, it } from 'bun:test';
import { getTranslations } from './translations';

describe('getTranslations', () => {
  it('returns English for "en"', () => {
    expect(getTranslations('en').card.title).toBe('Air Comfort');
  });

  it('returns German for "de"', () => {
    expect(getTranslations('de').card.title).toBe('Luftkomfort');
  });

  it('returns English for "nl"', () => {
    expect(getTranslations('nl').card.title).toBe('Luchtcomfort');
  });

  it('returns French for "fr"', () => {
    expect(getTranslations('fr').card.title).toBe('Confort de l\'air');
  });

  it('normalises language tags — "de-DE" falls back to German', () => {
    expect(getTranslations('de-DE').card.title).toBe('Luftkomfort');
  });

  it('normalises case — "DE" resolves to German', () => {
    expect(getTranslations('DE').card.title).toBe('Luftkomfort');
  });

  it('falls back to English for unsupported languages', () => {
    expect(getTranslations('xx').card.title).toBe('Air Comfort');
  });

  it('falls back to English when lang is undefined', () => {
    expect(getTranslations(undefined).card.title).toBe('Air Comfort');
  });

  describe('translations', () => {
    const languages = ['en', 'de', 'nl', 'fr'] as const;

    const statusKeys = [
      'PLEASANT',
      'COLD',
      'HOT',
      'DRY',
      'HUMID',
      'COLD & DRY',
      'COLD & HUMID',
      'HOT & DRY',
      'HOT & HUMID',
    ];

    const airQualityKeys = [
      'good',
      'moderate',
      'poor',
    ];

    describe.each(languages)('%s', (language: string | undefined) => {
      it('contains all comfort zone status keys', () => {
        const t = getTranslations(language);

        for (const key of statusKeys) {
          expect(t.status[key]).toBeTruthy();
        }
      });

      it('contains all air quality keys', () => {
        const t = getTranslations(language);

        for (const key of airQualityKeys) {
          expect(t.airQuality[key]).toBeTruthy();
        }
      });
    });
  });
});
