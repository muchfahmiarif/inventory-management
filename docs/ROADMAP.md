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
- [ ] **Item Groups**: list (name, # items, description) + New form (name, variant
      attributes, description) + detail.
- [ ] **Composite Items**: list + form (component item picker + qty per component,
      computed cost) + detail.
- [ ] **Price Lists**: list + form (currency, markup/markdown, per-item rows) +
      detail.
- [ ] Sidebar Inventory section fully live; option-card CTA buttons link to the
      four modules.

## Phase 2 — Stock operations

- [ ] **Inventory Adjustments**: list (date, reference, reason, status); New
      (warehouse, reason, adjusted-qty lines); status Approved; writes
      `stock_movements`.
- [ ] **Stock Counts**: list; New (warehouse, items with system vs counted qty);
      on save generates adjustment.
- [ ] **Warehouses**: list (name, location, contact); New warehouse form; detail
      page.
- [ ] **Transfer Orders**: list; New (from/to warehouse, line items); workflow
      Create → Mark Shipped → Mark Received, movements at both ends.
- [ ] Verify: adjustment changes stock-on-hand; transfer moves stock between
      warehouses.

## Phase 3 — Sales

- [ ] **Customers**: list; New/Edit contact form (Contact Details / Address /
      Other Details tabs); detail page with transactions tab.
- [ ] **Estimates**: list; New form (customer, line items, taxes, discounts,
      notes); statuses Draft→Sent→Viewed→Accepted/Declined/Expired; convert to SO
      or Invoice.
- [ ] **Sales Orders**: list; form; workflow Draft→Confirmed→Packed→Shipped→
      Invoiced (+ Cancelled); actions Create Package / Create Shipment / Create
      Invoice.
- [ ] **Packages**: list; New package from SO (select items/qty); statuses.
- [ ] **Shipments**: list; New (courier, tracking #); mark delivered.
- [ ] **Deliver Challans**: list + form + convert.
- [ ] **Invoices**: list (Draft/Sent/Partially Paid/Paid/Overdue); form from SO or
      standalone; Record Payment inline; credit notes from invoice.
- [ ] **Customer Payments**: list + Record Payment form (customer, invoice select,
      amount, mode).
- [ ] **Credit Notes**: list + form (from invoice/return); apply to invoice.
- [ ] **Sales Returns**: list + form.
- [ ] Dashboard "Sales Activity" counts real records.
- [ ] Verify: SO→Package→Shipment→Invoice chain updates statuses; payment flips
      invoice to Paid.

## Phase 4 — Purchases

- [ ] **Vendors** (mirror customers).
- [ ] **Expenses**: list + form (category, vendor, amount, billable).
- [ ] **Purchase Orders**: list + form (vendor, lines); Receive Items → stock in;
      status flow.
- [ ] **Bills**: list + form (from PO or standalone); Record Payment.
- [ ] **Vendor Payments**: list + record form.
- [ ] **Debit Notes**: list + form (from bill).

## Phase 5 — Home, Reports, Documents

- [ ] **Getting Started**: checklist cards + progress (add first item, first
      customer, first invoice, complete org profile, invite user) driven by real
      data.
- [ ] **Recent Updates**: activity_log feed. **Announcements** page.
- [ ] **Reports**: index grouped (Inventory: Stock Summary / Valuation / History /
      Low Stock; Sales: by Customer / by Item; Purchases: by Vendor / by Item;
      Payments) — filterable tables + CSV export.
- [ ] **Documents**: per-record attachments (local fs `.data/uploads/`, list +
      upload UI).
- [ ] Record History tabs populated from `activity_log` via server actions.

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

1. `npm run db:push` → `npm run dev` → `npm run build` + `npm run lint` green.
2. Browser-walk each new route (200s, layout matches Zoho).
3. Data-flow test per the phase's "Verify" lines.
4. Tick items here, commit per phase.

## Out of scope

Real email/SMS sending, payment gateways, external integrations
(Shopify/Amazon/etc.), e-invoicing compliance, multi-org auth.
