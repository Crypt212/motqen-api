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


/** @typedef {{ role: Role, firstName: string, lastName: string, governmentId?: IDType, cityId?: IDType, bio?: string, status: AccountStatus }} UserData */
/** @typedef { UserData | { id: IDType }} User */
/** @typedef {import("./Repository.js").FilterArgs<User>} UserFilter */


/** @typedef {{ experienceYears: number, isInTeam: Boolean, acceptsUrgentJobs: Boolean, }} WorkerProfileData */
/** @typedef { UserData | { id: IDType, userId: IDType }} WorkerProfile */
/** @typedef {import("./Repository.js").FilterArgs<User>} WorkerProfileFilter */

/** @typedef {{ }} ClientProfileData */
/** @typedef { UserData | { id: IDType, userId: IDType }} ClientProfile */
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
 * @extends Repository<User, UserData, UserFilter>
 */
export default class UserRepository extends Repository {

  constructor() {
    super(prisma.user);
  }

  // Handling WorkerProfile ---------------------------------------------------------------------

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<boolean>}
   */
  async hasWorkerProfile(userId) {
    return (await prisma.workerProfile.count({ where: { userId } })) > 0;
  }


  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<WorkerProfile[]>}
   */
  async getWorkerProfile(userId) {
    return await prisma.workerProfile.findMany({
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
    return await prisma.workerProfile.create({
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
   * @param {WorkerProfileData} data
   * @returns {Promise<WorkerProfile>}
   */
  async updateWorkerProfile(userId, data) {
    return await prisma.workerProfile.update({
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
    return await prisma.workerProfile.delete({
      where: { userId },
    });
  };

  // Handling ClientProfile ---------------------------------------------------------------------

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<boolean>}
   */
  async hasClientProfile(userId) {
    return (await prisma.clientProfile.count({ where: { userId } })) > 0;
  }


  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<ClientProfile[]>}
   */
  async getClientProfile(userId) {
    return await prisma.clientProfile.findMany({
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
    return await prisma.clientProfile.create({
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
   * @param {ClientProfileData} data
   * @returns {Promise<ClientProfile>}
   */
  async updateClientProfile(userId, data) {
    return await prisma.clientProfile.update({
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
    return await prisma.clientProfile.delete({
      where: { userId },
    });
  };

};
