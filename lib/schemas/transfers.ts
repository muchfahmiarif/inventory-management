import { z } from "zod";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().positive().optional(),
);

export const transferFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  fromWarehouseId: z.string().min(1, "Select source warehouse"),
  toWarehouseId: z.string().min(1, "Select destination warehouse"),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1, "Select an item"),
        quantity: optionalNumber,
      }),
    )
    .min(1, "Add at least one item"),
});

export type TransferFormInput = z.infer<typeof transferFormSchema>;
