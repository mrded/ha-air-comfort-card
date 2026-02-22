import { describe, expect, it } from 'bun:test';
import { dominantStatus, thermalSeverity, airQualitySeverity } from './status';
import type { AirQualityResult } from './air-quality';

const aq = (level: AirQualityResult['level']): AirQualityResult => ({
  level,
  label: level.charAt(0).toUpperCase() + level.slice(1),
});

describe('thermalSeverity', () => {
  it('returns 0 for PLEASANT', () => {
    expect(thermalSeverity('PLEASANT')).toBe(0);
  });

  it('returns 1 for single-direction issues', () => {
    expect(thermalSeverity('COLD')).toBe(1);
    expect(thermalSeverity('HOT')).toBe(1);
    expect(thermalSeverity('DRY')).toBe(1);
    expect(thermalSeverity('HUMID')).toBe(1);
  });

  it('returns 2 for combined issues', () => {
    expect(thermalSeverity('COLD & DRY')).toBe(2);
    expect(thermalSeverity('COLD & HUMID')).toBe(2);
    expect(thermalSeverity('HOT & DRY')).toBe(2);
    expect(thermalSeverity('HOT & HUMID')).toBe(2);
  });

  it('returns 1 for unknown status as a safe fallback', () => {
    expect(thermalSeverity('UNKNOWN')).toBe(1);
  });
});

describe('airQualitySeverity', () => {
  it('returns 0 for good', () => expect(airQualitySeverity('good')).toBe(0));
  it('returns 1 for moderate', () => expect(airQualitySeverity('moderate')).toBe(1));
  it('returns 2 for poor', () => expect(airQualitySeverity('poor')).toBe(2));
});

describe('dominantStatus', () => {
  describe('no AQ sensors configured', () => {
    it('shows thermal label with thermal severity', () => {
      expect(dominantStatus('PLEASANT', null)).toEqual({ label: 'Comfortable', severity: 0 });
      expect(dominantStatus('COLD', null)).toEqual({ label: 'Cold', severity: 1 });
      expect(dominantStatus('HOT & DRY', null)).toEqual({ label: 'Hot & dry', severity: 2 });
    });
  });

  describe('thermal wins', () => {
    it('shows thermal when both are severity 0', () => {
      const result = dominantStatus('PLEASANT', aq('good'));
      expect(result.label).toBe('Comfortable');
      expect(result.severity).toBe(0);
    });

    it('shows thermal when thermal severity is higher', () => {
      const result = dominantStatus('COLD & DRY', aq('moderate'));
      expect(result.label).toBe('Cold & dry');
      expect(result.severity).toBe(2);
    });

    it('shows thermal when thermal is 2 and AQ is 1', () => {
      const result = dominantStatus('HOT & HUMID', aq('moderate'));
      expect(result.label).toBe('Hot & humid');
      expect(result.severity).toBe(2);
    });
  });

  describe('AQ wins', () => {
    it('shows AQ when it is worse than thermal', () => {
      const result = dominantStatus('PLEASANT', aq('poor'));
      expect(result.label).toBe('Poor air');
      expect(result.severity).toBe(2);
    });

    it('shows AQ moderate when thermal is comfortable', () => {
      const result = dominantStatus('PLEASANT', aq('moderate'));
      expect(result.label).toBe('Moderate air');
      expect(result.severity).toBe(1);
    });

    it('shows AQ when both are severity 1 (tie goes to AQ)', () => {
      const result = dominantStatus('COLD', aq('moderate'));
      expect(result.label).toBe('Moderate air');
      expect(result.severity).toBe(1);
    });

    it('shows AQ when both are severity 2 (tie goes to AQ)', () => {
      const result = dominantStatus('COLD & DRY', aq('poor'));
      expect(result.label).toBe('Poor air');
      expect(result.severity).toBe(2);
    });
  });

  describe('severity always reflects the worst of both', () => {
    it('severity is thermal when thermal is worse', () => {
      expect(dominantStatus('COLD & DRY', aq('good')).severity).toBe(2);
    });

    it('severity is AQ when AQ is worse', () => {
      expect(dominantStatus('PLEASANT', aq('poor')).severity).toBe(2);
    });

    it('severity is 0 only when both are comfortable/clean', () => {
      expect(dominantStatus('PLEASANT', aq('good')).severity).toBe(0);
      expect(dominantStatus('PLEASANT', null).severity).toBe(0);
    });
  });

  describe('AQ label capitalisation', () => {
    it('capitalises AQ labels when AQ is dominant', () => {
      expect(dominantStatus('PLEASANT', aq('moderate')).label).toBe('Moderate air');
      expect(dominantStatus('PLEASANT', aq('poor')).label).toBe('Poor air');
    });
  });

  describe('with translations', () => {
    const de = {
      status: {
        PLEASANT:       'Angenehm',
        COLD:           'Kalt',
        HOT:            'Warm',
        DRY:            'Trocken',
        HUMID:          'Feucht',
        'COLD & DRY':   'Kalt & trocken',
        'COLD & HUMID': 'Kalt & feucht',
        'HOT & DRY':    'Warm & trocken',
        'HOT & HUMID':  'Warm & feucht',
      },
      airQuality: {
        good:     'Saubere Luft',
        moderate: 'Mäßige Luft',
        poor:     'Schlechte Luft',
      },
    };

    it('returns translated thermal label', () => {
      expect(dominantStatus('PLEASANT', null, de)).toEqual({ label: 'Angenehm', severity: 0 });
      expect(dominantStatus('COLD', null, de)).toEqual({ label: 'Kalt', severity: 1 });
      expect(dominantStatus('HOT & DRY', null, de)).toEqual({ label: 'Warm & trocken', severity: 2 });
    });

    it('returns translated AQ label when AQ is dominant', () => {
      expect(dominantStatus('PLEASANT', aq('poor'), de).label).toBe('Schlechte Luft');
      expect(dominantStatus('PLEASANT', aq('moderate'), de).label).toBe('Mäßige Luft');
      expect(dominantStatus('COLD', aq('moderate'), de).label).toBe('Mäßige Luft');
    });

    it('severity is unaffected by translations', () => {
      expect(dominantStatus('PLEASANT', null, de).severity).toBe(0);
      expect(dominantStatus('COLD & DRY', aq('poor'), de).severity).toBe(2);
    });

    it('falls back to English thermal label when the status key is absent', () => {
      const partial = { status: {}, airQuality: {} };
      expect(dominantStatus('PLEASANT', null, partial).label).toBe('Comfortable');
      expect(dominantStatus('COLD & DRY', null, partial).label).toBe('Cold & dry');
    });

    it('falls back to English AQ label when the AQ key is absent', () => {
      const partial = { status: {}, airQuality: {} };
      expect(dominantStatus('PLEASANT', aq('poor'), partial).label).toBe('Poor air');
      expect(dominantStatus('COLD', aq('moderate'), partial).label).toBe('Moderate air');
    });

    it('omitting the translations argument produces the same result as English', () => {
      expect(dominantStatus('PLEASANT', null)).toEqual(dominantStatus('PLEASANT', null, undefined));
      expect(dominantStatus('COLD & DRY', aq('moderate'))).toEqual(
        dominantStatus('COLD & DRY', aq('moderate'), undefined)
      );
    });
  });
});
