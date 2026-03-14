import { mockDeep, mockReset } from "jest-mock-extended";
import { jest } from "@jest/globals";

import prisma from "../src/libs/database.js";
import { PrismaClient } from "@prisma/client";

jest.mock("../src/libs/database.js", () => ({
  __esModule: true,
  /** @type {PrismaClient} */
  default: mockDeep(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

/** @type {any} */
const untypedPrisma = prisma;

/** @type {import("jest-mock-extended").DeepMockProxy<PrismaClient>} */
export const prismaMock = untypedPrisma;
