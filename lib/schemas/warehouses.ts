import { z } from "zod";

export const warehouseFormSchema = z.object({
  name: z.string().min(1, "Warehouse Name is required"),
  code: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type WarehouseFormInput = z.infer<typeof warehouseFormSchema>;
