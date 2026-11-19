import ItemGroupForm from "@/components/office/inventory/itemgroups/item-group-form";

export default async function NewItemGroupPage() {
  return <ItemGroupForm mode="new" defaultValues={{ name: "", attributes: [] }} />;
}
