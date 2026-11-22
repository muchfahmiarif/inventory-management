import { notFound } from "next/navigation";

import ItemGroupForm from "@/components/office/inventory/itemgroups/item-group-form";
import { ApiError, api } from "@/lib/api-client";

type ItemGroupEditData = {
  id: string;
  name: string;
  description: string | null;
  attributes: { id: string; name: string }[];
};

export default async function EditItemGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let group: ItemGroupEditData;
  try {
    group = await api.get<ItemGroupEditData>(`/item-groups/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <ItemGroupForm
      mode="edit"
      itemGroupId={group.id}
      defaultValues={{
        name: group.name,
        description: group.description ?? undefined,
        attributes: group.attributes.map((a) => ({ name: a.name })),
      }}
    />
  );
}
