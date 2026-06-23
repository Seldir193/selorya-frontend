# i18n-rules.md — Selorya Frontend i18n Rules

## General i18n rules

- Visible product UI text must be internationalized.
- Do not hardcode visible UI text in Angular templates when the text belongs to the product interface.
- Supported languages are German, English, and Turkish.
- German is the primary product language during current UI work.
- English is used for code, file names, internal values, technical identifiers, and commit descriptions.
- Do not translate technical values, enums, route values, API field names, or database identifiers.
- Do not translate backend-provided technical values unless the UI has a mapped translation key for them.

## Translation structure

- Prefer separate language files for German, English, and Turkish.
- Keep translation keys clear, stable, and grouped by feature where possible.
- Avoid one huge translation file if the project already supports split files.
- Do not duplicate the same visible text across unrelated translation keys unless the meaning is different.
- Use consistent naming for translation keys.

## Template rules

- Use translation pipes or the existing i18n service pattern.
- Keep accessibility labels internationalized when they are visible to assistive technology.
- Button labels, placeholders, headings, empty states, validation messages, and dialog text should use i18n.
- Do not change logic while only translating visible UI text.

## Translation task rules

When asked to translate TSX, HTML, or Angular templates:

- Change only visible UI text.
- Do not change logic.
- Do not change backend/API/internal values.
- Do not rename variables.
- Do not change routes.
- Provide only relevant snippets unless a full file is requested.
- Provide German, English, and Turkish translation entries when needed.

## Current project direction

The language is controlled from the header. Registration should not contain a seller/customer role dropdown or language dropdown. Selorya uses a unified account model where one account can buy and sell.
