export type Day = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type DayWorkingHours = {
  id: string;
  workerProfileId: string;
  day: Day;
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
