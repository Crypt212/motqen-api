/**
 * @fileoverview User Repository - Handle database operations for users
 * @module repositories/UserRepository
 */

import { Repository } from './Repository.js';
import { $Enums, PrismaClient } from '@prisma/client';

/** @typedef {import("./Repository.js").IDType} IDType */
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
    super(prisma, "user");
  }

  // Handling WorkerProfile ---------------------------------------------------------------------

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.userId
   * @returns {Promise<boolean>}
   */
  async hasWorkerProfile({ userId }) {
    return (
      (await this.prismaClient.workerProfile.count({ where: { userId } })) > 0
    );
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.userId
   * @returns {Promise<WorkerProfile>}
   */
  async findWorkerProfile({ userId }) {
    return await this.prismaClient.workerProfile.findUnique({
      where: { userId },
    });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {UserData} params.userData
   * @param {WorkerProfileData} params.workerProfileData
   * @param {WorkerVerificationData | undefined} params.verificationData
   * @returns {Promise<{ user: User, profile: WorkerProfile }>}
   */
  async createWorker({ userData, workerProfileData, verificationData = undefined }) {
    const user = await this.prismaClient.user.create({
      data: {
        ...userData,
        workerProfile: {
          create: {
            ...workerProfileData,
            verification: {
              create: (verificationData !== undefined) ? verificationData : undefined
            }
          }
        }
      }
    });
    const profile = await this.findWorkerProfile({ userId: user.id });
    return { user, profile };
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.userId
   * @param {WorkerProfileData} params.data
   * @param {WorkerVerificationData | undefined} params.verificationData
   * @returns {Promise<WorkerProfile>}
   */
  async insertWorkerProfile({ userId, data, verificationData = undefined }) {
    return await this.prismaClient.workerProfile.create({
      data: {
        userId,
        ...data,
        verification: {
          create: (verificationData !== undefined) ? verificationData : undefined
        }
      },
    });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {OptionalWorkerProfileData} params.data
   * @param {WorkerVerificationData | undefined} params.verificationData
   * @returns {Promise<WorkerProfile>}
   */
  async updateWorkerProfile({ workerProfileId, data, verificationData = undefined }) {
    return await this.prismaClient.workerProfile.update({
      where: { id: workerProfileId },
      data: {
        ...data,
        verification: {
          create: (verificationData !== undefined) ? verificationData : undefined
        }
      }
    });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<WorkerProfile>}
   */
  async deleteWorkerProfile({ workerProfileId }) {
    return await this.prismaClient.workerProfile.delete({
      where: { userId: workerProfileId },
    });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType[]} params.governmentIds
   * @returns {Promise<BatchPayload>}
   */
  async insertWorkerProfileGovernments({ workerProfileId, governmentIds }) {
    return await this.prismaClient.governmentForWorkers.createMany({
      data: governmentIds.map(id => ({
        governmentId: id,
        workerProfileId
      })),
      skipDuplicates: true
    })
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType[] | undefined} params.governmentIds
   * @returns {Promise<BatchPayload>}
   */
  async deleteWorkerProfileGovernments({ workerProfileId, governmentIds = undefined }) {
    if (!governmentIds) {
      return await this.prismaClient.governmentForWorkers.deleteMany({
        where: { workerProfileId },
      });
    }
    return await this.prismaClient.governmentForWorkers.deleteMany({
      where: { workerProfileId, governmentId: { in: governmentIds } },
    });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<any>}
   */
  async findWorkerProfileGovernments({ workerProfileId }) {
    const governments = await this.prismaClient.governmentForWorkers.findMany({
      where: { workerProfileId }
    });

    return governments.map(({ governmentId }) => governmentId);
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType[]} params.mainSpecializationIds
   * @returns {Promise<SpecializationTree>}
   */
  async findWorkerProfileSpecializations({ workerProfileId, mainSpecializationIds }) {
    const query = await this.prismaClient.chosenSpecialization.findMany({
      where: {
        workerProfileId,
        specializationId: { in: mainSpecializationIds },
      }
    });

    const tree = [];
    const map = new Map();
    for (let { subSpecializationId, specializationId } of query) {
      if (!(specializationId in map)) {
        const branch = { mainId: specializationId, subIds: [] };
        map.set(specializationId, branch);
      }

      map.get(specializationId).subIds.push(subSpecializationId);
    }
    for (let [_, branch] of map) {
      tree.push(branch);
    }

    return tree;
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {SpecializationTree} params.specializationsTree
   * @returns {Promise<BatchPayload>}
   */
  async insertWorkerProfileSpecializations({ workerProfileId, specializationsTree }) {

    // const existingSpecializations = await this.prismaClient.chosenSpecialization.findMany({ where: { workerProfileId }, select: { subSpecializationId: true } });
    const data = specializationsTree.reduce((acc, current) => {
      return [...acc, ...current.subIds.map(subId => {
        // if (subId in existingSpecializations) {
        //   return "heck";
        // }
        return {
          specializationId: current.mainId,
          subSpecializationId: subId,
          workerProfileId,
        }
      })];
    }, []);
    data.filter((value) => value !== "heck");

    return await this.prismaClient.chosenSpecialization.createMany({ data , skipDuplicates: true });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType} params.specializationId
   * @param {IDType[]} params.subSpecializationIds
   * @returns {Promise<BatchPayload>}
   */
  async insertWorkerProfileSubSpecializations({
    workerProfileId,
    specializationId,
    subSpecializationIds
  }) {
    return await this.prismaClient.chosenSpecialization.createMany({
      data: subSpecializationIds.map((subSpecializationId) => ({
        workerProfileId,
        subSpecializationId,
        specializationId,
      })),
      skipDuplicates: true
    });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType[] | undefined} params.specializationIds
   * @returns {Promise<BatchPayload>}
   */
  async deleteWorkerProfileSpecializations({ workerProfileId, specializationIds = undefined }) {
    return await this.prismaClient.chosenSpecialization.deleteMany({
      where: { workerProfileId, specializationId: specializationIds ? { in: specializationIds } : undefined },
    });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType} params.specializationId
   * @param {IDType[]} params.subSpecializationIds
   * @returns {Promise<BatchPayload>}
   */
  async deleteWorkerProfileSubSpecializations({
    workerProfileId,
    specializationId,
    subSpecializationIds
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
   * @async
   * @method
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

    for (let { specializationId } of chosenSpecializations) {
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

  /**
   * @async
   * @method
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
          connect: { id: workerProfileId }
        }
      },
      where: { workerProfileId },
      update: {
        ...verificationData,
        workerProfile: {
          connect: { id: workerProfileId }
        }
      }
    });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<WorkerVerification>}
   */
  async findWorkerProfileVerification({ workerProfileId }) {
    return await this.prismaClient.workerVerification.findFirst({
      where: { workerProfileId }
    });
  }


  // Handling ClientProfile ---------------------------------------------------------------------

  /**
   * @async
   * @method
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
   * @async
   * @method
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
        }
      }
    });
    const profile = await this.findClientProfile({ userId: user.id });
    return { user, profile };
  }

  /**
   * @async
   * @method
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
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.userId
   * @returns {Promise<ClientProfile>}
   */
  async findClientProfile({ userId }) {
    return await this.prismaClient.clientProfile.findUnique({
      where: { userId },
    });
  }

  /**
   * @async
   * @method
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
   * @async
   * @method
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
