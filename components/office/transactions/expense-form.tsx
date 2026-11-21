"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import React from "react";

import { createExpense, updateExpense } from "@/actions/expenses";
import PageFormShell from "@/components/shared/page-form-shell";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  expenseFormSchema,
  type ExpenseFormInput,
} from "@/lib/schemas/expenses";

const FORM_ID = "expense-form";

export interface ExpenseFormValues {
  date: string;
  vendorId?: string;
  categoryId?: string;
  description: string;
  amount: string;
  notes?: string;
}

interface ExpenseFormProps {
  mode: "new" | "edit";
  expenseId?: string;
  defaultValues: ExpenseFormValues;
  vendors: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

const ExpenseForm = ({
  mode,
  expenseId,
  defaultValues,
  vendors,
  categories,
}: ExpenseFormProps) => {
  const form = useForm<ExpenseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseFormSchema) as unknown as Resolver<ExpenseFormValues>,
    defaultValues,
  });

  const onSubmit = async (values: ExpenseFormValues) => {
    if (mode === "new") {
      await createExpense(values as unknown as ExpenseFormInput);
    } else {
      await updateExpense(expenseId!, values as unknown as ExpenseFormInput);
    }
  };

  const optionalSelect = (
    name: "vendorId" | "categoryId",
    label: string,
    options: { id: string; name: string }[],
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value ?? "none"}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <PageFormShell
      title={mode === "new" ? "New Expense" : "Edit Expense"}
      formId={FORM_ID}
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-3xl flex-col gap-4 pb-4"
        >
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 rounded-md border">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} type="number" min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {optionalSelect("vendorId", "Vendor", vendors)}
            {optionalSelect("categoryId", "Category", categories)}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="What was purchased?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

export default ExpenseForm;
