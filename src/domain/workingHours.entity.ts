export type WorkingHours = {
  id: string;
  workerProfileId: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
};

export type OccupiedTimeSlot = {
  id: string;
  workerProfileId: string;
  orderId: string;
  startDate: Date;
  endDate: Date;
};
