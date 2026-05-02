import { trFeedbackTexts } from './tr/feedback.tr';
import { trHeaderTexts } from './tr/header.tr';
import { trLoginTexts } from './tr/login.tr';
import { trSignupTexts } from './tr/signup.tr';
import { trCheckoutTexts } from './tr/checkout.tr';

export const trTexts = {
  ...trFeedbackTexts,
  ...trHeaderTexts,
  ...trLoginTexts,
  ...trSignupTexts,
  ...trCheckoutTexts,
} as const;
