import ItemForm from "@/components/office/inventory/items/item-form";
import { getItemFormOptions } from "@/lib/item-options";

export default async function NewItemPage() {
  const options = await getItemFormOptions();

  return (
    <ItemForm
      mode="new"
      defaultValues={{ name: "", type: "inventory" }}
      options={options}
    />
  );
}
