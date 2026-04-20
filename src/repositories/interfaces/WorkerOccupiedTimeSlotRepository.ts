import {
  WorkerOccupiedTimeSlot,
  WorkerOccupiedTimeSlotCreateInput,
  WorkerOccupiedTimeSlotFilter,
} from '../../domain/workerOccupiedTimeSlot.entity.js';

export default interface IWorkerOccupiedTimeSlotRepository {
  findMany({ filter }: { filter: WorkerOccupiedTimeSlotFilter }): Promise<WorkerOccupiedTimeSlot[]>;
  create({ slot }: { slot: WorkerOccupiedTimeSlotCreateInput }): Promise<WorkerOccupiedTimeSlot>;
  deleteByOrderId({ orderId }: { orderId: string }): Promise<void>;
}
