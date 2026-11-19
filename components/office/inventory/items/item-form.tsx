"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import React from "react";

import { createItem, updateItem } from "@/actions/items";
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
import { itemFormSchema, type ItemFormInput } from "@/lib/schemas/items";

export interface ItemFormValues {
  name: string;
  type: "inventory" | "non_inventory" | "service";
  sku?: string;
  unitId?: string;
  brandId?: string;
  categoryId?: string;
  groupId?: string;
  taxId?: string;
  preferredVendorId?: string;
  description?: string;
  costPrice?: string;
  sellingPrice?: string;
  wholesalePrice?: string;
  reorderLevel?: string;
  openingStock?: string;
  openingStockWarehouseId?: string;
}

interface Option {
  id: string;
  name: string;
}

interface ItemFormOptions {
  units: Option[];
  brands: Option[];
  categories: Option[];
  groups: Option[];
  taxes: Option[];
  warehouses: Option[];
  vendors: Option[];
}

interface ItemFormProps {
  mode: "new" | "edit";
  itemId?: string;
  defaultValues: ItemFormValues;
  options: ItemFormOptions;
}

const ITEM_TYPES = [
  { value: "inventory", label: "Inventory" },
  { value: "non_inventory", label: "Non Inventory" },
  { value: "service", label: "Service" },
] as const;

const FORM_ID = "item-form";

// Select fields carry "none" when empty; strip sentinels/empties before the
// action so optional refs become undefined (schema maps "" -> null).
function cleanPayload(values: ItemFormValues): ItemFormInput {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "none" || value === undefined || value === "") continue;
    payload[key] = value;
  }
  return payload as ItemFormInput;
}

// Section card with header strip, matching the dashboard card style
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border">
      <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
        {title}
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

const ItemForm = ({ mode, itemId, defaultValues, options }: ItemFormProps) => {
  const form = useForm<ItemFormValues>({
    // Input values are strings; the shared schema coerces numbers server-side
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(itemFormSchema) as unknown as Resolver<ItemFormValues>,
    defaultValues,
  });
  const itemType = form.watch("type");
  const openingStock = form.watch("openingStock");
  const showOpeningStock = mode === "new" && itemType === "inventory";

  const onSubmit = async (values: ItemFormValues) => {
    const payload = cleanPayload(values);
    if (mode === "new") {
      await createItem(payload);
    } else {
      await updateItem(itemId!, payload);
    }
  };

  return (
    <PageFormShell title={mode === "new" ? "New Item" : "Edit Item"} formId={FORM_ID}>
      <Form {...form}>
        <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pb-4">
          <FormSection title="Item Details">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Item Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Item Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ITEM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {options.categories.map((o) => (
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
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {options.brands.map((o) => (
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
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Group</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {options.groups.map((o) => (
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
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Buy Info">
            <FormField
              control={form.control}
              name="preferredVendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Vendor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {options.vendors.map((o) => (
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
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} type="number" min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showOpeningStock && (
              <>
                <FormField
                  control={form.control}
                  name="openingStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Stock</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} type="number" min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="openingStockWarehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {options.warehouses.map((o) => (
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
              </>
            )}
            <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} type="number" min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection title="Sell Info">
            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} type="number" min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wholesalePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wholesale Price</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} type="number" min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {options.taxes.map((o) => (
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
          </FormSection>

          {/* Non-shell fallback actions for direct form submission testing */}
          <div className="hidden">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

export default ItemForm;
