"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { deleteItem, toggleItemStatus } from "@/actions/items";
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
import { formatDate, formatMoney, formatQty } from "@/lib/format";

export interface ItemDetailData {
  id: string;
  name: string;
  sku: string | null;
  type: "inventory" | "non_inventory" | "service";
  status: "active" | "inactive";
  description: string | null;
  costPrice: number | null;
  sellingPrice: number | null;
  wholesalePrice: number | null;
  reorderLevel: number | null;
  stockOnHand: number;
  groupName: string | null;
  unitName: string | null;
  brandName: string | null;
  categoryName: string | null;
  taxName: string | null;
  taxRate: number | null;
  vendorName: string | null;
  movements: {
    id: string;
    createdAt: string;
    sourceType: string;
    sourceNumber: string | null;
    warehouseName: string | null;
    quantity: number;
  }[];
  history: { id: string; action: string; createdAt: string }[];
}

const TYPE_LABELS: Record<ItemDetailData["type"], string> = {
  inventory: "Inventory",
  non_inventory: "Non Inventory",
  service: "Service",
};

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

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border">
      <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
        {title}
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

const ItemDetail = ({ data }: { data: ItemDetailData }) => {
  const router = useRouter();
  const [tab, setTab] = React.useState("overview");

  // Running balance, oldest first, then shown newest first
  const movementsAsc = [...data.movements].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const movementRows = movementsAsc
    .reduce<Array<ItemDetailData["movements"][number] & { balance: number }>>(
      (acc, m) => {
        const balance = (acc.at(-1)?.balance ?? 0) + m.quantity;
        acc.push({ ...m, balance });
        return acc;
      },
      [],
    )
    .reverse();

  return (
    <DetailPageShell
      title={data.name}
      subtitle={data.sku}
      status={data.status === "active" ? "Active" : "Inactive"}
      statusVariant={data.status === "active" ? "secondary" : "outline"}
      primaryActionLabel="Edit"
      onPrimaryAction={() => router.push(`/office/inventory/items/${data.id}/edit`)}
      actionsMenu={
        <>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              toggleItemStatus(data.id, data.status === "active" ? "inactive" : "active")
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
                <AlertDialogTitle>Delete item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{data.name}&quot; and its stock
                  history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteItem(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
      tabs={
        // Controlled so the header strip shares state with the content below
        <Tabs value={tab} onValueChange={setTab} className="px-8 pt-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <Tabs value={tab}>
        <TabsContent value="overview" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <InfoCard title="Stock Summary">
            <InfoRow
              label="Stock on Hand"
              value={
                <span
                  className={
                    data.type === "inventory" &&
                    data.reorderLevel !== null &&
                    data.stockOnHand <= data.reorderLevel
                      ? "text-red-500"
                      : undefined
                  }
                >
                  {formatQty(data.stockOnHand)} {data.unitName ?? ""}
                </span>
              }
            />
            <InfoRow label="Reorder Level" value={formatQty(data.reorderLevel)} />
          </InfoCard>
          <InfoCard title="Item Details">
            <InfoRow label="Item Name" value={data.name} />
            <InfoRow label="Code" value={data.sku} />
            <InfoRow label="Type" value={TYPE_LABELS[data.type]} />
            <InfoRow label="Item Group" value={data.groupName} />
            <InfoRow label="Unit" value={data.unitName} />
            <InfoRow label="Brand" value={data.brandName} />
            <InfoRow label="Category" value={data.categoryName} />
            <InfoRow label="Description" value={data.description} />
          </InfoCard>
          <div className="flex flex-col gap-4">
            <InfoCard title="Buy Info">
              <InfoRow label="Preferred Vendor" value={data.vendorName} />
              <InfoRow label="Cost Price" value={formatMoney(data.costPrice)} />
            </InfoCard>
            <InfoCard title="Sell Info">
              <InfoRow label="Selling Price" value={formatMoney(data.sellingPrice)} />
              <InfoRow label="Wholesale Price" value={formatMoney(data.wholesalePrice)} />
              <InfoRow
                label="Tax"
                value={data.taxName ? `${data.taxName} (${data.taxRate}%)` : null}
              />
            </InfoCard>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movementRows.length ? (
                  movementRows.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{formatDate(m.createdAt.slice(0, 10))}</TableCell>
                      <TableCell className="capitalize">
                        {m.sourceType}
                        {m.sourceNumber ? ` (${m.sourceNumber})` : ""}
                      </TableCell>
                      <TableCell>{m.warehouseName ?? "-"}</TableCell>
                      <TableCell
                        className={`text-right ${m.quantity < 0 ? "text-red-500" : "text-green-600"}`}
                      >
                        {m.quantity > 0 ? "+" : ""}
                        {formatQty(m.quantity)}
                      </TableCell>
                      <TableCell className="text-right">{formatQty(m.balance)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No stock transactions yet
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

export default ItemDetail;
