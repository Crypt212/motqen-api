import { describe, it, expect } from 'vitest';
import { convertDayNumberToEnum } from '../../../src/utils/dayNumberToEnum.js';

describe('convertDayNumberToEnum', () => {
  it('maps 0 to SUNDAY', () => {
    expect(convertDayNumberToEnum(0)).toBe('SUNDAY');
  });

  it('maps 1 to MONDAY', () => {
    expect(convertDayNumberToEnum(1)).toBe('MONDAY');
  });

  it('maps 2 to TUESDAY', () => {
    expect(convertDayNumberToEnum(2)).toBe('TUESDAY');
  });

  it('maps 3 to WEDNESDAY', () => {
    expect(convertDayNumberToEnum(3)).toBe('WEDNESDAY');
  });

  it('maps 4 to THURSDAY', () => {
    expect(convertDayNumberToEnum(4)).toBe('THURSDAY');
  });

  it('maps 5 to FRIDAY', () => {
    expect(convertDayNumberToEnum(5)).toBe('FRIDAY');
  });

  it('maps 6 to SATURDAY', () => {
    expect(convertDayNumberToEnum(6)).toBe('SATURDAY');
  });

  it('throws for 7 (out of range)', () => {
    expect(() => convertDayNumberToEnum(7)).toThrow('Invalid UTC day number: 7');
  });

  it('throws for negative number', () => {
    expect(() => convertDayNumberToEnum(-1)).toThrow('Invalid UTC day number: -1');
  });

  it('throws for non-integer', () => {
    expect(() => convertDayNumberToEnum(2.5)).toThrow('Invalid UTC day number: 2.5');
  });

  it('throws for large number', () => {
    expect(() => convertDayNumberToEnum(100)).toThrow('Invalid UTC day number: 100');
  });
});
