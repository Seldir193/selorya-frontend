import { deFeedbackTexts } from './de/feedback.de';
import { deHeaderTexts } from './de/header.de';
import { deLoginTexts } from './de/login.de';
import { deSignupTexts } from './de/signup.de';
import { deCheckoutTexts } from './de/checkout.de';
import { deOrdersTexts } from './de/orders.de';
import { dePaginationTexts } from './de/pagination.de';
import { deHomeTexts } from './de/home.de';
import { deFooterTexts } from './de/footer.de';
import { deProfileTexts } from './de/profile.de';
import { deCategoryMenuTexts } from './de/category.de';
import { deListingTexts } from './de/listing.de';

export const deTexts = {
  ...deFeedbackTexts,
  ...deHeaderTexts,
  ...deLoginTexts,
  ...deSignupTexts,
  ...deCheckoutTexts,
  ...deOrdersTexts,
  ...dePaginationTexts,
  ...deHomeTexts,
  ...deFooterTexts,
  ...deProfileTexts,
  ...deCategoryMenuTexts,
  ...deListingTexts,
} as const;
