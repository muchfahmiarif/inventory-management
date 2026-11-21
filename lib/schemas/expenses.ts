import { z } from "zod";

export const expenseFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  vendorId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be > 0"),
  notes: z.string().optional(),
});

export type ExpenseFormInput = z.infer<typeof expenseFormSchema>;
