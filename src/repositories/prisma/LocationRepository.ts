import ILocationRepository from '../interfaces/LocationRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { isEmptyFilter } from './utils.js';
import {
  Location,
  LocationCreateInput,
  LocationFilter,
  LocationUpdateInput,
} from '../../domain/location.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import { PrismaClient, Prisma } from '../../generated/prisma/client.js';

export default class LocationRepository extends Repository implements ILocationRepository {
  constructor(
    prisma: PrismaClient | import('../../generated/prisma/client.js').Prisma.TransactionClient
  ) {
    super(prisma);
  }

  private toDomain(record: Location): Location {
    return {
      id: record.id,
      userId: record.userId,
      government: record.government,
      city: record.city,
      address: record.address,
      addressNotes: record.addressNotes,
      long: record.long,
      lat: record.lat,
      isMain: record.isMain,
      isHidden: record.isHidden,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async exists({ filter }: { filter: LocationFilter }): Promise<boolean> {
    try {
      if (isEmptyFilter(filter)) return false;
      const count = await this.prismaClient.location.count({
        where: filter as Prisma.LocationWhereInput,
      });
      return count > 0;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'exists');
    }
  }

  async isConnectedToOrder({ locationId }: { locationId: string }): Promise<boolean> {
    try {
      const count = await this.prismaClient.order.count({
        where: { locationId: locationId, orderStatus: { notIn: ['COMPLETED', 'CANCELLED'] } },
      });
      return count > 0;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'isConnectedToOrder');
    }
  }

  async count({ filter }: { filter: LocationFilter }): Promise<number> {
    try {
      if (isEmptyFilter(filter)) return 0;
      return await this.prismaClient.location.count({ where: filter as Prisma.LocationWhereInput });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'count');
    }
  }

  async find({ filter }: { filter: LocationFilter }): Promise<Location | null> {
    try {
      let query = `
      SELECT l.id, l."userId", l."governmentId", l."cityId", l.address,
             l."addressNotes", l."isMain",
             ST_X(l."pointGeography"::geometry) as long,
             ST_Y(l."pointGeography"::geometry) as lat,
             l."createdAt", l."updatedAt",
        jsonb_build_object('id', g.id, 'name', g.name, 'nameAr', 'g.nameAr', 'long', g.long, 'lat', g.lat) as government,
        jsonb_build_object('id', c.id, 'name', c.name, 'nameAr', 'c.nameAr', 'long', c.long, 'lat', c.lat) as city
      FROM locations l
      LEFT JOIN governments g ON l."governmentId" = g.id
      LEFT JOIN cities c ON l."cityId" = c.id
    `;

      const values: any[] = [];

      if (!isEmptyFilter(filter)) {
        const conditions: string[] = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(filter)) {
          conditions.push(`l."${key}" = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }

        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ';';

      const records = await this.prismaClient.$queryRawUnsafe<Location[]>(query, ...values);

      if (!records || records.length === 0) return null;
      return this.toDomain(records[0]);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findMany({
    filter,
    pagination,
    sort,
  }: {
    filter: LocationFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Location>;
  }): Promise<PaginatedResultMeta & { locations: Location[] }> {
    try {
      const total = await this.prismaClient.location.count({
        where: filter as Prisma.LocationWhereInput,
      });

      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });
      const sortQuery = sort
        ? handleSort(sort)
        : [{ isMain: 'desc' as 'asc' | 'desc' }, { createdAt: 'desc' as 'asc' | 'desc' }];

      const ids = await this.prismaClient.location.findMany({
        where: filter as Prisma.LocationWhereInput,
        select: { id: true },
        ...paginationQuery,
        orderBy: sortQuery,
      });

      if (ids.length === 0) {
        return {
          locations: [],
          ...paginationResult,
          count: 0,
          hasNext: false,
          hasPrev: false,
        };
      }

      let orderByClause = '"isMain" DESC, "createdAt" DESC';

      if (Array.isArray(sortQuery) && sortQuery.length > 0) {
        orderByClause = sortQuery
          .map((item) => {
            const [key, value] = Object.entries(item)[0];
            return `"${key}" ${value.toUpperCase()} `;
          })
          .join(', ');
      }

      const records = await this.prismaClient.$queryRaw<Location[]>`
      SELECT
      l.id, l."userId", l."governmentId", l."cityId", l.address, l."addressNotes", l."isMain", l."createdAt", l."updatedAt", ST_X(l."pointGeography":: geometry) as long, ST_Y(l."pointGeography":: geometry) as lat,
        --Government data
      jsonb_build_object('id', g.id, 'name', g.name, 'nameAr', g."nameAr", 'long', g.long, 'lat', g.lat) as government,
        --City data
      jsonb_build_object('id', c.id, 'name', c.name, 'nameAr', c."nameAr", 'long', c.long, 'lat', c.lat, 'governmentId', c."governmentId") as city
  FROM locations l
  LEFT JOIN governments g ON l."governmentId" = g.id
  LEFT JOIN cities c ON l."cityId" = c.id
  WHERE l.id IN(${Prisma.join(ids.map((i) => i.id))})
  ORDER BY ${Prisma.raw(orderByClause)}
      `;

      return {
        locations: records.map((r) => this.toDomain(r)),
        ...paginationResult,
        count: records.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findMany');
    }
  }

  async create({
    location,
  }: {
    location: LocationCreateInput & { userId: string };
  }): Promise<Location> {
    try {
      const { userId, governmentId, cityId, address, addressNotes, long, lat, isMain } = location;

      const record = (
        await this.prismaClient.$queryRaw<Location[]>`
    INSERT INTO locations(id, "userId", "governmentId", "cityId", address, "addressNotes", "isMain", "pointGeography", "createdAt", "updatedAt")
      VALUES(gen_random_uuid(), ${userId}, ${governmentId}, ${cityId}, ${address}, ${addressNotes}, ${isMain}, ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING
      id, "userId", "governmentId", "cityId", address, "addressNotes", "isMain", "createdAt", "updatedAt", ST_X("pointGeography":: geometry) AS long, ST_Y("pointGeography":: geometry) AS lat,
        (SELECT jsonb_build_object('id', g.id, 'name', g.name, 'nameAr', 'g.nameAr', 'long', g.long, 'lat', g.lat) FROM governments g WHERE g.id = ${governmentId}) AS government,
          (SELECT jsonb_build_object('id', c.id, 'name', c.name, 'nameAr', 'c.nameAr', 'long', c.long, 'lat', c.lat, 'governmentId', c."governmentId") FROM cities c WHERE c.id = ${cityId}) AS city
            `
      )[0];

      // Set pointGeography via raw SQL
      await this.prismaClient.$executeRaw`
        UPDATE locations
        SET "pointGeography" = ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326)
        WHERE id = ${record.id}
      `;

      console.log(record);
      return this.find({ filter: { id: record.id } }) as Promise<Location>;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async update({
    filter,
    location,
  }: {
    filter: LocationFilter;
    location: LocationUpdateInput;
  }): Promise<Location> {
    try {
      const { long, lat, ...data } = location;

      const record = await this.prismaClient.location.update({
        where: filter as Prisma.LocationWhereUniqueInput,
        data: data as Prisma.LocationUpdateInput,
      });

      if (long !== undefined && lat !== undefined) {
        await this.prismaClient.$executeRaw`
          UPDATE locations
          SET "pointGeography" = ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326)
          WHERE id = ${record.id}
      `;
      }

      return this.find({ filter: { id: record.id } }) as Promise<Location>;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'update');
    }
  }

  async setAllNonMain({ userId }: { userId: string }): Promise<void> {
    try {
      await this.prismaClient.location.updateMany({
        where: { userId },
        data: { isMain: false },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'setAllNonMain');
    }
  }

  async findNextForPromotion({
    userId,
    excludeId,
  }: {
    userId: string;
    excludeId: string;
  }): Promise<Location | null> {
    try {
      const record = await this.prismaClient.location.findFirst({
        where: { userId, id: { not: excludeId } },
        orderBy: { createdAt: 'desc' },
      });

      if (!record) return null;
      return this.find({ filter: { id: record.id } });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findNextForPromotion');
    }
  }
}
