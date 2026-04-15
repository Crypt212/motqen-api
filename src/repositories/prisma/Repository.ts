import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import RepositoryError, { RepositoryErrorType } from '../../errors/RepositoryError.js';
import IRepository from '../interfaces/Repository.js';

/**
 * Handle Prisma errors and convert to RepositoryError
 */
export function handlePrismaError(error: unknown, operation: string): RepositoryError | unknown {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return error;

  const prismaError: Prisma.PrismaClientKnownRequestError = error;
  const errorCode = prismaError.code;
  const errorMessage = prismaError.message || error.message;

  // Handle unique constraint violation
  if (errorCode === 'P2002') {
    return new RepositoryError(
      `A record with this value already exists. Cannot ${operation}`,
      RepositoryErrorType.DUPLICATE_KEY
    );
  }

  // Handle record not found
  if (errorCode === 'P2025') {
    return new RepositoryError(
      `Record not found. Cannot ${operation}`,
      RepositoryErrorType.NOT_FOUND
    );
  }

  // Handle foreign key constraint failed
  if (errorCode === 'P2003') {
    return new RepositoryError(
      `Related record not found. Cannot ${operation}`,
      RepositoryErrorType.NOT_FOUND
    );
  }

  // Handle required relation not present
  if (errorCode === 'P2015') {
    return new RepositoryError(
      `Related record not found. Cannot ${operation}`,
      RepositoryErrorType.NOT_FOUND
    );
  }

  // Handle invalid ID format
  if (errorCode === 'P2000') {
    return new RepositoryError(
      `Invalid data format. Cannot ${operation}`,
      RepositoryErrorType.DATABASE_ERROR
    );
  }

  // Handle data validation errors
  if (errorCode === 'P2012') {
    return new RepositoryError(
      `Data validation failed. Cannot ${operation}`,
      RepositoryErrorType.INVALID
    );
  }

  // Default to database error
  return new RepositoryError(
    `Database error during ${operation}: ${errorMessage}`,
    RepositoryErrorType.DATABASE_ERROR
  );
}

/**
 * Base repository class with common functionality
 */
export class Repository implements IRepository {
  constructor(public prismaClient: PrismaClient | Prisma.TransactionClient) {}
}
