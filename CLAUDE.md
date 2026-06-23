# CLAUDE.md — Selorya Frontend

## Project

Selorya is a marketplace frontend built with Angular. Users can browse listings, create listings, manage images, buy items, sell items, manage favorites, and use a shared account for both buying and selling.

The frontend communicates with the Selorya backend through API services. The backend remains the source of truth for data, permissions, payments, and technical values.

## Stack

- Angular
- TypeScript
- SCSS
- Angular Signals
- Angular Router
- Shared services
- Shared global styles
- i18n with German, English, and Turkish support

## Core rules

- Write all code in English.
- Do not add code comments.
- Keep functions focused and small.
- Keep functions at a maximum of 14 lines where possible.
- Keep files under 400 lines where possible.
- Use SVG icons only.
- Do not use inline styles.
- Do not hardcode visible UI text if the text belongs to the product interface.
- Use existing shared services, shared styles, and design tokens before creating new patterns.
- Do not change routes, API contracts, or existing logic unless explicitly required.
- Do not introduce Angular Material by default.
- Use Angular Material only when it is clearly appropriate and intentionally chosen.

## Response expectations

When changing code, provide only the relevant snippets unless a complete file is explicitly requested.

After each code change, provide:

- Summary
- Description

Both must be written in English and suitable for GitHub Desktop commits.

## Architecture principles

- Prefer services for shared logic.
- Keep components focused on presentation and orchestration.
- Avoid duplicated formatting logic.
- Date, time, and day formatting must be centralized in utilities.
- Toast messages should be centralized and compatible with i18n.
- UI state should be predictable and easy to debug.
- Shared components and global styles should be reused when a pattern already exists.

## Styling principles

- Use SCSS only.
- Avoid CSS files.
- Avoid inline styles.
- Use central design tokens for colors, spacing, radius, shadows, borders, buttons, and transitions.
- Keep SCSS nesting at a maximum depth of 4.
- Avoid duplicate component-specific styles when a shared global style already exists.
- Dropdowns, dialogs, previews, buttons, and scrollbars should use shared patterns where available.

## i18n principles

- Visible UI text must be internationalized.
- Supported languages are German, English, and Turkish.
- German is the primary product language for current UI work.
- English is used in code, file names, internal values, and technical identifiers.
- Do not translate backend technical values, enums, route values, API keys, or database identifiers.
- Use separate language files when available.
- Do not store all translations in one large shared file if the project already uses split translation files.

## Image preview rules

- Listing detail and edit/create listing previews must use the shared image preview structure.
- Do not create separate local preview implementations if the shared preview can be used.
- Shared preview classes include:
  - `image-preview`
  - `image-preview__panel`
  - `image-preview__image`
  - `image-preview__footer`
  - `image-preview__thumbs`

- Image previews must use contain-based rendering.
- Portrait and landscape images should use the same shared rendering behavior unless there is a strong reason not to.
- Preview overlays must stay above header dropdowns and navigation overlays.

## Backend development environment

The Angular frontend continues to run through Angular development tooling.

The backend runs through Docker Compose:

- Django API: `http://localhost:8000`
- PostgreSQL: Docker Compose service `db`
- n8n: Docker Compose service `n8n`

Rules:

- Do not assume the backend is started with `python manage.py runserver`.
- Do not change frontend API base URLs unless explicitly required.
- The frontend communicates with Django through `http://localhost:8000` during local development.
- Docker service hostnames such as `db` and `n8n` are internal backend-only names and must not be used in Angular API services.
- Backend Docker, PostgreSQL, n8n credentials, Docker volumes, and backend environment variables belong only to the backend repository.

## Current caution

Do not continue guessing fixes for the listing detail reload jump. The likely cause is outside `listing-detail`, probably in the global app shell, footer, scrollbar gutter, category menu, global search, or global styles.
