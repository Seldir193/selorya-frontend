import { enCategoryMenuTexts } from './en/category.en';
import { enCheckoutTexts } from './en/checkout.en';
import { enCommercialTexts } from './en/commercial.en';
import { enDocumentsTexts } from './en/documents.en';
import { enFeedbackTexts } from './en/feedback.en';
import { enFooterTexts } from './en/footer.en';
import { enHeaderTexts } from './en/header.en';
import { enHomeTexts } from './en/home.en';
import { enShipmentIssueTexts } from './en/issues.en';
import { enListingTexts } from './en/listing.en';
import { enListingModerationTexts } from './en/moderation.en';
import { enLoginTexts } from './en/login.en';
import { enOrdersTexts } from './en/orders.en';
import { enPaymentsTexts } from './en/payments.en';
import { enPayoutTexts } from './en/payouts.en';
import { enPaginationTexts } from './en/pagination.en';
import { enProfileTexts } from './en/profile.en';
import { enShippingTexts } from './en/shipping.en';
import { enSignupTexts } from './en/signup.en';
import { favoritesEnTexts } from './en/favorites.en';

export const enTexts = {
  ...enFeedbackTexts,
  ...enHeaderTexts,
  ...enLoginTexts,
  ...enSignupTexts,
  ...enCheckoutTexts,
  ...enOrdersTexts,
  ...enPaymentsTexts,
  ...enPayoutTexts,
  ...enPaginationTexts,
  ...enHomeTexts,
  ...enFooterTexts,
  ...enProfileTexts,
  ...enShippingTexts,
  ...enCategoryMenuTexts,
  ...enListingTexts,
  ...enDocumentsTexts,
  ...favoritesEnTexts,
  ...enCommercialTexts,
  ...enListingModerationTexts,
  ...enShipmentIssueTexts,
} as const;
