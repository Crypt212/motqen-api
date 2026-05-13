import { z } from '../libs/zod.js';

export const AdminPanelLoginBodySchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export type AdminPanelLoginBody = z.infer<typeof AdminPanelLoginBodySchema>;
