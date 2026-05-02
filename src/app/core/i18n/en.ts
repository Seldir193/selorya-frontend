import { enFeedbackTexts } from './en/feedback.en';
import { enHeaderTexts } from './en/header.en';
import { enLoginTexts } from './en/login.en';
import { enSignupTexts } from './en/signup.en';
import { enCheckoutTexts } from './en/checkout.en';
import { enOrdersTexts } from './en/orders.en';
import { enPaginationTexts } from './en/pagination.en';

export const enTexts = {
  ...enFeedbackTexts,
  ...enHeaderTexts,
  ...enLoginTexts,
  ...enSignupTexts,
  ...enCheckoutTexts,
  ...enOrdersTexts,
  ...enPaginationTexts,
} as const;
