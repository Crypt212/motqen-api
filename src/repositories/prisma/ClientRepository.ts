import IClientProfileRepository from '../interfaces/ClientRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import {
  ClientProfile,
  ClientProfileCreateInput,
  ClientProfileFilter,
  ClientProfileUpdateInput,
  Location,
  LocationCreateInput,
  LocationUpdateInput,
} from '../../domain/clientProfile.entity.js';
import { isEmptyFilter } from './utils.js';
import { PrismaClient } from '@prisma/client';

export default class ClientProfileRepository extends Repository implements IClientProfileRepository {
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

  private toDomainLocation(record: Location): Location {
    return {
      id: record.id,
      clientProfileId: record.clientProfileId,
      governmentId: record.governmentId,
      cityId: record.cityId,
      address: record.address,
      addressNotes: record.addressNotes,
      isMain: record.isMain,
    };
  }

  async find(params: { filter: ClientProfileFilter }): Promise<ClientProfile | null> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return null;

      const record = await this.prismaClient.clientProfile.findFirst({
        where: filter,
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findWithPrimaryLocation(params: {
    filter: ClientProfileFilter;
  }): Promise<(ClientProfile & { location: Location }) | null> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return null;

      const userWithLocation = await this.prismaClient.clientProfile.findFirst({
        where: filter,
        include: {
          locations: {
            where: {
              isMain: true,
            },
          },
        },
      });
      if (!userWithLocation || userWithLocation.locations.length === 0) return null;

      const location = userWithLocation.locations[0];
      return {
        ...this.toDomain(userWithLocation),
        location: this.toDomainLocation(location),
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findWithPrimaryLocation');
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
          ...(params.clientProfile),
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async createWithPrimaryLocation(params: {
    userId: IDType;
    clientProfile: ClientProfileCreateInput;
    location: LocationCreateInput;
  }): Promise<ClientProfile & { location: Location }> {
    try {
      const clientProfile = await this.prismaClient.clientProfile.create({
        data: {
          userId: params.userId,
          ...(params.clientProfile),
          locations: {
            create: {
              ...(params.location),
            },
          },
        },
        include: {
          locations: {
            where: { isMain: true },
            take: 1,
          },
        },
      });

      const location = clientProfile.locations[0];
      return {
        ...this.toDomain(clientProfile),
        location: this.toDomainLocation(location),
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'createWithPrimaryLocation');
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

  async updateWithPrimaryLocation(params: {
    filter: ClientProfileFilter;
    clientProfile: ClientProfileUpdateInput;
    location: LocationUpdateInput;
  }): Promise<ClientProfile & { location: Location }> {
    try {
      const { filter, clientProfile, location } = params;
      if (isEmptyFilter(filter)) {
        throw new Error('Client profile not found');
      }

      const existingProfile = await this.prismaClient.clientProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) {
        throw new Error('Client profile not found');
      }

      const mainLocation = await this.prismaClient.location.findFirst({
        where: {
          clientProfileId: existingProfile.id,
          isMain: true,
        },
      });

      if (!mainLocation) {
        throw new Error('Primary location not found');
      }

      await this.prismaClient.location.update({
        where: { id: mainLocation.id },
        data: location,
      });

      const updated = await this.prismaClient.clientProfile.update({
        where: { id: existingProfile.id },
        data: clientProfile,
      });

      return {
        ...this.toDomain(updated),
        location: this.toDomainLocation(mainLocation),
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updateWithPrimaryLocation');
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
