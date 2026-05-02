import { deFeedbackTexts } from './de/feedback.de';
import { deHeaderTexts } from './de/header.de';
import { deLoginTexts } from './de/login.de';
import { deSignupTexts } from './de/signup.de';
import { deCheckoutTexts } from './de/checkout.de';
import { deOrdersTexts } from './de/orders.de';
import { dePaginationTexts } from './de/pagination.de';
import { deHomeTexts } from './de/home.de';

export const deTexts = {
  ...deFeedbackTexts,
  ...deHeaderTexts,
  ...deLoginTexts,
  ...deSignupTexts,
  ...deCheckoutTexts,
  ...deOrdersTexts,
  ...dePaginationTexts,
  ...deHomeTexts,
} as const;
