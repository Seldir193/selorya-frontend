import { trCategoryMenuTexts } from './tr/category.tr';
import { trCheckoutTexts } from './tr/checkout.tr';
import { trCommercialTexts } from './tr/commercial.tr';
import { trDocumentsTexts } from './tr/documents.tr';
import { trFeedbackTexts } from './tr/feedback.tr';
import { trHeaderTexts } from './tr/header.tr';
import { trHomeTexts } from './tr/home.tr';
import { trShipmentIssueTexts } from './tr/issues.tr';
import { trListingTexts } from './tr/listing.tr';
import { trListingModerationTexts } from './tr/moderation.tr';
import { trLoginTexts } from './tr/login.tr';
import { trOrdersTexts } from './tr/orders.tr';
import { trPaymentsTexts } from './tr/payments.tr';
import { trPayoutTexts } from './tr/payouts.tr';
import { trPaginationTexts } from './tr/pagination.tr';
import { trProfileTexts } from './tr/profile.tr';
import { trShippingTexts } from './tr/shipping.tr';
import { trSignupTexts } from './tr/signup.tr';
import { favoritesTrTexts } from './tr/favorites.tr';

export const trTexts = {
  ...trFeedbackTexts,
  ...trHeaderTexts,
  ...trLoginTexts,
  ...trSignupTexts,
  ...trCheckoutTexts,
  ...trOrdersTexts,
  ...trPaymentsTexts,
  ...trPayoutTexts,
  ...trPaginationTexts,
  ...trHomeTexts,
  ...trProfileTexts,
  ...trShippingTexts,
  ...trCategoryMenuTexts,
  ...trListingTexts,
  ...trDocumentsTexts,
  ...favoritesTrTexts,
  ...trCommercialTexts,
  ...trListingModerationTexts,
  ...trShipmentIssueTexts,
} as const;
