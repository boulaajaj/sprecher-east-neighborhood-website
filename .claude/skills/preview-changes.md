# Skill: Preview and Validate Changes in the Browser

## When to Use

Use this skill after making frontend changes (components, pages, styles, blocks) to visually verify they render correctly in the browser. This ensures changes work as expected before committing.

## Required Input

- **What changed**: Which component, page, or block was modified
- **URL to check**: The page URL where the change is visible (e.g., `/events`, `/about`, `/admin`)

## Procedure

### Step 1: Ensure the dev server is running

Check if the dev server is already running:

```bash
# Check if port 3000 is in use
lsof -i :3000
```

If not running, start it:

```bash
npm run dev
```

Wait for the "Ready" message before proceeding.

### Step 2: Build check (catch compile errors first)

Before browser testing, verify the code compiles:

```bash
npm run build
```

If the build fails, fix errors before proceeding to browser testing.

### Step 3: Navigate and screenshot

Use Playwright MCP (if available) or curl to verify page responses:

**With Playwright MCP:**
```
1. Navigate to http://localhost:3000{path}
2. Wait for the page to fully load (networkidle)
3. Take a full-page screenshot
4. Check for visual correctness:
   - Content renders as expected
   - Layout is not broken
   - Styles apply correctly
   - No missing images or broken links
   - No console errors
```

**Without Playwright MCP (fallback):**
```bash
# Check the page returns 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000{path}

# Check for specific content in the HTML
curl -s http://localhost:3000{path} | grep -c "{expected content}"
```

### Step 4: Test responsive breakpoints

If the change involves layout or responsive design, check at these breakpoints (matching the Payload live preview config):

| Breakpoint | Width | Height |
|-----------|-------|--------|
| Mobile    | 375px | 667px  |
| Tablet    | 768px | 1024px |
| Desktop   | 1440px | 900px |

**With Playwright MCP:**
```
1. Set viewport to 375x667, screenshot mobile view
2. Set viewport to 768x1024, screenshot tablet view
3. Set viewport to 1440x900, screenshot desktop view
```

### Step 5: Test the admin panel (if CMS changes were made)

If collections, blocks, or fields were modified:

1. Navigate to `http://localhost:3000/admin`
2. Find the collection or page editor
3. Verify:
   - New fields appear in the admin UI
   - Field labels and descriptions are correct
   - Conditional fields show/hide correctly
   - Required field validation works
   - Rich text editor loads without errors

### Step 6: Check for console errors

**With Playwright MCP:**
```
1. Open browser DevTools console
2. Navigate to the changed page
3. Check for:
   - JavaScript errors (red)
   - React hydration mismatches
   - Failed network requests (404s, 500s)
   - Missing image warnings
```

### Step 7: Report findings

Summarize the visual review:
- Screenshots taken at which breakpoints
- Any visual issues found
- Console errors (if any)
- Admin panel field rendering (if applicable)
- Recommendation: ready to commit or needs fixes

## Common Issues to Watch For

| Issue | How to Spot | Fix |
|-------|------------|-----|
| Hydration mismatch | Console error "Text content does not match" | Ensure server/client rendering match — check `'use client'` directives |
| Missing types | TypeScript errors in Component.tsx | Run `npm run generate:types` after schema changes |
| Block not showing | Block renders as empty space | Check `RenderBlocks.tsx` registration and `blockComponents` map |
| Broken layout | Content overflows or misaligns | Check Tailwind classes — use `container` wrapper, proper grid cols |
| Admin field missing | Field not visible in admin panel | Verify `admin.condition` logic, check field is inside correct tab |
| Import map stale | Admin panel crashes or shows wrong components | Run `npm run generate:importmap` |

## Checklist

- [ ] Dev server running on port 3000
- [ ] Build completes without errors
- [ ] Page loads and renders correctly at desktop viewport
- [ ] Page renders correctly at mobile viewport (if responsive changes)
- [ ] No JavaScript console errors
- [ ] Admin panel fields render correctly (if CMS changes)
- [ ] Screenshots captured for review
