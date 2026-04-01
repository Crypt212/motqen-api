import { describe, expect, test } from 'vitest';
import { ExploreSearchSchema } from '../../src/schemas/workers';
const baseQuery = {
  specializationId: '123e4567-e89b-12d3-a456-426614174000',
  page: '1',
  limit: '10',
};

describe('ExploreSearchSchema', () => {
  test('accepts custom filters: subSpecializationId and governmentId', () => {
    const parsed = ExploreSearchSchema.parse({
      ...baseQuery,
      subSpecializationId: '123e4567-e89b-12d3-a456-426614174001',
      governmentId: '123e4567-e89b-12d3-a456-426614174002',
    });

    expect(parsed.subSpecializationId).toBe('123e4567-e89b-12d3-a456-426614174001');
    expect(parsed.governmentId).toBe('123e4567-e89b-12d3-a456-426614174002');
  });

  test('accepts flagged as comma-separated string', () => {
    const parsed = ExploreSearchSchema.parse({
      ...baseQuery,
      flagged: 'availability,nearest,highestRated',
    });

    expect(parsed.flagged).toBe('availability,nearest,highestRated');
  });

  test('accepts flagged as array', () => {
    const parsed = ExploreSearchSchema.parse({
      ...baseQuery,
      flagged: ['availability', 'nearest', 'acceptsUrgentJobs', 'highestRated'],
    });

    expect(Array.isArray(parsed.flagged)).toBe(true);
    expect(parsed.flagged).toEqual([
      'availability',
      'nearest',
      'acceptsUrgentJobs',
      'highestRated',
    ]);
  });

  test('accepts legacy aliases flaged and Flaged', () => {
    const parsedLegacyLower = ExploreSearchSchema.parse({
      ...baseQuery,
      flaged: ['availbilty', 'heasetrated'],
    });

    const parsedLegacyUpper = ExploreSearchSchema.parse({
      ...baseQuery,
      Flaged: 'acceptUrgentJobs',
    });

    expect(parsedLegacyLower.flaged).toEqual(['availbilty', 'heasetrated']);
    expect(parsedLegacyUpper.Flaged).toBe('acceptUrgentJobs');
  });
});
