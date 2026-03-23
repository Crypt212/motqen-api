import { mockDeep } from 'jest-mock-extended';
import { jest } from '@jest/globals';

import prisma from '../src/libs/database.js';

jest.mock('../src/libs/database', () => ({
  __esModule: true,
  default: mockDeep(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

/** @type {any} */
const untypedPrisma = prisma;

export const prismaMock = untypedPrisma;
