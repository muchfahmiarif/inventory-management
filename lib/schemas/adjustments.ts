import { z } from "zod";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().optional(),
);

export const adjustmentFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  reference: z.string().optional(),
  reason: z.string().optional(),
  warehouseId: z.string().min(1, "Select a warehouse"),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1, "Select an item"),
        systemQuantity: optionalNumber,
        adjustedQuantity: z.coerce.number(),
      }),
    )
    .min(1, "Add at least one item"),
});

export type AdjustmentFormInput = z.infer<typeof adjustmentFormSchema>;
