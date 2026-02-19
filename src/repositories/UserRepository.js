import { Repository } from "./Repository.js";
import prisma from "../libs/database.js";
import RepositoryError, { RepositoryErrorType } from "../errors/RepositoryError.js";

/**
 * @fileoverview User Repository - Handle database operations for users
 * @module repositories/UserRepository
 * @extends {Repository}
 */


/**
 * Finds strings in stringList2 that are not in stringList1
 * @param {string[]} stringList1
 * @param {string[]} stringList2
 * @returns {string[]} - strings in stringList2 that are not in stringList1
 */
function difference(stringList1, stringList2) {
  const result = stringList2.filter((s) => !stringList1.includes(s));
  return result;
}

/**
 * Validate the information provided by the user that belongs to existing government, specialization
 * @param {string} primarySpecializationName
 * @param {string[]} secondarySpecializationNames
 * @param {string[]} governmentNames
 * @throws {RepositoryError} if some data is missing
 */
async function validateWorkerInfo(
  primarySpecializationName,
  secondarySpecializationNames,
  governmentNames
) {

  const governmentEntites = await prisma.government.findMany({ where: { name: { in: governmentNames } }, select: { name: true, } });
  const result = { ok: true, info: {} };

  if (governmentEntites.length !== governmentNames.length) {
    const foundGovernmentNames = governmentEntites.map((gov) => gov.name);
    const missingGovernments = difference(foundGovernmentNames, governmentNames);
    result.ok = false;
    result.info.nonExistingGovernments = missingGovernments;
  }


  let primarySpecializationEntity = await prisma.specialization.findFirst({ where: { name: primarySpecializationName, } });
  if (!primarySpecializationEntity) {
    result.ok = false;
    result.info.nonExistingPrimarySpecialization = primarySpecializationName;
  }

  let secondarySpecializationEntities = await prisma.specialization.findMany({ where: { name: { in: secondarySpecializationNames }, }, select: { name: true } });
  if (secondarySpecializationEntities.length != secondarySpecializationNames.length) {
    const foundSpecializationNames = secondarySpecializationEntities.map((spec) => spec.name);
    const missingSpecializations = difference(foundSpecializationNames, secondarySpecializationNames);

    result.ok = false;
    result.info.nonExistingSecondarySpecialization = missingSpecializations;
  }

  if (!result.ok)
    throw new RepositoryError("provided information doesn't exist in the database", RepositoryErrorType.NOT_FOUND, result.info);
}

/**
 * User Repository - Handles all database operations for users
 * @class
 * @extends Repository
 */
export default class UserRepository extends Repository {
  /**
   * Create a new user
   * @async
   * @method create
   * @param {Object} data - User creation data
   * @param {string} data.phoneNumber - User's phone number
   * @param {import('../types/role.js').Role} data.role - User's role
   * @param {string} data.firstName - User's first name
   * @param {string} data.lastName - User's last name
   * @param {string} data.government - User's government
   * @param {string} data.city - User's city
   * @param {string} [data.bio] - User's bio
   * @returns {Promise<Object>} Created user
   * @throws {RepositoryError} If user already exists
   */
  async create({ phoneNumber, role, firstName, lastName, government, city, bio }) {
    {
      const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });
      if (existingUser) throw new RepositoryError("user already exists", RepositoryErrorType.ALREADY_EXISTS);
    }
    const user = await prisma.user.create({
      data: { phoneNumber, role, firstName, lastName, government, city, bio: bio || undefined },
    });
    return user;
  };

  /**
   * Update user's basic information
   * @async
   * @method updateBasicInfo
   * @param {string} userId - User's ID
   * @param {Object} data - Update data
   * @param {import('../types/role.js').Role} [data.role] - User's role
   * @param {string} [data.firstName] - First name
   * @param {string} [data.lastName] - Last name
   * @param {string} [data.government] - Government
   * @param {string} [data.city] - City
   * @param {string} [data.bio] - Bio
   * @returns {Promise<Object>} Updated user
   * @throws {RepositoryError} If user not found
   */
  async updateBasicInfo(userId, { role, firstName, lastName, government, city, bio }) {
    {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) throw new RepositoryError("user not found", RepositoryErrorType.NOT_FOUND);
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role, firstName, lastName, government, city, bio: bio || undefined },
    });
    return user;
  };

  /**
   * Get user by phone number
   * @async
   * @method getByPhoneNumber
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object>} User object
   * @throws {RepositoryError} If user not found
   */
  async getByPhoneNumber(phoneNumber) {
    const user = await prisma.user.findUnique({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    return user;
  };

  /**
   * Get user by ID
   * @async
   * @method getById
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} User object
   * @throws {RepositoryError} If user not found
   */
  async getById(userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new RepositoryError("user not found", RepositoryErrorType.NOT_FOUND);
    return user;
  };

  /**
   * Create worker's profile information
   * @async
   * @method createWorkerInfo
   * @param {string} userId - User's ID
   * @param {Object} data - Worker info data
   * @param {number} data.experienceYears - Years of experience
   * @param {boolean} data.isInTeam - Whether worker is in a team
   * @param {boolean} data.acceptsUrgentJobs - Whether worker accepts urgent jobs
   * @param {string} data.primarySpecializationName - Primary specialization name
   * @param {string[]} data.secondarySpecializationNames - Secondary specializations
   * @param {string[]} data.governmentNames - Governments served
   * @returns {Promise<void>}
   * @throws {RepositoryError} If user not found or worker info already exists
   */
  async createWorkerInfo(
    userId,
    {
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      primarySpecializationName,
      secondarySpecializationNames,
      governmentNames,
    }) {
    {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) throw new RepositoryError("user not found", RepositoryErrorType.NOT_FOUND);
    }
    {
      const existingWorkerInfo = await prisma.workerInfo.findUnique({ where: { userId } });
      if (existingWorkerInfo)
        throw new RepositoryError("worker info already exists", RepositoryErrorType.ALREADY_EXISTS);
    }

    await validateWorkerInfo(primarySpecializationName, secondarySpecializationNames, governmentNames);

    const primarySpecializationId = (await prisma.specialization.findFirst({ where: { name: primarySpecializationName, } })).id;
    const secondarySpecializationIds = (await prisma.specialization.findMany({ where: { name: { in: secondarySpecializationNames }, } })).map(entity => entity.id);
    const governmentIds = (await prisma.government.findMany({ where: { name: { in: governmentNames }, } })).map(entity => entity.id);



    const workerInfo = await prisma.workerInfo.create({
      data: {
        userId,
        experienceYears,
        isInTeam,
        acceptsUrgentJobs,
        primarySpecializationId,
      },
    });

    await prisma.specializationsForWorkers.createMany({
      data: secondarySpecializationIds.map((id) => ({
        workerInfoId: workerInfo.id,
        specializationId: id,
      }))
    });

    await prisma.governmentsForWorkers.createMany({
      data: governmentIds.map((id) => ({
        workerInfoId: workerInfo.id,
        governmentId: id,
      }))
    });

  }

  /**
   * Check if user is a worker
   * @async
   * @method isWorker
   * @param {string} userId - User's ID
   * @returns {Promise<boolean>} True if user is a worker
   * @throws {RepositoryError} If user not found
   */
  async isWorker(userId) {
    {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) throw new RepositoryError("user not found", RepositoryErrorType.NOT_FOUND);
    }
    const workerInfo = await prisma.workerInfo.findUnique({ where: { userId } });
    return workerInfo ? true : false;
  }

  /**
   * Get worker's profile information
   * @async
   * @method getWorkerInfo
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} Worker info object
   * @throws {RepositoryError} If user not found
   */
  async getWorkerInfo(userId) {
    {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) throw new RepositoryError("user not found", RepositoryErrorType.NOT_FOUND);
    }
    const workerInfo = await prisma.workerInfo.findUnique({ where: { userId } });
    return workerInfo;
  }

  /**
   * Update worker's profile information
   * @async
   * @method updateWorkerInfo
   * @param {string} userId - User's ID
   * @param {Object} data - Update data
   * @param {number} [data.experienceYears] - Years of experience
   * @param {boolean} [data.isInTeam] - Whether worker is in a team
   * @param {boolean} [data.acceptsUrgentJobs] - Whether worker accepts urgent jobs
   * @param {string} [data.primarySpecializationName] - Primary specialization
   * @param {string[]} [data.secondarySpecializationNames] - Secondary specializations
   * @param {string[]} [data.governmentNames] - Governments served
   * @returns {Promise<void>}
   * @throws {RepositoryError} If user or worker info not found
   */
  async updateWorkerInfo(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    primarySpecializationName,
    secondarySpecializationNames,
    governmentNames,
  }) {
    let workerInfoId;
    {
      const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: {} });
      if (!existingUser) throw new RepositoryError("user not found", RepositoryErrorType.NOT_FOUND);
    }
    {
      const existingWorkerInfo = await prisma.workerInfo.findUnique({ where: { userId }, select: { id: true } });
      if (!existingWorkerInfo)
        throw new RepositoryError("worker info not found", RepositoryErrorType.NOT_FOUND);
      workerInfoId = existingWorkerInfo.id;
    }

    await validateWorkerInfo(primarySpecializationName, secondarySpecializationNames, governmentNames);

    const primarySpecializationId = (await prisma.specialization.findFirst({ where: { name: primarySpecializationName, }, select: { id: true } })).id;
    const secondarySpecializationIds = (await prisma.specialization.findMany({ where: { name: { in: secondarySpecializationNames }, }, select: { id: true } })).map(entity => entity.id);
    const governmentIds = (await prisma.government.findMany({ where: { name: { in: governmentNames }, }, select: { id: true } })).map(entity => entity.id);

    await prisma.workerInfo.update({
      where: { userId },
      data: {
        experienceYears,
        isInTeam,
        acceptsUrgentJobs,
        primarySpecializationId
      }
    });


    await prisma.specializationsForWorkers.createMany({
      data: secondarySpecializationIds.map((id) => ({
        workerInfoId,
        specializationId: id,
      }))
    });

    await prisma.governmentsForWorkers.createMany({
      data: governmentIds.map((id) => ({
        workerInfoId,
        governmentId: id,
      }))
    });
  };
};
