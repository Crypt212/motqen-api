import pkg from '@prisma/client';
const { Prisma } = pkg;
import RepositoryError, {
  RepositoryErrorType,
} from '../../errors/RepositoryError.js';
import IRepository from '../interfaces/Repository.js';

/**
 * Handle Prisma errors and convert to RepositoryError
 * @param {Error} error - The Prisma error
 * @param {string} operation - The operation that failed
 * @throws {RepositoryError}
 */
export function handlePrismaError(error: Error, operation: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return error;

  const prismaError: pkg.Prisma.PrismaClientKnownRequestError = error;
  const errorCode = prismaError.code;
  const errorMessage = prismaError.message || error.message;

  // Handle unique constraint violation
  if (errorCode === 'P2002') {
    return new RepositoryError(
      `A record with this value already exists. Cannot ${operation}`,
      RepositoryErrorType.DUPLICATE_KEY,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle record not found
  if (errorCode === 'P2025') {
    return new RepositoryError(
      `Record not found. Cannot ${operation}`,
      RepositoryErrorType.NOT_FOUND,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle foreign key constraint failed
  if (errorCode === 'P2003') {
    return new RepositoryError(
      `Related record not found. Cannot ${operation}`,
      RepositoryErrorType.NOT_FOUND,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle required relation not present
  if (errorCode === 'P2015') {
    return new RepositoryError(
      `Related record not found. Cannot ${operation}`,
      RepositoryErrorType.NOT_FOUND,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle invalid ID format
  if (errorCode === 'P2000') {
    return new RepositoryError(
      `Invalid data format. Cannot ${operation}`,
      RepositoryErrorType.DATABASE_ERROR,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Handle data validation errors
  if (errorCode === 'P2012') {
    return new RepositoryError(
      `Data validation failed. Cannot ${operation}`,
      RepositoryErrorType.INVALID,
      { originalError: errorMessage, prismaCode: errorCode }
    );
  }

  // Default to database error
  return new RepositoryError(
    `Database error during ${operation}: ${errorMessage}`,
    RepositoryErrorType.DATABASE_ERROR,
    { originalError: errorMessage, prismaCode: errorCode }
  );
}

/**
 * Base repository class with common functionality
 */
export class Repository implements IRepository {
  constructor(
    public prismaClient: pkg.PrismaClient | pkg.Prisma.TransactionClient,

  ) { }
}
