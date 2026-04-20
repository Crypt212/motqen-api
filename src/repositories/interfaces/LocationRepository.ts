import { Location } from '../../generated/prisma/client.js';

export default interface ILocationRepository {
  findById(id: string): Promise<Location | null>;
}
