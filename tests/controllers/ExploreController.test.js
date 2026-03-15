import { jest } from '@jest/globals';
import * as state from '../../src/state.js';
import { getWorkerById, searchWorkers } from '../../src/controllers/ExploreController.js';

function createResponseMock() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };

  response.status.mockReturnValue(response);
  return response;
}

function flushAsyncHandler() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('ExploreController', () => {
  it('returns explore results with customer government and parsed flags', async () => {
    const findUniqueSpy = jest.spyOn(state.userRepository.prismaClient.user, 'findUnique').mockResolvedValue({
      government: {
        name: 'Cairo',
      },
    });
    const searchWorkersSpy = jest.spyOn(state.workerRepository, 'searchWorkers').mockResolvedValue({
      data: [],
      meta: {
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      },
    });

    const request = {
      query: {
        specializationId: '11111111-1111-1111-1111-111111111111',
        subSpecializationId: '22222222-2222-2222-2222-222222222222',
        filters: 'nearest,highestRated',
        page: '2',
        limit: '5',
      },
      userState: {
        userId: 'user-1',
      },
    };
    const response = createResponseMock();
    const next = jest.fn();

    searchWorkers(request, response, next);
    await flushAsyncHandler();

    expect(findUniqueSpy).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: {
        government: {
          select: {
            name: true,
          },
        },
      },
    });
    expect(searchWorkersSpy).toHaveBeenCalledWith({
      specializationId: '11111111-1111-1111-1111-111111111111',
      subSpecializationId: '22222222-2222-2222-2222-222222222222',
      area: undefined,
      availability: undefined,
      highestRated: true,
      nearest: true,
      customerGovernmentName: 'Cairo',
      currentUserId: 'user-1',
      page: 2,
      limit: 5,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Explore results retrieved successfully',
      data: {
        data: [],
        meta: {
          total: 0,
          page: 2,
          limit: 5,
          totalPages: 0,
        },
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects explore requests without specializationId', async () => {
    const searchWorkersSpy = jest.spyOn(state.workerRepository, 'searchWorkers');

    const request = {
      query: {},
      userState: {
        userId: 'user-1',
      },
    };
    const response = createResponseMock();
    const next = jest.fn();

    searchWorkers(request, response, next);
    await flushAsyncHandler();

    expect(searchWorkersSpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe('specializationId is required for explore search');
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('returns a selected explore worker by id', async () => {
    const getWorkerByIdSpy = jest.spyOn(state.workerRepository, 'getWorkerById').mockResolvedValue({
      workerId: 'worker-1',
      name: 'Ali Hassan',
    });

    const request = {
      params: {
        id: 'worker-1',
      },
    };
    const response = createResponseMock();
    const next = jest.fn();

    getWorkerById(request, response, next);
    await flushAsyncHandler();

    expect(getWorkerByIdSpy).toHaveBeenCalledWith({ workerId: 'worker-1' });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Explore worker retrieved successfully',
      data: {
        workerId: 'worker-1',
        name: 'Ali Hassan',
      },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
