/**
 * @fileoverview User Repository - Handle database operations for users
 * @module repositories/UserRepository
 */

import { Repository } from './Repository.js';
import prisma from '../../libs/database.js';
import { $Enums } from '@prisma/client';

/** @typedef {import("./Repository.js").IDType} IDType */
/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */
/** @typedef {import('../../types/role.js').Role} Role */
/** @typedef {$Enums.AccountStatus} AccountStatus */

/** @typedef {{ role: Role, phoneNumber: string, firstName: string, middleName: string, lastName: string, governmentId?: IDType, city?: string, profileImage?: String, status: AccountStatus }} UserData */
/** @typedef {Partial<UserData>} OptionalUserData */
/** @typedef { UserData & { id: IDType }} User */
/** @typedef {import("./Repository.js").FilterArgs<User>} UserFilter */
/** @typedef {Partial<User>} OptionalUser */

/** @typedef {{ experienceYears: number, isInTeam: Boolean, acceptsUrgentJobs: Boolean, }} WorkerProfileData */
/** @typedef {Partial<WorkerProfileData>} OptionalWorkerProfileData */
/** @typedef { WorkerProfileData & { id: IDType, userId: IDType }} WorkerProfile */
/** @typedef {import("./Repository.js").FilterArgs<WorkerProfile>} WorkerProfileFilter */
/** @typedef {Partial<WorkerProfile>} OptionalWorkerProfile */

/** @typedef {{ address: string, addressNotes?: string }} ClientProfileData */
/** @typedef {Partial<ClientProfileData>} OptionalClientProfileData */
/** @typedef { ClientProfileData & { id: IDType, userId: IDType }} ClientProfile */
/** @typedef {import("./Repository.js").FilterArgs<ClientProfile>} ClientProfileFilter */
/** @typedef {Partial<ClientProfile>} OptionalClientProfile */

/** @typedef {{ status: $Enums.VerificationStatus, personalImageUrl: string, idDocumentUrl: string, createdAt?: Date, updatedAt?: Date, reason?: string }} VerificationData */
/** @typedef {Partial<VerificationData>} OptionalVerificationData */
/** @typedef { VerificationData & { id: IDType, workerProfileId: IDType }} Verification */
/** @typedef {import("./Repository.js").FilterArgs<Verification>} VerificationFilter */
/** @typedef {Partial<Verification>} OptionalVerification */

/**
 * User Repository - Handles all database operations for users
 * @class
 * @extends Repository<UserData, OptionalUserData, UserFilter, UserFilter, OptionalUser>
 */
export default class UserRepository extends Repository {
  constructor() {
    super(prisma, "user");
  }

  // Handling WorkerProfile ---------------------------------------------------------------------

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<boolean>}
   */
  async hasWorkerProfile(userId) {
    return (
      (await this.prismaClient.workerProfile.count({ where: { userId } })) > 0
    );
  }

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<WorkerProfile>}
   */
  async getWorkerProfile(userId) {
    return await this.prismaClient.workerProfile.findUnique({
      where: { userId },
    });
  }

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
        ...data,
      },
    });
  }

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
  }

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
  }

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
      })),
    });
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
      where: { workerProfileId, governmentId: { in: governmentIds } },
    });
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
      })),
    });
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @param {IDType} specializationId
   * @param {IDType[]} subSpecializationIds
   * @returns {Promise<BatchPayload>}
   */
  async addWorkerProfileSubSpecializations(
    workerProfileId,
    specializationId,
    subSpecializationIds
  ) {
    return await this.prismaClient.chosenSubSpecialization.createMany({
      data: subSpecializationIds.map((subSpecializationId) => ({
        workerProfileId,
        subSpecializationId,
        chosenSpecializationId: specializationId,
      })),
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
      where: { workerProfileId, specializationId: { in: specializationIds } },
    });
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @param {IDType} specializationId
   * @param {IDType[]} subSpecializationIds
   * @returns {Promise<BatchPayload>}
   */
  async deleteWorkerProfileSubSpecializations(
    workerProfileId,
    specializationId,
    subSpecializationIds
  ) {
    return await this.prismaClient.chosenSubSpecialization.deleteMany({
      where: {
        workerProfileId,
        subSpecializationId: { in: subSpecializationIds },
        chosenSpecializationId: specializationId,
      },
    });
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @returns {Promise<{id: IDType, children: IDType[]}[]>}
   */
  async getWorkerProfileSpecializationIds(workerProfileId) {
    const chosenSpecializations =
      await this.prismaClient.chosenSpecialization.findMany({
        where: { workerProfileId },
        select: { specializationId: true },
      });

    const specializationTree = [];

    for (let { specializationId } of chosenSpecializations) {
      const branch = { id: specializationId, children: [] };

      const subSpecializations =
        await this.prismaClient.chosenSubSpecialization.findMany({
          where: { workerProfileId, chosenSpecializationId: specializationId },
        });

      branch.children = subSpecializations.map(
        ({ subSpecializationId }) => subSpecializationId
      );
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
    return (
      (await this.prismaClient.clientProfile.count({ where: { userId } })) > 0
    );
  }

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @returns {Promise<ClientProfile>}
   */
  async getClientProfile(userId) {
    return await this.prismaClient.clientProfile.findUnique({
      where: { userId },
    });
  }

  /**
   * @async
   * @method
   * @param {IDType} userId
   * @param {ClientProfileData} data
   * @returns {Promise<ClientProfile>}
   */
  async createClientProfile(userId, data) {
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
   * @param {IDType} userId
   * @param {OptionalClientProfileData} data
   * @returns {Promise<ClientProfile>}
   */
  async updateClientProfile(userId, data) {
    return await this.prismaClient.clientProfile.update({
      where: { userId },
      data,
    });
  }

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
  }

  /**
   * @async
   * @method
   * @param {IDType} workerProfileId
   * @param {VerificationData} data
   * @returns {Promise<Verification>}
   */
  async createVerification(workerProfileId, data) {
    return await prisma.verification.create({
      data: {
        ...data, workerProfileId
      },
    });
  }
}
