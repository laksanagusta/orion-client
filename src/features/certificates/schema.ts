import { z } from "zod";

/**
 * Certificate form schema matching API field names (snake_case)
 */
export const certificateSchema = z.object({
  training_name: z.string().min(3, "Training name must be at least 3 characters"),
  institution: z.string().min(3, "Institution name must be at least 3 characters"),
  certificate_number: z.string().min(1, "Certificate number is required"),
  year: z.coerce.number().min(2000).max(2100),
  start_date: z.string().min(1, "Start date is required"), // ISO date string: YYYY-MM-DD
  end_date: z.string().min(1, "End date is required"), // ISO date string: YYYY-MM-DD
  jpl_hours: z.coerce.number().min(1, "JPL hours must be at least 1"),
  type: z.string().min(1, "Type is required"),
  sub_type: z.string().min(1, "Subtype is required"),
});

export type CertificateFormValues = z.infer<typeof certificateSchema>;

/**
 * Default form values for new entries
 */
export const defaultFormValues: CertificateFormValues = {
  training_name: "",
  institution: "",
  certificate_number: "",
  year: new Date().getFullYear(),
  start_date: "",
  end_date: "",
  jpl_hours: 0,
  type: "",
  sub_type: "",
};
