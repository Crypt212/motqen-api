/**
 * @fileoverview Base Service Class - Foundation for all service classes
 * @module services/Service
 */

/**
 * Invoke an async function with proper type inference.
 * Exists as a uniform call-site pattern across services — kept
 * intentionally thin so adding cross-cutting concerns (logging,
 * error mapping) later is a single-point change.
 */
export const tryCatch = <T>(fn: () => Promise<T>): Promise<T> => fn();

/**
 * Base Service class providing common functionality for all services
 * @class
 */
export default class Service {
  public name = 'Service';
  public version = '1.0.0';
  constructor() {}
}
