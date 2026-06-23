# review.md — Claude Code Review Command

Review the provided Selorya frontend code with the project rules in mind.

Focus on:

- Correct Angular structure
- Clean Code
- Function length
- File length
- Unused imports
- Duplicated logic
- Hardcoded visible UI text
- Missing i18n usage
- Inline styles
- SCSS nesting depth
- Token usage
- Shared style reuse
- Accessibility attributes
- Responsive behavior
- Risky route or API contract changes

Do not rewrite the full file unless explicitly requested.

Return:

1. Critical issues
2. Recommended improvements
3. What should stay unchanged
4. Minimal code snippets for required fixes
5. English Summary and Description for GitHub Desktop if code changes are provided
