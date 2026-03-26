/**
 * @fileoverview Base Service Class - Foundation for all service classes
 * @module services/Service
 */

/**
 * Wrapper to catch errors and convert RepositoryError to AppError
 * @throws {AppError} If RepositoryError is caught, converts to AppError
 */
export const tryCatch = async <T>(fn: Function): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
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
