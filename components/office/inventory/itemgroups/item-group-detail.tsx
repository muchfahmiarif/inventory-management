"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import {
  deleteItemGroup,
  toggleItemGroupStatus,
} from "@/actions/item-groups";
import DetailPageShell from "@/components/shared/detail-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/format";

export interface ItemGroupDetailData {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  attributes: { id: string; name: string }[];
  items: {
    id: string;
    name: string;
    sku: string | null;
    sellingPrice: number | null;
  }[];
  history: { id: string; action: string; createdAt: string }[];
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-sm uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value ?? "-"}</span>
    </div>
  );
}

const ItemGroupDetail = ({ data }: { data: ItemGroupDetailData }) => {
  const router = useRouter();
  const [tab, setTab] = React.useState("overview");

  return (
    <DetailPageShell
      title={data.name}
      status={data.status === "active" ? "Active" : "Inactive"}
      statusVariant={data.status === "active" ? "secondary" : "outline"}
      primaryActionLabel="Edit"
      onPrimaryAction={() => router.push(`/office/inventory/itemgroups/${data.id}/edit`)}
      actionsMenu={
        <>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              toggleItemGroupStatus(data.id, data.status === "active" ? "inactive" : "active")
            }
          >
            Mark as {data.status === "active" ? "Inactive" : "Active"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete item group?</AlertDialogTitle>
                <AlertDialogDescription>
                  Items in this group will be ungrouped but not deleted. Delete
                  &quot;{data.name}&quot;?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteItemGroup(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
      tabs={
        <Tabs value={tab} onValueChange={setTab} className="px-8 pt-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Items ({data.items.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <Tabs value={tab}>
        <TabsContent value="overview" className="mt-4 max-w-3xl">
          <div className="rounded-md border">
            <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
              Item Group Details
            </div>
            <div className="px-4 py-2">
              <InfoRow label="Group Name" value={data.name} />
              <InfoRow label="Description" value={data.description} />
              <InfoRow
                label="Attributes"
                value={
                  data.attributes.length
                    ? data.attributes.map((a) => a.name).join(", ")
                    : "-"
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="items" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length ? (
                  data.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={`/office/inventory/items/${item.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell>{item.sku ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        {formatMoney(item.sellingPrice)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No items in this group yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.history.length ? (
                  data.history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="w-48">
                        {new Date(h.createdAt).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="capitalize">{h.action}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                      No history yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </DetailPageShell>
  );
};

export default ItemGroupDetail;
