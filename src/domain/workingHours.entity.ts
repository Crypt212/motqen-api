export type Day = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type DayWorkingHours = {
  day: Day;
  startTime: string;
  endTime: string;
};


export type DayWorkingHoursCreateInput = {
  day: Day;
  startTime: string;
  endTime: string;
};

export type DayWorkingHoursReturn = {
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

export type OccupiedTimeSlotCreateInput = {
  workerProfileId: string;
  orderId: string;
  startDate: Date;
  endDate: Date;
};

export type OccupiedTimeSlotReturn = {
  workerProfileId: string;
  day: Day;
  startTime: string;
  endTime: string;
};
