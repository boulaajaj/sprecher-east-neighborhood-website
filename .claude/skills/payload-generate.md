# Skill: Regenerate Payload Types and Import Map

## When to Use

Run this skill after ANY change to the Payload CMS schema:
- Added, modified, or removed a **collection** (`src/collections/`)
- Added, modified, or removed a **block** (`src/blocks/`)
- Changed **fields** on any collection, block, or global
- Modified **hero config** (`src/heros/config.ts`)
- Changed **global configs** (Header, Footer)
- Added or removed **plugins** that add collections/fields

This generates the TypeScript types that frontend components use and the admin panel import map.

## Procedure

### Step 1: Generate TypeScript types

```bash
npm run generate:types
```

This updates `src/payload-types.ts` with interfaces matching the current CMS schema.

**What this produces:**
- Collection interfaces (e.g., `Event`, `Post`, `Page`)
- Block interfaces (e.g., `ContentBlock`, `BannerBlock`)
- Global interfaces (e.g., `Header`, `Footer`)
- Union types for layout builders (e.g., `Page['layout']`)

### Step 2: Generate admin import map

```bash
npm run generate:importmap
```

This updates `src/app/(payload)/admin/importMap.js` with the admin panel component mappings.

**When this is needed:**
- After adding/removing admin panel components (`beforeLogin`, `beforeDashboard`)
- After adding blocks that have custom admin components
- After changing `payload.config.ts` component references

### Step 3: Verify the build

```bash
npm run build
```

If the build fails after type generation, common causes:
- **Type mismatch**: A component references a field that was renamed or removed — update the component
- **Missing import**: A new type was generated but not imported — add the import
- **Stale reference**: Old field names in existing components — grep for the old name and update

### Step 4: Fix common type errors

**"Property 'X' does not exist on type 'Y'"**
The field was renamed or removed. Check the generated `payload-types.ts` for the correct field name.

**"Type 'X' is not assignable to type 'Y'"**
A field type changed (e.g., text to select). Update the component to handle the new type.

**"Cannot find module '@/payload-types'"**
The types file hasn't been generated yet. Run `npm run generate:types`.

## Quick Reference

| Scenario | Commands needed |
|----------|----------------|
| Changed collection fields | `generate:types` + `build` |
| Added new block | `generate:types` + `generate:importmap` + `build` |
| Changed admin components | `generate:importmap` + `build` |
| Changed globals (Header/Footer) | `generate:types` + `build` |
| Added new collection | `generate:types` + `generate:importmap` + `build` |
| Changed plugin config | `generate:types` + `generate:importmap` + `build` |

## Checklist

- [ ] `npm run generate:types` ran successfully
- [ ] `npm run generate:importmap` ran successfully (if admin/block changes)
- [ ] `npm run build` passes with no type errors
- [ ] Components referencing changed types updated if needed

## Reference Files

- `src/payload-types.ts` — Auto-generated types (DO NOT edit manually)
- `src/app/(payload)/admin/importMap.js` — Auto-generated import map (DO NOT edit manually)
- `payload.config.ts` — Source of truth for all collections, globals, and plugins
