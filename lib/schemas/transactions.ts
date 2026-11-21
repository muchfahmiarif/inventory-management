import { z } from "zod";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

// Shared transaction header + line shape for estimates / sales orders /
// invoices. Totals are recomputed server-side; client values are advisory.
export const transactionFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  contactId: z.string().min(1, "Select a customer"),
  // Purchase orders only: delivery warehouse for Receive Items stock-in
  warehouseId: z.string().optional(),
  reference: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1, "Select an item"),
        description: z.string().optional(),
        quantity: z.coerce.number().positive("Quantity must be > 0"),
        rate: z.coerce.number().nonnegative(),
        discountPercent: optionalNumber,
        taxId: z.string().optional(),
      }),
    )
    .min(1, "Add at least one line item"),
});

export type TransactionFormInput = z.infer<typeof transactionFormSchema>;
