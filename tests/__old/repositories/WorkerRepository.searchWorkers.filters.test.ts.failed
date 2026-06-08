import { describe, expect, it, vi } from 'vitest';
import WorkerProfileRepository from '../../src/repositories/prisma/WorkerRepository.js';

const SPEC_ID = '11111111-1111-1111-1111-111111111111';
const SUB_ID = '22222222-2222-2222-2222-222222222222';
const GOV_ID = '33333333-3333-3333-3333-333333333333';

function createPrismaStub() {
  return {
    workerProfile: {
      count: vi.fn(async () => 0),
      findMany: vi.fn(async () => []),
    },
    order: {
      groupBy: vi.fn(async () => []),
    },
    $queryRaw: vi.fn(async () => []),
  };
}

describe('WorkerProfileRepository.searchWorkers filters', () => {
  it('filters by main specialization using OR on stored spec and sub.mainSpecializationId', async () => {
    const prisma = createPrismaStub();
    const repo = new WorkerProfileRepository(prisma as never);

    await repo.searchWorkers({
      specializationId: SPEC_ID,
      acceptsUrgentJobs: false,
      highestRated: false,
      nearest: false,
      page: 1,
      limit: 10,
    });

    expect(prisma.workerProfile.findMany).toHaveBeenCalled();
    const callArg = prisma.workerProfile.findMany.mock.calls[0][0] as {
      where: { chosenSpecializations?: { some: unknown } };
    };
    expect(callArg.where.chosenSpecializations).toEqual({
      some: {
        OR: [
          { specializationId: SPEC_ID },
          { subSpecialization: { mainSpecializationId: SPEC_ID } },
        ],
      },
    });
  });

  it('filters by subSpecializationId and ensures sub belongs to main specialization', async () => {
    const prisma = createPrismaStub();
    const repo = new WorkerProfileRepository(prisma as never);

    await repo.searchWorkers({
      specializationId: SPEC_ID,
      subSpecializationId: SUB_ID,
      acceptsUrgentJobs: false,
      highestRated: false,
      nearest: false,
      page: 1,
      limit: 10,
    });

    const callArg = prisma.workerProfile.findMany.mock.calls[0][0] as {
      where: { chosenSpecializations?: { some: unknown } };
    };
    expect(callArg.where.chosenSpecializations).toEqual({
      some: {
        subSpecializationId: SUB_ID,
        subSpecialization: { mainSpecializationId: SPEC_ID },
      },
    });
  });

  it('filters by workGovernments when governmentIds provided', async () => {
    const prisma = createPrismaStub();
    const repo = new WorkerProfileRepository(prisma as never);

    await repo.searchWorkers({
      specializationId: SPEC_ID,
      governmentIds: [GOV_ID],
      acceptsUrgentJobs: false,
      highestRated: false,
      nearest: false,
      page: 1,
      limit: 10,
    });

    const callArg = prisma.workerProfile.findMany.mock.calls[0][0] as {
      where: { workGovernments?: { some: { id: { in: string[] } } } };
    };
    expect(callArg.where.workGovernments).toEqual({
      some: { id: { in: [GOV_ID] } },
    });
  });

  it('filters user.isOnline when availability is true', async () => {
    const prisma = createPrismaStub();
    const repo = new WorkerProfileRepository(prisma as never);

    await repo.searchWorkers({
      specializationId: SPEC_ID,
      availability: true,
      acceptsUrgentJobs: false,
      highestRated: false,
      nearest: false,
      page: 1,
      limit: 10,
    });

    const callArg = prisma.workerProfile.findMany.mock.calls[0][0] as {
      where: { user: { status: string; isOnline?: boolean } };
    };
    expect(callArg.where.user).toMatchObject({
      isOnline: true,
    });
  });

  it('does not set isOnline when availability is undefined', async () => {
    const prisma = createPrismaStub();
    const repo = new WorkerProfileRepository(prisma as never);

    await repo.searchWorkers({
      specializationId: SPEC_ID,
      acceptsUrgentJobs: false,
      highestRated: false,
      nearest: false,
      page: 1,
      limit: 10,
    });

    const callArg = prisma.workerProfile.findMany.mock.calls[0][0] as {
      where: { user: Record<string, unknown> };
    };
    expect(callArg.where.user).toEqual({ status: 'ACTIVE' });
  });

  it('filters acceptsUrgentJobs only when flag is true', async () => {
    const prisma = createPrismaStub();
    const repo = new WorkerProfileRepository(prisma as never);

    await repo.searchWorkers({
      specializationId: SPEC_ID,
      acceptsUrgentJobs: true,
      highestRated: false,
      nearest: false,
      page: 1,
      limit: 10,
    });

    const callArg = prisma.workerProfile.findMany.mock.calls[0][0] as {
      where: { acceptsUrgentJobs?: boolean };
    };
    expect(callArg.where.acceptsUrgentJobs).toBe(true);
  });

  it('combines specialization, governments, availability, and urgent flag', async () => {
    const prisma = createPrismaStub();
    const repo = new WorkerProfileRepository(prisma as never);

    await repo.searchWorkers({
      specializationId: SPEC_ID,
      subSpecializationId: SUB_ID,
      governmentIds: [GOV_ID],
      availability: true,
      acceptsUrgentJobs: true,
      highestRated: false,
      nearest: false,
      page: 1,
      limit: 10,
    });

    const callArg = prisma.workerProfile.findMany.mock.calls[0][0] as {
      where: {
        chosenSpecializations: { some: unknown };
        workGovernments: { some: unknown };
        user: { status: string; isOnline: boolean };
        acceptsUrgentJobs: boolean;
        verification: { status: string };
      };
    };

    // expect(callArg.where.verification).toEqual({ status: 'APPROVED' });
    expect(callArg.where.user).toEqual({ status: 'ACTIVE', isOnline: true });
    expect(callArg.where.acceptsUrgentJobs).toBe(true);
    expect(callArg.where.workGovernments).toEqual({
      some: { id: { in: [GOV_ID] } },
    });
    expect(callArg.where.chosenSpecializations).toEqual({
      some: {
        subSpecializationId: SUB_ID,
        subSpecialization: { mainSpecializationId: SPEC_ID },
      },
    });
  });
});
