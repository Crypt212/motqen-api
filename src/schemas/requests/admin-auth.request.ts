import { z } from '../../libs/zod.js';

export const AdminLoginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().trim().min(8),
});

export type AdminLoginDTO = z.infer<typeof AdminLoginSchema>;
