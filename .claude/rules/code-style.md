# code-style.md — Selorya Frontend Code Style

## General rules

- Write all code in English.
- Do not add code comments.
- Do not leave commented-out code in files.
- Keep functions focused on one task.
- Keep functions at a maximum of 14 lines where possible.
- Keep files under 400 lines where possible.
- Use clear and descriptive names.
- Use `camelCase` for variables, functions, methods, and properties.
- Use `PascalCase` for classes, interfaces, types, and Angular components.
- Avoid unused variables, unused imports, and unused functions.
- Avoid duplicate logic.
- Avoid magic values when a shared token, constant, or utility should be used.
- Do not change existing behavior unless the task explicitly requires it.

## Change style

When changing existing code:

- Keep the existing logic intact unless the user asks for a behavior change.
- Change only what is necessary.
- Do not rewrite complete files unless explicitly requested.
- Prefer small, reviewable changes.
- Preserve existing routes, API contracts, and data structures.
- Preserve existing naming where changing names would create unnecessary risk.

## Output style

When providing code changes:

- Provide only relevant snippets unless a complete file is requested.
- Show clearly what should be replaced and what should be inserted.
- After every code change, include an English `Summary` and `Description` for GitHub Desktop commits.

## Commit text format

Use this format after code changes:

Summary

Short imperative or descriptive commit title.

Description

Clear explanation of what changed and why.
