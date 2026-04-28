# Konfig UI — Next.js App Router

Wireframes ported to **Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS**.

## Quick start

```bash
cd konfig-ui
npm install
npm run dev
# open http://localhost:3000
```

## Structure

```
konfig-ui/
├── app/
│   ├── layout.tsx          # Root shell: sidebar + top nav + theme toggle
│   ├── globals.css         # CSS variables for dark + light themes
│   ├── page.tsx            # / — Settings list (Layout A) with edit drawer
│   ├── palette/page.tsx    # /palette — Command-palette (Layout B)
│   └── detail/page.tsx     # /detail — Setting detail drawer
├── components/
│   ├── Atoms.tsx           # TypeBadge, KeyCell, Toggle, Check, Chip, Btn, Kbd, ValueCell
│   ├── Sidebar.tsx         # Left nav
│   ├── EditDrawer.tsx      # Create/edit drawer with smart value editor
│   └── ThemeToggle.tsx     # Dark ⇄ light switch (persists to localStorage)
├── lib/
│   └── data.ts             # Mock SETTINGS + SettingType enum
├── tailwind.config.ts      # Token map — reads from CSS vars
├── postcss.config.js
├── tsconfig.json
├── next.config.js
└── package.json
```

## Design tokens

All colors live as CSS custom properties in `app/globals.css`:

| Token         | Purpose                          |
|---------------|----------------------------------|
| `--bg`        | Canvas background                |
| `--bg-2/-3`   | Raised surfaces / hover state    |
| `--line/-2`   | Dashed wireframe borders         |
| `--text`      | Primary text                     |
| `--text-dim`  | Secondary labels                 |
| `--text-faint`| Placeholders, hints              |
| `--accent`    | Warm amber — all interactive bits|
| `--accent-dim`| Muted accent for values          |

Themes swap via `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`; applied pre-paint by a tiny inline script in `layout.tsx` to avoid flash.

Tailwind maps each var into a named color (`bg-bg`, `text-accent`, etc.) using the `rgb / <alpha-value>` trick — use alphas with `bg-accent/20`.

## Backend wiring (next steps)

Mock data is in `lib/data.ts`. To hit the Rust API:

1. Replace the `SETTINGS` constant with a server-side fetch to `GET /settings` inside a server component, or
2. Use `fetch("http://localhost:8080/settings", { cache: "no-store" })` in `app/page.tsx` after converting it to a server component, keeping only drawer interactivity as a client sub-component.

API shape already matches the data model (`key`, `setting_type`, `value`, `is_active`, timestamps).

## Not yet ported

- Live search / filter-chip state (currently static mock)
- Real keyboard handlers in `/palette` (storyboard only)
- Empty / error states
- Toasts
- Accent-hue tweak (hard-coded to amber)

Ready to extend once you've picked a direction (A vs B).
