# angular-rules.md — Selorya Angular Rules

## Component rules

- Keep components focused on UI orchestration.
- Move shared or reusable logic into services or utilities.
- Do not put complex business logic directly into templates.
- Avoid unnecessary component state.
- Prefer Angular Signals for local reactive state when the file already uses Signals.
- Keep template conditions readable.
- Avoid deeply nested template logic when a computed value or helper improves clarity.

## Service rules

- Use services for API access, shared state, and reusable workflows.
- Do not duplicate API calls across components.
- Do not hardcode API paths in components if a service already exists.
- Keep service methods focused and predictable.
- Do not silently change response handling or API contracts.

## Routing rules

- Do not change existing routes unless explicitly requested.
- Do not add new routes without a clear requirement.
- Preserve route parameters and query parameter behavior.
- When debugging route-specific bugs, verify whether the issue is caused by the route component or by the global app shell.

## State rules

- Keep loading, error, and success states explicit.
- Avoid mixing UI state with backend data state when separate signals are clearer.
- Reset modal, dropdown, and preview states deliberately.
- Do not add global state for local component-only behavior.

## Template rules

- Visible product text should use i18n.
- Do not translate technical values.
- Do not add inline styles.
- Use existing shared classes and components where available.
- Use SVG icons from the project assets.
- Keep accessibility attributes such as `aria-label`, `aria-expanded`, and `role` when relevant.

## Current caution

The listing detail reload jump should not be fixed by guessing inside `listing-detail` again. The issue was not caused by the thumbnail gallery, main image, simple loading state, or image preview. Check global shell, footer, scrollbar gutter, category menu, global search, and global styles first.
