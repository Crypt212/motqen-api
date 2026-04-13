import IClientProfileRepository from '../interfaces/ClientRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import {
  ClientProfile,
  ClientProfileCreateInput,
  ClientProfileFilter,
  ClientProfileUpdateInput,
} from '../../domain/clientProfile.entity.js';
import { isEmptyFilter } from './utils.js';
import { PrismaClient } from 'src/generated/prisma/client.js';

export default class ClientProfileRepository
  extends Repository
  implements IClientProfileRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: ClientProfile): ClientProfile {
    return {
      id: record.id,
      userId: record.userId,
      updatedAt: record.updatedAt,
      createdAt: record.createdAt,
    };
  }

  async find(params: { filter: ClientProfileFilter }): Promise<ClientProfile | null> {
    try {
      const { filter } = params;

      const record = await this.prismaClient.clientProfile.findFirst({
        where: filter,
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async exists(params: { filter: ClientProfileFilter }): Promise<boolean> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return false;

      const count = await this.prismaClient.clientProfile.count({
        where: filter,
      });
      return count > 0;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'exists');
    }
  }

  async create(params: {
    userId: IDType;
    clientProfile: ClientProfileCreateInput;
  }): Promise<ClientProfile> {
    try {
      const record = await this.prismaClient.clientProfile.create({
        data: {
          userId: params.userId,
          ...params.clientProfile,
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async update(params: {
    filter: ClientProfileFilter;
    clientProfile: ClientProfileUpdateInput;
  }): Promise<ClientProfile> {
    try {
      const { filter, clientProfile } = params;
      if (isEmptyFilter(filter)) {
        throw new Error('Client profile not found');
      }

      const existingProfile = await this.prismaClient.clientProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) {
        throw new Error('Client profile not found');
      }

      const updated = await this.prismaClient.clientProfile.update({
        where: { id: existingProfile.id },
        data: clientProfile,
      });
      return this.toDomain(updated);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'update');
    }
  }

  async delete(params: { filter: ClientProfileFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.clientProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      await this.prismaClient.clientProfile.delete({
        where: { id: existingProfile.id },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'delete');
    }
  }
}
