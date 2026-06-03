export type WorkerOccupiedTimeSlot = {
  id: string;
  workerProfileId: string;
  orderId: string;
  startDate: Date;
  isConfirmed: boolean;
  endDate: Date;
  createdAt: Date;
};

export type WorkerOccupiedTimeSlotCreateInput = {
  workerProfileId: string;
  orderId: string;
  startDate: Date;
  isConfirmed?: boolean;
  endDate: Date;
};

export type WorkerOccupiedTimeSlotFilter = {
  id?: string;
  workerProfileId?: string;
  isConfirmed?: boolean;
  orderId?: string;
};
