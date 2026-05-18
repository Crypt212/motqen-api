import { z } from '../../libs/zod.js';
import {
  WorkerProfileSchema,
  WorkerProfileOptionalSchema,
  SpecializationsTreeSchema,
  WorkGovernmentsSchema,
} from '../common.js';

export const CreateWorkerProfileSchema = WorkerProfileSchema;
export type CreateWorkerProfileDTO = z.infer<typeof CreateWorkerProfileSchema>;

export const UpdateWorkerProfileSchema = WorkerProfileOptionalSchema.extend({
  bio: z.string().max(500).optional(),
});
export type UpdateWorkerProfileDTO = z.infer<typeof UpdateWorkerProfileSchema>;

export const CreatePortfolioSchema = z.object({
  description: z.string().max(1000).optional(),
});

export const UpdatePortfolioSchema = z.object({
  description: z.string().max(1000).optional(),
});

export const PortfolioImageIdParamsSchema = z.object({
  imageId: z.string().uuid(),
});

export const OccupiedTimeSlotsQuerySchema = z.object({
  selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
});

const Time24HourSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format');

export const DayOfWeekSchema = z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);

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

export type DaysWorkingHoursDTO = z.infer<typeof DaysWorkingHoursSchema>;

export const WorkerProfileVerificationSchema = z.object({
  idWithPersonalImageUrl: z.string().url().max(1000),
  idDocumentUrl: z.string().url().max(1000),
});
export type WorkerProfileVerificationDTO = z.infer<typeof WorkerProfileVerificationSchema>;

export { SpecializationsTreeSchema, WorkGovernmentsSchema };
