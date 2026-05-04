# Selorya UI Icons

This document describes the usage rights and project rules for generic UI icons created for the Selorya frontend.

## Scope

This document applies only to generic interface icons created specifically for Selorya during development.

Examples include:

```txt
search.svg
close.svg
chevron-down.svg
chevron-down-light.svg
arrow-left.svg
arrow-right.svg
orders.svg
pagination icons
dialog icons
filter icons
empty-state icons
action icons
```

These icons are neutral UI symbols and are not intended to represent third-party brands, companies, payment providers, app stores, social platforms, or trademarked products.

## Usage Permission

The generic Selorya UI icons may be used in the Selorya frontend project, including:

```txt
local development
staging environments
production deployment
public website usage
custom Selorya domains
future Selorya subdomains
```

They may be used as part of the Selorya user interface without additional attribution.

## Allowed Usage

The icons may be:

```txt
stored in the Selorya repository
used in Angular components
used in SCSS/CSS backgrounds
used in buttons, dialogs, filters, pagination, headers, cards, forms, and empty states
optimized or minified
renamed to match the project structure
styled to match the Selorya design system
used on the public Selorya website
used on Selorya-owned domains and subdomains
```

## Project Ownership

These generic UI icons were created specifically for the Selorya project as development output.

Selorya may treat these neutral UI icons as internal project assets for frontend implementation and deployment.

## No Attribution Required

No attribution is required for the generic Selorya UI icons covered by this document.

They may be used directly inside the Selorya frontend source code and design system.

## Restrictions

This document does not apply to:

```txt
third-party brand logos
payment provider logos
social media logos
app store badges
company names
trademarked symbols
licensed icon packs from external providers
external marketplace logos
external delivery provider logos
banking or financial provider logos
```

Any third-party or trademark-related asset must be handled separately according to its own license, brand guidelines, or written permission.

## Excluded Examples

The following types of assets are not covered by this document:

```txt
Apple App Store badges
Google Play badges
Instagram logos
Facebook logos
LinkedIn logos
Visa logos
Mastercard logos
PayPal logos
Stripe logos
Amazon logos
DHL logos
UPS logos
Klarna logos
```

These assets belong to their respective owners and require separate review before production usage.

## Recommended File Location

Generic UI icons should be stored under:

```txt
src/assets/icons/
```

Recommended folder structure:

```txt
src/assets/icons/header/
src/assets/icons/footer/
src/assets/icons/orders/
src/assets/icons/pagination/
src/assets/icons/dialogs/
src/assets/icons/actions/
src/assets/icons/forms/
src/assets/icons/empty-states/
```

## Naming Rules

Use clear, descriptive filenames.

Recommended examples:

```txt
search.svg
close.svg
chevron-down.svg
chevron-down-light.svg
arrow-left.svg
arrow-right.svg
filter.svg
trash.svg
edit.svg
orders.svg
empty-orders.svg
dialog-close.svg
```

Avoid unclear names such as:

```txt
icon1.svg
new.svg
test.svg
final.svg
copy.svg
```

## Styling Rules

When adding or modifying generic UI icons:

```txt
use SVG format
keep icons visually consistent
prefer simple paths and clean shapes
avoid unnecessary embedded metadata
avoid raster images for UI icons
avoid embedding third-party logos in generic UI icon folders
use consistent stroke width where possible
use project design tokens in CSS where styling is needed
```

## Color Rules

Icons may use fixed project colors when they are designed for a specific visual context.

For reusable icons, prefer one of these approaches:

```txt
use currentColor when the icon should inherit text color
use neutral project colors when the icon is static
use separate light/dark variants only when needed
```

Example:

```txt
chevron-down.svg
chevron-down-light.svg
```

## Maintenance Rules

Before adding a new icon to the project, verify that:

```txt
the icon is a generic UI symbol
the icon does not represent a third-party brand
the filename is clear
the SVG is optimized enough for frontend use
the icon fits the Selorya design language
the icon is stored in the correct folder
```

## Production Usage

Generic Selorya UI icons covered by this document can be used online in the Selorya frontend.

This includes production deployment on:

```txt
Selorya domains
Selorya subdomains
staging environments
public frontend deployments
```

Before production deployment, verify that each SVG in the project is actually a neutral UI icon and not a third-party brand asset.

## Third-Party Asset Reminder

If an icon includes a company name, product name, brand shape, official logo, payment mark, app store badge, or social media platform identity, it is not treated as a generic Selorya UI icon.

Those assets must be reviewed separately.

## Summary

Generic UI icons created for Selorya may be used freely inside the Selorya frontend, including on the public production website and custom domains.

Third-party brand assets are not covered by this document.
