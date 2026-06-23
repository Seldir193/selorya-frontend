# fix-issue.md — Claude Fix Issue Command

Fix the described Selorya frontend issue with the smallest safe change.

Rules:

- Do not guess blindly.
- First identify the likely source of the issue.
- If the issue is unclear, ask for the exact file or test result needed.
- Do not rewrite unrelated code.
- Do not change routes, API contracts, or backend assumptions unless required.
- Preserve existing logic and naming where possible.
- Use shared styles and services before creating new ones.
- Keep functions under 14 lines where possible.
- Keep files under 400 lines where possible.
- Do not add comments.
- Do not add inline styles.
- Do not hardcode visible UI text.

For visual bugs:

- Check whether the issue is local component styling, shared styling, app shell layout, global styles, or asynchronous layout shift.
- Avoid patching the wrong component after tests exclude it.
- Prefer layout stability over visual hacks.

Return:

1. Root cause or strongest confirmed cause
2. Minimal fix
3. Exact snippets or full file only if requested
4. Test steps
5. English Summary and Description for GitHub Desktop
