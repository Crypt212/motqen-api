import { handlePrismaError, Repository } from './Repository.js';
import IWorkerOccupiedTimeSlotRepository from '../interfaces/WorkerOccupiedTimeSlotRepository.js';
import {
  WorkerOccupiedTimeSlot,
  WorkerOccupiedTimeSlotCreateInput,
  WorkerOccupiedTimeSlotFilter,
} from '../../domain/workerOccupiedTimeSlot.entity.js';
import { Prisma } from 'src/generated/prisma/client.js';
import { IDType } from '../interfaces/Repository.js';

type PrismaWorkerOccupiedTimeSlot = Prisma.WorkerOccupiedTimeSlotGetPayload<{}>;

export default class WorkerOccupiedTimeSlotRepository
  extends Repository
  implements IWorkerOccupiedTimeSlotRepository
{
  private toDomain(record: PrismaWorkerOccupiedTimeSlot): WorkerOccupiedTimeSlot {
    return {
      id: record.id,
      workerProfileId: record.workerProfileId,
      orderId: record.orderId,
      startDate: record.startDate,
      endDate: record.endDate,
      createdAt: record.createdAt,
      isConfirmed: record.isConfirmed,
    };
  }

  async findMany({
    filter,
  }: {
    filter: WorkerOccupiedTimeSlotFilter;
  }): Promise<WorkerOccupiedTimeSlot[]> {
    try {
      const records = await this.prismaClient.workerOccupiedTimeSlot.findMany({
        where: filter,
      });
      return records.map((r) => this.toDomain(r));
    } catch (error) {
      throw handlePrismaError(error, 'find many worker occupied time slots');
    }
  }

  async create({
    slot,
  }: {
    slot: WorkerOccupiedTimeSlotCreateInput;
  }): Promise<WorkerOccupiedTimeSlot> {
    try {
      const record = await this.prismaClient.workerOccupiedTimeSlot.create({
        data: slot,
      });
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'create worker occupied time slot');
    }
  }

  async confirmByOrderAndWorker({ orderId, workerProfileId }: { orderId: IDType; workerProfileId: IDType }): Promise<WorkerOccupiedTimeSlot> {
    try {
      const record = await this.prismaClient.workerOccupiedTimeSlot.update({
        where: { orderId, workerProfileId },
        data: { isConfirmed: true },
      });
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'confirm worker occupied time slot');
    }
  }

  async deleteUnconfirmedByOrderId({ orderId }: { orderId: string }): Promise<void> {
    try {
      await this.prismaClient.workerOccupiedTimeSlot.deleteMany({
        where: { orderId, isConfirmed: false },
      });
    } catch (error) {
      throw handlePrismaError(error, 'delete worker occupied time slot');
    }
  }

  async deleteByOrderId({ orderId }: { orderId: string }): Promise<void> {
    try {
      await this.prismaClient.workerOccupiedTimeSlot.deleteMany({
        where: { orderId },
      });
    } catch (error) {
      throw handlePrismaError(error, 'delete worker occupied time slot');
    }
  }
}
