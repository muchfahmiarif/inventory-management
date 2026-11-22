import ItemForm from "@/components/office/inventory/items/item-form";
import { api } from "@/lib/api-client";

type ItemFormOptions = {
  units: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  groups: { id: string; name: string }[];
  taxes: { id: string; name: string }[];
  warehouses: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
};

export default async function NewItemPage() {
  const options = await api.get<ItemFormOptions>("/items/form-options");

  return (
    <ItemForm
      mode="new"
      defaultValues={{ name: "", type: "inventory" }}
      options={options}
    />
  );
}
