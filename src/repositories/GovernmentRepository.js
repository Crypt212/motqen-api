/**
 * @fileoverview Government Repository - Handle database operations for governments
 * @module repositories/GovernmentRepository
 */

import { Repository } from "./Repository.js";
import prisma from "../libs/database.js";

/** @typedef {import("./Repository.js").IDType} IDType */

/** @typedef {{name: String}} GovernmentData */
/** @typedef {GovernmentData | { id: IDType }} Government */
/** @typedef {import("./Repository.js").FilterArgs<Government>} GovernmentFilter */


/**
 * Government Repository - Handles all database operations for governments
 * @class<Government, GovernmentData, GovernmentFilter>
 * @extends Repository
 */
export default class GovernmentRepository extends Repository {
  constructor() {
    super(prisma.government);
  }
};
