import { z } from "zod";

// Shared by the item form (client) and the server actions. Select fields carry
// "none" when empty; the form cleans them up before calling the action.
const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

export const itemFormSchema = z.object({
  name: z.string().min(1, "Item Name is required"),
  type: z.enum(["inventory", "non_inventory", "service"]),
  sku: z.string().optional(),
  unitId: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  groupId: z.string().optional(),
  taxId: z.string().optional(),
  preferredVendorId: z.string().optional(),
  description: z.string().optional(),
  costPrice: optionalNumber,
  sellingPrice: optionalNumber,
  wholesalePrice: optionalNumber,
  reorderLevel: optionalNumber,
  // Opening stock only applies on creation for inventory items
  openingStock: optionalNumber,
  openingStockWarehouseId: z.string().optional(),
});

export type ItemFormInput = z.infer<typeof itemFormSchema>;
