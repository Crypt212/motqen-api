/**
 * @fileoverview User Repository - Handle database operations for users
 * @module repositories/UserRepository
 */

import { logger } from '../../libs/winston.js';
import { handlePrismaError, Repository } from './Repository.js';
import * as pkg from '@prisma/client';
const { $Enums, PrismaClient } = pkg;

/** @typedef {import("./Repository.js").IDType} IDType */
/** @typedef {import('./Repository.js').PaginationOptions} PaginationOptions */
/** @typedef {import('./Repository.js').OrderingOptions} OrderingOptions */
/** @typedef {import('./Repository.js').QueryOptions} QueryOptions */
/** @template T @typedef {import('./Repository.js').PaginatedResult<T>} PaginatedResult */
/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */
/** @typedef {import('../../types/role.js').Role} Role */
/** @typedef {$Enums.AccountStatus} AccountStatus */

/** @typedef {{ role: Role, phoneNumber: string, firstName: string, middleName: string, lastName: string, governmentId?: IDType, cityId?: IDType, profileImageUrl?: String, status: AccountStatus }} UserData */
/** @typedef {Partial<UserData>} OptionalUserData */
/** @typedef { UserData & { id: IDType }} User */
/** @typedef {import("./Repository.js").FilterArgs<User>} UserFilter */
/** @typedef {Partial<User>} OptionalUser */

/** @typedef {{ experienceYears: number, isInTeam: Boolean, acceptsUrgentJobs: Boolean, isApproved?: Boolean }} WorkerProfileData */
/** @typedef {Partial<WorkerProfileData>} OptionalWorkerProfileData */
/** @typedef { WorkerProfileData & { id: IDType, userId: IDType }} WorkerProfile */
/** @typedef {import("./Repository.js").FilterArgs<WorkerProfile>} WorkerProfileFilter */
/** @typedef {Partial<WorkerProfile>} OptionalWorkerProfile */

/** @typedef {{ address: string, addressNotes?: string }} ClientProfileData */
/** @typedef {Partial<ClientProfileData>} OptionalClientProfileData */
/** @typedef { ClientProfileData & { id: IDType, userId: IDType }} ClientProfile */
/** @typedef {import("./Repository.js").FilterArgs<ClientProfile>} ClientProfileFilter */
/** @typedef {Partial<ClientProfile>} OptionalClientProfile */

/** @typedef {{ status: $Enums.VerificationStatus, idWithPersonalImageUrl: string, idDocumentUrl: string, createdAt?: Date, updatedAt?: Date, reason?: string }} WorkerVerificationData */
/** @typedef {Partial<WorkerVerificationData>} OptionalWorkerVerificationData */
/** @typedef { WorkerVerificationData & { id: IDType, workerProfileId: IDType }} WorkerVerification */
/** @typedef {import("./Repository.js").FilterArgs<WorkerVerification>} WorkerVerificationFilter */
/** @typedef {Partial<WorkerVerification>} OptionalWorkerVerification */

/** @typedef {{ mainId: IDType, subIds: IDType[] }[]} SpecializationTree */

/**
 * User Repository - Handles all database operations for users
 * @class
 * @extends Repository<UserData, OptionalUserData, UserFilter, UserFilter, OptionalUser>
 */
export default class UserRepository extends Repository {
  /** @param {PrismaClient} prisma */
  constructor(prisma) {
    super(prisma, 'user');
  }

  /**
   * @param {Object} params
   * @param {IDType} params.userId
   * @returns {Promise<boolean>}
   * @throws {RepositoryError}
   */
  async hasWorkerProfile({ userId }) {
    try {
      return (
        (await this.prismaClient.workerProfile.count({ where: { userId } })) > 0
      );
    } catch (error) {
      handlePrismaError(error, 'hasWorkerProfile');
    }
  }

  /**
   * Find worker profile by user ID
   * @param {Object} params
   * @param {IDType} params.userId
   * @returns {Promise<WorkerProfile | null>}
   * @throws {RepositoryError}
   */
  async findWorkerProfile({ userId }) {
    try {
      return await this.prismaClient.workerProfile.findUnique({
        where: { userId },
      });
    } catch (error) {
      handlePrismaError(error, 'findWorkerProfile');
    }
  }

  /**
   * Find worker profile by worker profile ID
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<WorkerProfile | null>}
   * @throws {RepositoryError}
   */
  async findWorkerProfileById({ workerProfileId }) {
    try {
      return await this.prismaClient.workerProfile.findUnique({
        where: { id: workerProfileId },
      });
    } catch (error) {
      handlePrismaError(error, 'findWorkerProfileById');
    }
  }

  /**
   * Create a new user with worker profile
   * @param {Object} params
   * @param {UserData} params.userData
   * @param {WorkerProfileData} params.workerProfileData
   * @param {WorkerVerificationData | undefined} params.verificationData
   * @returns {Promise<{ user: User, profile: WorkerProfile }>}
   * @throws {RepositoryError}
   */
  async createWorker({
    userData,
    workerProfileData,
    verificationData = undefined,
  }) {
    try {
      const user = await this.prismaClient.user.create({
        data: {
          ...userData,
          workerProfile: {
            create: {
              ...workerProfileData,
              verification: {
                create:
                  verificationData !== undefined ? verificationData : undefined,
              },
            },
          },
        },
      });
      const profile = await this.findWorkerProfile({ userId: user.id });
      return { user, profile };
    } catch (error) {
      handlePrismaError(error, 'createWorker');
    }
  }

  /**
   * Insert a worker profile for existing user
   * @param {Object} params
   * @param {IDType} params.userId
   * @param {WorkerProfileData} params.data
   * @param {WorkerVerificationData | undefined} params.verificationData
   * @returns {Promise<WorkerProfile>}
   * @throws {RepositoryError}
   */
  async insertWorkerProfile({ userId, data, verificationData = undefined }) {
    try {
      return await this.prismaClient.workerProfile.create({
        data: {
          userId,
          ...data,
          verification: {
            create:
              verificationData !== undefined ? verificationData : undefined,
          },
        },
      });
    } catch (error) {
      handlePrismaError(error, 'insertWorkerProfile');
    }
  }

  /**
   * Update a worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {OptionalWorkerProfileData} params.data
   * @param {WorkerVerificationData | undefined} params.verificationData
   * @returns {Promise<WorkerProfile>}
   * @throws {RepositoryError}
   */
  async updateWorkerProfile({
    workerProfileId,
    data,
    verificationData = undefined,
  }) {
    try {
      return await this.prismaClient.workerProfile.update({
        where: { id: workerProfileId },
        data: {
          ...data,
          verification: {
            create:
              verificationData !== undefined ? verificationData : undefined,
          },
        },
      });
    } catch (error) {
      handlePrismaError(error, 'updateWorkerProfile');
    }
  }

  /**
   * Delete a worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<WorkerProfile>}
   * @throws {RepositoryError}
   */
  async deleteWorkerProfile({ workerProfileId }) {
    try {
      return await this.prismaClient.workerProfile.delete({
        where: { id: workerProfileId },
      });
    } catch (error) {
      handlePrismaError(error, 'deleteWorkerProfile');
    }
  }

  // ============================================
  // Worker Profile Governments Operations
  // ============================================

  /**
   * Add working governments for worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType[]} params.governmentIds
   * @returns {Promise<BatchPayload>}
   * @throws {RepositoryError}
   */
  async insertWorkerProfileGovernments({ workerProfileId, governmentIds }) {
    try {
      return await this.prismaClient.governmentForWorkers.createMany({
        data: governmentIds.map((id) => ({
          governmentId: id,
          workerProfileId,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      handlePrismaError(error, 'insertWorkerProfileGovernments');
    }
  }

  /**
   * Delete working governments for worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType[] | undefined} params.governmentIds
   * @returns {Promise<BatchPayload>}
   * @throws {RepositoryError}
   */
  async deleteWorkerProfileGovernments({
    workerProfileId,
    governmentIds = undefined,
  }) {
    try {
      if (!governmentIds) {
        return await this.prismaClient.governmentForWorkers.deleteMany({
          where: { workerProfileId },
        });
      }
      return await this.prismaClient.governmentForWorkers.deleteMany({
        where: { workerProfileId, governmentId: { in: governmentIds } },
      });
    } catch (error) {
      handlePrismaError(error, 'deleteWorkerProfileGovernments');
    }
  }

  /**
   * Find working governments for worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {Object} [params.pagination] - Pagination options { page, limit }
   * @param {Object} [params.filter] - Filter options
   * @param {Object[]} [params.orderBy] - OrderBy options [{ field, direction }]
   * @param {boolean} [params.paginate] - Whether to return paginated results
   * @returns {Promise<PaginatedResult<import('./GovernmentRepository.js').Government>>}
   */
  async findWorkerProfileGovernments({
    workerProfileId,
    pagination = { page: 1, limit: 20 },
    filter = {},
    orderBy = [],
    paginate = false,
  }) {
    return Repository.performFindManyQuery({
      prismaModel: this.prismaClient.governmentForWorkers,
      parentQueryParameters: { workerProfileId },
      orderBy,
      filter,
      paginate,
      pagination,
      include: ['government'],
      mapFunction: (x) => x.government,
    });
  }

  // ============================================
  // Worker Profile Specializations Operations
  // ============================================

  /**
   * Find specializations for worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType[]} [params.mainSpecializationIds]
   * @param {Object} [params.pagination] - Pagination options { page, limit }
   * @param {Object} [params.filter] - Filter options
   * @param {Object[]} [params.orderBy] - OrderBy options [{ field, direction }]
   * @param {boolean} [params.paginate] - Whether to return paginated results
   * @returns {Promise<PaginatedResult<SpecializationTree>>}
   */
  async findWorkerProfileSpecializations({
    workerProfileId,
    mainSpecializationIds,
    pagination = { page: 1, limit: 20 },
    filter = {},
    orderBy = [],
    paginate = false,
  }) {
    const query = await Repository.performFindManyQuery({
      prismaModel: this.prismaClient.chosenSpecialization,
      parentQueryParameters: { workerProfileId, mainSpecializationIds },
      orderBy,
      filter,
      paginate,
      pagination,
      include: ['subSpecialization'],
    });
    // Build tree structure from results
    const tree = [];
    const map = new Map();
    for (const { subSpecializationId, specializationId } of query.data) {
      if (!map.has(specializationId)) {
        const branch = { mainId: specializationId, subIds: [] };
        map.set(specializationId, branch);
      }

      map.get(specializationId).subIds.push(subSpecializationId);
    }
    for (const [, branch] of map) {
      tree.push(branch);
    }
    query.data = tree;
    return query;
  }

  /**
   * Add specializations for worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {SpecializationTree} params.specializationsTree
   * @returns {Promise<BatchPayload>}
   */
  async insertWorkerProfileSpecializations({
    workerProfileId,
    specializationsTree,
  }) {
    const data = specializationsTree.reduce((acc, current) => {
      return [
        ...acc,
        ...current.subIds.map((subId) => {
          return {
            specializationId: current.mainId,
            subSpecializationId: subId,
            workerProfileId,
          };
        }),
      ];
    }, []);

    return await this.prismaClient.chosenSpecialization.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Add sub specializations for worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType} params.specializationId
   * @param {IDType[]} params.subSpecializationIds
   * @returns {Promise<BatchPayload>}
   */
  async insertWorkerProfileSubSpecializations({
    workerProfileId,
    specializationId,
    subSpecializationIds,
  }) {
    return await this.prismaClient.chosenSpecialization.createMany({
      data: subSpecializationIds.map((subSpecializationId) => ({
        workerProfileId,
        subSpecializationId,
        specializationId,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Delete main specializations for worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType[] | undefined} params.specializationIds
   * @returns {Promise<BatchPayload>}
   */
  async deleteWorkerProfileSpecializations({
    workerProfileId,
    specializationIds = undefined,
  }) {
    return await this.prismaClient.chosenSpecialization.deleteMany({
      where: {
        workerProfileId,
        specializationId: specializationIds
          ? { in: specializationIds }
          : undefined,
      },
    });
  }

  /**
   * Delete sub specializations for worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType} params.specializationId
   * @param {IDType[]} params.subSpecializationIds
   * @returns {Promise<BatchPayload>}
   */
  async deleteWorkerProfileSubSpecializations({
    workerProfileId,
    specializationId,
    subSpecializationIds,
  }) {
    return await this.prismaClient.chosenSpecialization.deleteMany({
      where: {
        workerProfileId,
        subSpecializationId: { in: subSpecializationIds },
        specializationId: specializationId,
      },
    });
  }

  /**
   * Find specialization IDs for worker profile
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<{id: IDType, children: IDType[]}[]>}
   */
  async findWorkerProfileSpecializationIds({ workerProfileId }) {
    const chosenSpecializations =
      await this.prismaClient.chosenSpecialization.findMany({
        where: { workerProfileId },
        select: { specializationId: true },
      });

    const specializationTree = [];

    for (const { specializationId } of chosenSpecializations) {
      const branch = { id: specializationId, children: [] };

      const subSpecializations =
        await this.prismaClient.chosenSpecialization.findMany({
          where: { workerProfileId, specializationId },
        });

      branch.children = subSpecializations.map(
        ({ subSpecializationId }) => subSpecializationId
      );
      specializationTree.push(branch);
    }
    return specializationTree;
  }

  // ============================================
  // Worker Verification Operations
  // ============================================

  /**
   * Upsert worker profile verification
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {WorkerVerificationData} params.verificationData
   * @returns {Promise<WorkerVerification>}
   */
  async upsertWorkerProfileVerification({ workerProfileId, verificationData }) {
    return await this.prismaClient.workerVerification.upsert({
      create: {
        ...verificationData,
        workerProfile: {
          connect: { id: workerProfileId },
        },
      },
      where: { workerProfileId },
      update: {
        ...verificationData,
        workerProfile: {
          connect: { id: workerProfileId },
        },
      },
    });
  }

  /**
   * Find worker profile verification
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<WorkerVerification | null>}
   */
  async findWorkerProfileVerification({ workerProfileId }) {
    return await this.prismaClient.workerVerification.findFirst({
      where: { workerProfileId },
    });
  }

  // ============================================
  // Client Profile Operations
  // ============================================

  /**
   * Check if user has a client profile
   * @param {Object} params
   * @param {IDType} params.userId
   * @returns {Promise<boolean>}
   */
  async hasClientProfile({ userId }) {
    return (
      (await this.prismaClient.clientProfile.count({ where: { userId } })) > 0
    );
  }

  /**
   * Create a new user with client profile
   * @param {Object} params
   * @param {UserData} params.userData
   * @param {ClientProfileData} params.clientProfileData
   * @returns {Promise<{user: User, profile: ClientProfile}>}
   */
  async createClient({ userData, clientProfileData }) {
    const user = await this.prismaClient.user.create({
      data: {
        ...userData,
        clientProfile: {
          create: clientProfileData,
        },
      },
    });
    const profile = await this.findClientProfile({ userId: user.id });
    return { user, profile };
  }

  /**
   * Create a client profile for existing user
   * @param {Object} params
   * @param {IDType} params.userId
   * @param {ClientProfileData} params.data
   * @returns {Promise<ClientProfile>}
   */
  async createClientProfile({ userId, data }) {
    return await this.prismaClient.clientProfile.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  /**
   * Find client profile by user ID
   * @param {Object} params
   * @param {IDType} params.userId
   * @returns {Promise<ClientProfile | null>}
   */
  async findClientProfile({ userId }) {
    return await this.prismaClient.clientProfile.findUnique({
      where: { userId },
    });
  }

  /**
   * Find client profile by client profile ID
   * @param {Object} params
   * @param {IDType} params.clientProfileId
   * @returns {Promise<ClientProfile | null>}
   */
  async findClientProfileById({ clientProfileId }) {
    return await this.prismaClient.clientProfile.findUnique({
      where: { id: clientProfileId },
    });
  }

  /**
   * Update a client profile
   * @param {Object} params
   * @param {IDType} params.clientProfileId
   * @param {OptionalClientProfileData} params.data
   * @returns {Promise<ClientProfile>}
   */
  async updateClientProfile({ clientProfileId, data }) {
    return await this.prismaClient.clientProfile.update({
      where: { userId: clientProfileId },
      data,
    });
  }

  /**
   * Delete a client profile
   * @param {Object} params
   * @param {IDType} params.clientProfileId
   * @returns {Promise<ClientProfile>}
   */
  async deleteClientProfile({ clientProfileId }) {
    return await this.prismaClient.clientProfile.delete({
      where: { id: clientProfileId },
    });
  }
}
