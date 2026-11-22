import CompositeItemForm from "@/components/office/inventory/composite-items/composite-item-form";
import { api } from "@/lib/api-client";

type CompositeOptions = {
  units: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  items: { id: string; name: string; costPrice: number | null }[];
};

export default async function NewCompositeItemPage() {
  const options = await api.get<CompositeOptions>("/composite-form-options");

  return (
    <CompositeItemForm
      mode="new"
      defaultValues={{ name: "", components: [{ itemId: "", quantity: "1" }] }}
      options={options}
    />
  );
}
