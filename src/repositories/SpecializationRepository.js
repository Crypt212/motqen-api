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

  /**
   * @async
   * @method
   * @param {SpecializationFilter} where
   * @returns {Promise<boolean>}
   */
  async exists(where) {
    return (await prisma.specialization.count({ where })) > 0;
  }


  /**
   * @async
   * @method
   * @param {SpecializationFilter} where
   * @returns {Promise<Specialization|null>}
   */
  async findOne(where) {
    return await prisma.specialization.findFirst({ where });
  };

  /**
   * @async
   * @method
   * @param {SpecializationFilter} where
   * @returns {Promise<Specialization[]>}
   */
  async findMany(where) {
    return await prisma.specialization.findMany({ where });
  };

  /**
   * @async
   * @method
   * @param {SpecializationData} data
   * @returns {Promise<Specialization>}
   */
  async create(data) {
    return await prisma.specialization.create({ data });
  };

  /**
   * @async
   * @method
   * @param {SpecializationData[]} data
   * @returns {Promise<BatchPayload>}
   */
  async createMany(data) {
    return await prisma.specialization.createMany({ data });
  };

  /**
   * @async
   * @method
   * @param {SpecializationFilter} filter
   * @param {SpecializationData} data
   * @returns {Promise<BatchPayload>}
   */
  async update(filter, data) {
    return await prisma.specialization.updateMany({
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
    return await prisma.specialization.deleteMany({
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
    return (await prisma.subSpecialization.count({ where: filter })) > 0;
  }

  /**
   * @async
   * @method
   * @param {SubSpecializationFilter} filter
   * @returns {Promise<SubSpecialization[]>}
   */
  async findSubSpecializations(filter) {
    return await prisma.subSpecialization.findMany({
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
    return await prisma.subSpecialization.updateMany({
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
    return await prisma.subSpecialization.createMany({
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
    return await prisma.subSpecialization.deleteMany({
      where: filter
    });
  };

};
