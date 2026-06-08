/**
 * Zod Schema Tests — Input Validation
 *
 * These schemas are the app's first line of defense. Bad input should
 * never reach business logic. We test with real-world Egyptian phone
 * numbers, edge-case OTP codes, and realistic profile data.
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  EgyptianPhoneSchema,
  OTPCodeSchema,
  OTPMethodSchema,
  UUIDSchema,
  LatitudeSchema,
  LongitudeSchema,
  UserDataSchema,
  ClientProfileSchema,
  WorkerProfileSchema,
  SpecializationsTreeSchema,
  WorkGovernmentsSchema,
} from '../../src/schemas/common.js';
import { RequestOTPSchema, VerifyOTPSchema } from '../../src/schemas/auth.js';
import { CreateGovernmentSchema, GovernmentIdParamsSchema } from '../../src/schemas/governments.js';
import { CreateSpecializationSchema, CategorySchema } from '../../src/schemas/specializations.js';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

describe('Primitive Schemas', () => {
  describe('EgyptianPhoneSchema', () => {
    it.each(['01012345678', '01112345678', '01212345678', '01512345678'])(
      'should accept valid phone: %s',
      (phone) => {
        expect(EgyptianPhoneSchema.parse(phone)).toBe(phone);
      }
    );

    it.each([
      '01312345678', // 013 is not valid
      '0101234567', // too short
      '010123456789', // too long
      '1012345678', // missing leading 0
      '+201012345678', // should be stripped but the regex expects 01x format
      'abcdefghijk', // not numeric
      '', // empty
    ])('should reject invalid phone: %s', (phone) => {
      expect(EgyptianPhoneSchema.safeParse(phone).success).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(EgyptianPhoneSchema.parse(' 01012345678 ')).toBe('01012345678');
    });
  });

  describe('OTPCodeSchema', () => {
    it('should accept 4-6 digit codes', () => {
      expect(OTPCodeSchema.parse('1234')).toBe('1234');
      expect(OTPCodeSchema.parse('12345')).toBe('12345');
      expect(OTPCodeSchema.parse('123456')).toBe('123456');
    });

    it('should reject non-numeric codes', () => {
      expect(OTPCodeSchema.safeParse('12ab56').success).toBe(false);
    });

    it('should reject codes shorter than 4 digits', () => {
      expect(OTPCodeSchema.safeParse('123').success).toBe(false);
    });

    it('should reject codes longer than 6 digits', () => {
      expect(OTPCodeSchema.safeParse('1234567').success).toBe(false);
    });
  });

  describe('OTPMethodSchema', () => {
    it('should accept SMS and WHATSAPP', () => {
      expect(OTPMethodSchema.parse('SMS')).toBe('SMS');
      expect(OTPMethodSchema.parse('WHATSAPP')).toBe('WHATSAPP');
    });

    it('should reject EMAIL and other methods', () => {
      expect(OTPMethodSchema.safeParse('EMAIL').success).toBe(false);
      expect(OTPMethodSchema.safeParse('sms').success).toBe(false); // case-sensitive
    });
  });

  describe('UUIDSchema', () => {
    it('should accept valid UUIDs', () => {
      expect(UUIDSchema.parse(validUUID)).toBe(validUUID);
    });

    it('should reject invalid UUIDs', () => {
      expect(UUIDSchema.safeParse('not-a-uuid').success).toBe(false);
      expect(UUIDSchema.safeParse('').success).toBe(false);
    });
  });

  describe('Coordinates', () => {
    it('should accept valid latitude (-90 to 90)', () => {
      expect(LatitudeSchema.parse(30.0444)).toBe(30.0444);
      expect(LatitudeSchema.parse(-90)).toBe(-90);
      expect(LatitudeSchema.parse(90)).toBe(90);
    });

    it('should reject out-of-range latitude', () => {
      expect(LatitudeSchema.safeParse(91).success).toBe(false);
      expect(LatitudeSchema.safeParse(-91).success).toBe(false);
    });

    it('should accept valid longitude (-180 to 180)', () => {
      expect(LongitudeSchema.parse(31.2357)).toBe(31.2357);
    });

    it('should reject out-of-range longitude', () => {
      expect(LongitudeSchema.safeParse(181).success).toBe(false);
    });
  });
});

describe('Composite Schemas', () => {
  const location = {
    governmentId: validUUID,
    cityId: validUUID,
    address: 'abc123',
    validUUID,
    long: 31.2357,
    lat: 30.0444,
  };
  describe('UserDataSchema', () => {
    it('should require firstName, middleName, lastName and location', () => {
      const result = UserDataSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty firstName', () => {
      expect(
        UserDataSchema.safeParse({
          firstName: '',
          middleName: 'Khalid',
          lastName: 'Hassan',
          location,
        }).success
      ).toBe(false);
    });

    it('should accept empty middleName (optional)', () => {
      expect(
        UserDataSchema.safeParse({
          firstName: 'Ahmed',
          middleName: '',
          lastName: 'Hassan',
          location,
        }).success
      ).toBe(true);
    });

    it('should reject empty lastName', () => {
      expect(
        UserDataSchema.safeParse({
          firstName: 'Ahmed',
          middleName: 'Khalid',
          lastName: '',
          location,
        }).success
      ).toBe(false);
    });

    it('should accept full name', () => {
      const parseResult = UserDataSchema.safeParse({
        firstName: 'Ahmed',
        middleName: 'Khalid',
        lastName: 'Hassan',
        location,
      });
      console.log(parseResult);
      expect(parseResult.success).toBe(true);
    });
  });

  describe('WorkerProfileSchema', () => {
    const validProfile = {
      experienceYears: 5,
      isInTeam: false,
      acceptsUrgentJobs: true,
      workGovernmentIds: [validUUID],
      specializationsTree: [{ mainId: validUUID, subIds: [validUUID] }],
    };

    it('should accept complete worker profile', () => {
      expect(WorkerProfileSchema.safeParse(validProfile).success).toBe(true);
    });

    it('should reject negative experience years', () => {
      expect(WorkerProfileSchema.safeParse({ ...validProfile, experienceYears: -1 }).success).toBe(
        false
      );
    });

    it('should require at least one government', () => {
      expect(
        WorkerProfileSchema.safeParse({ ...validProfile, workGovernmentIds: [] }).success
      ).toBe(false);
    });

    it('should require at least one specialization', () => {
      expect(
        WorkerProfileSchema.safeParse({ ...validProfile, specializationsTree: [] }).success
      ).toBe(false);
    });
  });

  describe('ClientProfileSchema', () => {
    it('should accept valid client profile', () => {
      expect(ClientProfileSchema.safeParse({}).success).toBe(true);
    });
  });
});

describe('Auth Schemas', () => {
  describe('RequestOTPSchema', () => {
    it('should accept valid phone + method', () => {
      expect(
        RequestOTPSchema.safeParse({
          phoneNumber: '01012345678',
          method: 'SMS',
        }).success
      ).toBe(true);
    });

    it('should reject missing phone number', () => {
      expect(RequestOTPSchema.safeParse({ method: 'SMS' }).success).toBe(false);
    });
  });

  describe('VerifyOTPSchema', () => {
    it('should accept valid verification payload', () => {
      expect(
        VerifyOTPSchema.safeParse({
          phoneNumber: '01012345678',
          otp: '123456',
          method: 'SMS',
        }).success
      ).toBe(true);
    });
  });
});

describe('Government Schemas', () => {
  describe('CreateGovernmentSchema', () => {
    it('should accept valid government with coordinates', () => {
      expect(
        CreateGovernmentSchema.safeParse({
          name: 'Cairo',
          nameAr: 'القاهرة',
          long: 31.2357,
          lat: 30.0444,
        }).success
      ).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      expect(
        CreateGovernmentSchema.safeParse({
          name: 'X',
          nameAr: 'ق',
          long: 31,
          lat: 30,
        }).success
      ).toBe(false);
    });
  });
});

describe('Specialization Schemas', () => {
  describe('CategorySchema', () => {
    it('should accept valid categories', () => {
      expect(CategorySchema.parse('ELECTRICITY')).toBe('ELECTRICITY');
      expect(CategorySchema.parse('PLUMBING')).toBe('PLUMBING');
    });

    it('should reject invalid categories', () => {
      expect(CategorySchema.safeParse('COOKING').success).toBe(false);
    });
  });
});
