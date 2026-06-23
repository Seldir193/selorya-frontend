# TODO_CONTEXT.md — Selorya Frontend

## Current open task

Fix the reload layout jump on:

`http://localhost:4200/listings/AGO`

## Important status

The image preview work is complete and should not be reworked unnecessarily.

Completed image preview changes:

- Listing detail preview now uses the shared `image-preview` structure.
- Local `detail-preview` implementation was removed from `listing-detail.page.scss`.
- Shared preview is used for edit/create and listing detail.
- Overlay z-index was raised so header dropdowns do not appear above the image modal.
- Thumbnail strip uses shared thin scrollbar utilities.
- Portrait-specific image scaling was removed so edit and listing detail use the same contain-based rendering behavior.

## Do not repeat

Do not keep patching `listing-detail.page.scss` or `listing-detail.page.ts` for the reload jump without new evidence.

Already tested:

- Removing thumbnail gallery did not fix the jump.
- Replacing the main image did not fix the jump.
- Making the loading state larger did not fix the jump.
- Scroll reset logic did not fix the jump.

## Next debugging order

### 1. Global scrollbar gutter

Check:

`src/styles/_scrollbars.scss`

Inspect whether scrollbar appearance or width changes after page reload.

Do not add global scrollbar rules before confirming they address the observed layout shift.

### 2. App shell and footer position

Check:

`src/app/app.component.html`

Current concern:

`app-footer` may be outside `.shell`.

Inspect whether the app shell, footer, or routed content changes page height after initial rendering.

Check:

`src/app/app.component.scss`

Verify whether shell height, footer placement, or routed content sizing changes after asynchronous rendering.

Do not move the footer or rewrite shell layout before confirming the cause.

### 3. Category menu SCSS

Check:

`category-menu.component.scss`

Especially:

- `.category-menu`
- `.category-menu__trigger`
- `.category-menu__panel`
- `.category-menu__content`

Verify that the dropdown panel does not affect document flow, page width, or scrollbar behavior after reload.

Do not change positioning before inspecting the existing implementation.

### 4. Global search and header state

Check whether `showGlobalSearch()` changes the header grid after reload.

Potential files:

- Global search component HTML
- Global search component SCSS
- App component logic

Check whether asynchronous auth state, user state, search visibility, or header layout changes after initial render.

### 5. Global styles

Check:

- `styles.scss`
- `globals.scss`
- `body`, `html`, and `app-root` styles

Look for:

- changing `overflow`
- unstable `height`
- unstable `min-height`
- scroll behavior
- late padding or margin changes
- global transitions affecting layout
- dynamic width calculations
- scrollbar changes after content loading

## Backend development environment

The Angular frontend continues to run locally through Angular development tooling.

The backend runs through Docker Compose:

```text
Angular frontend
→ Django API at http://localhost:8000
→ PostgreSQL Docker service
→ n8n Docker service
→ SMTP automation emails
```

Frontend integration rules:

- The Angular API base URL remains `http://localhost:8000` during local development.
- Do not use Docker service hostnames such as `db` or `n8n` in Angular services.
- `db` and `n8n` are internal names only for containers inside the backend Docker Compose network.
- Do not assume Django is started with `python manage.py runserver`.
- Do not change frontend API URLs or request contracts unless explicitly required.
- Docker configuration, backend credentials, n8n workflows, PostgreSQL storage, and backend environment variables belong to the backend repository.

## Commit message for completed preview work

### Summary

```text
Unify shared image preview behavior across listing pages
```

### Description

```text
Reworked the listing detail image preview to use the same shared image-preview structure as the edit/create listing preview. Removed the separate detail-preview implementation from the listing detail page and centralized the modal layout, image sizing, overlay buttons, thumbnail strip, and thin scrollbar behavior through the shared preview styles.

Raised the shared image preview overlay above header dropdown layers so category navigation can no longer appear over an active image modal. Removed portrait-specific preview scaling from the edit preview so portrait and landscape images now render consistently across edit and public listing pages with the same contain-based sizing behavior.
```
