/**
 * @fileoverview Specialization Repository - Handle database operations for specializations
 * @module repositories/SpecializationRepository
 */

import { Repository } from "./Repository.js";
import prisma from "../../libs/database.js";


/** @typedef {import("./Repository.js").IDType} IDType */
/** @typedef {import("./Repository.js").BatchPayload} BatchPayload */

/** @typedef {{name: String}} SpecializationData */
/** @typedef {SpecializationData & { id: IDType }} Specialization */
/** @typedef {Partial<SpecializationData>} OptionalSpecializationData */
/** @typedef {import("./Repository.js").FilterArgs<Specialization>} SpecializationFilter */

/** @typedef {{name: String}} SubSpecializationData */
/** @typedef {SubSpecializationData & { id: IDType, mainSpecializationId: IDType }} SubSpecialization */
/** @typedef {import("./Repository.js").FilterArgs<SubSpecialization>} SubSpecializationFilter */


/**
 * Specialization Repository - Handles all database operations for specializations and their sub-specializations
 * @class
 * @extends Repository<SpecializationData, OptionalSpecializationData, Specialization, SpecializationFilter>
 */
export default class SpecializationRepository extends Repository {

  constructor() {
    super(prisma, "specialization");
  }

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
