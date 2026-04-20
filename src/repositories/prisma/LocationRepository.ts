import { Location } from '../../generated/prisma/client.js';
import { handlePrismaError, Repository } from './Repository.js';
import ILocationRepository from '../interfaces/LocationRepository.js';

export default class LocationRepository extends Repository implements ILocationRepository {
  async findById(id: string): Promise<Location | null> {
    try {
      return await this.prismaClient.location.findUnique({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error, 'find location by id');
    }
  }
}
