import { trCategoryMenuTexts } from './tr/category.tr';
import { trCheckoutTexts } from './tr/checkout.tr';
import { trCommercialTexts } from './tr/commercial.tr';
import { trDocumentsTexts } from './tr/documents.tr';
import { trFeedbackTexts } from './tr/feedback.tr';
import { trHeaderTexts } from './tr/header.tr';
import { trHomeTexts } from './tr/home.tr';
import { trListingTexts } from './tr/listing.tr';
import { trListingModerationTexts } from './tr/moderation.tr';
import { trLoginTexts } from './tr/login.tr';
import { trOrdersTexts } from './tr/orders.tr';
import { trPaginationTexts } from './tr/pagination.tr';
import { trProfileTexts } from './tr/profile.tr';
import { trSignupTexts } from './tr/signup.tr';
import { favoritesTrTexts } from './tr/favorites.tr';

export const trTexts = {
  ...trFeedbackTexts,
  ...trHeaderTexts,
  ...trLoginTexts,
  ...trSignupTexts,
  ...trCheckoutTexts,
  ...trOrdersTexts,
  ...trPaginationTexts,
  ...trHomeTexts,
  ...trProfileTexts,
  ...trCategoryMenuTexts,
  ...trListingTexts,
  ...trDocumentsTexts,
  ...favoritesTrTexts,
  ...trCommercialTexts,
  ...trListingModerationTexts,
} as const;
