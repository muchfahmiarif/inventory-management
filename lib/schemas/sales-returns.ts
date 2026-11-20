import { z } from "zod";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

export const salesReturnFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  contactId: z.string().min(1, "Select a customer"),
  warehouseId: z.string().min(1, "Select a warehouse"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1, "Select an item"),
        quantity: z.coerce.number().positive("Quantity must be > 0"),
        rate: z.coerce.number().nonnegative(),
      }),
    )
    .min(1, "Add at least one line item"),
});

export type SalesReturnFormInput = z.infer<typeof salesReturnFormSchema>;
