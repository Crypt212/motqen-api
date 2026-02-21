/**
 * @fileoverview User Repository - Handle database operations for users
 * @module repositories/UserRepository
 */

import { Repository } from "./Repository.js";
import prisma from "../libs/database.js";
import { $Enums } from "@prisma/client";

/** @typedef {import("./Repository.js").IDType} IDType */
/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */
/** @typedef {import('../types/role.js').Role} Role */
/** @typedef {$Enums.AccountStatus} AccountStatus */


/** @typedef {{ role: Role, phoneNumber: string, firstName: string, lastName: string, governmentId?: IDType, cityId?: IDType, bio?: string, status: AccountStatus }} UserData */
/** @typedef {Partial<UserData>} OptionalUserData */
/** @typedef { UserData & { id: IDType }} User */
/** @typedef {import("./Repository.js").FilterArgs<User>} UserFilter */


/** @typedef {{ experienceYears: number, isInTeam: Boolean, acceptsUrgentJobs: Boolean, }} WorkerProfileData */
/** @typedef {Partial<WorkerProfileData>} OptionalWorkerProfileData */
/** @typedef { WorkerProfileData & { id: IDType, userId: IDType }} WorkerProfile */
/** @typedef {import("./Repository.js").FilterArgs<User>} WorkerProfileFilter */

/** @typedef {{ }} ClientProfileData */
/** @typedef {Partial<ClientProfileData>} OptionalClientProfileData */
/** @typedef { ClientProfileData & { id: IDType, userId: IDType }} ClientProfile */
/** @typedef {import("./Repository.js").FilterArgs<User>} ClientProfileFilter */


// /**
//  * Finds strings in stringList2 that are not in stringList1
//  * @param {string[]} stringList1
//  * @param {string[]} stringList2
//  * @returns {string[]} - strings in stringList2 that are not in stringList1
//  */
// function difference(stringList1, stringList2) {
//   const result = stringList2.filter((s) => !stringList1.includes(s));
//   return result;
// }
//
// /**
//  * Validate the information provided by the user that belongs to existing government, specialization
//  * @param {string} primarySpecializationName
//  * @param {string[]} secondarySpecializationNames
//  * @param {string[]} governmentNames
//  * @throws {RepositoryError} if some data is missing
//  */
// async function validateWorkerInfo(
//   primarySpecializationName,
//   secondarySpecializationNames,
//   governmentNames
// ) {
//
//   const governmentEntites = await prisma.government.findMany({ where: { name: { in: governmentNames } }, select: { name: true, } });
//   const result = { ok: true, info: {} };
//
//   if (governmentEntites.length !== governmentNames.length) {
//     const foundGovernmentNames = governmentEntites.map((gov) => gov.name);
//     const missingGovernments = difference(foundGovernmentNames, governmentNames);
//     result.ok = false;
//     result.info.nonExistingGovernments = missingGovernments;
//   }
//
//
//   let primarySpecializationEntity = await prisma.specialization.findFirst({ where: { name: primarySpecializationName, } });
//   if (!primarySpecializationEntity) {
//     result.ok = false;
//     result.info.nonExistingPrimarySpecialization = primarySpecializationName;
//   }
//
//   let secondarySpecializationEntities = await prisma.specialization.findMany({ where: { name: { in: secondarySpecializationNames }, }, select: { name: true } });
//   if (secondarySpecializationEntities.length != secondarySpecializationNames.length) {
//     const foundSpecializationNames = secondarySpecializationEntities.map((spec) => spec.name);
//     const missingSpecializations = difference(foundSpecializationNames, secondarySpecializationNames);
//
//     result.ok = false;
//     result.info.nonExistingSecondarySpecialization = missingSpecializations;
//   }
//
//   if (!result.ok)
//     throw new RepositoryError("provided information doesn't exist in the database", RepositoryErrorType.NOT_FOUND, result.info);
// }

/**
 * User Repository - Handles all database operations for users
 * @class
 * @extends Repository
 */
export default class UserRepository extends Repository {

  constructor() {
    super(prisma);
  }

  /**
   * @async
   * @method
   * @param {UserFilter} where
   * @returns {Promise<boolean>}
   */
  async exists(where) {
    return (await this.prismaClient.user.count({ where })) > 0;
  }


  /**
   * @async
   * @method
   * @param {UserFilter} where
   * @returns {Promise<User|null>}
   */
  async findOne(where) {
    return await this.prismaClient.user.findFirst({ where });
  };

  /**
   * @async
   * @method
   * @param {UserFilter} where
   * @returns {Promise<User[]>}
   */
  async findMany(where) {
    return await this.prismaClient.user.findMany({ where });
  };

  /**
   * @async
   * @method
   * @param {UserData} data
   * @returns {Promise<User>}
   */
  async create(data) {
    return await this.prismaClient.user.create({ data });
  };

  /**
   * @async
   * @method
   * @param {UserData[]} data
   * @returns {Promise<BatchPayload>}
   */
  async createMany(data) {
    return await this.prismaClient.user.createMany({ data });
  };

  /**
   * @async
   * @method
   * @param {UserFilter} filter
   * @param {OptionalUserData} data
   * @returns {Promise<BatchPayload>}
   */
  async update(filter, data) {
    return await this.prismaClient.user.updateMany({
      where: filter,
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {UserFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async delete(filter) {
    return await this.prismaClient.user.deleteMany({
      where: filter,
    });
  };

  // Handling WorkerProfile ---------------------------------------------------------------------

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<boolean>}
   */
  async hasWorkerProfile(userId) {
    return (await this.prismaClient.workerProfile.count({ where: { userId } })) > 0;
  }


  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<WorkerProfile[]>}
   */
  async getWorkerProfile(userId) {
    return await this.prismaClient.workerProfile.findMany({
      where: { userId },
    });
  };

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @param {WorkerProfileData} data
   * @returns {Promise<WorkerProfile>}
   */
  async createWorkerProfile(userId, data) {
    return await this.prismaClient.workerProfile.create({
      data: {
        userId,
        ...data
      }
    });
  };

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @param {OptionalWorkerProfileData} data
   * @returns {Promise<WorkerProfile>}
   */
  async updateWorkerProfile(userId, data) {
    return await this.prismaClient.workerProfile.update({
      where: { userId },
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<WorkerProfile>}
   */
  async deleteWorkerProfile(userId) {
    return await this.prismaClient.workerProfile.delete({
      where: { userId },
    });
  };

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @param {IDType[]} governmentIds
   * @returns {Promise<BatchPayload>}
   */
  async addWorkerProfileGovernments(workerProfileId, governmentIds) {
    return await this.prismaClient.governmentsForWorkers.createMany({
      data: governmentIds.map((governmentId) => ({
        workerProfileId,
        governmentId,
      }))
    })
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @param {IDType[]} governmentIds
   * @returns {Promise<BatchPayload>}
   */
  async deleteWorkerProfileGovernments(workerProfileId, governmentIds) {
    return await this.prismaClient.governmentsForWorkers.deleteMany({
      where: { workerProfileId, governmentId: { in: governmentIds } }
    })
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @returns {Promise<IDType[]>}
   */
  async getWorkerProfileGovernments(workerProfileId) {
    const governments = await this.prismaClient.governmentsForWorkers.findMany({
      where: { workerProfileId },
      select: { governmentId: true },
    });

    return governments.map(({ governmentId }) => governmentId);
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @param {IDType[]} specializationIds
   * @returns {Promise<BatchPayload>}
   */
  async addWorkerProfileSpecializations(workerProfileId, specializationIds) {
    return await this.prismaClient.chosenSpecialization.createMany({
      data: specializationIds.map((specializationId) => ({
        workerProfileId,
        specializationId,
      }))
    })

  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @param {IDType} specializationId
   * @param {IDType[]} subSpecializationIds
   * @returns {Promise<BatchPayload>}
   */
  async addWorkerProfileSubSpecializations(workerProfileId, specializationId, subSpecializationIds) {
    return await this.prismaClient.chosenSubSpecialization.createMany({
      data: subSpecializationIds.map((subSpecializationId) => ({
        workerProfileId,
        subSpecializationId,
        chosenSpecializationId: specializationId,
      }))
    });
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @param {IDType[]} specializationIds
   * @returns {Promise<BatchPayload>}
   */
  async deleteWorkerProfileSpecializations(workerProfileId, specializationIds) {
    return await this.prismaClient.chosenSpecialization.deleteMany({
      where: { workerProfileId, specializationId: { in: specializationIds } }
    })
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @param {IDType} specializationId
   * @param {IDType[]} subSpecializationIds
   * @returns {Promise<BatchPayload>}
   */
  async deleteWorkerProfileSubSpecializations(workerProfileId, specializationId, subSpecializationIds) {
    return await this.prismaClient.chosenSubSpecialization.deleteMany({
      where: {
        workerProfileId,
        subSpecializationId: { in: subSpecializationIds },
        chosenSpecializationId: specializationId,
      }
    });
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @returns {Promise<{id: IDType, children: IDType[]}[]>}
   */
  async getWorkerProfileSpecializationIds(workerProfileId) {
    const chosenSpecializations = await this.prismaClient.chosenSpecialization.findMany({
      where: { workerProfileId },
      select: { specializationId: true },
    });

    const specializationTree = [];

    for (let { specializationId } of chosenSpecializations) {
      const branch = { id: specializationId, children: [] };

      const subSpecializations = await this.prismaClient.chosenSubSpecialization.findMany({
        where: { workerProfileId, chosenSpecializationId: specializationId },
      });

      branch.children = subSpecializations.map(({ subSpecializationId }) => subSpecializationId);
      specializationTree.push(branch);
    }
    return specializationTree;
  }

  // Handling ClientProfile ---------------------------------------------------------------------

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<boolean>}
   */
  async hasClientProfile(userId) {
    return (await this.prismaClient.clientProfile.count({ where: { userId } })) > 0;
  }


  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<ClientProfile[]>}
   */
  async getClientProfile(userId) {
    return await this.prismaClient.clientProfile.findMany({
      where: { userId },
    });
  };

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @param {ClientProfileData} data
   * @returns {Promise<ClientProfile>}
   */
  async createClientProfile(userId, data) {
    const existingClientProfile = await this.prismaClient.clientProfile.findFirst({ where: { userId } });
    if (existingClientProfile)
      return existingClientProfile;

    return await this.prismaClient.clientProfile.create({
      data: {
        userId,
        ...data
      }
    });
  };

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @param {OptionalClientProfileData} data
   * @returns {Promise<ClientProfile>}
   */
  async updateClientProfile(userId, data) {
    return await this.prismaClient.clientProfile.update({
      where: { userId },
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<ClientProfile>}
   */
  async deleteClientProfile(userId) {
    return await this.prismaClient.clientProfile.delete({
      where: { userId },
    });
  };

};
