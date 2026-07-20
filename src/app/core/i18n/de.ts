import { deCategoryMenuTexts } from './de/category.de';
import { deCheckoutTexts } from './de/checkout.de';
import { deCommercialTexts } from './de/commercial.de';
import { deDocumentsTexts } from './de/documents.de';
import { deFeedbackTexts } from './de/feedback.de';
import { deFooterTexts } from './de/footer.de';
import { deHeaderTexts } from './de/header.de';
import { deHomeTexts } from './de/home.de';
import { deShipmentIssueTexts } from './de/issues.de';
import { deListingTexts } from './de/listing.de';
import { deListingModerationTexts } from './de/moderation.de';
import { deLoginTexts } from './de/login.de';
import { deOrdersTexts } from './de/orders.de';
import { dePaymentsTexts } from './de/payments.de';
import { dePayoutTexts } from './de/payouts.de';
import { dePaginationTexts } from './de/pagination.de';
import { deProfileTexts } from './de/profile.de';
import { deShippingTexts } from './de/shipping.de';
import { deSignupTexts } from './de/signup.de';
import { favoritesDeTexts } from './de/favorites.de';

export const deTexts = {
  ...deFeedbackTexts,
  ...deHeaderTexts,
  ...deLoginTexts,
  ...deSignupTexts,
  ...deCheckoutTexts,
  ...deOrdersTexts,
  ...dePaymentsTexts,
  ...dePayoutTexts,
  ...dePaginationTexts,
  ...deHomeTexts,
  ...deFooterTexts,
  ...deProfileTexts,
  ...deShippingTexts,
  ...deCategoryMenuTexts,
  ...deListingTexts,
  ...deDocumentsTexts,
  ...favoritesDeTexts,
  ...deCommercialTexts,
  ...deListingModerationTexts,
  ...deShipmentIssueTexts,
} as const;
