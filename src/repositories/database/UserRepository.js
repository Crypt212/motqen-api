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
   * @param {number} [params.skip]
   * @param {number} [params.take]
   * @returns {Promise<any>}
   */
  async findWorkerProfileGovernments({ workerProfileId, skip = 0, take }) {
    const governments = await this.prismaClient.governmentForWorkers.findMany({
      where: { workerProfileId },
      include: { government: true },
      skip,
      take
    });

    return governments.map(({ government }) => ({
      id: government.id,
      name: government.name
    }));
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {IDType[]} params.mainSpecializationIds
   * @param {number} [params.skip]
   * @param {number} [params.take]
   * @returns {Promise<SpecializationTree>}
   */
  async findWorkerProfileSpecializations({ workerProfileId, mainSpecializationIds, skip = 0, take }) {
    const query = await this.prismaClient.chosenSpecialization.findMany({
      where: {
        workerProfileId,
        specializationId: mainSpecializationIds ? { in: mainSpecializationIds } : undefined,
      },
      include: {
        specialization: true,
        subSpecialization: true
      },
      skip,
      take
    });

    const tree = [];
    const map = new Map();
    for (let { subSpecializationId, specializationId, specialization, subSpecialization } of query) {
      if (!(specializationId in map)) {
        const branch = { mainId: specializationId, subIds: [], mainName: specialization.name };
        map.set(specializationId, branch);
      }

      map.get(specializationId).subIds.push({
        id: subSpecializationId,
        name: subSpecialization.name
      });
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

  // Worker Profile Dashboard Methods ---------------------------------------------------------

  /**
   * Find worker profile with user data
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<Object|null>}
   */
  async findWorkerProfileWithUser({ workerProfileId }) {
    return await this.prismaClient.workerProfile.findUnique({
      where: { id: workerProfileId },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
            governmentId: true,
            cityId: true,
            profileImageUrl: true,
            status: true,
          }
        }
      }
    });
  }

  /**
   * Find worker profile with governments (full data)
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<Object|null>}
   */
  async findWorkerProfileWithGovernments({ workerProfileId }) {
    return await this.prismaClient.workerProfile.findUnique({
      where: { id: workerProfileId },
      include: {
        governments: {
          include: {
            government: true
          }
        }
      }
    });
  }

  /**
   * Find worker profile with specializations (full data)
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<Object|null>}
   */
  async findWorkerProfileWithSpecializations({ workerProfileId }) {
    return await this.prismaClient.workerProfile.findUnique({
      where: { id: workerProfileId },
      include: {
        chosenSpecializations: {
          include: {
            specialization: {
              include: {
                subSpecializations: true
              }
            },
            subSpecialization: true
          }
        }
      }
    });
  }

  /**
   * Find worker profile with verification
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<Object|null>}
   */
  async findWorkerProfileWithVerification({ workerProfileId }) {
    return await this.prismaClient.workerProfile.findUnique({
      where: { id: workerProfileId },
      include: {
        verification: true
      }
    });
  }

  /**
   * Find worker profile with portfolio projects
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<Object|null>}
   */
  async findWorkerProfileWithPortfolio({ workerProfileId }) {
    return await this.prismaClient.workerProfile.findUnique({
      where: { id: workerProfileId },
      include: {
        portfolio: {
          include: {
            projectImages: true
          }
        }
      }
    });
  }

  /**
   * Get complete worker dashboard data
   * @async
   * @method getWorkerDashboard
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {string[]} [params.include] - Sections to include
   * @param {number} [params.skip] - Skip for pagination
   * @param {number} [params.take] - Limit for pagination
   * @returns {Promise<Object>} Complete worker dashboard data
   */
  async getWorkerDashboard({ workerProfileId, include = ['user', 'governments', 'specializations', 'verification', 'portfolio'], skip = 0, take = 10 }) {
    // Determine what to include
    const shouldIncludeUser = include.includes('user');
    const shouldIncludeGovernments = include.includes('governments');
    const shouldIncludeSpecializations = include.includes('specializations');
    const shouldIncludeVerification = include.includes('verification');
    const shouldIncludePortfolio = include.includes('portfolio');

    // Build include object
    const includeObj = {};
    if (shouldIncludeUser) {
      includeObj.user = {
        select: {
          id: true,
          phoneNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          governmentId: true,
          cityId: true,
          profileImageUrl: true,
          status: true,
        }
      };
    }
    if (shouldIncludeGovernments) {
      includeObj.governments = {
        include: { government: true },
        skip,
        take: shouldIncludeGovernments === true ? take : undefined
      };
    }
    if (shouldIncludeSpecializations) {
      includeObj.chosenSpecializations = {
        include: {
          specialization: { include: { subSpecializations: true } },
          subSpecialization: true
        },
        skip,
        take: shouldIncludeSpecializations === true ? take : undefined
      };
    }
    if (shouldIncludeVerification) {
      includeObj.verification = true;
    }
    if (shouldIncludePortfolio) {
      includeObj.portfolio = {
        include: { projectImages: true },
        skip,
        take: shouldIncludePortfolio === true ? take : undefined
      };
    }

    const profile = await this.prismaClient.workerProfile.findUnique({
      where: { id: workerProfileId },
      include: includeObj
    });

    if (!profile) return null;

    // Transform governments data
    const governments = shouldIncludeGovernments
      ? profile.governments?.map(gov => ({
          id: gov.government.id,
          name: gov.government.name
        })) || []
      : undefined;

    // Transform specializations data
    let specializations;
    if (shouldIncludeSpecializations) {
      const specializationsMap = new Map();
      if (profile.chosenSpecializations) {
        for (const chosen of profile.chosenSpecializations) {
          const specializationId = chosen.specializationId;
          if (!specializationsMap.has(specializationId)) {
            specializationsMap.set(specializationId, {
              id: chosen.specialization.id,
              name: chosen.specialization.name,
              subSpecializations: []
            });
          }
          specializationsMap.get(specializationId).subSpecializations.push({
            id: chosen.subSpecialization.id,
            name: chosen.subSpecialization.name
          });
        }
      }
      specializations = Array.from(specializationsMap.values());
    } else {
      specializations = undefined;
    }

    // Transform portfolio data
    const portfolio = shouldIncludePortfolio
      ? profile.portfolio?.map(project => ({
          id: project.id,
          description: project.description,
          images: project.projectImages.map(img => img.imageUrl)
        })) || []
      : undefined;

    return {
      // Basic profile info
      id: profile.id,
      experienceYears: profile.experienceYears,
      isInTeam: profile.isInTeam,
      acceptsUrgentJobs: profile.acceptsUrgentJobs,
      isApproved: profile.isApproved,
      // User info
      user: shouldIncludeUser ? profile.user : undefined,
      // Related data
      governments,
      specializations,
      verification: shouldIncludeVerification ? profile.verification || null : undefined,
      portfolio
    };
  }

  /**
   * Count worker governments
   * @async
   * @method countWorkerGovernments
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<number>}
   */
  async countWorkerGovernments({ workerProfileId }) {
    return await this.prismaClient.governmentForWorkers.count({
      where: { workerProfileId }
    });
  }

  /**
   * Count worker specializations
   * @async
   * @method countWorkerSpecializations
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<number>}
   */
  async countWorkerSpecializations({ workerProfileId }) {
    return await this.prismaClient.chosenSpecialization.count({
      where: { workerProfileId },
      distinct: ['specializationId']
    });
  }

  /**
   * Count worker portfolio projects
   * @async
   * @method countWorkerPortfolio
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @returns {Promise<number>}
   */
  async countWorkerPortfolio({ workerProfileId }) {
    return await this.prismaClient.portfolioProject.count({
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
