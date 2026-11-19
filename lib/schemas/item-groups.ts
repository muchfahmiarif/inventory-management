import { z } from "zod";

export const itemGroupFormSchema = z.object({
  name: z.string().min(1, "Group Name is required"),
  description: z.string().optional(),
  attributes: z
    .array(z.object({ name: z.string().min(1, "Attribute name is required") }))
    .optional(),
});

export type ItemGroupFormInput = z.infer<typeof itemGroupFormSchema>;
