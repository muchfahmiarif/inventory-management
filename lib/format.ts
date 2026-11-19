// Formatting helpers shared by list/detail/form views

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatQty(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 4 }).format(
    value,
  );
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

// Generate the next document number from a numbering series row,
// e.g. prefix "ITEM", nextNumber 3, padding 5 -> "ITEM-00003"
export function formatNumber(
  prefix: string,
  nextNumber: number,
  padding = 5,
): string {
  return `${prefix}-${String(nextNumber).padStart(padding, "0")}`;
}
