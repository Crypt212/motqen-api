import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import IRepository from '../interfaces/Repository.js';

export type RepositoryConstructor<T> = new (prisma: PrismaClient | Prisma.TransactionClient) => T;

/**
 * A utility class to handle Prisma transactions generically across multiple repositories.
 * It instantiates temporary repository instances using the transaction client
 * so that any operations executed through them are safely part of the transaction.
 */
export class TransactionManager {
  constructor(private readonly prismaClient: PrismaClient) {}

  /**
   * Executes a database transaction and provides temporary repository instances.
   *
   * @param repositories A record mapping keys to repository class constructors.
   * @param callback A function containing the transaction logic, receiving the temporary repos and the tx client.
   * @param options Prisma transaction options (e.g. maxWait, timeout, isolationLevel).
   * @returns The result of the callback function.
   *
   * @example
   * ```typescript
   * await transactionManager.execute(
   *   { userRepo: UserRepository, profileRepo: ClientProfileRepository },
   *   async ({ userRepo, profileRepo }, tx) => {
   *     const user = await userRepo.create({ ... });
   *     await profileRepo.create({ userId: user.id, ... });
   *     return user;
   *   }
   * );
   * ```
   */
  public async execute<TRepos extends Record<string, RepositoryConstructor<IRepository>>, TResult>(
    repositories: TRepos,
    callback: (
      repos: { [K in keyof TRepos]: InstanceType<TRepos[K]> },
      tx: Prisma.TransactionClient
    ) => Promise<TResult>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    }
  ): Promise<TResult> {
    return await this.prismaClient.$transaction(async (tx) => {
      // Instantiate temporary repositories with the transaction client
      const repos = {} as { [K in keyof TRepos]: InstanceType<TRepos[K]> };

      for (const key of Object.keys(repositories) as Array<keyof TRepos>) {
        const RepoClass = repositories[key];
        repos[key] = new RepoClass(tx) as InstanceType<TRepos[typeof key]>;
      }

      // Execute the callback with the temporary repositories and the transaction context
      return await callback(repos, tx);
    }, options);
  }
}
