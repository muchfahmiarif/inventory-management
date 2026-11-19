import { z } from "zod";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().optional(),
);

export const stockCountFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  warehouseId: z.string().min(1, "Select a warehouse"),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1, "Select an item"),
        countedQuantity: optionalNumber,
      }),
    )
    .min(1, "Add at least one item"),
});

export type StockCountFormInput = z.infer<typeof stockCountFormSchema>;
