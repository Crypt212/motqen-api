import ISessionRepository from '../interfaces/SessionRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import { Session, SessionCreateInput, SessionFilter } from '../../domain/session.entity.js';
import { isEmptyFilter } from './utils.js';
import { PrismaClient } from '../../generated/prisma/client.js';

export default class SessionRepository extends Repository implements ISessionRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: Session): Session {
    return {
      id: record.id,
      userId: record.userId,
      token: record.token,
      isRevoked: record.isRevoked,
      deviceId: record.deviceId,
      ipAddress: record.ipAddress ?? '',
      userAgent: record.userAgent ?? '',
      lastUsedAt: record.lastUsedAt,
      expiresAt: record.expiresAt,
      updatedAt: record.updatedAt,
      createdAt: record.createdAt,
    };
  }

  async find(params: { filter: SessionFilter }): Promise<Session | null> {
    try {
      const { filter } = params;

      const record = await this.prismaClient.session.findFirst({
        where: filter,
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async create(params: { userId: IDType; session: SessionCreateInput }): Promise<Session> {
    try {
      const record = await this.prismaClient.session.create({
        data: {
          userId: params.userId,
          token: params.session.token,
          isRevoked: params.session.isRevoked ?? false,
          deviceId: params.session.deviceId,
          ipAddress: params.session.ipAddress,
          userAgent: params.session.userAgent,
          lastUsedAt: params.session.lastUsedAt,
          expiresAt: params.session.expiresAt,
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async delete(params: { filter: SessionFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;

      const existingSession = await this.prismaClient.session.findFirst({
        where: filter,
      });

      if (!existingSession) return;

      await this.prismaClient.session.delete({
        where: { id: existingSession.id },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'delete');
    }
  }

  async deleteMany(params: { filter: SessionFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;

      await this.prismaClient.session.deleteMany({
        where: filter,
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteMany');
    }
  }
}
