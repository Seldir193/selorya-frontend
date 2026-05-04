import { trFeedbackTexts } from './tr/feedback.tr';
import { trHeaderTexts } from './tr/header.tr';
import { trLoginTexts } from './tr/login.tr';
import { trSignupTexts } from './tr/signup.tr';
import { trCheckoutTexts } from './tr/checkout.tr';
import { trOrdersTexts } from './tr/orders.tr';
import { trPaginationTexts } from './tr/pagination.tr';
import { trHomeTexts } from './tr/home.tr';
import { trProfileTexts } from './tr/profile.tr';
import { trCategoryMenuTexts } from './tr/category.tr';

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
} as const;
