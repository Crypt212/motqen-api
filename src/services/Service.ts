/**
 * @fileoverview Base Service Class - Foundation for all service classes
 * @module services/Service
 */

import AppError from '../errors/AppError.js';

/**
 * Wrapper to catch errors and convert RepositoryError to AppError
 * @throws {AppError} If RepositoryError is caught, converts to AppError
 */
export const tryCatch = async (fn: Function): Promise<any> => {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof Error) throw new AppError(err.message, 500);
    throw err;
  }
};

/**
 * Base Service class providing common functionality for all services
 * @class
 */
export default class Service {
  public name = 'Service';
  public version = '1.0.0';
  constructor() {}
}
