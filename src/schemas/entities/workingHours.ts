import { z } from '../../libs/zod.js';
import { DayOfWeekSchema, Time24HourSchema } from '../common.js';

export const DaysWorkingHoursSchema = z.array(
  z.object({
    day: DayOfWeekSchema,
    startTime: Time24HourSchema,
    endTime: Time24HourSchema,
  })
    .refine((data) => data.endTime > data.startTime, {
      message: 'endTime must be after startTime',
      path: ['endTime'],
    }))
  .superRefine((schedules, ctx) => {
    const seenDays = new Set<string>();

    schedules.forEach((schedule, index) => {
      if (seenDays.has(schedule.day)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'day'],
          message: 'day must be unique within schedules',
        });
        return;
      }

      seenDays.add(schedule.day);
    });
  });

