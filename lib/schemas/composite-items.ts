import { z } from "zod";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

export const compositeFormSchema = z.object({
  name: z.string().min(1, "Composite Item Name is required"),
  sku: z.string().optional(),
  unitId: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  components: z
    .array(
      z.object({
        itemId: z.string().min(1, "Select an item"),
        quantity: optionalNumber,
      }),
    )
    .min(1, "Add at least one component"),
});

export type CompositeFormInput = z.infer<typeof compositeFormSchema>;
