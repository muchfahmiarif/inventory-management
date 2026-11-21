# Zoho Inventory 1:1 Clone — Roadmap

> **How to resume:** open this file, pick the first unchecked item, tell the agent
> "continue the roadmap" (it will read this file). Tick items with `[x]` as they are
> completed and verified. Commit per phase.

**Goal:** replicate Zoho Inventory 1:1 — UI *and* function — keeping the current
shadcn/Tailwind base with Zoho-look styling (~90% visual match).

**Decisions (2026-11-17):**
- Data layer: **PostgreSQL + Drizzle ORM** (real functions end-to-end)
- Visual fidelity: **Zoho-look** on shadcn/Tailwind (not pixel-perfect)
- Build order: **full roadmap order** (foundation → items → stock ops → sales → purchases → home/reports → settings → polish)

**Current state at planning time:** chrome is faithful (sidebar + trial card, header,
home tabs, dashboard widgets, custom-views dropdowns, kebab menus, option cards) but
there is **no data layer**; items list body is a stub, forms are demos, and these
pages are placeholders: `itemgroups/new`, `adjustments`, `adjustments/new`,
`getting-started`, `recent-updates`, `announcements`.

---

## Conventions

- Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, shadcn/ui,
  react-hook-form, zustand, lucide.
- New deps: `drizzle-orm`, `drizzle-kit`, `postgres` (driver), `drizzle-zod`, `zod`,
  `@tanstack/react-table`, `@hookform/resolvers`, `sonner`, `date-fns`,
  `react-day-picker`.
- Data access: server components query Drizzle directly; mutations are **server
  actions** + `revalidatePath`. Numbering series (`ITEM-00001`, `SO-00001`…) come
  from a `numbering_series` table.
- Routes: list `/office/<section>/<module>`, new `.../new`, detail/edit `.../[id]`.
- Forms: react-hook-form + zod (schemas via `drizzle-zod`), shadcn `form.tsx`,
  floating-label `TextInput` (retheme the hardcoded M3 purple `#6750A4`/`#CAC4D0`
  in `components/form/text-input.tsx` to theme tokens).
- Theme: load **Roboto** via `next/font` (Zoho's font; replaces Inter and fixes the
  unused `font-roboto` reference), keep orange primary + slate chrome, keep dark-mode
  toggle as an extra.

## Data model (`db/schema/`, one file per domain)

- `org.ts` — `organization` (name, logo, address, currency, tax settings), `users`,
  `roles`, `activity_log` (who/what/when → Recent Updates + record History tabs).
- `items.ts` — `items` (name, type enum inventory/non_inventory/service, sku, unit,
  brand, category, description, status), `item_groups`, `composite_items` +
  `composite_components`, `price_lists` + `price_list_items`, `categories`,
  `brands`, `units`.
- `warehouses.ts` — `warehouses`, `inventory_adjustments` + lines, `stock_counts` +
  lines, `transfer_orders` + lines, **`stock_movements` ledger** — every qty change
  flows through it; item stock-on-hand = ledger sum.
- `contacts.ts` — `contacts` (customer/vendor; tabs: details, addresses, other
  details), `contact_persons`.
- `sales.ts` — `estimates`, `sales_orders`, `packages`, `shipments`,
  `deliver_challans`, `invoices`, `customer_payments`, `credit_notes`,
  `sales_returns`; each with `*_lines` child table (item, desc, qty, rate,
  discount, tax, amount, warehouse), `status` enum + `status_history`.
- `purchases.ts` — `purchase_orders`, `bills`, `vendor_payments`, `debit_notes`,
  `expenses`.
- `settings.ts` — `taxes` (+ group taxes), `currencies`, `numbering_series`,
  `templates`, `notification_prefs`, `automation_prefs`.

## Shared UI system (build once, reuse everywhere)

- `components/shared/switch-view.tsx` — generalize
  `components/office/inventory/switch-view.tsx` (controlled value/onChange).
- `components/shared/list-toolbar.tsx` — composes **CustomViewsDropdown** (title +
  views + "+ New Custom View"; pattern exists in
  `app/(back-office)/office/inventory/items/page.tsx`), **New** button, SwitchView,
  **KebabMenu** (Sort by submenu / Import / Export / Preferences / Refresh List —
  `components/ui/dropdown-menu.tsx` already supports submenus).
- `components/shared/data-table.tsx` — TanStack Table: checkbox column, sortable
  headers, sticky header, bulk-action bar (Activate/Deactivate/Delete), row kebab
  menu, footer pagination.
- `components/shared/empty-state.tsx` — generalizes
  `components/office/inventory/option-card.tsx` (cards grid: title/icon/desc/CTA).
- `components/shared/page-form-shell.tsx` — New/Edit full-page pattern: `h2` title +
  X-close + sticky Save/Cancel footer + tab nav (matches existing `items/new`).
- `components/shared/detail-page.tsx` — record detail: title + status badge + action
  dropdown (Edit/Delete/Copy/converts) + Overview/Transactions/History tabs.
- shadcn adds: `table, select, checkbox, radio-group, popover, command, form, tabs,
  badge, textarea, alert-dialog, calendar, progress, sonner`.
- Reuse as-is: `components/ui/*` (dropdown-menu w/ submenus, sheet, scroll-area,
  tooltip, button, avatar…), `cn()` in `lib/utils.ts`, next-themes provider, zustand
  `useView`, `components/office/inventory/*` (header/toolbar/option-card), the
  New-page X-close + `router.back()` pattern.

---

## Phase 0 — Foundation ✅ (2026-11-19)

- [x] Write this roadmap (`docs/ROADMAP.md`) and commit baseline.
- [x] Install new deps; add `db:generate`, `db:push`, `db:studio`, `db:seed`
      scripts; `.env` with `DATABASE_URL` (local Postgres `inventory_management`).
- [x] `drizzle.config.ts`, `db/index.ts` (drizzle client), full schema in
      `db/schema/*`.
- [x] Seed script: sample org, 12 items, 2 item groups, warehouses,
      customers/vendors, taxes, numbering series.
- [x] Fix existing mismatches:
  - [x] Sidebar duplicate "Integration" → second one becomes "Reports".
  - [x] Items page title "All Item Groups" → "All Items"; per-module kebab labels
        (Import/Export **Items** on items page).
  - [x] Fix view hrefs in items custom-views dropdown (now `?view=` query params).
  - [x] `window.location.href` nav → `Link` (sidebar Home) with active highlight.
  - [x] Itemgroups page List `Toggle` → shared SwitchView (Zoho uses same toggle).
  - [x] Wire `useView` zustand store (string `"list" | "grid"`) to switch-view.
  - [x] `/office/home` client useEffect redirect → server `redirect()`.
  - [x] Bonus: inventory header pre-mount guard removed so toolbars SSR.
- [x] Build shared components (switch-view, list-toolbar, custom-views-dropdown,
      kebab-menu, data-table on TanStack Table **v9** new API, empty-state,
      page-form-shell, detail-page).
- [x] Add shadcn components (table, select, checkbox, radio-group, popover,
      command, form, tabs, badge, textarea, alert-dialog, calendar, progress,
      sonner) + Roboto font via next/font (replaces Inter).
- Notes: Postgres 18.6 local, user `postgres`; TanStack Table v9 requires
  `tableFeatures({...})` + `useTable({ features, ... })` and
  `columnVisibilityFeature` for `getVisibleCells`.

## Phase 1 — Items domain (in progress — core done 2026-11-19)

- [x] **Items list**: real table (Item Name, Code, Item Group, Purchase Price,
      Selling Price, Stock on Hand, Status); 12 custom views via `?view=`;
      bulk actions (Activate/Deactivate/Delete); pagination; grid view.
      Replaces `<div>test</div>`.
- [x] **New/Edit Item form** sections: Item Details (name, type, SKU
      auto-generate via numbering series, unit, brand, category, group,
      description); Buy Info (preferred vendor, cost price, opening stock +
      warehouse, reorder level); Sell Info (selling price, wholesale, tax).
- [x] **Item detail page**: Overview (stock summary + info cards), Transactions
      tab (ledger w/ running balance), History tab (activity log); header
      actions (Edit, Mark Inactive/Active, AlertDialog Delete).
- [x] **Verified E2E in browser**: form create → ITEM-00001 auto-number →
      opening-stock ledger row (+15, balance 15) → redirect to detail → row on
      list page with red low-stock highlighting.
- [x] **Item Groups**: list (name, # items, description) + New form (name, variant
      attributes, description) + detail.
- [x] **Composite Items**: list + form (component item picker + qty per component,
      computed cost) + detail.
- [x] **Price Lists**: list + form (currency, markup/markdown, per-item rows) +
      detail.
- [x] Sidebar Inventory section fully live; option-card CTA buttons link to the
      four modules.

## Phase 2 — Stock operations ✅ (2026-11-20)

- [x] **Inventory Adjustments**: list (AD-#### numbered, date, reference,
      reason, Approved); New (warehouse, reason, item picker showing system
      qty, adjusted qty); ledger writes per line diff; delete reverses ledger.
- [x] **Warehouses**: full CRUD at `/office/warehouse` (default flag,
      address/contact fields, detail page).
- [x] **Transfer Orders**: TO-#### list; New (from/to validation); workflow
      Create → Mark Shipped (stock out) → Mark Received (stock in); delete
      reverses shipped stock.
- [x] Verified E2E: adjustment +5 → stock 20; transfer 3 units between
      warehouses, per-warehouse ledger totals exact.
- [x] **Stock Counts**: list; New (warehouse, items with system vs counted qty);
      on complete generates adjustment.

## Phase 3 — Sales (in progress — core done 2026-11-20)

- [x] **Customers**: list; New/Edit contact form (Contact Details / Billing +
      Shipping Address / Other Details); detail page w/ tabs. Vendors reuse the
      same contacts actions (Phase 4).
- [x] **Estimates**: EST-#### list w/ row status actions; New/Edit form (customer,
      line items w/ auto-pricing + discount + PPN tax, live totals, notes/terms);
      statuses Draft→Sent→Viewed→Accepted/Declined/Expired. Verified E2E:
      EST-00001, 2 lines w/ tax, total Rp 14.443.890.
- [x] **Sales Orders**: SO-#### list; same transaction form; statuses
      Draft→Confirmed→Packed→Shipped→Invoiced→Fulfilled (+Cancelled).
- [x] **Invoices**: INV-#### list; form w/ due date; detail w/ Amount Paid +
      Balance Due; **Record Payment dialog** (amount/mode/date) →
      customer_payments row + status Partially Paid/Paid; Void.
- [x] **Deliver Challans** (DC-####): list/form/detail, statuses
      Draft→Sent→Invoiced→Cancelled.
- [x] **Credit Notes** (CN-####): list/form/detail, Open/Closed/Void.
- [x] **Sales Returns** (SR-####): list/form/detail; Mark as Received writes
      stock-in movements; delete reverses received stock.
- [x] **Customer Payments** standalone list (PM-#### records from invoice
      payments).
- [x] **Packages** (PKG-####): created from a confirmed SO (packed qty ≤ ordered,
      warehouse select); statuses Draft→Shipped→Delivered.
- [x] **Shipments** (SHP-####): created from a package w/ carrier + tracking;
      creation writes **stock-out movements** from the package warehouse; Mark
      Delivered → package + SO fulfilled; delete reverses stock. Verified E2E:
      SO→Package→Shipment→Delivered chain, per-warehouse ledger exact.
- [x] **Vendors** (Phase 4 opener): full module reusing contacts views at
      `/office/purchases/vendors`.
- [x] Customer Payments standalone list.
- [x] Convert actions: Estimate → Sales Order / Invoice buttons (copies lines +
      totals, marks estimate accepted); SO → Invoice button (marks SO invoiced).
- [x] Dashboard "Sales Activity" + "Inventory Summary" count real records
      (lib/dashboard.ts: SO statuses + stock ledger sum).
- [x] Verified: payment flips invoice to Paid via UI dialog (INV-00001 → Paid).

## Phase 4 — Purchases ✅ (2026-11-21)

- [x] **Vendors** (mirror customers).
- [x] **Expenses**: list + form (category, vendor, amount); expense categories
      seeded.
- [x] **Purchase Orders**: PO-#### list + form (vendor, deliver-to warehouse,
      lines); **Receive Items → stock-in movements** into the PO warehouse;
      status flow Draft→Open→Received→Billed (+Cancelled).
- [x] **Bills**: BILL-#### list + form (from PO reference); detail w/ Amount
      Paid + Balance Due; Record Payment → vendor_payments + Partially Paid/Paid.
- [x] **Vendor Payments**: standalone list (VP-#### records from bill payments).
- [x] **Debit Notes**: DN-#### list + form (from vendor), Open/Closed/Void.
- [x] Verified E2E: PO created via form → Receive Items → +2 stock movement in
      ledger, status Received.

## Phase 5 — Home, Reports, Documents ✅ (2026-11-21)

- [x] **Getting Started**: 5-step checklist + progress bar driven by real data
      (items/customers/POs/invoices counts + org profile completeness).
- [x] **Recent Updates**: activity_log feed (100 latest). **Announcements** page
      with static cards.
- [x] **Reports**: index grouped by domain (Inventory / Sales / Purchases) with
      config-driven report pages — Stock Summary (per warehouse), Inventory
      Valuation, Low Stock, Sales by Customer, Sales by Item, Purchases by
      Vendor — plus client-side CSV export.
- [x] **Documents**: upload (FormData server action → `.data/uploads/`), list w/
      size + type, download API route, delete.
- [x] Record History tabs from activity_log (items/groups done in Phase 1).

## Phase 6 — Settings & org

- [ ] Settings index (search + grouped cards like Zoho): Organization, Taxes,
      Users, Templates, Integrations, Automations, Preferences.
- [ ] Organization Profile form.
- [ ] Taxes (list + form + group taxes); Currencies; Units; Categories; Brands.
- [ ] Numbering series config per module (prefix, next number).
- [ ] Templates: invoice/estimate email + print (HTML print view via browser
      print).
- [ ] Users & Roles: list + mock invite + permission matrix.
- [ ] Notifications & Automation preference toggles (persisted).
- [ ] Integrations page (UI-only "Enable Now" states).

## Phase 7 — Cross-cutting polish

- [ ] Global search command palette (`/` shortcut — matches the "( / )"
      placeholder) across items/contacts/transactions.
- [ ] Quick Create menu (dropdown of all module New links) on header + button.
- [ ] Notifications dropdown; profile menu (convert Edit-profile Sheet into Zoho
      profile dropdown); apps grid.
- [ ] Functional sidebar collapse.
- [ ] Toasts (sonner) on every action; alert-dialog delete confirmations.
- [ ] Empty states with icons for every list; loading skeletons; error boundaries.
- [ ] Final QA: side-by-side vs Zoho Inventory screenshots per list/form; build +
      lint green.

---

## Verification (repeat every phase)

1. `bun run db:push` → `bun run dev` → `bun run build` + `bun run lint` green.
2. Browser-walk each new route (200s, layout matches Zoho).
3. Data-flow test per the phase's "Verify" lines.
4. Tick items here, commit per phase.

## Out of scope

Real email/SMS sending, payment gateways, external integrations
(Shopify/Amazon/etc.), e-invoicing compliance, multi-org auth.
