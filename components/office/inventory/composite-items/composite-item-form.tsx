"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, Resolver, useForm } from "react-hook-form";
import React from "react";

import { createCompositeItem, updateCompositeItem } from "@/actions/composite-items";
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
import { formatMoney } from "@/lib/format";
import {
  compositeFormSchema,
  type CompositeFormInput,
} from "@/lib/schemas/composite-items";

export interface CompositeFormValues {
  name: string;
  sku?: string;
  unitId?: string;
  brandId?: string;
  categoryId?: string;
  description?: string;
  components: Array<{ itemId: string; quantity?: string }>;
}

interface Option {
  id: string;
  name: string;
}

interface CompositeItemFormProps {
  mode: "new" | "edit";
  compositeItemId?: string;
  defaultValues: CompositeFormValues;
  options: {
    units: Option[];
    brands: Option[];
    categories: Option[];
    items: Array<{ id: string; name: string; costPrice: number | null }>;
  };
}

const FORM_ID = "composite-form";

const CompositeItemForm = ({
  mode,
  compositeItemId,
  defaultValues,
  options,
}: CompositeItemFormProps) => {
  const form = useForm<CompositeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(compositeFormSchema) as unknown as Resolver<CompositeFormValues>,
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "components" });

  const watchedComponents = form.watch("components");
  const totalCost = (watchedComponents ?? []).reduce((sum, c) => {
    const item = options.items.find((i) => i.id === c.itemId);
    const qty = Number(c.quantity ?? 0) || 0;
    return sum + (item?.costPrice ?? 0) * qty;
  }, 0);

  const onSubmit = async (values: CompositeFormValues) => {
    if (mode === "new") {
      await createCompositeItem(values as CompositeFormInput);
    } else {
      await updateCompositeItem(compositeItemId!, values as CompositeFormInput);
    }
  };

  return (
    <PageFormShell
      title={mode === "new" ? "New Composite Item" : "Edit Composite Item"}
      formId={FORM_ID}
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-3xl flex-col gap-4 pb-4"
        >
          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              Composite Item Details
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Bundle name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder={mode === "new" ? "Auto-generate" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {options.units.map((o) => (
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="flex items-center justify-between rounded-t-md border-b bg-zinc-100 px-4 py-2 dark:bg-muted">
              <span className="text-sm font-medium">Components</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ itemId: "", quantity: "1" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Component
              </Button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {fields.map((f, index) => (
                <div key={f.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`components.${index}.itemId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Item</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {options.items.map((o) => (
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
                    name={`components.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-28">
                        <FormLabel>Qty</FormLabel>
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
                    aria-label="Remove component"
                    className="mt-8"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Total component cost:{" "}
                <span className="font-medium text-foreground">{formatMoney(totalCost)}</span>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

export default CompositeItemForm;
