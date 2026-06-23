# PROJECT_CONTEXT.md — Selorya Frontend

## Product

Selorya is a modern marketplace platform. Users should be able to buy and sell from one unified account. The product should feel premium, clean, fast, trustworthy, and easy to use.

Selorya may take marketplace UX inspiration from platforms like Vinted, but it must not copy their design. Selorya needs its own visual identity and interaction language.

## Account model

Selorya uses one account model.

A user can:

- Buy items
- Sell items
- Create listings
- Manage listings
- Favorite listings
- Manage orders
- Use payment flows
- Manage profile and settings

There should not be separate customer and seller registrations.

## Frontend priorities

- Clean marketplace UX
- Fast listing discovery
- Simple listing creation
- Professional image management
- Reliable preview/dialog/dropdown behavior
- Strong responsive layout
- Centralized i18n
- Centralized design tokens
- Consistent buttons, scrollbars, overlays, dialogs, and forms

## Current frontend areas

Important areas include:

- Header
- Category menu
- Language switcher
- User menu
- Listings overview
- Listing detail page
- Create listing page
- Edit listing page
- Image upload and image preview
- Favorites
- Orders
- Profile
- Footer

## Backend development environment

The Angular frontend continues to run locally through Angular development tooling.

The backend architecture runs through Docker Compose:

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
- `db` and `n8n` are internal hostnames only for containers inside the backend Docker Compose network.
- Do not assume Django is started with `python manage.py runserver`.
- Do not change frontend API URLs or request contracts unless explicitly required.
- Docker configuration, backend credentials, n8n workflows, PostgreSQL storage, and backend environment variables belong to the backend repository.

## Current image preview direction

The shared image preview is the master preview system.

Edit/create listing preview and public listing detail preview should both use the same classes and shared SCSS.

The current accepted direction:

- Use shared `image-preview` classes.
- Use shared overlay icon buttons.
- Use shared thumbnail strip.
- Use shared thin scrollbar.
- Keep images fully visible with contain-based sizing.
- Do not use special portrait scaling that makes edit and listing detail behave differently.
- Keep image modal above all header dropdowns.

## Current open bug

On reload of:

`http://localhost:4200/listings/AGO`

the complete page still jumps.

Observed:

- Text jumps.
- Images jump.
- It is not only a gallery issue.
- It is not only the main image.
- It is not only the loading text.
- Simple scroll reset logic did not solve it.

Likely causes to check next:

1. Global scrollbar gutter
2. App shell layout
3. Footer outside shell
4. Category menu SCSS
5. Global search header state
6. Global body/html styles
7. Any async component that changes layout height or width after reload

Do not continue changing `listing-detail` blindly for this bug.
