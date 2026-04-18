import { PrismaClient } from '../../generated/prisma/client.js';
import IFlaggedMessageRepository from '../interfaces/FlaggedMessageRepository.js';
import { FlaggedMessage, FlaggedMessageCreateInput } from '../../domain/flaggedMessage.entity.js';
import RepositoryError, { RepositoryErrorType } from '../../errors/RepositoryError.js';

export default class FlaggedMessageRepository implements IFlaggedMessageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(params: { flaggedMessage: FlaggedMessageCreateInput }): Promise<FlaggedMessage> {
    try {
      return await this.prisma.flaggedMessage.create({
        data: params.flaggedMessage,
      });
    } catch (error) {
      throw new RepositoryError(
        'Failed to create FlaggedMessage',
        RepositoryErrorType.DATABASE_ERROR
      );
    }
  }
}
