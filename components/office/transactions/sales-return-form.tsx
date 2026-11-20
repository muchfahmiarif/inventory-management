"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, Resolver, useForm } from "react-hook-form";
import React from "react";

import { createSalesReturn } from "@/actions/sales-returns";
import PageFormShell from "@/components/shared/page-form-shell";
import { Button } from "@/components/ui/button";
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
  salesReturnFormSchema,
  type SalesReturnFormInput,
} from "@/lib/schemas/sales-returns";

const FORM_ID = "sales-return-form";

export interface SalesReturnFormValues {
  date: string;
  contactId: string;
  warehouseId: string;
  reference?: string;
  notes?: string;
  lines: Array<{ itemId: string; quantity: string; rate: string }>;
}

interface SalesReturnFormProps {
  defaultValues: SalesReturnFormValues;
  contacts: { id: string; name: string }[];
  warehouses: { id: string; name: string }[];
  items: Array<{ id: string; name: string; sellingPrice: number | null }>;
}

const SalesReturnForm = ({
  defaultValues,
  contacts,
  warehouses,
  items,
}: SalesReturnFormProps) => {
  const form = useForm<SalesReturnFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(salesReturnFormSchema) as unknown as Resolver<SalesReturnFormValues>,
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });
  const watched = form.watch("lines");

  const total = (watched ?? []).reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.rate) || 0),
    0,
  );

  const onSubmit = async (values: SalesReturnFormValues) => {
    await createSalesReturn(values as unknown as SalesReturnFormInput);
  };

  return (
    <PageFormShell title="New Sales Return" formId={FORM_ID}>
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-4xl flex-col gap-4 pb-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Customer <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Return to Warehouse <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference #</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Optional" />
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

          <div className="rounded-md border">
            <div className="flex items-center justify-between rounded-t-md border-b bg-zinc-100 px-4 py-2 dark:bg-muted">
              <span className="text-sm font-medium">Returned Items</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ itemId: "", quantity: "1", rate: "0" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {fields.map((f, index) => (
                <div key={f.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`lines.${index}.itemId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Item</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            const item = items.find((i) => i.id === v);
                            if (item?.sellingPrice != null) {
                              form.setValue(`lines.${index}.rate`, String(item.sellingPrice));
                            }
                          }}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {items.map((o) => (
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
                  <FormField
                    control={form.control}
                    name={`lines.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Qty</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} type="number" min={1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`lines.${index}.rate`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>Rate</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} type="number" min={0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove line"
                    className="mt-8"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-medium text-foreground">{total}</span>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

export default SalesReturnForm;
