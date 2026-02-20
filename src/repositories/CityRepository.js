/**
 * @fileoverview City Repository - Handle database operations for cites
 * @module repositories/CityRepository
 */

import { Repository } from "./Repository.js";
import prisma from "../libs/database.js";

/** @typedef {import("./Repository.js").IDType} IDType */

/** @typedef {{name: String}} CityData */
/** @typedef {CityData | { id: IDType }} City */
/** @typedef {import("./Repository.js").FilterArgs<City>} CityFilter */


/**
 * City Repository - Handles all database operations for cities
 * @class
 * @extends Repository<City, CityData, CityFilter>
 */
export default class CityRepository extends Repository {
  constructor() {
    super(prisma.city);
  }
};
