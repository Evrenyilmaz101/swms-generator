import { z } from "zod";

export const businessDetailsSchema = z.object({
  business_name: z
    .string()
    .min(1, "Business name is required")
    .max(200, "Business name too long"),
  abn: z
    .string()
    .refine(
      (val) => val === "" || /^\d{11}$/.test(val.replace(/\s/g, "")),
      "ABN must be 11 digits"
    ),
  contact_name: z
    .string()
    .min(1, "Contact name is required")
    .max(100, "Name too long"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => /^[\d\s\-+()]{8,15}$/.test(val),
      "Enter a valid phone number"
    ),
  state: z.enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"], {
    message: "Select your state or territory",
  }),
  logo_base64: z.string(),
});

export const jobDetailsSchema = z.object({
  job_description: z
    .string()
    .min(20, "Please describe the work in more detail (at least 20 characters)")
    .max(2000, "Description too long (max 2000 characters)"),
  site_address: z.string().max(300, "Address too long"),
  principal_contractor: z.string().max(200, "Name too long"),
  job_reference: z.string().max(100, "Reference too long"),
});

export type BusinessDetailsForm = z.infer<typeof businessDetailsSchema>;
export type JobDetailsForm = z.infer<typeof jobDetailsSchema>;
