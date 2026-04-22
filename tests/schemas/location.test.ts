import { describe, it, expect } from 'vitest';
import { CreateLocationSchema, UpdateLocationSchema } from '../../src/schemas/location.js';

describe('Location Schemas', () => {
  describe('CreateLocationSchema', () => {
    it('should validate a correct location object', () => {
      const validData = {
        address: '123 Main St',
        addressNotes: 'Near the park',
        governmentId: '123e4567-e89b-12d3-a456-426614174000',
        cityId: '123e4567-e89b-12d3-a456-426614174001',
        lat: 30.0444,
        long: 31.2357,
        isMain: true,
      };

      const result = CreateLocationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if required fields are missing', () => {
      const invalidData = {
        address: '123 Main St',
        // missing governmentId, cityId, lat, long, isMain
      };

      const result = CreateLocationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail if UUIDs are invalid', () => {
      const invalidData = {
        address: '123 Main St',
        governmentId: 'not-a-uuid',
        cityId: '123e4567-e89b-12d3-a456-426614174001',
        lat: 30.0444,
        long: 31.2357,
        isMain: true,
      };

      const result = CreateLocationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('governmentId');
      }
    });

    it('should allow optional addressNotes', () => {
      const validData = {
        address: '123 Main St',
        governmentId: '123e4567-e89b-12d3-a456-426614174000',
        cityId: '123e4567-e89b-12d3-a456-426614174001',
        lat: 30.0444,
        long: 31.2357,
        isMain: true,
      };

      const result = CreateLocationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdateLocationSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        address: '456 New St',
      };

      const result = UpdateLocationSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid partial update', () => {
      const invalidPartialData = {
        lat: 1000, // Invalid latitude
      };

      const result = UpdateLocationSchema.safeParse(invalidPartialData);
      expect(result.success).toBe(false);
    });
  });
});
