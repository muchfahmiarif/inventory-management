import { z } from "zod";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

export const priceListFormSchema = z.object({
  name: z.string().min(1, "Price List Name is required"),
  description: z.string().optional(),
  currencyCode: z.string().min(1, "Select a currency"),
  priceType: z.enum(["markup", "markdown"]),
  percentage: optionalNumber,
});

export type PriceListFormInput = z.infer<typeof priceListFormSchema>;
