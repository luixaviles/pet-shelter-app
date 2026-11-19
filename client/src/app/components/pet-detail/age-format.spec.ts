import { describe, expect, it } from 'vitest';
import { AgeFormatPipe } from '../../pipes/age-format.pipe';

describe('AgeFormatPipe', () => {
  const pipe = new AgeFormatPipe();

  it('formats singular and plural years and months', () => {
    expect(pipe.transform({ years: 1, months: 1 })).toBe('1 year 1 month');
    expect(pipe.transform({ years: 2, months: 5 })).toBe('2 years 5 months');
  });

  it('omits zero components', () => {
    expect(pipe.transform({ years: 3, months: 0 })).toBe('3 years');
    expect(pipe.transform({ years: 0, months: 4 })).toBe('4 months');
  });

  it('handles zero age and nullish values', () => {
    expect(pipe.transform({ years: 0, months: 0 })).toBe('0 months');
    expect(pipe.transform(null)).toBe('0 months');
    expect(pipe.transform(undefined)).toBe('0 months');
  });
});
