import { describe, expect, it, vi } from 'vitest';
import WorkerRepositoryRepository from '../../src/repositories/prisma/WorkerRepository.js';

type AnyObject = Record<string, unknown>;

type MockPrisma = {
  workerProfile: {
    count: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  order: {
    groupBy: ReturnType<typeof vi.fn>;
  };
  $queryRaw: ReturnType<typeof vi.fn>;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildWorkersFixture(): Array<Record<string, unknown>> {
  return [
    {
      id: 'worker-1',
      experienceYears: 10,
      acceptsUrgentJobs: true,
      user: {
        id: 'user-1',
        firstName: 'Ali',
        middleName: 'H',
        lastName: 'A',
        profileImageUrl: 'https://example.com/1.jpg',
        isOnline: true,
      },
      workGovernments: [{ id: 'gov-1', name: 'Cairo', lat: '30.04', long: '31.23' }],
      chosenSpecializations: [{ subSpecialization: { name: 'Wiring' } }],
    },
    {
      id: 'worker-2',
      experienceYears: 8,
      acceptsUrgentJobs: true,
      user: {
        id: 'user-2',
        firstName: 'Omar',
        middleName: 'K',
        lastName: 'B',
        profileImageUrl: 'https://example.com/2.jpg',
        isOnline: true,
      },
      workGovernments: [{ id: 'gov-1', name: 'Cairo', lat: '30.05', long: '31.25' }],
      chosenSpecializations: [{ subSpecialization: { name: 'Wiring' } }],
    },
  ];
}

function createMockPrisma(): MockPrisma {
  const workerProfileCount = vi.fn(async () => {
    await delay(15);
    return 2;
  });

  const workerProfileFindMany = vi.fn(async () => {
    await delay(20);
    return buildWorkersFixture();
  });

  const orderGroupBy = vi.fn(async (args: AnyObject) => {
    await delay(25);

    if ('_avg' in args && '_count' in args) {
      // Return both _avg and _count when both are requested
      return [
        { workerProfileId: 'worker-1', _avg: { rating: 4.5 }, _count: { rating: 12 } },
        { workerProfileId: 'worker-2', _avg: { rating: 3.5 }, _count: { rating: 9 } },
      ];
    }

    if ('_avg' in args) {
      return [
        { workerProfileId: 'worker-1', _avg: { rating: 4.5 } },
        { workerProfileId: 'worker-2', _avg: { rating: 3.5 } },
      ];
    }

    return [
      { workerProfileId: 'worker-1', _count: { _all: 12 } },
      { workerProfileId: 'worker-2', _count: { _all: 9 } },
    ];
  });

  const queryRaw = vi.fn(async () => {
    await delay(25);
    return [
      { workerProfileId: 'worker-1', distanceKm: 2.1 },
      { workerProfileId: 'worker-2', distanceKm: 1.4 },
    ];
  });

  return {
    workerProfile: {
      count: workerProfileCount,
      findMany: workerProfileFindMany,
    },
    order: {
      groupBy: orderGroupBy,
    },
    $queryRaw: queryRaw,
  };
}

describe('WorkerRepository.searchWorkers concurrency', () => {
  it('handles many concurrent search requests and reports timing', async () => {
    const prismaMock = createMockPrisma();
    const repository = new WorkerRepositoryRepository(prismaMock as never);

    const concurrentUsers = 30;
    const startedAt = Date.now();

    const results = await Promise.all(
      Array.from({ length: concurrentUsers }).map(() =>
        repository.searchWorkers({
          specializationId: 'spec-1',
          subSpecializationId: 'sub-spec-1',
          governmentIds: ['gov-1'],
          availability: true,
          acceptsUrgentJobs: true,
          highestRated: true,
          nearest: true,
          customerLatitude: '30.04',
          customerLongitude: '31.23',
          page: 1,
          limit: 10,
        })
      )
    );

    const elapsedMs = Date.now() - startedAt;

    // Keep this log to quickly spot regressions when running the test locally.
    console.info(`[search-concurrency] users=${concurrentUsers}, elapsedMs=${elapsedMs}`);

    expect(results).toHaveLength(concurrentUsers);
    expect(results[0].workers.length).toBeGreaterThan(0);
    expect(results[0].workers[0].workerId).toBe('worker-2');

    expect(prismaMock.workerProfile.count).toHaveBeenCalledTimes(concurrentUsers);
    expect(prismaMock.workerProfile.findMany).toHaveBeenCalledTimes(concurrentUsers);
    expect(prismaMock.order.groupBy).toHaveBeenCalledTimes(concurrentUsers * 2);
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(concurrentUsers);

    expect(elapsedMs).toBeLessThan(1200);
  });
});
