import pkg from '@prisma/client';
const { Prisma } = pkg;
import prisma from '../../libs/database.js';
import RepositoryError, {
  RepositoryErrorType,
} from '../../errors/RepositoryError.js';

/**
 * Pagination options for queries
 * @typedef {{
 *   page?: number;
 *   limit?: number;
 * } | undefined} PaginationOptions
 */

/**
 * Ordering options for queries
 * @typedef {{
 *   field: string;
 *   direction?: 'asc' | 'desc';
 * }} OrderingOptions
 */

/**
 * Query options combining filter, pagination, and ordering
 * @typedef {{
 *   where?: Record<string, any>;
 *   select?: Record<string, any>;
 *   include?: string[];
 *   pagination?: PaginationOptions;
 *   orderBy?: OrderingOptions[];
 * }} QueryOptions
 */

/**
 * Paginated result wrapper
 * @typedef {{
 *     page: number;
 *     limit: number;
 *     total: number;
 *     totalPages: number;
 *     hasNext: boolean;
 *     hasPrev: boolean;
 * }} PaginatedResult
 */

/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */

/** @typedef {String} IDType */

/**
 * Handle Prisma errors and convert to RepositoryError
 * @param {Error} error - The Prisma error
 * @param {string} operation - The operation that failed
 * @throws {RepositoryError}
 */
export function handlePrismaError(error, operation) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;

  /** @type {pkg.Prisma.PrismaClientKnownRequestError} */
  const prismaError = error;
  const errorCode = prismaError.code;
  const errorMessage = prismaError.message || error.message;

  // Handle unique constraint violation
  if (errorCode === 'P2002') {
    throw new RepositoryError(
      `A record with this value already exists. Cannot ${operation}`,
      RepositoryErrorType.DUPLICATE_KEY,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle record not found
  if (errorCode === 'P2025') {
    throw new RepositoryError(
      `Record not found. Cannot ${operation}`,
      RepositoryErrorType.NOT_FOUND,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle foreign key constraint failed
  if (errorCode === 'P2003') {
    throw new RepositoryError(
      `Related record not found. Cannot ${operation}`,
      RepositoryErrorType.NOT_FOUND,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle required relation not present
  if (errorCode === 'P2015') {
    throw new RepositoryError(
      `Related record not found. Cannot ${operation}`,
      RepositoryErrorType.NOT_FOUND,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle invalid ID format
  if (errorCode === 'P2000') {
    throw new RepositoryError(
      `Invalid data format. Cannot ${operation}`,
      RepositoryErrorType.DATABASE_ERROR,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle data validation errors
  if (errorCode === 'P2012') {
    throw new RepositoryError(
      `Data validation failed. Cannot ${operation}`,
      RepositoryErrorType.INVALID,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Default to database error
  throw new RepositoryError(
    `Database error during ${operation}: ${errorMessage}`,
    RepositoryErrorType.DATABASE_ERROR,
    { originalError: errorMessage, prismaCode: errorCode }
  );
}

/**
 * Base repository class with common functionality
 */
export class Repository {
  #defaultPrismaClient;

  /** @type {pkg.PrismaClient | pkg.Prisma.TransactionClient} */
  prismaClient;

  /**
   * @param {pkg.PrismaClient} prismaClient
   */
  constructor(prismaClient = prisma) {
    this.#defaultPrismaClient = prismaClient;
    this.prismaClient = this.#defaultPrismaClient;
  }

  /**
   * @param {pkg.Prisma.TransactionClient} transaction
   */
  useTransaction(transaction) {
    this.prismaClient = transaction;
  }

  resetPrismaClient() {
    this.prismaClient = this.#defaultPrismaClient;
  }

  /**
   * @param {Repository[]} repositories
   * @param {function(): Promise<T>} transactionHandler
   * @param {function(any): Promise<void>} catchHandler
   * @returns {Promise<T | undefined>}
   * @template T
   */
  static async createTransaction(
    repositories,
    transactionHandler,
    catchHandler
  ) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        repositories.forEach((repository) => repository.useTransaction(tx));
        return await transactionHandler();
      });

      // Reset all repositories after successful transaction
      repositories.forEach((repository) => repository.resetPrismaClient());
      return result;
    } catch (error) {
      repositories.forEach((repository) => repository.resetPrismaClient());
      await catchHandler(error);
    }
  }

  /**
   * Handle pagination logic
   * @param {Object} params - Pagination parameters
   * @param {number} params.total - Total number of records
   * @param {PaginationOptions} params.pagination - Pagination options (page, limit)
   * @returns {{ paginationResult: PaginatedResult, paginationQuery: {skip: number, take: number}}}
   */
  static handlePagination({ total, pagination }) {
    try {
      pagination.page = Math.max(pagination.page || 1, 1);
      pagination.limit = Math.max(pagination.limit || 20, 1);
      const skip = (pagination.page - 1) * pagination.limit;

      return {
        paginationQuery: {
          skip,
          take: pagination.limit,
        },
        paginationResult: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
          hasNext: pagination.page * pagination.limit < total,
          hasPrev: pagination.page > 1,
        },
      };
    } catch (error) {
      throw handlePrismaError(error, 'handlePagination');
    }
  }

  /**
   * Handle ordering logic
   * @param {OrderingOptions[]} orderBy - Ordering options (field, direction)
   * @returns {{ [x: string]: 'asc' | 'desc'}[]}
   */
  static handleOrder(orderBy) {
    if (!orderBy) return [];
    return orderBy
      .map(({ field, direction }) => {
        const order = direction;
        return { [field]: order };
      })
      .filter(Boolean);
  }
}
