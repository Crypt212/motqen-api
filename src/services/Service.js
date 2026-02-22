/**
 * @fileoverview Base Service Class - Foundation for all service classes
 * @module services/Service
 */

import AppError from "../errors/AppError.js";
import RepositoryError from "../errors/RepositoryError.js";

/**
 * Wrapper to catch errors and convert RepositoryError to AppError
 * @async
 * @function tryCatch
 * @param {Function} fn - Async function to execute
 * @returns {Promise<*>} Result of the function
 * @throws {AppError} If RepositoryError is caught, converts to AppError
 */
export const tryCatch = async (fn) => {
    try {
        return await fn();
    } catch (err) {
        if (err instanceof RepositoryError) {
            const statusCode = err.getStatusCode();
            throw new AppError(err.message, statusCode, err.info);
        }
        if (err instanceof AppError) throw err;
        if (err instanceof Error) throw new AppError(err.message, 500);
        throw err;
    }
}

/**
 * Base Service class providing common functionality for all services
 * @class
 */
export default class Service {
    /**
     * Create a new Service instance
     * @constructor
     */
    constructor() {
        this.name = "Service";
        this.version = "1.0.0";
    }
}
