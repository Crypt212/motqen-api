import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import {
  Admin,
  AdminCreateInput,
  AdminFilter,
  AdminUpdateInput,
} from '../../domain/admin.entity.js';
import { isEmptyFilter } from './utils.js';
import { PrismaClient } from '../../generated/prisma/client.js';

export default class AdminRepository extends Repository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: any): Admin {
    return {
      id: record.id,
      username: record.username,
      passwordHash: record.passwordHash,
      firstName: record.firstName,
      lastName: record.lastName,
      profileImageUrl: record.profileImageUrl ?? null,
      role: record.role,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async find(params: { filter: AdminFilter }): Promise<Admin | null> {
    try {
      const { filter } = params;
      const record = await (this.prismaClient as any).admin.findFirst({ where: filter });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findMany(params: {
    filter: AdminFilter;
    skip?: number;
    take?: number;
    orderBy?: Record<string, unknown>;
  }): Promise<Admin[]> {
    try {
      const { filter, skip, take, orderBy } = params;
      const records = await (this.prismaClient as any).admin.findMany({
        where: filter,
        skip,
        take,
        orderBy,
      });
      return records.map((record: any) => this.toDomain(record));
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findMany');
    }
  }

  async count(params: { filter: AdminFilter }): Promise<number> {
    try {
      const { filter } = params;
      return await (this.prismaClient as any).admin.count({ where: filter });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'count');
    }
  }

  async create(params: { admin: AdminCreateInput }): Promise<Admin> {
    try {
      const record = await (this.prismaClient as any).admin.create({
        data: {
          username: params.admin.username,
          passwordHash: params.admin.passwordHash,
          firstName: params.admin.firstName,
          lastName: params.admin.lastName,
          profileImageUrl: params.admin.profileImageUrl ?? null,
          role: params.admin.role,
          status: params.admin.status,
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async update(params: { filter: AdminFilter; admin: AdminUpdateInput }): Promise<Admin> {
    try {
      const { filter, admin } = params;
      if (isEmptyFilter(filter)) throw new Error('Update filter cannot be empty');

      const existing = await (this.prismaClient as any).admin.findFirst({ where: filter });
      if (!existing) throw new Error('Admin not found');

      const record = await (this.prismaClient as any).admin.update({
        where: { id: existing.id },
        data: {
          ...(admin.username !== undefined ? { username: admin.username } : {}),
          ...(admin.passwordHash !== undefined ? { passwordHash: admin.passwordHash } : {}),
          ...(admin.firstName !== undefined ? { firstName: admin.firstName } : {}),
          ...(admin.lastName !== undefined ? { lastName: admin.lastName } : {}),
          ...(admin.profileImageUrl !== undefined
            ? { profileImageUrl: admin.profileImageUrl }
            : {}),
          ...(admin.role !== undefined ? { role: admin.role } : {}),
          ...(admin.status !== undefined ? { status: admin.status } : {}),
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'update');
    }
  }

  async delete(params: { filter: AdminFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;
      const existing = await (this.prismaClient as any).admin.findFirst({ where: filter });
      if (!existing) return;
      await (this.prismaClient as any).admin.delete({ where: { id: existing.id } });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'delete');
    }
  }
}
