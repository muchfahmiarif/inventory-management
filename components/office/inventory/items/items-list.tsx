"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { deleteItems, setItemsStatus } from "@/actions/items";
import CustomViewsDropdown, {
  CustomView,
} from "@/components/shared/custom-views-dropdown";
import DataTable, {
  DataTableFeatures,
} from "@/components/shared/data-table";
import KebabMenu from "@/components/shared/kebab-menu";
import ListToolbar from "@/components/shared/list-toolbar";
import SwitchView from "@/components/shared/switch-view";
import useView from "@/store/useView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney, formatQty } from "@/lib/format";

export interface ItemRow {
  id: string;
  name: string;
  sku: string | null;
  type: "inventory" | "non_inventory" | "service";
  status: "active" | "inactive";
  costPrice: number | null;
  sellingPrice: number | null;
  reorderLevel: number | null;
  groupId: string | null;
  groupName: string | null;
  unitName: string | null;
  stockOnHand: number;
}

const CUSTOM_VIEWS: CustomView[] = [
  { name: "All Items", value: "all" },
  { name: "Active Items", value: "active" },
  { name: "Ungrouped Items", value: "ungrouped" },
  { name: "Low Stock Items", value: "low-stock" },
  { name: "Sales", value: "sales" },
  { name: "Purchases", value: "purchases" },
  { name: "Inventory Items", value: "inventory" },
  { name: "Non Inventory Items", value: "non-inventory" },
  { name: "Services", value: "services" },
  { name: "Inactive Items", value: "inactive" },
  { name: "Returned Items", value: "returned" },
  { name: "Non Returned Items", value: "non-returned" },
];

interface ItemsListProps {
  data: ItemRow[];
  view: string;
  title: string;
}

const ItemsList = ({ data, view, title }: ItemsListProps) => {
  const router = useRouter();
  const gridView = useView((state) => state.view);
  const setGridView = useView((state) => state.setView);

  const columns: ColumnDef<DataTableFeatures, ItemRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ row }) => (
        <Link
          href={`/office/inventory/items/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "sku", header: "Code", cell: ({ row }) => row.original.sku ?? "-" },
    {
      accessorKey: "groupName",
      header: "Item Group",
      cell: ({ row }) => row.original.groupName ?? "-",
    },
    {
      accessorKey: "costPrice",
      header: "Purchase Price",
      cell: ({ row }) => formatMoney(row.original.costPrice),
    },
    {
      accessorKey: "sellingPrice",
      header: "Selling Price",
      cell: ({ row }) => formatMoney(row.original.sellingPrice),
    },
    {
      accessorKey: "stockOnHand",
      header: "Stock on Hand",
      cell: ({ row }) => {
        const low =
          row.original.type === "inventory" &&
          row.original.reorderLevel !== null &&
          row.original.stockOnHand <= row.original.reorderLevel;
        return (
          <span className={low ? "font-medium text-red-500" : undefined}>
            {formatQty(row.original.stockOnHand)}
            {row.original.unitName ? ` ${row.original.unitName}` : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "secondary" : "outline"}>
          {row.original.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={
          <CustomViewsDropdown
            title={title}
            views={CUSTOM_VIEWS}
            selected={view}
            onSelect={(v) => router.push(`/office/inventory/items?view=${v.value}`)}
          />
        }
        right={
          <>
            <Button
              className="flex flex-row"
              size={"sm"}
              onClick={() => router.push("/office/inventory/items/new")}
            >
              New
            </Button>
            <SwitchView value={gridView} onChange={setGridView} />
            <KebabMenu
              moduleLabel="Items"
              sortBy={["Item Name", "Code", "Purchase Price", "Selling Price", "Stock on Hand"]}
              onRefresh={() => router.refresh()}
            />
          </>
        }
      />

      {gridView === "list" ? (
        <div className="mx-2">
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => row.id}
            emptyMessage="No items found"
            bulkActions={(ids, clear) => (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await setItemsStatus(ids, "active");
                    clear();
                  }}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await setItemsStatus(ids, "inactive");
                    clear();
                  }}
                >
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (window.confirm(`Delete ${ids.length} item(s)?`)) {
                      await deleteItems(ids);
                      clear();
                    }
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          />
        </div>
      ) : (
        <div className="mx-10 grid grid-cols-2 gap-5 p-4 md:grid-cols-3 lg:grid-cols-4">
          {data.map((item) => (
            <Link
              key={item.id}
              href={`/office/inventory/items/${item.id}`}
              className="flex flex-col rounded-md border bg-white p-4 drop-shadow-sm hover:border-primary dark:bg-card"
            >
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.sku ?? "-"}</p>
              <p className="mt-2 text-sm">{formatMoney(item.sellingPrice)}</p>
              <p className="text-sm text-muted-foreground">
                Stock: {formatQty(item.stockOnHand)} {item.unitName ?? ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemsList;
