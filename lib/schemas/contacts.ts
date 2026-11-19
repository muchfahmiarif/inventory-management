import { z } from "zod";

export const contactFormSchema = z.object({
  displayName: z.string().min(1, "Contact Name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  website: z.string().optional(),
  billingAddressLine1: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string().optional(),
  shippingAddressLine1: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingZip: z.string().optional(),
  shippingCountry: z.string().optional(),
  taxNumber: z.string().optional(),
  currencyCode: z.string().optional(),
  notes: z.string().optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
