# scss-rules.md — Selorya SCSS Rules

## General SCSS rules

- Use SCSS only.
- Do not use inline styles.
- Keep nesting at a maximum depth of 4.
- Use existing design tokens before adding new values.
- Avoid literal colors when a token exists.
- Avoid duplicated component styles when a shared style already exists.
- Keep selectors readable and specific enough without over-scoping.
- Do not use `!important` unless there is no safer alternative.

## Token rules

Use shared tokens for:

- Colors
- Spacing
- Border radius
- Border colors
- Shadows
- Transitions
- Button sizes
- Form controls
- Icon sizes
- Layout gutters

If a needed value is missing, add a clear token first instead of hardcoding repeated values.

## Layout rules

- Prefer stable layout dimensions for headers, buttons, cards, forms, previews, and dropdown triggers.
- Avoid layout shifts caused by async content.
- Reserve space for images, avatars, icons, and controls where needed.
- Use `display: block` for images when inline baseline spacing can affect layout.
- Be careful with `min-height: 100vh` when footers are outside layout wrappers.
- Prefer a flex column app shell for global page layout when header, main, and footer belong together.

## Overlay rules

- Modals and image previews must sit above header dropdowns.
- Dropdowns must not affect normal document flow.
- Dropdown panels should usually be `absolute` or `fixed`.
- Backdrops should not shift page layout.
- Avoid creating duplicate local overlay systems if a shared overlay style exists.

## Shared preview rules

The shared image preview is the source of truth for listing image modals.

Use:

- `.image-preview`
- `.image-preview__panel`
- `.image-preview__image`
- `.image-preview__footer`
- `.image-preview__thumbs`

Do not recreate separate local preview systems such as `detail-preview` if the shared preview can be used.

## Scrollbar rules

Use shared scrollbar utilities:

- `.scrollbar-thin`
- `.scrollbar-thin--stable`

For global layout stability, `_scrollbars.scss` may include:

```scss
html {
  overflow-y: scroll;
  scrollbar-gutter: stable;
}
```
