<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions
- UI reads data only via `useAppState` (src/services/store.ts) and actions in src/services/pos.ts — so the local mock store can later be swapped for a real backend without touching screens.
- Bill math lives in pure functions in src/lib/billing.ts (unit-tested) — keeps totals consistent across cart, bill, payment and reports.
- Alcohol serving prices derive from each product's base unit in pure billing helpers — keeps size pricing consistent in ordering and billing.
- UPI QR payloads are generated locally from bill totals and the configurable shop UPI ID — exact amounts work without transmitting bill data to a third party.
- Role guarding happens client-side in AppShell for /cashier and /admin layouts — mock auth has no server session yet; replace with real auth when a backend is added.
- tsconfig strict extras (exactOptionalPropertyTypes, noUncheckedIndexedAccess, noPropertyAccessFromIndexSignature, noImplicitReturns) are off — they added noise without catching real bugs in this UI-heavy code.
- CSV building is a pure, unit-tested helper in src/lib/csv.ts (rows from bills, escaping, file name) with the browser download kept separate — so any screen can export its current filtered list and the format stays testable.
