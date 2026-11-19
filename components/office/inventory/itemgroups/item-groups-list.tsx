"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import {
  deleteItemGroups,
  setItemGroupsStatus,
} from "@/actions/item-groups";
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
import OptionCardInventory from "@/components/office/inventory/option-card";

export interface ItemGroupRow {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  itemCount: number;
  attributeCount: number;
}

const CUSTOM_VIEWS: CustomView[] = [
  { name: "All Item Groups", value: "all" },
  { name: "Active Item Groups", value: "active" },
  { name: "Inactive Item Groups", value: "inactive" },
];

interface ItemGroupsListProps {
  data: ItemGroupRow[];
  view: string;
  title: string;
}

const ItemGroupsList = ({ data, view, title }: ItemGroupsListProps) => {
  const router = useRouter();
  const gridView = useView((state) => state.view);
  const setGridView = useView((state) => state.setView);

  const columns: ColumnDef<DataTableFeatures, ItemGroupRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Group Name",
      cell: ({ row }) => (
        <Link
          href={`/office/inventory/itemgroups/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      cell: ({ row }) => row.original.itemCount,
    },
    {
      accessorKey: "attributeCount",
      header: "Attributes",
      cell: ({ row }) =>
        row.original.attributeCount > 0 ? row.original.attributeCount : "-",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="line-clamp-1 text-muted-foreground">
          {row.original.description ?? "-"}
        </span>
      ),
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

  // Zoho empty state: the option cards grid
  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-2 px-2 pb-8">
        <ListToolbar
          className="sticky top-0 mx-2 my-4"
          left={
            <CustomViewsDropdown
              title={title}
              views={CUSTOM_VIEWS}
              selected={view}
              onSelect={(v) =>
                router.push(`/office/inventory/itemgroups?view=${v.value}`)
              }
            />
          }
          right={
            <>
              <Button
                className="flex flex-row"
                size={"sm"}
                onClick={() => router.push("/office/inventory/itemgroups/new")}
              >
                New
              </Button>
              <SwitchView value={gridView} onChange={setGridView} />
              <KebabMenu moduleLabel="Item Groups" onRefresh={() => router.refresh()} />
            </>
          }
        />
        <OptionCardInventory />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={
          <CustomViewsDropdown
            title={title}
            views={CUSTOM_VIEWS}
            selected={view}
            onSelect={(v) =>
              router.push(`/office/inventory/itemgroups?view=${v.value}`)
            }
          />
        }
        right={
          <>
            <Button
              className="flex flex-row"
              size={"sm"}
              onClick={() => router.push("/office/inventory/itemgroups/new")}
            >
              New
            </Button>
            <SwitchView value={gridView} onChange={setGridView} />
            <KebabMenu moduleLabel="Item Groups" onRefresh={() => router.refresh()} />
          </>
        }
      />

      {gridView === "list" ? (
        <div className="mx-2">
          <DataTable
            columns={columns}
            data={data}
            getRowId={(row) => row.id}
            emptyMessage="No item groups found"
            bulkActions={(ids, clear) => (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await setItemGroupsStatus(ids, "active");
                    clear();
                  }}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await setItemGroupsStatus(ids, "inactive");
                    clear();
                  }}
                >
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (window.confirm(`Delete ${ids.length} item group(s)?`)) {
                      await deleteItemGroups(ids);
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
        <div className="mx-10 grid grid-cols-2 gap-5 p-4 md:grid-cols-3">
          {data.map((group) => (
            <Link
              key={group.id}
              href={`/office/inventory/itemgroups/${group.id}`}
              className="flex flex-col rounded-md border bg-white p-4 drop-shadow-sm hover:border-primary dark:bg-card"
            >
              <p className="font-medium">{group.name}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {group.description ?? "-"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {group.itemCount} item{group.itemCount !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemGroupsList;
