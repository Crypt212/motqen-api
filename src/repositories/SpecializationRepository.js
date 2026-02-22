/**
 * @fileoverview Specialization Repository - Handle database operations for specializations
 * @module repositories/SpecializationRepository
 */

import { Repository } from "./Repository.js";
import prisma from "../libs/database.js";


/** @typedef {import("./Repository.js").IDType} IDType */
/** @typedef {import("./Repository.js").BatchPayload} BatchPayload */

/** @typedef {{name: String}} SpecializationData */
/** @typedef {SpecializationData & { id: IDType }} Specialization */
/** @typedef {import("./Repository.js").FilterArgs<Specialization>} SpecializationFilter */

/** @typedef {{name: String}} SubSpecializationData */
/** @typedef {SubSpecializationData & { id: IDType, mainSpecializationId: IDType }} SubSpecialization */
/** @typedef {import("./Repository.js").FilterArgs<SubSpecialization>} SubSpecializationFilter */


/**
 * Specialization Repository - Handles all database operations for specializations and their sub-specializations
 * @class
 * @extends Repository
 */
export default class SpecializationRepository extends Repository {

  constructor() {
    super(prisma);
  }

  /**
   * @async
   * @method
   * @param {SpecializationFilter} where
   * @returns {Promise<boolean>}
   */
  async exists(where) {
    return (await this.prismaClient.specialization.count({ where })) > 0;
  }


  /**
   * @async
   * @method
   * @param {SpecializationFilter} where
   * @returns {Promise<Specialization|null>}
   */
  async findOne(where) {
    return await this.prismaClient.specialization.findFirst({ where });
  };

  /**
   * @async
   * @method
   * @param {SpecializationFilter} where
   * @returns {Promise<Specialization[]>}
   */
  async findMany(where) {
    return await this.prismaClient.specialization.findMany({ where });
  };

  /**
   * @async
   * @method
   * @param {SpecializationData} data
   * @returns {Promise<Specialization>}
   */
  async create(data) {
    return await this.prismaClient.specialization.create({ data });
  };

  /**
   * @async
   * @method
   * @param {SpecializationData[]} data
   * @returns {Promise<BatchPayload>}
   */
  async createMany(data) {
    return await this.prismaClient.specialization.createMany({ data });
  };

  /**
   * @async
   * @method
   * @param {SpecializationFilter} filter
   * @param {SpecializationData} data
   * @returns {Promise<BatchPayload>}
   */
  async update(filter, data) {
    return await this.prismaClient.specialization.updateMany({
      where: filter,
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {SpecializationFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async delete(filter) {
    return await this.prismaClient.specialization.deleteMany({
      where: filter,
    });
  };

  // Handling Sub-Specializations ----------------------------------------------------

  /**
   * @async
   * @method
   * @param {SubSpecializationFilter} filter
   * @returns {Promise<boolean>}
   */
  async existsSubSpecialization(filter) {
    return (await this.prismaClient.subSpecialization.count({ where: filter })) > 0;
  }

  /**
   * @async
   * @method
   * @param {SubSpecializationFilter} filter
   * @returns {Promise<SubSpecialization[]>}
   */
  async findSubSpecializations(filter) {
    return await this.prismaClient.subSpecialization.findMany({
      where: filter
    });
  };

  /**
   * @async
   * @method
   * @param {SubSpecializationFilter} filter
   * @param {SubSpecializationData} data
   * @returns {Promise<BatchPayload>}
   */
  async updateSubSpecializations(filter, data) {
    return await this.prismaClient.subSpecialization.updateMany({
      where: filter,
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {IDType} mainSpecializationId
   * @param {SubSpecializationData} data
   * @returns {Promise<BatchPayload>}
   */
  async createSubSpecializations(mainSpecializationId, data) {
    return await this.prismaClient.subSpecialization.createMany({
      data: {
        ...data,
        mainSpecializationId
      },
    });
  };

  /**
   * @async
   * @method
   * @param {SubSpecializationFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async deleteSubSpecializations(filter) {
    return await this.prismaClient.subSpecialization.deleteMany({
      where: filter
    });
  };

};
