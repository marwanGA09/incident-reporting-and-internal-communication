import { z } from "zod";

export const IncidentFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  location: z.string().optional(),
  categoryId: z.string().uuid(),
  departmentId: z.string().uuid(),
  assignedToId: z.string().optional(),
});

export type IncidentFormData = z.infer<typeof IncidentFormSchema>;

export const Step1Schema = IncidentFormSchema.pick({
  title: true,
  description: true,
});

export const Step2Schema = IncidentFormSchema.pick({
  location: true,
  categoryId: true,
});

export const Step3Schema = IncidentFormSchema.pick({
  departmentId: true,
  assignedToId: true,
});
