import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../libs/database.js';
import RepositoryError, {
  RepositoryErrorType,
} from '../../errors/RepositoryError.js';

/**
 * @template T
 * @typedef {{
 *   [K in keyof T]?:
 *     T[K] | { in: T[K] extends Array<infer U> ? U[] : T[K][] }
 * }} FilterArgs
 */

/**
 * Pagination options for queries
 * @typedef {{
 *   page?: number;
 *   limit?: number;
 * }} PaginationOptions
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
 * @template T
 * @typedef {{
 *   data: T[];
 *   pagination?: {
 *     page: number;
 *     limit: number;
 *     total: number;
 *     totalPages: number;
 *     hasNext: boolean;
 *     hasPrev: boolean;
 *   };
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

  /** @type {Prisma.PrismaClientKnownRequestError} */
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
 * @template CreateInput, UpdateInput, WhereInput, SelectInput, OutputData
 */
export class Repository {
  #defaultPrismaClient;
  #modelName;

  /** @type {PrismaClient | Prisma.TransactionClient} */
  prismaClient;

  /**
   * @param {PrismaClient} prismaClient
   * @param {keyof typeof prisma} modelName
   */
  constructor(prismaClient = prisma, modelName) {
    this.#defaultPrismaClient = prismaClient;
    this.#modelName = modelName;
    this.prismaClient = this.#defaultPrismaClient;
  }

  /**
   * @param {Prisma.TransactionClient} transaction
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
   * Find a single record
   * @param {WhereInput | {}} where - Where clause
   * @param {SelectInput | undefined} select - Fields to select
   * @returns {Promise<OutputData | null>}
   * @throws {RepositoryError}
   */
  async findFirst(where = {}, select = undefined) {
    try {
      return await this.prismaClient[this.#modelName].findFirst({
        where,
        select,
      });
    } catch (error) {
      throw handlePrismaError(error, 'findFirst');
    }
  }

  /**
   * Find a single record by unique ID
   * @param {string} id - Record ID
   * @param {SelectInput | undefined} select - Fields to select
   * @returns {Promise<OutputData | null>}
   * @throws {RepositoryError}
   */
  async findById(id, select = undefined) {
    try {
      return await this.prismaClient[this.#modelName].findUnique({
        where: { id },
        select,
      });
    } catch (error) {
      throw handlePrismaError(error, 'findById');
    }
  }

  /**
   * Find many records with flexible filtering, pagination, and ordering
   * This is the main method that combines all query capabilities
   * @param {Object} params - Query parameters
   * @param {WhereInput | {}} [params.where={}] - Where clause for filtering
   * @param {SelectInput | undefined} [params.select] - Fields to select
   * @param {PaginationOptions} [params.pagination] - Pagination options (page, limit)
   * @param {OrderingOptions[]} [params.orderBy=[]] - Ordering options (field, order)
   * @param {string[]} [params.include=[]] - Relations to include
   * @param {boolean} [params.paginate=false] - Whether to return paginated results
   * @returns {Promise<PaginatedResult<OutputData>>}
   * @throws {RepositoryError}
   */
  async findMany({
    where = {},
    select = undefined,
    pagination = { page: 1, limit: 20 },
    orderBy = [],
    include = [],
    paginate = false,
  } = {}) {
    try {
      return Repository.performFindManyQuery({
        prismaModel: this.prismaClient[this.#modelName],
        parentQueryParameters: {},
        orderBy,
        filter: where,
        paginate,
        pagination,
        include,
        select,
        mapFunction: (x) => x,
      });
    } catch (error) {
      throw handlePrismaError(error, 'findMany');
    }
  }

  // Legacy alias for backward compatibility
  /**
   * @deprecated Use findMany with pagination, orderBy instead
   * @param {WhereInput | {}} where - Where clause
   * @param {SelectInput | undefined} select - Fields to select
   * @returns {Promise<OutputData[]>}
   */
  async findManySimple(where = {}, select = undefined) {
    return this.prismaClient[this.#modelName].findMany({ where, select });
  }

  /**
   * @param {CreateInput} data - Data to create
   * @returns {Promise<OutputData | null>}
   * @throws {RepositoryError}
   */
  async create(data) {
    try {
      return await this.prismaClient[this.#modelName].create({ data });
    } catch (error) {
      throw handlePrismaError(error, 'create');
    }
  }

  /**
   * @param {CreateInput[]} data - Array of data to create
   * @returns {Promise<BatchPayload>}
   * @throws {RepositoryError}
   */
  async createMany(data) {
    try {
      return await this.prismaClient[this.#modelName].createMany({ data });
    } catch (error) {
      throw handlePrismaError(error, 'createMany');
    }
  }

  /**
   * @param {UpdateInput} data - Data to update
   * @param {WhereInput | {}} where - Where clause
   * @returns {Promise<OutputData>}
   * @throws {RepositoryError}
   */
  async update(data, where = {}) {
    try {
      return await this.prismaClient[this.#modelName].update({ where, data });
    } catch (error) {
      throw handlePrismaError(error, 'update');
    }
  }

  /**
   * @param {UpdateInput} data - Data to update
   * @param {WhereInput | {}} where - Where clause
   * @returns {Promise<BatchPayload>}
   * @throws {RepositoryError}
   */
  async updateMany(data, where = {}) {
    try {
      return await this.prismaClient[this.#modelName].updateMany({
        where,
        data,
      });
    } catch (error) {
      throw handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * @param {IDType} id - Record ID
   * @param {UpdateInput} data - Data to update
   * @returns {Promise<OutputData>}
   * @throws {RepositoryError}
   */
  async updateById(id, data) {
    try {
      return await this.prismaClient[this.#modelName].update({
        where: { id },
        data,
      });
    } catch (error) {
      throw handlePrismaError(error, 'updateById');
    }
  }

  /**
   * @param {WhereInput | {}} where - Where clause
   * @returns {Promise<OutputData>}
   * @throws {RepositoryError}
   */
  async delete(where = {}) {
    try {
      return await this.prismaClient[this.#modelName].delete({ where });
    } catch (error) {
      throw handlePrismaError(error, 'delete');
    }
  }

  /**
   * @param {WhereInput | {}} where - Where clause
   * @returns {Promise<BatchPayload>}
   * @throws {RepositoryError}
   */
  async deleteMany(where = {}) {
    try {
      return await this.prismaClient[this.#modelName].deleteMany({ where });
    } catch (error) {
      throw handlePrismaError(error, 'deleteMany');
    }
  }

  /**
   * @param {IDType} id - Record ID
   * @returns {Promise<OutputData>}
   * @throws {RepositoryError}
   */
  async deleteById(id) {
    try {
      return await this.prismaClient[this.#modelName].delete({ where: { id } });
    } catch (error) {
      throw handlePrismaError(error, 'deleteById');
    }
  }

  /**
   * @param {WhereInput | {}} where - Where clause
   * @returns {Promise<boolean>}
   * @throws {RepositoryError}
   */
  async exists(where = {}) {
    try {
      return (await this.prismaClient[this.#modelName].count({ where })) > 0;
    } catch (error) {
      throw handlePrismaError(error, 'exists');
    }
  }

  /**
   * @param {WhereInput | {}} [where={}] - Where clause
   * @returns {Promise<number>}
   * @throws {RepositoryError}
   */
  async count(where = {}) {
    try {
      return await this.prismaClient[this.#modelName].count({ where });
    } catch (error) {
      throw handlePrismaError(error, 'count');
    }
  }

  /**
   * @template WhereInput
   * @template SelectInput
   * @template OutputData
   * Find many records with flexible filtering, pagination, and ordering
   * This is the main method that combines all query capabilities
   * @param {Object} params - Query parameters
   * @param {any} params.prismaModel - Prisma model
   * @param {WhereInput | {}} params.filter - Filter clause
   * @param {WhereInput | {}} params.parentQueryParameters - Parent query parameters
   * @param {OrderingOptions[]} [params.orderBy] - Ordering options (field, direction)
   * @param {boolean} [params.paginate] - Whether to return paginated results
   * @param {PaginationOptions} [params.pagination] - Pagination options (page, limit)
   * @param {string[]} [params.include] - Relations to include
   * @param {SelectInput} [params.select] - Fields to select
   * @param {function(any): any} [params.mapFunction] - Function to map each record
   * @returns {Promise<PaginatedResult<OutputData>>}
   * @throws {RepositoryError}
   */
  static async performFindManyQuery({
    prismaModel,
    parentQueryParameters,
    orderBy = [],
    filter = {},
    paginate = false,
    pagination,
    include = [],
    select = undefined,
    mapFunction = (x) => x,
  }) {
    try {
      const where = { ...parentQueryParameters, ...filter };

      /** @type {{ [x: string]: 'asc' | 'desc'}[] | { createdAt: 'asc' }} */
      const orderByClause =
        orderBy.length > 0
          ? orderBy
              .map(({ field, direction }) => {
                const order = direction?.toLowerCase();
                if (order === 'asc' || order === 'desc') {
                  return { [field]: order };
                }
                return undefined;
              })
              .filter(Boolean)
          : [{ createdAt: 'asc' }];

      let data = [],
        paginationResult = undefined;

      if (paginate) {
        pagination.page = Math.min(pagination.page || 1, 1);
        pagination.limit = Math.min(pagination.limit || 20, 1);
        const skip = (pagination.page - 1) * pagination.limit;

        data = await prismaModel.findMany({
          where,
          skip,
          take: pagination.limit,
          orderBy: orderByClause,
          include,
          select,
        });

        let total = await prismaModel.count({ where });

        paginationResult = {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
          hasNext: pagination.page * pagination.limit < total,
          hasPrev: pagination.page > 1,
        };
      } else {
        data = await prismaModel.findMany({
          where,
          orderBy: orderByClause,
          include,
          select,
        });
      }

      data = data.map(mapFunction);

      return {
        data,
        pagination: paginationResult,
      };
    } catch (error) {
      throw handlePrismaError(error, 'performFindManyQuery');
    }
  }
}
