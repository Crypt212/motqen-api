/**
 * @fileoverview Test Setup - Mock configurations for testing
 * @module tests/setup
 */

import { jest } from '@jest/globals';

// Mock Prisma Client
export const mockPrismaClient = {
  workerProfile: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  governmentForWorkers: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  chosenSpecialization: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  workerVerification: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  portfolioProject: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  projectImage: {
    findMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaClient)),
};

// Mock the database module
jest.unstable_mockModule('../src/libs/database.js', () => ({
  default: mockPrismaClient,
}));

// Global test data
export const testData = {
  user: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    phoneNumber: '+201234567890',
    firstName: 'John',
    middleName: 'Doe',
    lastName: 'Smith',
    governmentId: '660e8400-e29b-41d4-a716-446655440001',
    cityId: '770e8400-e29b-41d4-a716-446655440001',
    profileImageUrl: 'https://example.com/image.jpg',
    status: 'ACTIVE',
    role: 'USER',
  },
  workerProfile: {
    id: '880e8400-e29b-41d4-a716-446655440001',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    experienceYears: 5,
    isInTeam: false,
    acceptsUrgentJobs: true,
    isApproved: true,
  },
  governments: [
    { id: '660e8400-e29b-41d4-a716-446655440001', name: 'Cairo' },
    { id: '660e8400-e29b-41d4-a716-446655440002', name: 'Giza' },
  ],
  specializations: [
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      name: 'Plumbing',
      subSpecializations: [
        { id: '880e8400-e29b-41d4-a716-446655440001', name: 'Water Systems' },
        { id: '880e8400-e29b-41d4-a716-446655440002', name: 'Drainage' },
      ],
    },
  ],
  verification: {
    id: '990e8400-e29b-41d4-a716-446655440001',
    workerProfileId: '880e8400-e29b-41d4-a716-446655440001',
    status: 'APPROVED',
    idWithPersonalImageUrl: 'https://example.com/selfi.jpg',
    idDocumentUrl: 'https://example.com/id.jpg',
    reason: null,
  },
  portfolio: [
    {
      id: '110e8400-e29b-41d4-a716-446655440001',
      description: 'Kitchen renovation',
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    },
  ],
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
