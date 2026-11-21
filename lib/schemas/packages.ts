import { z } from "zod";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

export const packageFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  salesOrderId: z.string().min(1, "Select a sales order"),
  warehouseId: z.string().min(1, "Select a warehouse"),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1),
        quantity: optionalNumber,
      }),
    )
    .min(1, "Pack at least one item"),
});

export type PackageFormInput = z.infer<typeof packageFormSchema>;
