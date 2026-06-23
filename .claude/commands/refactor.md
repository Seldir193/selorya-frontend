# refactor.md — Claude Refactor Command

Refactor the provided Selorya frontend code without changing behavior.

Rules:

- Preserve existing logic.
- Preserve existing routes.
- Preserve API contracts.
- Preserve visible UI behavior unless explicitly requested.
- Use English in code.
- Do not add comments.
- Remove commented-out code.
- Remove unused imports, variables, and functions.
- Keep functions focused on one task.
- Keep functions at a maximum of 14 lines where possible.
- Keep files under 400 lines where possible.
- Prefer services and utilities for reusable logic.
- Prefer shared SCSS and tokens instead of duplicated local styles.
- Do not introduce Angular Material unless it is intentionally requested.

Return:

1. What was refactored
2. What behavior was preserved
3. Relevant snippets or full file only if requested
4. English Summary and Description for GitHub Desktop
