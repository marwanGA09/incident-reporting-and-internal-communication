import { z } from "zod";

// Define enums matching the Prisma schema
export const IncidentSeverityEnum = z.enum([
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
]);
export const IncidentPriorityEnum = z.enum(["URGENT", "HIGH", "NORMAL", "LOW"]);

// Main schema reflecting the full incident data model for creation
export const IncidentFormSchema = z.object({
  // Step 1
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  occurredAt: z.date(),

  // Step 2
  severity: IncidentSeverityEnum.default("MEDIUM"),
  priority: IncidentPriorityEnum.default("NORMAL"),
  categoryId: z.uuid("Please select a valid category."),
  // categoryId: z.string().uuid("Please select a valid category."),

  // Step 3
  locationAddress: z.string().optional(),
  locationLatitude: z.number().optional(),
  locationLongitude: z.number().optional(),
  affectedServices: z
    .preprocess((val) => {
      if (typeof val === "string" && val.length > 0) {
        return val.split(",").map((s) => s.trim());
      }
      if (Array.isArray(val)) {
        return val;
      }
      return [];
    }, z.array(z.string()).optional()),

  // Step 4 (was previously step 3)
  // departmentId: z.string().uuid("Please select a valid department."),
  departmentId: z.uuid("Please select a valid department."),
  // assigneeId: z.string().uuid().optional(), // Changed from assignedToId
  assigneeId: z.uuid().optional(), // Changed from assignedToId
});

export type IncidentFormData = z.infer<typeof IncidentFormSchema>;

// Schemas for each step of the form
export const Step1Schema = IncidentFormSchema.pick({
  title: true,
  description: true,
  occurredAt: true,
});

export const Step2Schema = IncidentFormSchema.pick({
  severity: true,
  priority: true,
  categoryId: true,
});

export const Step3Schema = IncidentFormSchema.pick({
  locationAddress: true,
  locationLatitude: true,
  locationLongitude: true,
  affectedServices: true,
});

export const Step4Schema = IncidentFormSchema.pick({
  departmentId: true,
  assigneeId: true,
});
