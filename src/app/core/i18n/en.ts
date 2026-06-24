import { enFeedbackTexts } from './en/feedback.en';
import { enHeaderTexts } from './en/header.en';
import { enLoginTexts } from './en/login.en';
import { enSignupTexts } from './en/signup.en';
import { enCheckoutTexts } from './en/checkout.en';
import { enOrdersTexts } from './en/orders.en';
import { enPaginationTexts } from './en/pagination.en';
import { enHomeTexts } from './en/home.en';
import { enFooterTexts } from './en/footer.en';
import { enProfileTexts } from './en/profile.en';
import { enCategoryMenuTexts } from './en/category.en';
import { enListingTexts } from './en/listing.en';

import { enDocumentsTexts } from './en/documents.en';

export const enTexts = {
  ...enFeedbackTexts,
  ...enHeaderTexts,
  ...enLoginTexts,
  ...enSignupTexts,
  ...enCheckoutTexts,
  ...enOrdersTexts,
  ...enPaginationTexts,
  ...enHomeTexts,
  ...enFooterTexts,
  ...enProfileTexts,
  ...enCategoryMenuTexts,
  ...enListingTexts,
  ...enDocumentsTexts,
} as const;
